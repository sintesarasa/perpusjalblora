'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArticleFeatured } from '@/components/articles/article-featured';
import { ArticleCard } from '@/components/articles/article-card';
import { ArticleGridSkeleton } from '@/components/articles/article-card-skeleton';
import { ArticleQuickReadDrawer } from '@/components/articles/article-quick-read-drawer';
import { CitizenContributorsSidebar } from '@/components/articles/citizen-contributors-sidebar';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { BrandStamp } from '@/components/ui/brand-stamp';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  AlignLeft,
  PenTool,
  Clock,
  ArrowRight,
  X,
  FileText,
  Printer,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ArticleSummary, ArticleCategory } from '@perpusjal/types';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'broadsheet';
type ReadingTimeFilter = 'all' | 'short' | 'medium' | 'long';

function ArticlesCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategory = searchParams.get('kategori') || '';
  const currentSearch = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'terbaru';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [articles, setArticles] = React.useState<ArticleSummary[]>([]);
  const [categories, setCategories] = React.useState<ArticleCategory[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchInput, setSearchInput] = React.useState(currentSearch);

  // View Mode & Reading Time Filters
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [readingTimeFilter, setReadingTimeFilter] = React.useState<ReadingTimeFilter>('all');

  // Quick Read Drawer State
  const [quickReadArticle, setQuickReadArticle] = React.useState<ArticleSummary | null>(null);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchSectionRef = React.useRef<HTMLElement>(null);
  const isFirstRender = React.useRef(true);

  const focusSearchInput = React.useCallback(() => {
    searchInputRef.current?.focus();
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Global shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        focusSearchInput();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusSearchInput]);

  React.useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch categories once
  React.useEffect(() => {
    async function loadCategories() {
      const res = await apiClient<ArticleCategory[]>('/articles/categories');
      if (res.data) {
        setCategories(res.data);
      }
    }
    loadCategories();
  }, []);

  // Fetch articles whenever query params change
  React.useEffect(() => {
    async function loadArticles() {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (currentCategory) params.set('kategori', currentCategory);
      if (currentSearch) params.set('q', currentSearch);
      if (currentSort) params.set('sort', currentSort);
      params.set('page', currentPage.toString());
      params.set('perPage', '9');

      const res = await apiClient<{ data: ArticleSummary[]; meta: { total: number; totalPages: number } }>(
        `/articles?${params.toString()}`
      );

      if (res.data) {
        setArticles(res.data.data || []);
        setTotalPages(res.data.meta?.totalPages || 1);
        setTotalCount(res.data.meta?.total || 0);
      }
      setIsLoading(false);

      if (!isFirstRender.current && currentSearch) {
        searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      isFirstRender.current = false;
    }

    loadArticles();
  }, [currentCategory, currentSearch, currentSort, currentPage]);

  const updateQueryParams = (newParams: Record<string, string | null>, options?: { scrollToSearch?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (!newParams.page && newParams.page !== '1') {
      params.delete('page');
    }

    router.push(`/artikel?${params.toString()}`, { scroll: false });

    if (options?.scrollToSearch && searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ q: searchInput.trim() || null }, { scrollToSearch: true });
  };

  const clearSearch = () => {
    setSearchInput('');
    updateQueryParams({ q: null }, { scrollToSearch: false });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setReadingTimeFilter('all');
    updateQueryParams({ q: null, kategori: null, page: null, sort: null }, { scrollToSearch: true });
  };

  // Filter articles by client reading time filter if set
  const filteredArticles = React.useMemo(() => {
    if (readingTimeFilter === 'all') return articles;
    return articles.filter((a) => {
      if (readingTimeFilter === 'short') return a.readingTime <= 3;
      if (readingTimeFilter === 'medium') return a.readingTime > 3 && a.readingTime <= 7;
      if (readingTimeFilter === 'long') return a.readingTime > 7;
      return true;
    });
  }, [articles, readingTimeFilter]);

  const hasSearchOrFilter = Boolean(currentSearch || currentCategory || readingTimeFilter !== 'all');

  // Featured article only shows on page 1 when there are no active searches or category filters
  const featuredArticle =
    currentPage === 1 && !hasSearchOrFilter
      ? filteredArticles.find((a) => a.isFeatured) || filteredArticles[0]
      : null;

  const regularArticles = featuredArticle
    ? filteredArticles.filter((a) => a.id !== featuredArticle.id)
    : filteredArticles;

  const createPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    return `/artikel?${params.toString()}`;
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background flex flex-col justify-between editorial-grain">
      {/* ── JSON-LD Structured Data for Google Search SEO ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Mimbar Bebas Warta & Catatan Kritis — Perpustakaan Jalanan Blora',
            description:
              'Kumpulan esai warga, resensi buku lapak terpal, reportase gerakan literasi, dan catatan kebudayaan Blora.',
            url: 'https://perpusjalblora.id/artikel',
            publisher: {
              '@type': 'NGO',
              name: 'Perpustakaan Jalanan Blora',
            },
          }),
        }}
      />

      <Header />

      <main className="flex-1 pb-16 sm:pb-24">
        {/* ========================================================= */}
        {/* 1. CINEMATIC BROADSHEET OPENING SCENE                     */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-10 sm:pb-16 relative overflow-hidden">
          {/* Subtle giant background typography watermark */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none font-serif text-[160px] sm:text-[260px] font-black leading-none text-foreground tracking-tighter">
            WARGA
          </div>

          {/* Top Vintage Gazette Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3 mb-8 sm:mb-12 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted gap-2 relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <BrandStamp edition="MIMBAR WARGA" year="2026" />
              <span className="hidden sm:inline">[ WARTA &amp; CATATAN KRITIS // SUARA SWADAYA WARGA ]</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-foreground">TERBUKA UNTUK SELURUH WARGA</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Cetak Lembaran Warta"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>CETAK LEMBARAN</span>
              </button>
            </div>
          </div>

          <RevealOnScroll variant="fade-up" delayMs={100}>
            <div className="max-w-4xl space-y-4 sm:space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground font-mono text-[9px] sm:text-[10px] tracking-wider uppercase font-bold bg-foreground text-background">
                <span>MIMBAR BEBAS &bull; PERPUSTAKAAN JALANAN BLORA</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-foreground leading-[1.02] sm:leading-[0.95] break-words">
                ARSIP WARTA &amp; <br />
                <span className="italic font-normal lowercase font-serif">suara swadaya warga.</span>
              </h1>

              <p className="font-serif text-lg sm:text-2xl text-foreground/90 leading-relaxed pt-1 sm:pt-2 max-w-3xl">
                Ruang literasi independen untuk mendokumentasikan pemikiran warga, resensi buku lapak terpal,
                reportase gerakan akar rumput, dan denyut kebudayaan tanah Blora.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border-hairline">
                <span className="font-mono text-xs text-muted uppercase tracking-wider">
                  MIMBAR BEBAS &bull; TANAH SASTRA &amp; AKAR RUMPUT BLORA
                </span>

                <Link
                  href="/dashboard/tulisan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:bg-foreground/90 transition-all shrink-0 shadow-xs active:translate-x-0.5 active:translate-y-0.5"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Kirim Naskah Warga</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ========================================================= */}
        {/* 2. TAJUK UTAMA (LEAD STORY) — Hidden when searching       */}
        {/* ========================================================= */}
        {featuredArticle && !isLoading && !hasSearchOrFilter && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
            <RevealOnScroll variant="fade-up" delayMs={150}>
              <ArticleFeatured
                article={featuredArticle}
                onQuickRead={(art) => setQuickReadArticle(art)}
              />
            </RevealOnScroll>
          </section>
        )}

        {/* ========================================================= */}
        {/* 3. TOOLBAR PENCARIAN & RUBRIKASI GAZETTE                 */}
        {/* ========================================================= */}
        <section
          ref={searchSectionRef}
          aria-label="Alat Pencarian dan Penyaring Naskah"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 scroll-mt-20"
        >
          <div className="border-2 border-foreground bg-surface p-5 sm:p-6 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
            {/* Top Toolbar: Categories & View Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-hairline pb-4">
              {/* Category Pills (Dynamic from Database) */}
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
                <span className="text-muted text-[10px] font-bold mr-1 flex items-center gap-1">
                  RUBRIK:
                </span>
                <button
                  type="button"
                  onClick={() => updateQueryParams({ kategori: null }, { scrollToSearch: false })}
                  className={cn(
                    'px-3 py-1.5 border transition-all cursor-pointer font-bold',
                    !currentCategory
                      ? 'bg-foreground text-background border-foreground shadow-2xs'
                      : 'bg-surface text-foreground border-border hover:border-foreground'
                  )}
                >
                  Semua Topik
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => updateQueryParams({ kategori: c.slug }, { scrollToSearch: false })}
                    className={cn(
                      'px-3 py-1.5 border transition-all cursor-pointer font-bold',
                      currentCategory === c.slug
                        ? 'bg-foreground text-background border-foreground shadow-2xs'
                        : 'bg-surface text-foreground border-border hover:border-foreground'
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto font-mono text-[10px] uppercase tracking-wider">
                <span className="text-muted font-bold">Tampilan:</span>
                <div className="flex items-center border-2 border-foreground bg-background">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-1.5 transition-colors cursor-pointer',
                      viewMode === 'grid'
                        ? 'bg-foreground text-background font-bold'
                        : 'text-muted hover:text-foreground'
                    )}
                    title="Tampilan Kotak (Grid)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('broadsheet')}
                    className={cn(
                      'p-1.5 transition-colors cursor-pointer',
                      viewMode === 'broadsheet'
                        ? 'bg-foreground text-background font-bold'
                        : 'text-muted hover:text-foreground'
                    )}
                    title="Tampilan Kolom Koran (Broadsheet)"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Search Box, Duration Filter, and Sort */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search Form with instant clear and enter handler */}
              <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Cari judul, topik esai, atau nama warga... (Cmd+K)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-11 pl-10 pr-24 bg-background border-2 border-foreground text-xs sm:text-sm font-sans text-foreground focus:outline-none focus:ring-0 rounded-none transition-colors"
                />
                <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

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

                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-foreground text-background font-mono text-[10px] uppercase tracking-wider font-bold hover:bg-foreground/90 transition-opacity cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  Cari
                </button>
              </form>

              {/* Reading Duration Selector */}
              <div className="md:col-span-3 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
                <select
                  value={readingTimeFilter}
                  onChange={(e) => setReadingTimeFilter(e.target.value as ReadingTimeFilter)}
                  className="w-full h-11 bg-background border-2 border-foreground px-3 text-foreground focus:outline-none font-mono text-xs rounded-none cursor-pointer"
                >
                  <option value="all">Semua Durasi Baca</option>
                  <option value="short">Kilas Singkat (&le; 3 Menit)</option>
                  <option value="medium">Sedang (4 &ndash; 7 Menit)</option>
                  <option value="long">Esai Mendalam (&gt; 7 Menit)</option>
                </select>
              </div>

              {/* Sort Selector */}
              <div className="md:col-span-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 hidden sm:inline text-foreground" />
                <select
                  value={currentSort}
                  onChange={(e) => updateQueryParams({ sort: e.target.value }, { scrollToSearch: false })}
                  className="w-full h-11 bg-background border-2 border-foreground px-3 text-foreground focus:outline-none font-mono text-xs rounded-none cursor-pointer"
                >
                  <option value="terbaru">Urutan: Terbaru</option>
                  <option value="populer">Urutan: Terpopuler</option>
                  <option value="terlama">Urutan: Terlama</option>
                </select>
              </div>
            </div>

            {/* Active Search & Filter Indicator Bar */}
            {hasSearchOrFilter && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-hairline font-mono text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-foreground uppercase tracking-wider">
                    {totalCount} Naskah Ditemukan
                  </span>
                  {currentSearch && (
                    <span className="text-muted">
                      kata kunci: &ldquo;<strong className="text-foreground">{currentSearch}</strong>&rdquo;
                    </span>
                  )}
                  {currentCategory && (
                    <span className="px-2 py-0.5 bg-surface-muted border border-foreground/30 text-foreground font-bold text-[10px] uppercase">
                      Topik: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                    </span>
                  )}
                  {readingTimeFilter !== 'all' && (
                    <span className="px-2 py-0.5 bg-surface-muted border border-foreground/30 text-foreground font-bold text-[10px] uppercase">
                      Durasi:{' '}
                      {readingTimeFilter === 'short'
                        ? '< 3 mnt'
                        : readingTimeFilter === 'medium'
                        ? '4-7 mnt'
                        : '> 7 mnt'}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-foreground hover:underline underline-offset-4 tracking-wider uppercase transition-colors cursor-pointer"
                >
                  [ Reset Semua Filter &times; ]
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. TATA LETAK MAJEMUK: KOLOM NASKAH (8) + SIDEBAR (4)     */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kolom Utama: Hasil Artikel (8 Grid) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Skeleton Shimmer Loading State */}
              {isLoading && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted border-b border-border-hairline pb-2">
                    <span>Memuat Bundel Lembaran Warta...</span>
                    <span className="animate-pulse font-bold text-foreground">Menghubungkan ke Meja Redaksi...</span>
                  </div>
                  <ArticleGridSkeleton count={6} viewMode={viewMode} />
                </div>
              )}

              {/* Results Grid when Loaded */}
              {!isLoading && regularArticles.length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted border-b border-border-hairline pb-2.5">
                    <span className="font-bold text-foreground">
                      Menampilkan {regularArticles.length} dari {totalCount} Naskah Warga
                    </span>
                    <span>
                      Halaman {currentPage} dari {totalPages}
                    </span>
                  </div>

                  {/* EFEK 2: Staggered Ink-Press Reveal on Scroll */}
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {regularArticles.map((article, idx) => (
                        <RevealOnScroll
                          key={article.id}
                          variant="fade-up"
                          delayMs={(idx % 2) * 100}
                        >
                          <ArticleCard
                            article={article}
                            viewMode="grid"
                            onQuickRead={(art) => setQuickReadArticle(art)}
                          />
                        </RevealOnScroll>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {regularArticles.map((article, idx) => (
                        <RevealOnScroll
                          key={article.id}
                          variant="fade-up"
                          delayMs={(idx % 3) * 80}
                        >
                          <ArticleCard
                            article={article}
                            viewMode="broadsheet"
                            onQuickRead={(art) => setQuickReadArticle(art)}
                          />
                        </RevealOnScroll>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pt-8 border-t-2 border-foreground flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        createPageUrl={createPageUrl}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Empty Search State */}
              {!isLoading && regularArticles.length === 0 && (
                <EmptyState
                  title="Tidak Ditemukan Naskah yang Sesuai"
                  description="Belum ada warta, resensi terpal, atau esai yang cocok dengan kata kunci atau filter pencarian ini."
                  actionLabel="Reset Semua Filter"
                  onAction={clearAllFilters}
                />
              )}
            </div>

            {/* Kolom Samping (Sidebar): Etalase Penulis Warga & Kotak Pos (4 Grid) */}
            <div className="lg:col-span-4 space-y-8">
              <CitizenContributorsSidebar
                articles={articles}
                onSelectAuthor={(authorName) => {
                  updateQueryParams({ q: authorName }, { scrollToSearch: true });
                }}
              />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. MAKLUMAT REDAKSI: MIMBAR BEBAS WARGA                   */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
          <RevealOnScroll variant="stamp" delayMs={50}>
            <div className="border-2 border-foreground p-8 sm:p-12 lg:p-14 bg-foreground text-background relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)]">
              {/* Watermark icon */}
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-background">
                <FileText className="w-72 h-72" />
              </div>

              <div className="relative z-10 max-w-3xl space-y-6">
                <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-background/80 border-b border-background/20 pb-3">
                  <span className="w-2.5 h-2.5 bg-background inline-block" />
                  <span className="font-bold">MAKLUMAT REDAKSI // MIMBAR BEBAS WARGA BLORA</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black text-background tracking-tight leading-tight">
                  Punya catatan lapak, resensi buku, atau keresahan tentang tanah Blora?
                </h2>

                <p className="font-serif text-base sm:text-lg text-background/85 leading-relaxed">
                  Perpusjal Blora adalah panggung terbuka tanpa kurasi elitis. Tulisanmu akan dibaca oleh sesama warga,
                  pegiat literasi, dan pengunjung lapak Car Free Day di bawah rindang pohon trembesi. Tuliskan suaramu, karena yang tertulis abadi.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/dashboard/tulisan"
                    className="px-6 py-3.5 bg-background text-foreground font-mono text-xs uppercase tracking-wider font-bold hover:bg-background/90 transition-all inline-flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Mulai Menulis Naskah Baru</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/tentang"
                    className="font-mono text-xs uppercase tracking-wider text-background/80 hover:text-background underline underline-offset-4"
                  >
                    Pelajari Nilai &amp; Gerakan Perpusjal &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>
      </main>

      {/* Quick Read Drawer */}
      <ArticleQuickReadDrawer
        article={quickReadArticle}
        isOpen={Boolean(quickReadArticle)}
        onClose={() => setQuickReadArticle(null)}
      />

      <Footer />
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 py-16 w-full space-y-8">
            <ArticleGridSkeleton count={6} />
          </div>
        </div>
      }
    >
      <ArticlesCatalogContent />
    </React.Suspense>
  );
}
