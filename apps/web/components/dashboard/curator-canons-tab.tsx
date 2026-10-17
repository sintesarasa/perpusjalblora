'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArticleSummary,
  ArticleStatus,
  LandingSettings,
  DEFAULT_LANDING_SETTINGS,
} from '@perpusjal/types';
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
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomLoader } from '@/components/ui/custom-loader';

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
  const [landingSettings, setLandingSettings] = React.useState<LandingSettings>(DEFAULT_LANDING_SETTINGS);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Search & Filter
  const [categoryFilter, setCategoryFilter] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Active Slots for Landing Page Mimbar Warga
  const [headlineId, setHeadlineId] = React.useState<string | null>(null);
  const [sideIds, setSideIds] = React.useState<string[]>([]);

  // Load published articles & current landing configuration
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [articlesRes, configRes] = await Promise.all([
        apiClient<{ data: ArticleSummary[] }>('/articles?status=PUBLISHED&perPage=50&sort=terbaru'),
        apiClient<LandingSettings>('/admin/landing-config'),
      ]);

      if (articlesRes.data?.data) {
        setArticles(articlesRes.data.data);
      }

      if (configRes.data) {
        setLandingSettings(configRes.data);
        const feat = configRes.data.featuredArticles;
        if (feat) {
          setHeadlineId(feat.headlineArticleId || null);
          setSideIds(feat.sideArticleIds || []);
        } else if (articlesRes.data?.data && articlesRes.data.data.length > 0) {
          // Default fallbacks from published articles
          const pub = articlesRes.data.data;
          setHeadlineId(pub[0]?.id || null);
          setSideIds(pub.slice(1, 4).map((a) => a.id));
        }
      }
    } catch {
      setErrorMsg('Gagal memuat konfigurasi etalase warta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Save Slot Configuration to API
  const handleSaveSlots = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload: LandingSettings = {
      ...landingSettings,
      featuredArticles: {
        headlineArticleId: headlineId,
        sideArticleIds: sideIds,
      },
    };

    try {
      const res = await apiClient<LandingSettings>('/admin/landing-config', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.error) {
        setErrorMsg(res.error.message || 'Gagal menyimpan slot etalase beranda.');
      } else {
        setLandingSettings(res.data || payload);
        setSuccessMsg('Penetapan slot Tajuk Utama & Catatan Warga berhasil disimpan!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  // Slot Management Handlers
  const handleSetHeadline = (articleId: string) => {
    // If article was in side slots, remove it from side
    setSideIds((prev) => prev.filter((id) => id !== articleId));
    setHeadlineId(articleId);
  };

  const handleToggleSideSlot = (articleId: string) => {
    if (headlineId === articleId) {
      setHeadlineId(null);
    }

    setSideIds((prev) => {
      if (prev.includes(articleId)) {
        return prev.filter((id) => id !== articleId);
      }
      if (prev.length >= 3) {
        setErrorMsg('Maksimal 3 naskah dapat dijadikan Catatan Pinggir sekaligus.');
        return prev;
      }
      return [...prev, articleId];
    });
  };

  const handleRemoveFromLanding = (articleId: string) => {
    if (headlineId === articleId) setHeadlineId(null);
    setSideIds((prev) => prev.filter((id) => id !== articleId));
  };

  const handleResetToLatest = () => {
    if (articles.length > 0) {
      setHeadlineId(articles[0].id);
      setSideIds(articles.slice(1, 4).map((a) => a.id));
      setSuccessMsg('Slot diatur ulang mengikuti 4 naskah terbitan terbaru.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // Filtered articles list
  const filteredArticles = React.useMemo(() => {
    return articles.filter((art) => {
      const matchesCategory = !categoryFilter || art.category?.slug === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.author?.name?.toLowerCase().includes(q) ||
        art.author?.username?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [articles, categoryFilter, searchQuery]);

  // Resolve active objects for preview
  const headlineArticle = articles.find((a) => a.id === headlineId) || null;
  const sideArticlesList = sideIds.map((id) => articles.find((a) => a.id === id)).filter(Boolean) as ArticleSummary[];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-hairline pb-4 font-mono text-xs">
        <div>
          <div className="text-[10px] uppercase text-muted tracking-widest flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-foreground" />
            <span>KURASI REDAKSI // MIMBAR WARGA LANDING PAGE (1 TAJUK + 3 CATATAN)</span>
          </div>
          <p className="font-serif italic text-sm text-foreground/85 mt-0.5">
            Tentukan naskah berstatus terbit untuk mengisi 4 slot etalase muka: 1 Tajuk Utama dan 3 Catatan Pinggir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="px-3 py-1.5 border border-border-hairline bg-surface hover:border-foreground transition-colors inline-flex items-center gap-1.5 rounded-none cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={handleResetToLatest}
            className="px-3 py-1.5 border border-border-hairline bg-surface hover:border-foreground text-muted hover:text-foreground transition-colors inline-flex items-center gap-1.5 rounded-none cursor-pointer"
            title="Kembalikan ke naskah terbaru"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Otomatis Terbaru</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSlots}
            disabled={isSaving}
            className="px-4 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5 rounded-none cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Simpan Etalase</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
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
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Active Slot Status Banner (Matriks 4 Slot) */}
      <div className="border-2 border-foreground bg-surface p-4 sm:p-5 font-mono space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-border-hairline pb-2">
          <span className="font-bold text-foreground uppercase tracking-widest text-[11px]">
            [ MATRIKS 4 SLOT ETALASE BERANDA // STATUS SAAT INI ]
          </span>
          <span className="text-muted text-[10.5px]">
            {headlineId ? '1' : '0'}/1 Tajuk &bull; {sideIds.length}/3 Catatan Pinggir
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Slot 1: Tajuk Utama */}
          <div className="border-2 border-foreground bg-background p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-muted">
              <span className="px-1.5 py-0.5 bg-foreground text-background font-bold uppercase tracking-wider">
                SLOT 1: TAJUK UTAMA
              </span>
              {headlineArticle && (
                <button
                  type="button"
                  onClick={() => setHeadlineId(null)}
                  className="text-muted hover:text-destructive font-bold"
                  title="Kosongkan Slot"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {headlineArticle ? (
              <div className="space-y-1">
                <span className="text-[9px] uppercase text-muted font-bold block">
                  {headlineArticle.category?.name || 'Suara Lapak'}
                </span>
                <h5 className="font-serif font-bold text-xs text-foreground line-clamp-2">
                  {headlineArticle.title}
                </h5>
                <p className="text-[9.5px] text-muted truncate">
                  Oleh {headlineArticle.author?.name}
                </p>
              </div>
            ) : (
              <p className="text-muted text-[10px] italic py-2">Belum ada naskah terpilih</p>
            )}
          </div>

          {/* Slots 2, 3, 4: Catatan Pinggir */}
          {[0, 1, 2].map((slotIdx) => {
            const art = sideArticlesList[slotIdx];
            return (
              <div key={slotIdx} className="border border-border-hairline bg-background p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-muted">
                  <span className="font-bold uppercase tracking-wider text-muted">
                    SLOT {slotIdx + 2}: CATATAN {slotIdx + 1}
                  </span>
                  {art && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFromLanding(art.id)}
                      className="text-muted hover:text-destructive font-bold"
                      title="Lepas dari Slot"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {art ? (
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase text-muted font-bold block">
                      {art.category?.name || 'Koran Lapak'}
                    </span>
                    <h5 className="font-serif font-bold text-xs text-foreground line-clamp-2">
                      {art.title}
                    </h5>
                    <p className="text-[9.5px] text-muted truncate">
                      Oleh {art.author?.name}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted text-[10px] italic py-2">Slot kosong (opsional)</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Split: Published Articles Picker (Left) & Real Broadsheet Live Simulation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column (6 cols): Published Articles Picker */}
        <div className="lg:col-span-6 space-y-3 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-surface border border-border-hairline text-xs">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Cari naskah terbit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-background border border-border-hairline focus:border-foreground outline-none text-xs rounded-none"
              />
            </div>

            {/* Rubrik Select */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 bg-background border border-border-hairline text-foreground text-xs rounded-none cursor-pointer"
            >
              {RUBRIK_OPTIONS.map((opt) => (
                <option key={opt.slug} value={opt.slug}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[10px] uppercase text-muted tracking-wider flex items-center justify-between pb-1">
            <span>DAFTAR NASKAH TERBIT ({filteredArticles.length})</span>
            <span>KLIK TOMBOL UNTUK MEMASANG</span>
          </div>

          {isLoading ? (
            <div className="p-12 flex items-center justify-center border border-border-hairline bg-surface">
              <CustomLoader size="md" label="MEMUAT BERKAS..." />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-8 border border-dashed border-border-hairline text-center text-muted text-xs">
              Tidak ada artikel yang cocok dengan saringan.
            </div>
          ) : (
            <div className="border border-border-hairline divide-y divide-border-hairline bg-surface max-h-[580px] overflow-y-auto scrollbar-thin">
              {filteredArticles.map((art) => {
                const isHeadline = headlineId === art.id;
                const isSide = sideIds.includes(art.id);
                const isAssigned = isHeadline || isSide;

                return (
                  <div
                    key={art.id}
                    className={cn(
                      'p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors',
                      isHeadline
                        ? 'bg-surface-muted border-l-4 border-l-foreground'
                        : isSide
                        ? 'bg-surface-muted/60 border-l-2 border-l-foreground/60'
                        : 'hover:bg-surface-muted/30'
                    )}
                  >
                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-foreground text-background text-[8px] uppercase font-bold tracking-wider rounded-none">
                          {art.category?.name || 'Suara Lapak'}
                        </span>
                        {isHeadline && (
                          <span className="px-1.5 py-0.5 bg-foreground text-background text-[8px] uppercase font-bold tracking-wider rounded-none">
                            ★ TAJUK UTAMA
                          </span>
                        )}
                        {isSide && (
                          <span className="px-1.5 py-0.5 bg-surface border border-border-hairline text-foreground text-[8px] uppercase font-bold tracking-wider rounded-none">
                            CATATAN #{sideIds.indexOf(art.id) + 1}
                          </span>
                        )}
                        <span className="text-[9px] text-muted uppercase">
                          {art.readingTime || 3} MNT
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-foreground leading-snug line-clamp-1">
                        {art.title}
                      </h4>

                      <p className="text-[10px] text-muted truncate">
                        Oleh {art.author?.name} (@{art.author?.username})
                      </p>
                    </div>

                    {/* Action Slot Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center font-mono text-[10px]">
                      {!isHeadline && (
                        <button
                          type="button"
                          onClick={() => handleSetHeadline(art.id)}
                          className="px-2 py-1 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors rounded-none cursor-pointer"
                          title="Pasang sebagai Tajuk Utama (Slot 1)"
                        >
                          + Tajuk
                        </button>
                      )}

                      {!isSide && (
                        <button
                          type="button"
                          onClick={() => handleToggleSideSlot(art.id)}
                          className="px-2 py-1 border border-border-hairline hover:border-foreground bg-background text-foreground uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                          title="Pasang sebagai Catatan Samping (Slot 2-4)"
                        >
                          + Catatan
                        </button>
                      )}

                      {isAssigned && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFromLanding(art.id)}
                          className="p-1 border border-border-hairline hover:border-destructive text-muted hover:text-destructive transition-colors rounded-none cursor-pointer"
                          title="Lepas dari Beranda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <Link
                        href={`/artikel/${art.slug}`}
                        target="_blank"
                        className="p-1 border border-border-hairline hover:border-foreground bg-background text-muted hover:text-foreground transition-colors rounded-none"
                        title="Buka Naskah Asli"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (6 cols): Real Broadsheet Live Simulation */}
        <div className="lg:col-span-6 space-y-3 sticky top-20 font-mono">
          <div className="border border-border-hairline bg-surface-muted/30 p-2.5 text-[10px] uppercase text-muted tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              <Eye className="w-3 h-3" />
              <span>SIMULASI TAMPILAN MIMBAR WARGA DI LANDING PAGE</span>
            </span>
            <span>LIVE PREVIEW SPREAD</span>
          </div>

          {/* Miniature Broadsheet Preview */}
          <div className="p-4 sm:p-5 border-2 border-foreground bg-background space-y-4 select-none">
            <div className="border-b border-border-hairline pb-2 flex items-center justify-between text-[9px] text-muted uppercase tracking-widest font-bold">
              <span>[ MIMBAR WARGA // SUARA DARI TROTOAR ]</span>
              <span>KORAN TERPAL BLORA</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              {/* Preview Tajuk Utama (7 cols) */}
              <div className="md:col-span-7 border border-foreground bg-surface p-3 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[8px] border-b border-border-hairline pb-1 text-muted">
                    <span className="px-1 py-0.2 bg-foreground text-background font-bold uppercase">
                      TAJUK UTAMA
                    </span>
                    <span>{headlineArticle?.readingTime || 3} MNT BACA</span>
                  </div>

                  <h5 className="font-serif font-black text-sm text-foreground leading-snug line-clamp-2">
                    {headlineArticle?.title || 'Belum Ada Tajuk Utama Terpilih'}
                  </h5>

                  <p className="text-[8.5px] text-muted">
                    Oleh {headlineArticle?.author?.name || 'Warga Blora'}
                  </p>

                  <div className="p-2 bg-background border-l-2 border-foreground">
                    <p className="font-serif italic text-[9.5px] text-foreground/80 line-clamp-2 leading-relaxed">
                      &ldquo;{headlineArticle?.excerpt || 'Kutipan pembuka naskah Tajuk Utama.'}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border-hairline text-[8.5px] font-bold uppercase tracking-wider text-foreground">
                  [ BACA TAJUK LENGKAP &rarr; ]
                </div>
              </div>

              {/* Preview 3 Catatan Samping (5 cols) */}
              <div className="md:col-span-5 border border-foreground bg-background divide-y divide-border-hairline flex flex-col justify-between">
                {sideArticlesList.length === 0 ? (
                  <div className="p-4 text-center text-muted text-[9px] italic my-auto">
                    Belum ada naskah catatan samping terpilih (Slot 2-4).
                  </div>
                ) : (
                  sideArticlesList.map((art, idx) => (
                    <div key={art.id} className="p-2 space-y-0.5">
                      <div className="flex items-center justify-between text-[7.5px] text-muted">
                        <span className="font-bold">0{idx + 1} &bull; {art.category?.name || 'Lapak'}</span>
                        <span>{art.readingTime || 3}m</span>
                      </div>
                      <h6 className="font-serif font-bold text-[10px] text-foreground line-clamp-1">
                        {art.title}
                      </h6>
                      <p className="font-serif italic text-[8.5px] text-foreground/70 line-clamp-1">
                        &ldquo;{art.excerpt}&rdquo;
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Callout Preview */}
            <div className="p-2.5 bg-surface border border-border-hairline flex items-center justify-between text-[8px] text-muted">
              <span>Punya cerita atau kritik? Kirim naskahmu.</span>
              <span className="font-bold text-foreground">[ KIRIM TULISAN ]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export alias as well
export const CuratorWritingsTab = CuratorCanonsTab;
