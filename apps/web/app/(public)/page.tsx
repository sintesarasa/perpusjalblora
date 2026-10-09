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
import { apiClient } from '@/lib/api';
import { BookItem, LandingPublicConfigResponse, DEFAULT_LANDING_SETTINGS } from '@perpusjal/types';
import { LapakWartaTicker } from '@/components/home/lapak-warta-ticker';
import { InteractiveLiteraryIndex } from '@/components/home/interactive-literary-index';
import { BookGridSkeleton } from '@/components/books/book-card-skeleton';
import { FeaturedEventDossier } from '@/components/home/featured-event-dossier';
import { ScrollLitQuote } from '@/components/home/scroll-lit-quote';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Feather,
  Sparkles,
  ShieldCheck,
  Quote,
  Search,
  MapPin,
  Flame,
  Award,
  BookMarked,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// High-fidelity fallback books with authentic cover images for instant render
const INITIAL_CURATED_BOOKS = [
  {
    id: 'b-01',
    code: 'PJ-2026-0001',
    slug: 'bumi-manusia',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    category: { id: 'c1', name: 'Sastra & Roman', slug: 'sastra' },
    status: 'AVAILABLE' as const,
    publicationYear: 1980,
    shelfLocation: 'RAK-SAS-01',
    description: 'Roman sejarah monumental tentang kebangkitan kesadaran manusia merdeka di Hindia Belanda.',
  },
  {
    id: 'b-02',
    code: 'PJ-2026-0024',
    slug: 'madilog',
    title: 'Madilog',
    author: 'Tan Malaka',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    category: { id: 'c2', name: 'Sosial & Filsafat', slug: 'sosial' },
    status: 'AVAILABLE' as const,
    publicationYear: 1943,
    shelfLocation: 'RAK-FIL-03',
    description: 'Materialisme, Dialektika, dan Logika sebagai fondasi berpikir merdeka rakyat jelata.',
  },
  {
    id: 'b-03',
    code: 'PJ-2026-0045',
    slug: 'gadis-pantai',
    title: 'Gadis Pantai',
    author: 'Pramoedya Ananta Toer',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    category: { id: 'c1', name: 'Sastra & Roman', slug: 'sastra' },
    status: 'AVAILABLE' as const,
    publicationYear: 1982,
    shelfLocation: 'RAK-SAS-02',
    description: 'Kisah pilu penindasan feodalisme Jawa terhadap perempuan bersahaja dari kampung nelayan.',
  },
  {
    id: 'b-04',
    code: 'PJ-2026-0089',
    slug: 'laut-bercerita',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    coverImage: '/uploads/books/book-1790203215111-9786024246945-laut-bercerita-c.jpg',
    category: { id: 'c1', name: 'Sastra & Roman', slug: 'sastra' },
    status: 'AVAILABLE' as const,
    publicationYear: 2017,
    shelfLocation: 'RAK-SAS-03',
    description: 'Kisah kehilangan, persahabatan, dan penegakan keadilan bagi korban penghilangan paksa.',
  },
  {
    id: 'b-05',
    code: 'PJ-2026-0112',
    slug: 'pendidikan-kaum-tertindas',
    title: 'Pendidikan Kaum Tertindas',
    author: 'Paulo Freire',
    coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
    category: { id: 'c4', name: 'Pedagogi Kritis', slug: 'pendidikan' },
    status: 'AVAILABLE' as const,
    publicationYear: 1968,
    shelfLocation: 'RAK-PED-01',
    description: 'Pedagogi pembebasan yang mengubah pendidikan dari sistem perbankan pasif menjadi dialog kritis.',
  },
  {
    id: 'b-06',
    code: 'PJ-2026-0140',
    slug: 'jalan-tak-ada-ujung',
    title: 'Jalan Tak Ada Ujung',
    author: 'Mochtar Lubis',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80',
    category: { id: 'c1', name: 'Sastra & Roman', slug: 'sastra' },
    status: 'BORROWED' as const,
    publicationYear: 1952,
    shelfLocation: 'RAK-SAS-04',
    description: 'Eksplorasi psikologis mendalam tentang ketakutan batin, martabat, dan idealisme masa revolusi.',
  },
  {
    id: 'b-07',
    code: 'PJ-2026-0165',
    slug: 'cerita-rakyat-nusantara',
    title: 'Cerita Rakyat Nusantara & Fabel Jawa',
    author: 'Koleksi Dongeng Rakyat',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    category: { id: 'c5', name: 'Buku Anak & Fabel', slug: 'anak' },
    status: 'AVAILABLE' as const,
    publicationYear: 2019,
    shelfLocation: 'RAK-ANK-02',
    description: 'Dongeng bergambar pengantar imajinasi dan kearifan lokal untuk anak-anak pembaca trotoar.',
  },
  {
    id: 'b-08',
    code: 'PJ-2026-0188',
    slug: 'samin-surosentiko',
    title: 'Samin Surosentiko & Gerakan Petani',
    author: 'Kajian Sejarah Budaya',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    category: { id: 'c3', name: 'Sejarah & Samin', slug: 'sejarah' },
    status: 'AVAILABLE' as const,
    publicationYear: 2015,
    shelfLocation: 'RAK-SEJ-02',
    description: 'Ajaran Sedulur Sikep, perlawanan tanpa kekerasan, dan kedaulatan tanah adat di bumi Blora.',
  },
];

