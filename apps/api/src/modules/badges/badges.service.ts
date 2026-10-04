import { prisma } from '../../lib/prisma.js';
import {
  BadgeCriteria,
  BadgeCategory,
  BadgeItem,
  UserBadgeProgress,
  UserBadgeListResponse,
} from '@perpusjal/types';
import { notificationsService } from '../notifications/notifications.service.js';
import { HttpError } from '../../utils/errors.js';

export const CANONICAL_BADGES: Array<{
  code: string;
  name: string;
  description: string;
  iconName: string;
  criteriaType: BadgeCriteria;
  criteriaValue: number;
  tier: number;
  category: BadgeCategory;
  titleReward: string;
  order: number;
  isSecret?: boolean;
}> = [
  // ── 1. PILAR WACANA (Membaca Artikel Pustaka) ──
  {
    code: 'WACANA_T1',
    name: 'Perintis Lembaran',
    description: 'Menuntaskan pembacaan 15 artikel wacana & opini warga secara utuh.',
    iconName: 'book-open',
    criteriaType: BadgeCriteria.ARTICLES_READ,
    criteriaValue: 15,
    tier: 1,
    category: BadgeCategory.WACANA,
    titleReward: 'Perintis Lembaran',
    order: 101,
  },
  {
    code: 'WACANA_T2',
    name: 'Penjelajah Wacana',
    description: 'Membaca tuntas 50 artikel pustaka & khazanah pemikiran rakyat.',
    iconName: 'book-marked',
    criteriaType: BadgeCriteria.ARTICLES_READ,
    criteriaValue: 50,
    tier: 2,
    category: BadgeCategory.WACANA,
    titleReward: 'Penjelajah Wacana',
    order: 102,
  },
  {
    code: 'WACANA_T3',
    name: 'Kutu Buku Lapak',
    description: 'Menyelesaikan pembacaan 150 artikel karya warga.',
    iconName: 'library',
    criteriaType: BadgeCriteria.ARTICLES_READ,
    criteriaValue: 150,
    tier: 3,
    category: BadgeCategory.WACANA,
    titleReward: 'Kutu Buku Lapak',
    order: 103,
  },
  {
    code: 'WACANA_T4',
    name: 'Pelahap Aksara',
    description: 'Membaca tuntas 350 artikel khazanah literasi Perpusjal.',
    iconName: 'flame',
    criteriaType: BadgeCriteria.ARTICLES_READ,
    criteriaValue: 350,
    tier: 4,
    category: BadgeCategory.WACANA,
    titleReward: 'Pelahap Aksara',
    order: 104,
  },
  {
    code: 'WACANA_T5',
    name: 'Resi Pustaka',
    description: 'Membaca 750 artikel pemikiran dan kearsipan rakyat.',
    iconName: 'graduation-cap',
    criteriaType: BadgeCriteria.ARTICLES_READ,
    criteriaValue: 750,
    tier: 5,
    category: BadgeCategory.WACANA,
    titleReward: 'Resi Pustaka',
    order: 105,
  },
  {
    code: 'WACANA_T6',
    name: 'Begawan Sastra',
    description: 'Tingkat legenda: Menuntaskan 1.500 artikel wacana secara utuh.',
    iconName: 'crown',
    criteriaType: BadgeCriteria.ARTICLES_READ,
    criteriaValue: 1500,
    tier: 6,
    category: BadgeCategory.WACANA,
    titleReward: 'Begawan Sastra',
    order: 106,
  },

  // ── 2. PILAR TINTA (Menulis Karya Terbit) ──
  {
    code: 'TINTA_T1',
    name: 'Pena Perdana',
    description: 'Tulisan perdana berhasil lolos meja kurasi dan terbit.',
    iconName: 'feather',
    criteriaType: BadgeCriteria.ARTICLES_PUBLISHED,
    criteriaValue: 1,
    tier: 1,
    category: BadgeCategory.TINTA,
    titleReward: 'Pena Perdana',
    order: 201,
  },
  {
    code: 'TINTA_T2',
    name: 'Pencatat Realitas',
    description: 'Menerbitkan 5 karya tulis reflektif dan warta warga.',
    iconName: 'file-text',
    criteriaType: BadgeCriteria.ARTICLES_PUBLISHED,
    criteriaValue: 5,
    tier: 2,
    category: BadgeCategory.TINTA,
    titleReward: 'Pencatat Realitas',
    order: 202,
  },
  {
    code: 'TINTA_T3',
    name: 'Wartawan Rakyat',
    description: 'Menerbitkan 15 tulisan opini, esai, atau cerita rakyat.',
    iconName: 'newspaper',
    criteriaType: BadgeCriteria.ARTICLES_PUBLISHED,
    criteriaValue: 15,
    tier: 3,
    category: BadgeCategory.TINTA,
    titleReward: 'Wartawan Rakyat',
    order: 203,
  },
  {
    code: 'TINTA_T4',
    name: 'Kolumnis Garis Depan',
    description: 'Menerbitkan 35 karya tulis berbobot di ruang publik.',
    iconName: 'pen-tool',
    criteriaType: BadgeCriteria.ARTICLES_PUBLISHED,
    criteriaValue: 35,
    tier: 4,
    category: BadgeCategory.TINTA,
    titleReward: 'Kolumnis Garis Depan',
    order: 204,
  },
  {
    code: 'TINTA_T5',
    name: 'Mpu Gubahan',
    description: 'Menerbitkan 75 karya sastra & kritik sosial yang menginspirasi.',
    iconName: 'scroll',
    criteriaType: BadgeCriteria.ARTICLES_PUBLISHED,
    criteriaValue: 75,
    tier: 5,
    category: BadgeCategory.TINTA,
    titleReward: 'Mpu Gubahan',
    order: 205,
  },
  {
    code: 'TINTA_T6',
    name: 'Pujangga Arus Bawah',
    description: 'Maestro literasi: Menerbitkan 150 karya tulis rakyat.',
    iconName: 'crown',
    criteriaType: BadgeCriteria.ARTICLES_PUBLISHED,
    criteriaValue: 150,
    tier: 6,
    category: BadgeCategory.TINTA,
    titleReward: 'Pujangga Arus Bawah',
    order: 206,
  },

  // ── 3. PILAR DIALEKTIKA (Komentar & Diskusi Bernas) ──
  {
    code: 'DIALEKTIKA_T1',
    name: 'Pemberi Suara',
    description: 'Menuliskan 10 komentar berbobot di ruang diskusi wacana.',
    iconName: 'message-square',
    criteriaType: BadgeCriteria.COMMENTS_PUBLISHED,
    criteriaValue: 10,
    tier: 1,
    category: BadgeCategory.DIALEKTIKA,
    titleReward: 'Pemberi Suara',
    order: 301,
  },
  {
    code: 'DIALEKTIKA_T2',
    name: 'Teman Berbincang',
    description: 'Mengirimkan 50 tanggapan kritis dan konstruktif.',
    iconName: 'message-circle',
    criteriaType: BadgeCriteria.COMMENTS_PUBLISHED,
    criteriaValue: 50,
    tier: 2,
    category: BadgeCategory.DIALEKTIKA,
    titleReward: 'Teman Berbincang',
    order: 302,
  },
  {
    code: 'DIALEKTIKA_T3',
    name: 'Penjaga Logika',
    description: 'Aktif berdiskusi dengan 150 komentar argumentatif.',
    iconName: 'messages-square',
    criteriaType: BadgeCriteria.COMMENTS_PUBLISHED,
    criteriaValue: 150,
    tier: 3,
    category: BadgeCategory.DIALEKTIKA,
    titleReward: 'Penjaga Logika',
    order: 303,
  },
  {
    code: 'DIALEKTIKA_T4',
    name: 'Juru Debat Lapak',
    description: 'Menyumbang 350 pemikiran di kolom diskusi publik.',
    iconName: 'zap',
    criteriaType: BadgeCriteria.COMMENTS_PUBLISHED,
    criteriaValue: 350,
    tier: 4,
    category: BadgeCategory.DIALEKTIKA,
    titleReward: 'Juru Debat Lapak',
    order: 304,
  },
  {
    code: 'DIALEKTIKA_T5',
    name: 'Penjaga Dialektika',
    description: 'Menuliskan 750 komentar bernas yang merawat nalar sehat.',
    iconName: 'shield',
    criteriaType: BadgeCriteria.COMMENTS_PUBLISHED,
    criteriaValue: 750,
    tier: 5,
    category: BadgeCategory.DIALEKTIKA,
    titleReward: 'Penjaga Dialektika',
    order: 305,
  },
  {
    code: 'DIALEKTIKA_T6',
    name: 'Mursyid Diskusi',
    description: 'Menuliskan 1.500+ komentar bermutu tinggi di ruang wacana.',
    iconName: 'crown',
    criteriaType: BadgeCriteria.COMMENTS_PUBLISHED,
    criteriaValue: 1500,
    tier: 6,
    category: BadgeCategory.DIALEKTIKA,
    titleReward: 'Mursyid Diskusi',
    order: 306,
  },

  // ── 4. PILAR AMANAH (Peminjaman & Streak On-Time) ──
  {
    code: 'AMANAH_T1',
    name: 'Penjelajah Rak',
    description: 'Menuntaskan peminjaman 5 buku fisik koleksi lapak tepat waktu.',
    iconName: 'compass',
    criteriaType: BadgeCriteria.LOANS_RETURNED,
    criteriaValue: 5,
    tier: 1,
    category: BadgeCategory.AMANAH,
    titleReward: 'Penjelajah Rak',
    order: 401,
  },
  {
    code: 'AMANAH_T2',
    name: 'Pemegang Janji',
    description: '10x berturut-turut mengembalikan buku tepat waktu tanpa jeda.',
    iconName: 'check-circle-2',
    criteriaType: BadgeCriteria.ONTIME_STREAK,
    criteriaValue: 10,
    tier: 2,
    category: BadgeCategory.AMANAH,
    titleReward: 'Pemegang Janji',
    order: 402,
  },
  {
    code: 'AMANAH_T3',
    name: 'Penjaga Amanah',
    description: '25x streak tepat waktu; teladan kedisiplinan peminjaman.',
    iconName: 'shield-check',
    criteriaType: BadgeCriteria.ONTIME_STREAK,
    criteriaValue: 25,
    tier: 3,
    category: BadgeCategory.AMANAH,
    titleReward: 'Penjaga Amanah',
    order: 403,
  },
  {
    code: 'AMANAH_T4',
    name: 'Benteng Integritas',
    description: '50x streak pengembalian buku tepat waktu tanpa celah.',
    iconName: 'shield',
    criteriaType: BadgeCriteria.ONTIME_STREAK,
    criteriaValue: 50,
    tier: 4,
    category: BadgeCategory.AMANAH,
    titleReward: 'Benteng Integritas',
    order: 404,
  },
  {
    code: 'AMANAH_T5',
    name: 'Ksatria Pustaka',
    description: '100x streak pengembalian tepat waktu koleksi lapak.',
    iconName: 'award',
    criteriaType: BadgeCriteria.ONTIME_STREAK,
    criteriaValue: 100,
    tier: 5,
    category: BadgeCategory.AMANAH,
    titleReward: 'Ksatria Pustaka',
    order: 405,
  },
  {
    code: 'AMANAH_T6',
    name: 'Wali Amanah Buku',
    description: 'Menuntaskan 200+ peminjaman buku fisik dengan rekam jejak sempurna.',
    iconName: 'crown',
    criteriaType: BadgeCriteria.LOANS_RETURNED,
    criteriaValue: 200,
    tier: 6,
    category: BadgeCategory.AMANAH,
    titleReward: 'Wali Amanah Buku',
    order: 406,
  },

  // ── 5. PILAR PRESENSI (Kehadiran Acara / Lapak Fisik) ──
  {
    code: 'PRESENSI_T1',
    name: 'Penyapa Lapak',
    description: 'Hadir langsung 3x dalam kegiatan atau lapak baca terbuka.',
    iconName: 'map-pin',
    criteriaType: BadgeCriteria.EVENTS_ATTENDED,
    criteriaValue: 3,
    tier: 1,
    category: BadgeCategory.PRESENSI,
    titleReward: 'Penyapa Lapak',
    order: 501,
  },
  {
    code: 'PRESENSI_T2',
    name: 'Kawan Kumpul',
    description: 'Hadir dalam 10 agenda diskusi atau lapak baca mingguan.',
    iconName: 'users',
    criteriaType: BadgeCriteria.EVENTS_ATTENDED,
    criteriaValue: 10,
    tier: 2,
    category: BadgeCategory.PRESENSI,
    titleReward: 'Kawan Kumpul',
    order: 502,
  },
  {
    code: 'PRESENSI_T3',
    name: 'Penggerak Lapak',
    description: 'Hadir dalam 25 kegiatan temu literasi & gelar buku.',
    iconName: 'calendar',
    criteriaType: BadgeCriteria.EVENTS_ATTENDED,
    criteriaValue: 25,
    tier: 3,
    category: BadgeCategory.PRESENSI,
    titleReward: 'Penggerak Lapak',
    order: 503,
  },
  {
    code: 'PRESENSI_T4',
    name: 'Garda Gelaran',
    description: 'Menghadiri 50 kegiatan fisik; motor penggerak literasi.',
    iconName: 'flame',
    criteriaType: BadgeCriteria.EVENTS_ATTENDED,
    criteriaValue: 50,
    tier: 4,
    category: BadgeCategory.PRESENSI,
    titleReward: 'Garda Gelaran',
    order: 504,
  },
  {
    code: 'PRESENSI_T5',
    name: 'Saksi Sejarah',
    description: 'Menghadiri 100 kegiatan komunitas di berbagai sudut Blora.',
    iconName: 'landmark',
    criteriaType: BadgeCriteria.EVENTS_ATTENDED,
    criteriaValue: 100,
    tier: 5,
    category: BadgeCategory.PRESENSI,
    titleReward: 'Saksi Sejarah',
    order: 505,
  },
  {
    code: 'PRESENSI_T6',
    name: 'Jiwa Perpusjal',
    description: 'Menghadiri 200+ kegiatan lapak; sosok legenda hidup pergerakan.',
    iconName: 'crown',
    criteriaType: BadgeCriteria.EVENTS_ATTENDED,
    criteriaValue: 200,
    tier: 6,
    category: BadgeCategory.PRESENSI,
    titleReward: 'Jiwa Perpusjal',
    order: 506,
  },

  // ── 6. PILAR DONATUR (Hibah Buku Fisik Koleksi) ──
  {
    code: 'DONATUR_T1',
    name: 'Penyemai Benih',
    description: 'Menghibahkan 5 buku fisik pertama untuk dibaca bersama.',
    iconName: 'gift',
    criteriaType: BadgeCriteria.BOOKS_DONATED,
    criteriaValue: 5,
    tier: 1,
    category: BadgeCategory.DONATUR,
    titleReward: 'Penyemai Benih',
    order: 601,
  },
  {
    code: 'DONATUR_T2',
    name: 'Kawan Berderma',
    description: 'Menghibahkan 20 buku fisik memperkaya khazanah lapak.',
    iconName: 'heart',
    criteriaType: BadgeCriteria.BOOKS_DONATED,
    criteriaValue: 20,
    tier: 2,
    category: BadgeCategory.DONATUR,
    titleReward: 'Kawan Berderma',
    order: 602,
  },
  {
    code: 'DONATUR_T3',
    name: 'Donatur Setia',
    description: 'Menghibahkan 50 buku koleksi fisik untuk warga.',
    iconName: 'package',
    criteriaType: BadgeCriteria.BOOKS_DONATED,
    criteriaValue: 50,
    tier: 3,
    category: BadgeCategory.DONATUR,
    titleReward: 'Donatur Setia',
    order: 603,
  },
  {
    code: 'DONATUR_T4',
    name: 'Pembangun Rak',
    description: 'Menghibahkan 100 buku bermutu ke perpustakaan rakyat.',
    iconName: 'layers',
    criteriaType: BadgeCriteria.BOOKS_DONATED,
    criteriaValue: 100,
    tier: 4,
    category: BadgeCategory.DONATUR,
    titleReward: 'Pembangun Rak',
    order: 604,
  },
  {
    code: 'DONATUR_T5',
    name: 'Penyokong Pustaka',
    description: 'Menghibahkan 250 buku fisik; penopang sirkulasi buku gratis.',
    iconName: 'award',
    criteriaType: BadgeCriteria.BOOKS_DONATED,
    criteriaValue: 250,
    tier: 5,
    category: BadgeCategory.DONATUR,
    titleReward: 'Penyokong Pustaka',
    order: 605,
  },
  {
    code: 'DONATUR_T6',
    name: 'Bapak/Ibu Asuh Pustaka',
    description: 'Menghibahkan 500+ buku fisik koleksi bagi rakyat Blora.',
    iconName: 'crown',
    criteriaType: BadgeCriteria.BOOKS_DONATED,
    criteriaValue: 500,
    tier: 6,
    category: BadgeCategory.DONATUR,
    titleReward: 'Bapak/Ibu Asuh Pustaka',
    order: 606,
  },

  // ── 7. PENCAPAIAN RAHASIA (Easter Eggs & Capaian Khusus) ──
  {
    code: 'SECRET_NIGHT_OWL',
    name: 'Kelana Malam',
    description: 'Membaca arsip wacana rakyat di keheningan dini hari (antara 00.00 - 04.00 WIB).',
    iconName: 'moon',
    criteriaType: BadgeCriteria.MANUAL,
    criteriaValue: 1,
    tier: 3,
    category: BadgeCategory.GENERAL,
    titleReward: 'Kelana Malam',
    order: 701,
    isSecret: true,
  },
  {
    code: 'SECRET_SPEED_COMMENT',
    name: 'Penyulut Nalar',
    description: 'Menjadi komentator pertama yang menyalakan diskusi pada sebuah naskah terbit.',
    iconName: 'zap',
    criteriaType: BadgeCriteria.MANUAL,
    criteriaValue: 1,
    tier: 2,
    category: BadgeCategory.GENERAL,
    titleReward: 'Penyulut Nalar',
    order: 702,
    isSecret: true,
  },
  {
    code: 'SECRET_CURATOR_FAVORITE',
    name: 'Pena Pilihan',
    description: 'Karya tulisan diangkat menjadi Tajuk Utama Pilihan Redaksi Perpusjal.',
    iconName: 'sparkles',
    criteriaType: BadgeCriteria.MANUAL,
    criteriaValue: 1,
    tier: 4,
    category: BadgeCategory.GENERAL,
    titleReward: 'Pena Pilihan',
    order: 703,
    isSecret: true,
  },
];

