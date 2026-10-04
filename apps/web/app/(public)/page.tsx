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
    shelf: 'RAK-SAS-01',
    spineColor: 'bg-amber-700',
    coverBg: 'from-[#2b1810] to-[#120a06]',
    textColor: 'text-amber-100',
    accentBorder: 'border-amber-600/40',
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
    shelf: 'RAK-FIL-03',
    spineColor: 'bg-rose-800',
    coverBg: 'from-[#280d12] to-[#120508]',
    textColor: 'text-rose-100',
    accentBorder: 'border-rose-600/40',
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
    shelf: 'RAK-SAS-02',
    spineColor: 'bg-teal-800',
    coverBg: 'from-[#0b2528] to-[#041214]',
    textColor: 'text-teal-100',
    accentBorder: 'border-teal-600/40',
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
    shelf: 'RAK-SEJ-01',
    spineColor: 'bg-stone-700',
    coverBg: 'from-[#211f1d] to-[#0e0e0c]',
    textColor: 'text-stone-200',
    accentBorder: 'border-stone-600/40',
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
    shelf: 'RAK-PED-01',
    spineColor: 'bg-emerald-800',
    coverBg: 'from-[#0c2618] to-[#04120a]',
    textColor: 'text-emerald-100',
    accentBorder: 'border-emerald-600/40',
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
    shelf: 'RAK-SAS-04',
    spineColor: 'bg-indigo-800',
    coverBg: 'from-[#12152e] to-[#070817]',
    textColor: 'text-indigo-100',
    accentBorder: 'border-indigo-600/40',
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
    shelf: 'RAK-ANK-02',
    spineColor: 'bg-amber-600',
    coverBg: 'from-[#2a1d07] to-[#120c02]',
    textColor: 'text-amber-200',
    accentBorder: 'border-amber-500/40',
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
    shelf: 'RAK-SEJ-02',
    spineColor: 'bg-yellow-800',
    coverBg: 'from-[#2b200b] to-[#120d04]',
    textColor: 'text-yellow-100',
    accentBorder: 'border-yellow-600/40',
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
    category: 'LIPUTAN & JALANAN',
    readTime: '5 MIN BACA',
    publishedAt: '28 SEP 2026',
    editionCode: 'WARTA-01',
    leadQuote: 'Di atas lembaran terpal, suara buruh dan mahasiswa memiliki bobot yang setara.',
    summary:
      'Bagaimana lembaran buku yang dihamparkan di trotoar menjadi jembatan dialog antar-warga yang selama ini tercerabut dari gemerlap perbincangan kota.',
    curatorNote: 'Tajuk Pilihan Redaksi Pekan Ini — Catatan otentik tentang ruang perjumpaan merdeka.',
  },
  {
    slug: 'merawat-ingatan-samin-lewat-arsip-warga',
    title: 'Merawat Ajaran Kejujuran Samin Melalui Arsip Mandiri Warga',
    author: 'Siti Lestari',
    authorRole: 'Kontributor Warga',
    category: 'SEJARAH & BUDAYA',
    readTime: '4 MIN BACA',
    publishedAt: '24 SEP 2026',
    editionCode: 'WARTA-02',
    leadQuote: 'Ajaran Samin bukan sekadar masa lalu, melainkan kompas moral hidup hari ini.',
    summary:
      'Ajaran perlawanan tanpa kekerasan dan kedaulatan tanah adat yang masih terus bernapas dalam laku hidup sehari-hari masyarakat pedesaan Blora.',
    curatorNote: 'Kajian budaya akar rumput yang menggugah.',
  },
  {
    slug: 'tanpa-denda-sebagai-etos-kepercayaan',
    title: 'Tiada Denda Rupiah: Kepercayaan Tertinggi Terhadap Pembaca',
    author: 'Bayu Prasetyo',
    authorRole: 'Pegiat Lapak CFD',
    category: 'ETOS GERAKAN',
    readTime: '3 MIN BACA',
    publishedAt: '19 SEP 2026',
    editionCode: 'WARTA-03',
    leadQuote: 'Uang denda menghukum ketidakberdayaan; rasa saling percaya menumbuhkan tanggung jawab.',
    summary:
      'Mengapa sanksi finansial justru melukai hak membaca rakyat, dan bagaimana etos amanah mampu menjaga ratusan koleksi tetap berputar sehat.',
    curatorNote: 'Prinsip dasar yang melandasi setiap langkah Perpusjal.',
  },
  {
    slug: 'mengapa-pramoedya-harus-dibaca-di-warung-kopi',
    title: 'Mengapa Pramoedya Harus Dibaca di Warung Kopi dan Trotoar',
    author: 'Anisa Rahma',
    authorRole: 'Penulis Warga Cepu',
    category: 'RESENSI & SASTRA',
    readTime: '6 MIN BACA',
    publishedAt: '15 SEP 2026',
    editionCode: 'WARTA-04',
    leadQuote: 'Karya sastra sejati tidak boleh dimonopoli ruang akademik yang berjarak dari rakyat.',
    summary:
      'Membaca roman Pulau Buru di tengah kepulan kopi lelet Blora menghidupkan kembali roh perlawanan terhadap ketidakadilan zaman.',
    curatorNote: 'Resensi berani tentang demokratisasi sastra di tanah Blora.',
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
        {/* 3. SHOWCASE: KARTU KEHORMATAN WARGA (THE OBSIDIAN GOLD VAULT) */}
        {/* ========================================================= */}
        <section className="border-y-2 border-amber-500/70 bg-[#090a0c] text-white py-16 sm:py-24 relative overflow-hidden">
          {/* Subtle Golden Radial Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
              {/* Left Column: Narrative & Privilege Pillars (7 cols) */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8">
                <RevealOnScroll variant="fade-up">
                  <div className="inline-flex items-center gap-2 px-3 py-1 border border-amber-500/50 bg-amber-500/10 font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-amber-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>ARSIP KEHORMATAN // EDISI OBSIDIAN GOLD</span>
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.05] mt-4">
                    Jejak Bacamu Adalah <br />
                    <span className="italic font-serif font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                      Kehormatan Tertinggi.
                    </span>
                  </h2>

                  <p className="font-serif text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mt-4">
                    Di Perpusjal Blora, membaca bukan kegiatan pasif yang lenyap seketika. Setiap buku yang kamu
                    pinjam, warta yang kamu tulis, dan kehadiranmu di hamparan terpal diabadikan dalam{' '}
                    <strong className="text-amber-300 font-normal">Kartu Kehormatan Warga</strong> bersertifikasi resmi
                    — tanpa uang jaminan, dan tanpa denda rupiah seumur hidup.
                  </p>
                </RevealOnScroll>

                {/* 3 Pillars of Honor */}
                <RevealOnScroll variant="fade-up" delayMs={150}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                    <div className="p-4 bg-zinc-950/80 border border-amber-500/30 rounded-xs space-y-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <Award className="w-4 h-4" />
                      </div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                        12 Lencana Literasi
                      </h4>
                      <p className="font-serif text-xs text-zinc-400 leading-relaxed">
                        Buka gelar kehormatan bertahap, mulai dari <em>Warga Pemula</em> hingga <em>Penjaga Nyala Perpusjal</em>.
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-950/80 border border-amber-500/30 rounded-xs space-y-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                        Kartu Medsos HD
                      </h4>
                      <p className="font-serif text-xs text-zinc-400 leading-relaxed">
                        Unduh kartu resolusi tinggi rasio 1:1 &amp; bagikan langsung ke WhatsApp, Instagram, dan X dalam satu klik.
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-950/80 border border-amber-500/30 rounded-xs space-y-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                        Hak Bebas Antre
                      </h4>
                      <p className="font-serif text-xs text-zinc-400 leading-relaxed">
                        Pindai kode QR kartu di lapak CFD untuk langsung membawa pulang 3 buku tanpa titip KTP fisik.
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>

                {/* CTA Action Buttons */}
                <RevealOnScroll variant="fade-up" delayMs={250}>
                  <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link
                      href="/masuk"
                      className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] inline-flex items-center gap-2 rounded-xs"
                    >
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>BUAT KARTU MILIKMU SEKARANG</span>
                      <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </Link>

                    <Link
                      href="/kontributor"
                      className="px-5 py-3.5 border border-amber-500/40 bg-zinc-900/60 hover:bg-amber-500/10 hover:border-amber-400 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 rounded-xs"
                    >
                      <span>JELAJAHI DAFTAR WARGA &amp; LENCANA</span>
                    </Link>
                  </div>
                </RevealOnScroll>
              </div>

              {/* Right Column: Realistic Obsidian Gold Plinth Showcase (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <RevealOnScroll variant="stamp" delayMs={200} className="w-full max-w-md">
                  {/* Glowing Plinth / Pedestal Shadow Container */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-amber-600/30 rounded-xs blur-md opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />

                    <div
                      className="relative bg-[#090a0c] text-[#f4f4f0] p-6 pb-6 border-2 border-amber-500/80 shadow-[0_25px_60px_rgba(0,0,0,0.95)] select-none space-y-4 box-border rounded-xs"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.15) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.10) 0%, transparent 45%)',
                      }}
                    >
                      {/* Decorative corner markers */}
                      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
                      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
                      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
                      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

                      {/* Top Bar of the Card */}
                      <div className="border-b border-amber-500/30 pb-3 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <Logo className="h-7 w-auto text-amber-400 shrink-0" />
                          <div className="text-right shrink-0">
                            <span className="font-mono text-[7.5px] uppercase font-bold tracking-widest text-zinc-400 block mb-0.5">
                              NO. REGISTRASI RESMI
                            </span>
                            <span className="font-mono text-[10.5px] font-bold text-amber-300 tracking-wider px-2 py-0.5 bg-amber-500/15 border border-amber-500/40 rounded-xs inline-block shadow-inner">
                              BLR-2026-WARGA01
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                          <span className="font-mono text-[8.5px] uppercase font-bold tracking-[0.2em] text-amber-400">
                            KARTU KEHORMATAN WARGA
                          </span>
                          <span className="font-serif italic text-xs text-zinc-300">
                            Membaca dan Berbahagia.
                          </span>
                        </div>
                      </div>

                      {/* Persona Identity Strip */}
                      <div className="flex items-center gap-3.5 py-1">
                        <div className="w-13 h-13 rounded-full border-2 border-amber-400 bg-zinc-900 flex items-center justify-center font-serif text-xl font-bold text-amber-300 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                          P
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className="font-serif font-black text-xl text-white tracking-wide truncate">
                            Pramono Wibowo
                          </h4>
                          <p className="font-mono text-[10.5px] text-amber-300">@pramono &bull; Warga Penggerak 2024</p>
                          <div className="pt-0.5">
                            <span className="inline-block px-2.5 py-0.5 bg-amber-500/20 border border-amber-400/60 text-amber-300 font-mono text-[8px] uppercase font-bold tracking-wider rounded-full">
                              GELAR: PENJAGA NYALA LITERASI
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Inspiring Quote Box */}
                      <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-zinc-900/90 to-zinc-900/60 border-l-4 border-amber-400 rounded-xs space-y-1">
                        <p className="font-serif italic text-xs text-zinc-200 leading-relaxed">
                          &ldquo;Tangan yang membolak-balik buku adalah tangan yang merawat masa depan bangsa.&rdquo;
                        </p>
                        <div className="text-right font-mono text-[8.5px] text-amber-300 font-semibold uppercase">
                          — Pramono Wibowo (Catatan Warga)
                        </div>
                      </div>

                      {/* 4 Achievement Pillars */}
                      <div className="grid grid-cols-4 gap-2 font-mono text-center pt-0.5">
                        <div className="p-2 border border-zinc-800 bg-zinc-900/90 rounded-xs">
                          <span className="text-[7.5px] uppercase tracking-wider text-zinc-400 block">Tulisan</span>
                          <span className="font-serif font-black text-base text-amber-300">8</span>
                        </div>
                        <div className="p-2 border border-zinc-800 bg-zinc-900/90 rounded-xs">
                          <span className="text-[7.5px] uppercase tracking-wider text-zinc-400 block">Lencana</span>
                          <span className="font-serif font-black text-base text-amber-300">6</span>
                        </div>
                        <div className="p-2 border border-zinc-800 bg-zinc-900/90 rounded-xs">
                          <span className="text-[7.5px] uppercase tracking-wider text-zinc-400 block">Pinjaman</span>
                          <span className="font-serif font-black text-base text-amber-300">14</span>
                        </div>
                        <div className="p-2 border border-zinc-800 bg-zinc-900/90 rounded-xs">
                          <span className="text-[7.5px] uppercase tracking-wider text-zinc-400 block">Amanah</span>
                          <span className="font-serif font-black text-base text-amber-300">100%</span>
                        </div>
                      </div>

                      {/* Bottom Verification Seal */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80 gap-2">
                        <Logo className="h-6 w-auto text-amber-400 shrink-0" />
                        <div className="flex-1 min-w-0 text-right space-y-0.5 font-mono text-[7.5px] text-zinc-400">
                          <span className="text-amber-300 block font-bold">perpusjalblora.id/warga/@pramono</span>
                          <span>DOKUMEN RESMI WARGA LITERASI</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Showcase Badges Row beneath the card */}
                  <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-center">
                    <div className="p-2 bg-zinc-900/90 border border-amber-500/30 rounded-xs flex items-center justify-center gap-1.5 text-amber-300 text-[10px]">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold">Pena Emas</span>
                    </div>
                    <div className="p-2 bg-zinc-900/90 border border-amber-500/30 rounded-xs flex items-center justify-center gap-1.5 text-amber-300 text-[10px]">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold">Penjaga Nyala</span>
                    </div>
                    <div className="p-2 bg-zinc-900/90 border border-amber-500/30 rounded-xs flex items-center justify-center gap-1.5 text-amber-300 text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold">Warga Amanah</span>
                    </div>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. ETALASE KOLEKSI PILIHAN DI RAK & HAMPARAN TERPAL       */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
          {/* Section Header Broadsheet */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b-2 border-foreground gap-4">
            <div className="space-y-1">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-ultra text-muted flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>[ SEKSI IV // ETALASE KOLEKSI ]</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
                BUKU DI RAK &amp; HAMPARAN TERPAL
              </h2>
              <p className="font-serif text-sm sm:text-base text-muted max-w-xl">
                Ratusan pustaka berharga yang dirawat secara swadaya. Siap kamu baca bersila di lapak Minggu pagi
                CFD Alun-Alun Blora atau dipesan daring untuk dijemput.
              </p>
            </div>
            <Link
              href="/buku"
              className="font-mono text-xs uppercase tracking-wider underline hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center gap-1.5 font-bold shrink-0"
            >
              <span>JELAJAHI SEMUA 240+ KOLEKSI &rarr;</span>
            </Link>
          </div>

          {/* CURATOR'S SPOTLIGHT BANNER: Mahakarya Pramoedya Ananta Toer */}
          <RevealOnScroll variant="fade-up" className="mb-10">
            <div className="border-2 border-foreground bg-surface p-6 sm:p-8 relative overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.9)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left Mini Book Visual */}
                <div className="lg:col-span-3 flex justify-center lg:justify-start">
                  <div className="relative w-36 sm:w-40 h-52 sm:h-56 bg-gradient-to-br from-[#2b1810] to-[#0f0703] border-2 border-amber-600/60 p-4 flex flex-col justify-between text-amber-100 shadow-xl rounded-xs">
                    {/* Spine detail */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-amber-700 border-r border-amber-500/40" />
                    <div className="pl-2 font-mono text-[8px] uppercase tracking-widest text-amber-300/80">
                      KLASIK BLORA &bull; 1980
                    </div>
                    <div className="pl-2 space-y-1">
                      <div className="font-serif font-black text-lg leading-tight uppercase text-amber-200">
                        Bumi Manusia
                      </div>
                      <div className="font-mono text-[10px] text-amber-400">Pramoedya A.T.</div>
                    </div>
                    <div className="pl-2 font-mono text-[8px] text-zinc-400 uppercase tracking-widest border-t border-amber-500/30 pt-1.5">
                      RAK-SAS-01
                    </div>
                  </div>
                </div>

                {/* Right Editorial Spotlight Context */}
                <div className="lg:col-span-9 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-500 text-black font-mono text-[9px] font-bold uppercase tracking-widest">
                      ✦ PILIHAN UTAMA KURATOR PEKAN INI ✦
                    </span>
                    <span className="font-mono text-[10px] text-muted uppercase">
                      Koleksi Paling Dicari di Lapak CFD
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-black text-foreground">
                    &ldquo;Bumi Manusia&rdquo; — Menegakkan Harga Diri Manusia Merdeka
                  </h3>

                  <p className="font-serif text-sm sm:text-base text-foreground/85 leading-relaxed max-w-3xl">
                    Lahir dari rahim Blora, karya agung Pramoedya Ananta Toer ini adalah bacaan wajib bagi siapa saja
                    yang ingin memahami bagaimana literasi, martabat, dan keberanian berpikir mampu mengguncang
                    rantai feodalisme dan kolonialisme. Tersedia di rak utama lapak Car Free Day.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      href="/buku/PJ-2026-0001"
                      className="px-5 py-2.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>PESAN UNTUK DIAMBIL DI CFD</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <span className="font-mono text-xs text-muted">
                      Status:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ● Siap Dipinjam Minggu Pagi
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Interactive Category Filter Pills with Live Counts */}
          <div className="flex flex-wrap items-center gap-2 mb-8 font-mono text-xs">
            <span className="text-muted text-[11px] uppercase mr-1">Filter Kategori:</span>
            {[
              { id: 'all', label: 'Semua Koleksi', count: '240+' },
              { id: 'sastra', label: 'Sastra & Roman', count: '85' },
              { id: 'sejarah', label: 'Sejarah & Samin', count: '42' },
              { id: 'sosial', label: 'Sosial & Filsafat', count: '56' },
              { id: 'pendidikan', label: 'Pedagogi Kritis', count: '32' },
              { id: 'anak', label: 'Buku Anak & Fabel', count: '25' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-3.5 py-1.5 border font-bold uppercase tracking-wider text-[11px] transition-all cursor-pointer flex items-center gap-1.5',
                  selectedCategory === cat.id
                    ? 'bg-foreground text-background border-foreground shadow-xs'
                    : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                )}
              >
                <span>{cat.label}</span>
                <span
                  className={cn(
                    'text-[9px] px-1.5 py-0.2 rounded-full',
                    selectedCategory === cat.id
                      ? 'bg-amber-400 text-black font-extrabold'
                      : 'bg-surface-muted text-muted font-normal'
                  )}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Book Jackets Grid (Tactile Editorial Covers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBooks.slice(0, 4).map((book, idx) => (
              <RevealOnScroll key={book.code} variant="fade-up" delayMs={idx * 100}>
                <div className="border-2 border-foreground bg-surface p-5 flex flex-col justify-between group hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] transition-all h-full">
                  <div>
                    {/* Top Metadata Strip */}
                    <div className="flex items-center justify-between text-[10px] font-mono pb-2 mb-3 border-b border-border-hairline">
                      <span className="text-muted font-bold tracking-wider">{book.shelf}</span>
                      <StatusPill status={book.status} />
                    </div>

                    {/* Tactile Book Jacket Graphic */}
                    <div
                      className={cn(
                        'relative border-2 border-foreground/30 bg-gradient-to-br h-52 mb-4 p-4 flex flex-col justify-between text-left transition-all duration-300 shadow-md group-hover:border-foreground rounded-xs overflow-hidden',
                        book.coverBg,
                        book.textColor
                      )}
                    >
                      {/* Left Spine Fold Line */}
                      <div
                        className={cn(
                          'absolute left-0 top-0 bottom-0 w-3.5 border-r border-white/20',
                          book.spineColor
                        )}
                      />

                      {/* Thin vintage border frame inside cover */}
                      <div className="absolute inset-2 border border-white/10 pointer-events-none rounded-xs" />

                      <div className="pl-2 font-mono text-[9px] uppercase tracking-widest opacity-75">
                        [ {book.category} &bull; {book.year} ]
                      </div>

                      <div className="pl-2 relative z-10 space-y-1">
                        <div className="font-serif text-lg font-black uppercase leading-tight line-clamp-2 drop-shadow-sm">
                          {book.title}
                        </div>
                        <div className="font-mono text-[11px] opacity-90 font-medium">
                          {book.author}
                        </div>
                      </div>

                      <div className="pl-2 font-mono text-[8px] opacity-70 uppercase tracking-widest">
                        PERPUSJAL &bull; {book.code}
                      </div>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-foreground mb-1 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:underline line-clamp-1 transition-colors">
                      <Link href={`/buku/${book.code}`}>{book.title}</Link>
                    </h3>
                    <p className="font-mono text-xs text-muted mb-2">{book.author}</p>
                    <p className="font-serif text-xs text-foreground/80 leading-relaxed line-clamp-2">
                      {book.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-5 border-t border-border-hairline flex items-center justify-between text-xs font-mono">
                    <span className="text-muted uppercase text-[9.5px] font-semibold">{book.category}</span>
                    <Link
                      href={`/buku/${book.code}`}
                      className="font-bold uppercase tracking-wider group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1 text-foreground transition-colors"
                    >
                      <span>PINJAM BUKU</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          {/* Bottom Community Donation Notice */}
          <RevealOnScroll variant="fade-up" delayMs={200}>
            <div className="mt-10 p-5 bg-surface-muted/40 border border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-foreground/90 font-serif text-sm">
                  Punya buku yang menganggur di lemari rumah? Hibahkan ke terpal rakyat Blora untuk dibaca ratusan pasang mata.
                </span>
              </div>
              <Link
                href="/kontributor"
                className="px-4 py-2 border border-foreground bg-surface hover:bg-foreground hover:text-background font-mono text-xs uppercase font-bold tracking-wider transition-colors shrink-0"
              >
                TITIP ATAU HIBAHKAN BUKU &rarr;
              </Link>
            </div>
          </RevealOnScroll>
        </section>

        {/* ========================================================= */}
        {/* 5. SEKSI WARTA & TULISAN KURASI WARGA (MEJA REDAKSI)       */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
          {/* Section Header Broadsheet */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b-2 border-foreground gap-4">
            <div className="space-y-1">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-ultra text-muted flex items-center gap-2">
                <Feather className="w-3.5 h-3.5 text-amber-500" />
                <span>[ SEKSI V // MEJA REDAKSI &amp; JURNALISME WARGA ]</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
                KATA-KATA DARI SUDUT JALANAN
              </h2>
              <p className="font-serif text-sm sm:text-base text-muted max-w-2xl">
                Ruang wacana merdeka yang dirawat secara swadaya. Dari buruh tani, relawan lapak, hingga pelajar desa
                — setiap warga memiliki hak untuk menuliskan pengamatan, resensi buku, dan kritik zaman tanpa sensor.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/tulis"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Feather className="w-3.5 h-3.5" />
                <span>TULIS WARTAMU ✎</span>
              </Link>

              <Link
                href="/artikel"
                className="font-mono text-xs uppercase tracking-wider underline hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center gap-1 font-bold"
              >
                <span>SEMUA 48+ ARTIKEL &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Two-Wing Editorial Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Wing (7 cols): Lead Editorial / Tajuk Utama Redaksi */}
            <div className="lg:col-span-7">
              <RevealOnScroll variant="fade-up" delayMs={100} className="h-full">
                {CURATED_ARTICLES[0] && (
                  <article className="border-2 border-foreground bg-surface p-6 sm:p-8 flex flex-col justify-between h-full shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.9)] relative group">
                    <div>
                      {/* Top Curatorial Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-border-hairline text-[10.5px] font-mono uppercase tracking-wider">
                        <span className="px-2.5 py-0.5 bg-foreground text-background font-bold inline-flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>TAJUK UTAMA PEKAN INI</span>
                        </span>
                        <div className="flex items-center gap-2 text-muted">
                          <span>{CURATED_ARTICLES[0].category}</span>
                          <span>&bull;</span>
                          <span>{CURATED_ARTICLES[0].publishedAt}</span>
                          <span>&bull;</span>
                          <span className="text-foreground font-semibold">{CURATED_ARTICLES[0].readTime}</span>
                        </div>
                      </div>

                      {/* Main Title */}
                      <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:underline transition-colors leading-[1.15] mb-4">
                        <Link href={`/artikel/${CURATED_ARTICLES[0].slug}`}>
                          {CURATED_ARTICLES[0].title}
                        </Link>
                      </h3>

                      {/* Pull Quote Box */}
                      <div className="p-4 sm:p-5 bg-surface-muted/60 border-l-4 border-amber-500 my-5 space-y-2">
                        <Quote className="w-5 h-5 text-amber-500 opacity-80" />
                        <blockquote className="font-serif italic text-base sm:text-lg text-foreground/90 leading-snug">
                          &ldquo;{CURATED_ARTICLES[0].leadQuote}&rdquo;
                        </blockquote>
                        <cite className="block font-mono text-[10px] uppercase text-muted tracking-wider not-italic">
                          — Catatan Pinggir Redaksi Lapak
                        </cite>
                      </div>

                      {/* Summary Paragraph */}
                      <p className="font-serif text-base text-foreground/80 leading-relaxed mb-6">
                        {CURATED_ARTICLES[0].summary}
                      </p>
                    </div>

                    {/* Author & Dispatch Footer */}
                    <div className="pt-5 border-t border-border-hairline flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-foreground bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-serif text-base font-bold shrink-0">
                          {CURATED_ARTICLES[0].author[0]}
                        </div>
                        <div>
                          <div className="font-mono text-xs font-bold text-foreground">
                            {CURATED_ARTICLES[0].author}
                          </div>
                          <div className="font-mono text-[10px] text-muted">
                            {CURATED_ARTICLES[0].authorRole} &bull; Lulus Kurasi
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/artikel/${CURATED_ARTICLES[0].slug}`}
                        className="px-4 py-2 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>BACA TAJUK LENGKAP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                )}
              </RevealOnScroll>
            </div>

            {/* Right Wing (5 cols): 3 Secondary Dispatches with Divider Lines */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {CURATED_ARTICLES.slice(1, 4).map((article, idx) => (
                <RevealOnScroll key={article.slug} variant="fade-up" delayMs={150 + idx * 100}>
                  <article className="border-2 border-foreground bg-surface p-5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] transition-all group">
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-widest pb-2 mb-2 border-b border-border-hairline">
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {article.editionCode} // {article.category}
                      </span>
                      <span>{article.readTime}</span>
                    </div>

                    <h4 className="font-serif text-lg sm:text-xl font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:underline transition-colors leading-snug mb-2">
                      <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
                    </h4>

                    <p className="font-serif text-xs sm:text-sm text-foreground/75 leading-relaxed line-clamp-2 mb-3">
                      {article.summary}
                    </p>

                    <div className="pt-2 border-t border-border-hairline flex items-center justify-between font-mono text-[10.5px]">
                      <span className="text-muted">
                        Oleh <strong className="text-foreground">{article.author}</strong> ({article.authorRole})
                      </span>
                      <Link
                        href={`/artikel/${article.slug}`}
                        className="font-bold uppercase tracking-wider text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 inline-flex items-center gap-0.5 transition-colors"
                      >
                        <span>BACA</span>
                        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          {/* Open Redaction Invitation Strip */}
          <RevealOnScroll variant="fade-up" delayMs={300}>
            <div className="mt-10 border-2 border-foreground bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6 sm:p-8 relative overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.9)]">
              {/* Subtle gold glow */}
              <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-[9px] uppercase font-bold tracking-widest">
                    <Feather className="w-3 h-3" />
                    <span>MEJA REDAKSI TERBUKA // BERSUARA TANPA SENSOR</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-black text-white">
                    Punya Catatan, Resensi, atau Renungan tentang Blora?
                  </h3>
                  <p className="font-serif text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    Setiap naskah kiriman warga akan dikurasi secara bersahabat oleh dewan kolektif. Tulisan yang
                    terbit otomatis mencatatkan poin literasi dan membuka <strong>Lencana Pena Emas</strong> di Kartu
                    Kehormatan Wargamu.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <Link
                    href="/tulis"
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider text-center transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] inline-flex items-center justify-center gap-2"
                  >
                    <Feather className="w-4 h-4 text-black" />
                    <span>KIRIM TULISAN SEKARANG</span>
                  </Link>

                  <Link
                    href="/tentang"
                    className="px-4 py-3 border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider text-center transition-colors"
                  >
                    <span>ETOS KURASI</span>
                  </Link>
                </div>
              </div>
            </div>
          </RevealOnScroll>
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
