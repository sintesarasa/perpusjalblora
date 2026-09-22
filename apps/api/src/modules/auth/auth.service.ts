import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/errors.js';
import {
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
  Role,
  UserStatus,
  TrustLevel,
  TokenType,
  LoanStatus,
  UserSessionPayload,
} from '@perpusjal/types';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production-min-32-chars';
const BCRYPT_SALT_ROUNDS = process.env.NODE_ENV === 'production' ? 12 : 10;

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingEmail) {
      throw HttpError.conflict('Email sudah terdaftar. Silakan gunakan email lain atau masuk.', 'EMAIL_ALREADY_EXISTS');
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: input.username },
    });
    if (existingUsername) {
      throw HttpError.conflict('Username sudah digunakan.', 'USERNAME_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        username: input.username,
        email: input.email,
        passwordHash,
        role: Role.USER,
        status: UserStatus.PENDING_VERIFICATION,
        trustLevel: TrustLevel.TL0,
      },
    });

    // Generate Verification Token (24 hours expiry per BR-AUTH-02)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        type: TokenType.EMAIL_VERIFY,
        tokenHash,
        expiresAt,
      },
    });

    // Log token in development for testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH-DEV] Verification token for ${user.email}: ${rawToken}`);
      console.log(`[AUTH-DEV] Verification URL: http://localhost:3000/verifikasi?token=${rawToken}`);
    }

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      message: 'Akun dibuat. Cek emailmu untuk verifikasi.',
      ...(process.env.NODE_ENV !== 'production' ? { devVerificationToken: rawToken } : {}),
    };
  }

  /**
   * Login user with rate limit & lockout per BR-AUTH-03
   */
  async login(input: LoginInput, meta: { userAgent?: string; ipAddress?: string }) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    // Generic error to prevent user enumeration
    const genericInvalidError = HttpError.unauthorized('Email atau password salah.', 'INVALID_CREDENTIALS');

    if (!user || !user.passwordHash) {
      throw genericInvalidError;
    }

    // Check account lockout (BR-AUTH-03: 5 failures -> 15 min lock)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      throw HttpError.tooManyRequests(
        `Akun terkunci sementara karena terlalu banyak percobaan gagal. Silakan coba lagi dalam ${minutesLeft} menit.`,
        'ACCOUNT_LOCKED'
      );
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);

    if (!isMatch) {
      const newFailedCount = user.failedLoginCount + 1;
      const willLock = newFailedCount >= 5;
      const lockedUntil = willLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: willLock ? 0 : newFailedCount,
          lockedUntil,
        },
      });

      if (willLock) {
        throw HttpError.tooManyRequests(
          'Terlalu banyak percobaan gagal. Akun dikunci sementara selama 15 menit.',
          'ACCOUNT_LOCKED'
        );
      }

      throw genericInvalidError;
    }

    // Login successful: reset lockout counters
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Session duration (BR-AUTH-05: 7 days default, 30 days if rememberMe)
    const sessionDays = input.rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);

    const rawSessionToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawSessionToken);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt,
      },
    });

    const sessionPayload: UserSessionPayload = {
      userId: user.id,
      sessionId: session.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role as unknown as Role,
      status: user.status as unknown as UserStatus,
      trustLevel: user.trustLevel as unknown as TrustLevel,
    };

    const sessionToken = jwt.sign(sessionPayload, JWT_SECRET, {
      expiresIn: `${sessionDays}d`,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        trustLevel: user.trustLevel,
        emailVerified: user.emailVerifiedAt !== null,
        avatarUrl: user.avatarUrl,
      },
      sessionToken,
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Verify email via token
   */
  async verifyEmail(rawToken: string, meta: { userAgent?: string; ipAddress?: string }) {
    const tokenHash = hashToken(rawToken);

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        tokenHash,
        type: TokenType.EMAIL_VERIFY,
      },
      include: { user: true },
    });

    if (!verificationToken) {
      throw HttpError.badRequest('Tautan verifikasi tidak valid atau sudah kedaluwarsa.', 'INVALID_TOKEN');
    }

    const { user } = verificationToken;

    // Idempotent: If token was already used recently and user is ACTIVE, return success seamlessly
    if (verificationToken.usedAt) {
      if (user.status === UserStatus.ACTIVE || user.emailVerifiedAt) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const sessionTokenRaw = crypto.randomBytes(32).toString('hex');
        const sessionTokenHash = hashToken(sessionTokenRaw);

        const session = await prisma.session.create({
          data: {
            userId: user.id,
            tokenHash: sessionTokenHash,
            userAgent: meta.userAgent,
            ipAddress: meta.ipAddress,
            expiresAt,
          },
        });

        const sessionPayload: UserSessionPayload = {
          userId: user.id,
          sessionId: session.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role as unknown as Role,
          status: UserStatus.ACTIVE,
          trustLevel: user.trustLevel as unknown as TrustLevel,
        };

        const sessionToken = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: '7d' });

        return {
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            status: UserStatus.ACTIVE,
            trustLevel: user.trustLevel,
            emailVerified: true,
            avatarUrl: user.avatarUrl,
          },
          sessionToken,
          expiresAt: expiresAt.toISOString(),
          message: 'Email berhasil diverifikasi.',
        };
      }
      throw HttpError.badRequest('Tautan verifikasi sudah pernah digunakan.', 'TOKEN_ALREADY_USED');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw HttpError.badRequest('Tautan verifikasi sudah kedaluwarsa.', 'TOKEN_EXPIRED');
    }

    // Update user status and mark token used
    await prisma.$transaction([
      prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
          trustLevel: user.trustLevel === TrustLevel.TL0 ? TrustLevel.TL1 : user.trustLevel,
        },
      }),
    ]);

    // Create session automatically after verification
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const sessionTokenRaw = crypto.randomBytes(32).toString('hex');
    const sessionTokenHash = hashToken(sessionTokenRaw);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: sessionTokenHash,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt,
      },
    });

    const sessionPayload: UserSessionPayload = {
      userId: user.id,
      sessionId: session.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role as unknown as Role,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL1,
    };

    const sessionToken = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: UserStatus.ACTIVE,
        trustLevel: TrustLevel.TL1,
        emailVerified: true,
        avatarUrl: user.avatarUrl,
      },
      sessionToken,
      expiresAt: expiresAt.toISOString(),
      message: 'Email berhasil diverifikasi.',
    };
  }

  /**
   * Resend verification email (BR-AUTH-02: max 3/hour)
   */
  async resendVerification(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw HttpError.notFound('Pengguna tidak ditemukan.');
    }

    if (user.emailVerifiedAt) {
      throw HttpError.badRequest('Email akun ini sudah terverifikasi.', 'ALREADY_VERIFIED');
    }

    // Check rate limit: max 3 created in last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokensCount = await prisma.verificationToken.count({
      where: {
        userId: user.id,
        type: TokenType.EMAIL_VERIFY,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentTokensCount >= 3) {
      throw HttpError.tooManyRequests(
        'Maksimal 3 kali pengiriman email verifikasi per jam. Silakan tunggu.',
        'RATE_LIMIT_EXCEEDED'
      );
    }

    // Invalidate old tokens
    await prisma.verificationToken.updateMany({
      where: {
        userId: user.id,
        type: TokenType.EMAIL_VERIFY,
        usedAt: null,
      },
      data: {
        expiresAt: new Date(),
      },
    });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        type: TokenType.EMAIL_VERIFY,
        tokenHash,
        expiresAt,
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH-DEV] Resent verification token for ${user.email}: ${rawToken}`);
      console.log(`[AUTH-DEV] URL: http://localhost:3000/verifikasi?token=${rawToken}`);
    }

    return {
      message: 'Email verifikasi telah dikirim ulang. Silakan periksa kotak masukmu.',
      ...(process.env.NODE_ENV !== 'production' ? { devVerificationToken: rawToken } : {}),
    };
  }

  /**
   * Request forgot password link (BR-AUTH-04: always returns 200)
   */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Check rate limit: max 3/hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentTokensCount = await prisma.verificationToken.count({
        where: {
          userId: user.id,
          type: TokenType.PASSWORD_RESET,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (recentTokensCount < 3) {
        // Invalidate old reset tokens
        await prisma.verificationToken.updateMany({
          where: {
            userId: user.id,
            type: TokenType.PASSWORD_RESET,
            usedAt: null,
          },
          data: {
            expiresAt: new Date(),
          },
        });

        // 1 hour expiry for password reset
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.verificationToken.create({
          data: {
            userId: user.id,
            type: TokenType.PASSWORD_RESET,
            tokenHash,
            expiresAt,
          },
        });

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[AUTH-DEV] Password reset token for ${user.email}: ${rawToken}`);
          console.log(`[AUTH-DEV] Reset URL: http://localhost:3000/reset-password?token=${rawToken}`);
        }
      }
    }

    // Always return generic success message per API-SPEC & BR-AUTH-04
    return {
      message: 'Jika email terdaftar, tautan pengaturan ulang kata sandi telah dikirimkan.',
    };
  }

  /**
   * Reset password with token (BR-AUTH-04: revoke all other sessions)
   */
  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = hashToken(input.token);

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        tokenHash,
        type: TokenType.PASSWORD_RESET,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      throw HttpError.badRequest('Tautan reset password tidak valid atau sudah kedaluwarsa.', 'INVALID_TOKEN');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    await prisma.$transaction([
      prisma.verificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: {
          passwordHash,
          failedLoginCount: 0,
          lockedUntil: null,
        },
      }),
      // Revoke all existing sessions per BR-AUTH-04
      prisma.session.deleteMany({
        where: { userId: tokenRecord.userId },
      }),
    ]);

    return {
      message: 'Password berhasil diperbarui. Silakan masuk kembali dengan password barumu.',
    };
  }

  /**
   * Invalidate a session (logout)
   */
  async logout(sessionId?: string) {
    if (sessionId) {
      await prisma.session.delete({
        where: { id: sessionId },
      }).catch(() => {
        // Session might already be gone
      });
    }
  }

  /**
   * Get current authenticated user profile + borrowing eligibility (API-SPEC §4)
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            notifications: {
              where: { isRead: false },
            },
          },
        },
      },
    });

    if (!user) {
      throw HttpError.notFound('Pengguna tidak ditemukan.');
    }

    // Calculate borrowing status
    const activeLoans = await prisma.loan.findMany({
      where: {
        userId,
        status: { in: [LoanStatus.APPROVED, LoanStatus.BORROWED] },
      },
      select: {
        id: true,
        dueDate: true,
        status: true,
      },
    });

    const now = new Date();
    const hasOverdue = activeLoans.some((l) => l.dueDate && l.dueDate < now);

    // Max active loans by Trust Level:
    // TL0: 0 (must verify email first)
    // TL1: 2
    // TL2: 4
    // RESTRICTED: 0
    let maxActive = 0;
    if (user.trustLevel === TrustLevel.TL1) maxActive = 2;
    if (user.trustLevel === TrustLevel.TL2) maxActive = 4;

    const isSuspended = user.borrowSuspendedUntil ? user.borrowSuspendedUntil > now : false;
    const canBorrow =
      user.status === UserStatus.ACTIVE &&
      !isSuspended &&
      !hasOverdue &&
      activeLoans.length < maxActive;

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      trustLevel: user.trustLevel,
      emailVerified: user.emailVerifiedAt !== null,
      avatarUrl: user.avatarUrl,
      unreadNotifications: user._count.notifications,
      borrowing: {
        activeLoans: activeLoans.length,
        maxActive,
        hasOverdue,
        suspendedUntil: user.borrowSuspendedUntil?.toISOString() || null,
        canBorrow,
      },
    };
  }

  /**
   * List active sessions for user
   */
  async getSessions(userId: string, currentSessionId?: string) {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent || 'Perangkat tidak dikenal',
      ipAddress: s.ipAddress || '-',
      lastActiveAt: s.lastActiveAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      isCurrent: s.id === currentSessionId,
    }));
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw HttpError.notFound('Sesi tidak ditemukan.');
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    return { message: 'Sesi berhasil dicabut.' };
  }
}

export const authService = new AuthService();
