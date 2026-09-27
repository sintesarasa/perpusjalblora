'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { ArticleStatus } from '@perpusjal/types';
import {
  Plus, Edit3, Trash2, Undo2, ExternalLink, FileText,
  ScrollText, X, ChevronRight, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyArticleItem {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  readingTime: number;
  wordCount: number;
  viewCount: number;
  updatedAt: string;
  category?: { name: string };
  previewToken?: string;
}

interface RevisionItem {
  id: string;
  statusFrom: string;
  statusTo: string;
  note: string | null;
  rejectionReason: string | null;
  createdAt: string;
  editor: { id: string; name: string; avatarUrl: string | null };
}

export default function MyArticlesDashboardPage() {
  const router = useRouter();
  const [articles, setArticles] = React.useState<MyArticleItem[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>('ALL');
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  // Revision History Modal
  const [revisionModal, setRevisionModal] = React.useState<{
    open: boolean;
    articleId: string;
    articleTitle: string;
    revisions: RevisionItem[];
    loading: boolean;
  }>({ open: false, articleId: '', articleTitle: '', revisions: [], loading: false });

  const loadArticles = React.useCallback(async () => {
    setIsLoading(true);
    const statusParam = activeTab === 'ALL' ? '' : `?status=${activeTab}`;
    const res = await apiClient<{ data: MyArticleItem[] }>(`/articles/me/list${statusParam}`);
    if (res.data) setArticles(res.data.data || []);
    setIsLoading(false);
  }, [activeTab]);

  React.useEffect(() => { loadArticles(); }, [loadArticles]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus draf naskah ini?')) return;
    setActionLoadingId(id);
    await apiClient(`/articles/${id}`, { method: 'DELETE' });
    setActionLoadingId(null);
    loadArticles();
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm('Tarik naskah kembali ke status Draf untuk disunting?')) return;
    setActionLoadingId(id);
    await apiClient(`/articles/${id}/withdraw`, { method: 'POST' });
    setActionLoadingId(null);
    loadArticles();
  };

  const openRevisionHistory = async (item: MyArticleItem) => {
    setRevisionModal({
      open: true,
      articleId: item.id,
      articleTitle: item.title,
      revisions: [],
      loading: true,
    });
    const res = await apiClient<RevisionItem[]>(`/articles/${item.id}/revisions`);
    setRevisionModal((prev) => ({
      ...prev,
      revisions: res.data || [],
      loading: false,
    }));
  };

  const statusBadges: Record<ArticleStatus, { label: string; style: string }> = {
    [ArticleStatus.DRAFT]: { label: 'DRAF', style: 'border-border text-muted' },
    [ArticleStatus.PENDING_REVIEW]: {
      label: '◌ MENUNGGU REVIEW',
      style: 'border-foreground text-foreground font-semibold',
    },
    [ArticleStatus.REVISION]: {
      label: '◐ PERLU REVISI',
      style: 'border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-bold',
    },
    [ArticleStatus.APPROVED]: {
      label: '■ DISETUJUI',
      style: 'border-emerald-600 text-emerald-700 font-semibold',
    },
    [ArticleStatus.SCHEDULED]: {
      label: '◓ TERJADWAL',
      style: 'border-blue-400 text-blue-700 dark:text-blue-300',
    },
    [ArticleStatus.PUBLISHED]: {
      label: '● TERBIT',
      style: 'border-foreground bg-foreground text-background font-bold',
    },
    [ArticleStatus.ARCHIVED]: { label: 'ARSIP', style: 'border-border text-muted' },
    [ArticleStatus.REJECTED]: {
      label: '▲ DITOLAK',
      style: 'border-red-500 text-red-700 dark:text-red-400',
    },
  };

  const tabs = [
    { key: 'ALL', label: 'Semua' },
    { key: ArticleStatus.DRAFT, label: 'Draf' },
    { key: ArticleStatus.PENDING_REVIEW, label: 'Review' },
    { key: ArticleStatus.REVISION, label: 'Revisi' },
    { key: ArticleStatus.PUBLISHED, label: 'Terbit' },
    { key: ArticleStatus.REJECTED, label: 'Ditolak' },
  ];

  const statusLabel: Record<string, string> = {
    DRAFT: 'Draf',
    PENDING_REVIEW: 'Menunggu Review',
    REVISION: 'Perlu Revisi',
    APPROVED: 'Disetujui',
    SCHEDULED: 'Terjadwal',
    PUBLISHED: 'Terbit',
    ARCHIVED: 'Diarsipkan',
    REJECTED: 'Ditolak',
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-6xl">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-foreground pb-6">
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
            RUANG PENULIS // PERPUSJAL BLORA
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight">
            Manajemen Naskah Tulisan
          </h1>
          <p className="font-sans text-xs sm:text-sm text-muted">
            Kelola draf esai, pantau status kurasi redaksi, dan pantau pembacaan naskahmu.
          </p>
        </div>

        <Link href="/dashboard/tulis">
          <Button variant="solid" size="md" className="w-full sm:w-auto shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Tulis Naskah Baru
          </Button>
        </Link>
      </div>

      {/* ── Status Filter Tabs (horizontal scroll, no wrap) ── */}
      <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0">
        <div className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider px-4 sm:px-0 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3.5 py-2 min-h-[40px] border transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-transparent text-muted border-border hover:border-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="p-16 flex items-center justify-center">
          <CustomLoader size="md" label="MEMBUKA DAFTAR NASKAH..." />
        </div>
      )}

      {/* ── Articles List ── */}
      {!isLoading && articles.length > 0 && (
        <div className="space-y-3">
          {articles.map((item) => {
            const badge = statusBadges[item.status] || { label: item.status, style: 'border-border' };
            const dateStr = new Date(item.updatedAt).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'short', year: 'numeric',
            });
            const needsAttention =
              item.status === ArticleStatus.REVISION || item.status === ArticleStatus.REJECTED;

            return (
              <div
                key={item.id}
                className={cn(
                  'p-4 sm:p-5 border bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors',
                  needsAttention
                    ? 'border-amber-400 dark:border-amber-600'
                    : 'border-border hover:border-foreground'
                )}
              >
                {/* Article Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('px-2 py-0.5 border font-mono text-[9px] uppercase tracking-wider shrink-0', badge.style)}>
                      {badge.label}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted truncate">
                      [{item.category?.name || 'UMUM'}] · {dateStr}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-normal text-foreground leading-snug">
                    {item.title}
                  </h3>

                  <div className="font-mono text-[11px] uppercase tracking-wider text-muted flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>{item.wordCount} Kata</span>
                    <span>·</span>
                    <span>{item.readingTime} Menit Baca</span>
                    {item.status === ArticleStatus.PUBLISHED && (
                      <>
                        <span>·</span>
                        <span className="text-foreground font-semibold">{item.viewCount} Dibaca</span>
                      </>
                    )}
                  </div>

                  {/* Revision attention callout */}
                  {needsAttention && (
                    <button
                      type="button"
                      onClick={() => openRevisionHistory(item)}
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      <ScrollText className="w-3 h-3" />
                      Lihat Catatan Redaksi
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* ── Actions ── */}
                <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 font-mono text-xs shrink-0">
                  {/* Edit: DRAFT or REVISION */}
                  {(item.status === ArticleStatus.DRAFT || item.status === ArticleStatus.REVISION) && (
                    <Link href={`/dashboard/tulis/${item.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                        Sunting
                      </Button>
                    </Link>
                  )}

                  {/* Withdraw: PENDING_REVIEW */}
                  {item.status === ArticleStatus.PENDING_REVIEW && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWithdraw(item.id)}
                      isLoading={actionLoadingId === item.id}
                    >
                      <Undo2 className="w-3.5 h-3.5 mr-1.5" />
                      Tarik Draf
                    </Button>
                  )}

                  {/* View published article */}
                  {item.status === ArticleStatus.PUBLISHED && (
                    <Link href={`/artikel/${item.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Lihat Terbit
                      </Button>
                    </Link>
                  )}

                  {/* Preview (non-published) */}
                  {item.status !== ArticleStatus.PUBLISHED && item.previewToken && (
                    <a
                      href={`/artikel/${item.slug}?preview=${item.previewToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm" className="text-muted hover:text-foreground" title="Pratinjau">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  )}

                  {/* Revision history button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openRevisionHistory(item)}
                    className="text-muted hover:text-foreground"
                    title="Riwayat kurasi"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </Button>

                  {/* Delete: non-published */}
                  {item.status !== ArticleStatus.PUBLISHED && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      isLoading={actionLoadingId === item.id}
                      className="text-muted hover:text-red-700 dark:hover:text-red-400"
                      title="Hapus naskah"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && articles.length === 0 && (
        <EmptyState
          title="Belum Ada Naskah Tulisan"
          description="Kamu belum memiliki naskah tulisan dalam kategori ini. Mulai bagikan gagasan dan catatan literasimu."
          actionLabel="Tulis Naskah Pertama"
          onAction={() => router.push('/dashboard/tulis')}
        />
      )}

      {/* ── Revision History Bottom Sheet / Modal ── */}
      {revisionModal.open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-foreground/30 dark:bg-foreground/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setRevisionModal((p) => ({ ...p, open: false }))}
        >
          <div
            className="w-full sm:max-w-lg bg-background border-t-2 sm:border-2 border-foreground rounded-t-2xl sm:rounded-none max-h-[85vh] sm:max-h-[75vh] flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-hairline">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  Riwayat Kurasi Redaksi
                </p>
                <h2 className="font-serif text-base font-normal mt-0.5 leading-snug text-foreground line-clamp-1">
                  {revisionModal.articleTitle}
                </h2>
              </div>
              <button
                onClick={() => setRevisionModal((p) => ({ ...p, open: false }))}
                className="p-2 text-muted hover:text-foreground transition-colors ml-3 shrink-0"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Revision List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {revisionModal.loading && (
                <div className="flex justify-center py-8">
                  <CustomLoader size="sm" label="Memuat riwayat..." />
                </div>
              )}

              {!revisionModal.loading && revisionModal.revisions.length === 0 && (
                <div className="text-center py-8">
                  <ScrollText className="w-8 h-8 mx-auto text-muted/50 mb-3" />
                  <p className="font-mono text-xs text-muted uppercase tracking-wider">
                    Belum ada catatan kurasi
                  </p>
                  <p className="font-sans text-xs text-muted/70 mt-1">
                    Naskah ini belum pernah ditinjau redaksi.
                  </p>
                </div>
              )}

              {!revisionModal.loading &&
                revisionModal.revisions.map((rev) => {
                  const date = new Date(rev.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  });
                  const time = new Date(rev.createdAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit', minute: '2-digit',
                  });
                  return (
                    <div key={rev.id} className="border border-border-hairline p-4 space-y-3 bg-surface-muted/20">
                      {/* Status flow + date */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                          <span className="text-muted">{statusLabel[rev.statusFrom] || rev.statusFrom}</span>
                          <ChevronRight className="w-3 h-3 text-muted" />
                          <span className="font-bold text-foreground">{statusLabel[rev.statusTo] || rev.statusTo}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted">
                          {date} · {time}
                        </span>
                      </div>

                      {/* Kurator info */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-muted border border-border-hairline overflow-hidden shrink-0">
                          {rev.editor.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={rev.editor.avatarUrl} alt={rev.editor.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-mono text-[8px] text-muted">
                              {rev.editor.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                          Kurator: <span className="text-foreground">{rev.editor.name}</span>
                        </span>
                      </div>

                      {/* Rejection reason */}
                      {rev.rejectionReason && (
                        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                          <p className="font-mono text-[9px] uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                            Alasan Penolakan
                          </p>
                          <p className="font-sans text-xs text-red-800 dark:text-red-300">{rev.rejectionReason}</p>
                        </div>
                      )}

                      {/* Note */}
                      {rev.note && (
                        <div className="px-3 py-2 bg-surface border-l-2 border-foreground">
                          <p className="font-mono text-[9px] uppercase tracking-wider text-muted mb-1">
                            Catatan Redaksi
                          </p>
                          <p className="font-sans text-sm sm:text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {rev.note}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Close button footer */}
            <div className="px-5 py-4 border-t border-border-hairline">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setRevisionModal((p) => ({ ...p, open: false }))}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
