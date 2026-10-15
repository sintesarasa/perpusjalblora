'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary, ArticleStatus } from '@perpusjal/types';
import { apiClient } from '@/lib/api';
import {
  Sparkles,
  Search,
  Star,
  ExternalLink,
  Check,
  X,
  Quote,
  ArrowRight,
  RefreshCw,
  Eye,
  AlertCircle,
  Clock,
  Feather,
  BookOpen,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomLoader } from '@/components/ui/custom-loader';

// Retain legacy exports for compatibility with dashboard/buku
export const CANON_TAGS = [
  { key: 'PRAMOEDYA', label: 'PRAMOEDYA', desc: 'Sastra & Roman Perlawanan' },
  { key: 'FILSAFAT', label: 'FILSAFAT', desc: 'Sosial & Nalar Kritis (Madilog, dsb)' },
  { key: 'SAMIN', label: 'SAMIN BLORA', desc: 'Sejarah, Sedulur Sikep, Agraria' },
  { key: 'PEDAGOGI', label: 'PEDAGOGI', desc: 'Pendidikan Kritis & Fabel Rakyat' },
] as const;

export function parseCuratorCanonNote(raw?: string | null): { tag: string; quote: string } {
  if (!raw) return { tag: 'PRAMOEDYA', quote: '' };
  const match = raw.match(/^\[TAG:([A-Z0-9_\-]+)\]\s*(.*)$/s);
  if (match) {
    return {
      tag: match[1],
      quote: match[2].trim(),
    };
  }
  return { tag: 'PRAMOEDYA', quote: raw.trim() };
}

export function formatCuratorCanonNote(tag: string, quote: string): string {
  const cleanTag = tag.toUpperCase().trim() || 'PRAMOEDYA';
  return `[TAG:${cleanTag}] ${quote.trim()}`;
}

export const RUBRIK_OPTIONS = [
  { slug: '', label: 'SEMUA RUBRIK' },
  { slug: 'suara-lapak', label: 'SUARA LAPAK' },
  { slug: 'pojok-blora', label: 'POJOK BLORA' },
  { slug: 'opini-warga', label: 'OPINI WARGA' },
  { slug: 'lingkungan', label: 'LINGKUNGAN' },
  { slug: 'sejarah', label: 'SEJARAH' },
  { slug: 'puisi', label: 'PUISI' },
  { slug: 'refleksi-diri', label: 'REFLEKSI DIRI' },
];

