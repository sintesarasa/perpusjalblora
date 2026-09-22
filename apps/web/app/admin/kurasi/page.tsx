'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { ArticleStatus, RejectionReason } from '@perpusjal/types';
import { Check, X, RotateCcw, Star, Lock, Unlock, Eye, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminArticleItem {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  readingTime: number;
  wordCount: number;
  isFeatured: boolean;
  submittedAt: string | null;
  reviewLockedAt: string | null;
  author: { name: string; username: string };
  category: { name: string };
}

export default function CuratorDashboardPage() {
  const [articles, setArticles] = React.useState<AdminArticleItem[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>(ArticleStatus.PENDING_REVIEW);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedArticle, setSelectedArticle] = React.useState<AdminArticleItem | null>(null);
  const [modalMode, setModalMode] = React.useState<'approve' | 'revision' | 'reject' | null>(null);

  // Form states inside modal
  const [revisionNote, setRevisionNote] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState<RejectionReason>(RejectionReason.LOW_QUALITY);
  const [rejectionNote, setRejectionNote] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const loadQueue = React.useCallback(async () => {
    setIsLoading(true);
    const res = await apiClient<{ data: AdminArticleItem[] }>(
      `/articles/admin/queue?status=${statusFilter}`
    );
    if (res.data) {
      setArticles(res.data.data || []);
    }
    setIsLoading(false);
  }, [statusFilter]);

  React.useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleApprove = async (articleId: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    const res = await apiClient(`/articles/${articleId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ note: 'Disetujui untuk terbit langsung.' }),
    });

    if (res.error) {
      setErrorMsg(res.error.message || 'Gagal menyetujui naskah.');
    } else {
      setModalMode(null);
      setSelectedArticle(null);
      loadQueue();
    }
    setIsProcessing(false);
  };

  const handleRequestRevision = async (articleId: string) => {
    if (revisionNote.trim().length < 10) {
      setErrorMsg('Catatan revisi minimal 10 karakter.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    const res = await apiClient(`/articles/${articleId}/request-revision`, {
      method: 'POST',
      body: JSON.stringify({ note: revisionNote.trim() }),
    });

    if (res.error) {
      setErrorMsg(res.error.message || 'Gagal meminta revisi.');
    } else {
      setModalMode(null);
      setSelectedArticle(null);
      setRevisionNote('');
      loadQueue();
    }
    setIsProcessing(false);
  };

  const handleReject = async (articleId: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    const res = await apiClient(`/articles/${articleId}/reject`, {
      method: 'POST',
      body: JSON.stringify({
        reason: rejectionReason,
        note: rejectionNote.trim() || undefined,
      }),
    });

    if (res.error) {
      setErrorMsg(res.error.message || 'Gagal menolak naskah.');
    } else {
      setModalMode(null);
      setSelectedArticle(null);
      setRejectionNote('');
      loadQueue();
    }
    setIsProcessing(false);
  };

  const handleToggleFeatured = async (articleId: string, currentFeatured: boolean) => {
    const res = await apiClient(`/articles/${articleId}/feature`, {
      method: 'POST',
      body: JSON.stringify({ isFeatured: !currentFeatured }),
    });

    if (res.error) {
      alert(res.error.message);
    } else {
      loadQueue();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Masthead */}
        <div className="border-b-2 border-foreground pb-6 space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
            MEJA REDAKSI // KURASI LITERASI BLORA
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
            Antrean Kurasi Naskah
          </h1>
          <p className="font-sans text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
            Periksa keaslian gagasan, kualitas bahasa, dan integritas tulisan warga sebelum dipublikasikan ke publik.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] uppercase tracking-wider border-b border-border pb-2">
          {[
            { key: ArticleStatus.PENDING_REVIEW, label: 'Menunggu Kurasi' },
            { key: ArticleStatus.REVISION, label: 'Perlu Revisi' },
            { key: ArticleStatus.PUBLISHED, label: 'Sudah Terbit' },
            { key: ArticleStatus.REJECTED, label: 'Ditolak' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                'px-3.5 py-1.5 border transition-colors',
                statusFilter === tab.key
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
            <CustomLoader size="md" label="MEMBUKA MEJA REDAKSI..." />
          </div>
        )}

        {/* Queue Table */}
        {!isLoading && articles.length > 0 && (
          <div className="border border-border bg-surface overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-surface-muted/60 border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted select-none">
                <tr>
                  <th className="py-3 px-4">Judul Naskah</th>
                  <th className="py-3 px-4">Penulis</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Panjang</th>
                  <th className="py-3 px-4">Tanggal Masuk</th>
                  <th className="py-3 px-4 text-right">Tindakan Kurasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {articles.map((item) => {
                  const dateStr = item.submittedAt
                    ? new Date(item.submittedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-';

                  return (
                    <tr key={item.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/artikel/${item.slug}`}
                          target="_blank"
                          className="font-serif text-base font-normal text-foreground hover:underline decoration-1"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div>{item.author.name}</div>
                        <div className="text-muted text-[10px]">@{item.author.username}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] uppercase tracking-wider text-muted">
                        [{item.category.name}]
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-muted">
                        {item.wordCount} Kata ({item.readingTime} Menit)
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-muted">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[10px]">
                          {/* Preview article */}
                          <Link href={`/artikel/${item.slug}`} target="_blank">
                            <Button variant="ghost" size="sm" title="Baca Naskah">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>

                          {statusFilter === ArticleStatus.PENDING_REVIEW && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedArticle(item);
                                  setModalMode('approve');
                                }}
                                className="hover:bg-foreground hover:text-background"
                              >
                                Setujui
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedArticle(item);
                                  setModalMode('revision');
                                }}
                              >
                                Revisi
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedArticle(item);
                                  setModalMode('reject');
                                }}
                                className="text-muted hover:text-foreground"
                              >
                                Tolak
                              </Button>
                            </>
                          )}

                          {statusFilter === ArticleStatus.PUBLISHED && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                              className={cn(
                                'text-[9px]',
                                item.isFeatured ? 'bg-foreground text-background font-bold' : ''
                              )}
                            >
                              <Star className="w-3 h-3 mr-1" />
                              {item.isFeatured ? 'Tajuk Utama' : 'Jadikan Tajuk'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && articles.length === 0 && (
          <EmptyState
            title="Tidak Ada Naskah dalam Antrean"
            description="Semua naskah yang diajukan penulis telah selesai ditinjau oleh tim kurasi redaksi."
          />
        )}

        {/* Curation Modal Dialog */}
        {modalMode && selectedArticle && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="border-2 border-foreground bg-background p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  TINDAKAN KURASI REDAKSI
                </span>
                <h3 className="font-serif text-2xl font-normal text-foreground">
                  {selectedArticle.title}
                </h3>
                <p className="font-mono text-xs text-muted">Penulis: {selectedArticle.author.name}</p>
              </div>

              {errorMsg && (
                <div className="p-3 border border-foreground bg-surface text-xs font-mono text-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Approve Mode */}
              {modalMode === 'approve' && (
                <div className="space-y-4">
                  <p className="font-sans text-xs text-foreground/85 leading-relaxed">
                    Naskah akan langsung diterbitkan secara publik di katalog warta dan halaman utama Perpusjal Blora.
                  </p>
                  <div className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setModalMode(null)}>
                      Batal
                    </Button>
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={() => handleApprove(selectedArticle.id)}
                      isLoading={isProcessing}
                    >
                      Konfirmasi Terbitkan Naskah
                    </Button>
                  </div>
                </div>
              )}

              {/* Revision Mode */}
              {modalMode === 'revision' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                      Catatan Perbaikan untuk Penulis (Wajib)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Jelaskan bagian naskah yang perlu disempurnakan atau diperbaiki..."
                      value={revisionNote}
                      onChange={(e) => setRevisionNote(e.target.value)}
                      className="w-full p-3 bg-surface border border-border text-xs font-sans focus:outline-none focus:border-foreground rounded-none"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setModalMode(null)}>
                      Batal
                    </Button>
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={() => handleRequestRevision(selectedArticle.id)}
                      isLoading={isProcessing}
                    >
                      Kirim Catatan Revisi
                    </Button>
                  </div>
                </div>
              )}

              {/* Reject Mode */}
              {modalMode === 'reject' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                      Alasan Penolakan Naskah
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value as RejectionReason)}
                      className="w-full h-10 px-3 bg-surface border border-border text-xs font-sans focus:outline-none focus:border-foreground rounded-none cursor-pointer"
                    >
                      <option value={RejectionReason.PLAGIARISM}>Plagiarisme / Bukan Karya Sendiri</option>
                      <option value={RejectionReason.HATE_SPEECH}>Ujaran Kebencian / Diskriminasi</option>
                      <option value={RejectionReason.LOW_QUALITY}>Kualitas Bahasa & Penulisan Belum Memenuhi Standar</option>
                      <option value={RejectionReason.OFF_TOPIC}>Di Luar Fokus Literasi & Komunitas</option>
                      <option value={RejectionReason.PROMOTIONAL}>Konten Promosi / Iklan Komersial</option>
                      <option value={RejectionReason.OTHER}>Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                      Catatan Penjelasan (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tambahan keterangan alasan penolakan..."
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      className="w-full p-3 bg-surface border border-border text-xs font-sans focus:outline-none focus:border-foreground rounded-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setModalMode(null)}>
                      Batal
                    </Button>
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={() => handleReject(selectedArticle.id)}
                      isLoading={isProcessing}
                    >
                      Tolak Naskah
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
