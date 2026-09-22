import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/errors.js';
import { NotificationItem, NotificationListResponse } from '@perpusjal/types';

export class NotificationsService {
  async createNotification(
    userId: string,
    data: {
      type: string;
      title: string;
      body: string;
      actionUrl?: string;
      entityType?: string;
      entityId?: string;
    }
  ) {
    // Check preference
    const pref = await prisma.notificationPreference.findUnique({
      where: { userId_type: { userId, type: data.type } },
    });

    if (pref && !pref.inApp) {
      return null;
    }

    return prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        body: data.body,
        actionUrl: data.actionUrl,
        entityType: data.entityType,
        entityId: data.entityId,
      },
    });
  }

  async getNotifications(
    userId: string,
    query: { page?: number; limit?: number; unreadOnly?: boolean }
  ): Promise<NotificationListResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.unreadOnly) {
      where.isRead = false;
    }

    const [total, unreadCount, items] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const formatted: NotificationItem[] = items.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      body: n.body,
      actionUrl: n.actionUrl,
      entityType: n.entityType,
      entityId: n.entityId,
      isRead: n.isRead,
      readAt: n.readAt ? n.readAt.toISOString() : null,
      createdAt: n.createdAt.toISOString(),
    }));

    return {
      items: formatted,
      unreadCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<NotificationItem> {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw HttpError.notFound('Notifikasi tidak ditemukan');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      type: updated.type,
      title: updated.title,
      body: updated.body,
      actionUrl: updated.actionUrl,
      entityType: updated.entityType,
      entityId: updated.entityId,
      isRead: updated.isRead,
      readAt: updated.readAt ? updated.readAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }

  async getPreferences(userId: string) {
    const prefs = await prisma.notificationPreference.findMany({
      where: { userId },
    });
    return prefs;
  }

  async updatePreferences(
    userId: string,
    preferences: Array<{ type: string; inApp: boolean; email: boolean }>
  ) {
    for (const p of preferences) {
      await prisma.notificationPreference.upsert({
        where: { userId_type: { userId, type: p.type } },
        create: { userId, type: p.type, inApp: p.inApp, email: p.email },
        update: { inApp: p.inApp, email: p.email },
      });
    }
    return this.getPreferences(userId);
  }
}

export const notificationsService = new NotificationsService();
