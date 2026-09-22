import { prisma } from '../../lib/prisma.js';
import { AdminDashboardStats, AdminAuditLogItem } from '@perpusjal/types';

export class AdminService {
  async getDashboardKPIs(): Promise<AdminDashboardStats> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      usersThisWeek,
      totalArticles,
      pendingArticles,
      totalBooks,
      availableCopies,
      pendingLoans,
      activeLoans,
      overdueLoans,
      readyPickupToday,
      upcomingEvents,
      pendingComments,
      pendingLetters,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null } }),
      prisma.article.count({ where: { deletedAt: null } }),
      prisma.article.count({ where: { status: 'PENDING_REVIEW' as any, deletedAt: null } }),
      prisma.book.count(),
      prisma.bookCopy.count({ where: { status: 'AVAILABLE' as any } }),
      prisma.loan.count({ where: { status: 'PENDING' as any } }),
      prisma.loan.count({ where: { status: 'BORROWED' as any } }),
      prisma.loan.count({
        where: {
          OR: [
            { status: 'OVERDUE' as any },
            { status: 'BORROWED' as any, dueDate: { lt: now } },
          ],
        },
      }),
      prisma.loan.count({ where: { status: 'APPROVED' as any } }),
      prisma.event.count({
        where: {
          startAt: { gte: now },
          status: { in: ['PUBLISHED', 'OPEN'] as any[] },
        },
      }),
      prisma.comment.count({ where: { status: 'PENDING' as any } }),
      prisma.readerLetter.count({ where: { status: 'PENDING' as any } }),
    ]);

    return {
      totalUsers,
      usersThisWeek,
      totalArticles,
      pendingArticles,
      totalBooks,
      availableCopies,
      pendingLoans,
      activeLoans,
      overdueLoans,
      readyPickupToday,
      upcomingEvents,
      pendingComments,
      pendingLetters,
    };
  }

  async getAuditLogs(query: {
    page?: number;
    limit?: number;
    entityType?: string;
    actorId?: string;
  }): Promise<{ items: AdminAuditLogItem[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.entityType) where.entityType = query.entityType;
    if (query.actorId) where.actorId = query.actorId;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, name: true, username: true },
          },
        },
      }),
    ]);

    const items: AdminAuditLogItem[] = logs.map((l) => ({
      id: l.id,
      actorId: l.actorId,
      actorName: l.actor ? l.actor.name : null,
      actorUsername: l.actor ? l.actor.username : null,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      before: l.before,
      after: l.after,
      createdAt: l.createdAt.toISOString(),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export const adminService = new AdminService();
