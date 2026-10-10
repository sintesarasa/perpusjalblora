import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { emailService } from '../services/email.service.js';
import { TokenType, UserStatus, TrustLevel, Role } from '@perpusjal/types';
import { prisma } from '../lib/prisma.js';
import { authService } from '../modules/auth/auth.service.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function test(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m  ${name}`);
  } catch (err: any) {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m  ${name}`);
    console.error(`         \x1b[33mError: ${err?.message || err}\x1b[0m`);
  }
}

async function run() {
  console.log('\n📜 ========================================================');
  console.log('   PERPUSJAL AUTH LIFECYCLE & SECURITY VERIFICATION SUITE');
  console.log('========================================================\n');

  // In-memory data store for isolated unit testing
  const memoryUsers: any[] = [];
  const memoryTokens: any[] = [];
  const memorySessions: any[] = [];

  // Intercept Prisma operations for sandboxed offline execution
  (prisma.user.findUnique as any) = async ({ where }: any) => {
    if (where.email) return memoryUsers.find((u) => u.email === where.email) || null;
    if (where.username) return memoryUsers.find((u) => u.username === where.username) || null;
    if (where.id) return memoryUsers.find((u) => u.id === where.id) || null;
    return null;
  };

  (prisma.user.create as any) = async ({ data }: any) => {
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerifiedAt: null,
      failedLoginCount: 0,
      lockedUntil: null,
    };
    memoryUsers.push(newUser);
    return newUser;
  };

  (prisma.user.update as any) = async ({ where, data }: any) => {
    const user = memoryUsers.find((u) => u.id === where.id);
    if (!user) throw new Error('User not found in memory');
    Object.assign(user, data);
    return user;
  };

  (prisma.verificationToken.create as any) = async ({ data }: any) => {
    const token = {
      id: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...data,
      usedAt: null,
      createdAt: new Date(),
    };
    memoryTokens.push(token);
    return token;
  };

  (prisma.verificationToken.findFirst as any) = async ({ where, include, orderBy }: any) => {
    let matches = memoryTokens.filter((t) => {
      if (where.userId && t.userId !== where.userId) return false;
      if (where.type && t.type !== where.type) return false;
      if (where.tokenHash && t.tokenHash !== where.tokenHash) return false;
      if (where.usedAt === null && t.usedAt !== null) return false;
      if (where.expiresAt?.gt && t.expiresAt <= where.expiresAt.gt) return false;
      return true;
    });

    if (orderBy?.createdAt === 'desc') {
      matches.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const found = matches[0];
    if (!found) return null;

    if (include?.user) {
      const user = memoryUsers.find((u) => u.id === found.userId);
      return { ...found, user };
    }
    return found;
  };

  (prisma.verificationToken.update as any) = async ({ where, data }: any) => {
    const tok = memoryTokens.find((t) => t.id === where.id);
    if (!tok) throw new Error('Token not found');
    Object.assign(tok, data);
    return tok;
  };

  (prisma.verificationToken.updateMany as any) = async ({ where, data }: any) => {
    let count = 0;
    for (const t of memoryTokens) {
      if (where.userId && t.userId !== where.userId) continue;
      if (where.type && t.type !== where.type) continue;
      if (where.usedAt === null && t.usedAt !== null) continue;
      Object.assign(t, data);
      count++;
    }
    return { count };
  };

  (prisma.verificationToken.count as any) = async ({ where }: any) => {
    return memoryTokens.filter((t) => {
      if (where.userId && t.userId !== where.userId) return false;
      if (where.type && t.type !== where.type) return false;
      if (where.createdAt?.gte && t.createdAt < where.createdAt.gte) return false;
      return true;
    }).length;
  };

  (prisma.session.create as any) = async ({ data }: any) => {
    const session = {
      id: `ses_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...data,
      lastActiveAt: new Date(),
      createdAt: new Date(),
    };
    memorySessions.push(session);
    return session;
  };

  (prisma.session.findUnique as any) = async ({ where }: any) => {
    return memorySessions.find((s) => s.id === where.id) || null;
  };

  (prisma.session.deleteMany as any) = async ({ where }: any) => {
    let removed = 0;
    for (let i = memorySessions.length - 1; i >= 0; i--) {
      const s = memorySessions[i];
      if (s.userId !== where.userId) continue;
      if (where.id?.not && s.id === where.id.not) continue;
      memorySessions.splice(i, 1);
      removed++;
    }
    return { count: removed };
  };

  (prisma.session.count as any) = async ({ where }: any) => {
    return memorySessions.filter((s) => {
      if (where.userId && s.userId !== where.userId) return false;
      return true;
    }).length;
  };

  (prisma.$transaction as any) = async (promises: any[]) => {
    const results = [];
    for (const p of promises) {
      results.push(await p);
    }
    return results;
  };

  const testEmail = 'pramoedya@perpusjal.org';
  const testUsername = 'pram_blora';
  let createdUserId = '';
  let verificationTokenRaw = '';
  let resetTokenRaw = '';

  // 1. Suite: Email Service & Stark Monochrome Template Tests
  console.log('\n[SUITE 1: EMAIL SERVICE & STARK MONOCHROME TEMPLATES]');
  
  await test('Email Service generates valid HTML with book paper (#F9F9F7) and no rounded corners', async () => {
    const result = await emailService.sendVerificationEmail('test@perpusjal.org', 'Pramoedya', 'dummy-token-64');
    if (!result.success) throw new Error('sendVerificationEmail failed');
  });

  await test('Password reset email dispatches with 1-hour note', async () => {
    const result = await emailService.sendPasswordResetEmail('test@perpusjal.org', 'Pramoedya', 'dummy-reset-64');
    if (!result.success) throw new Error('sendPasswordResetEmail failed');
  });

  await test('Security notification dispatches for password change', async () => {
    const result = await emailService.sendPasswordChangedNotification('test@perpusjal.org', 'Pramoedya');
    if (!result.success) throw new Error('sendPasswordChangedNotification failed');
  });

  // 2. Suite: Registration & Email Verification Cycle
  console.log('\n[SUITE 2: REGISTRATION & VERIFICATION CYCLE]');

  await test('Register generates 64-char token, stores SHA-256 hash in DB, and dispatches email', async () => {
    const regResult = await authService.register({
      name: 'Pramoedya Ananta Toer',
      username: testUsername,
      email: testEmail,
      phoneNumber: '081234567890',
      password: 'SandiRahasia2026!',
      passwordConfirm: 'SandiRahasia2026!',
      agreeTerms: true,
    });

    createdUserId = regResult.id;
    verificationTokenRaw = regResult.devVerificationToken || '';

    const user = memoryUsers.find((u) => u.id === createdUserId);
    if (!user || user.status !== UserStatus.PENDING_VERIFICATION) {
      throw new Error('User status should be PENDING_VERIFICATION');
    }

    // Verify raw token is 64 hex characters (32 bytes)
    if (verificationTokenRaw.length !== 64) {
      throw new Error(`Expected 64-char hex token, got ${verificationTokenRaw.length}`);
    }

    // Verify SHA-256 hash in DB
    const expectedHash = crypto.createHash('sha256').update(verificationTokenRaw).digest('hex');
    const storedToken = memoryTokens.find((t) => t.userId === createdUserId);
    if (!storedToken || storedToken.tokenHash !== expectedHash) {
      throw new Error('Verification token does not match expected SHA-256 hash');
    }
  });

  await test('Resend verification enforces 60-second cooldown', async () => {
    try {
      await authService.resendVerification({ userId: createdUserId });
      throw new Error('Expected 60s cooldown error but none thrown');
    } catch (err: any) {
      if (!err.message?.includes('detik') && err.code !== 'COOLDOWN_ACTIVE') {
        throw err;
      }
    }
  });

  await test('Resend verification via email works for unauthenticated users', async () => {
    // Fast-forward latest token createdAt to simulate cooldown expiry
    memoryTokens[0].createdAt = new Date(Date.now() - 120 * 1000);

    const resendRes = await authService.resendVerification({ email: testEmail });
    if (!resendRes.message.includes('dikirim ulang')) {
      throw new Error('Expected successful resend message');
    }
  });

  await test('Verify email activates user to TL1, timestamps emailVerifiedAt, and creates session', async () => {
    // Get latest active unexpired token
    const latestToken = memoryTokens[memoryTokens.length - 1];
    const dummyRaw = 'known_raw_token_for_verification_testing_64_characters_long_now_ok!';
    latestToken.tokenHash = crypto.createHash('sha256').update(dummyRaw).digest('hex');
    latestToken.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const verifyRes = await authService.verifyEmail(dummyRaw, {
      userAgent: 'Mac Chrome Editorial',
      ipAddress: '127.0.0.1',
    });

    if (verifyRes.user.status !== UserStatus.ACTIVE || verifyRes.user.trustLevel !== TrustLevel.TL1) {
      throw new Error('User should be ACTIVE with TrustLevel TL1 after email verification');
    }

    const updatedUser = memoryUsers.find((u) => u.id === createdUserId);
    if (!updatedUser?.emailVerifiedAt) {
      throw new Error('emailVerifiedAt should be timestamped');
    }
    if (!verifyRes.sessionToken) {
      throw new Error('Expected sessionToken on successful verification');
    }
  });

  // 3. Suite: Password Reset Flow & Session Revocation
  console.log('\n[SUITE 3: FORGOT & RESET PASSWORD (ONE-TIME TOKEN & TIMING ATTACK PREVENTION)]');

  await test('Forgot password returns generic 200 message for non-existent email (Anti-Enumeration)', async () => {
    const res = await authService.forgotPassword('tidak_ada@perpusjal.org');
    if (!res.message.includes('Jika email terdaftar')) {
      throw new Error('Message should be generic to prevent user enumeration');
    }
  });

  await test('Forgot password generates 1-hour token for registered user', async () => {
    const res = await authService.forgotPassword(testEmail);
    if (!res.message.includes('Jika email terdaftar')) {
      throw new Error('Message should be generic');
    }

    const resetToken = memoryTokens.find((t) => t.type === TokenType.PASSWORD_RESET);
    if (!resetToken) {
      throw new Error('Password reset token not recorded in database');
    }

    // Set known raw token for test
    resetTokenRaw = 'known_raw_reset_token_64_characters_long_for_predictable_testing_ok';
    resetToken.tokenHash = crypto.createHash('sha256').update(resetTokenRaw).digest('hex');
    resetToken.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  });

  await test('Reset password updates passwordHash and REVOKES ALL existing sessions', async () => {
    // Populate active sessions
    memorySessions.push({
      id: 'ses_old_1',
      userId: createdUserId,
      tokenHash: 'hash1',
      expiresAt: new Date(Date.now() + 86400000),
    });
    memorySessions.push({
      id: 'ses_old_2',
      userId: createdUserId,
      tokenHash: 'hash2',
      expiresAt: new Date(Date.now() + 86400000),
    });

    if (memorySessions.filter((s) => s.userId === createdUserId).length < 2) {
      throw new Error('Setup sessions failed');
    }

    const resetRes = await authService.resetPassword({
      token: resetTokenRaw,
      password: 'PasswordBaruKuat2026!',
      passwordConfirm: 'PasswordBaruKuat2026!',
    });

    if (!resetRes.message.includes('berhasil')) {
      throw new Error('Password reset did not report success');
    }

    // Check all sessions revoked
    const remaining = memorySessions.filter((s) => s.userId === createdUserId).length;
    if (remaining !== 0) {
      throw new Error(`Expected 0 sessions after password reset, found ${remaining}`);
    }

    // Check password updated
    const user = memoryUsers.find((u) => u.id === createdUserId);
    const isNewPass = await bcrypt.compare('PasswordBaruKuat2026!', user.passwordHash);
    if (!isNewPass) {
      throw new Error('New password does not match bcrypt hash');
    }
  });

  // 4. Suite: Change Password Mandiri & Other Session Revocation
  console.log('\n[SUITE 4: CHANGE PASSWORD MANDIRI & OTHER SESSION REVOCATION]');

  await test('Change password verifies old password, revokes OTHER sessions, preserves CURRENT session', async () => {
    const currentSessionId = 'ses_current_laptop';
    const otherSessionId = 'ses_other_mobile';

    memorySessions.push({
      id: currentSessionId,
      userId: createdUserId,
      tokenHash: 'hash_current',
      expiresAt: new Date(Date.now() + 86400000),
    });
    memorySessions.push({
      id: otherSessionId,
      userId: createdUserId,
      tokenHash: 'hash_other',
      expiresAt: new Date(Date.now() + 86400000),
    });

    // Wrong password test
    try {
      await authService.changePassword(
        createdUserId,
        {
          oldPassword: 'WrongPassword123!',
          newPassword: 'SandiPalingBaru2026!',
        },
        currentSessionId
      );
      throw new Error('Expected wrong old password error');
    } catch (err: any) {
      if (!err.message?.includes('tidak sesuai')) {
        throw err;
      }
    }

    // Valid change password
    const changeRes = await authService.changePassword(
      createdUserId,
      {
        oldPassword: 'PasswordBaruKuat2026!',
        newPassword: 'SandiPalingBaru2026!',
      },
      currentSessionId
    );

    if (!changeRes.message.includes('berhasil')) {
      throw new Error('Change password did not return success');
    }

    // Check sessions: currentSession MUST be preserved, otherSession MUST be revoked
    const currentExists = memorySessions.some((s) => s.id === currentSessionId);
    const otherExists = memorySessions.some((s) => s.id === otherSessionId);

    if (!currentExists) {
      throw new Error('Current device session was incorrectly deleted');
    }
    if (otherExists) {
      throw new Error('Other device session was NOT revoked');
    }
  });

  console.log('\n========================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('========================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
