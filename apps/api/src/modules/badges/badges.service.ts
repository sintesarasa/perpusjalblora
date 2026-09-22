import { prisma } from '../../lib/prisma.js';
import {
  BadgeCriteria,
  BadgeItem,
  UserBadgeProgress,
  UserBadgeListResponse,
} from '@perpusjal/types';
import { notificationsService } from '../notifications/notifications.service.js';

export const CANONICAL_BADGES: Array<{
  code: string;
  name: string;
  description: string;
  iconName: string;
  criteriaType: BadgeCriteria;
  criteriaValue: number;
  order: number;
}> = [
  {
    code: 'PEMBACA_PERTAMA',
    name: 'Pembaca Pertama',
    description: 'Menyelesaikan bacaan 1 artikel secara utuh.',
    iconName: 'seedling',
    criteriaType: BadgeCriteria.ARTICLES_READ,
    criteriaValue: 1,
    order: 1,
  },
  {
    code: 'PEMBACA_AKTIF',
    name: 'Pembaca Aktif',
    description: 'Membaca 10 artikel pilihan di ruang baca Perpusjal.',
    iconName: 'book-open',
    criteriaType: BadgeCriteria.ARTICLES_READ,
    criteriaValue: 10,
    order: 2,
  },
  {
    code: 'KUTU_BUKU',
    name: 'Kutu Buku',
    description: 'Menyelesaikan pembacaan 50 artikel pustaka.',
    iconName: 'owl',
    criteriaType: BadgeCriteria.ARTICLES_READ,
    criteriaValue: 50,
    order: 3,
  },
  {
    code: 'PENULIS_PERTAMA',
    name: 'Penulis Pertama',
    description: 'Tulisan perdana lolos meja kurasi dan terbit ke publik.',
    iconName: 'feather',
    criteriaType: BadgeCriteria.ARTICLES_PUBLISHED,
    criteriaValue: 1,
    order: 4,
  },
  {
    code: 'KONTRIBUTOR',
    name: 'Kontributor Warta',
    description: 'Menerbitkan 5 karya tulis untuk kearsipan komunitas.',
    iconName: 'pen-tool',
    criteriaType: BadgeCriteria.ARTICLES_PUBLISHED,
    criteriaValue: 5,
    order: 5,
  },
  {
    code: 'KOLUMNIS',
    name: 'Kolumnis Perpusjal',
    description: 'Menerbitkan 15 tulisan reflektif dan kritik berbobot.',
    iconName: 'newspaper',
    criteriaType: BadgeCriteria.ARTICLES_PUBLISHED,
    criteriaValue: 15,
    order: 6,
  },
  {
    code: 'TEMAN_DISKUSI',
    name: 'Teman Diskusi',
    description: 'Menuliskan 10 tanggapan argumentatif yang terbit di ruang komentar.',
    iconName: 'message-square',
    criteriaType: BadgeCriteria.COMMENTS_PUBLISHED,
    criteriaValue: 10,
    order: 7,
  },
  {
    code: 'PENGGERAK_LITERASI',
    name: 'Penggerak Literasi',
    description: 'Hadir langsung di 3 forum diskusi atau lapak baca terbuka.',
    iconName: 'flame',
    criteriaType: BadgeCriteria.EVENTS_ATTENDED,
    criteriaValue: 3,
    order: 8,
  },
  {
    code: 'BOOK_EXPLORER',
    name: 'Penjelajah Pustaka',
    description: 'Menuntaskan peminjaman dan pengembalian 5 buku koleksi lapak.',
    iconName: 'compass',
    criteriaType: BadgeCriteria.LOANS_RETURNED,
    criteriaValue: 5,
    order: 9,
  },
  {
    code: 'PENJAGA_AMANAH',
    name: 'Penjaga Amanah',
    description: '10 kali pengembalian buku tepat waktu tanpa pernah terlambat.',
    iconName: 'shield',
    criteriaType: BadgeCriteria.ONTIME_STREAK,
    criteriaValue: 10,
    order: 10,
  },
  {
    code: 'SAHABAT_LAPAK',
    name: 'Sahabat Lapak',
    description: 'Telah terdaftar selama 1 tahun dan aktif dalam ekosistem Perpusjal.',
    iconName: 'landmark',
    criteriaType: BadgeCriteria.ACCOUNT_AGE_DAYS,
    criteriaValue: 365,
    order: 11,
  },
  {
    code: 'DONATUR_BUKU',
    name: 'Donatur Pustaka',
    description: 'Menghibahkan buku fisik untuk dirawat dan dibaca bersama di lapak.',
    iconName: 'gift',
    criteriaType: BadgeCriteria.MANUAL,
    criteriaValue: 1,
    order: 12,
  },
];

export class BadgesService {
  async ensureBadgesSeeded() {
    for (const b of CANONICAL_BADGES) {
      await prisma.badge.upsert({
        where: { code: b.code },
        create: {
          code: b.code,
          name: b.name,
          description: b.description,
          iconName: b.iconName,
          criteriaType: b.criteriaType as any,
          criteriaValue: b.criteriaValue,
          order: b.order,
          isActive: true,
        },
        update: {
          name: b.name,
          description: b.description,
          iconName: b.iconName,
          criteriaType: b.criteriaType as any,
          criteriaValue: b.criteriaValue,
          order: b.order,
        },
      });
    }
  }

