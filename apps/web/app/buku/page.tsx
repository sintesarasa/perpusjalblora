'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Pagination } from '@/components/ui/pagination';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { EmptyState } from '@/components/ui/empty-state';
import { BookQuickPeekDrawer } from '@/components/books/book-quick-peek-drawer';
import { BookShowcaseSlider } from '@/components/books/book-showcase-slider';
import { BookGridSkeleton } from '@/components/books/book-card-skeleton';
import { apiClient, isServerColdStart } from '@/lib/api';
import { ColdStartBanner } from '@/components/ui/cold-start-banner';
import { BookItem, Language, BookAvailabilityStatus } from '@perpusjal/types';
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Filter,
  RefreshCw,
  X,
  Eye,
  Send,
  Gift,
  Printer,
  Sparkles,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWhatsAppUrl } from '@/lib/contact';

interface BooksApiResponse {
  data: BookItem[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

const QUICK_CATEGORIES = [
  { slug: '', label: 'Semua Kategori' },
  { slug: 'sastra', label: 'Sastra & Roman' },
  { slug: 'sejarah', label: 'Sejarah & Budaya' },
  { slug: 'sosial-politik', label: 'Sosial & Filsafat' },
  { slug: 'anak-dongeng', label: 'Buku Anak & Fabel' },
  { slug: 'pendidikan', label: 'Pedagogi Kritis' },
];

const READING_DURATIONS = [
  { key: '', label: 'Semua Ketebalan' },
  { key: 'RINGAN', label: 'Ringan (<150 hlm)' },
  { key: 'MENENGAH', label: 'Menengah (150–350 hlm)' },
  { key: 'MENDALAM', label: 'Mendalam (>350 hlm)' },
];

function BookCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = React.useState<BookItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState({ page: 1, perPage: 24, total: 0, totalPages: 1 });

  // Quick Peek Drawer State
  const [peekBook, setPeekBook] = React.useState<BookItem | null>(null);

  // Mobile Bottom Sheet Filter State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);

  // Request & Drop Box State
  const [boxTab, setBoxTab] = React.useState<'request' | 'donate'>('request');
  const [requestTitle, setRequestTitle] = React.useState('');
  const [requestAuthor, setRequestAuthor] = React.useState('');
  const [requestNote, setRequestNote] = React.useState('');
  const [requestSubmitting, setRequestSubmitting] = React.useState(false);
  const [requestSuccess, setRequestSuccess] = React.useState<string | null>(null);
  const [requestError, setRequestError] = React.useState<string | null>(null);

  // Filters from URL
  const q = searchParams.get('q') || '';
  const kategori = searchParams.get('kategori') || '';
  const tersedia = searchParams.get('tersedia') === 'true';
  const bahasa = (searchParams.get('bahasa') as Language) || '';
  const pageRange = (searchParams.get('pageRange') as 'RINGAN' | 'MENENGAH' | 'MENDALAM') || '';
  const sort = searchParams.get('sort') || 'terbaru';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = React.useState(q);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchSectionRef = React.useRef<HTMLElement>(null);
  const requestBoxRef = React.useRef<HTMLElement>(null);
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isColdStart, setIsColdStart] = React.useState(false);

  const fetchBooks = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (q) queryParams.set('q', q);
    if (kategori) queryParams.set('kategori', kategori);
    if (tersedia) queryParams.set('tersedia', 'true');
    if (bahasa) queryParams.set('bahasa', bahasa);
    if (pageRange) queryParams.set('pageRange', pageRange);
    if (sort) queryParams.set('sort', sort);
    queryParams.set('page', page.toString());
    queryParams.set('perPage', '24');

    const res = await apiClient<BooksApiResponse>(`/books?${queryParams.toString()}`);

    setLoading(false);