export function CuratorCanonsTab() {
  const [articles, setArticles] = React.useState<ArticleSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Selected article for Live Dossier Simulation
  const [selectedArticle, setSelectedArticle] = React.useState<ArticleSummary | null>(null);

  // Filters & Search
  const [categoryFilter, setCategoryFilter] = React.useState<string>('');
  const [featuredOnlyFilter, setFeaturedOnlyFilter] = React.useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  // Load published articles
  const loadArticles = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      params.set('status', ArticleStatus.PUBLISHED);
      params.set('perPage', '50');
      params.set('sort', 'terbaru');
      if (categoryFilter) params.set('kategori', categoryFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (featuredOnlyFilter !== null) params.set('featured', String(featuredOnlyFilter));

      const res = await apiClient<{ data: ArticleSummary[] }>(`/articles?${params.toString()}`);
      if (res.data?.data) {
        setArticles(res.data.data);
        if (res.data.data.length > 0) {
          // Keep current selection if still in list, else pick first
          setSelectedArticle((prev) => {
            const found = res.data?.data.find((a) => a.id === prev?.id);
            return found || res.data?.data[0] || null;
          });
        } else {
          setSelectedArticle(null);
        }
      }
    } catch {
      setErrorMsg('Gagal memuat arsip tulisan warga.');
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, searchQuery, featuredOnlyFilter]);

  React.useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Toggle Featured Status for landing page highlight
  const handleToggleFeatured = async (article: ArticleSummary) => {
    setTogglingId(article.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    const newFeaturedState = !article.isFeatured;

    try {
      const res = await apiClient<{ id: string; isFeatured: boolean }>(
        `/articles/${article.id}/featured`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isFeatured: newFeaturedState }),
        }
      );

      if (res.error) {
        setErrorMsg(res.error.message || 'Gagal memperbarui status sorotan tulisan.');
      } else {
        setSuccessMsg(
          newFeaturedState
            ? `Naskah "${article.title}" berhasil dijadikan Sorotan Utama Landing Page!`
            : `Naskah "${article.title}" dilepas dari Sorotan Utama.`
        );
        setTimeout(() => setSuccessMsg(null), 4000);
        await loadArticles();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat memperbarui status sorotan.');
    } finally {
      setTogglingId(null);
    }
  };

  const featuredCount = articles.filter((a) => a.isFeatured).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Subheader & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-hairline pb-4 font-mono text-xs">
        <div>
          <div className="text-[10px] uppercase text-muted tracking-widest flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-foreground" />
            <span>KURASI ETALASE // SOROTAN WARTA &amp; TULISAN WARGA</span>
          </div>
          <p className="font-serif italic text-sm text-foreground/85 mt-0.5">
            Pilih karya tulis dan esai warga untuk dijadikan sorotan utama (featured) pada etalase muka Perpustakaan Jalanan Blora.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadArticles}
            disabled={isLoading}
            className="px-3 py-1.5 border border-border-hairline bg-surface hover:border-foreground transition-colors inline-flex items-center gap-1.5 rounded-none cursor-pointer"
            title="Segarkan Arsip"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            <span>Segarkan</span>
          </button>

          <Link
            href="/tulis"
            className="px-3.5 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5 rounded-none"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Tulis Naskah Baru</span>
          </Link>
        </div>
      </div>

      {/* Status Notifications */}
      {errorMsg && (
        <div className="p-3 border-2 border-destructive bg-surface-muted text-destructive font-mono text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 border-2 border-foreground bg-surface text-foreground font-mono text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-surface border border-border-hairline font-mono text-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Cari naskah berdasarkan judul atau penulis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border-hairline focus:border-foreground outline-none text-foreground text-xs rounded-none placeholder:text-muted"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Featured Filter Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setFeaturedOnlyFilter(null)}
            className={cn(
              'px-2.5 py-1.5 border transition-colors rounded-none font-bold text-[11px]',
              featuredOnlyFilter === null
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted border-border-hairline hover:border-foreground'
            )}
          >
            SEMUA ({articles.length})
          </button>

          <button
            type="button"
            onClick={() => setFeaturedOnlyFilter(true)}
            className={cn(
              'px-2.5 py-1.5 border transition-colors rounded-none font-bold text-[11px] inline-flex items-center gap-1',
              featuredOnlyFilter === true
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted border-border-hairline hover:border-foreground'
            )}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>SOROTAN ({featuredCount})</span>
          </button>
        </div>
      </div>

      {/* Rubrik Category Badges */}
      <div className="flex flex-wrap gap-1.5 font-mono text-xs uppercase tracking-wider">
        {RUBRIK_OPTIONS.map((opt) => (
          <button
            key={opt.slug}
            type="button"
            onClick={() => setCategoryFilter(opt.slug)}
            className={cn(
              'px-3 py-1 border transition-colors cursor-pointer rounded-none font-bold text-[11px]',
              categoryFilter === opt.slug
                ? 'bg-foreground text-background border-foreground'
                : 'bg-surface text-muted border-border-hairline hover:text-foreground hover:border-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-16 flex items-center justify-center">
          <CustomLoader size="md" label="MEMUAT BERKAS TULISAN WARGA..." />
        </div>
      ) : articles.length === 0 ? (
        <div className="border-2 border-dashed border-border-hairline p-16 text-center space-y-4 bg-surface rounded-none font-mono">
          <Feather className="w-10 h-10 mx-auto text-muted stroke-1" />
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-foreground">Tidak Ada Naskah yang Sesuai</h3>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              {searchQuery || categoryFilter
                ? 'Coba atur ulang filter pencarian atau kategori rubrik.'
                : 'Belum ada artikel warga yang berstatus terbit. Tinjau naskah di tab Naskah Warta Warga terlebih dahulu.'}
            </p>
          </div>
          {(searchQuery || categoryFilter || featuredOnlyFilter !== null) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('');
                setFeaturedOnlyFilter(null);
              }}
              className="px-3.5 py-1.5 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-none cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        /* 2-Column Split: Articles Table (Left) & Live Dossier Simulation (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Articles Table */}
          <div className="lg:col-span-7 space-y-3">
            <div className="border border-border-hairline divide-y divide-border-hairline bg-surface">
              {articles.map((art, idx) => {
                const isSelected = selectedArticle?.id === art.id;
                const isTogglingThis = togglingId === art.id;

                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className={cn(
                      'p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors',
                      isSelected ? 'bg-surface-muted border-l-4 border-l-foreground' : 'hover:bg-surface-muted/50'
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="font-mono text-muted text-xs shrink-0 pt-0.5 font-bold">
                        {`${idx + 1}`.padStart(2, '0')}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-1.5 py-0.5 bg-foreground text-background font-mono text-[8.5px] uppercase font-bold tracking-wider rounded-none">
                            {art.category?.name || 'Suara Lapak'}
                          </span>
                          {art.isFeatured && (
                            <span className="px-1.5 py-0.5 bg-surface-muted border border-border-hairline text-foreground font-mono text-[8.5px] uppercase font-bold tracking-wider rounded-none inline-flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>SOROTAN UTAMA</span>
                            </span>
                          )}
                          <span className="font-mono text-[9px] text-muted uppercase inline-flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{art.readingTime || 3} MNT</span>
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-base text-foreground truncate">
                          {art.title}
                        </h4>

                        <p className="font-mono text-[11px] text-muted truncate">
                          Oleh {art.author?.name || 'Warga'} (@{art.author?.username || 'warga'})
                        </p>

                        {art.excerpt && (
                          <p className="font-serif italic text-xs text-foreground/80 line-clamp-1 mt-0.5">
                            &ldquo;{art.excerpt}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFeatured(art);
                        }}
                        disabled={isTogglingThis}
                        className={cn(
                          'px-2.5 py-1.5 border font-bold text-[10.5px] uppercase tracking-wider inline-flex items-center gap-1 transition-colors rounded-none cursor-pointer',
                          art.isFeatured
                            ? 'bg-foreground text-background border-foreground hover:bg-destructive hover:border-destructive hover:text-destructive-foreground'
                            : 'bg-background text-foreground border-border-hairline hover:border-foreground'
                        )}
                        title={art.isFeatured ? 'Lepas dari Sorotan Landing Page' : 'Jadikan Sorotan Landing Page'}
                      >
                        <Star className={cn('w-3 h-3', art.isFeatured && 'fill-current')} />
                        <span>{art.isFeatured ? 'Lepas' : 'Jadikan Sorotan'}</span>
                      </button>

                      <Link
                        href={`/artikel/${art.slug}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 border border-border-hairline hover:border-foreground bg-background text-muted hover:text-foreground transition-colors rounded-none"
                        title="Buka Halaman Artikel di Tab Baru"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Dossier Simulation (Exact Landing Page Mirror) */}
          <div className="lg:col-span-5 space-y-3 sticky top-20">
            <div className="border border-border-hairline bg-surface-muted/30 p-3 font-mono text-[10px] uppercase text-muted tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Eye className="w-3 h-3" />
                <span>SIMULASI TAMPILAN LANDING PAGE</span>
              </span>
              <span>LIVE DOSSIER BOX</span>
            </div>

            {selectedArticle ? (
              <div className="p-6 border-2 border-foreground bg-background space-y-4 font-mono select-none">
                <div className="flex items-center justify-between border-b border-border-hairline pb-2.5 text-[10px] uppercase text-muted tracking-widest">
                  <span className="font-bold text-foreground">
                    [ RUBRIK // {(selectedArticle.category?.name || 'SUARA LAPAK').toUpperCase()} ]
                  </span>
                  <span className="text-muted">
                    {selectedArticle.readingTime || 3} MENIT BACA
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {selectedArticle.isFeatured && (
                      <span className="px-1.5 py-0.5 bg-foreground text-background font-mono text-[8.5px] uppercase font-bold tracking-wider rounded-none">
                        SOROTAN UTAMA
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif text-xl sm:text-2xl font-black text-foreground leading-snug">
                    {selectedArticle.title}
                  </h4>
                  <div className="flex items-center gap-2 pt-1 font-mono text-[10.5px] text-muted">
                    <div className="w-5 h-5 rounded-none border border-foreground bg-surface flex items-center justify-center font-bold text-[10px] text-foreground shrink-0">
                      {(selectedArticle.author?.name || 'W').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-foreground font-semibold">
                      {selectedArticle.author?.name || 'Warga Blora'}
                    </span>
                    <span>&bull;</span>
                    <span>@{selectedArticle.author?.username || 'warga'}</span>
                  </div>
                </div>

                {/* Quotation Excerpt Pull-Box */}
                <div className="p-4 bg-surface border-l-4 border-foreground space-y-2">
                  <Quote className="w-4 h-4 text-muted shrink-0" />
                  <p className="font-serif italic text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    &ldquo;
                    {selectedArticle.excerpt ||
                      'Catatan pemikiran dan dialektika warga di ruang publik Perpusjal Blora.'}
                    &rdquo;
                  </p>
                  <div className="text-right text-[9px] uppercase text-muted pt-1">
                    — Cuplikan Terbitan Rubrik {selectedArticle.category?.name || 'Suara Lapak'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-border-hairline">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(selectedArticle)}
                    disabled={togglingId === selectedArticle.id}
                    className={cn(
                      'px-3 py-2 border font-mono text-[10.5px] uppercase font-bold tracking-wider inline-flex items-center gap-1.5 rounded-none cursor-pointer transition-colors',
                      selectedArticle.isFeatured
                        ? 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'
                        : 'border-foreground bg-surface text-foreground hover:bg-foreground hover:text-background'
                    )}
                  >
                    <Star className={cn('w-3 h-3', selectedArticle.isFeatured && 'fill-current')} />
                    <span>
                      {selectedArticle.isFeatured ? 'Lepas Sorotan' : 'Jadikan Sorotan'}
                    </span>
                  </button>

                  <Link
                    href={`/artikel/${selectedArticle.slug}`}
                    target="_blank"
                    className="px-3.5 py-2 bg-foreground text-background font-mono text-[10.5px] uppercase font-bold tracking-wider hover:bg-foreground/90 transition-all inline-flex items-center gap-1.5 rounded-none"
                  >
                    <span>BUKA ARTIKEL</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-border-hairline text-center text-muted font-mono text-xs">
                Pilih naskah di sebelah kiri untuk melihat simulasi tampilan.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Export alias as well
export const CuratorWritingsTab = CuratorCanonsTab;
