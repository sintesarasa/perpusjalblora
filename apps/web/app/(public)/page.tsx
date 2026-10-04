'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { StatusPill } from '@/components/ui/status-pill';
import { Logo, LogoIcon } from '@/components/logo';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Feather,
  Sparkles,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Compass,
  Heart,
  Quote,
  CheckCircle2,
  Radio,
  Layers,
  Printer,
  ExternalLink,
  MessageSquare,
  Award,
  Sun,
  Flame,
  Check,
  ChevronRight,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Curated Books for interactive shelf
const CURATED_BOOKS = [
  {
    code: 'PJ-2026-0001',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    category: 'Sastra & Roman',
    categorySlug: 'sastra',
    status: 'available' as const,
    year: '1980',
    description: 'Roman sejarah monumental tentang kebangkitan kesadaran manusia merdeka di Hindia Belanda.',
  },
  {
    code: 'PJ-2026-0024',
    title: 'Madilog',
    author: 'Tan Malaka',
    category: 'Sosial & Filsafat',
    categorySlug: 'sosial',
    status: 'available' as const,
    year: '1943',
    description: 'Materialisme, Dialektika, dan Logika sebagai fondasi berpikir merdeka rakyat jelata.',
  },
  {
    code: 'PJ-2026-0045',
    title: 'Gadis Pantai',
    author: 'Pramoedya Ananta Toer',
    category: 'Sastra & Roman',
    categorySlug: 'sastra',
    status: 'available' as const,
    year: '1982',
    description: 'Kisah pilu penindasan feodalisme Jawa terhadap perempuan bersahaja dari kampung nelayan.',
  },
  {
    code: 'PJ-2026-0089',
    title: 'Orang-Orang di Tikungan Jalan',
    author: 'Pramoedya Ananta Toer',
    category: 'Sejarah & Samin',
    categorySlug: 'sejarah',
    status: 'borrowed' as const,
    year: '1954',
    description: 'Dua lakon sandiwara tentang pergulatan revolusi dan manusia di persimpangan zaman.',
  },
  {
    code: 'PJ-2026-0112',
    title: 'Pendidikan Kaum Tertindas',
    author: 'Paulo Freire',
    category: 'Pedagogi Kritis',
    categorySlug: 'pendidikan',
    status: 'available' as const,
    year: '1968',
    description: 'Pedagogi pembebasan yang mengubah pendidikan dari sistem perbankan pasif menjadi dialog kritis.',
  },
  {
    code: 'PJ-2026-0140',
    title: 'Jalan Tak Ada Ujung',
    author: 'Mochtar Lubis',
    category: 'Sastra & Roman',
    categorySlug: 'sastra',
    status: 'available' as const,
    year: '1952',
    description: 'Eksplorasi psikologis mendalam tentang ketakutan batin, martabat, dan idealisme masa revolusi.',
  },
  {
    code: 'PJ-2026-0165',
    title: 'Cerita Rakyat Nusantara & Fabel Jawa',
    author: 'Koleksi Dongeng Rakyat',
    category: 'Buku Anak & Fabel',
    categorySlug: 'anak',
    status: 'available' as const,
    year: '2019',
    description: 'Dongeng bergambar pengantar imajinasi dan kearifan lokal untuk anak-anak pembaca trotoar.',
  },
  {
    code: 'PJ-2026-0188',
    title: 'Samin Surosentiko & Gerakan Petani',
    author: 'Kajian Sejarah Budaya',
    category: 'Sejarah & Samin',
    categorySlug: 'sejarah',
    status: 'available' as const,
    year: '2015',
    description: 'Ajaran Sedulur Sikep, perlawanan tanpa kekerasan, dan kedaulatan tanah adat di bumi Blora.',
  },
];