    if (isServerColdStart(res.error)) {
      setIsColdStart(true);
    } else {
      setIsColdStart(false);
    }

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data) {
      setBooks(res.data.data || []);
      setMeta(res.data.meta || { page: 1, perPage: 24, total: 0, totalPages: 1 });
    }

    // Only align scroll if user searched actively and not initial render
    if (!isFirstRender.current && q) {
      searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    isFirstRender.current = false;
  }, [q, kategori, tersedia, bahasa, pageRange, sort, page]);

  React.useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const featuredBook = React.useMemo(() => {
    return books.find((b) => b.isFeatured) || (books.length > 0 ? books[0] : null);
  }, [books]);

  const updateFilters = (newParams: Record<string, string | null>, options?: { scrollToSearch?: boolean }) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    if (!('page' in newParams)) {
      next.delete('page');
    }

    // Keep scroll: false so Next.js does NOT kick page to top!
    router.push(`/buku?${next.toString()}`, { scroll: false });

    if (options?.scrollToSearch && searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() || null }, { scrollToSearch: true });
  };

  const clearSearch = () => {
    setSearchInput('');
    updateFilters({ q: null }, { scrollToSearch: false });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    router.push('/buku', { scroll: false });
  };

  const hasActiveFilters = Boolean(q || kategori || tersedia || bahasa || sort !== 'terbaru');

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle.trim()) return;

    setRequestSubmitting(true);
    setRequestError(null);
    setRequestSuccess(null);

    const letterContent = `Usulan Pengadaan Buku:\n\nJudul: ${requestTitle.trim()}\nPenulis: ${requestAuthor.trim() || 'Tidak diketahui'}\n\nAlasan / Catatan Warga:\n${requestNote.trim() || 'Ingin membaca buku ini di lapak terpal.'}`;

    const res = await apiClient<{ message: string }>('/letters', {
      method: 'POST',
      body: JSON.stringify({
        title: `[USULAN BUKU] ${requestTitle.trim()}`,
        content: letterContent,
        isAnonymous: false,
        displayName: 'Warga Pembaca',
      }),
    });

    setRequestSubmitting(false);

    if (res.error) {
      setRequestError(res.error.message);
      return;
    }

    setRequestSuccess('Usulan buku berhasil disampaikan ke Meja Kurator Kolektif! Terima kasih atas aspirasimu.');
    setRequestTitle('');
    setRequestAuthor('');
    setRequestNote('');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const getStatusBadge = (availability: BookAvailabilityStatus, isBorrowable: boolean) => {
    if (!isBorrowable) {
      return (
        <span className="font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 border border-dashed border-foreground text-foreground bg-background font-semibold">
          ◓ BACA DI TEMPAT
        </span>
      );
    }
    switch (availability) {
      case 'AVAILABLE':
        return (
          <span className="font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 border border-border-hairline text-foreground bg-background font-bold inline-flex items-center gap-1">
            <span>●</span>
            <span>TERSEDIA</span>
          </span>
        );
      case 'LAST_ONE':
        return (
          <span className="font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 border-2 border-foreground text-foreground bg-background font-bold inline-flex items-center gap-1">
            <span>◐</span>
            <span>SISA 1 EKSEMPLAR</span>
          </span>
        );
      case 'BORROWED':
        return (
          <span className="font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 border border-border-hairline text-muted bg-surface-muted inline-flex items-center gap-1">
            <span>○</span>
            <span>SEDANG DIPINJAM</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background flex flex-col justify-between editorial-grain font-sans">
      {/* ── JSON-LD Structured Data for Google Search SEO ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Katalog Buku Fisik & Sirkulasi Terpal — Perpustakaan Jalanan Blora',
            description:
              'Inventaris buku fisik, novel sastra, sejarah lokal Blora, dan zine yang bebas dipinjam tanpa denda di lapak terpal Car Free Day Alun-Alun Blora.',
            url: 'https://perpusjalblora.id/buku',
            publisher: {
              '@type': 'NGO',
              name: 'Perpustakaan Jalanan Blora',
            },
          }),
        }}
      />

      <Header />

      <main className="flex-1 pb-16 sm:pb-24 space-y-12">
        {/* ========================================================= */}
        {/* 1. CINEMATIC BROADSHEET OPENING SCENE (STYLE TENTANG)     */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-10 sm:pb-14 relative overflow-hidden">
          {/* Subtle giant background typography watermark */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none font-serif text-[160px] sm:text-[260px] font-black leading-none text-foreground tracking-tighter">
            PUSTAKA
          </div>

          {/* Top Vintage Gazette Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3 mb-8 sm:mb-12 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted gap-2 relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <BrandStamp edition="KATALOG FISIK" year="2026" />
              <span className="hidden sm:inline">[ INVENTARIS BUKU FISIK // PERPUSJAL BLORA ]</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-none bg-foreground animate-pulse" />
              <span>SIRKULASI TERBUKA // BEBAS DENDA</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                title="Cetak Salinan Katalog"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>CETAK KATALOG</span>
              </button>
            </div>
          </div>

          <RevealOnScroll variant="cinematic" delayMs={100}>
            <div className="max-w-4xl space-y-4 sm:space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground font-mono text-[9px] sm:text-[10px] tracking-wider uppercase font-bold bg-foreground text-background">
                <span>GERAKAN SIRKULASI TERBUKA BLORA</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-foreground leading-[1.05] sm:leading-[0.95] break-words">
                KATALOG BUKU &amp; <br />
                <span className="italic font-normal lowercase font-serif">sirkulasi terpal merdeka.</span>
              </h1>

              <p className="font-serif text-sm sm:text-lg md:text-xl text-foreground/90 leading-relaxed pt-1 sm:pt-2 max-w-3xl">
                Semua naskah, novel sastra, sejarah lokal Blora, pedagogi kritis, hingga zine alternatif
                bebas dipinjam di atas terpal tanpa uang jaminan dan tanpa denda sepeser pun.
              </p>

              <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end border-t border-border-hairline">
                <button
                  type="button"
                  onClick={() => requestBoxRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:opacity-85 transition-opacity shrink-0 cursor-pointer text-center"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Usulkan Judul / Donasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ========================================================= */}
        {/* 2. ETALASE SOROTAN TERPAL (SLIDER KOLEKSI PILIHAN)        */}
        {/* Only shown when not searching                             */}
        {/* ========================================================= */}
        {!hasActiveFilters && books.length > 0 && !loading && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RevealOnScroll variant="cinematic" delayMs={150}>
              <BookShowcaseSlider
                books={books}
                onPeekBook={(b) => setPeekBook(b)}
              />
            </RevealOnScroll>
          </section>
        )}

        {/* ========================================================= */}
        {/* 2.5. SOROTAN BUKU PILIHAN MINGGU INI (BOOK OF THE WEEK)    */}
        {/* ========================================================= */}
        {!hasActiveFilters && featuredBook && !loading && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RevealOnScroll variant="cinematic" delayMs={120}>
              <div className="border-2 border-foreground bg-surface p-5 sm:p-8 relative overflow-hidden">
                {/* Top Tag & Badges */}
                <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3 mb-6 font-mono text-xs text-muted uppercase gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-foreground animate-ping" />
                    <span className="font-bold text-foreground tracking-wider">
                      ★ BUKU PILIHAN MINGGU INI // REKOMENDASI KURATOR
                    </span>
                  </div>
                  <span className="text-[10px]">EDISI LAPAK TERPAL 2026</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
                  {/* 3D Realistic Book Spine Mockup Cover */}
                  <div className="md:col-span-4 flex justify-center">
                    <Link href={`/buku/${featuredBook.slug}`} className="group block perspective-[1000px]">
                      <div className="relative w-44 sm:w-56 aspect-[3/4] bg-surface-muted border-2 border-foreground shadow-[-8px_8px_18px_rgba(0,0,0,0.25)] group-hover:shadow-[-12px_12px_24px_rgba(0,0,0,0.35)] transition-all duration-300 transform -rotate-1 group-hover:rotate-0 overflow-hidden">
                        {/* Realistic book spine shadow & creases */}
                        <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/40 via-black/15 to-transparent z-10 pointer-events-none" />
                        <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-white/20 z-10 pointer-events-none" />

                        {featuredBook.coverImage ? (
                          <img
                            src={featuredBook.coverImage}
                            alt={featuredBook.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full p-6 flex flex-col justify-between bg-[#f4f4ee] dark:bg-[#151515] text-foreground text-center">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                              PERPUSJAL BLORA
                            </span>
                            <div className="space-y-2">
                              <BookOpen className="w-8 h-8 mx-auto text-foreground/40" />
                              <h3 className="font-serif font-black text-sm uppercase line-clamp-3">
                                {featuredBook.title}
                              </h3>
                              <p className="font-mono text-xs text-muted italic">{featuredBook.author}</p>
                            </div>
                            <span className="font-mono text-[8px] text-muted tracking-wider">
                              PILIHAN PEGIAT
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Right Editorial Info */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="px-2.5 py-1 bg-foreground text-background font-bold uppercase text-[10px]">
                        {featuredBook.category?.name || 'UMUM'}
                      </span>
                      {featuredBook.pages && (
                        <span className="px-2 py-1 border border-border-hairline text-muted uppercase text-[10px]">
                          📖 {featuredBook.pages} Halaman
                        </span>
                      )}
                      <span className="px-2 py-1 border border-border-hairline text-foreground font-semibold text-[10px] uppercase">
                        {featuredBook.isBorrowable !== false ? '● Siap Dipinjam' : '○ Baca di Tempat'}
                      </span>
                    </div>

                    <div>
                      <Link href={`/buku/${featuredBook.slug}`}>
                        <h2 className="font-serif text-2xl sm:text-4xl font-black text-foreground hover:underline underline-offset-4 tracking-tight leading-tight">
                          {featuredBook.title}
                        </h2>
                      </Link>
                      <p className="font-serif italic text-base sm:text-lg text-foreground/80 mt-1">
                        Karya {featuredBook.author}
                      </p>
                    </div>

                    {/* Curator Note or Description Excerpt */}
                    {featuredBook.curatorNote ? (
                      <div className="p-4 bg-surface-muted/60 border-l-4 border-foreground font-serif italic text-sm sm:text-base text-foreground/90 space-y-1">
                        <p>&ldquo;{featuredBook.curatorNote}&rdquo;</p>
                        <span className="block font-mono text-[10px] uppercase text-muted not-italic font-bold">
                          — Catatan Meja Kurasi Perpusjal Blora
                        </span>
                      </div>
                    ) : featuredBook.description ? (
                      <p className="font-sans text-sm text-foreground/80 line-clamp-3 leading-relaxed">
                        {featuredBook.description}
                      </p>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/buku/${featuredBook.slug}`}
                        className="px-6 py-3 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all active:scale-95 border-2 border-foreground inline-flex items-center gap-2"
                      >
                        <span>PINJAM BUKU INI</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setPeekBook(featuredBook)}
                        className="px-5 py-3 border-2 border-foreground bg-background hover:bg-foreground hover:text-background font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>INTIP SINOPSIS CEPAT</span>
                      </button>

                      <a
                        href={getWhatsAppUrl({ type: 'book_inquiry', bookTitle: featuredBook.title })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 border border-border-hairline text-muted hover:text-foreground hover:border-foreground font-mono text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 active:scale-95"
                      >
                        <span>TANYA VIA WA</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </section>
        )}

        {/* ========================================================= */}
        {/* 3. DIREKTORI SELURUH PUSTAKA & BILAH PENCARIAN TERPADU    */}
        {/* ========================================================= */}
        <section
          ref={searchSectionRef}
          aria-label="Direktori Pustaka"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20"
        >
          {/* Section Divider Bar */}
          <div className="flex flex-wrap items-center justify-between border-b-2 border-foreground pb-3 font-mono text-xs uppercase tracking-widest text-muted gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-foreground inline-block" />
              <span className="font-bold text-foreground">
                DIREKTORI SELURUH PUSTAKA LAPAK
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>TOTAL {meta.total} KOLEKSI TERDATA</span>
              {/* Mobile Filter Sheet Trigger */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="sm:hidden px-2.5 py-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="border-2 border-foreground bg-surface p-3.5 sm:p-5 space-y-3 sm:space-y-4">
            {/* Search Input Row */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari judul, pengarang, tokoh Blora, ISBN..."
                  className="w-full h-11 pl-10 pr-24 bg-background border border-border text-xs sm:text-sm font-sans focus:outline-none focus:border-foreground rounded-none text-foreground transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />

                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-14 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 transition-colors cursor-pointer"
                    title="Hapus kata kunci"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 font-mono text-[9px] text-muted border border-border px-1.5 py-0.5 bg-surface select-none pointer-events-none">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              </div>

              {/* Submit Search */}
              <button
                type="submit"
                className="px-5 sm:px-6 h-11 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:opacity-85 transition-opacity shrink-0 cursor-pointer active:scale-95"
              >
                CARI
              </button>
            </form>

            {/* Quick Categories Pills Strip (Horizontal Swipe on Mobile, Wrap on Desktop) */}
            <div className="pt-2 border-t border-border-hairline flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider overflow-x-auto no-scrollbar sm:flex-wrap py-0.5">
              <span className="text-muted mr-1 flex items-center gap-1 text-[9.5px] sm:text-[10px] shrink-0 font-bold">
                <Filter className="w-3 h-3 text-muted" />
                TOPIK:
              </span>
              {QUICK_CATEGORIES.map((chip) => {
                const isSelected = (!kategori && chip.slug === '') || kategori === chip.slug;
                return (
                  <button
                    key={chip.slug}
                    type="button"
                    onClick={() => updateFilters({ kategori: chip.slug || null }, { scrollToSearch: false })}
                    className={cn(
                      'px-2.5 sm:px-3 py-1.5 border transition-colors select-none cursor-pointer shrink-0 whitespace-nowrap active:scale-95',
                      isSelected
                        ? 'bg-foreground text-background border-foreground font-bold'
                        : 'bg-transparent text-muted border-border hover:border-foreground'
                    )}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Reading Duration Filter Strip (Ketebalan Bacaan) */}
            <div className="pt-2 border-t border-border-hairline flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider overflow-x-auto no-scrollbar sm:flex-wrap py-0.5">
              <span className="text-muted mr-1 flex items-center gap-1 text-[9.5px] sm:text-[10px] shrink-0 font-bold">
                <Clock className="w-3 h-3 text-muted" />
                DURASI / TEBAL:
              </span>
              {READING_DURATIONS.map((dur) => {
                const isSelected = (!pageRange && dur.key === '') || pageRange === dur.key;
                return (
                  <button
                    key={dur.key}
                    type="button"
                    onClick={() => updateFilters({ pageRange: dur.key || null }, { scrollToSearch: false })}
                    className={cn(
                      'px-2.5 sm:px-3 py-1.5 border transition-colors select-none cursor-pointer shrink-0 whitespace-nowrap active:scale-95',
                      isSelected
                        ? 'bg-foreground text-background border-foreground font-bold'
                        : 'bg-transparent text-muted border-border hover:border-foreground'
                    )}
                  >
                    {dur.label}
                  </button>
                );
              })}
            </div>

            {/* Availability & Sorting Row (Organized 2-part Grid on Mobile) */}
            <div className="pt-2.5 sm:pt-3 border-t border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 font-mono text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Available Only Toggle */}
                <button
                  type="button"
                  onClick={() => updateFilters({ tersedia: tersedia ? null : 'true' }, { scrollToSearch: false })}
                  className={cn(
                    'min-h-[44px] px-3.5 py-2 sm:min-h-0 sm:py-1.5 border transition-colors inline-flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-[11px] uppercase font-semibold select-none shrink-0 active:scale-95',
                    tersedia
                      ? 'bg-foreground text-background border-foreground font-bold'
                      : 'bg-background text-foreground border-border hover:border-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-none',
                      tersedia ? 'bg-foreground' : 'bg-muted'
                    )}
                  />
                  <span>Siap Pinjam</span>
                </button>

                {/* Language Filter */}
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] flex-1 sm:flex-initial">
                  <span className="text-muted uppercase shrink-0">Bhs:</span>
                  <select
                    value={bahasa}
                    onChange={(e) => updateFilters({ bahasa: e.target.value || null }, { scrollToSearch: false })}
                    className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-2 py-1.5 bg-background border border-border text-foreground focus:outline-none focus:border-foreground rounded-none uppercase text-[11px] sm:text-xs cursor-pointer font-mono"
                  >
                    <option value="">Semua</option>
                    <option value="ID">Indonesia</option>
                    <option value="JV">Basa Jawa</option>
                    <option value="EN">English</option>
                  </select>
                </div>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end text-[10px] sm:text-[11px]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted shrink-0 hidden sm:inline" />
                <span className="text-muted uppercase shrink-0">Urutan:</span>
                <select
                  value={sort}
                  onChange={(e) => updateFilters({ sort: e.target.value }, { scrollToSearch: false })}
                  className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0 px-2.5 py-1.5 bg-background border border-border text-foreground focus:outline-none focus:border-foreground rounded-none text-[11px] sm:text-xs font-mono uppercase cursor-pointer"
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="populer">Paling Sering Dipinjam</option>
                  <option value="judul">Judul (A — Z)</option>
                </select>
              </div>
            </div>

            {/* Active Search & Filter Indicator Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border-hairline font-mono text-xs">
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-none bg-foreground animate-pulse" />
                  <span className="font-bold text-foreground uppercase tracking-wider">
                    {meta.total} Koleksi Ditemukan
                  </span>
                  {q && (
                    <span className="text-muted">
                      kata kunci: &ldquo;<span className="text-foreground font-semibold">{q}</span>&rdquo;
                    </span>
                  )}
                  {kategori && (
                    <span className="px-1.5 py-0.5 bg-foreground/10 text-foreground font-bold text-[9px] uppercase">
                      Kategori: {QUICK_CATEGORIES.find((c) => c.slug === kategori)?.label || kategori}
                    </span>
                  )}
                  {pageRange && (
                    <span className="px-1.5 py-0.5 bg-foreground/10 text-foreground font-bold text-[9px] uppercase">
                      Tebal: {READING_DURATIONS.find((d) => d.key === pageRange)?.label || pageRange}
                    </span>
                  )}
                  {tersedia && (
                    <span className="px-1.5 py-0.5 border border-foreground bg-surface-muted text-foreground font-bold text-[9px] uppercase">
                      Siap Pinjam
                    </span>
                  )}
                  {bahasa && (
                    <span className="px-1.5 py-0.5 bg-foreground/10 text-foreground font-bold text-[9px] uppercase">
                      Bahasa: {bahasa === 'ID' ? 'Indonesia' : bahasa === 'JV' ? 'Jawa' : 'English'}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[10px] font-semibold text-muted hover:text-foreground underline underline-offset-2 tracking-wider uppercase transition-colors"
                >
                  [ Reset Semua Filter ]
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. RESULTS GRID (IMMEDIATELY VISIBLE ON VIEWPORT)         */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Skeleton Shimmer Loading State */}
          {loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted border-b border-border-hairline pb-2">
                <span>Memindai Rak Koleksi Terpal...</span>
                <span className="animate-pulse">Menghubungkan ke Inventaris...</span>
              </div>
              <BookGridSkeleton count={8} />
            </div>
          )}

          {/* Error Message */}
          {!loading && error && (
            <div className="p-8 border-2 border-foreground bg-surface text-center space-y-3 font-mono text-xs">
              <AlertCircle className="w-6 h-6 text-foreground mx-auto" />
              <p className="font-bold text-foreground uppercase">{error}</p>
              <button
                onClick={fetchBooks}
                className="px-4 py-2 bg-foreground text-background font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer hover:bg-background hover:text-foreground border border-foreground transition-colors text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Coba Muat Ulang</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && books.length === 0 && (
            <div className="space-y-4">
              <EmptyState
                title="Belum Ada Judul yang Cocok"
                description="Buku yang kamu cari belum terdaftar atau sedang tidak sesuai dengan kriteria saringan saat ini. Coba gunakan kata kunci lain atau usulkan pengadaan buku ke kolektif."
                actionLabel="Tampilkan Seluruh Koleksi Buku"
                onAction={clearAllFilters}
              />
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (q) setRequestTitle(q);
                    setBoxTab('request');
                    requestBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-4 py-2.5 border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Usulkan Judul Ini ke Komunitas (Kotak Titip Koleksi) &darr;</span>
                </button>
              </div>
            </div>
          )}

          {/* Compact Book Cards Grid (2 cols mobile, 4 cols desktop) */}
          {!loading && !error && books.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted border-b border-border-hairline pb-2">
                <span>
                  Menampilkan {books.length} dari {meta.total} Judul Terdata
                </span>
                <span>
                  Halaman {meta.page} dari {meta.totalPages}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                {books.map((book, idx) => (
                  <RevealOnScroll key={book.id} variant="cinematic" delayMs={(idx % 4) * 80}>
                    <article
                      className="border-2 border-foreground bg-surface hover:bg-surface-muted/20 transition-colors duration-150 flex flex-col justify-between group h-full relative"
                    >
                    <div>
                      {/* Compact Book Cover Frame with Overlay Badge */}
                      <div className="relative overflow-hidden bg-surface-muted aspect-[4/3] border-b border-border-hairline group/cover">
                        {/* Book spine shadow */}
                        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/25 via-black/10 to-transparent z-10 pointer-events-none" />

                        {/* Top-Right Availability Badge Overlay */}
                        <div className="absolute top-2 right-2 z-20">
                          {getStatusBadge(book.availability, book.isBorrowable)}
                        </div>

                        {/* Top-Left Curator Favorite Star if Featured */}
                        {book.isFeatured && (
                          <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 bg-foreground text-background font-mono text-[8px] uppercase tracking-wider font-bold inline-flex items-center gap-1 shadow-xs">
                            <Star className="w-2.5 h-2.5 fill-background" />
                            <span>PILIHAN KURATOR</span>
                          </div>
                        )}

                        {/* Quick Peek Eye Trigger Overlay */}
                        <button
                          type="button"
                          onClick={() => setPeekBook(book)}
                          className="absolute bottom-2 left-2 z-20 px-2 py-1 bg-background/90 hover:bg-foreground hover:text-background text-foreground text-[10px] font-mono uppercase tracking-wider font-semibold border border-foreground opacity-90 sm:opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                          title="Intip Sinopsis Buku"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Intip</span>
                        </button>

                        <Link href={`/buku/${book.slug}`} className="block w-full h-full">
                          {book.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full p-4 flex flex-col justify-between border-2 border-foreground/30 bg-[#f4f4ee] dark:bg-[#141414] text-foreground select-none">
                              <span className="text-[8px] font-mono uppercase tracking-widest text-muted">
                                PERPUSJAL // {book.category.name}
                              </span>
                              <div className="space-y-1 text-center my-auto">
                                <BookOpen className="w-5 h-5 text-foreground/40 mx-auto" />
                                <h3 className="font-serif font-black text-xs sm:text-sm text-foreground line-clamp-2 uppercase">
                                  {book.title}
                                </h3>
                                <p className="font-mono text-[10px] text-muted line-clamp-1 italic">
                                  {book.author}
                                </p>
                              </div>
                              <span className="text-[8px] font-mono text-muted text-center tracking-wider">
                                ARSIP BLORA
                              </span>
                            </div>
                          )}
                        </Link>
                      </div>

                      {/* Compact Book Metadata Details */}
                      <div className="p-3 sm:p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] font-mono text-muted">
                          <span className="uppercase text-foreground font-bold truncate max-w-[110px]">
                            {book.category.name}
                          </span>
                          {book.pages ? (
                            <span>{book.pages} hlm.</span>
                          ) : book.shelfLocation ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] truncate max-w-[90px]">
                              <MapPin className="w-2.5 h-2.5 text-muted shrink-0" />
                              {book.shelfLocation}
                            </span>
                          ) : null}
                        </div>

                        <Link href={`/buku/${book.slug}`} className="block group/title">
                          <h2 className="font-serif text-sm sm:text-base font-bold text-foreground leading-snug group-hover/title:underline underline-offset-2 line-clamp-2">
                            {book.title}
                          </h2>
                        </Link>

                        <p className="font-mono text-[11px] text-muted truncate">
                          {book.author}
                        </p>
                      </div>
                    </div>

                    {/* Card Action Footer */}
                    <div className="p-3 pt-2 border-t border-border-hairline flex items-center justify-between font-mono text-xs bg-surface-muted/20">
                      <button
                        type="button"
                        onClick={() => setPeekBook(book)}
                        className="text-[10px] font-semibold text-muted hover:text-foreground underline underline-offset-2 cursor-pointer flex items-center gap-1 uppercase"
                      >
                        Sinopsis
                      </button>

                      <Link
                        href={`/buku/${book.slug}`}
                        className="font-bold text-foreground group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider hover:underline"
                      >
                        <span>Pinjam</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
            </div>

              {/* Pagination Controls */}
              {meta.totalPages > 1 && (
                <div className="pt-6 border-t-2 border-foreground flex justify-center">
                  <Pagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    createPageUrl={(p) => {
                      const next = new URLSearchParams(searchParams.toString());
                      next.set('page', p.toString());
                      return `/buku?${next.toString()}`;
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 5. COMMUNITY DROP BOX & REQUEST FORM                      */}
        {/* ========================================================= */}
        <section ref={requestBoxRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 scroll-mt-16">
          <RevealOnScroll variant="stamp" delayMs={80}>
            <div className="border-4 border-foreground p-6 sm:p-10 lg:p-12 bg-surface relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted">
                  <Gift className="w-4 h-4 text-foreground" />
                  <span>KOTAK TITIP KOLEKSI &amp; USULAN WARGA</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-foreground tracking-tight leading-tight">
                  Punya buku atau sedang mencari naskah tertentu?
                </h2>

                <p className="font-serif text-sm sm:text-base text-foreground/85 leading-relaxed">
                  Perpustakaan ini dirawat secara swadaya oleh warga Blora. Sampaikan judul yang ingin kamu baca di atas terpal,
                  atau dermakan buku pribadimu agar ilmunya terus berkelana.
                </p>

                {/* Tabs Switcher */}
                <div className="pt-2 flex gap-2 font-mono text-xs uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setBoxTab('request')}
                    className={cn(
                      'px-3.5 py-1.5 border transition-colors cursor-pointer select-none font-bold',
                      boxTab === 'request'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-surface-muted text-foreground border-border hover:border-foreground'
                    )}
                  >
                    Usulkan Buku
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoxTab('donate')}
                    className={cn(
                      'px-3.5 py-1.5 border transition-colors cursor-pointer select-none font-bold',
                      boxTab === 'donate'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-surface-muted text-foreground border-border hover:border-foreground'
                    )}
                  >
                    Titip Donasi Buku
                  </button>
                </div>
              </div>

              {/* Tab 1: Request Form */}
              {boxTab === 'request' && (
                <div className="lg:col-span-7 border-t-2 lg:border-t-0 lg:border-l-2 border-foreground pt-6 lg:pt-0 lg:pl-8">
                  {requestSuccess ? (
                    <div className="p-6 border-2 border-foreground bg-surface-muted space-y-3 font-mono text-xs">
                      <CheckCircle2 className="w-6 h-6 text-foreground" />
                      <p className="font-bold text-foreground uppercase">{requestSuccess}</p>
                      <p className="font-serif text-xs text-muted">
                        Relawan kurator kami akan mencatat judul ini ke dalam daftar belanja buku swadaya berikutnya.
                      </p>
                      <button
                        type="button"
                        onClick={() => setRequestSuccess(null)}
                        className="mt-3 px-4 py-2 border border-foreground bg-foreground text-background uppercase tracking-wider font-bold cursor-pointer"
                      >
                        Kirim Usulan Lain
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRequestSubmit} className="space-y-3.5">
                      {requestError && (
                        <div className="p-3 border border-destructive bg-destructive/10 text-destructive font-mono text-xs">
                          {requestError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
                            JUDUL BUKU *
                          </label>
                          <input
                            type="text"
                            required
                            value={requestTitle}
                            onChange={(e) => setRequestTitle(e.target.value)}
                            placeholder="Misal: Cerita dari Blora"
                            className="w-full px-3 py-2 bg-background border border-border focus:border-foreground focus:outline-none rounded-none text-xs font-sans text-foreground"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
                            NAMA PENGARANG / PENULIS
                          </label>
                          <input
                            type="text"
                            value={requestAuthor}
                            onChange={(e) => setRequestAuthor(e.target.value)}
                            placeholder="Misal: Pramoedya Ananta Toer"
                            className="w-full px-3 py-2 bg-background border border-border focus:border-foreground focus:outline-none rounded-none text-xs font-sans text-foreground"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
                          MENGAPA KAMU INGIN MEMBACA BUKU INI? (OPSIONAL)
                        </label>
                        <textarea
                          rows={2}
                          value={requestNote}
                          onChange={(e) => setRequestNote(e.target.value)}
                          placeholder="Tulis alasan singkat atau relevansinya bagi kawan-kawan di Blora..."
                          className="w-full px-3 py-2 bg-background border border-border focus:border-foreground focus:outline-none rounded-none text-xs font-sans text-foreground"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={requestSubmitting || !requestTitle.trim()}
                        className="px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-background hover:text-foreground border border-foreground transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{requestSubmitting ? 'MENGIRIMKAN...' : 'KIRIM KE MEJA KURATOR'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Tab 2: Book Donation Guide */}
              {boxTab === 'donate' && (
                <div className="lg:col-span-7 border-t-2 lg:border-t-0 lg:border-l-2 border-foreground pt-6 lg:pt-0 lg:pl-8 space-y-3 font-mono text-xs">
                  <div className="border border-foreground p-4 bg-background space-y-2">
                    <div className="font-bold text-foreground uppercase tracking-wider">
                      LANGKAH TITIP DONASI BUKU FISIK:
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-muted leading-relaxed font-sans text-xs">
                      <li>Buku dalam kondisi layak baca (halaman lengkap).</li>
                      <li>Semua genre diterima: sastra, ensiklopedia anak, sains populer, sejarah, komik, atau filsafat.</li>
                      <li>Bawa langsung saat gelaran lapak Minggu pagi di Car Free Day Alun-Alun Blora.</li>
                      <li>Atau kirim ke Basecamp Perpusjal (Jl. Pemuda No. 12, Blora).</li>
                    </ol>
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <Link
                      href="/tentang"
                      className="px-3.5 py-1.5 border border-foreground bg-foreground text-background font-bold uppercase tracking-wider text-[10px] hover:bg-background hover:text-foreground transition-colors"
                    >
                      BACA ALAMAT BASECAMP &rarr;
                    </Link>
                    <a
                      href={getWhatsAppUrl('Halo Kolektif Perpusjal, saya ingin mendonasikan buku fisik.')}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 border border-border text-muted hover:text-foreground uppercase tracking-wider text-[10px] transition-colors"
                    >
                      WHATSAPP RELAWAN LAPAK
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </RevealOnScroll>
      </section>
      </main>

      {/* Floating Filter Button (Mobile Screen Only) */}
      <div className="fixed bottom-20 right-4 z-40 sm:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="h-12 px-4 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 border-foreground shadow-xl active:scale-95 transition-transform rounded-none"
        >
          <SlidersHorizontal className="w-4 h-4 text-background" />
          <span>FILTER KOLEKSI {hasActiveFilters ? '●' : ''}</span>
        </button>
      </div>

      {/* Mobile Slide-Up Bottom Sheet Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Panel */}
          <div className="relative w-full max-h-[85dvh] bg-surface border-t-2 border-foreground flex flex-col font-mono text-xs pb-safe animate-in slide-in-from-bottom duration-250 z-10 shadow-2xl overflow-hidden rounded-none">
            {/* Drag Pill & Header */}
            <div className="pt-3 pb-2 px-4 border-b border-border-hairline flex flex-col items-center shrink-0">
              <div className="w-10 h-1 bg-foreground/25 mb-3" />
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-bold uppercase tracking-wider">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>SARING &amp; URUTKAN KOLEKSI</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 border border-border-hairline text-muted hover:text-foreground"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Sheet Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Category Filter */}
              <div className="space-y-2">
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">
                  PILIH KATEGORI / GENRE:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CATEGORIES.map((chip) => {
                    const isSelected = (!kategori && chip.slug === '') || kategori === chip.slug;
                    return (
                      <button
                        key={chip.slug}
                        type="button"
                        onClick={() => updateFilters({ kategori: chip.slug || null }, { scrollToSearch: false })}
                        className={cn(
                          'min-h-[40px] px-3 py-2 border text-[11px] uppercase tracking-wider active:scale-95 transition-transform',
                          isSelected
                            ? 'bg-foreground text-background border-foreground font-bold'
                            : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                        )}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reading Duration Filter */}
              <div className="space-y-2 pt-2 border-t border-border-hairline">
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">
                  KETEBALAN HALAMAN / DURASI BACA:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {READING_DURATIONS.map((dur) => {
                    const isSelected = (!pageRange && dur.key === '') || pageRange === dur.key;
                    return (
                      <button
                        key={dur.key}
                        type="button"
                        onClick={() => updateFilters({ pageRange: dur.key || null }, { scrollToSearch: false })}
                        className={cn(
                          'min-h-[40px] px-3 py-2 border text-[11px] uppercase tracking-wider active:scale-95 transition-transform',
                          isSelected
                            ? 'bg-foreground text-background border-foreground font-bold'
                            : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                        )}
                      >
                        {dur.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="space-y-2 pt-2 border-t border-border-hairline">
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">
                  STATUS SIRKULASI:
                </span>
                <button
                  type="button"
                  onClick={() => updateFilters({ tersedia: tersedia ? null : 'true' }, { scrollToSearch: false })}
                  className={cn(
                    'w-full min-h-[44px] px-4 py-2.5 border uppercase font-bold text-xs inline-flex items-center justify-between active:scale-95 transition-transform',
                    tersedia
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-surface text-foreground border-border-hairline'
                  )}
                >
                  <span>HANYA BUKU YANG SIAP DIPINJAM</span>
                  <span className={cn('w-2 h-2 rounded-none', tersedia ? 'bg-background' : 'bg-muted')} />
                </button>
              </div>

              {/* Language & Sorting */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-hairline">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted uppercase font-bold block">Bahasa</label>
                  <select
                    value={bahasa}
                    onChange={(e) => updateFilters({ bahasa: e.target.value || null }, { scrollToSearch: false })}
                    className="w-full min-h-[44px] p-2 bg-background border border-border text-xs uppercase"
                  >
                    <option value="">Semua Bahasa</option>
                    <option value="ID">Indonesia</option>
                    <option value="JV">Jawa</option>
                    <option value="EN">English</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted uppercase font-bold block">Urutan</label>
                  <select
                    value={sort}
                    onChange={(e) => updateFilters({ sort: e.target.value }, { scrollToSearch: false })}
                    className="w-full min-h-[44px] p-2 bg-background border border-border text-xs uppercase"
                  >
                    <option value="terbaru">Terbaru</option>
                    <option value="populer">Paling Sering Dipinjam</option>
                    <option value="judul">Judul (A — Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Sheet Actions Footer */}
            <div className="p-4 border-t border-border-hairline bg-surface flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 min-h-[44px] border border-border-hairline text-muted hover:text-foreground uppercase font-bold text-xs active:scale-95 transition-transform"
              >
                Reset Semua
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 min-h-[44px] bg-foreground text-background uppercase font-bold text-xs active:scale-95 transition-transform"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Peek Drawer Component */}
      <BookQuickPeekDrawer
        book={peekBook}
        isOpen={Boolean(peekBook)}
        onClose={() => setPeekBook(null)}
      />

      <RevealOnScroll variant="fade" delayMs={60}>
        <Footer />
      </RevealOnScroll>

      <ColdStartBanner
        isVisible={isColdStart}
        onRetry={fetchBooks}
        onDismiss={() => setIsColdStart(false)}
      />
    </div>
  );
}

export default function BookCatalogPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono text-xs uppercase tracking-widest">
          <div className="max-w-7xl mx-auto px-4 py-16 w-full space-y-8">
            <BookGridSkeleton count={8} />
          </div>
        </div>
      }
    >
      <BookCatalogContent />
    </React.Suspense>
  );
}
