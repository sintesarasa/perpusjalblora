import { PrismaClient, Role, UserStatus, TrustLevel, ArticleStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Menyemai naskah tulisan warga untuk uji coba Meja Kurasi...');

  const passwordHash = await bcrypt.hash('WargaBlora2026!', 10);

  // 1. Pastikan kategori tersedia
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.error('❌ Kategori belum ada di database. Harap jalankan prisma db seed terlebih dahulu.');
    return;
  }

  const findCat = (slug: string) => categories.find((c) => c.slug === slug) || categories[0];

  // 2. Buat atau perbarui akun warga (penulis)
  const authorsData = [
    {
      email: 'budi.santoso@warga.id',
      username: 'budi_santoso',
      name: 'Budi Santoso',
      bio: 'Pencinta sejarah lokal Blora dan pegiat ruang publik kota.',
    },
    {
      email: 'anita.puspita@warga.id',
      username: 'anita_literasi',
      name: 'Anita Puspita Dewi',
      bio: 'Guru madrasah di Blora yang aktif mendongeng untuk anak-anak.',
    },
    {
      email: 'dimas.prasetyo@warga.id',
      username: 'dimas_cepu',
      name: 'Dimas Prasetyo',
      bio: 'Pemerhati warisan industri perminyakan dan sejarah lori kayu jati Cepu.',
    },
    {
      email: 'kartika.wulan@warga.id',
      username: 'kartika_wulan',
      name: 'Kartika Wulandari',
      bio: 'Penulis lepas dan penikmat kuliner tradisional pedesaan Jawa.',
    },
  ];

  const authors: Record<string, any> = {};

  for (const a of authorsData) {
    const user = await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: {
        email: a.email,
        username: a.username,
        name: a.name,
        passwordHash,
        role: Role.USER,
        status: UserStatus.ACTIVE,
        trustLevel: TrustLevel.TL1,
        emailVerifiedAt: new Date(),
        bio: a.bio,
      },
    });
    authors[a.username] = user;
    console.log(`✅ Penulis siap: ${user.name} (@${user.username})`);
  }

  // 3. Buat naskah-naskah warga untuk antrean kurasi
  const dummyManuscripts = [
    {
      title: 'Merawat Ingatan di Bawah Pohon Trembesi: Menatap Masa Depan Ruang Publik Blora',
      slug: 'merawat-ingatan-di-bawah-pohon-trembesi-blora',
      subtitle: 'Refleksi atas pentingnya menjaga ruang perjumpaan warga di pusat kota dari serbuan komersialisasi.',
      excerpt: 'Ruang publik bukan sekadar hamparan rumput atau bangku taman, melainkan tempat di mana ingatan bersama dirawat, kesetaraan dipraktikkan, dan percakapan antarwarga terjadi secara leluasa tanpa dipungut biaya.',
      plainText: 'Ruang publik bukan sekadar hamparan rumput atau bangku taman. Di Blora, pohon-pohon trembesi tua di sekeliling alun-alun telah menjadi saksi bisu berbagai pergulatan zaman...',
      authorUsername: 'budi_santoso',
      categorySlug: 'sosial',
      status: ArticleStatus.PENDING_REVIEW,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 hari lalu
      readingTime: 4,
      wordCount: 520,
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Ruang publik bukan sekadar hamparan rumput atau bangku taman. Di Blora, pohon-pohon trembesi tua di sekeliling alun-alun telah menjadi saksi bisu berbagai pergulatan zaman—dari masa kolonial hingga era digital saat ini. Ketika Minggu pagi tiba dan kendaraan bermotor dilarang melintas, kita melihat denyut kehidupan kota yang paling murni: anak-anak bermain sepatu roda, para lansia berjalan kaki, dan lapak buku jalanan dibuka beralaskan terpal sederhana.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Ancaman Komersialisasi Ruang Terbuka' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Namun akhir-akhir ini, kita menyaksikan kecenderungan di mana ruang-ruang terbuka publik semakin terdesak oleh kepentingan komersial yang eksklusif. Menghabiskan waktu santai seolah harus selalu diiringi transaksi pembelian kopi atau makanan cepat saji. Padahal, hakikat ruang publik adalah demokratis dan inklusif: siapa saja berhak hadir tanpa perlu merasa rendah diri karena isi dompetnya.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Keberadaan inisiatif seperti Perpustakaan Jalanan Blora memberikan oase tersendiri. Membaca buku bersama di bawah rimbunnya dedaunan mengajarkan kita bahwa kekayaan sejati sebuah kota bukanlah megahnya pusat perbelanjaan, melainkan tingginya rasa saling percaya dan kepedulian antarwarga.',
              },
            ],
          },
        ],
      },
    },
    {
      title: 'Mengapa Anak-Anak Desa Perlu Mengenal Dongeng Sebelum Tidur di Era Gawai',
      slug: 'mengapa-anak-desa-perlu-dongeng-sebelum-tidur',
      subtitle: 'Menghidupkan kembali tradisi lisan pengantar tidur yang kian tergerus oleh layar ponsel cerdas.',
      excerpt: 'Mendongeng bukan semata tentang membuat anak lekas terlelap, melainkan jembatan emosional dan penyemai imajinasi yang tak tergantikan oleh video berdurasi 30 detik di media sosial.',
      plainText: 'Di era di mana anak balita sudah terbiasa menggeser layar ponsel pintar, kita kerap melupakan keajaiban suara ibu atau bapak yang bertutur tentang kancil, raksasa yang bijak, atau kearifan hutan jati...',
      authorUsername: 'anita_literasi',
      categorySlug: 'pendidikan',
      status: ArticleStatus.PENDING_REVIEW,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 hari lalu
      readingTime: 5,
      wordCount: 640,
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Di era di mana anak balita sudah begitu lincah menggeser layar ponsel pintar, kita kerap melupakan keajaiban suara orang tua yang bertutur hangat menjelang tidur. Dongeng pengantar tidur bukanlah sekadar pengantar mimpi, melainkan momen paling intim dalam membangun ikatan emosional anak dengan bahasa dan nilai moral kebaikan.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Imajinasi yang Dibentuk Lewat Kata, Bukan Algoritma' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Ketika mendengarkan cerita, otak anak aktif bekerja menciptakan gambaran visualnya sendiri. Berbeda dengan video gawai yang menyajikan gambar instan tanpa memberi ruang bagi anak untuk membayangkan wujud karakter secara mandiri. Di desa-desa kita di Blora, kekayaan fabel lokal dan kisah teladan rakyat mestinya menjadi santapan jiwa anak setiap malam sebelum lampu dipadamkan.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Mari kita ambil kembali waktu setengah jam sebelum tidur. Tutup gawai kita, buka lembaran buku cerita anak dari perpustakaan, dan mulailah bertutur. Di sanalah cinta pertama anak pada dunia literasi bersemi.',
              },
            ],
          },
        ],
      },
    },
    {
      title: 'Lori Kayu Jati dan Kilang Tua Cepu: Menggali Memori Kerja Keras di Ujung Timur Blora',
      slug: 'lori-kayu-jati-dan-kilang-tua-cepu-blora',
      subtitle: 'Menelusuri jejak besi tua dan tetesan keringat para pekerja yang membentuk karakter masyarakat Cepu.',
      excerpt: 'Suara derit rel lori hutan jati dan aroma minyak tanah di Cepu bukan sekadar komoditas ekonomi zaman lampau, melainkan monumen hidup tentang etos kerja keras dan kebersamaan.',
      plainText: 'Menyebut Cepu selalu menghadirkan dua bayangan yang saling berkelindan: raksasa hutan jati Perhutani dan kilang minyak bumi tertua di tanah Jawa...',
      authorUsername: 'dimas_cepu',
      categorySlug: 'sejarah',
      status: ArticleStatus.PENDING_REVIEW,
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 jam lalu
      readingTime: 6,
      wordCount: 750,
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Menyebut Cepu selalu menghadirkan dua bayangan yang saling berkelindan: jajaran pohon jati yang tegak menjulang di bawah kelola Perhutani, serta aroma minyak bumi dari kilang tua peninggalan era kolonial. Kereta lori kayu jati yang ditarik lokomotif uap tua pernah menjadi denyut nadi utama mobilitas kayu gelondongan dari jantung hutan menuju tempat penimbunan kayu (TPK).',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Keringat di Antara Rel Besi dan Pengeboran' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Generasi kakek-nenek kita di kawasan Cepu dan sekitarnya ditempa oleh disiplin kerja keras yang keras. Mereka adalah para montir, masinis lori, dan operator bor minyak tradisional yang mewariskan ketangguhan mental. Menuliskan kembali sejarah lokal ini adalah ikhtiar agar generasi muda Blora tidak tercerabut dari akar perjuangan leluhurnya sendiri.',
              },
            ],
          },
        ],
      },
    },
    {
      title: 'Gurihnya Sate Jagal di Sudut Pasar Pon: Bertahan di Tengah Arus Kuliner Cepat Saji',
      slug: 'gurihnya-sate-jagal-sudut-pasar-pon-blora',
      subtitle: 'Kisah Mbah Kardi yang telah membakar tusuk sate sapi khas Blora selama empat dekade.',
      excerpt: 'Dengan bumbu kacang halus berpadu kuah santan kuning yang khas, sate jagal Blora bukan hanya memanjakan lidah, melainkan menyimpan filosofi ketelitian dalam setiap potongannya.',
      plainText: 'Asap mengepul dari atas bakaran arang batok kelapa di sudut Pasar Pon Blora sejak matahari belum sepenuhnya terbit...',
      authorUsername: 'kartika_wulan',
      categorySlug: 'sosial',
      status: ArticleStatus.REVISION, // Sudah dalam status REVISI
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      readingTime: 3,
      wordCount: 410,
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Asap mengepul dari atas bakaran arang batok kelapa di sudut Pasar Pon Blora sejak matahari belum sepenuhnya terbit. Mbah Kardi, dengan caping anyaman bambu yang sudah kusam, mengipasi barisan tusuk sate daging sapi dengan irama yang mantap dan telaten.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Ciri khas sate jagal Blora terletak pada perpaduan bumbu kacang lembut gurih yang disiram kuah santan kuning kental di atas piring daun jati. Makanan ini telah menjadi pengikat persaudaraan para pedagang pasar sejak puluhan tahun yang lalu.',
              },
            ],
          },
        ],
      },
    },
  ];

  for (const item of dummyManuscripts) {
    const author = authors[item.authorUsername];
    const category = findCat(item.categorySlug);

    const article = await prisma.article.upsert({
      where: { slug: item.slug },
      update: {
        status: item.status,
        submittedAt: item.submittedAt,
        content: item.content,
        plainText: item.plainText,
        wordCount: item.wordCount,
        readingTime: item.readingTime,
      },
      create: {
        title: item.title,
        slug: item.slug,
        subtitle: item.subtitle,
        excerpt: item.excerpt,
        content: item.content,
        plainText: item.plainText,
        categoryId: category.id,
        authorId: author.id,
        status: item.status,
        submittedAt: item.submittedAt,
        readingTime: item.readingTime,
        wordCount: item.wordCount,
        allowComments: true,
      },
    });

    // Jika status REVISION, tambahkan riwayat revisi
    if (item.status === ArticleStatus.REVISION) {
      await prisma.articleRevision.create({
        data: {
          articleId: article.id,
          editorId: author.id, // atau kurator
          statusFrom: ArticleStatus.PENDING_REVIEW,
          statusTo: ArticleStatus.REVISION,
          note: 'Mohon tambahkan sedikit wawancara langsung atau kutipan cerita Mbah Kardi agar tulisan terasa lebih hidup dan humanis.',
        },
      });
    }

    console.log(`📄 Naskah disemai: "${article.title}" [Status: ${article.status}]`);
  }

  console.log('\n🎉 Selesai! Naskah dummy warga siap untuk diuji di Meja Kurasi (/dashboard/kurasi).');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding dummy manuscripts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
