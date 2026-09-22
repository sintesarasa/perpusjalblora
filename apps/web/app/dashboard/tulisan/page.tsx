'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { ArticleStatus } from '@perpusjal/types';
import { Plus, Edit3, Trash2, Undo2, ExternalLink, FileText } from 'lucide-react';
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
}

export default function MyArticlesDashboardPage() {
  const router = useRouter();
  const [articles, setArticles] = React.useState<MyArticleItem[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>('ALL');
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  const loadArticles = React.useCallback(async () => {
    setIsLoading(true);
    const statusParam = activeTab === 'ALL' ? '' : `?status=${activeTab}`;
    const res = await apiClient<{ data: MyArticleItem[] }>(`/articles/me/list${statusParam}`);

    if (res.data) {
      setArticles(res.data.data || []);
    }
    setIsLoading(false);
  }, [activeTab]);

  React.useEffect(() => {
    loadArticles();
  }, [loadArticles]);

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

  const statusBadges: Record<ArticleStatus, { label: string; style: string }> = {
    [ArticleStatus.DRAFT]: { label: '[ DRAF ]', style: 'border-border text-muted' },
    [ArticleStatus.PENDING_REVIEW]: { label: '[ ◌ MENUNGGU REVIEW ]', style: 'border-foreground text-foreground font-semibold' },
    [ArticleStatus.REVISION]: { label: '[ ◐ PERLU REVISI ]', style: 'border-foreground bg-foreground text-background font-bold' },
    [ArticleStatus.APPROVED]: { label: '[ ■ DISETUJUI ]', style: 'border-foreground font-semibold' },
    [ArticleStatus.SCHEDULED]: { label: '[ ◓ TERJADWAL ]', style: 'border-border-hairline text-muted' },
    [ArticleStatus.PUBLISHED]: { label: '[ ● TERBIT ]', style: 'border-foreground text-foreground font-bold' },
    [ArticleStatus.ARCHIVED]: { label: '[ ARSIP ]', style: 'border-border text-muted' },
    [ArticleStatus.REJECTED]: { label: '[ ▲ DITOLAK ]', style: 'border-foreground bg-surface-muted text-foreground' },
  };

  const tabs = [
    { key: 'ALL', label: 'Semua Naskah' },
    { key: ArticleStatus.DRAFT, label: 'Draf' },
    { key: ArticleStatus.PENDING_REVIEW, label: 'Menunggu Review' },
    { key: ArticleStatus.REVISION, label: 'Perlu Revisi' },
    { key: ArticleStatus.PUBLISHED, label: 'Terbit' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl">
      {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-foreground pb-6">
          <div className="space-y-1">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              RUANG PENULIS // PERPUSJAL BLORA
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
              Manajemen Naskah Tulisan
            </h1>
            <p className="font-sans text-xs sm:text-sm text-muted">
              Kelola draf esai, pantau status kurasi redaksi, dan pantau pembacaan naskahmu.
            </p>
          </div>

          <Link href="/tulis">
            <Button variant="solid" size="md" className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Tulis Naskah Baru
            </Button>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] uppercase tracking-wider border-b border-border pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3.5 py-1.5 border transition-colors',
                activeTab === tab.key
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-transparent text-muted border-border hover:border-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-16 flex items-center justify-center">
            <CustomLoader size="md" label="MEMBUKA DAFTAR NASKAH..." />
          </div>
        )}

        {/* Articles List Table */}
        {!isLoading && articles.length > 0 && (
          <div className="space-y-3">
            {articles.map((item) => {
              const badge = statusBadges[item.status] || {
                label: item.status,
                style: 'border-border',
              };
              const dateStr = new Date(item.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  className="p-5 border border-border bg-surface hover:border-foreground transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={cn('px-2 py-0.5 border font-mono text-[9px] uppercase tracking-wider', badge.style)}>
                        {badge.label}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                        [{item.category?.name || 'UMUM'}] &bull; Diperbarui {dateStr}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-normal text-foreground">
                      {item.title}
                    </h3>

                    <div className="font-mono text-[11px] uppercase tracking-wider text-muted flex items-center gap-3">
                      <span>{item.wordCount} Kata</span>
                      <span>&bull;</span>
                      <span>{item.readingTime} Menit Baca</span>
                      {item.status === ArticleStatus.PUBLISHED && (
                        <>
                          <span>&bull;</span>
                          <span className="text-foreground">{item.viewCount} Dibaca</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 font-mono text-xs">
                    {(item.status === ArticleStatus.DRAFT || item.status === ArticleStatus.REVISION) && (
                      <Link href={`/tulis/${item.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          Sunting
                        </Button>
                      </Link>
                    )}

                    {item.status === ArticleStatus.PENDING_REVIEW && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWithdraw(item.id)}
                        isLoading={actionLoadingId === item.id}
                      >
                        <Undo2 className="w-3.5 h-3.5 mr-1" />
                        Tarik Draf
                      </Button>
                    )}

                    {item.status === ArticleStatus.PUBLISHED && (
                      <Link href={`/artikel/${item.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          Lihat Terbit
                        </Button>
                      </Link>
                    )}

                    {item.status !== ArticleStatus.PUBLISHED && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        isLoading={actionLoadingId === item.id}
                        className="text-muted hover:text-foreground"
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

        {/* Empty State */}
        {!isLoading && articles.length === 0 && (
          <EmptyState
            title="Belum Ada Naskah Tulisan"
            description="Kamu belum memiliki naskah tulisan dalam kategori status ini. Mulai bagikan gagasan dan catatan literasimu."
            actionLabel="Tulis Naskah Pertama"
            onAction={() => router.push('/tulis')}
          />
        )}
    </div>
  );
}
