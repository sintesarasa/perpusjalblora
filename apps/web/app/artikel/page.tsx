'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArticleFeatured } from '@/components/articles/article-featured';
import { ArticleCard } from '@/components/articles/article-card';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ArticleSummary, ArticleCategory } from '@perpusjal/types';
import { cn } from '@/lib/utils';

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
    }

    loadArticles();
  }, [currentCategory, currentSearch, currentSort, currentPage]);

  const updateQueryParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset to page 1 on filter changes
    if (!newParams.page && newParams.page !== '1') {
      params.delete('page');
    }
    router.push(`/artikel?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ q: searchInput.trim() || null });
  };

  const featuredArticle =
    currentPage === 1 && !currentSearch && !currentCategory
      ? articles.find((a) => a.isFeatured) || articles[0]
      : null;

  const regularArticles = featuredArticle
    ? articles.filter((a) => a.id !== featuredArticle.id)
    : articles;

  const createPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    return `/artikel?${params.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Editorial Top Masthead */}
        <div className="border-b-2 border-foreground pb-6 space-y-3">
          <div className="flex items-center justify-between font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted">
            <span>REGISTRI PUBLIKASI // WARTA & ESAI</span>
            <span>BLORA, JAWA TENGAH</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight">
            Arsip Warta & Catatan Kritis
          </h1>
          <p className="font-sans text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
            Ruang literasi independen untuk mendokumentasikan pemikiran warga, resensi buku jalanan, liputan kegiatan lapak, dan catatan kebudayaan Blora.
          </p>
        </div>

        {/* Featured Article on Frontpage */}
        {featuredArticle && !isLoading && (
          <ArticleFeatured article={featuredArticle} />
        )}

        {/* Filter Bar */}
        <div className="border border-border p-4 bg-surface space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] uppercase tracking-wider">
              <button
                type="button"
                onClick={() => updateQueryParams({ kategori: null })}
                className={cn(
                  'px-3 py-1.5 border transition-colors',
                  !currentCategory
                    ? 'bg-foreground text-background border-foreground font-bold'
                    : 'bg-transparent text-muted border-border hover:border-foreground'
                )}
              >
                Semua
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateQueryParams({ kategori: c.slug })}
                  className={cn(
                    'px-3 py-1.5 border transition-colors',
                    currentCategory === c.slug
                      ? 'bg-foreground text-background border-foreground font-bold'
                      : 'bg-transparent text-muted border-border hover:border-foreground'
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Urutkan:</span>
              <select
                value={currentSort}
                onChange={(e) => updateQueryParams({ sort: e.target.value })}
                className="bg-transparent border border-border px-2 py-1 text-foreground focus:outline-none focus:border-foreground font-mono text-xs rounded-none cursor-pointer"
              >
                <option value="terbaru">Terbaru</option>
                <option value="populer">Terpopuler</option>
                <option value="terlama">Terlama</option>
              </select>
            </div>
          </div>

          {/* Search Bar Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari judul tulisan, penggalan kalimat, atau nama penulis..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-10 pl-10 pr-24 bg-background border border-border text-xs sm:text-sm font-sans focus:outline-none focus:border-foreground rounded-none transition-colors"
            />
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-foreground text-background font-mono text-[10px] uppercase tracking-wider font-semibold hover:opacity-85 transition-opacity"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
            <CustomLoader size="md" label="MEMBUKA ARSIP TULISAN..." />
          </div>
        )}

        {/* Article Grid */}
        {!isLoading && regularArticles.length > 0 && (
          <div className="space-y-10">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted border-b border-border-hairline pb-2">
              <span>Menampilkan {regularArticles.length} dari {totalCount} Naskah</span>
              <span>Halaman {currentPage} dari {totalPages}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            <div className="pt-8 border-t border-border-hairline">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                createPageUrl={createPageUrl}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && regularArticles.length === 0 && (
          <EmptyState
            title="Belum Ada Tulisan yang Sesuai"
            description="Tidak ditemukan naskah artikel yang sesuai dengan kriteria pencarian atau kategori yang kamu pilih."
            actionLabel="Reset Pencarian"
            onAction={() => {
              setSearchInput('');
              updateQueryParams({ q: null, kategori: null, page: null });
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <CustomLoader size="md" label="MEMUAT ARSIP WARTA..." />
        </div>
      }
    >
      <ArticlesCatalogContent />
    </React.Suspense>
  );
}
