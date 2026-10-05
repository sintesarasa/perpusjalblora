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
import { apiClient } from '@/lib/api';
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
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

function BookCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = React.useState<BookItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState({ page: 1, perPage: 24, total: 0, totalPages: 1 });

  // Quick Peek Drawer State
  const [peekBook, setPeekBook] = React.useState<BookItem | null>(null);

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

  const fetchBooks = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (q) queryParams.set('q', q);
    if (kategori) queryParams.set('kategori', kategori);
    if (tersedia) queryParams.set('tersedia', 'true');
    if (bahasa) queryParams.set('bahasa', bahasa);
    if (sort) queryParams.set('sort', sort);
    queryParams.set('page', page.toString());
    queryParams.set('perPage', '24');

    const res = await apiClient<BooksApiResponse>(`/books?${queryParams.toString()}`);

    setLoading(false);

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
  }, [q, kategori, tersedia, bahasa, sort, page]);

  React.useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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

          <RevealOnScroll variant="fade-up" delayMs={100}>
            <div className="max-w-4xl space-y-4 sm:space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground font-mono text-[9px] sm:text-[10px] tracking-wider uppercase font-bold bg-foreground text-background">
                <span>GERAKAN SIRKULASI TERBUKA BLORA</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-foreground leading-[1.02] sm:leading-[0.95] break-words">
                KATALOG BUKU &amp; <br />
                <span className="italic font-normal lowercase font-serif">sirkulasi terpal merdeka.</span>
              </h1>

              <p className="font-serif text-lg sm:text-2xl text-foreground/90 leading-relaxed pt-1 sm:pt-2 max-w-3xl">
                Semua naskah, novel sastra, sejarah lokal Blora, pedagogi kritis, hingga zine alternatif
                bebas dipinjam di atas terpal tanpa uang jaminan dan tanpa denda sepeser pun.
              </p>

              <div className="pt-4 flex items-center justify-end border-t border-border-hairline">
                <button
                  type="button"
                  onClick={() => requestBoxRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:opacity-85 transition-opacity shrink-0 cursor-pointer"
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
            <RevealOnScroll variant="fade-up" delayMs={150}>
              <BookShowcaseSlider
                books={books}
                onPeekBook={(b) => setPeekBook(b)}
              />
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
            <span>
              TOTAL {meta.total} KOLEKSI TERDATA
            </span>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="border-2 border-foreground bg-surface p-4 sm:p-5 space-y-4">
            {/* Search Input Row */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari judul buku, nama pengarang, tokoh Blora, atau nomor ISBN... (Cmd+K)"
                  className="w-full h-11 pl-10 pr-24 bg-background border border-border text-xs sm:text-sm font-sans focus:outline-none focus:border-foreground rounded-none text-foreground transition-colors"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />

                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-16 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 transition-colors cursor-pointer"
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
                className="px-5 h-11 bg-foreground text-background font-mono text-[10px] uppercase tracking-wider font-semibold hover:opacity-85 transition-opacity shrink-0 cursor-pointer"
              >
                CARI
              </button>
            </form>

            {/* Quick Categories Pills Strip */}
            <div className="pt-2 border-t border-border-hairline flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
              <span className="text-muted mr-1 flex items-center gap-1 text-[10px]">
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
                      'px-3 py-1.5 border transition-colors select-none cursor-pointer',
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

            {/* Availability & Sorting Row */}
            <div className="pt-3 border-t border-border-hairline flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Available Only Toggle */}
                <button
                  type="button"
                  onClick={() => updateFilters({ tersedia: tersedia ? null : 'true' }, { scrollToSearch: false })}
                  className={cn(
                    'px-3 py-1.5 border transition-colors inline-flex items-center gap-1.5 cursor-pointer text-[11px] uppercase font-semibold select-none',
                    tersedia
                      ? 'bg-foreground text-background border-foreground font-bold'
                      : 'bg-background text-foreground border-border hover:border-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-none',
                      tersedia ? 'bg-foreground' : 'bg-muted'
                    )}
                  />
                  <span>Hanya Siap Pinjam</span>
                </button>

                {/* Language Filter */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-muted uppercase">Bahasa:</span>
                  <select
                    value={bahasa}
                    onChange={(e) => updateFilters({ bahasa: e.target.value || null }, { scrollToSearch: false })}
                    className="px-2 py-1.5 bg-background border border-border text-foreground focus:outline-none focus:border-foreground rounded-none uppercase text-xs cursor-pointer font-mono"
                  >
                    <option value="">Semua Bahasa</option>
                    <option value="ID">Bahasa Indonesia</option>
                    <option value="JV">Basa Jawa</option>
                    <option value="EN">English</option>
                  </select>
                </div>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <SlidersHorizontal className="w-3 h-3 text-muted shrink-0 hidden sm:inline" />
                  <span className="text-muted uppercase">Urutan:</span>
                  <select
                    value={sort}
                    onChange={(e) => updateFilters({ sort: e.target.value }, { scrollToSearch: false })}
                    className="px-2.5 py-1.5 bg-background border border-border text-foreground focus:outline-none focus:border-foreground rounded-none text-xs font-mono uppercase cursor-pointer"
                  >
                    <option value="terbaru">Terbaru Terdata</option>
                    <option value="populer">Paling Sering Berkelana</option>
                    <option value="judul">Judul (A — Z)</option>
                  </select>
                </div>
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
                  [ Reset Pencarian ]
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

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {books.map((book) => (
                  <article
                    key={book.id}
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
                          {book.shelfLocation && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] truncate max-w-[90px]">
                              <MapPin className="w-2.5 h-2.5 text-muted shrink-0" />
                              {book.shelfLocation}
                            </span>
                          )}
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
                      href="https://wa.me/6281234567890?text=Halo%20Kolektif%20Perpusjal,%20saya%20ingin%20mendonasikan%20buku%20fisik."
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
        </section>
      </main>

      {/* Quick Peek Drawer Component */}
      <BookQuickPeekDrawer
        book={peekBook}
        isOpen={Boolean(peekBook)}
        onClose={() => setPeekBook(null)}
      />

      <Footer />
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