// Rotating active verbs for the broadsheet hero
const ROTATING_WORDS = [
  'BERDISKUSI.',
  'BERGERAK.',
  'BERDAYA.',
  'MERDEKA.',
  'BERBAHAGIA.',
];

/**
 * Single Editorial Loading Progress Underline:
 * - One clean horizontal track with an active ink indicator filling from 0% to 100% over 3.5s.
 * - Silky smooth word transition: gentle dissolve out (220ms) followed by an elegant slide-in from below (380ms).
 * - Zero double-lines, zero highlighter background box.
 */
function LoadingUnderlineHeadline() {
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runCycle = () => {
      // Step 1: Loading progress fills for 3500ms
      timerId = setTimeout(() => {
        if (!isMounted) return;
        setIsExiting(true);

        // Step 2: Smooth dissolve-out transition (220ms)
        timerId = setTimeout(() => {
          if (!isMounted) return;
          setCurrentIdx((prev) => (prev + 1) % ROTATING_WORDS.length);
          setIsExiting(false);

          // Step 3: Run the next cycle
          runCycle();
        }, 220);
      }, 3500);
    };

    runCycle();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, []);

  return (
    <span className="relative inline-block align-baseline px-1 py-0.5 whitespace-nowrap">
      {/* Active Word (Solid Broadsheet Typography with Smooth In/Out) */}
      <span
        key={currentIdx}
        className={cn(
          'italic font-serif font-normal text-foreground inline-block tracking-tight pr-1.5',
          isExiting
            ? 'opacity-0 -translate-y-2 blur-[1.5px] transition-all duration-200 ease-in'
            : 'animate-word-smooth-in'
        )}
      >
        {ROTATING_WORDS[currentIdx]}
      </span>

      {/* Single Clean Editorial Loading Underline */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 translate-y-2 sm:translate-y-2.5 left-1 right-1 h-[2.5px] sm:h-[3px] bg-foreground/15 dark:bg-white/15 rounded-none overflow-hidden"
      >
        <span
          key={currentIdx}
          className="block h-full w-full bg-foreground origin-left animate-underline-progress rounded-none"
        />
      </span>
    </span>
  );
}

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

  // Dynamic Landing Config (Featured Event, Ticker, CFD Schedule)
  const [landingConfig, setLandingConfig] = React.useState<LandingPublicConfigResponse>({
    settings: DEFAULT_LANDING_SETTINGS,
    featuredEventData: null,
  });

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

  // Fetch real books and landing config from backend
  React.useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const [booksRes, landingRes] = await Promise.all([
          apiClient<BooksApiResponse>('/books?perPage=8&sort=terbaru'),
          apiClient<LandingPublicConfigResponse>('/landing/config'),
        ]);

        if (!isMounted) return;

        if (booksRes.data && booksRes.data.data && booksRes.data.data.length > 0) {
          setBooks(booksRes.data.data);
        }

        if (landingRes.data?.settings) {
          setLandingConfig(landingRes.data);
        }
      } catch (err) {
        console.error('Failed to load initial data from API:', err);
      } finally {
        if (isMounted) setLoadingBooks(false);
      }
    }
    loadInitialData();
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
      {landingConfig?.settings?.ticker?.isActive !== false && (
        <RevealOnScroll variant="fade" delayMs={50}>
          <LapakWartaTicker items={landingConfig?.settings?.ticker?.items} />
        </RevealOnScroll>
      )}

      <main className="flex-1">
        {/* ========================================================= */}
        {/* 1. FRONT-PAGE HERO: THE BROADSHEET MASTHEAD               */}
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
          <RevealOnScroll variant="fade" delayMs={60}>
            <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3.5 mb-8 sm:mb-12 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted gap-2 relative z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <BrandStamp edition="KRONIK UTAMA" year="2026" />
                <span className="hidden sm:inline">[ EDISI RESMI // GERAKAN SWADAYA RAKYAT ]</span>
              </div>
              {landingConfig?.settings?.cfdSchedule?.isActive !== false && (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-none animate-pulse',
                      landingConfig?.settings?.cfdSchedule?.status === 'LIBUR_CFD'
                        ? 'bg-red-600'
                        : landingConfig?.settings?.cfdSchedule?.status === 'PINDAH_LOKASI'
                        ? 'bg-amber-600'
                        : 'bg-foreground'
                    )}
                  />
                  <span className="text-foreground font-semibold">
                    {landingConfig?.settings?.cfdSchedule?.badgeText || 'LAPAK CFD: SETIAP MINGGU PAGI'}
                  </span>
                </div>
              )}
              <div className="hidden lg:block">BLORA, JAWA TENGAH &bull; RUANG BACA RAKYAT</div>
            </div>
          </RevealOnScroll>

          {/* Urgent / Special Lapak CFD Notice Banner */}
          {landingConfig?.settings?.cfdSchedule?.alertNotice && (
            <RevealOnScroll variant="cinematic" delayMs={100}>
              <div className="mb-8 p-3.5 sm:p-4 border-2 border-foreground bg-surface font-mono text-xs flex items-start sm:items-center gap-3 relative z-10 rounded-none">
                <AlertTriangle className="w-4 h-4 text-foreground shrink-0 mt-0.5 sm:mt-0" />
                <div className="flex-1">
                  <span className="font-bold uppercase tracking-wider mr-2 text-[11px]">
                    [ MAKLUMAT LAPAK CFD ]:
                  </span>
                  <span className="font-serif italic text-xs sm:text-sm text-foreground">
                    {landingConfig.settings.cfdSchedule.alertNotice}
                  </span>
                </div>
              </div>
            </RevealOnScroll>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 relative z-10 items-start">
            {/* Left Big Lead (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <RevealOnScroll variant="cinematic" delayMs={120}>
                <div className="space-y-5 sm:space-y-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1 border border-foreground font-mono text-[9px] sm:text-[10px] tracking-widest uppercase font-bold bg-foreground text-background">
                    <span>RUANG PERJUMPAAN MERDEKA</span>
                  </div>

                  {/* Monumental Headline: MEMBACA DAN [LOADING UNDERLINE] */}
                  <h1 className="font-serif font-black uppercase text-foreground leading-[1.02] sm:leading-[0.92] tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl break-words">
                    MEMBACA DAN <br />
                    <LoadingUnderlineHeadline />
                  </h1>

                  <p className="drop-cap font-serif text-lg sm:text-xl text-foreground/90 leading-relaxed max-w-2xl">
                    Kami mengembalikan buku ke tempat ia seharusnya bermula: di ruang-ruang terbuka
                    tempat percakapan merdeka dirawat, di bawah naungan pohon trembesi alun-alun kota,
                    hingga tepian hutan jati. Tanpa uang jaminan, tanpa denda rupiah, dan tanpa sekat kelas sosial.
                  </p>
                </div>
              </RevealOnScroll>

              {/* Action Buttons Bar (Clean 2-Action Streamline) */}
              <RevealOnScroll variant="cinematic" delayMs={240}>
                <div className="pt-4 border-t border-border-hairline flex flex-wrap gap-3 sm:gap-4 items-center">
                  <Link
                    href="/buku"
                    className="px-6 py-3.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all inline-flex items-center gap-2"
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

            {/* Right Side Editorial Callout & Chronicle Dossier (5 cols) */}
            <div className="lg:col-span-5 border-t-2 lg:border-t-0 lg:border-l-2 border-foreground pt-8 lg:pt-0 lg:pl-8 flex flex-col justify-between space-y-6">
              {/* Quote Card (Catatan Pinggir Falsafah) */}
              <RevealOnScroll variant="slide-right" delayMs={180}>
                <div className="space-y-4">
                  <div className="text-[10px] font-mono uppercase tracking-ultra text-muted flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-foreground" />
                    <span>[ CATATAN PINGGIR // FALSAFAH ]</span>
                  </div>
                  <blockquote className="font-serif italic text-2xl sm:text-3xl text-foreground leading-snug">
                    &ldquo;Buku tidak bernilai jika hanya berdebu di lemari kaca. Ia hidup saat disentuh
                    jemari dan diperdebatkan di lapak trotoar.&rdquo;
                  </blockquote>
                  <cite className="block font-mono text-[11px] uppercase tracking-wider text-muted not-italic">
                    — Dewan Kolektif Perpusjal Blora
                  </cite>
                </div>
              </RevealOnScroll>

              {/* Chronicle Movement Manifesto Card */}
              <RevealOnScroll variant="cinematic" delayMs={280}>
                <div className="border-2 border-foreground p-5 sm:p-6 bg-surface font-mono space-y-3.5">
                  <div className="flex items-center justify-between pb-2.5 border-b border-border-hairline text-[10px] uppercase tracking-widest text-muted">
                    <span>KRONIK GERAKAN // BLORA</span>
                    <span className="font-bold text-foreground">SWADAYA RAKYAT</span>
                  </div>

                  <p className="font-serif text-sm text-foreground/85 leading-relaxed">
                    Tumbuh di tanah kelahiran Pramoedya Ananta Toer dan ajaran Sedulur Sikep Samin Surosentiko.
                    Sebuah ruang perjumpaan literasi yang dirawat bersama warga untuk merawat nalar sehat dan
                    kemerdekaan berpikir.
                  </p>

                  <div className="pt-2.5 border-t border-border-hairline flex items-center justify-between text-[11px] font-bold">
                    <span className="text-muted text-[10px] uppercase tracking-wider">&bull; 100% BEBAS BIAYA</span>
                    <Link
                      href="/tentang"
                      className="text-foreground hover:underline inline-flex items-center gap-1 uppercase tracking-wider text-[10.5px]"
                    >
                      <span>KENALI KISAH KAMI</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 1.1. KUTIPAN MENYALA MENGIKUTI SCROLL (FALSAFAH MEJA KURASI) */}
        {/* ========================================================= */}
        <RevealOnScroll variant="fade" durationMs={900}>
          <ScrollLitQuote />
        </RevealOnScroll>

        {/* ========================================================= */}
        {/* 1.5. SOROTAN EVENT AKBAR (BROADSHEET DOSSIER TIPE B)      */}
        {/* ========================================================= */}
        {landingConfig?.settings?.featuredEvent?.isActive && landingConfig?.featuredEventData && (
          <section className="border-b-2 border-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <RevealOnScroll variant="cinematic">
              <FeaturedEventDossier
                setting={landingConfig.settings.featuredEvent}
                event={landingConfig.featuredEventData}
              />
            </RevealOnScroll>
          </section>
        )}

        {/* ========================================================= */}
        {/* 2. INDEKS SASTRA INTERAKTIF & KANON KURASI LAPAK          */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
          <RevealOnScroll variant="cinematic">
            <InteractiveLiteraryIndex />
          </RevealOnScroll>
        </section>

        {/* ========================================================= */}
        {/* 3. ETALASE KOLEKSI BUKU: RAK TERPAL DINAMIS (LIVE API)     */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
          {/* Section Header Broadsheet with Sharp Contrast & Quick Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b-2 border-foreground gap-6">
            <RevealOnScroll variant="cinematic" delayMs={50}>
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
            </RevealOnScroll>

            {/* Quick Search Bar & Full Catalog Link */}
            <RevealOnScroll variant="slide-left" delayMs={150}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <form onSubmit={handleQuickSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul buku... [↵]"
                    className="w-full sm:w-64 px-3 py-2.5 pl-8 bg-surface border-2 border-foreground font-mono text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 pointer-events-none" />
                </form>

                <Link
                  href="/buku"
                  className="px-4 py-2.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>SEMUA BUKU &rarr;</span>
                </Link>
              </div>
            </RevealOnScroll>
          </div>

          {/* Book Cards Grid with Real Book Covers or Editorial Skeleton */}
          {loadingBooks && books.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted border-b border-border-hairline pb-2">
                <span>Memindai Rak Koleksi Terpal...</span>
                <span className="animate-pulse">Menghubungkan ke Inventaris...</span>
              </div>
              <BookGridSkeleton count={8} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayBooks.slice(0, 8).map((book, idx) => {
              const shelf = ('shelfLocation' in book && book.shelfLocation) ? book.shelfLocation : 'RAK-CFD';
              const availability = ('availability' in book) ? book.availability : (('status' in book && book.status === 'BORROWED') ? 'BORROWED' : 'AVAILABLE');
              const bookYear = ('publicationYear' in book && book.publicationYear) ? book.publicationYear : 2024;
              const categoryName = typeof book.category === 'object' && book.category ? book.category.name : 'Pustaka Terpal';
              const bookSlug = ('slug' in book && book.slug) ? book.slug : (('code' in book) ? book.code : book.id);
              const coverImg = ('coverImage' in book && book.coverImage) ? book.coverImage : null;

              return (
                <RevealOnScroll key={book.id || idx} variant="cinematic" delayMs={(idx % 4) * 90}>
                  <div className="border-2 border-foreground bg-surface p-5 flex flex-col justify-between group transition-all h-full">
                    <div>
                      {/* Top Metadata Strip */}
                      <div className="flex items-center justify-between text-[10px] font-mono pb-2 mb-3 border-b border-border-hairline">
                        <span className="text-muted font-bold tracking-wider">{shelf}</span>
                        <StatusPill status={availability === 'AVAILABLE' ? 'available' : 'borrowed'} />
                      </div>

                      {/* Real Book Cover Showcase Container (Aspect 2/3 Book Proportion) */}
                      <Link href={`/buku/${bookSlug}`} className="block relative aspect-[2/3] w-full mb-4 overflow-hidden border-2 border-foreground bg-surface-muted rounded-none group/cover">
                        {coverImg ? (
                          <>
                            {/* Realistic Left Spine Fold Shadow */}
                            <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/40 via-black/15 to-transparent z-10 pointer-events-none" />
                            {/* Paper Gloss Line Highlight */}
                            <div className="absolute left-3.5 top-0 bottom-0 w-px bg-white/25 z-10 pointer-events-none" />

                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={coverImg}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500"
                            />
                          </>
                        ) : (
                          /* Authentic Broadsheet Fallback Jacket */
                          <div className="w-full h-full p-4 flex flex-col justify-between border-2 border-foreground/30 bg-[#f4f4ee] dark:bg-[#141414] text-foreground select-none relative">
                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-foreground border-r border-white/20" />
                            <div className="pl-2 font-mono text-[8.5px] uppercase tracking-widest text-muted truncate">
                              PERPUSJAL &bull; {categoryName}
                            </div>
                            <div className="pl-2 space-y-1 my-auto">
                              <BookOpen className="w-6 h-6 text-foreground/30 mb-2" />
                              <h4 className="font-serif font-black text-sm uppercase leading-tight line-clamp-3 text-foreground">
                                {book.title}
                              </h4>
                              <p className="font-mono text-[10.5px] text-muted line-clamp-1 italic">
                                {book.author}
                              </p>
                            </div>
                            <div className="pl-2 font-mono text-[8px] text-muted uppercase tracking-widest border-t border-border-hairline pt-1.5">
                              {shelf} &bull; {bookYear}
                            </div>
                          </div>
                        )}
                      </Link>

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
        )}
      </section>

      {/* ========================================================= */}
      {/* 4. SHOWCASE: KARTU IDENTITAS WARGA (TACTILE PRESS PASS)    */}
      {/* ========================================================= */}
      <section className="border-b-2 border-foreground bg-surface text-foreground py-16 sm:py-24 relative overflow-hidden">
        {/* Subtle Background Watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none font-serif text-[180px] sm:text-[280px] font-black leading-none text-foreground tracking-tighter select-none">
          WARGA
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Column: Narrative & Rank Progression Ledger (7 cols) */}
            <div className="lg:col-span-7">
              <div className="space-y-6 sm:space-y-8">
                <RevealOnScroll variant="cinematic" delayMs={60}>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 border border-foreground bg-surface-muted font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-foreground" />
                      <span>ARSIP IDENTITAS // KARTU SIRKULASI TERPAL</span>
                    </div>

                    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-foreground leading-[1.05] mt-4">
                      Jejak Bacamu Adalah <br />
                      <span className="italic font-serif font-normal text-foreground/85">
                        Kehormatan Tertinggi.
                      </span>
                    </h2>

                    <p className="font-serif text-base sm:text-lg text-foreground/80 leading-relaxed max-w-2xl mt-4">
                      Di Perpusjal Blora, membaca bukan sekadar kegiatan pasif. Setiap buku yang kamu
                      pinjam dan warta yang kamu tulis mencatatkan reputasi literasi terbuka dalam{' '}
                      <strong className="text-foreground font-bold">Kartu Warga Literasi</strong> bersertifikasi publik
                      — tanpa uang jaminan dan tanpa denda rupiah seumur hidup.
                    </p>
                  </div>
                </RevealOnScroll>

                {/* Streamlined Citizen Rank Progression (Summary of Unique Titles) */}
                <RevealOnScroll variant="cinematic" delayMs={160}>
                  <div className="space-y-3 pt-2 border-t border-border-hairline font-mono">
                    <div className="text-[10px] uppercase tracking-widest text-muted font-bold">
                      [ SISTEM REPUTASI // JENJANG GELAR KEHORMATAN ]
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-background border border-border-hairline hover:border-foreground transition-colors flex items-start gap-3 rounded-none">
                        <span className="text-foreground font-mono font-bold text-[11px] shrink-0 border border-border-hairline px-1.5 py-0.5">
                          01
                        </span>
                        <div>
                          <div className="font-bold text-foreground uppercase tracking-wide text-[11px]">
                            Warga Pemula
                          </div>
                          <div className="font-serif text-[11px] text-muted mt-0.5">
                            Langkah awal terdaftar di hamparan terpal.
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-background border border-border-hairline hover:border-foreground transition-colors flex items-start gap-3 rounded-none">
                        <span className="text-foreground font-mono font-bold text-[11px] shrink-0 border border-border-hairline px-1.5 py-0.5">
                          02
                        </span>
                        <div>
                          <div className="font-bold text-foreground uppercase tracking-wide text-[11px]">
                            Pembaca Terpal
                          </div>
                          <div className="font-serif text-[11px] text-muted mt-0.5">
                            Menuntaskan 3 peminjaman buku amanah.
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-background border border-border-hairline hover:border-foreground transition-colors flex items-start gap-3 rounded-none">
                        <span className="text-foreground font-mono font-bold text-[11px] shrink-0 border border-border-hairline px-1.5 py-0.5">
                          03
                        </span>
                        <div>
                          <div className="font-bold text-foreground uppercase tracking-wide text-[11px]">
                            Pengelana Kata
                          </div>
                          <div className="font-serif text-[11px] text-muted mt-0.5">
                            Aktif mengulas buku atau menulis warta warga.
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-background border border-border-hairline hover:border-foreground transition-colors flex items-start gap-3 rounded-none">
                        <span className="text-foreground font-mono font-bold text-[11px] shrink-0 border border-border-hairline px-1.5 py-0.5">
                          04
                        </span>
                        <div>
                          <div className="font-bold text-foreground uppercase tracking-wide text-[11px]">
                            Penjaga Nyala
                          </div>
                          <div className="font-serif text-[11px] text-muted mt-0.5">
                            Pilar penggerak literasi swadaya Blora.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Micro-chips of Sample Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-[10px] uppercase text-muted tracking-wider">
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
                            className="px-2.5 py-1 bg-surface-muted border border-border-hairline text-foreground text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 rounded-none"
                          >
                            <IconComp className="w-3 h-3 text-foreground" />
                            <span>{badge.name}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </RevealOnScroll>

                {/* CTA Action Buttons */}
                <RevealOnScroll variant="cinematic" delayMs={240}>
                  <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link
                      href="/masuk"
                      className="px-6 py-3.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-2 border border-foreground"
                    >
                      <Sparkles className="w-4 h-4 text-background" />
                      <span>BUAT KARTU MILIKMU SEKARANG</span>
                      <ArrowRight className="w-3.5 h-3.5 text-background" />
                    </Link>

                    <Link
                      href="/kontributor"
                      className="px-5 py-3.5 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                    >
                      <span>JELAJAHI DAFTAR WARGA &rarr;</span>
                    </Link>
                  </div>
                </RevealOnScroll>
              </div>
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
                    className="relative bg-background text-foreground p-6 pb-6 border-2 border-foreground select-none space-y-4 box-border rounded-none overflow-hidden"
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
                          <span className="font-mono text-[10.5px] font-bold text-background bg-foreground tracking-wider px-2 py-0.5 rounded-none inline-block">
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
                      <div className="w-12 h-12 rounded-none border-2 border-foreground bg-surface flex items-center justify-center font-serif text-xl font-bold text-foreground shrink-0">
                        P
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="font-serif font-black text-xl text-foreground tracking-wide truncate">
                          Pramono Wibowo
                        </h4>
                        <p className="font-mono text-[10.5px] text-muted">@pramono &bull; Warga Penggerak 2024</p>
                        <div className="pt-0.5">
                          <span className="inline-block px-2.5 py-0.5 bg-foreground text-background font-mono text-[8px] uppercase font-bold tracking-wider rounded-none">
                            GELAR: PENJAGA NYALA LITERASI
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inspiring Quote Box */}
                    <div className="p-3.5 bg-surface-muted/60 border-l-4 border-foreground rounded-none space-y-1">
                      <p className="font-serif italic text-xs text-foreground/90 leading-relaxed">
                        &ldquo;Tangan yang membolak-balik buku adalah tangan yang merawat masa depan bangsa.&rdquo;
                      </p>
                      <div className="text-right font-mono text-[8.5px] text-muted font-semibold uppercase">
                        — Pramono Wibowo (Catatan Warga)
                      </div>
                    </div>

                    {/* 4 Achievement Pillars */}
                    <div className="grid grid-cols-4 gap-2 font-mono text-center pt-0.5">
                      <div className="p-2 border border-border-hairline bg-surface rounded-none">
                        <span className="text-[7.5px] uppercase tracking-wider text-muted block">Tulisan</span>
                        <span className="font-serif font-black text-base text-foreground">8</span>
                      </div>
                      <div className="p-2 border border-border-hairline bg-surface rounded-none">
                        <span className="text-[7.5px] uppercase tracking-wider text-muted block">Lencana</span>
                        <span className="font-serif font-black text-base text-foreground">6</span>
                      </div>
                      <div className="p-2 border border-border-hairline bg-surface rounded-none">
                        <span className="text-[7.5px] uppercase tracking-wider text-muted block">Pinjaman</span>
                        <span className="font-serif font-black text-base text-foreground">14</span>
                      </div>
                      <div className="p-2 border border-border-hairline bg-surface rounded-none">
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
      {/* 5. GRAND CALL TO ACTION: LESEHAN DI ALUN-ALUN BLORA       */}
      {/* ========================================================= */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <RevealOnScroll variant="cinematic" delayMs={60}>
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
                  className="px-6 py-3.5 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
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

      <RevealOnScroll variant="fade" delayMs={60}>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}