export class BadgesService {
  async ensureBadgesSeeded() {
    const canonicalCodes = CANONICAL_BADGES.map((b) => b.code);
    await prisma.badge.updateMany({
      where: { code: { notIn: canonicalCodes } },
      data: { isActive: false },
    });

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
          tier: b.tier,
          category: b.category,
          titleReward: b.titleReward,
          order: b.order,
          isActive: true,
        },
        update: {
          name: b.name,
          description: b.description,
          iconName: b.iconName,
          criteriaType: b.criteriaType as any,
          criteriaValue: b.criteriaValue,
          tier: b.tier,
          category: b.category,
          titleReward: b.titleReward,
          order: b.order,
          isActive: true,
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
      tier: b.tier,
      category: b.category,
      titleReward: b.titleReward,
      order: b.order,
      isActive: b.isActive,
      createdAt: b.createdAt.toISOString(),
    }));
  }

  async getUserBadgeProgress(userId: string): Promise<UserBadgeListResponse> {
    await this.ensureBadgesSeeded();

    const [
      user,
      badges,
      userBadges,
      readCount,
      pubArticlesCount,
      pubCommentsCount,
      attendedEventsCount,
      returnedLoansCount,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          createdAt: true,
          onTimeStreak: true,
          equippedTitle: true,
          booksDonatedCount: true,
          showcaseBadgeCodes: true,
        },
      }),
      prisma.badge.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
      }),
      prisma.readingLog
        .findMany({
          where: {
            userId,
            counted: true,
            article: {
              authorId: { not: userId },
            },
          },
          select: { articleId: true },
          distinct: ['articleId'],
        })
        .then((logs) => logs.length),
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
      return {
        earnedCount: 0,
        totalCount: badges.length,
        equippedTitle: null,
        equippedBadge: null,
        availableTitles: [],
        totalTitlesEarned: 0,
        showcaseBadgeCodes: [],
        showcaseBadges: [],
        badges: [],
      };
    }

    const now = new Date();
    const daysSinceJoined = Math.floor(
      (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    const userBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]));

    const results: UserBadgeProgress[] = [];
    let earnedCount = 0;
    const availableTitles: string[] = [];

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
        case BadgeCriteria.BOOKS_DONATED:
          currentValue = user.booksDonatedCount;
          break;
        case BadgeCriteria.ACCOUNT_AGE_DAYS:
          currentValue = daysSinceJoined;
          break;
        case BadgeCriteria.MANUAL:
          currentValue = userBadgeMap.has(b.id) ? b.criteriaValue : 0;
          break;
      }

      const existingUB = userBadgeMap.get(b.id);
      const isEligible =
        b.criteriaType === BadgeCriteria.MANUAL
          ? !!existingUB?.earnedAt
          : currentValue >= b.criteriaValue;

      let earnedAt = existingUB?.earnedAt ? existingUB.earnedAt.toISOString() : null;

      // Newly earned badge! Record in DB & push notification
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

        // Send Live Real-Time Notification
        await notificationsService.createNotification(userId, {
          type: 'BADGE_EARNED',
          title: `Lencana & Gelar Baru: ${b.name}`,
          body: `Selamat! Kamu meraih gelar kehormatan "${b.titleReward || b.name}" (Tier ${b.tier}). Pasang gelarmu di dasbor lencana!`,
          actionUrl: '/dashboard/badge',
          entityType: 'BADGE',
          entityId: b.id,
        });
      }

      const earned = isEligible || !!existingUB?.earnedAt;
      if (earned) {
        earnedCount++;
        if (b.titleReward) {
          availableTitles.push(b.titleReward);
        }
      }

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
          tier: b.tier,
          category: b.category,
          titleReward: b.titleReward,
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

    const showcaseCodes = (user as any).showcaseBadgeCodes || [];
    const showcaseBadges = badges
      .filter((b) => showcaseCodes.includes(b.code))
      .map((b) => ({
        code: b.code,
        name: b.name,
        titleReward: b.titleReward,
        tier: b.tier,
        category: b.category,
      }));

    let equippedBadge = null;
    if (user.equippedTitle) {
      const b = badges.find(
        (x) => x.titleReward === user.equippedTitle || x.name === user.equippedTitle
      );
      if (b) {
        equippedBadge = {
          code: b.code,
          name: b.name,
          titleReward: b.titleReward || b.name,
          tier: b.tier,
          category: b.category,
        };
      }
    }

    return {
      earnedCount,
      totalCount: badges.length,
      equippedTitle: user.equippedTitle,
      equippedBadge,
      availableTitles,
      totalTitlesEarned: availableTitles.length,
      showcaseBadgeCodes: showcaseCodes,
      showcaseBadges,
      badges: results,
      stats: {
        articlesRead: readCount,
        articlesPublished: pubArticlesCount,
        commentsCount: pubCommentsCount,
        loansReturned: returnedLoansCount,
        onTimeStreak: user.onTimeStreak,
        eventsAttended: attendedEventsCount,
        booksDonated: user.booksDonatedCount,
      },
    };
  }

  /**
   * Set user's primary equipped title
   */
  async equipTitle(userId: string, titleReward: string | null) {
    if (titleReward === null || titleReward === '') {
      // Unequip
      return prisma.user.update({
        where: { id: userId },
        data: { equippedTitle: null },
        select: { id: true, equippedTitle: true },
      });
    }

    // Verify title belongs to an earned badge
    const earnedBadges = await prisma.userBadge.findMany({
      where: {
        userId,
        earnedAt: { not: null },
      },
      include: { badge: true },
    });

    const isAvailable = earnedBadges.some(
      (ub) => ub.badge.titleReward === titleReward || ub.badge.name === titleReward
    );

    if (!isAvailable) {
      throw HttpError.forbidden('Kamu belum membuka gelar kehormatan ini.');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { equippedTitle: titleReward },
      select: { id: true, equippedTitle: true },
    });
  }

  /**
   * Update up to 3 showcase badges for member profile
   */
  async updateShowcaseBadges(userId: string, badgeCodes: string[]) {
    if (badgeCodes.length > 3) {
      throw HttpError.badRequest('Maksimal 3 lencana yang dapat dipajang di etalase kehormatan.');
    }

    const earnedBadges = await prisma.userBadge.findMany({
      where: {
        userId,
        earnedAt: { not: null },
      },
      include: { badge: true },
    });

    const earnedCodes = new Set(earnedBadges.map((ub) => ub.badge.code));
    for (const code of badgeCodes) {
      if (!earnedCodes.has(code)) {
        throw HttpError.forbidden(`Kamu belum membuka lencana dengan kode "${code}".`);
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: { showcaseBadgeCodes: badgeCodes },
      select: { id: true, showcaseBadgeCodes: true },
    });
  }

  /**
   * Award a manual badge or easter egg
   */
  async awardManualBadge(userId: string, badgeCode: string) {
    const badge = await prisma.badge.findUnique({ where: { code: badgeCode } });
    if (!badge) return;

    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });

    if (existing?.earnedAt) return; // already earned

    const earnedDate = new Date();
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      create: {
        userId,
        badgeId: badge.id,
        progress: badge.criteriaValue,
        earnedAt: earnedDate,
      },
      update: {
        progress: badge.criteriaValue,
        earnedAt: earnedDate,
      },
    });

    await notificationsService.createNotification(userId, {
      type: 'BADGE_EARNED',
      title: `Pencapaian Rahasia Terbuka: ${badge.name}!`,
      body: `Selamat! Kamu berhasil membuka pencapaian rahasia "${badge.name}" (${badge.titleReward}). Cek koleksimu di dasbor!`,
      actionUrl: '/dashboard/badge',
      entityType: 'BADGE',
      entityId: badge.id,
    });
  }

  /**
   * Admin / Curator: Record physical book donation by member
   */
  async recordBookDonation(
    adminUserId: string,
    targetUserId: string,
    count: number,
    note?: string
  ) {
    if (count <= 0) {
      throw HttpError.badRequest('Jumlah buku donasi harus lebih dari 0.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        booksDonatedCount: { increment: count },
      },
      select: {
        id: true,
        name: true,
        username: true,
        booksDonatedCount: true,
      },
    });

    // Notify user
    await notificationsService.createNotification(targetUserId, {
      type: 'GENERAL_INFO',
      title: 'Hibah Buku Terverifikasi!',
      body: `Relawan lapak telah mencatat penerimaan ${count} buku fisik dari Anda. Terima kasih atas kedermawananmu untuk warga!`,
      actionUrl: '/dashboard/badge',
      entityType: 'USER',
      entityId: targetUserId,
    });

    // Re-evaluate progress to auto-award badges
    await this.getUserBadgeProgress(targetUserId);

    return updatedUser;
  }

  async checkArticleReadBadges(userId: string) {
    return this.getUserBadgeProgress(userId);
  }

  async checkCommentBadges(userId: string) {
    return this.getUserBadgeProgress(userId);
  }

  async checkArticlePublishBadges(userId: string) {
    return this.getUserBadgeProgress(userId);
  }
}

export const badgesService = new BadgesService();
