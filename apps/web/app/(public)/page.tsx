'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { StatusPill } from '@/components/ui/status-pill';
import { Logo } from '@/components/logo';
import { EventCountdown } from '@/components/events/event-countdown';
import { apiClient } from '@/lib/api';
import { BookItem } from '@perpusjal/types';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Feather,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  Quote,
  Search,
  MapPin,
  Flame,
  Award,
  BookMarked,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// High-fidelity fallback books for initial render before API responds
const INITIAL_CURATED_BOOKS = [
  {
    id: 'b-01',
    code: 'PJ-2026-0001',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    category: { id: 'c1', name: 'Sastra & Roman', slug: 'sastra' },
    status: 'AVAILABLE' as const,
    publicationYear: 1980,
    shelfLocation: 'RAK-SAS-01',
    spineColor: 'bg-amber-800',
    coverBg: 'from-[#2b1810] to-[#120a06]',
    textColor: 'text-amber-100',
    description: 'Roman sejarah monumental tentang kebangkitan kesadaran manusia merdeka di Hindia Belanda.',
  },
  {
    id: 'b-02',
    code: 'PJ-2026-0024',
    title: 'Madilog',
    author: 'Tan Malaka',
    category: { id: 'c2', name: 'Sosial & Filsafat', slug: 'sosial' },
    status: 'AVAILABLE' as const,
    publicationYear: 1943,
    shelfLocation: 'RAK-FIL-03',
    spineColor: 'bg-rose-900',
    coverBg: 'from-[#280d12] to-[#120508]',
    textColor: 'text-rose-100',
    description: 'Materialisme, Dialektika, dan Logika sebagai fondasi berpikir merdeka rakyat jelata.',
  },
  {
    id: 'b-03',
    code: 'PJ-2026-0045',
    title: 'Gadis Pantai',
    author: 'Pramoedya Ananta Toer',
    category: { id: 'c1', name: 'Sastra & Roman', slug: 'sastra' },
    status: 'AVAILABLE' as const,
    publicationYear: 1982,
    shelfLocation: 'RAK-SAS-02',
    spineColor: 'bg-teal-900',
    coverBg: 'from-[#0b2528] to-[#041214]',
    textColor: 'text-teal-100',
    description: 'Kisah pilu penindasan feodalisme Jawa terhadap perempuan bersahaja dari kampung nelayan.',
  },
  {
    id: 'b-04',
    code: 'PJ-2026-0089',
    title: 'Orang-Orang di Tikungan Jalan',
    author: 'Pramoedya Ananta Toer',
    category: { id: 'c3', name: 'Sejarah & Samin', slug: 'sejarah' },
    status: 'BORROWED' as const,
    publicationYear: 1954,
    shelfLocation: 'RAK-SEJ-01',
    spineColor: 'bg-stone-800',
    coverBg: 'from-[#211f1d] to-[#0e0e0c]',
    textColor: 'text-stone-200',
    description: 'Dua lakon sandiwara tentang pergulatan revolusi dan manusia di persimpangan zaman.',
  },
  {
    id: 'b-05',
    code: 'PJ-2026-0112',
    title: 'Pendidikan Kaum Tertindas',
    author: 'Paulo Freire',
    category: { id: 'c4', name: 'Pedagogi Kritis', slug: 'pendidikan' },
    status: 'AVAILABLE' as const,
    publicationYear: 1968,
    shelfLocation: 'RAK-PED-01',
    spineColor: 'bg-emerald-900',
    coverBg: 'from-[#0c2618] to-[#04120a]',
    textColor: 'text-emerald-100',
    description: 'Pedagogi pembebasan yang mengubah pendidikan dari sistem perbankan pasif menjadi dialog kritis.',
  },
  {
    id: 'b-06',
    code: 'PJ-2026-0140',
    title: 'Jalan Tak Ada Ujung',
    author: 'Mochtar Lubis',
    category: { id: 'c1', name: 'Sastra & Roman', slug: 'sastra' },
    status: 'AVAILABLE' as const,
    publicationYear: 1952,
    shelfLocation: 'RAK-SAS-04',
    spineColor: 'bg-indigo-900',
    coverBg: 'from-[#12152e] to-[#070817]',
    textColor: 'text-indigo-100',
    description: 'Eksplorasi psikologis mendalam tentang ketakutan batin, martabat, dan idealisme masa revolusi.',
  },
  {
    id: 'b-07',
    code: 'PJ-2026-0165',
    title: 'Cerita Rakyat Nusantara & Fabel Jawa',
    author: 'Koleksi Dongeng Rakyat',
    category: { id: 'c5', name: 'Buku Anak & Fabel', slug: 'anak' },
    status: 'AVAILABLE' as const,
    publicationYear: 2019,
    shelfLocation: 'RAK-ANK-02',
    spineColor: 'bg-amber-700',
    coverBg: 'from-[#2a1d07] to-[#120c02]',
    textColor: 'text-amber-200',
    description: 'Dongeng bergambar pengantar imajinasi dan kearifan lokal untuk anak-anak pembaca trotoar.',
  },
  {
    id: 'b-08',
    code: 'PJ-2026-0188',
    title: 'Samin Surosentiko & Gerakan Petani',
    author: 'Kajian Sejarah Budaya',
    category: { id: 'c3', name: 'Sejarah & Samin', slug: 'sejarah' },
    status: 'AVAILABLE' as const,
    publicationYear: 2015,
    shelfLocation: 'RAK-SEJ-02',
    spineColor: 'bg-yellow-900',
    coverBg: 'from-[#2b200b] to-[#120d04]',
    textColor: 'text-yellow-100',
    description: 'Ajaran Sedulur Sikep, perlawanan tanpa kekerasan, dan kedaulatan tanah adat di bumi Blora.',
  },
];

