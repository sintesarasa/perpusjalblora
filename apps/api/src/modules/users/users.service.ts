import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/errors.js';
import {
  PublicUserProfile,
  UpdateProfileInput,
  ChangePasswordInput,
  ContributorItem,
  AdminUserListItem,
  UserDataExport,
  Role,
  UserStatus,
  TrustLevel,
} from '@perpusjal/types';
import { badgesService } from '../badges/badges.service.js';
import { notificationsService } from '../notifications/notifications.service.js';

export class UsersService {
  async getPublicProfile(username: string): Promise<PublicUserProfile> {
    const user = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: 'insensitive' },
        deletedAt: null,
      },
      include: {
        articles: {
          where: { status: 'PUBLISHED' as any },
          orderBy: { publishedAt: 'desc' },
          take: 20,
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!user) {
      throw HttpError.notFound('Profil pengguna tidak ditemukan');
    }

    const totalArticles = await prisma.article.count({
      where: { authorId: user.id, status: 'PUBLISHED' as any },
    });

    // Evaluate badges for this user
    let userBadges: any[] = [];
    if (user.showBadges && user.isProfilePublic) {
      const badgesRes = await badgesService.getUserBadgeProgress(user.id);
      userBadges = badgesRes.badges.filter((b) => b.earned);
    }

    // BR-PROF-01: if private profile, only return name and published articles
    if (!user.isProfilePublic) {
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        avatarUrl: null,
        bio: null,
        instagramUrl: null,
        websiteUrl: null,
        role: user.role as Role,
        trustLevel: user.trustLevel as TrustLevel,
        createdAt: user.createdAt.toISOString(),
        isProfilePublic: false,
        showBadges: false,
        stats: {
          totalArticles,
          badgesCount: 0,
        },
        badges: [],
        articles: user.articles.map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          publishedAt: a.publishedAt ? a.publishedAt.toISOString() : a.createdAt.toISOString(),
          category: a.category ? { id: a.category.id, name: a.category.name, slug: a.category.slug } : undefined,
        })),
      };
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      instagramUrl: user.instagramUrl,
      websiteUrl: user.websiteUrl,
      role: user.role as Role,
      trustLevel: user.trustLevel as TrustLevel,
      createdAt: user.createdAt.toISOString(),
      isProfilePublic: user.isProfilePublic,
      showBadges: user.showBadges,
      stats: {
        totalArticles,
        badgesCount: userBadges.length,
      },
      badges: userBadges,
      articles: user.articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : a.createdAt.toISOString(),
        category: a.category ? { id: a.category.id, name: a.category.name, slug: a.category.slug } : undefined,
      })),
    };
  }

  async getContributors(page = 1, limit = 20): Promise<{ items: ContributorItem[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      status: { notIn: ['DELETED', 'DEACTIVATED'] as any[] },
      OR: [
        { articles: { some: { status: 'PUBLISHED' as any } } },
        { role: { in: ['KURATOR', 'ADMIN'] as any[] } },
      ],
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              articles: { where: { status: 'PUBLISHED' as any } },
              badges: { where: { earnedAt: { not: null } } },
            },
          },
        },
      }),
    ]);

    const items: ContributorItem[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      role: u.role as Role,
      articlesCount: u._count.articles,
      badgesCount: u._count.badges,
      joinedAt: u.createdAt.toISOString(),
    }));

    return { items, total };
  }

  async updateMyProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw HttpError.notFound('Pengguna tidak ditemukan');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name !== undefined ? input.name.trim() : undefined,
        bio: input.bio !== undefined ? input.bio.trim() : undefined,
        instagramUrl: input.instagramUrl !== undefined ? input.instagramUrl.trim() : undefined,
        websiteUrl: input.websiteUrl !== undefined ? input.websiteUrl.trim() : undefined,
        avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : undefined,
        isProfilePublic: input.isProfilePublic !== undefined ? input.isProfilePublic : undefined,
        showBadges: input.showBadges !== undefined ? input.showBadges : undefined,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      username: updated.username,
      email: updated.email,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl,
      instagramUrl: updated.instagramUrl,
      websiteUrl: updated.websiteUrl,
      role: updated.role,
      isProfilePublic: updated.isProfilePublic,
      showBadges: updated.showBadges,
    };
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw HttpError.badRequest('Akun tidak valid untuk penggantian kata sandi');
    }

    const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw HttpError.badRequest('Kata sandi lama tidak sesuai');
    }

    if (input.newPassword.length < 8) {
      throw HttpError.badRequest('Kata sandi baru minimal 8 karakter');
    }

    const newHash = await bcrypt.hash(input.newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { success: true, message: 'Kata sandi berhasil diperbarui' };
  }

  async exportMyData(userId: string): Promise<UserDataExport> {
    const [user, articles, loans, comments, eventRegistrations, userBadges] =
      await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.article.findMany({
          where: { authorId: userId },
          select: { id: true, title: true, slug: true, status: true, createdAt: true, publishedAt: true },
        }),
        prisma.loan.findMany({
          where: { userId },
          include: { book: { select: { title: true } } },
        }),
        prisma.comment.findMany({
          where: { authorId: userId },
          select: { id: true, content: true, status: true, createdAt: true },
        }),
        prisma.eventRegistration.findMany({
          where: { userId },
          include: { event: { select: { title: true } } },
        }),
        prisma.userBadge.findMany({
          where: { userId },
          include: { badge: true },
        }),
      ]);

    if (!user) {
      throw HttpError.notFound('Pengguna tidak ditemukan');
    }

    return {
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      })),
      loans: loans.map((l) => ({
        id: l.id,
        bookTitle: l.book.title,
        status: l.status,
        borrowedAt: l.borrowedAt ? l.borrowedAt.toISOString() : null,
        dueAt: l.dueDate ? l.dueDate.toISOString() : null,
        returnedAt: l.returnedAt ? l.returnedAt.toISOString() : null,
      })),
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
      })),
      eventRegistrations: eventRegistrations.map((er) => ({
        id: er.id,
        eventTitle: er.event.title,
        status: er.status,
        registeredAt: er.registeredAt.toISOString(),
      })),
      badges: userBadges.map((ub) => ({
        name: ub.badge.name,
        code: ub.badge.code,
        earnedAt: ub.earnedAt ? ub.earnedAt.toISOString() : null,
      })),
    };
  }

  async adminListUsers(query: {
    page?: number;
    limit?: number;
    role?: Role;
    status?: UserStatus;
    q?: string;
  }): Promise<{ items: AdminUserListItem[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { username: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              loans: {
                where: { status: { in: ['PENDING', 'APPROVED', 'BORROWED', 'OVERDUE'] as any[] } },
              },
            },
          },
        },
      }),
    ]);

    const items: AdminUserListItem[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role as Role,
      status: u.status as UserStatus,
      trustLevel: u.trustLevel as TrustLevel,
      createdAt: u.createdAt.toISOString(),
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      activeLoansCount: u._count.loans,
      borrowSuspendedUntil: u.borrowSuspendedUntil ? u.borrowSuspendedUntil.toISOString() : null,
      suspensionReason: u.suspensionReason,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async adminUpdateRole(actorId: string, targetUserId: string, newRole: Role) {
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) {
      throw HttpError.notFound('Pengguna target tidak ditemukan');
    }

    // BR-ADM-02: Admin tidak dapat menurunkan role dirinya sendiri jika ia satu-satunya admin tersisa
    if (target.role === Role.ADMIN && newRole !== Role.ADMIN) {
      const activeAdminCount = await prisma.user.count({
        where: { role: Role.ADMIN, status: 'ACTIVE', deletedAt: null },
      });
      if (activeAdminCount <= 1) {
        throw HttpError.badRequest('Tidak dapat menurunkan role: minimal harus ada 1 pengurus utama (ADMIN) aktif dalam sistem');
      }
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole as any },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'UPDATE_USER_ROLE',
        entityType: 'USER',
        entityId: targetUserId,
        before: { role: target.role },
        after: { role: newRole },
      },
    });

    return updated;
  }

  async adminSuspendUser(
    actorId: string,
    targetUserId: string,
    payload: { suspend: boolean; reason?: string; until?: string }
  ) {
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) {
      throw HttpError.notFound('Pengguna tidak ditemukan');
    }

    if (target.role === Role.ADMIN) {
      throw HttpError.badRequest('Tidak dapat membekukan akun sesama pengurus utama (ADMIN)');
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: payload.suspend ? ('SUSPENDED' as any) : ('ACTIVE' as any),
        suspensionReason: payload.suspend ? payload.reason || 'Penangguhan akses oleh pengurus' : null,
        borrowSuspendedUntil: payload.suspend && payload.until ? new Date(payload.until) : null,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId,
        action: payload.suspend ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
        entityType: 'USER',
        entityId: targetUserId,
        before: { status: target.status, reason: target.suspensionReason },
        after: { status: updated.status, reason: updated.suspensionReason },
      },
    });

    // Send notification
    await notificationsService.createNotification(targetUserId, {
      type: payload.suspend ? 'LOAN_SUSPENDED' : 'USER_ACTIVATED',
      title: payload.suspend ? 'Status Akun Dibatasi' : 'Status Akun Dipulihkan',
      body: payload.suspend
        ? `Akun Anda dibatasi sementara oleh pengurus: ${payload.reason || 'Ketentuan komunitas'}`
        : 'Status akun Anda telah kembali aktif normal.',
      actionUrl: '/dashboard/profil',
      entityType: 'USER',
      entityId: targetUserId,
    });

    return updated;
  }
}

export const usersService = new UsersService();
