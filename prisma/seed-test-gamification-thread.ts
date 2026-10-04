import {
  PrismaClient,
  Role,
  UserStatus,
  TrustLevel,
  ArticleStatus,
  CommentStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CANONICAL_BADGES, badgesService } from '../apps/api/src/modules/badges/badges.service.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Menyiapkan Data Uji Coba: Dummy Artikel & Komentar Multi-Tier Gamifikasi...');

  // 1. Pastikan semua Canonical Badges ada di database
  await badgesService.ensureBadgesSeeded();
  const allBadges = await prisma.badge.findMany();
  const badgeMap = new Map(allBadges.map((b) => [b.code, b]));

  const passwordHash = await bcrypt.hash('password123', 10);

  // Helper untuk memberikan badge secara langsung
  async function assignBadges(userId: string, badgeCodes: string[]) {
    for (const code of badgeCodes) {
      const badge = badgeMap.get(code);
      if (!badge) continue;
      await prisma.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badge.id,
          },
        },
        update: {
          progress: badge.criteriaValue,
          earnedAt: new Date(),
        },
        create: {
          userId,
          badgeId: badge.id,
          progress: badge.criteriaValue,
          earnedAt: new Date(),
        },
      });
    }
  }

  // ── USER 1: TIER 1 (BATU CADAS / GIOK - EMERALD) ──
  const userTier1 = await prisma.user.upsert({
    where: { username: 'perintis_mula' },
    update: {
      name: 'Bagus Perintis',
      equippedTitle: 'Perintis Lembaran',
      showcaseBadgeCodes: ['WACANA_T1', 'TINTA_T1'],
      isProfilePublic: true,
      showBadges: true,
      bio: 'Pembaca baru di lapak Perpusjal. Terpikat oleh aroma lembaran kertas dan diskusi hangat sore hari.',
    },
    create: {
      username: 'perintis_mula',
      name: 'Bagus Perintis',
      email: 'perintis@perpusjal.org',
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL1,
      bio: 'Pembaca baru di lapak Perpusjal. Terpikat oleh aroma lembaran kertas dan diskusi hangat sore hari.',
      equippedTitle: 'Perintis Lembaran',
      showcaseBadgeCodes: ['WACANA_T1', 'TINTA_T1'],
      isProfilePublic: true,
      showBadges: true,
      emailVerifiedAt: new Date(),
    },
  });
  await assignBadges(userTier1.id, ['WACANA_T1', 'TINTA_T1', 'AMANAH_T1']);

  // ── USER 2: TIER 2 (PERUNGGU / TEMBAGA - COPPER) ──
  const userTier2 = await prisma.user.upsert({
    where: { username: 'penjelajah_alam' },
    update: {
      name: 'Dewi Penjelajah',
      equippedTitle: 'Penjelajah Wacana',
      showcaseBadgeCodes: ['WACANA_T2', 'SECRET_NIGHT_OWL'],
      isProfilePublic: true,
      showBadges: true,
      bio: 'Penjelajah lapak bacaan mingguan. Menyukai sastra klasik dan catatan sosial pedesaan.',
    },
    create: {
      username: 'penjelajah_alam',
      name: 'Dewi Penjelajah',
      email: 'penjelajah@perpusjal.org',
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL2,
      bio: 'Penjelajah lapak bacaan mingguan. Menyukai sastra klasik dan catatan sosial pedesaan.',
      equippedTitle: 'Penjelajah Wacana',
      showcaseBadgeCodes: ['WACANA_T2', 'SECRET_NIGHT_OWL'],
      isProfilePublic: true,
      showBadges: true,
      emailVerifiedAt: new Date(),
    },
  });
  await assignBadges(userTier2.id, ['WACANA_T1', 'WACANA_T2', 'TINTA_T1', 'TINTA_T2', 'SECRET_NIGHT_OWL']);

  // ── USER 3: TIER 3 (BIRU BAJA / BAJA TINTA - STEEL BLUE) ──
  const userTier3 = await prisma.user.upsert({
    where: { username: 'penulisrakyat' },
    update: {
      name: 'Larasati Suluh',
      equippedTitle: 'Wartawan Rakyat',
      showcaseBadgeCodes: ['TINTA_T3', 'DIALEKTIKA_T3', 'SECRET_SPEED_COMMENT'],
      isProfilePublic: true,
      showBadges: true,
      bio: 'Menuliskan keresahan dan denyut nadi warga Blora dari sudut pasar hingga pojok alun-alun.',
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
      showcaseBadgeCodes: ['TINTA_T3', 'DIALEKTIKA_T3', 'SECRET_SPEED_COMMENT'],
      isProfilePublic: true,
      showBadges: true,
      emailVerifiedAt: new Date(),
    },
  });
  await assignBadges(userTier3.id, [
    'WACANA_T1', 'WACANA_T2', 'WACANA_T3',
    'TINTA_T1', 'TINTA_T2', 'TINTA_T3',
    'DIALEKTIKA_T1', 'DIALEKTIKA_T2', 'DIALEKTIKA_T3',
    'SECRET_SPEED_COMMENT'
  ]);

  // ── USER 4: TIER 4 (PERAK PLATINUM - SILVER) ──
  const userTier4 = await prisma.user.upsert({
    where: { username: 'cendekia_blora' },
    update: {
      name: 'Pratama Cendekia',
      equippedTitle: 'Kolumnis Garis Depan',
      showcaseBadgeCodes: ['TINTA_T4', 'WACANA_T4', 'AMANAH_T4'],
      isProfilePublic: true,
      showBadges: true,
      bio: 'Pengkaji wacana sejarah Blora. Merawat memori kolektif dan nalar kritis generasi muda.',
    },
    create: {
      username: 'cendekia_blora',
      name: 'Pratama Cendekia',
      email: 'cendekia@perpusjal.org',
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL3,
      bio: 'Pengkaji wacana sejarah Blora. Merawat memori kolektif dan nalar kritis generasi muda.',
      equippedTitle: 'Kolumnis Garis Depan',
      showcaseBadgeCodes: ['TINTA_T4', 'WACANA_T4', 'AMANAH_T4'],
      isProfilePublic: true,
      showBadges: true,
      emailVerifiedAt: new Date(),
    },
  });
  await assignBadges(userTier4.id, [
    'WACANA_T1', 'WACANA_T2', 'WACANA_T3', 'WACANA_T4',
    'TINTA_T1', 'TINTA_T2', 'TINTA_T3', 'TINTA_T4',
    'AMANAH_T1', 'AMANAH_T2', 'AMANAH_T3', 'AMANAH_T4',
  ]);

  // ── USER 5: TIER 5 (KECUBUNG WULUNG - AMETHYST) ──
  const userTier5 = await prisma.user.upsert({
    where: { username: 'resi_budaya' },
    update: {
      name: 'Ki Resi Pustaka',
      equippedTitle: 'Resi Pustaka',
      showcaseBadgeCodes: ['WACANA_T5', 'TINTA_T5', 'SECRET_CURATOR_FAVORITE'],
      isProfilePublic: true,
      showBadges: true,
      bio: 'Pengayom ruang dialektika sastra. Mengawal tradisi literasi jalanan agar tetap jujur dan membumi.',
    },
    create: {
      username: 'resi_budaya',
      name: 'Ki Resi Pustaka',
      email: 'resi@perpusjal.org',
      passwordHash,
      role: Role.KURATOR,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL3,
      bio: 'Pengayom ruang dialektika sastra. Mengawal tradisi literasi jalanan agar tetap jujur dan membumi.',
      equippedTitle: 'Resi Pustaka',
      showcaseBadgeCodes: ['WACANA_T5', 'TINTA_T5', 'SECRET_CURATOR_FAVORITE'],
      isProfilePublic: true,
      showBadges: true,
      emailVerifiedAt: new Date(),
    },
  });
  await assignBadges(userTier5.id, [
    'WACANA_T1', 'WACANA_T2', 'WACANA_T3', 'WACANA_T4', 'WACANA_T5',
    'TINTA_T1', 'TINTA_T2', 'TINTA_T3', 'TINTA_T4', 'TINTA_T5',
    'DIALEKTIKA_T1', 'DIALEKTIKA_T2', 'DIALEKTIKA_T3', 'DIALEKTIKA_T4', 'DIALEKTIKA_T5',
    'SECRET_CURATOR_FAVORITE',
  ]);

  // ── USER 6: TIER 6 (EMAS KENCANA 24K - RADIANT GOLD) ──
  const userTier6 = await prisma.user.upsert({
    where: { username: 'begawan_sastra' },
    update: {
      name: 'Empu Begawan Blora',
      equippedTitle: 'Begawan Sastra',
      showcaseBadgeCodes: ['WACANA_T6', 'TINTA_T6', 'DIALEKTIKA_T6'],
      isProfilePublic: true,
      showBadges: true,
      bio: 'Sosok sesepuh perpusjal. Mewakafkan ratusan karya, mengawal ribuan diskusi, dan menjaga lentera pengetahuan abadi.',
    },
    create: {
      username: 'begawan_sastra',
      name: 'Empu Begawan Blora',
      email: 'begawan@perpusjal.org',
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL3,
      bio: 'Sosok sesepuh perpusjal. Mewakafkan ratusan karya, mengawal ribuan diskusi, dan menjaga lentera pengetahuan abadi.',
      equippedTitle: 'Begawan Sastra',
      showcaseBadgeCodes: ['WACANA_T6', 'TINTA_T6', 'DIALEKTIKA_T6'],
      isProfilePublic: true,
      showBadges: true,
      emailVerifiedAt: new Date(),
    },
  });
  await assignBadges(userTier6.id, [
    'WACANA_T1', 'WACANA_T2', 'WACANA_T3', 'WACANA_T4', 'WACANA_T5', 'WACANA_T6',
    'TINTA_T1', 'TINTA_T2', 'TINTA_T3', 'TINTA_T4', 'TINTA_T5', 'TINTA_T6',
    'DIALEKTIKA_T1', 'DIALEKTIKA_T2', 'DIALEKTIKA_T3', 'DIALEKTIKA_T4', 'DIALEKTIKA_T5', 'DIALEKTIKA_T6',
    'AMANAH_T1', 'AMANAH_T2', 'AMANAH_T3', 'AMANAH_T4', 'AMANAH_T5', 'AMANAH_T6',
  ]);

  console.log('✅ 6 Pengguna dengan 6 Tingkatan Tier Berhasil Disiapkan.');

  // ── 2. CARI KATEGORI UNTUK ARTIKEL ──
  let category = await prisma.category.findFirst({
    where: { type: { in: ['ARTICLE', 'BOTH'] } },
  });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Warta & Esai Budaya',
        slug: 'warta-dan-esai-budaya',
        type: 'ARTICLE',
        description: 'Catatan, ulasan, dan refleksi pemikiran warga.',
      },
    });
  }

  // ── 3. ARTIKEL UJI COBA UTAMA (FLAGSHIP ARTICLE) ──
  const articleSlug = 'menyalakan-lentera-literasi-tanah-jati';
  const articleContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Di bawah rindangnya naungan pepohonan alun-alun Blora pada suatu sore yang tenang, lembaran-lembaran buku dihamparkan di atas selembar terpal biru. Tidak ada sekat pintu kaca berpendingin udara, tidak ada kartu keanggotaan birokratis yang rumit, dan tidak ada larangan bersuara. Siapa pun—mulai dari anak-anak pedagang pasar hingga kakek pensiunan—dapat duduk bersila, mengambil buku, dan menyelami dunia pemikiran yang tak terbatas.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [
          {
            type: 'text',
            text: 'Ruang Bebas Tanpa Kasta Pembaca',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Gerakan Perpustakaan Jalanan Blora tumbuh dari keyakinan sederhana: bahwa literasi bukan monopoli kaum terpelajar di menara gading. Buku adalah alat pembebasan akal budi yang harus berada sedekat mungkin dengan denyut nadi masyarakat. Di tanah kelahiran sastrawan besar Pramoedya Ananta Toer ini, kita merawat tradisi bahwa keberanian berpikir adalah warisan budaya yang tak boleh padam.',
          },
        ],
      },
      {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '“Kalian boleh maju dalam pelajaran, mungkin mencapai derajat apa saja, tapi tanpa mencintai sastra, kalian tinggal hanya hewan yang pandai.” — Pramoedya Ananta Toer',
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Setiap buku yang berpindah tangan membawa amanah, dan setiap diskusi di pojok lapak menyalakan sepercik lentera kesadaran. Melalui sistem lencana dan penghargaan karya ini, kita merayakan setiap warga yang tekun merawat nalar, mencatat realitas, dan menjaga ruang hidup bersama.',
          },
        ],
      },
    ],
  };

  const article = await prisma.article.upsert({
    where: { slug: articleSlug },
    update: {
      title: 'Menyalakan Lentera Literasi di Tanah Jati: Dari Pojok Lapak Hingga Ruang Dialektika Warga',
      subtitle: 'Sebuah Refleksi tentang Buku Fisik, Kebebasan Berpikir, dan Solidaritas Ruang Terbuka Blora',
      excerpt: 'Di tengah gempuran distraksi digital, terpal sederhana di alun-alun menjadi saksi bahwa kehausan akan ilmu dan kehangatan tatap muka tak pernah padam di tanah kelahiran Pramoedya ini.',
      authorId: userTier3.id, // Ditulis oleh Larasati Suluh (Tier 3 Wartawan Rakyat)
      categoryId: category.id,
      content: articleContent,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 24 * 3600 * 1000), // 1 hari lalu
      readingTime: 4,
      wordCount: 450,
      coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
      coverCredit: 'Dokumentasi Lapak Baca Perpusjal Blora',
      isFeatured: true,
      allowComments: true,
    },
    create: {
      title: 'Menyalakan Lentera Literasi di Tanah Jati: Dari Pojok Lapak Hingga Ruang Dialektika Warga',
      slug: articleSlug,
      subtitle: 'Sebuah Refleksi tentang Buku Fisik, Kebebasan Berpikir, dan Solidaritas Ruang Terbuka Blora',
      excerpt: 'Di tengah gempuran distraksi digital, terpal sederhana di alun-alun menjadi saksi bahwa kehausan akan ilmu dan kehangatan tatap muka tak pernah padam di tanah kelahiran Pramoedya ini.',
      authorId: userTier3.id,
      categoryId: category.id,
      content: articleContent,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 24 * 3600 * 1000),
      readingTime: 4,
      wordCount: 450,
      coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
      coverCredit: 'Dokumentasi Lapak Baca Perpusjal Blora',
      isFeatured: true,
      allowComments: true,
    },
  });

  console.log(`✅ Artikel Terbit: "${article.title}" (Slug: ${article.slug})`);

  // ── 4. BERSIHKAN KOMENTAR LAMA PADA ARTIKEL INI SEBELUM SEED BARU ──
  await prisma.comment.deleteMany({
    where: { articleId: article.id },
  });

  // ── 5. SEED KOMENTAR MULTI-TIER PADA ARTIKEL ──

  // Komentar 1: TIER 6 (EMAS KENCANA - Begawan Sastra)
  const commentT6 = await prisma.comment.create({
    data: {
      articleId: article.id,
      authorId: userTier6.id,
      content: 'Membaca tulisan ananda Larasati menghidupkan kembali nyala api yang kita sulut belasan tahun silam di emperan toko. Buku bukan sekadar lembaran bertinta, melainkan jembatan yang menghubungkan batin manusia dengan kebenaran hakiki. Pertahankan ruang bebas ini, anak-anak muda!',
      status: CommentStatus.PUBLISHED,
      createdAt: new Date(Date.now() - 20 * 3600 * 1000),
    },
  });

  // Komentar 2: TIER 5 (KECUBUNG - Resi Pustaka)
  const commentT5 = await prisma.comment.create({
    data: {
      articleId: article.id,
      authorId: userTier5.id,
      content: 'Refleksi yang sangat mendalam mengenai dialektika lapak baca. Yang terpenting bukanlah seberapa tebal katalog yang kita bentangkan di atas terpal, melainkan keberanian warga untuk duduk bersila, membaca tanpa prasangka, dan berani saling mendengar argumen yang berbeda.',
      status: CommentStatus.PUBLISHED,
      createdAt: new Date(Date.now() - 16 * 3600 * 1000),
    },
  });

  // Balasan Komentar 2 oleh Penulis Artikel: TIER 3 (BIRU BAJA - Wartawan Rakyat)
  await prisma.comment.create({
    data: {
      articleId: article.id,
      authorId: userTier3.id,
      parentId: commentT5.id,
      content: 'Matur nuwun sanget, Ki Resi. Wejangan ini menjadi pengingat bagi kami kawan-kawan lapangan agar selalu menjaga kesetaraan di atas terpal—tidak ada kasta pembaca, semua sama-sama belajar.',
      status: CommentStatus.PUBLISHED,
      createdAt: new Date(Date.now() - 14 * 3600 * 1000),
    },
  });

  // Komentar 3: TIER 4 (PERAK PLATINUM - Kolumnis Garis Depan)
  await prisma.comment.create({
    data: {
      articleId: article.id,
      authorId: userTier4.id,
      content: 'Data dan analisis sosial dalam artikel ini sangat presisi. Gerakan akar rumput seperti Perpusjal Blora membuktikan bahwa literasi sejati tidak lahir dari gedung megah berkaca, melainkan dari interaksi organik warga yang haus akan pencerahan akal budi.',
      status: CommentStatus.PUBLISHED,
      createdAt: new Date(Date.now() - 10 * 3600 * 1000),
    },
  });

  // Komentar 4: TIER 2 (PERUNGGU - Penjelajah Wacana)
  const commentT2 = await prisma.comment.create({
    data: {
      articleId: article.id,
      authorId: userTier2.id,
      content: 'Minggu lalu saya menyempatkan diri mampir ke lapak alun-alun setelah membaca ulasan ini. Menemukan buku kumpulan esai lama yang sudah bertahun-tahun saya cari. Sungguh atmosfer yang menenangkan di tengah bisingnya akhir pekan.',
      status: CommentStatus.PUBLISHED,
      createdAt: new Date(Date.now() - 6 * 3600 * 1000),
    },
  });

  // Balasan Komentar 4 oleh TIER 1 (BATU CADAS - Perintis Lembaran)
  await prisma.comment.create({
    data: {
      articleId: article.id,
      authorId: userTier1.id,
      parentId: commentT2.id,
      content: 'Wah sama Kak Dewi! Saya juga baru pertama kali bergabung dua minggu lalu dan langsung dipinjami buku tanpa syarat yang rumit. Sangat bersyukur ada ruang seperti ini di Blora.',
      status: CommentStatus.PUBLISHED,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
    },
  });

  // Komentar 5: TIER 1 (BATU CADAS - Perintis Lembaran)
  await prisma.comment.create({
    data: {
      articleId: article.id,
      authorId: userTier1.id,
      content: 'Sebagai pembaca baru di Perpusjal, tulisan ini memberi saya gambaran utuh tentang semangat di balik lapak buku gratis ini. Salut untuk para relawan yang merawat gerakan ini tanpa pamrih!',
      status: CommentStatus.PUBLISHED,
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    },
  });

  // Update total comment count pada artikel
  const totalComments = await prisma.comment.count({ where: { articleId: article.id, status: CommentStatus.PUBLISHED } });
  await prisma.article.update({
    where: { id: article.id },
    data: { commentCount: totalComments },
  });

  console.log(`✅ Berhasil membuat ${totalComments} komentar thread dengan pengguna dari Tier 1 hingga Tier 6!`);
  console.log('\n======================================================');
  console.log('📌 DAFTAR AKUN & TIER UNTUK PENGUJIAN:');
  console.log('1. Tier 1 (Giok Cadas):     @perintis_mula    ["Perintis Lembaran"]');
  console.log('2. Tier 2 (Tembaga Kuno):   @penjelajah_alam  ["Penjelajah Wacana"]');
  console.log('3. Tier 3 (Baja Tinta):     @penulisrakyat    ["Wartawan Rakyat"]');
  console.log('4. Tier 4 (Perak Platinum): @cendekia_blora   ["Kolumnis Garis Depan"]');
  console.log('5. Tier 5 (Kecubung):       @resi_budaya      ["Resi Pustaka"]');
  console.log('6. Tier 6 (Emas Kencana):   @begawan_sastra   ["Begawan Sastra"]');
  console.log('------------------------------------------------------');
  console.log(`🔗 URL Artikel Publik: /artikel/${articleSlug}`);
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error Seeding Data Test:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