interface BooksApiResponse {
  data: BookItem[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export default function HomePage() {
  const router = useRouter();

  // Books from API
  const [books, setBooks] = React.useState<BookItem[]>([]);
  const [loadingBooks, setLoadingBooks] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Subtle Mouse Parallax on Hero Watermark
  const [heroMouseOffset, setHeroMouseOffset] = React.useState({ x: 0, y: 0 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((clientY - rect.top) / rect.height - 0.5) * 16;
    setHeroMouseOffset({ x, y });
  };

  // Subtle 3D Light Sheen & Tilt on Citizen Card
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [cardTilt, setCardTilt] = React.useState({ rotateX: 0, rotateY: 0, sheenX: 50, sheenY: 50, sheenOpacity: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xRel = (e.clientX - rect.left) / rect.width;
    const yRel = (e.clientY - rect.top) / rect.height;

    const rotateY = (xRel - 0.5) * 10;
    const rotateX = -(yRel - 0.5) * 10;

    setCardTilt({
      rotateX,
      rotateY,
      sheenX: xRel * 100,
      sheenY: yRel * 100,
      sheenOpacity: 0.18,
    });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({
      rotateX: 0,
      rotateY: 0,
      sheenX: 50,
      sheenY: 50,
      sheenOpacity: 0,
    });
  };

  // Fetch real books from backend
  React.useEffect(() => {
    let isMounted = true;
    async function loadBooks() {
      try {
        const res = await apiClient<BooksApiResponse>('/books?perPage=8&sort=terbaru');
        if (isMounted && res.data && res.data.data && res.data.data.length > 0) {
          setBooks(res.data.data);
        }
      } catch (err) {
        // Fallback remains in place
        console.error('Failed to load books from API:', err);
      } finally {
        if (isMounted) setLoadingBooks(false);
      }
    }
    loadBooks();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buku?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/buku');
    }
  };

  // Display books list: API books or fallback curated books
  const displayBooks = books.length > 0 ? books : INITIAL_CURATED_BOOKS;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background editorial-grain">
      <Header />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* 1. FRONT-PAGE HERO: THE BROADSHEET MASTHEAD (STANDAR TENTANG) */}
        {/* ========================================================= */}
        <section
          onMouseMove={handleHeroMouseMove}
          className="border-b-2 border-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-14 sm:pb-20 relative overflow-hidden"
        >
          {/* Subtle Typography Watermark */}
          <div
            style={{
              transform: `translate3d(${heroMouseOffset.x * 1.5}px, ${heroMouseOffset.y * 1.5}px, 0)`,
              transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.035] select-none pointer-events-none font-serif text-[180px] sm:text-[300px] font-black leading-none text-foreground tracking-tighter"
          >
            PERPUSJAL
          </div>

          {/* Authentic Gazette Masthead Top Ledger */}
          <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3.5 mb-10 sm:mb-14 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted gap-2 relative z-10">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 relative z-10 items-start">
            {/* Left Big Lead (8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-8">
              <RevealOnScroll variant="fade-up" delayMs={100}>
                <div className="space-y-5 sm:space-y-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1 border border-foreground font-mono text-[9px] sm:text-[10px] tracking-widest uppercase font-bold bg-foreground text-background">
                    <span>RUANG PERJUMPAAN MERDEKA</span>
                  </div>

                  {/* Monumental Headline: MEMBACA DAN BERBAHAGIA */}
                  <h1 className="font-serif font-black uppercase text-foreground leading-[1.02] sm:leading-[0.92] tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl break-words">
                    MEMBACA DAN <br />
                    <span className="italic font-serif font-normal text-foreground">
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

              {/* Action Buttons Bar (Clean 2-Action Streamline) */}
              <RevealOnScroll variant="fade-up" delayMs={200}>
                <div className="pt-4 border-t border-border-hairline flex flex-wrap gap-3 sm:gap-4 items-center">
                  <Link
                    href="/buku"
                    className="px-6 py-3.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all shadow-xs inline-flex items-center gap-2"
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
                </div>
              </RevealOnScroll>
            </div>

            {/* Right Side Editorial Callout (4 cols) */}
            <div className="lg:col-span-4 border-t-2 lg:border-t-0 lg:border-l-2 border-foreground pt-8 lg:pt-0 lg:pl-8 flex flex-col justify-between space-y-6">
              {/* Quote Card */}
              <RevealOnScroll variant="slide-right" delayMs={250}>
                <div className="space-y-4">
                  <div className="text-[10px] font-mono uppercase tracking-ultra text-muted flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-foreground" />
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

              {/* Dynamic Live CFD Lapak Board */}
              <RevealOnScroll variant="fade-up" delayMs={350}>
                <div className="border-2 border-foreground p-5 bg-surface font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border-hairline text-[10px] uppercase tracking-widest text-muted">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-foreground" />
                      <span>SESI LAPAK BERIKUTNYA</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-black uppercase text-foreground">
                      MINGGU PAGI &bull; CFD ALUN-ALUN
                    </div>
                    <div className="text-xs text-muted flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>06.00 – 09.00 WIB (Depan Pendopo)</span>
                    </div>
                  </div>

                  {/* Real-time Dynamic Countdown Integration */}
                  <div className="pt-2 border-t border-border-hairline">
                    <EventCountdown variant="embedded" />
                  </div>

                  <p className="font-serif text-xs text-foreground/80 leading-relaxed border-t border-border-hairline pt-3">
                    Bawa senyuman dan rasa ingin tahumu. Buku pesanan daringmu siap diambil langsung di hamparan terpal.
                  </p>

                  <div className="pt-1">
                    <Link
                      href="/tentang#lapak"
                      className="font-mono text-[10.5px] uppercase font-bold text-foreground hover:underline inline-flex items-center gap-1.5"
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
        {/* 2. SHOWCASE: KARTU IDENTITAS WARGA (TACTILE PRESS PASS)    */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground bg-foreground text-background py-16 sm:py-24 relative overflow-hidden select-none">
          {/* Subtle Background Watermark */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.035] pointer-events-none font-serif text-[180px] sm:text-[280px] font-black leading-none text-background tracking-tighter">
            WARGA
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
              {/* Left Column: Narrative & Rank Progression Ledger (7 cols) */}
              <div className="lg:col-span-7">
                <RevealOnScroll variant="fade-up">
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 border border-background/40 bg-background/10 font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-background">
                        <Sparkles className="w-3.5 h-3.5 text-background" />
                        <span>ARSIP IDENTITAS // KARTU SIRKULASI TERPAL</span>
                      </div>

                      <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-background leading-[1.05] mt-4">
                        Jejak Bacamu Adalah <br />
                        <span className="italic font-serif font-normal text-background/90">
                          Kehormatan Tertinggi.
                        </span>
                      </h2>

                      <p className="font-serif text-base sm:text-lg text-background/80 leading-relaxed max-w-2xl mt-4">
                        Di Perpusjal Blora, membaca bukan sekadar kegiatan pasif. Setiap buku yang kamu
                        pinjam dan warta yang kamu tulis mencatatkan reputasi literasi terbuka dalam{' '}
                        <strong className="text-background font-bold">Kartu Warga Literasi</strong> bersertifikasi publik
                        — tanpa uang jaminan dan tanpa denda rupiah seumur hidup.
                      </p>
                    </div>

                    {/* Streamlined Citizen Rank Progression (Summary of Unique Titles) */}
                    <div className="space-y-3 pt-2 border-t border-background/20 font-mono">
                      <div className="text-[10px] uppercase tracking-widest text-background/70 font-bold">
                        [ SISTEM REPUTASI // JENJANG GELAR KEHORMATAN ]
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-background/5 border border-background/20 flex items-start gap-3 rounded-xs">
                          <span className="text-background font-mono font-bold text-[11px] shrink-0 border border-background/30 px-1.5 py-0.5">
                            01
                          </span>
                          <div>
                            <div className="font-bold text-background uppercase tracking-wide text-[11px]">
                              Warga Pemula
                            </div>
                            <div className="font-serif text-[11px] text-background/75 mt-0.5">
                              Langkah awal terdaftar di hamparan terpal.
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-background/5 border border-background/20 flex items-start gap-3 rounded-xs">
                          <span className="text-background font-mono font-bold text-[11px] shrink-0 border border-background/30 px-1.5 py-0.5">
                            02
                          </span>
                          <div>
                            <div className="font-bold text-background uppercase tracking-wide text-[11px]">
                              Pembaca Terpal
                            </div>
                            <div className="font-serif text-[11px] text-background/75 mt-0.5">
                              Menuntaskan 3 peminjaman buku amanah.
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-background/5 border border-background/20 flex items-start gap-3 rounded-xs">
                          <span className="text-background font-mono font-bold text-[11px] shrink-0 border border-background/30 px-1.5 py-0.5">
                            03
                          </span>
                          <div>
                            <div className="font-bold text-background uppercase tracking-wide text-[11px]">
                              Pengelana Kata
                            </div>
                            <div className="font-serif text-[11px] text-background/75 mt-0.5">
                              Aktif mengulas buku atau menulis warta warga.
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-background/5 border border-background/20 flex items-start gap-3 rounded-xs">
                          <span className="text-background font-mono font-bold text-[11px] shrink-0 border border-background/30 px-1.5 py-0.5">
                            04
                          </span>
                          <div>
                            <div className="font-bold text-background uppercase tracking-wide text-[11px]">
                              Penjaga Nyala
                            </div>
                            <div className="font-serif text-[11px] text-background/75 mt-0.5">
                              Pilar penggerak literasi swadaya Blora.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Micro-chips of Sample Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="text-[10px] uppercase text-background/60 tracking-wider">
                          Lencana Kehormatan:
                        </span>
                        {[
                          { name: 'Pena Emas', icon: Award },
                          { name: 'Penjaga Nyala', icon: Flame },
                          { name: 'Kolektor Lembaran', icon: BookMarked },
                          { name: 'Warga Amanah', icon: ShieldCheck },
                        ].map((badge) => {
                          const IconComp = badge.icon;
                          return (
                            <span
                              key={badge.name}
                              className="px-2.5 py-1 bg-background/10 border border-background/25 text-background text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 rounded-xs"
                            >
                              <IconComp className="w-3 h-3 text-background" />
                              <span>{badge.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* CTA Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                      <Link
                        href="/masuk"
                        className="px-6 py-3.5 bg-background text-foreground font-mono text-xs font-bold uppercase tracking-wider hover:bg-background/90 transition-colors shadow-xs inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-foreground" />
                        <span>BUAT KARTU MILIKMU SEKARANG</span>
                        <ArrowRight className="w-3.5 h-3.5 text-foreground" />
                      </Link>

                      <Link
                        href="/kontributor"
                        className="px-5 py-3.5 border-2 border-background text-background hover:bg-background hover:text-foreground font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                      >
                        <span>JELAJAHI DAFTAR WARGA &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </RevealOnScroll>
              </div>

              {/* Right Column: Tactile Light-Sheen Press Pass (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <RevealOnScroll variant="stamp" delayMs={200} className="w-full max-w-md">
                  <div
                    ref={cardRef}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{
                      transform: `perspective(1000px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="relative group cursor-pointer"
                  >
                    <div
                      style={{
                        backgroundImage: `radial-gradient(circle at ${cardTilt.sheenX}% ${cardTilt.sheenY}%, rgba(255, 255, 255, ${cardTilt.sheenOpacity}) 0%, transparent 60%)`,
                      }}
                      className="relative bg-background text-foreground p-6 pb-6 border-2 border-background shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] select-none space-y-4 box-border rounded-xs overflow-hidden"
                    >
                      {/* Decorative corner markers */}
                      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-foreground pointer-events-none" />
                      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-foreground pointer-events-none" />
                      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-foreground pointer-events-none" />
                      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-foreground pointer-events-none" />

                      {/* Top Bar of the Card */}
                      <div className="border-b border-border-hairline pb-3 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <Logo className="h-7 w-auto text-foreground shrink-0" />
                          <div className="text-right shrink-0">
                            <span className="font-mono text-[7.5px] uppercase font-bold tracking-widest text-muted block mb-0.5">
                              NO. REGISTRASI RESMI
                            </span>
                            <span className="font-mono text-[10.5px] font-bold text-background bg-foreground tracking-wider px-2 py-0.5 rounded-xs inline-block">
                              BLR-2026-WARGA01
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-hairline">
                          <span className="font-mono text-[8.5px] uppercase font-bold tracking-[0.2em] text-foreground">
                            KARTU KEHORMATAN WARGA
                          </span>
                          <span className="font-serif italic text-xs text-muted">
                            Membaca dan Berbahagia.
                          </span>
                        </div>
                      </div>

                      {/* Persona Identity Strip */}
                      <div className="flex items-center gap-3.5 py-1">
                        <div className="w-13 h-13 rounded-full border-2 border-foreground bg-surface flex items-center justify-center font-serif text-xl font-bold text-foreground shrink-0 shadow-xs">
                          P
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className="font-serif font-black text-xl text-foreground tracking-wide truncate">
                            Pramono Wibowo
                          </h4>
                          <p className="font-mono text-[10.5px] text-muted">@pramono &bull; Warga Penggerak 2024</p>
                          <div className="pt-0.5">
                            <span className="inline-block px-2.5 py-0.5 bg-foreground text-background font-mono text-[8px] uppercase font-bold tracking-wider rounded-xs">
                              GELAR: PENJAGA NYALA LITERASI
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Inspiring Quote Box */}
                      <div className="p-3.5 bg-surface-muted/60 border-l-4 border-foreground rounded-xs space-y-1">
                        <p className="font-serif italic text-xs text-foreground/90 leading-relaxed">
                          &ldquo;Tangan yang membolak-balik buku adalah tangan yang merawat masa depan bangsa.&rdquo;
                        </p>
                        <div className="text-right font-mono text-[8.5px] text-muted font-semibold uppercase">
                          — Pramono Wibowo (Catatan Warga)
                        </div>
                      </div>

                      {/* 4 Achievement Pillars */}
                      <div className="grid grid-cols-4 gap-2 font-mono text-center pt-0.5">
                        <div className="p-2 border border-border-hairline bg-surface rounded-xs">
                          <span className="text-[7.5px] uppercase tracking-wider text-muted block">Tulisan</span>
                          <span className="font-serif font-black text-base text-foreground">8</span>
                        </div>
                        <div className="p-2 border border-border-hairline bg-surface rounded-xs">
                          <span className="text-[7.5px] uppercase tracking-wider text-muted block">Lencana</span>
                          <span className="font-serif font-black text-base text-foreground">6</span>
                        </div>
                        <div className="p-2 border border-border-hairline bg-surface rounded-xs">
                          <span className="text-[7.5px] uppercase tracking-wider text-muted block">Pinjaman</span>
                          <span className="font-serif font-black text-base text-foreground">14</span>
                        </div>
                        <div className="p-2 border border-border-hairline bg-surface rounded-xs">
                          <span className="text-[7.5px] uppercase tracking-wider text-muted block">Amanah</span>
                          <span className="font-serif font-black text-base text-foreground">100%</span>
                        </div>
                      </div>

                      {/* Bottom Verification Seal */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-border-hairline gap-2">
                        <Logo className="h-6 w-auto text-foreground shrink-0" />
                        <div className="flex-1 min-w-0 text-right space-y-0.5 font-mono text-[7.5px] text-muted">
                          <span className="text-foreground block font-bold">perpusjalblora.id/warga/@pramono</span>
                          <span>DOKUMEN RESMI WARGA LITERASI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. ETALASE KOLEKSI BUKU: RAK TERPAL DINAMIS (LIVE API)     */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
          {/* Section Header Broadsheet with Sharp Contrast & Quick Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b-2 border-foreground gap-6">
            <div className="space-y-2">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-ultra text-foreground/70 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-foreground" />
                <span>[ SEKSI KOLEKSI // RAK &amp; TERPAL ]</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground leading-[1.05]">
                BUKU DI RAK &amp; HAMPARAN TERPAL
              </h2>
              <p className="font-serif text-sm sm:text-base text-foreground/80 max-w-2xl leading-relaxed">
                Pustaka terpilih yang dirawat secara swadaya. Siap kamu baca bersila di lapak Minggu pagi
                CFD Alun-Alun Blora atau dipesan daring untuk dijemput langsung.
              </p>
            </div>

            {/* Quick Search Bar & Full Catalog Link */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <form onSubmit={handleQuickSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul buku... [↵]"
                  className="w-full sm:w-64 px-3 py-2.5 pl-8 bg-surface border-2 border-foreground font-mono text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-foreground transition-all shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 pointer-events-none" />
              </form>

              <Link
                href="/buku"
                className="px-4 py-2.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
              >
                <span>SEMUA BUKU &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Book Jackets Grid (Tactile Editorial Covers with Live DB Status) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayBooks.slice(0, 8).map((book, idx) => {
              // Determine shelf and status
              const shelf = ('shelfLocation' in book && book.shelfLocation) ? book.shelfLocation : 'RAK-CFD';
              const availability = ('availability' in book) ? book.availability : (('status' in book && book.status === 'BORROWED') ? 'BORROWED' : 'AVAILABLE');
              const bookYear = ('publicationYear' in book && book.publicationYear) ? book.publicationYear : 2024;
              const categoryName = typeof book.category === 'object' && book.category ? book.category.name : 'Pustaka Terpal';
              const bookSlug = ('slug' in book && book.slug) ? book.slug : (('code' in book) ? book.code : book.id);

              return (
                <RevealOnScroll key={book.id || idx} variant="fade-up" delayMs={idx * 75}>
                  <div className="border-2 border-foreground bg-surface p-5 flex flex-col justify-between group hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] transition-all h-full">
                    <div>
                      {/* Top Metadata Strip */}
                      <div className="flex items-center justify-between text-[10px] font-mono pb-2 mb-3 border-b border-border-hairline">
                        <span className="text-muted font-bold tracking-wider">{shelf}</span>
                        <StatusPill status={availability === 'AVAILABLE' ? 'available' : 'borrowed'} />
                      </div>

                      {/* Tactile Book Jacket Graphic */}
                      <div className="relative border-2 border-foreground/30 bg-gradient-to-br from-[#1c1917] to-[#0c0a09] text-stone-100 h-52 mb-4 p-4 flex flex-col justify-between text-left transition-all duration-300 shadow-md group-hover:border-foreground rounded-xs overflow-hidden">
                        {/* Left Spine Fold Line */}
                        <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-foreground border-r border-white/20" />

                        {/* Thin vintage border frame inside cover */}
                        <div className="absolute inset-2 border border-white/10 pointer-events-none rounded-xs" />

                        <div className="pl-2 font-mono text-[9px] uppercase tracking-widest opacity-75 truncate">
                          [ {categoryName} &bull; {bookYear} ]
                        </div>

                        <div className="pl-2 relative z-10 space-y-1">
                          <div className="font-serif text-lg font-black uppercase leading-tight line-clamp-2 drop-shadow-sm text-white">
                            {book.title}
                          </div>
                          <div className="font-mono text-[11px] opacity-90 font-medium text-stone-300">
                            {book.author}
                          </div>
                        </div>

                        <div className="pl-2 font-mono text-[8px] opacity-70 uppercase tracking-widest text-stone-400">
                          PERPUSJAL &bull; {shelf}
                        </div>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-foreground mb-1 leading-snug group-hover:underline line-clamp-1 transition-colors">
                        <Link href={`/buku/${bookSlug}`}>{book.title}</Link>
                      </h3>
                      <p className="font-mono text-xs text-muted mb-2">{book.author}</p>
                      <p className="font-serif text-xs text-foreground/80 leading-relaxed line-clamp-2">
                        {book.description || 'Pustaka pilihan yang siap kamu baca dan diskusikan di lapak Minggu pagi CFD Blora.'}
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-border-hairline flex items-center justify-between text-xs font-mono">
                      <span className="text-muted uppercase text-[9.5px] font-semibold truncate max-w-[130px]">
                        {categoryName}
                      </span>
                      <Link
                        href={`/buku/${bookSlug}`}
                        className="font-bold uppercase tracking-wider group-hover:underline flex items-center gap-1 text-foreground transition-colors shrink-0"
                      >
                        <span>PINJAM BUKU</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. GRAND CALL TO ACTION: LESEHAN DI ALUN-ALUN BLORA       */}
        {/* ========================================================= */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <RevealOnScroll variant="fade-up">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-foreground font-mono text-[9px] uppercase tracking-widest font-bold bg-foreground text-background">
                <span>PANGGILAN TROTOAR // ALUN-ALUN BLORA</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-foreground leading-[1.05]">
                Trotoar Menunggu <br />
                <span className="italic font-serif font-normal">Jejak Langkahmu.</span>
              </h2>
              <p className="font-serif text-base sm:text-lg text-foreground/85 leading-relaxed max-w-2xl mx-auto">
                Setiap Minggu pagi, lembaran terpal biru dihamparkan di depan Pendopo Kabupaten Blora.
                Mari datang, duduk bersila, temukan buku pilihanmu, atau buat kartu warga digitalmu sekarang.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-4 font-mono text-xs">
                <Link
                  href="/tentang#lapak"
                  className="px-6 py-3.5 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-2 shadow-xs"
                >
                  <MapPin className="w-4 h-4" />
                  <span>PETA &amp; JADWAL CFD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/masuk"
                  className="px-6 py-3.5 border-2 border-foreground bg-surface hover:bg-foreground hover:text-background font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>BUAT KARTU WARGA</span>
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
