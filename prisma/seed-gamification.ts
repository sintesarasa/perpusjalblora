import { PrismaClient, Role, UserStatus, TrustLevel, ArticleStatus, CommentStatus, RegistrationStatus, LoanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CANONICAL_BADGES, badgesService } from '../apps/api/src/modules/badges/badges.service.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Gamification & Achievement Tree Seeding...');

  // 1. Ensure all Canonical Badges exist
  await badgesService.ensureBadgesSeeded();
  console.log(`✅ ${CANONICAL_BADGES.length} Canonical Badges seeded.`);

  const passwordHash = await bcrypt.hash('password123', 10);

  // ── DUMMY USER 1: Sang Pembaca & Penjaga Amanah ──
  const user1 = await prisma.user.upsert({
    where: { username: 'pembacablora' },
    update: {
      onTimeStreak: 20,
      equippedTitle: 'Penjaga Amanah',
      isProfilePublic: true,
      showBadges: true,
    },
    create: {
      username: 'pembacablora',
      name: 'Arga Sang Pembaca',
      email: 'pembaca@perpusjal.org',
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL2,
      bio: 'Penikmat wacana sastra dan sejarah lokal. Menjaga amanah buku bersama dengan penuh ketertiban.',
      onTimeStreak: 20,
      equippedTitle: 'Penjaga Amanah',
      isProfilePublic: true,
      showBadges: true,
      emailVerifiedAt: new Date(),
    },
  });

  // ── DUMMY USER 2: Wartawan Rakyat & Penjaga Logika ──
  const user2 = await prisma.user.upsert({
    where: { username: 'penulisrakyat' },
    update: {
      equippedTitle: 'Wartawan Rakyat',
      isProfilePublic: true,
      showBadges: true,
    },
    create: {
      username: 'penulisrakyat',
      name: 'Larasati Suluh',
      email: 'penulis@perpusjal.org',
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL2,
      bio: 'Menuliskan keresahan dan denyut nadi warga Blora dari sudut pasar hingga pojok alun-alun.',
      equippedTitle: 'Wartawan Rakyat',
      isProfilePublic: true,
      showBadges: true,
      emailVerifiedAt: new Date(),
    },
  });

  // ── DUMMY USER 3: Donatur Buku & Penggerak Lapak ──
  const user3 = await prisma.user.upsert({
    where: { username: 'kawanlapak' },
    update: {
      booksDonatedCount: 30,
      equippedTitle: 'Penggerak Lapak',
      isProfilePublic: true,
      showBadges: true,
    },
    create: {
      username: 'kawanlapak',
      name: 'Budi Penggerak Lapak',
      email: 'kawan@perpusjal.org',
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL2,
      bio: 'Relawan jalanan. Gemar menggelar terpal buku fisik dan menghibahkan koleksi bacaan untuk warga.',
      booksDonatedCount: 30,
      equippedTitle: 'Penggerak Lapak',
      isProfilePublic: true,
      showBadges: true,
      emailVerifiedAt: new Date(),
    },
  });

  // Ambil sample buku, artikel, dan event yang sudah ada di database untuk relasi
  const sampleBook = await prisma.book.findFirst();
  const sampleCategory = await prisma.category.findFirst({ where: { type: { in: ['ARTICLE', 'BOTH'] } } });

  // 1. Seed published articles for user2 (12 articles -> triggers Tier 1, 2, 3 Tinta)
  if (sampleCategory) {
    const existingArticles = await prisma.article.count({ where: { authorId: user2.id } });
    if (existingArticles < 12) {
      for (let i = existingArticles + 1; i <= 12; i++) {
        await prisma.article.create({
          data: {
            authorId: user2.id,
            categoryId: sampleCategory.id,
            title: `Catatan Pinggiran Blora Seri #${i}: Mengakar di Tanah Jati`,
            slug: `catatan-pinggiran-blora-seri-${i}-${Date.now()}`,
            content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sebuah refleksi kemasyarakatan...' }] }] },
            excerpt: 'Menatap geliat literasi warga dari lorong-lorong sunyi yang penuh harapan.',
            status: ArticleStatus.PUBLISHED,
            publishedAt: new Date(Date.now() - i * 86400000),
          },
        });
      }
    }
  }

  // Ambil artikel milik penulis lain (bukan user1) untuk dibaca user1
  const nonUser1Articles = await prisma.article.findMany({
    where: { authorId: { not: user1.id } },
    select: { id: true },
    take: 100,
  });

  // Seed reading logs for user1 (80 distinct articles -> triggers Tier 1, 2, 3 Wacana)
  for (let i = 0; i < Math.min(80, nonUser1Articles.length); i++) {
    const art = nonUser1Articles[i];
    await prisma.readingLog.upsert({
      where: { id: `seed-log-user1-${art.id}` },
      update: { counted: true, secondsSpent: 120 },
      create: {
        id: `seed-log-user1-${art.id}`,
        userId: user1.id,
        articleId: art.id,
        secondsSpent: 120,
        scrollDepth: 100,
        counted: true,
      },
    });
  }

  // Seed returned loans for user1 (10 loans -> triggers Tier 1 Amanah)
  if (sampleBook) {
    const existingLoans = await prisma.loan.count({ where: { userId: user1.id } });
    if (existingLoans < 10) {
      for (let i = 0; i < 10 - existingLoans; i++) {
        await prisma.loan.create({
          data: {
            loanCode: `PJ${i}${Date.now().toString().slice(-8)}`,
            userId: user1.id,
            bookId: sampleBook.id,
            pickupPoint: 'Lapak Alun-Alun Blora',
            status: LoanStatus.RETURNED,
            borrowedAt: new Date(Date.now() - 30 * 86400000),
            dueDate: new Date(Date.now() - 16 * 86400000),
            returnedAt: new Date(Date.now() - 17 * 86400000), // on time!
          },
        });
      }
    }
  }

  // Seed comments for user2 (80 comments -> triggers Tier 1, 2, 3 Dialektika)
  const anyArticle = await prisma.article.findFirst();
  if (anyArticle) {
    const existingComments = await prisma.comment.count({ where: { authorId: user2.id } });
    if (existingComments < 80) {
      const commentsToCreate = [];
      for (let i = 0; i < 80 - existingComments; i++) {
        commentsToCreate.push({
          authorId: user2.id,
          articleId: anyArticle.id,
          content: `Tanggapan dialektis #${i + 1}: Saya sepakat bahwa ruang literasi harus tetap independen dan berpihak pada rakyat jelata.`,
          status: CommentStatus.PUBLISHED,
        });
      }
      await prisma.comment.createMany({ data: commentsToCreate });
    }
  }

  // Seed event attendance for user3 (16 events -> triggers Tier 1, 2, 3 Presensi)
  const existingEvents = await prisma.event.findMany({ take: 20 });
  for (let i = 0; i < Math.min(16, existingEvents.length); i++) {
    const ev = existingEvents[i];
    await prisma.eventRegistration.upsert({
      where: { eventId_userId: { eventId: ev.id, userId: user3.id } },
      update: { status: RegistrationStatus.ATTENDED },
      create: {
        eventId: ev.id,
        userId: user3.id,
        status: RegistrationStatus.ATTENDED,
        attendanceCode: `HD${i}`,
        checkedInAt: new Date(),
      },
    });
  }

  // Award easter eggs and set showcase badges
  await badgesService.awardManualBadge(user1.id, 'SECRET_NIGHT_OWL');
  await badgesService.awardManualBadge(user2.id, 'SECRET_SPEED_COMMENT');
  await badgesService.awardManualBadge(user3.id, 'SECRET_CURATOR_FAVORITE');

  // Evaluasi seluruh progress untuk ketiga user tersebut
  console.log('🔄 Evaluating badge progresses for dummy users...');
  const res1 = await badgesService.getUserBadgeProgress(user1.id);
  const res2 = await badgesService.getUserBadgeProgress(user2.id);
  const res3 = await badgesService.getUserBadgeProgress(user3.id);

  // Set showcase badges from earned badges
  const earned1 = res1.badges.filter((b) => b.earned).map((b) => b.badge.code).slice(0, 3);
  const earned2 = res2.badges.filter((b) => b.earned).map((b) => b.badge.code).slice(0, 3);
  const earned3 = res3.badges.filter((b) => b.earned).map((b) => b.badge.code).slice(0, 3);

  if (earned1.length > 0) await badgesService.updateShowcaseBadges(user1.id, earned1);
  if (earned2.length > 0) await badgesService.updateShowcaseBadges(user2.id, earned2);
  if (earned3.length > 0) await badgesService.updateShowcaseBadges(user3.id, earned3);

  console.log(`✨ User 1 (@${user1.username}): ${res1.earnedCount} Lencana | Gelar: "${res1.equippedTitle}" | Etalase: ${earned1.join(', ')}`);
  console.log(`✨ User 2 (@${user2.username}): ${res2.earnedCount} Lencana | Gelar: "${res2.equippedTitle}" | Etalase: ${earned2.join(', ')}`);
  console.log(`✨ User 3 (@${user3.username}): ${res3.earnedCount} Lencana | Gelar: "${res3.equippedTitle}" | Etalase: ${earned3.join(', ')}`);
  console.log('🎉 Gamification Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