// Curated Citizen Articles
const CURATED_ARTICLES = [
  {
    slug: 'menemukan-kembali-suara-akar-rumput',
    title: 'Menemukan Kembali Suara Akar Rumput di Pinggiran Rel Kereta Blora',
    author: 'Pramono Wibowo',
    authorRole: 'Relawan Perpusjal',
    category: 'SASTRA & JALANAN',
    readTime: '5 MIN BACA',
    summary:
      'Bagaimana lembaran buku yang dihamparkan di trotoar menjadi jembatan dialog antar-warga yang selama ini tercerabut dari gemerlap perbincangan kota.',
  },
  {
    slug: 'merawat-ingatan-samin-lewat-arsip-warga',
    title: 'Merawat Ajaran Kejujuran Samin Melalui Arsip Mandiri Warga',
    author: 'Siti Lestari',
    authorRole: 'Kontributor Warga',
    category: 'SEJARAH & BUDAYA',
    readTime: '4 MIN BACA',
    summary:
      'Ajaran perlawanan tanpa kekerasan dan kedaulatan tanah adat yang masih terus bernapas dalam laku hidup sehari-hari masyarakat pedesaan Blora.',
  },
  {
    slug: 'tanpa-denda-sebagai-etos-kepercayaan',
    title: 'Tiada Denda Rupiah: Kepercayaan Tertinggi Terhadap Pembaca',
    author: 'Bayu Prasetyo',
    authorRole: 'Pegiat Lapak CFD',
    category: 'ETOS GERAKAN',
    readTime: '3 MIN BACA',
    summary:
      'Mengapa sanksi finansial justru melukai hak membaca rakyat, dan bagaimana etos amanah mampu menjaga ratusan koleksi tetap berputar sehat.',
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredBooks = React.useMemo(() => {
    if (selectedCategory === 'all') return CURATED_BOOKS;
    return CURATED_BOOKS.filter((b) => b.categorySlug === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background editorial-grain">
      <Header />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* 1. FRONT-PAGE HERO / LEAD EDITORIAL (CINEMATIC BROADSHEET) */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12 sm:pb-16 relative overflow-hidden">
          {/* Giant Background Typography Watermark */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none font-serif text-[180px] sm:text-[280px] font-black leading-none text-foreground tracking-tighter">
            PERPUSJAL
          </div>

          {/* Top Vintage Gazette Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3 mb-8 sm:mb-12 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted gap-2 relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <BrandStamp edition="KRONIK UTAMA" year="2026" />
              <span className="hidden sm:inline">[ EDISI RESMI // GERAKAN SWADAYA RAKYAT ]</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-foreground font-semibold">LAPAK CFD: SETIAP MINGGU PAGI</span>
            </div>
            <div className="hidden lg:block">BLORA, JAWA TENGAH &bull; RUANG BACA RAKYAT</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 relative z-10">
            {/* Left Big Lead (8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-8">
              <RevealOnScroll variant="fade-up" delayMs={100}>
                <div className="space-y-4 sm:space-y-6">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground font-mono text-[9px] sm:text-[10px] tracking-widest uppercase font-bold bg-foreground text-background">
                    <span>RUANG PERJUMPAAN MERDEKA</span>
                  </div>

                  {/* Headline: MEMBACA DAN BERBAHAGIA */}
                  <h1 className="font-serif font-black uppercase text-foreground leading-[1.02] sm:leading-[0.92] tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl break-words">
                    MEMBACA DAN <br />
                    <span className="italic font-serif font-normal text-amber-500 dark:text-amber-400">
                      BERBAHAGIA.
                    </span>
                  </h1>

                  <p className="drop-cap font-serif text-lg sm:text-xl text-foreground/90 leading-relaxed max-w-2xl">
                    Kami mengembalikan buku ke tempat ia seharusnya bermula: di ruang-ruang terbuka
                    tempat percakapan merdeka dirawat, di bawah naungan pohon trembesi alun-alun kota,
                    hingga tepian hutan jati. Tanpa uang jaminan, tanpa denda rupiah, dan tanpa sekat kelas sosial.
                  </p>
                </div>
              </RevealOnScroll>

              {/* Action Buttons Bar */}
              <RevealOnScroll variant="fade-up" delayMs={200}>
                <div className="pt-4 border-t border-border-hairline flex flex-wrap gap-3 sm:gap-4 items-center">
                  <Link
                    href="/buku"
                    className="px-6 py-3.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors shadow-xs inline-flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>TELUSURI KATALOG KOLEKSI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/artikel"
                    className="px-5 py-3.5 border-2 border-foreground bg-surface hover:bg-foreground hover:text-background font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                  >
                    <Feather className="w-4 h-4" />
                    <span>BACA WARTA WARGA</span>
                  </Link>

                  <Link
                    href="/warga"
                    className="px-4 py-3.5 border border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-300 font-mono text-xs font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-colors inline-flex items-center gap-1.5"
                    title="Jelajahi Warga & Koleksi Lencana Literasi"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>KARTU WARGA</span>
                  </Link>
                </div>
              </RevealOnScroll>
            </div>

            {/* Right Side Editorial Callout (4 cols) */}
            <div className="lg:col-span-4 border-t-2 lg:border-t-0 lg:border-l-2 border-foreground pt-8 lg:pt-0 lg:pl-8 flex flex-col justify-between space-y-6">
              {/* Quote Card */}
              <RevealOnScroll variant="slide-right" delayMs={250}>
                <div className="space-y-4">
                  <div className="text-[10px] font-mono uppercase tracking-ultra text-muted flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-amber-500" />
                    <span>[ CATATAN PINGGIR // FALSAFAH ]</span>
                  </div>
                  <blockquote className="font-serif italic text-xl sm:text-2xl text-foreground leading-snug">
                    &ldquo;Buku tidak bernilai jika hanya berdebu di lemari kaca. Ia hidup saat disentuh
                    jemari dan diperdebatkan di lapak trotoar.&rdquo;
                  </blockquote>
                  <cite className="block font-mono text-[11px] uppercase tracking-wider text-muted not-italic">
                    — Dewan Kolektif Perpusjal Blora
                  </cite>
                </div>
              </RevealOnScroll>

              {/* Street Ledger Mini Box (Papan Jadwal Lapak Mingguan) */}
              <RevealOnScroll variant="fade-up" delayMs={350}>
                <div className="border-2 border-foreground p-5 bg-surface font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border-hairline text-[10px] uppercase tracking-widest text-muted">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      <span>SESI LAPAK BERIKUTNYA</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold text-foreground">MINGGU PAGI &bull; CFD BLORA</div>
                    <div className="text-xs text-muted flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>Pukul 06.00 – 09.00 WIB</span>
                    </div>
                  </div>

                  <p className="font-serif text-xs text-foreground/80 leading-relaxed border-t border-border-hairline pt-2">
                    Depan Pendopo Kabupaten Blora. Ambil buku yang kamu pesan lewat website ini, atau
                    kembalikan pinjamanmu dengan senyuman.
                  </p>

                  <div className="pt-1">
                    <Link
                      href="/tentang#lapak"
                      className="font-mono text-[10.5px] uppercase font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>PETA &amp; JADWAL LENGKAP LAPAK</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. THE THREE VOWS: TIGA PRINSIP AKAR RUMPUT               */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto">
          <div className="px-4 sm:px-8 py-3.5 border-b border-border-hairline flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-muted">
            <span>[ SEKSI II // NILAI DASAR ]</span>
            <span>TIGA PRINSIP GERAKAN TROTOAR</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-foreground">
            {/* Vow 1 */}
            <RevealOnScroll variant="fade-up" delayMs={100} className="h-full">
              <div className="p-6 sm:p-8 h-full flex flex-col justify-between group hover:bg-surface transition-colors space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono text-[10.5px] uppercase text-muted tracking-widest">
                    <span>01 // ETOS KEPERCAYAAN</span>
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground leading-tight">
                    Nol Rupiah Denda Finansial
                  </h3>
                  <p className="font-serif text-sm text-foreground/80 leading-relaxed">
                    Sanksi denda uang melukai hak membaca rakyat. Di Perpusjal, keterlambatan diselesaikan
                    lewat komunikasi kekeluargaan. Meminjam adalah merawat amanah.
                  </p>
                </div>
                <div className="pt-4 border-t border-border-hairline font-mono text-[10px] text-muted uppercase tracking-wider">
                  &bull; AMANAH SEBAGAI JAMINAN
                </div>
              </div>
            </RevealOnScroll>

            {/* Vow 2 */}
            <RevealOnScroll variant="fade-up" delayMs={200} className="h-full">
              <div className="p-6 sm:p-8 h-full flex flex-col justify-between group hover:bg-surface transition-colors space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono text-[10.5px] uppercase text-muted tracking-widest">
                    <span>02 // KEDAULATAN AKSES</span>
                    <Compass className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground leading-tight">
                    Tanpa Syarat Birokrasi
                  </h3>
                  <p className="font-serif text-sm text-foreground/80 leading-relaxed">
                    Cukup sebutkan namamu atau tunjukkan kartu sirkulasi digital di lapak baca. Tidak ada biaya
                    keanggotaan, formulir berbelit, maupun kartu tanda penduduk yang disita.
                  </p>
                </div>
                <div className="pt-4 border-t border-border-hairline font-mono text-[10px] text-muted uppercase tracking-wider">
                  &bull; AKSES TERBUKA UNTUK SIAPA SAJA
                </div>
              </div>
            </RevealOnScroll>

            {/* Vow 3 */}
            <RevealOnScroll variant="fade-up" delayMs={300} className="h-full">
              <div className="p-6 sm:p-8 h-full flex flex-col justify-between group hover:bg-surface transition-colors space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono text-[10.5px] uppercase text-muted tracking-widest">
                    <span>03 // KEBERSAMAAN RAKYAT</span>
                    <Heart className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground leading-tight">
                    Tanpa Sekat Kelas Sosial
                  </h3>
                  <p className="font-serif text-sm text-foreground/80 leading-relaxed">
                    Dari anak-anak buruh tani, pelajar desa, hingga pensiunan kota—semua duduk bersila sama
                    rendah di atas terpal biru yang sama, membaca dan berbahagia bersama.
                  </p>
                </div>
                <div className="pt-4 border-t border-border-hairline font-mono text-[10px] text-muted uppercase tracking-wider">
                  &bull; RUANG PERJUMPAAN RAKYAT
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. SHOWCASE: KARTU KEHORMATAN WARGA (MARKETING HIGHLIGHT) */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-surface-muted/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <RevealOnScroll variant="fade-up">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-amber-500/40 bg-amber-500/10 font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>IDENTITAS DIGITAL WARGA LITERASI</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground leading-tight mt-3">
                  Jejak Bacamu Adalah <br />
                  <span className="italic font-normal font-serif lowercase text-amber-500 dark:text-amber-400">
                    kehormatan tersendiri.
                  </span>
                </h2>

                <p className="font-serif text-base sm:text-lg text-foreground/85 leading-relaxed mt-4">
                  Setiap buku yang kamu pinjam, ulasan yang kamu tulis, dan kehadiranmu di lapak terpal
                  tercatat sebagai rekam jejak literasi. Buka lencana kehormatan, raih julukan warga, dan
                  unduh <strong>Kartu Kehormatan Warga</strong> dalam desain <em>Obsidian Gold</em> yang siap
                  kamu bagikan ke media sosial.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-hairline font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase text-muted tracking-wider block">LENCANA PRESTASI</span>
                    <strong className="text-foreground text-sm flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      12 Tingkatan Lencana
                    </strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase text-muted tracking-wider block">KARTU MEDSOS HD</span>
                    <strong className="text-foreground text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Siap Unduh &amp; Share
                    </strong>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/kontributor"
                    className="px-5 py-3 bg-foreground text-background font-mono text-xs uppercase font-bold tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-2 shadow-xs"
                  >
                    <span>LIHAT ETALASE WARGA &amp; LENCANA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/masuk"
                    className="px-4 py-3 border-2 border-foreground bg-surface hover:bg-foreground hover:text-background font-mono text-xs uppercase font-bold tracking-wider transition-colors inline-flex items-center gap-2"
                  >
                    <span>BUAT KARTU MILIKMU</span>
                  </Link>
                </div>
              </RevealOnScroll>
            </div>

            {/* Right: Live Realistic Mini Mockup of the Obsidian Gold Card */}
            <div className="lg:col-span-6 flex justify-center">
              <RevealOnScroll variant="stamp" delayMs={200} className="w-full max-w-md">
                <div
                  className="relative bg-[#090a0c] text-[#f4f4f0] p-5 sm:p-6 pb-6 border-2 border-amber-500/70 shadow-[0_20px_50px_rgba(0,0,0,0.85)] select-none space-y-4 box-border rounded-xs"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.12) 0%, transparent 45%), radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.08) 0%, transparent 40%)',
                  }}
                >
                  {/* Decorative corner markers */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

                  {/* Top Bar of the Card */}
                  <div className="border-b border-amber-500/30 pb-2.5 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <Logo className="h-6 sm:h-7 w-auto text-amber-400 shrink-0" />
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[7px] uppercase font-bold tracking-widest text-zinc-400 block mb-0.5">
                          NO. REGISTRASI
                        </span>
                        <span className="font-mono text-[10px] font-bold text-amber-300 tracking-wider px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-xs inline-block">
                          BLR-2026-WARGA01
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-zinc-800/70">
                      <span className="font-mono text-[8px] uppercase font-bold tracking-[0.2em] text-amber-400">
                        KARTU KEHORMATAN WARGA
                      </span>
                      <span className="font-serif italic text-[11px] text-zinc-200">
                        Membaca dan Berbahagia.
                      </span>
                    </div>
                  </div>

                  {/* Persona Identity Strip */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-zinc-800 flex items-center justify-center font-serif text-lg font-bold text-amber-300 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      P
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="font-serif font-black text-lg text-white truncate">Pramono Wibowo</h4>
                      <p className="font-mono text-[10px] text-amber-300">@pramono &bull; Warga Sejak 2024</p>
                      <div className="pt-0.5">
                        <span className="inline-block px-2 py-0.2 bg-amber-500/15 border border-amber-400/50 text-amber-300 font-mono text-[8px] uppercase font-bold tracking-wider rounded-full">
                          GELAR: PENJAGA NYALA LITERASI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inspiring Quote Box */}
                  <div className="p-3 bg-gradient-to-r from-amber-500/15 via-zinc-900/90 to-zinc-900/60 border-l-3 border-amber-400 rounded-xs space-y-1">
                    <p className="font-serif italic text-xs text-[#f4f4f0] leading-relaxed">
                      &ldquo;Tangan yang membolak-balik buku adalah tangan yang merawat masa depan bangsa.&rdquo;
                    </p>
                    <div className="text-right font-mono text-[8.5px] text-amber-300 font-semibold uppercase">
                      — Pramono Wibowo (Bio Warga)
                    </div>
                  </div>

                  {/* 4 Achievement Pillars */}
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-center pt-0.5">
                    <div className="p-1.5 border border-zinc-800 bg-zinc-900/80 rounded-xs">
                      <span className="text-[7px] uppercase tracking-wider text-zinc-400 block">Tulisan</span>
                      <span className="font-serif font-black text-sm text-amber-300">8</span>
                    </div>
                    <div className="p-1.5 border border-zinc-800 bg-zinc-900/80 rounded-xs">
                      <span className="text-[7px] uppercase tracking-wider text-zinc-400 block">Lencana</span>
                      <span className="font-serif font-black text-sm text-amber-300">6</span>
                    </div>
                    <div className="p-1.5 border border-zinc-800 bg-zinc-900/80 rounded-xs">
                      <span className="text-[7px] uppercase tracking-wider text-zinc-400 block">Pinjaman</span>
                      <span className="font-serif font-black text-sm text-amber-300">14</span>
                    </div>
                    <div className="p-1.5 border border-zinc-800 bg-zinc-900/80 rounded-xs">
                      <span className="text-[7px] uppercase tracking-wider text-zinc-400 block">Amanah</span>
                      <span className="font-serif font-black text-sm text-amber-300">14x</span>
                    </div>
                  </div>

                  {/* Bottom Verification Seal */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 gap-2">
                    <Logo className="h-6 w-auto text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0 text-right space-y-0.5 font-mono text-[7.5px] text-zinc-400">
                      <span className="text-amber-300 block font-bold">perpusjalblora.id/warga/@pramono</span>
                      <span>DOKUMEN RESMI WARGA LITERASI</span>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. ETALASE KOLEKSI PILIHAN DI RAK & LAPAK                  */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b-2 border-foreground gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-ultra text-muted">
                [ SEKSI III // ETALASE KOLEKSI ]
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
                BUKU DI RAK &amp; TERPAL
              </h2>
            </div>
            <Link
              href="/buku"
              className="font-mono text-xs uppercase tracking-widest underline hover:text-muted inline-flex items-center gap-1.5 font-bold"
            >
              <span>[ JELAJAHI SELURUH 240+ KOLEKSI BUKU &rarr; ]</span>
            </Link>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8 font-mono text-xs">
            <span className="text-muted text-[11px] uppercase mr-1">Kategori Cepat:</span>
            {[
              { id: 'all', label: 'Semua Koleksi' },
              { id: 'sastra', label: 'Sastra & Roman' },
              { id: 'sejarah', label: 'Sejarah & Samin' },
              { id: 'sosial', label: 'Sosial & Filsafat' },
              { id: 'pendidikan', label: 'Pedagogi Kritis' },
              { id: 'anak', label: 'Buku Anak & Fabel' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-3 py-1.5 border font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer',
                  selectedCategory === cat.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Book Jackets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBooks.slice(0, 4).map((book, idx) => (
              <RevealOnScroll key={book.code} variant="fade-up" delayMs={idx * 100}>
                <div className="border-2 border-foreground bg-surface p-5 flex flex-col justify-between group hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] transition-all h-full">
                  <div>
                    {/* Top Metadata Strip */}
                    <div className="flex items-center justify-between text-[10px] font-mono pb-2 mb-3 border-b border-border-hairline">
                      <span className="text-muted font-bold">{book.code}</span>
                      <StatusPill status={book.status} />
                    </div>

                    {/* Book Jacket Graphic Mockup */}
                    <div className="border border-border-hairline bg-surface-muted h-48 mb-4 p-4 flex flex-col justify-between text-left group-hover:bg-foreground group-hover:text-background transition-colors">
                      <div className="font-mono text-[9px] uppercase tracking-ultra opacity-60">
                        [ {book.category} // {book.year} ]
                      </div>
                      <div>
                        <div className="font-serif text-lg font-black uppercase leading-tight line-clamp-2">
                          {book.title}
                        </div>
                        <div className="font-mono text-[11px] mt-1 opacity-80">{book.author}</div>
                      </div>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-foreground mb-1 leading-snug group-hover:underline line-clamp-1">
                      <Link href={`/buku/${book.code}`}>{book.title}</Link>
                    </h3>
                    <p className="font-mono text-xs text-muted mb-3">{book.author}</p>
                    <p className="font-serif text-xs text-foreground/80 leading-relaxed line-clamp-2">
                      {book.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-border-hairline flex items-center justify-between text-xs font-mono">
                    <span className="text-muted uppercase text-[10px] font-semibold">{book.category}</span>
                    <Link
                      href={`/buku/${book.code}`}
                      className="font-bold uppercase tracking-wider hover:underline flex items-center gap-1 text-foreground"
                    >
                      <span>PINJAM BUKU</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. SEKSI WARTA & TULISAN KURASI WARGA                     */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto">
          <div className="px-4 sm:px-8 py-3.5 border-b border-border-hairline flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-muted">
            <span>[ SEKSI IV // MEJA REDAKSI WARGA ]</span>
            <Link href="/artikel" className="hover:text-foreground underline font-bold">
              SEMUA TULISAN WARGA &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-foreground">
            {CURATED_ARTICLES.map((article, idx) => (
              <RevealOnScroll key={article.slug} variant="fade-up" delayMs={idx * 150} className="h-full">
                <article className="p-6 sm:p-8 h-full flex flex-col justify-between group hover:bg-surface transition-colors space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-widest mb-3">
                      <span>[ 0{idx + 1} // {article.category} ]</span>
                      <span className="text-foreground font-semibold">{article.readTime}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground group-hover:underline mb-3 leading-tight">
                      <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="font-serif text-sm text-foreground/80 leading-relaxed mb-6">
                      {article.summary}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border-hairline flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted">
                    <div>
                      <span className="text-foreground font-bold block">{article.author}</span>
                      <span className="text-[9px] text-muted">{article.authorRole}</span>
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform font-bold text-foreground">
                      BACA &rarr;
                    </span>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. STATISTIK KEMANDIRIAN & JEJAK SWADAYA                 */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground bg-surface py-12 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-hairline">
            <RevealOnScroll variant="fade-up" delayMs={100} className="py-4 md:py-0 md:pr-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                [ 01 // KOLEKSI TERDATA ]
              </div>
              <div className="font-serif text-5xl font-black text-foreground mt-2">240+</div>
              <p className="font-serif italic text-xs text-muted mt-2">
                Buku fisik tersusun di rak basecamp &amp; siap digelar di atas terpal.
              </p>
            </RevealOnScroll>

            <RevealOnScroll variant="fade-up" delayMs={200} className="py-4 md:py-0 md:px-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                [ 02 // SISTEM DENDA ]
              </div>
              <div className="font-serif text-5xl font-black text-foreground mt-2">0,-</div>
              <p className="font-serif italic text-xs text-muted mt-2">
                Nol rupiah denda uang. Hubungan antar-warga dirawat dengan rasa saling percaya.
              </p>
            </RevealOnScroll>

            <RevealOnScroll variant="fade-up" delayMs={300} className="py-4 md:py-0 md:px-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                [ 03 // WARTA &amp; RESENSI ]
              </div>
              <div className="font-serif text-5xl font-black text-foreground mt-2">48+</div>
              <p className="font-serif italic text-xs text-muted mt-2">
                Karya esai, resensi, dan opini kiriman warga yang terbit mandiri.
              </p>
            </RevealOnScroll>

            <RevealOnScroll variant="fade-up" delayMs={400} className="py-4 md:py-0 md:pl-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                [ 04 // TITIK SAYAP ]
              </div>
              <div className="font-serif text-5xl font-black text-foreground mt-2">2 Sayap</div>
              <p className="font-serif italic text-xs text-muted mt-2">
                Sayap Kota (CFD Alun-Alun) dan Sayap Hutan Doplang (Sendang Salak).
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 7. SUARA DARI TROTOAR (FIELD NOTES & TESTIMONIALS)        */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8 bg-surface-muted/20">
          <div className="max-w-3xl mx-auto text-center space-y-2 mb-10">
            <div className="font-mono text-[10px] uppercase tracking-ultra text-muted">
              [ CATATAN LAPANGAN // KESAKSIAN PEMBACA ]
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
              Suara Nyata dari Atas Terpal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RevealOnScroll variant="fade-up" delayMs={100}>
              <div className="p-6 border-2 border-foreground bg-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] space-y-4 flex flex-col justify-between h-full">
                <Quote className="w-5 h-5 text-amber-500" />
                <p className="font-serif italic text-sm text-foreground/90 leading-relaxed">
                  &ldquo;Anak-anak desa kami tidak kekurangan rasa ingin tahu; mereka hanya kekurangan akses
                  ke buku bermutu. Saat terpal digelar di sendang, mata mereka berbinar gembira.&rdquo;
                </p>
                <div className="pt-3 border-t border-border-hairline font-mono text-xs">
                  <span className="font-bold text-foreground block">Kawan Relawan Doplang</span>
                  <span className="text-[10px] text-muted">Mata Air Sendang Salak</span>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll variant="fade-up" delayMs={200}>
              <div className="p-6 border-2 border-foreground bg-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] space-y-4 flex flex-col justify-between h-full">
                <Quote className="w-5 h-5 text-amber-500" />
                <p className="font-serif italic text-sm text-foreground/90 leading-relaxed">
                  &ldquo;Awalnya saya ragu karena tidak punya uang jaminan. Ternyata cukup tulis nama dan
                  bisa bawa pulang novel Pramoedya. Ini benar-benar perpustakaan milik rakyat.&rdquo;
                </p>
                <div className="pt-3 border-t border-border-hairline font-mono text-xs">
                  <span className="font-bold text-foreground block">Pelajar SMAN 1 Blora</span>
                  <span className="text-[10px] text-muted">Pengunjung CFD Alun-Alun</span>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll variant="fade-up" delayMs={300}>
              <div className="p-6 border-2 border-foreground bg-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] space-y-4 flex flex-col justify-between h-full">
                <Quote className="w-5 h-5 text-amber-500" />
                <p className="font-serif italic text-sm text-foreground/90 leading-relaxed">
                  &ldquo;Membaca tidak lagi terasa kaku atau formal seperti di gedung ber-AC. Di sini kami
                  bisa berdiskusi sambil ngopi dan menghirup udara segar pagi hari.&rdquo;
                </p>
                <div className="pt-3 border-t border-border-hairline font-mono text-xs">
                  <span className="font-bold text-foreground block">Mas Agus</span>
                  <span className="text-[10px] text-muted">Warga Kunduran</span>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 8. GRAND CALL TO ACTION: LESEHAN BERSAMA                 */}
        {/* ========================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <RevealOnScroll variant="fade-up">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-foreground font-mono text-[9px] uppercase tracking-widest font-bold bg-foreground text-background">
                <span>PANGGILAN BERGERAK</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground leading-tight">
                Trotoar Menunggu Jejak Langkahmu.
              </h2>
              <p className="font-serif text-base sm:text-lg text-foreground/80 leading-relaxed">
                Punya buku yang menganggur di lemari? Sumbangkan ke lapak kami. Punya gagasan, cerita, atau
                resensi buku? Kirimkan tulisanmu ke meja redaksi kami untuk diterbitkan secara merdeka.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-4 font-mono text-xs">
                <Link
                  href="/tulis"
                  className="px-6 py-3.5 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-2 shadow-xs"
                >
                  <Feather className="w-4 h-4" />
                  <span>KIRIM TULISAN KE REDAKSI</span>
                </Link>
                <Link
                  href="/tentang"
                  className="px-5 py-3.5 border-2 border-foreground bg-surface hover:bg-foreground hover:text-background font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>KENALI KRONIK GERAKAN</span>
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </section>
      </main>

      <Footer />
    </div>
  );
}
