import { PrismaClient, Role, UserStatus, TrustLevel, CategoryType, BadgeCriteria } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Perpusjal v3 Database Seeding...');

  // 1. Admin User
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@perpusjal.org';
  const adminUsername = process.env.ADMIN_INITIAL_USERNAME || 'admin';
  const adminName = process.env.ADMIN_INITIAL_NAME || 'Pengurus Perpusjal Blora';
  const adminRawPassword = process.env.ADMIN_INITIAL_PASSWORD || 'AdminPerpusjal2026!';
  const passwordHash = await bcrypt.hash(adminRawPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      username: adminUsername,
      name: adminName,
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL2,
      emailVerifiedAt: new Date(),
      bio: 'Akun administratif resmi Perpustakaan Jalanan Blora.',
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email} (${admin.username})`);

  // 2. 9 Categories
  const categories = [
    { name: 'Sastra', slug: 'sastra', description: 'Karya sastra, puisi, cerpen, novel, dan kritik sastra.' },
    { name: 'Pendidikan', slug: 'pendidikan', description: 'Dunia pendidikan, pedagogi, dan pengembangan ilmu.' },
    { name: 'Sosial', slug: 'sosial', description: 'Isu sosial kemasyarakatan, dinamika warga, dan opini publik.' },
    { name: 'Budaya', slug: 'budaya', description: 'Kekayaan budaya lokal Blora, tradisi Nusantara, dan seni.' },
    { name: 'Lingkungan', slug: 'lingkungan', description: 'Ekologi, kelestarian alam hutan jati, dan bumi.' },
    { name: 'Sejarah', slug: 'sejarah', description: 'Sejarah lokal Blora, tokoh Samin, Pramoedya, dan sejarah umum.' },
    { name: 'Anak', slug: 'anak', description: 'Bacaan ramah anak, dongeng, dan literasi usia dini.' },
    { name: 'Fiksi', slug: 'fiksi', description: 'Koleksi cerita imajinatif, fiksi ilmiah, roman, dan misteri.' },
    { name: 'Non-Fiksi', slug: 'non-fiksi', description: 'Biografi, esai pemikiran, sains populer, dan sejarah.' },
  ];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        type: CategoryType.BOTH,
        order: i + 1,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${categories.length} Categories seeded.`);

  // 3. 12 Badges (PRD §17.1)
  const badges = [
    { code: 'PEMBACA_PERTAMA', name: 'Pembaca Pertama', description: 'Membaca 1 artikel tuntas.', iconName: 'Sprout', criteriaType: BadgeCriteria.ARTICLES_READ, criteriaValue: 1, order: 1 },
    { code: 'PEMBACA_AKTIF', name: 'Pembaca Aktif', description: 'Membaca 10 artikel tuntas.', iconName: 'BookOpen', criteriaType: BadgeCriteria.ARTICLES_READ, criteriaValue: 10, order: 2 },
    { code: 'KUTU_BUKU', name: 'Kutu Buku', description: 'Membaca 50 artikel tuntas.', iconName: 'Glasses', criteriaType: BadgeCriteria.ARTICLES_READ, criteriaValue: 50, order: 3 },
    { code: 'PENULIS_PERTAMA', name: 'Penulis Pertama', description: '1 artikel diterbitkan di blog.', iconName: 'Feather', criteriaType: BadgeCriteria.ARTICLES_PUBLISHED, criteriaValue: 1, order: 4 },
    { code: 'KONTRIBUTOR', name: 'Kontributor', description: '5 artikel diterbitkan di blog.', iconName: 'PenTool', criteriaType: BadgeCriteria.ARTICLES_PUBLISHED, criteriaValue: 5, order: 5 },
    { code: 'KOLUMNIS', name: 'Kolumnis', description: '15 artikel diterbitkan di blog.', iconName: 'Newspaper', criteriaType: BadgeCriteria.ARTICLES_PUBLISHED, criteriaValue: 15, order: 6 },
    { code: 'TEMAN_DISKUSI', name: 'Teman Diskusi', description: '10 komentar diterbitkan.', iconName: 'MessageSquare', criteriaType: BadgeCriteria.COMMENTS_PUBLISHED, criteriaValue: 10, order: 7 },
    { code: 'PENGGERAK_LITERASI', name: 'Penggerak Literasi', description: 'Hadir di 3 kegiatan komunitas.', iconName: 'Flame', criteriaType: BadgeCriteria.EVENTS_ATTENDED, criteriaValue: 3, order: 8 },
    { code: 'BOOK_EXPLORER', name: 'Book Explorer', description: 'Menyelesaikan 5 peminjaman buku.', iconName: 'Compass', criteriaType: BadgeCriteria.LOANS_RETURNED, criteriaValue: 5, order: 9 },
    { code: 'PENJAGA_AMANAH', name: 'Penjaga Amanah', description: '10 peminjaman berturut-turut tepat waktu.', iconName: 'ShieldCheck', criteriaType: BadgeCriteria.ONTIME_STREAK, criteriaValue: 10, order: 10 },
    { code: 'SAHABAT_LAPAK', name: 'Sahabat Lapak', description: 'Bergabung minimal 1 tahun dan aktif berkegiatan.', iconName: 'HeartHandshake', criteriaType: BadgeCriteria.ACCOUNT_AGE_DAYS, criteriaValue: 365, order: 11 },
    { code: 'DONATUR_BUKU', name: 'Donatur Buku', description: 'Menghibahkan buku untuk koleksi komunitas.', iconName: 'Gift', criteriaType: BadgeCriteria.MANUAL, criteriaValue: 1, order: 12 },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: {},
      create: b,
    });
  }
  console.log(`✅ ${badges.length} Badges seeded.`);

  // 4. CMS Pages
  const pages = [
    { title: 'Tentang Perpusjal', slug: 'tentang', showInFooter: true, showInNav: true, isSystem: true },
    { title: 'Sejarah Komunitas', slug: 'sejarah', showInFooter: true, showInNav: false, isSystem: true },
    { title: 'Kontak & Sekretariat', slug: 'kontak', showInFooter: true, showInNav: true, isSystem: true },
    { title: 'Cara Meminjam Buku', slug: 'cara-meminjam', showInFooter: true, showInNav: true, isSystem: true },
    { title: 'Pertanyaan Umum (FAQ)', slug: 'faq', showInFooter: true, showInNav: false, isSystem: true },
    { title: 'Ketentuan Layanan', slug: 'ketentuan', showInFooter: true, showInNav: false, isSystem: true },
    { title: 'Kebijakan Privasi', slug: 'kebijakan-privasi', showInFooter: true, showInNav: false, isSystem: true },
    { title: 'Jadwal Lapak', slug: 'jadwal-lapak', showInFooter: true, showInNav: true, isSystem: true },
  ];

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: `Halaman ${p.title} sedang disiapkan oleh pengurus.` }] }] },
        isPublished: true,
        isSystem: p.isSystem,
        showInFooter: p.showInFooter,
        showInNav: p.showInNav,
        order: i + 1,
      },
    });
  }
  console.log(`✅ ${pages.length} CMS Pages seeded.`);

  // 5. System Settings
  const settings = [
    { key: 'loan.maxActive', value: 2, description: 'Maksimal peminjaman aktif per pengguna' },
    { key: 'loan.durationDays', value: 7, description: 'Durasi peminjaman standar (hari)' },
    { key: 'loan.maxExtension', value: 1, description: 'Batas maksimal perpanjangan' },
    { key: 'loan.extensionDays', value: 7, description: 'Durasi perpanjangan (hari)' },
    { key: 'loan.pickupDeadlineDays', value: 3, description: 'Batas waktu pengambilan setelah disetujui (hari)' },
    { key: 'comment.rateLimit', value: { maxCount: 5, windowMinutes: 10 }, description: 'Batas frekuensi komentar' },
    { key: 'curation.slaDays', value: 7, description: 'SLA target kurasi artikel (hari)' },
    {
      key: 'lapak.schedule',
      value: [
        { day: 'Minggu', time: '06.00 - 09.00 WIB', location: 'Alun-Alun Blora (Car Free Day)' },
        { day: 'Setiap Hari', time: '16.00 - 21.00 WIB', location: 'Basecamp Perpusjal Blora' },
      ],
      description: 'Jadwal tetap lapak baca dan serah terima buku',
    },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  // 6. Sample Articles for Editorial Gazette (PRD §9)
  const sastraCat = await prisma.category.findUnique({ where: { slug: 'sastra' } });
  const sejarahCat = await prisma.category.findUnique({ where: { slug: 'sejarah' } });
  const sosialCat = await prisma.category.findUnique({ where: { slug: 'sosial' } });

  const sampleArticles = [
    {
      title: 'Manifesto Lapak Alun-Alun: Mengembalikan Buku ke Ruang Terbuka',
      slug: 'manifesto-lapak-alun-alun',
      subtitle: 'Catatan perjalanan komunitas di bawah teduh pohon trembesi Alun-Alun Blora setiap Minggu pagi.',
      excerpt: 'Kami mengembalikan buku ke tempat ia seharusnya bermula: di tengah kerumunan warga, di bawah teduh pohon trembesi alun-alun, dan di ruang-ruang terbuka tempat percakapan merdeka dirawat tanpa sekat kelas sosial.',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Buku seringkali diperlakukan bagai benda keramat yang hanya pantas berdiam di rak-rak berdebu perpustakaan berpendingin udara. Bagi kami di Perpustakaan Jalanan Blora, buku adalah senjata akal budi yang harus menyatu dengan denyut nadi masyarakat. Setiap Minggu pagi di car free day Alun-Alun Blora, terpal sederhana digelar, ratusan buku ditata rapi, dan ruang baca gratis dibuka untuk siapa saja.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Literasi Tanpa Sekat Kelas' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Di lapak jalanan, tidak ada kartu anggota berkartu cip yang merepotkan, tidak ada biaya administrasi tersembunyi, dan tidak ada ancaman denda uang tunai bila buku terlambat dikembalikan. Kepercayaan adalah mata uang tertinggi kami. Saat seorang anak penjual koran duduk bersila di samping seorang guru sekolah membaca komik dan novel yang sama, di sanalah kebahagiaan literasi yang hakiki hadir.',
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
                    text: 'Membaca bukan sekadar melahap aksara di atas kertas, melainkan jalan pulang bagi nurani yang merdeka.',
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
                text: 'Gerakan ini adalah swadaya murni. Buku-buku yang kami sediakan berasal dari sumbangan warga, iuran pegiat, dan titipan kawan-kawan yang percaya bahwa Blora berhak atas akses ilmu pengetahuan yang setara dan bermartabat.',
              },
            ],
          },
        ],
      },
      plainText: 'Buku seringkali diperlakukan bagai benda keramat...',
      categoryId: sosialCat?.id || categories[0].slug,
      isFeatured: true,
      readingTime: 4,
      wordCount: 520,
      viewCount: 142,
      publishedAt: new Date('2026-09-15T08:00:00Z'),
    },
    {
      title: 'Menelusuri Jejak Sastra Pramoedya di Tanah Kelahirannya',
      slug: 'menelusuri-jejak-sastra-pramoedya-di-blora',
      subtitle: 'Refleksi atas Tetralogi Buru dan napas perlawanan yang mengalir dari tanah cadas Blora.',
      excerpt: 'Membicarakan sastra Indonesia modern tanpa menyebut Blora adalah kemustahilan. Dari tanah berkapur inilah lahir seorang juru warta bangsa yang aksaranya menembus dinding-dinding penjara.',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Membicarakan sastra Indonesia modern tanpa menyebut Blora adalah kemustahilan sejarah. Di tepi Kali Lusi, di bawah naungan pohon jati yang tegar, Pramoedya Ananta Toer lahir dan menyerap kepedihan serta ketabahan rakyat jelata. Realisme sosialis yang ditulisnya bukan sekadar teori sastra eropa, melainkan jerit kemanusiaan yang disaksikannya sendiri.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Aksara yang Tak Pernah Padam' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Koleksi karya-karya Pram di Perpustakaan Jalanan Blora menjadi salah satu rak yang paling sering dijamah oleh anak-anak muda. Dari Bumi Manusia hingga Bukan Pasar Malam, pembaca diajak mengasah nalar kritis dan keberanian menolak segala bentuk penindasan martabat kemanusiaan.',
              },
            ],
          },
        ],
      },
      plainText: 'Membicarakan sastra Indonesia modern tanpa menyebut Blora...',
      categoryId: sastraCat?.id || categories[0].slug,
      isFeatured: false,
      readingTime: 6,
      wordCount: 780,
      viewCount: 289,
      publishedAt: new Date('2026-09-18T10:30:00Z'),
    },
    {
      title: 'Ajaran Samin Surosentiko: Etika Kejujuran dan Kerukunan Hidup',
      slug: 'ajaran-samin-etika-kejujuran-blora',
      subtitle: 'Memaknai kembali ajaran Sedulur Sikep di tengah hiruk-pikuk disrupsi informasi zaman sekarang.',
      excerpt: 'Bagi masyarakat Sedulur Sikep, berbicara jujur (bener), bertindak tidak merugikan orang lain (kepenak), dan menjaga kelestarian bumi adalah sendi-sendi utama peradaban.',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Jauh sebelum konsep pembangkangan sipil tanpa kekerasan (civil disobedience) dipopulerkan oleh Mahatma Gandhi, masyarakat pedalaman Blora telah mempraktikkannya melalui perlawanan kultural Samin Surosentiko terhadap penjajahan kolonial Belanda.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Etika Samin bukan sekadar menolak pajak kolonial, melainkan komitmen moral mutlak terhadap kebenaran kata dan perbuatan. Di tengah era pasca-kebenaran saat hoaks dan kepalsuan merajalela, etika Sedulur Sikep ini menjadi cermin jernih bagi literasi kita.',
              },
            ],
          },
        ],
      },
      plainText: 'Jauh sebelum konsep pembangkangan sipil...',
      categoryId: sejarahCat?.id || categories[0].slug,
      isFeatured: false,
      readingTime: 5,
      wordCount: 610,
      viewCount: 98,
      publishedAt: new Date('2026-09-20T14:15:00Z'),
    },
  ];

  for (const art of sampleArticles) {
    if (art.categoryId) {
      await prisma.article.upsert({
        where: { slug: art.slug },
        update: {},
        create: {
          title: art.title,
          slug: art.slug,
          subtitle: art.subtitle,
          excerpt: art.excerpt,
          content: art.content,
          plainText: art.plainText,
          categoryId: art.categoryId,
          authorId: admin.id,
          status: 'PUBLISHED',
          isFeatured: art.isFeatured,
          readingTime: art.readingTime,
          wordCount: art.wordCount,
          viewCount: art.viewCount,
          publishedAt: art.publishedAt,
        },
      });
    }
  }
  console.log(`✅ ${sampleArticles.length} Sample articles seeded.`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
