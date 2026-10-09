import {
  PrismaClient,
  Role,
  UserStatus,
  TrustLevel,
  CategoryType,
  BadgeCriteria,
  BookCondition,
  BookCopyStatus,
  Language,
  EventType,
  EventStatus,
  RegistrationStatus,
  LetterStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to build TipTap/ProseMirror JSON document
function makeDoc(blocks: Array<{ type: 'paragraph' | 'heading' | 'blockquote' | 'bulletList'; text?: string; level?: number; items?: string[] }>) {
  return {
    type: 'doc',
    content: blocks.map((b) => {
      if (b.type === 'heading') {
        return {
          type: 'heading',
          attrs: { level: b.level || 2 },
          content: [{ type: 'text', text: b.text || '' }],
        };
      }
      if (b.type === 'blockquote') {
        return {
          type: 'blockquote',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: b.text || '' }] }],
        };
      }
      if (b.type === 'bulletList' && b.items) {
        return {
          type: 'bulletList',
          content: b.items.map((item) => ({
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
          })),
        };
      }
      return {
        type: 'paragraph',
        content: [{ type: 'text', text: b.text || '' }],
      };
    }),
  };
}

async function main() {
  console.log('🌱 Menjalankan Seeding Master Tunggal Perpusjal Blora v3 (PostgreSQL)...');

  // =========================================================================
  // 1. PENGGUNA RESMI SISTEM (ADMIN, KURATOR, WARGA)
  // =========================================================================
  console.log('👤 [1/7] Menyemai Akun Pengguna Resmi...');

  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'AdminPerpusjal2026!';
  const kuratorPassword = process.env.KURATOR_INITIAL_PASSWORD || 'KuratorPerpusjal2026!';
  const wargaPassword = process.env.WARGA_INITIAL_PASSWORD || 'WargaPerpusjal2026!';

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const kuratorHash = await bcrypt.hash(kuratorPassword, 12);
  const wargaHash = await bcrypt.hash(wargaPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@perpusjal.org' },
    update: {
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL2,
    },
    create: {
      email: 'admin@perpusjal.org',
      username: 'admin',
      name: 'Pengurus Perpusjal Blora',
      passwordHash: adminHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL2,
      emailVerifiedAt: new Date(),
      bio: 'Akun administratif resmi kolektif Perpustakaan Jalanan Blora.',
      equippedTitle: 'Penjaga Nyala',
    },
  });
  console.log(`   ✅ Admin: ${admin.email} (@${admin.username})`);

  const kurator = await prisma.user.upsert({
    where: { email: 'kurator@perpusjal.org' },
    update: {
      role: Role.KURATOR,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL2,
    },
    create: {
      email: 'kurator@perpusjal.org',
      username: 'kurator',
      name: 'Kurator Redaksi Perpusjal',
      passwordHash: kuratorHash,
      role: Role.KURATOR,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL2,
      emailVerifiedAt: new Date(),
      bio: 'Kurator literasi & pengelola sirkulasi naskah warga Perpusjal Blora.',
      equippedTitle: 'Penjaga Amanah',
    },
  });
  console.log(`   ✅ Kurator: ${kurator.email} (@${kurator.username})`);

  const warga = await prisma.user.upsert({
    where: { email: 'warga@perpusjal.org' },
    update: {
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL1,
    },
    create: {
      email: 'warga@perpusjal.org',
      username: 'warga',
      name: 'Siti Rahayu',
      phoneNumber: '081234567890',
      passwordHash: wargaHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL1,
      emailVerifiedAt: new Date(),
      bio: 'Warga Kunduran, Blora. Pembaca setia lapak trotoar Alun-Alun Blora.',
      equippedTitle: 'Pembaca Terpal',
      onTimeStreak: 3,
    },
  });
  console.log(`   ✅ Warga: ${warga.email} (@${warga.username})`);

  // Penulis warga tambahan untuk artikel & surat pembaca
  const penulisBudi = await prisma.user.upsert({
    where: { email: 'budi.santoso@warga.id' },
    update: {},
    create: {
      email: 'budi.santoso@warga.id',
      username: 'budi_santoso',
      name: 'Budi Santoso',
      passwordHash: wargaHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL1,
      emailVerifiedAt: new Date(),
      bio: 'Pencinta sejarah lokal Blora dan pemerhati ruang terbuka kota.',
      equippedTitle: 'Pengelana Kata',
    },
  });

  const penulisAnita = await prisma.user.upsert({
    where: { email: 'anita.puspita@warga.id' },
    update: {},
    create: {
      email: 'anita.puspita@warga.id',
      username: 'anita_literasi',
      name: 'Anita Puspita Dewi',
      passwordHash: wargaHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL1,
      emailVerifiedAt: new Date(),
      bio: 'Guru madrasah di Blora yang aktif mendongeng untuk anak-anak di lapak jalanan.',
      equippedTitle: 'Wartawan Rakyat',
    },
  });

  // =========================================================================
  // 2. KATEGORI BUKU & KATEGORI ARTIKEL (RUBRIK TULISAN WARGA)
  // =========================================================================
  console.log('📚 [2/7] Menyemai Kategori Buku & Artikel...');

  const categoriesData = [
    // Kategori Buku
    { name: 'Sastra', slug: 'sastra', description: 'Karya sastra, novel monumental, puisi, dan cerpen bernas.', type: CategoryType.BOTH, order: 1 },
    { name: 'Sosial & Filsafat', slug: 'sosial', description: 'Isu sosial, perlawanan rakyat, pemikiran kritis, dan filsafat peradaban.', type: CategoryType.BOTH, order: 2 },
    { name: 'Pendidikan', slug: 'pendidikan', description: 'Pedagogi kritis, pembebasan nalar, dan inovasi pendidikan rakyat.', type: CategoryType.BOOK, order: 3 },
    { name: 'Sejarah & Budaya', slug: 'budaya', description: 'Kekayaan budaya lokal Blora, falsafah Sedulur Sikep, dan sejarah Nusantara.', type: CategoryType.BOTH, order: 4 },
    { name: 'Anak & Dongeng', slug: 'anak', description: 'Buku fabel bergambar, cerita rakyat, dan penyemai imajinasi dini.', type: CategoryType.BOOK, order: 5 },
    { name: 'Fiksi & Roman', slug: 'fiksi', description: 'Roman sejarah, fiksi sastra, cerpen realisme, dan prosa imajinatif.', type: CategoryType.BOOK, order: 6 },
    { name: 'Non-Fiksi', slug: 'non-fiksi', description: 'Biografi pejuang, catatan harian aktivis, dan esai investigasi.', type: CategoryType.BOOK, order: 7 },

    // Kategori Artikel Warga
    { name: 'Suara Lapak', slug: 'suara-lapak', description: 'Catatan dari jalanan & perjumpaan buku di ruang terbuka.', type: CategoryType.ARTICLE, order: 10 },
    { name: 'Pojok Blora', slug: 'pojok-blora', description: 'Sketsa sosial, tradisi, & denyut kehidupan lokal Blora.', type: CategoryType.ARTICLE, order: 11 },
    { name: 'Opini Warga', slug: 'opini-warga', description: 'Pikiran kritis, suara aspirasi, & gagasan perbaikan daerah.', type: CategoryType.ARTICLE, order: 12 },
    { name: 'Lingkungan', slug: 'lingkungan', description: 'Hutan jati, ekologi bumi, krisis air, & kelestarian alam.', type: CategoryType.BOTH, order: 13 },
    { name: 'Sejarah Blora', slug: 'sejarah', description: 'Memori masa lalu, falsafah Samin, & jejak sastra Pramoedya.', type: CategoryType.BOTH, order: 14 },
    { name: 'Puisi & Sastra', slug: 'puisi', description: 'Bait sajak, puisi liris jalanan, & ekspresi rasa warga.', type: CategoryType.ARTICLE, order: 15 },
    { name: 'Refleksi Diri', slug: 'refleksi-diri', description: 'Kontemplasi batin, renungan personal, & makna membaca.', type: CategoryType.ARTICLE, order: 16 },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        type: cat.type,
        order: cat.order,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        type: cat.type,
        order: cat.order,
        isActive: true,
      },
    });
    categoryMap.set(c.slug, c.id);
  }
  console.log(`   ✅ ${categoriesData.length} Kategori berhasil disemai.`);

  // Tags
  const initialTags = [
    'alun-alun', 'lapak-buku', 'relawan', 'baca-gratis', 'anak-anak',
    'pramoedya', 'sedulur-sikep', 'samin', 'hutan-jati', 'barongan',
    'lingkungan', 'krisis-air', 'ruang-terbuka', 'pendidikan', 'refleksi',
  ];
  for (const tagSlug of initialTags) {
    await prisma.tag.upsert({
      where: { slug: tagSlug },
      update: {},
      create: { name: tagSlug.replace(/-/g, ' '), slug: tagSlug },
    });
  }

  // =========================================================================
  // 3. 12 BADGES LENCANA KOMUNITAS & GAMIFIKASI LENGKAP (PRD §17.1)
  // =========================================================================
  console.log('🏅 [3/7] Menyemai 12 Lencana Resmi & Badge Gamifikasi...');

  const badges = [
    { code: 'PEMBACA_PERTAMA', name: 'Pembaca Pertama', description: 'Membaca 1 artikel tuntas.', iconName: 'Sprout', criteriaType: BadgeCriteria.ARTICLES_READ, criteriaValue: 1, tier: 1, category: 'WACANA', titleReward: 'Pembaca Pemula', order: 1 },
    { code: 'PEMBACA_AKTIF', name: 'Pembaca Aktif', description: 'Membaca 10 artikel tuntas.', iconName: 'BookOpen', criteriaType: BadgeCriteria.ARTICLES_READ, criteriaValue: 10, tier: 2, category: 'WACANA', titleReward: 'Penjelajah Lembaran', order: 2 },
    { code: 'KUTU_BUKU', name: 'Kutu Buku', description: 'Membaca 50 artikel tuntas.', iconName: 'Glasses', criteriaType: BadgeCriteria.ARTICLES_READ, criteriaValue: 50, tier: 3, category: 'WACANA', titleReward: 'Kutu Buku Lapak', order: 3 },
    { code: 'PENULIS_PERTAMA', name: 'Penulis Pertama', description: '1 naskah warga diterbitkan di terbitan blog.', iconName: 'Feather', criteriaType: BadgeCriteria.ARTICLES_PUBLISHED, criteriaValue: 1, tier: 1, category: 'TINTA', titleReward: 'Penulis Pemula', order: 4 },
    { code: 'KONTRIBUTOR', name: 'Kontributor', description: '5 artikel diterbitkan di meja redaksi.', iconName: 'PenTool', criteriaType: BadgeCriteria.ARTICLES_PUBLISHED, criteriaValue: 5, tier: 2, category: 'TINTA', titleReward: 'Kontributor Warga', order: 5 },
    { code: 'KOLUMNIS', name: 'Kolumnis', description: '15 artikel diterbitkan di rubrik warga.', iconName: 'Newspaper', criteriaType: BadgeCriteria.ARTICLES_PUBLISHED, criteriaValue: 15, tier: 3, category: 'TINTA', titleReward: 'Kolumnis Lapak', order: 6 },
    { code: 'TEMAN_DISKUSI', name: 'Teman Diskusi', description: '10 komentar dialektika disetujui kurator.', iconName: 'MessageSquare', criteriaType: BadgeCriteria.COMMENTS_PUBLISHED, criteriaValue: 10, tier: 1, category: 'DIALEKTIKA', titleReward: 'Teman Diskusi', order: 7 },
    { code: 'PENGGERAK_LITERASI', name: 'Penggerak Literasi', description: 'Hadir aktif di minimal 3 kegiatan fisik komunitas.', iconName: 'Flame', criteriaType: BadgeCriteria.EVENTS_ATTENDED, criteriaValue: 3, tier: 2, category: 'PRESENSI', titleReward: 'Penggerak Literasi', order: 8 },
    { code: 'BOOK_EXPLORER', name: 'Book Explorer', description: 'Menuntaskan 5 peminjaman buku fisik tepat waktu.', iconName: 'Compass', criteriaType: BadgeCriteria.LOANS_RETURNED, criteriaValue: 5, tier: 2, category: 'AMANAH', titleReward: 'Penjelajah Buku', order: 9 },
    { code: 'PENJAGA_AMANAH', name: 'Penjaga Amanah', description: '10 peminjaman berturut-turut tanpa pernah terlambat.', iconName: 'ShieldCheck', criteriaType: BadgeCriteria.ONTIME_STREAK, criteriaValue: 10, tier: 3, category: 'AMANAH', titleReward: 'Penjaga Amanah', order: 10 },
    { code: 'SAHABAT_LAPAK', name: 'Sahabat Lapak', description: 'Bergabung minimal 1 tahun dan konsisten merawat lapak.', iconName: 'HeartHandshake', criteriaType: BadgeCriteria.ACCOUNT_AGE_DAYS, criteriaValue: 365, tier: 4, category: 'PRESENSI', titleReward: 'Sahabat Lapak', order: 11 },
    { code: 'DONATUR_BUKU', name: 'Donatur Buku', description: 'Menghibahkan buku fisik untuk koleksi bersama warga.', iconName: 'Gift', criteriaType: BadgeCriteria.MANUAL, criteriaValue: 1, tier: 2, category: 'DONATUR', titleReward: 'Penyokong Pustaka', order: 12 },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: {
        name: b.name,
        description: b.description,
        iconName: b.iconName,
        criteriaType: b.criteriaType,
        criteriaValue: b.criteriaValue,
        tier: b.tier,
        category: b.category,
        titleReward: b.titleReward,
        order: b.order,
      },
      create: {
        code: b.code,
        name: b.name,
        description: b.description,
        iconName: b.iconName,
        criteriaType: b.criteriaType,
        criteriaValue: b.criteriaValue,
        tier: b.tier,
        category: b.category,
        titleReward: b.titleReward,
        order: b.order,
        isActive: true,
      },
    });
  }
  console.log(`   ✅ ${badges.length} Badge resmi berhasil disemai.`);

  // Berikan badge awal untuk Siti Rahayu (Warga)
  const bSprout = await prisma.badge.findUnique({ where: { code: 'PEMBACA_PERTAMA' } });
  if (bSprout) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: warga.id, badgeId: bSprout.id } },
      update: {},
      create: { userId: warga.id, badgeId: bSprout.id, progress: 1, earnedAt: new Date() },
    });
  }

  // =========================================================================
  // 4. KOLEKSI BUKU SASTRA MONUMENTAL & EKSEMPLAR FISIK RIIL (PRD §12)
  // =========================================================================
  console.log('📖 [4/7] Menyemai Koleksi Pustaka Monumental & Eksemplar Fisik (BookCopy)...');

  const booksData = [
    {
      title: 'Bumi Manusia',
      slug: 'bumi-manusia',
      author: 'Pramoedya Ananta Toer',
      isbn: '9789799731234',
      publisher: 'Hasta Mitra / Lentera Dipantara',
      publicationYear: 1980,
      pages: 535,
      categorySlug: 'sastra',
      shelfLocation: 'RAK-SAS-01',
      description: 'Karya sastra monumental kelahiran Blora yang mengisahkan pergulatan batin Minke, seorang pribumi cerdas di tengah keangkuhan feodalisme Jawa dan kolonialisme Hindia Belanda.',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      curatorNote: 'Karya wajib untuk memahami fondasi kebangkitan nalar manusia merdeka di Nusantara.',
      isFeatured: true,
      copyCodes: ['PJ-2026-0001', 'PJ-2026-0002'],
    },
    {
      title: 'Anak Semua Bangsa',
      slug: 'anak-semua-bangsa',
      author: 'Pramoedya Ananta Toer',
      isbn: '9789799731241',
      publisher: 'Hasta Mitra / Lentera Dipantara',
      publicationYear: 1981,
      pages: 539,
      categorySlug: 'sastra',
      shelfLocation: 'RAK-SAS-01',
      description: 'Lanjutan Tetralogi Buru di mana Minke diajak turun langsung ke tanah berlumpur pedesaan, menyaksikan jerit petani tebu yang terhisap oleh modal perkebunan kolonial.',
      coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
      curatorNote: 'Belajar menulis untuk rakyat jelata, bukan sekadar memuaskan pembaca kota.',
      isFeatured: true,
      copyCodes: ['PJ-2026-0003', 'PJ-2026-0004'],
    },
    {
      title: 'Gadis Pantai',
      slug: 'gadis-pantai',
      author: 'Pramoedya Ananta Toer',
      isbn: '9789799731258',
      publisher: 'Lentera Dipantara',
      publicationYear: 1982,
      pages: 270,
      categorySlug: 'sastra',
      shelfLocation: 'RAK-SAS-02',
      description: 'Kisah pilu penindasan feodalisme pesisir Jawa terhadap perempuan bersahaja dari kampung nelayan yang dijadikan selir sementara (perempuan mas picis) oleh priyayi pembesar.',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
      curatorNote: 'Potret otentik martabat perempuan bersahaja melawan kemunafikan kelas bangsawan.',
      isFeatured: true,
      copyCodes: ['PJ-2026-0005', 'PJ-2026-0006'],
    },
    {
      title: 'Madilog: Materialisme, Dialektika, dan Logika',
      slug: 'madilog',
      author: 'Tan Malaka',
      isbn: '9789791684567',
      publisher: 'Pusat Data Purba / Narasi',
      publicationYear: 1943,
      pages: 568,
      categorySlug: 'sosial',
      shelfLocation: 'RAK-FIL-02',
      description: 'Mahakarya pemikiran Tan Malaka yang mengajak bangsa Indonesia keluar dari kungkungan logika mistika menuju nalar ilmiah kritis sebagai senjata pembebasan nasional.',
      coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
      curatorNote: 'Buku pegangan wajib bagi siapa saja yang ingin mengasah nalar kritis dialektis.',
      isFeatured: true,
      copyCodes: ['PJ-2026-0007', 'PJ-2026-0008'],
    },
    {
      title: 'Laut Bercerita',
      slug: 'laut-bercerita',
      author: 'Leila S. Chudori',
      isbn: '9786024246945',
      publisher: 'Kepustakaan Populer Gramedia',
      publicationYear: 2017,
      pages: 379,
      categorySlug: 'sastra',
      shelfLocation: 'RAK-SAS-03',
      description: 'Novel menyentuh tentang kehilangan, persahabatan aktivis mahasiswa 1998, dan suara sunyi keluarga korban penghilangan paksa yang terus menuntut keadilan di depan Istana.',
      coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80',
      curatorNote: 'Kisah abadi agar kita tak melupakan mereka yang dihilangkan demi demokrasi.',
      isFeatured: true,
      copyCodes: ['PJ-2026-0009', 'PJ-2026-0010'],
    },
    {
      title: 'Orang-Orang Bloomington',
      slug: 'orang-orang-bloomington',
      author: 'Budi Darma',
      isbn: '9786020658469',
      publisher: 'Gramedia Pustaka Utama',
      publicationYear: 1980,
      pages: 288,
      categorySlug: 'sastra',
      shelfLocation: 'RAK-SAS-04',
      description: 'Kumpulan cerpen psikologis legendaris Budi Darma yang menyelami kesepian, keterasingan, dengki, dan keanehan batin manusia di sudut kota kecil Bloomington, Indiana.',
      coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
      curatorNote: 'Puncak stilistika sastra Indonesia dalam memotret anatomi kesepian jiwa.',
      isFeatured: false,
      copyCodes: ['PJ-2026-0011', 'PJ-2026-0012'],
    },
    {
      title: 'Catatan Seorang Demonstran',
      slug: 'catatan-seorang-demonstran',
      author: 'Soe Hok Gie',
      isbn: '9789794441466',
      publisher: 'LP3ES',
      publicationYear: 1983,
      pages: 400,
      categorySlug: 'sosial',
      shelfLocation: 'RAK-FIL-01',
      description: 'Buku harian seorang intelektual muda yang teguh memilih menjadi oposan abadi bagi kekuasaan tiran, mencintai kebebasan, kebenaran nurani, dan puncak-puncak gunung.',
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
      curatorNote: 'Lebih baik diasingkan daripada menyerah pada kemunafikan.',
      isFeatured: false,
      copyCodes: ['PJ-2026-0013', 'PJ-2026-0014'],
    },
    {
      title: 'Pendidikan Kaum Tertindas',
      slug: 'pendidikan-kaum-tertindas',
      author: 'Paulo Freire',
      isbn: '9789791680125',
      publisher: 'Narasi',
      publicationYear: 1968,
      pages: 260,
      categorySlug: 'pendidikan',
      shelfLocation: 'RAK-PED-01',
      description: 'Karya pedagogi kritis yang merombak model pendidikan perbankan menjadi proses penyadaran kritis (konsientisasi) melalui dialog setara antara guru dan murid.',
      coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
      curatorNote: 'Fondasi gerakan perpustakaan jalanan: membaca kata adalah membaca dunia.',
      isFeatured: false,
      copyCodes: ['PJ-2026-0015', 'PJ-2026-0016'],
    },
    {
      title: 'Samin Surosentiko & Gerakan Sedulur Sikep',
      slug: 'samin-surosentiko-gerakan-sedulur-sikep',
      author: 'Suratmin & Tim Kajian Sejarah Blora',
      isbn: '9786021234567',
      publisher: 'Pustaka Blora Mandiri',
      publicationYear: 2015,
      pages: 215,
      categorySlug: 'budaya',
      shelfLocation: 'RAK-SEJ-02',
      description: 'Dokumentasi komprehensif falsafah perlawanan pasif Sedulur Sikep di Klopoduwur dan Sambongrejo Blora terhadap penguasaan hutan jati kolonial Belanda.',
      coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
      curatorNote: 'Kearifan lokal adiluhung Blora: kejujuran bicara (bener) dan kerukunan hidup (kepenak).',
      isFeatured: true,
      copyCodes: ['PJ-2026-0017', 'PJ-2026-0018'],
    },
    {
      title: 'Cerita Rakyat Nusantara & Fabel Jawa',
      slug: 'cerita-rakyat-nusantara-fabel-jawa',
      author: 'Koleksi Dongeng Warga',
      isbn: '9786029876543',
      publisher: 'Balai Pustaka Kerakyatan',
      publicationYear: 2019,
      pages: 180,
      categorySlug: 'anak',
      shelfLocation: 'RAK-ANK-01',
      description: 'Kumpulan fabel bergambar dan dongeng tutur lisan Jawa yang mengajarkan welas asih, persahabatan satwa rimba, dan penghormatan kepada tanah air untuk anak-anak lapak.',
      coverImage: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=600&q=80',
      curatorNote: 'Buku favorit anak-anak yang duduk bersila di terpal CFD Alun-Alun Blora.',
      isFeatured: false,
      copyCodes: ['PJ-2026-0019', 'PJ-2026-0020'],
    },
  ];

  let totalCopiesSeeded = 0;
  for (const b of booksData) {
    const categoryId = categoryMap.get(b.categorySlug) || categoryMap.get('sastra')!;
    const copyCount = b.copyCodes.length;

    const book = await prisma.book.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        publisher: b.publisher,
        publicationYear: b.publicationYear,
        pages: b.pages,
        categoryId,
        description: b.description,
        coverImage: b.coverImage,
        curatorNote: b.curatorNote,
        shelfLocation: b.shelfLocation,
        isPublished: true,
        isBorrowable: true,
        isFeatured: b.isFeatured,
        totalCopies: copyCount,
        availableCopies: copyCount,
      },
      create: {
        title: b.title,
        slug: b.slug,
        author: b.author,
        isbn: b.isbn,
        publisher: b.publisher,
        publicationYear: b.publicationYear,
        pages: b.pages,
        categoryId,
        description: b.description,
        coverImage: b.coverImage,
        curatorNote: b.curatorNote,
        shelfLocation: b.shelfLocation,
        isPublished: true,
        isBorrowable: true,
        isFeatured: b.isFeatured,
        totalCopies: copyCount,
        availableCopies: copyCount,
        language: Language.ID,
      },
    });

    // Semai eksemplar fisik berurutan
    for (const invCode of b.copyCodes) {
      await prisma.bookCopy.upsert({
        where: { inventoryCode: invCode },
        update: {
          bookId: book.id,
          condition: BookCondition.BAIK,
          status: BookCopyStatus.AVAILABLE,
        },
        create: {
          bookId: book.id,
          inventoryCode: invCode,
          condition: BookCondition.BAIK,
          status: BookCopyStatus.AVAILABLE,
          note: `Eksemplar fisik resmi terpal // ${b.shelfLocation}`,
        },
      });
      totalCopiesSeeded++;
    }
  }
  console.log(`   ✅ ${booksData.length} Judul Buku & ${totalCopiesSeeded} Eksemplar Fisik (BookCopy) siap sirkulasi.`);

  // =========================================================================
  // 5. AGENDA KEGIATAN NYATA KOMUNITAS (PRISMA.EVENT)
  // =========================================================================
  console.log('🎪 [5/7] Menyemai 3 Agenda Kegiatan Nyata Lapak...');

  // Hitung tanggal Minggu mendatang untuk Lapak CFD
  const now = new Date();
  const nextSunday = new Date(now);
  const daysUntilSunday = (7 - nextSunday.getDay()) % 7 || 7;
  nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
  nextSunday.setHours(6, 0, 0, 0);

  const nextSundayEnd = new Date(nextSunday);
  nextSundayEnd.setHours(9, 30, 0, 0);

  const classDate = new Date(now);
  classDate.setDate(classDate.getDate() + 14);
  classDate.setHours(15, 30, 0, 0);
  const classDateEnd = new Date(classDate);
  classDateEnd.setHours(18, 0, 0, 0);

  const nobarDate = new Date(now);
  nobarDate.setDate(nobarDate.getDate() + 21);
  nobarDate.setHours(19, 0, 0, 0);
  const nobarDateEnd = new Date(nobarDate);
  nobarDateEnd.setHours(22, 0, 0, 0);

  const eventsData = [
    {
      title: 'Lapak Baca Mingguan & Diskusi Terbuka Car Free Day Blora',
      slug: 'lapak-baca-mingguan-cfd-alun-alun-blora',
      type: EventType.LAPAK,
      startAt: nextSunday,
      endAt: nextSundayEnd,
      locationName: 'Alun-Alun Blora (Area CFD Depan Pendopo)',
      locationDetail: 'Bawah naungan pohon trembesi timur Alun-Alun Blora, Jl. Pemuda',
      mapUrl: 'https://maps.google.com/?q=Alun-Alun+Blora',
      quota: 50,
      coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
      description: makeDoc([
        {
          type: 'paragraph',
          text: 'Mari bergabung dalam gelaran lapak baca mingguan Perpustakaan Jalanan Blora di arena Car Free Day Alun-Alun Blora. Ratusan buku fiksi, sastra, pemikiran sosial, dan dongeng anak-anak kami hamparkan di atas terpal biru.',
        },
        { type: 'heading', level: 2, text: 'Ketentuan dan Panduan Mengikuti Lapak' },
        {
          type: 'bulletList',
          items: [
            'Gratis dan terbuka untuk seluruh lapisan masyarakat tanpa memandang usia.',
            'Duduk bersila santai, membaca buku di tempat, atau meminjam buku fisik untuk dibawa pulang.',
            'Bagi pembaca yang ingin mengembalikan buku pinjaman pekan lalu, silakan serahkan langsung ke relawan meja registrasi.',
            'Tersedia pojok dongeng anak dan sesi bincang hangat seputar buku sastra terkini.',
          ],
        },
        {
          type: 'blockquote',
          text: 'Di lapak jalanan, kepercayaan adalah mata uang tertinggi. Membaca dan berbahagia bersama warga.',
        },
      ]),
    },
    {
      title: 'Kelas Menulis Cerita Warga: Mengarsip Ingatan Kampung',
      slug: 'kelas-menulis-cerita-warga-blora',
      type: EventType.KELAS,
      startAt: classDate,
      endAt: classDateEnd,
      locationName: 'Basecamp Perpustakaan Jalanan Blora',
      locationDetail: 'Jl. RA Kartini No. 14, Blora (Ruang Belajar Warga)',
      quota: 25,
      coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
      description: makeDoc([
        {
          type: 'paragraph',
          text: 'Setiap warga punya cerita yang patut dicatat. Kelas ini dirancang sebagai lokakarya interaktif untuk melatih kepekaan menulis esai personal, narasi sejarah lisan, dan sketsa kehidupan sehari-hari di Blora.',
        },
        { type: 'heading', level: 2, text: 'Materi Pembelajaran' },
        {
          type: 'bulletList',
          items: [
            'Menemukan sudut pandang unik dari peristiwa keseharian di pasar, sawah, atau balai RT.',
            'Teknik wawancara tetua kampung untuk merekam sejarah lisan yang belum terbukukan.',
            'Penyuntingan naskah mandiri sebelum diajukan ke Meja Kurasi Perpusjal Blora.',
          ],
        },
      ]),
    },
    {
      title: 'Nobar & Bedah Film Dokumenter: Jejak Hutan Jati dan Wong Samin',
      slug: 'nobar-bedah-film-dokumenter-hutan-jati-samin',
      type: EventType.NOBAR,
      startAt: nobarDate,
      endAt: nobarDateEnd,
      locationName: 'Pendopo Komunitas Samin Sedulur Sikep',
      locationDetail: 'Dusun Blimbing, Sambongrejo, Blora',
      quota: 40,
      coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      description: makeDoc([
        {
          type: 'paragraph',
          text: 'Pemutaran film dokumenter independen tentang relasi ekologis masyarakat Sedulur Sikep dengan hutan jati Blora, dilanjutkan diskusi terbuka bersama tetua adat dan peneliti sosial.',
        },
        {
          type: 'blockquote',
          text: 'Bumi ora didol, banyu ora dituku. Merawat kelestarian alam adalah mandat tertinggi nurani kemanusiaan.',
        },
      ]),
    },
  ];

  let primaryEventId = '';
  for (let idx = 0; idx < eventsData.length; idx++) {
    const ev = eventsData[idx];
    const createdEvent = await prisma.event.upsert({
      where: { slug: ev.slug },
      update: {
        title: ev.title,
        type: ev.type,
        startAt: ev.startAt,
        endAt: ev.endAt,
        locationName: ev.locationName,
        locationDetail: ev.locationDetail,
        mapUrl: ev.mapUrl,
        quota: ev.quota,
        coverImage: ev.coverImage,
        description: ev.description,
        status: EventStatus.OPEN,
      },
      create: {
        title: ev.title,
        slug: ev.slug,
        type: ev.type,
        startAt: ev.startAt,
        endAt: ev.endAt,
        locationName: ev.locationName,
        locationDetail: ev.locationDetail,
        mapUrl: ev.mapUrl,
        quota: ev.quota,
        coverImage: ev.coverImage,
        description: ev.description,
        organizerId: kurator.id,
        status: EventStatus.OPEN,
        isParticipantListPublic: true,
      },
    });

    if (idx === 0) primaryEventId = createdEvent.id;

    // Daftarkan warga sebagai partisipan contoh riil
    await prisma.eventRegistration.upsert({
      where: {
        eventId_userId: {
          eventId: createdEvent.id,
          userId: warga.id,
        },
      },
      update: {},
      create: {
        eventId: createdEvent.id,
        userId: warga.id,
        status: RegistrationStatus.REGISTERED,
        attendanceCode: `HDK${idx}7`,
        note: 'Hadir bersama keluarga.',
      },
    });
  }
  console.log(`   ✅ ${eventsData.length} Agenda Kegiatan Lapak & pendaftar riil berhasil disemai.`);

  // =========================================================================
  // 6. HALAMAN CMS RESMI DENGAN KONTEN TEKS LENGKAP & MENDALAM (PRISMA.PAGE)
  // =========================================================================
  console.log('📄 [6/7] Menyemai Halaman CMS Sistem dengan Teks Lengkap...');

  const pagesData = [
    {
      title: 'Tentang Perpustakaan Jalanan Blora',
      slug: 'tentang',
      isSystem: true,
      showInFooter: true,
      showInNav: true,
      order: 1,
      content: makeDoc([
        {
          type: 'paragraph',
          text: 'Perpustakaan Jalanan Blora (Perpusjal) adalah inisiatif swadaya warga independen yang lahir dari kegelisahan atas minimnya ruang perjumpaan literasi yang setara dan mudah diakses di Kabupaten Blora. Kami meyakini bahwa buku bukanlah benda keramat yang hanya pantas terkurung di rak perpustakaan formal berpendingin udara, melainkan sarana akal budi yang harus hadir langsung di tengah denyut kehidupan masyarakat.',
        },
        { type: 'heading', level: 2, text: 'Falsafah Gerakan Kami' },
        {
          type: 'paragraph',
          text: 'Gerakan ini berpijak pada prinsip keterbukaan murni: membaca gratis tanpa uang jaminan, meminjam buku tanpa pungutan biaya, dan berdiskusi tanpa sekat kelas sosial. Kepercayaan adalah mata uang tertinggi kami. Kami percaya bahwa rasa saling percaya antarwarga adalah modal sosial paling berharga untuk membangun peradaban yang merdeka dan bermartabat.',
        },
        { type: 'heading', level: 2, text: 'Ruang Lingkup dan Aktivitas' },
        {
          type: 'bulletList',
          items: [
            'Lapak Baca Trotoar: Menggelar terpal buku fisik setiap Minggu pagi di arena Car Free Day Alun-Alun Blora.',
            'Sirkulasi Pustaka Terbuka: Meminjamkan buku karya sastra, pemikiran sosial, sains populer, dan fabel anak secara daring maupun luring.',
            'Pojok Tulisan Warga: Menyediakan ruang kurasi publik bagi tulisan, esai refleksi, dan puisi karya warga lokal.',
            'Kelas Belajar & Nobar: Menyelenggarakan lokakarya menulis, bedah buku, dan pemutaran film dokumenter sejarah.',
          ],
        },
      ]),
    },
    {
      title: 'Cara Meminjam Buku',
      slug: 'cara-meminjam',
      isSystem: true,
      showInFooter: true,
      showInNav: true,
      order: 2,
      content: makeDoc([
        {
          type: 'paragraph',
          text: 'Meminjam buku di Perpustakaan Jalanan Blora dirancang seringkas mungkin agar tidak membebani warga dengan birokrasi berbelit. Kami menerapkan sistem sirkulasi berbasis saling percaya.',
        },
        { type: 'heading', level: 2, text: 'Empat Langkah Peminjaman Mandiri' },
        {
          type: 'bulletList',
          items: [
            '1. Telusuri Katalog: Buka rubrik /buku di website ini, pilih judul yang berlabel [TERSEDIA], lalu ajukan formulir peminjaman.',
            '2. Konfirmasi & Kode Ambil: Setelah diajukan, kamu akan memperoleh 6 digit kode pengambilan di dasbor akun wargamu.',
            '3. Temui Relawan di Lapak: Kunjungi lapak baca Minggu pagi CFD Alun-Alun Blora atau Basecamp Perpusjal, tunjukkan kode pengambilan untuk menerima buku fisik.',
            '4. Baca & Kembalikan Tepat Waktu: Durasi peminjaman standar adalah 7 hari kalender (dapat diperpanjang 1 kali). Kembalikan buku tepat waktu demi menjaga rotasi bagi pembaca lain.',
          ],
        },
        {
          type: 'blockquote',
          text: 'Tidak ada denda uang tunai bila terlambat. Namun, disiplin mengembalikan buku adalah wujud penghormatan kita pada sesama kawan pembaca.',
        },
      ]),
    },
    {
      title: 'Sejarah Komunitas',
      slug: 'sejarah',
      isSystem: true,
      showInFooter: true,
      showInNav: false,
      order: 3,
      content: makeDoc([
        {
          type: 'paragraph',
          text: 'Perjalanan Perpustakaan Jalanan Blora bermula pada pertengahan 2017 ketika beberapa anak muda membawa satu kardus berisi 30 buku milik pribadi ke bawah naungan pohon trembesi Alun-Alun Blora. Bermodalkan selembar terpal lusuh, ruang baca terbuka itu mulai menarik rasa penasaran warga yang tengah berolahraga pagi.',
        },
        {
          type: 'paragraph',
          text: 'Terinspirasi dari napas sastra perlawanan Pramoedya Ananta Toer—putra tanah Blora yang karyanya mendunia—komunitas ini menolak tunduk pada anggapan bahwa minat baca masyarakat pedesaan itu rendah. Hambatan utamanya bukanlah minat, melainkan ketiadaan akses fisik terhadap bacaan yang bermutu.',
        },
        {
          type: 'paragraph',
          text: 'Hingga kini, ratusan kawan relawan, donatur buku dari berbagai kota, dan warga setempat silih berganti merawat lapak ini. Perpusjal membuktikan bahwa gerakan literasi akar rumput dapat bertahan bertahun-tahun berkat gotong royong tanpa sponsor korporasi maupun dana politik.',
        },
      ]),
    },
    {
      title: 'Jadwal Lapak & Basecamp',
      slug: 'jadwal-lapak',
      isSystem: true,
      showInFooter: true,
      showInNav: true,
      order: 4,
      content: makeDoc([
        {
          type: 'paragraph',
          text: 'Kamu dapat berjumpa langsung dengan para pengurus terpal dan meminjam buku fisik pada jadwal tetap berikut:',
        },
        { type: 'heading', level: 2, text: '1. Lapak Baca Car Free Day (CFD)' },
        {
          type: 'bulletList',
          items: [
            'Hari & Jam: Setiap Minggu Pagi, pukul 06.00 – 09.30 WIB.',
            'Lokasi: Alun-Alun Blora (Sisi Timur Depan Pendopo Kabupaten Blora).',
            'Fasilitas: Hamparan terpal lesehan baca gratis, peminjaman buku, dan pendaftaran kartu warga di tempat.',
          ],
        },
        { type: 'heading', level: 2, text: '2. Sekretariat & Basecamp Komunitas' },
        {
          type: 'bulletList',
          items: [
            'Hari & Jam: Setiap Hari Kerja, pukul 16.00 – 21.00 WIB.',
            'Lokasi: Jl. RA Kartini No. 14, Blora (Basecamp Perpusjal).',
            'Fasilitas: Akses rak arsip utama, drop box donasi buku, dan ruang diskusi naskah warga.',
          ],
        },
      ]),
    },
    {
      title: 'Kontak & Sekretariat',
      slug: 'kontak',
      isSystem: true,
      showInFooter: true,
      showInNav: true,
      order: 5,
      content: makeDoc([
        {
          type: 'paragraph',
          text: 'Pintu sekretariat Perpustakaan Jalanan Blora senantiasa terbuka untuk titip hibah buku, kolaborasi riset sejarah lokal, atau sekadar berbagi seduhan kopi di sore hari.',
        },
        {
          type: 'bulletList',
          items: [
            'Alamat: Jl. RA Kartini No. 14, Blora, Jawa Tengah 58219',
            'Surel Resmi: halo@perpusjal.org / kurator@perpusjal.org',
            'Instagram: @perpusjalblora',
            'WhatsApp Pengurus Lapak: +62 812-3456-7890',
          ],
        },
      ]),
    },
    {
      title: 'Pertanyaan Umum (FAQ)',
      slug: 'faq',
      isSystem: true,
      showInFooter: true,
      showInNav: false,
      order: 6,
      content: makeDoc([
        { type: 'heading', level: 2, text: 'Apakah harus membayar iuran keanggotaan?' },
        { type: 'paragraph', text: 'Tidak ada biaya apa pun seumur hidup. Akses baca di lapak maupun peminjaman buku fisik 100% gratis.' },
        { type: 'heading', level: 2, text: 'Bagaimana jika buku yang dipinjam tidak sengaja rusak atau hilang?' },
        { type: 'paragraph', text: 'Segera temui pengurus lapak secara jujur. Kami tidak menerapkan denda uang. Penyelesaian dilakukan secara kekeluargaan, misalnya mengganti dengan buku bacaan sejenis bila memungkinkan.' },
        { type: 'heading', level: 2, text: 'Bagaimana cara menyumbangkan buku?' },
        { type: 'paragraph', text: 'Kamu bisa membawa buku langsung ke lapak CFD Minggu pagi atau mengirimkannya ke alamat sekretariat kami. Seluruh buku yang masuk akan dicatat inventarisnya secara transparan.' },
      ]),
    },
    {
      title: 'Ketentuan Layanan',
      slug: 'ketentuan',
      isSystem: true,
      showInFooter: true,
      showInNav: false,
      order: 7,
      content: makeDoc([
        {
          type: 'paragraph',
          text: 'Dengan menggunakan layanan situs web dan perpustakaan fisik Perpusjal Blora, kamu sepakat untuk menjaga amanah buku pinjaman, berpartisipasi dalam diskusi publik dengan santun dan beretika, serta tidak menyebarkan plagiarisme atau ujaran kebencian.',
        },
      ]),
    },
    {
      title: 'Kebijakan Privasi',
      slug: 'kebijakan-privasi',
      isSystem: true,
      showInFooter: true,
      showInNav: false,
      order: 8,
      content: makeDoc([
        {
          type: 'paragraph',
          text: 'Kami sangat menghormati privasi warga. Data nomor ponsel dan surel yang kamu daftarkan semata-mata digunakan untuk notifikasi sirkulasi buku dan pengingat jadwal lapak, serta tidak akan pernah dijual atau dialihkan kepada pihak ketiga komersial mana pun.',
        },
      ]),
    },
  ];

  for (const page of pagesData) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        isPublished: true,
        isSystem: page.isSystem,
        showInFooter: page.showInFooter,
        showInNav: page.showInNav,
        order: page.order,
      },
      create: {
        title: page.title,
        slug: page.slug,
        content: page.content,
        isPublished: true,
        isSystem: page.isSystem,
        showInFooter: page.showInFooter,
        showInNav: page.showInNav,
        order: page.order,
      },
    });
  }
  console.log(`   ✅ ${pagesData.length} Halaman CMS Sistem berhasil disemai.`);

  // =========================================================================
  // 7. ARTIKEL WARGA RESMI & SURAT PEMBACA RIIL
  // =========================================================================
  console.log('✍️ [7/7] Menyemai Artikel Publikasi & Surat Pembaca Riil...');

  const sampleArticles = [
    {
      title: 'Manifesto Lapak Alun-Alun: Mengembalikan Buku ke Ruang Terbuka',
      slug: 'manifesto-lapak-alun-alun',
      subtitle: 'Catatan perjalanan komunitas di bawah teduh pohon trembesi Alun-Alun Blora setiap Minggu pagi.',
      excerpt: 'Kami mengembalikan buku ke tempat ia seharusnya bermula: di tengah kerumunan warga, di bawah teduh pohon trembesi alun-alun, dan di ruang-ruang terbuka tempat percakapan merdeka dirawat tanpa sekat kelas sosial.',
      content: makeDoc([
        {
          type: 'paragraph',
          text: 'Buku seringkali diperlakukan bagai benda keramat yang hanya pantas berdiam di rak-rak berdebu perpustakaan berpendingin udara. Bagi kami di Perpustakaan Jalanan Blora, buku adalah senjata akal budi yang harus menyatu dengan denyut nadi masyarakat. Setiap Minggu pagi di car free day Alun-Alun Blora, terpal sederhana digelar, ratusan buku ditata rapi, dan ruang baca gratis dibuka untuk siapa saja.',
        },
        { type: 'heading', level: 2, text: 'Literasi Tanpa Sekat Kelas' },
        {
          type: 'paragraph',
          text: 'Di lapak jalanan, tidak ada kartu anggota berkartu cip yang merepotkan, tidak ada biaya administrasi tersembunyi, dan tidak ada ancaman denda uang tunai bila buku terlambat dikembalikan. Kepercayaan adalah mata uang tertinggi kami. Saat seorang anak penjual koran duduk bersila di samping seorang guru sekolah membaca komik dan novel yang sama, di sanalah kebahagiaan literasi yang hakiki hadir.',
        },
        {
          type: 'blockquote',
          text: 'Membaca bukan sekadar melahap aksara di atas kertas, melainkan jalan pulang bagi nurani yang merdeka.',
        },
      ]),
      plainText: 'Buku seringkali diperlakukan bagai benda keramat yang hanya pantas berdiam di rak-rak berdebu perpustakaan berpendingin udara...',
      categorySlug: 'suara-lapak',
      authorId: admin.id,
      isFeatured: true,
      readingTime: 4,
      wordCount: 520,
      publishedAt: new Date('2026-09-15T08:00:00Z'),
    },
    {
      title: 'Menelusuri Jejak Sastra Pramoedya di Tanah Kelahirannya',
      slug: 'menelusuri-jejak-sastra-pramoedya-di-blora',
      subtitle: 'Refleksi atas Tetralogi Buru dan napas perlawanan yang mengalir dari tanah cadas Blora.',
      excerpt: 'Membicarakan sastra Indonesia modern tanpa menyebut Blora adalah kemustahilan. Dari tanah berkapur inilah lahir seorang juru warta bangsa yang aksaranya menembus dinding-dinding penjara.',
      content: makeDoc([
        {
          type: 'paragraph',
          text: 'Membicarakan sastra Indonesia modern tanpa menyebut Blora adalah kemustahilan sejarah. Di tepi Kali Lusi, di bawah naungan pohon jati yang tegar, Pramoedya Ananta Toer lahir dan menyerap kepedihan serta ketabahan rakyat jelata. Realisme sosialis yang ditulisnya bukan sekadar teori sastra eropa, melainkan jerit kemanusiaan yang disaksikannya sendiri.',
        },
        { type: 'heading', level: 2, text: 'Aksara yang Tak Pernah Padam' },
        {
          type: 'paragraph',
          text: 'Koleksi karya-karya Pram di Perpustakaan Jalanan Blora menjadi salah satu rak yang paling sering dijamah oleh anak-anak muda. Dari Bumi Manusia hingga Gadis Pantai, pembaca diajak mengasah nalar kritis dan keberanian menolak segala bentuk penindasan martabat kemanusiaan.',
        },
      ]),
      plainText: 'Membicarakan sastra Indonesia modern tanpa menyebut Blora adalah kemustahilan sejarah...',
      categorySlug: 'sejarah',
      authorId: penulisBudi.id,
      isFeatured: false,
      readingTime: 6,
      wordCount: 780,
      publishedAt: new Date('2026-09-18T10:30:00Z'),
    },
    {
      title: 'Ajaran Samin Surosentiko: Etika Kejujuran dan Kerukunan Hidup',
      slug: 'ajaran-samin-etika-kejujuran-blora',
      subtitle: 'Memaknai kembali ajaran Sedulur Sikep di tengah hiruk-pikuk disrupsi informasi zaman sekarang.',
      excerpt: 'Bagi masyarakat Sedulur Sikep, berbicara jujur (bener), bertindak tidak merugikan orang lain (kepenak), dan menjaga kelestarian bumi adalah sendi-sendi utama peradaban.',
      content: makeDoc([
        {
          type: 'paragraph',
          text: 'Jauh sebelum konsep pembangkangan sipil tanpa kekerasan (civil disobedience) dipopulerkan oleh Mahatma Gandhi, masyarakat pedalaman Blora telah mempraktikkannya melalui perlawanan kultural Samin Surosentiko terhadap penjarahan hutan oleh penjajahan kolonial Belanda.',
        },
        {
          type: 'paragraph',
          text: 'Etika Samin bukan sekadar menolak pajak kolonial, melainkan komitmen moral mutlak terhadap kebenaran kata dan perbuatan. Di tengah era disrupsi saat hoaks merajalela, etika Sedulur Sikep ini menjadi cermin jernih bagi literasi kita.',
        },
      ]),
      plainText: 'Jauh sebelum konsep pembangkangan sipil tanpa kekerasan dipopulerkan oleh Mahatma Gandhi...',
      categorySlug: 'budaya',
      authorId: penulisAnita.id,
      isFeatured: false,
      readingTime: 5,
      wordCount: 610,
      publishedAt: new Date('2026-09-20T14:15:00Z'),
    },
  ];

  for (const art of sampleArticles) {
    const categoryId = categoryMap.get(art.categorySlug) || categoryMap.get('sastra')!;
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        subtitle: art.subtitle,
        excerpt: art.excerpt,
        content: art.content,
        plainText: art.plainText,
        categoryId,
        status: 'PUBLISHED',
        isFeatured: art.isFeatured,
      },
      create: {
        title: art.title,
        slug: art.slug,
        subtitle: art.subtitle,
        excerpt: art.excerpt,
        content: art.content,
        plainText: art.plainText,
        categoryId,
        authorId: art.authorId,
        status: 'PUBLISHED',
        isFeatured: art.isFeatured,
        readingTime: art.readingTime,
        wordCount: art.wordCount,
        publishedAt: art.publishedAt,
      },
    });
  }

  // Semai Surat Pembaca Riil
  const lettersData = [
    {
      title: 'Apresiasi untuk Lapak CFD Alun-Alun: Mohon Perbanyak Buku Dongeng Bergambar Anak',
      slug: 'apresiasi-lapak-cfd-perbanyak-buku-anak',
      displayName: 'Siti Rahayu',
      isAnonymous: false,
      content: 'Minggu lalu saya mengajak kedua anak saya berkunjung ke Lapak Baca Perpusjal di CFD Alun-Alun Blora. Sungguh membahagiakan melihat anak-anak duduk melingkar dengan antusias membolak-balik halaman buku. Catatan kecil kami, mohon ditambah koleksi fabel bergambar dan dongeng nusantara agar anak-anak usia dini semakin betah membaca. Terima kasih banyak atas dedikasi rekan-rekan relawan!',
      status: LetterStatus.PUBLISHED,
      authorId: warga.id,
      publishedAt: new Date('2026-09-25T10:00:00Z'),
    },
    {
      title: 'Usulan Kotak Buku Bergilir untuk Balai RT di Pelosok Desa',
      slug: 'usulan-kotak-buku-bergilir-balai-rt',
      displayName: 'Warga Peduli Kunduran',
      isAnonymous: true,
      content: 'Kami warga yang tinggal di kecamatan yang agak jauh dari pusat kota Blora sangat mendambakan akses bacaan serupa. Bagaimana bila Perpusjal merintis program Kotak Buku Bergilir yang dititipkan di balai desa atau pos ronda karang taruna? Semoga bisa menjadi pertimbangan rekan-rekan pengurus.',
      status: LetterStatus.PUBLISHED,
      authorId: penulisBudi.id,
      publishedAt: new Date('2026-09-28T14:00:00Z'),
    },
  ];

  for (const l of lettersData) {
    await prisma.readerLetter.upsert({
      where: { slug: l.slug },
      update: {
        title: l.title,
        content: l.content,
        status: l.status,
        publishedAt: l.publishedAt,
      },
      create: {
        title: l.title,
        slug: l.slug,
        content: l.content,
        displayName: l.displayName,
        isAnonymous: l.isAnonymous,
        status: l.status,
        authorId: l.authorId,
        publishedAt: l.publishedAt,
      },
    });
  }

  // System Settings (termasuk pointer ke Featured Event di Landing Page)
  const systemSettings = [
    { key: 'loan.maxActive', value: 2, description: 'Maksimal peminjaman aktif per pengguna' },
    { key: 'loan.durationDays', value: 7, description: 'Durasi peminjaman standar (hari)' },
    { key: 'loan.maxExtension', value: 1, description: 'Batas maksimal perpanjangan pinjaman' },
    { key: 'loan.extensionDays', value: 7, description: 'Durasi perpanjangan (hari)' },
    { key: 'loan.pickupDeadlineDays', value: 3, description: 'Batas waktu pengambilan setelah disetujui' },
    {
      key: 'lapak.schedule',
      value: [
        { day: 'Minggu', time: '06.00 - 09.30 WIB', location: 'Alun-Alun Blora (Car Free Day)' },
        { day: 'Setiap Hari', time: '16.00 - 21.00 WIB', location: 'Basecamp Perpusjal Blora' },
      ],
      description: 'Jadwal tetap lapak baca dan serah terima buku fisik',
    },
    {
      key: 'landing.featuredEvent',
      value: {
        isActive: true,
        eventId: primaryEventId,
        customBadge: 'AGENDA RESMI MINGGU INI',
        customLead: 'Mari bersila di bawah teduh pohon trembesi Alun-Alun Blora. Baca ratusan buku gratis, temukan kawan baru, dan pinjam buku tanpa uang jaminan.',
        showCountdown: true,
      },
      description: 'Konfigurasi sorotan event akbar di beranda publik',
    },
  ];

  for (const s of systemSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('\n======================================================');
  console.log('🎉 SEEDING SELESAI DENGAN SUKSES & 100% IDEMPOTENT!');
  console.log('   👤 Akun Admin     : admin@perpusjal.org (Pass: AdminPerpusjal2026!)');
  console.log('   👤 Akun Kurator   : kurator@perpusjal.org (Pass: KuratorPerpusjal2026!)');
  console.log('   👤 Akun Warga     : warga@perpusjal.org (Pass: WargaPerpusjal2026!)');
  console.log(`   📚 Pustaka        : ${booksData.length} Judul Buku & ${totalCopiesSeeded} Eksemplar Fisik`);
  console.log(`   🎪 Agenda Kegiatan: ${eventsData.length} Event Aktif (CFD, Kelas, Nobar)`);
  console.log(`   📄 CMS Pages      : ${pagesData.length} Halaman Lengkap`);
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
