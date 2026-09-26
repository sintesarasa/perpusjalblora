import { PrismaClient, Role, UserStatus, TrustLevel, LetterStatus, CommentStatus, ReportReason } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('📬 Menyemai data dummy Surat Pembaca & Moderasi Komentar...');

  const passwordHash = await bcrypt.hash('WargaBlora2026!', 10);

  // 1. Dapatkan atau buat pengguna warga
  const citizen1 = await prisma.user.upsert({
    where: { email: 'siti.rahayu@warga.id' },
    update: {},
    create: {
      email: 'siti.rahayu@warga.id',
      username: 'siti_rahayu',
      name: 'Siti Rahayu',
      bio: 'Warga Kunduran, Blora. Pegiat taman baca rumahan.',
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL0, // Akun baru untuk uji coba kurasi komentar TL0
    },
  });

  const citizen2 = await prisma.user.upsert({
    where: { email: 'joko.susilo@warga.id' },
    update: {},
    create: {
      email: 'joko.susilo@warga.id',
      username: 'joko_susilo',
      name: 'Joko Susilo',
      bio: 'Pemerhati tata kota dan ruang terbuka hijau Blora.',
      passwordHash,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL1,
    },
  });

  // 2. Semai Surat Pembaca (Reader Letters)
  console.log('✉️  Menyemai Surat Pembaca...');

  const lettersData = [
    {
      title: 'Menghidupkan Kembali Budaya Membaca di Balai RT: Usulan untuk Perpusjal',
      slug: 'menghidupkan-kembali-budaya-membaca-di-balai-rt',
      displayName: 'Warga Peduli Kunduran',
      isAnonymous: true,
      content: `Saya sangat mengapresiasi kehadiran Perpustakaan Jalanan Blora yang konsisten menggelar lapak baca setiap Minggu pagi di Alun-Alun dan Sabtu sore di Taman Tirtonadi. Kehadiran ruang baca terbuka seperti ini memberikan angin segar bagi anak-anak dan pemuda di tengah serbuan gawai digital.

Namun, kami yang tinggal di kecamatan agak jauh dari pusat kota seperti Kunduran, sering kali kesulitan mengakses lapak baca tersebut secara berkala. Saya ingin mengusulkan sebuah gagasan: bagaimana jika Perpusjal Blora menginisiasi program "Kotak Buku Bergilir" yang ditempatkan di balai RT atau pos ronda desa?

Kotak ini cukup berisi 20-30 buku yang ditukar setiap dua pekan sekali oleh relawan kecamatan. Warga setempat bisa mencatat peminjaman secara mandiri atau dibantu pengurus karang taruna. Dengan cara ini, literasi tidak hanya terpusat di jantung kota Blora, tetapi menyentuh gang-gang pedesaan yang haus akan bacaan berkualitas. Semoga usulan sederhana ini bisa menjadi bahan pertimbangan rekan-rekan redaksi dan pegiat literasi. Salam merdeka belajar!`,
      status: LetterStatus.PENDING,
      authorId: citizen1.id,
    },
    {
      title: 'Apresiasi untuk Lapak CFD Alun-Alun: Mohon Perbanyak Koleksi Buku Bergambar Anak',
      slug: 'apresiasi-lapak-cfd-perbanyak-buku-anak',
      displayName: 'Joko Susilo',
      isAnonymous: false,
      content: `Minggu lalu saya mengajak kedua anak saya yang berumur 6 dan 8 tahun berkunjung ke Lapak Baca Perpusjal di CFD Alun-Alun Blora. Sungguh pemandangan yang membahagiakan melihat puluhan buku tertata rapi di atas terpal, dan anak-anak duduk melingkar dengan antusias membolak-balik halaman buku.

Satu hal yang menjadi catatan kecil dari kunjungan kami adalah keterbatasan koleksi buku dongeng nusantara dan ensiklopedia sains bergambar untuk anak usia dini. Banyak anak yang berebut satu judul buku yang sama karena jumlah eksemplar buku bergambar masih terbatas dibanding buku wacana dewasa.

Kami para orang tua sangat berharap di edisi lapak mendatang, rekan-rekan relawan bisa menambah porsi buku edukasi anak dan fabel nusantara. Jika memungkinkan, sesi mendongeng singkat (storytelling) selama 15 menit juga akan sangat memikat minat anak-anak. Terima kasih banyak atas dedikasi tanpa pamrih seluruh relawan Perpustakaan Jalanan Blora!`,
      status: LetterStatus.PENDING,
      authorId: citizen2.id,
    },
  ];

  for (const l of lettersData) {
    await prisma.readerLetter.upsert({
      where: { slug: l.slug },
      update: {
        status: l.status,
        content: l.content,
        title: l.title,
      },
      create: {
        title: l.title,
        slug: l.slug,
        content: l.content,
        originalContent: l.content,
        displayName: l.displayName,
        isAnonymous: l.isAnonymous,
        status: l.status,
        authorId: l.authorId,
      },
    });
  }

  // 3. Semai Komentar Pending (Akun TL0) & Komentar yang Dilaporkan
  console.log('💬 Menyemai Komentar Moderasi...');
  const article = await prisma.article.findFirst({
    where: { status: 'PUBLISHED' },
  });

  if (article) {
    // A. Komentar Akun TL0 (Pending Moderation)
    const pendingComment = await prisma.comment.create({
      data: {
        content: 'Tulisan yang sangat bernas dan menggugah nurani! Saya sepakat bahwa ruang publik harus dirawat bersama bukan semata sebagai etalase proyek, tapi ruang hidup warga.',
        status: CommentStatus.PENDING,
        authorId: citizen1.id, // TL0
        articleId: article.id,
      },
    });

    // B. Komentar yang Dilaporkan Warga (Reported & Hidden)
    const reportedComment = await prisma.comment.create({
      data: {
        content: 'Kunjungi situs kami untuk pinjaman online kilat tanpa agunan dan jaminan bunga 0% hanya di http://dana-kilat-palsu.xyz dan http://promo-gadungan.com segera hubungi WA!',
        status: CommentStatus.HIDDEN,
        reportCount: 3,
        authorId: citizen2.id,
        articleId: article.id,
      },
    });

    // Buat laporan aduan warga
    await prisma.commentReport.createMany({
      data: [
        {
          commentId: reportedComment.id,
          reporterId: citizen1.id,
          reason: ReportReason.SPAM,
          note: 'Spam tautan pinjol dan promosi ilegal di kolom diskusi wacana.',
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log('✅ Berhasil menyemai Surat Pembaca dan antrean Komentar!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding community data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