  async getAllBadges(): Promise<BadgeItem[]> {
    await this.ensureBadgesSeeded();
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return badges.map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      description: b.description,
      iconName: b.iconName,
      criteriaType: b.criteriaType as BadgeCriteria,
      criteriaValue: b.criteriaValue,
      order: b.order,
      isActive: b.isActive,
      createdAt: b.createdAt.toISOString(),
    }));
  }

  async getUserBadgeProgress(userId: string): Promise<UserBadgeListResponse> {
    await this.ensureBadgesSeeded();

    const [user, badges, userBadges, readCount, pubArticlesCount, pubCommentsCount, attendedEventsCount, returnedLoansCount] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, createdAt: true, onTimeStreak: true },
        }),
        prisma.badge.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' },
        }),
        prisma.userBadge.findMany({
          where: { userId },
          include: { badge: true },
        }),
        prisma.readingLog.count({
          where: { userId, counted: true },
        }),
        prisma.article.count({
          where: { authorId: userId, status: 'PUBLISHED' as any },
        }),
        prisma.comment.count({
          where: { authorId: userId, status: 'PUBLISHED' as any },
        }),
        prisma.eventRegistration.count({
          where: { userId, status: 'ATTENDED' as any },
        }),
        prisma.loan.count({
          where: {
            userId,
            status: { in: ['RETURNED', 'RETURNED_LOST'] as any[] },
          },
        }),
      ]);

    if (!user) {
      return { earnedCount: 0, totalCount: badges.length, badges: [] };
    }

    const now = new Date();
    const daysSinceJoined = Math.floor(
      (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    const userBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]));

    const results: UserBadgeProgress[] = [];
    let earnedCount = 0;

    for (const b of badges) {
      let currentValue = 0;
      switch (b.criteriaType) {
        case BadgeCriteria.ARTICLES_READ:
          currentValue = readCount;
          break;
        case BadgeCriteria.ARTICLES_PUBLISHED:
          currentValue = pubArticlesCount;
          break;
        case BadgeCriteria.COMMENTS_PUBLISHED:
          currentValue = pubCommentsCount;
          break;
        case BadgeCriteria.EVENTS_ATTENDED:
          currentValue = attendedEventsCount;
          break;
        case BadgeCriteria.LOANS_RETURNED:
          currentValue = returnedLoansCount;
          break;
        case BadgeCriteria.ONTIME_STREAK:
          currentValue = user.onTimeStreak;
          break;
        case BadgeCriteria.ACCOUNT_AGE_DAYS:
          currentValue = daysSinceJoined;
          break;
        case BadgeCriteria.MANUAL:
          currentValue = userBadgeMap.has(b.id) ? b.criteriaValue : 0;
          break;
      }

      const existingUB = userBadgeMap.get(b.id);
      const isEligible = b.criteriaType === BadgeCriteria.MANUAL
        ? !!existingUB?.earnedAt
        : currentValue >= b.criteriaValue;

      // If newly earned, save in DB and create notification!
      let earnedAt = existingUB?.earnedAt ? existingUB.earnedAt.toISOString() : null;

      if (isEligible && !existingUB?.earnedAt) {
        const earnedDate = new Date();
        earnedAt = earnedDate.toISOString();
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId, badgeId: b.id } },
          create: {
            userId,
            badgeId: b.id,
            progress: currentValue,
            earnedAt: earnedDate,
          },
          update: {
            progress: currentValue,
            earnedAt: earnedDate,
          },
        });

        // Send Notification
        await notificationsService.createNotification(userId, {
          type: 'BADGE_EARNED',
          title: `Lencana Baru Diraih: ${b.name}`,
          body: `Selamat! Kamu telah memperoleh lencana "${b.name}" atas kontribusi apresiasi literasi.`,
          actionUrl: '/dashboard/badge',
          entityType: 'BADGE',
          entityId: b.id,
        });
      }

      const earned = isEligible || !!existingUB?.earnedAt;
      if (earned) earnedCount++;

      const cappedValue = Math.min(currentValue, b.criteriaValue);
      const percent = Math.min(100, Math.round((cappedValue / b.criteriaValue) * 100));

      results.push({
        badge: {
          id: b.id,
          code: b.code,
          name: b.name,
          description: b.description,
          iconName: b.iconName,
          criteriaType: b.criteriaType as BadgeCriteria,
          criteriaValue: b.criteriaValue,
          order: b.order,
          isActive: b.isActive,
          createdAt: b.createdAt.toISOString(),
        },
        earned,
        earnedAt,
        currentValue,
        targetValue: b.criteriaValue,
        percent,
      });
    }

    return {
      earnedCount,
      totalCount: badges.length,
      badges: results,
    };
  }
}

export const badgesService = new BadgesService();
