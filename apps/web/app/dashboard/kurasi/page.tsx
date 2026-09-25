'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { ArticleStatus, RejectionReason, Role, ArticleDetail } from '@perpusjal/types';
import {
  Check,
  X,
  RotateCcw,
  Star,
  Eye,
  AlertCircle,
  Shield,
  ShieldAlert,
  Calendar,
  Clock,
  Feather,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  MessageSquarePlus,
  Trash2,
  Edit2,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
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

interface BlockNote {
  quote: string;
  note: string;
}

export default function DashboardCuratorPage() {
  const [currentUser, setCurrentUser] = React.useState<{ id: string; role: Role; name: string } | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  const [articles, setArticles] = React.useState<AdminArticleItem[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>(ArticleStatus.PENDING_REVIEW);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedArticle, setSelectedArticle] = React.useState<AdminArticleItem | null>(null);
  const [modalMode, setModalMode] = React.useState<'approve' | 'revision' | 'reject' | null>(null);

  // Quick Inline Preview Drawer/Modal State
  const [previewSlug, setPreviewSlug] = React.useState<string | null>(null);
  const [previewArticle, setPreviewArticle] = React.useState<ArticleDetail | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  // Inline Editorial Annotations state (catatan per indeks blok paragraf)
  const [blockNotes, setBlockNotes] = React.useState<Record<number, BlockNote>>({});
  const [activeEditingIndex, setActiveEditingIndex] = React.useState<number | null>(null);
  const [draftNoteText, setDraftNoteText] = React.useState('');

  // Form states inside modal
  const [revisionNote, setRevisionNote] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState<RejectionReason>(RejectionReason.LOW_QUALITY);
  const [rejectionNote, setRejectionNote] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Role verification
  React.useEffect(() => {
    async function checkRole() {
      try {
        const res = await apiClient<any>('/auth/me');
        const user = res.data?.user || (res.data?.id ? res.data : null);
        if (user) {
          setCurrentUser(user);
        }
      } catch {
        // Failed
      } finally {
        setAuthLoading(false);
      }
    }
    checkRole();
  }, []);

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
    if (currentUser && (currentUser.role === Role.KURATOR || currentUser.role === Role.ADMIN)) {
      loadQueue();
    }
  }, [currentUser, loadQueue]);

  // Load article preview
  const handleOpenPreview = async (item: AdminArticleItem) => {
    setPreviewSlug(item.slug);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewArticle(null);
    setBlockNotes({});
    setActiveEditingIndex(null);
    setDraftNoteText('');

    const res = await apiClient<ArticleDetail>(`/articles/${item.slug}`);
    setPreviewLoading(false);

    if (res.error) {
      setPreviewError(res.error.message || 'Gagal memuat pratinjau naskah.');
    } else if (res.data) {
      setPreviewArticle(res.data);
    }
  };

  const handleClosePreview = () => {
    setPreviewSlug(null);
    setPreviewArticle(null);
    setPreviewError(null);
    setBlockNotes({});
    setActiveEditingIndex(null);
    setDraftNoteText('');
  };

  // Inline annotation handlers
  const handleStartAnnotation = (index: number, quote: string) => {
    setActiveEditingIndex(index);
    setDraftNoteText(blockNotes[index]?.note || '');
  };

  const handleSaveAnnotation = (index: number, quote: string) => {
    const trimmed = draftNoteText.trim();
    if (!trimmed) {
      handleDeleteAnnotation(index);
      return;
    }
    setBlockNotes((prev) => ({
      ...prev,
      [index]: {
        quote: quote.length > 80 ? quote.slice(0, 80) + '...' : quote,
        note: trimmed,
      },
    }));
    setActiveEditingIndex(null);
    setDraftNoteText('');
  };

  const handleDeleteAnnotation = (index: number) => {
    setBlockNotes((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    if (activeEditingIndex === index) {
      setActiveEditingIndex(null);
      setDraftNoteText('');
    }
  };

  // Compile block notes into revision form
  const handlePrepareRevisionModal = (articleItem: AdminArticleItem) => {
    setSelectedArticle(articleItem);
    const noteKeys = Object.keys(blockNotes).map(Number).sort((a, b) => a - b);
    if (noteKeys.length > 0) {
      const compiled = noteKeys
        .map((idx, n) => {
          const item = blockNotes[idx];
          return `${n + 1}. [Bagian #${idx + 1}]: "${item.quote}"\n   Catatan Redaksi: ${item.note}`;
        })
        .join('\n\n');

      setRevisionNote(`Catatan Kurasi Naskah:\n\n${compiled}\n\nCatatan Tambahan:\nMohon periksa dan perbaiki poin-poin di atas agar naskah siap diterbitkan.`);
    } else {
      setRevisionNote('');
    }
    setModalMode('revision');
  };

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
      if (previewSlug) {
        handleClosePreview();
      }
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
      if (previewSlug) {
        handleClosePreview();
      }
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
      if (previewSlug) {
        handleClosePreview();
      }
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

  // Helper to extract paragraphs/blocks from TipTap or plain text
  const extractBlocks = (content: unknown, plainText?: string | null): Array<{ id: number; text: string; type: string }> => {
    if (content && typeof content === 'object') {
      const doc = content as any;
      if (doc.content && Array.isArray(doc.content)) {
        return doc.content.map((node: any, idx: number) => {
          let text = '';
          if (node.text) {
            text = node.text;
          } else if (node.content && Array.isArray(node.content)) {
            text = node.content.map((c: any) => c.text || '').join('');
          }
          return {
            id: idx,
            text: text || `[Blok ${node.type || 'Konten'}]`,
            type: node.type || 'paragraph',
          };
        });
      }
    }

    if (typeof content === 'string') {
      return content.split('\n\n').filter(Boolean).map((p, idx) => ({
        id: idx,
        text: p,
        type: 'paragraph',
      }));
    }

    if (plainText) {
      return plainText.split('\n\n').filter(Boolean).map((p, idx) => ({
        id: idx,
        text: p,
        type: 'paragraph',
      }));
    }

    return [];
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="p-16 flex items-center justify-center font-mono text-xs">
        <CustomLoader size="md" label="MEMVERIFIKASI OTORITAS KURATOR..." />
      </div>
    );
  }

  // Restrict to KURATOR and ADMIN
  if (!currentUser || (currentUser.role !== Role.KURATOR && currentUser.role !== Role.ADMIN)) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-4 font-mono text-xs">
        <div className="p-6 border-2 border-destructive bg-surface text-destructive space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Akses Khusus Meja Redaksi & Kurator</span>
          </div>
          <p className="font-sans text-xs text-foreground">
            Halaman Meja Kurasi Naskah hanya dapat diakses oleh akun dengan peran <strong>KURATOR</strong> atau <strong>ADMIN</strong> untuk meninjau integritas dan kualitas karya tulis warga Blora.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 transition-colors"
            >
              Kembali ke Dasbor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const annotationCount = Object.keys(blockNotes).length;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Masthead Header */}
      <div className="border-b-2 border-foreground pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-widest">
            <span>Meja Redaksi</span>
            <span>// KURASI LITERASI WARGA BLORA</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Meja Kurasi Naskah
          </h1>
          <p className="font-sans text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
            Periksa keaslian gagasan, kualitas bahasa, dan integritas tulisan warga sebelum dipublikasikan ke katalog umum Perpusjal Blora.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => loadQueue()}
            disabled={isLoading}
            className="px-3 py-1.5 border border-border-hairline bg-surface hover:border-foreground transition-colors inline-flex items-center gap-1.5"
            title="Segarkan Antrean"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            <span>Segarkan</span>
          </button>
          <Link
            href="/dashboard/tulisan"
            className="px-3 py-1.5 border border-border-hairline bg-surface hover:border-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Karya Saya</span>
          </Link>
          <span className="px-2.5 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            REDAKSI AKTIF
          </span>
        </div>
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
          <CustomLoader size="md" label="MEMBUKA BERKAS REDAKSI..." />
        </div>
      )}

      {/* Queue Table */}
      {!isLoading && articles.length > 0 && (
        <div className="border border-border bg-surface overflow-x-auto shadow-sm">
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
                      <button
                        onClick={() => handleOpenPreview(item)}
                        className="font-serif text-base font-normal text-foreground hover:underline decoration-1 text-left block"
                      >
                        {item.title}
                      </button>
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
                        {/* Quick preview button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenPreview(item)}
                          title="Tinjau Naskah di Dasbor"
                          className="hover:bg-foreground hover:text-background"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>Tinjau</span>
                        </Button>

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
                              title="Setujui dan Terbitkan Langsung"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                              <span>Setujui</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrepareRevisionModal(item)}
                              className="hover:bg-foreground hover:text-background"
                              title="Minta Revisi kepada Penulis"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-amber-600 mr-1" />
                              <span>Revisi</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedArticle(item);
                                setModalMode('reject');
                              }}
                              className="border-border text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                              title="Tolak Naskah"
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              <span>Tolak</span>
                            </Button>
                          </>
                        )}

                        {statusFilter === ArticleStatus.PUBLISHED && (
                          <button
                            onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                            title={item.isFeatured ? 'Hapus dari Pilihan Redaksi' : 'Jadikan Pilihan Redaksi (Featured)'}
                            className={cn(
                              'p-1.5 border transition-colors inline-flex items-center gap-1',
                              item.isFeatured
                                ? 'bg-amber-400 text-black border-amber-500 font-bold'
                                : 'bg-transparent text-muted border-border hover:border-foreground'
                            )}
                          >
                            <Star className={cn('w-3.5 h-3.5', item.isFeatured && 'fill-current')} />
                            <span>{item.isFeatured ? 'Unggulan' : 'Jadikan Unggulan'}</span>
                          </button>
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
      {!isLoading && articles.length > 0 === false && (
        <EmptyState
          title="Tidak Ada Naskah dalam Antrean Ini"
          description="Semua naskah dalam tab ini telah selesai diproses oleh meja redaksi."
        />
      )}

      {/* QUICK INLINE PREVIEW MODAL / DRAWER WITH INLINE ANNOTATIONS */}
      {previewSlug && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="border-2 border-foreground bg-background w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl animate-in fade-in-50 duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-border-hairline bg-surface-muted/40 flex items-center justify-between gap-4 shrink-0">
              <div className="space-y-0.5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted flex items-center gap-2">
                  <span>PRATINJAU NASKAH MEJA REDAKSI</span>
                  {previewArticle && (
                    <span className="px-1.5 py-0.2 bg-surface border border-border-hairline font-bold">
                      {previewArticle.category.name}
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground line-clamp-1">
                  {previewArticle ? previewArticle.title : 'Memuat Naskah...'}
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                {previewArticle && (
                  <Link
                    href={`/artikel/${previewArticle.slug}${previewArticle.previewToken ? `?preview=${previewArticle.previewToken}` : ''}`}
                    target="_blank"
                    className="p-2 border border-border-hairline bg-surface hover:border-foreground transition-colors font-mono text-[10px] text-muted hover:text-foreground inline-flex items-center gap-1.5"
                    title="Buka Pratinjau Publik di Tab Baru"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Pratinjau Tab Baru</span>
                  </Link>
                )}
                <button
                  onClick={handleClosePreview}
                  className="p-2 border border-border-hairline bg-surface hover:border-foreground transition-colors text-muted hover:text-foreground"
                  title="Tutup Pratinjau"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-background">
              {previewLoading && (
                <div className="py-20 flex items-center justify-center">
                  <CustomLoader size="md" label="MEMBACA LEMBARAN NASKAH..." />
                </div>
              )}

              {previewError && (
                <div className="p-6 border border-destructive bg-surface text-destructive font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Gagal Menampilkan Naskah</span>
                  </div>
                  <p>{previewError}</p>
                </div>
              )}

              {previewArticle && (
                <article className="max-w-2xl mx-auto space-y-8">
                  {/* Article Metadata Bar */}
                  <div className="border-b border-border-hairline pb-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-muted">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{previewArticle.author.name}</span>
                      <span>(@{previewArticle.author.username})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {previewArticle.readingTime} Menit Baca
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {previewArticle.publishedAt
                          ? new Date(previewArticle.publishedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'Belum Terbit (Draf Redaksi)'}
                      </span>
                    </div>
                  </div>

                  {/* Editorial Instruction Ticker */}
                  {previewArticle.status === ArticleStatus.PENDING_REVIEW && (
                    <div className="p-3 bg-surface-muted/60 border border-border-hairline flex items-center justify-between gap-2 font-mono text-[11px] text-muted">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Arahkan kursor ke tiap paragraf untuk memberi <strong>Catatan Blok Redaksi</strong>.</span>
                      </div>
                      {annotationCount > 0 && (
                        <span className="px-2 py-0.5 bg-foreground text-background font-bold text-[10px] shrink-0">
                          {annotationCount} Catatan Aktif
                        </span>
                      )}
                    </div>
                  )}

                  {/* Cover Image if present */}
                  {previewArticle.coverImage && (
                    <div className="border border-border-hairline overflow-hidden bg-surface-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewArticle.coverImage}
                        alt={previewArticle.title}
                        className="w-full max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Excerpt */}
                  {previewArticle.excerpt && (
                    <div className="p-4 border-l-2 border-foreground bg-surface-muted/40 font-serif italic text-base text-foreground/80 leading-relaxed">
                      {previewArticle.excerpt}
                    </div>
                  )}

                  {/* Interactive Article Blocks with Inline Annotations */}
                  <div className="space-y-6 pt-2">
                    {extractBlocks(previewArticle.content, previewArticle.plainText).map((block) => {
                      const hasNote = !!blockNotes[block.id];
                      const isEditing = activeEditingIndex === block.id;
                      const isFirst = block.id === 0;

                      return (
                        <div
                          key={block.id}
                          className={cn(
                            'group relative transition-all duration-150 rounded-none',
                            hasNote
                              ? 'border-l-4 border-amber-500 bg-amber-500/[0.04] pl-4 py-2'
                              : 'hover:bg-surface-muted/30 pl-2 -ml-2 py-1'
                          )}
                        >
                          {/* Block Text */}
                          {block.type === 'heading' ? (
                            <h3 className="font-serif text-2xl font-bold text-foreground mt-4 mb-2">
                              {block.text}
                            </h3>
                          ) : (
                            <p
                              className={cn(
                                'font-serif text-lg leading-[1.8] text-foreground/90 font-normal',
                                isFirst && 'first-letter:float-left first-letter:text-5xl first-letter:font-serif first-letter:pr-3 first-letter:pt-1 first-letter:font-bold'
                              )}
                            >
                              {block.text}
                            </p>
                          )}

                          {/* Hover Action to Add Annotation */}
                          {previewArticle.status === ArticleStatus.PENDING_REVIEW && !isEditing && !hasNote && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 flex items-center justify-end">
                              <button
                                onClick={() => handleStartAnnotation(block.id, block.text)}
                                className="px-2 py-1 bg-surface border border-border-hairline hover:border-foreground text-muted hover:text-foreground font-mono text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
                              >
                                <MessageSquarePlus className="w-3 h-3 text-amber-500" />
                                <span>+ Catatan Blok</span>
                              </button>
                            </div>
                          )}

                          {/* Existing Annotation Card */}
                          {hasNote && !isEditing && (
                            <div className="mt-3 p-3 border border-amber-500/40 bg-surface shadow-sm font-sans space-y-2">
                              <div className="flex items-center justify-between gap-2 border-b border-border-hairline pb-1.5">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-600 font-bold flex items-center gap-1.5">
                                  <CornerDownRight className="w-3 h-3" />
                                  Catatan Redaksi (Blok #{block.id + 1})
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleStartAnnotation(block.id, block.text)}
                                    className="p-1 text-muted hover:text-foreground hover:bg-surface-muted"
                                    title="Sunting catatan"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAnnotation(block.id)}
                                    className="p-1 text-muted hover:text-destructive hover:bg-surface-muted"
                                    title="Hapus catatan"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-foreground/90 font-mono leading-relaxed">
                                {blockNotes[block.id].note}
                              </p>
                            </div>
                          )}

                          {/* Inline Editing Form */}
                          {isEditing && (
                            <div className="mt-3 p-3.5 border-2 border-foreground bg-surface shadow-md space-y-3">
                              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
                                <span className="font-bold text-foreground">
                                  Catatan Redaksi untuk Paragraf #{block.id + 1}
                                </span>
                                <span>Tekan Simpan setelah selesai</span>
                              </div>
                              <textarea
                                autoFocus
                                rows={3}
                                value={draftNoteText}
                                onChange={(e) => setDraftNoteText(e.target.value)}
                                placeholder="Tulis instruksi revisi spesifik untuk paragraf ini (misal: perlu tambahan rujukan, perjelas logika kalimat, dll)..."
                                className="w-full p-2.5 bg-background border border-border text-xs font-sans focus:outline-none focus:border-foreground rounded-none"
                              />
                              <div className="flex items-center justify-end gap-2 font-mono text-xs">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setActiveEditingIndex(null)}
                                >
                                  Batal
                                </Button>
                                <Button
                                  variant="solid"
                                  size="sm"
                                  onClick={() => handleSaveAnnotation(block.id, block.text)}
                                >
                                  Simpan Catatan Blok
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Tags */}
                  {previewArticle.tags && previewArticle.tags.length > 0 && (
                    <div className="pt-6 border-t border-border-hairline flex flex-wrap gap-1.5 font-mono text-[10px]">
                      <span className="text-muted mr-1">TOPIK:</span>
                      {previewArticle.tags.map((t) => (
                        <span key={t.id} className="px-2 py-0.5 border border-border-hairline bg-surface">
                          #{t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              )}
            </div>

            {/* Drawer Footer (Sticky Actions) */}
            {previewArticle && (
              <div className="p-4 sm:p-5 border-t border-border-hairline bg-surface-muted/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="font-mono text-xs text-muted flex items-center gap-3">
                  <span>Status: <strong className="text-foreground uppercase">{previewArticle.status}</strong></span>
                  {annotationCount > 0 && (
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500 text-amber-700 dark:text-amber-400 font-bold inline-flex items-center gap-1 text-[10px]">
                      <MessageSquare className="w-3 h-3" />
                      {annotationCount} Catatan Blok Siap Dikirim
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <Button variant="outline" size="sm" onClick={handleClosePreview}>
                    Tutup
                  </Button>

                  {previewArticle.status === ArticleStatus.PENDING_REVIEW && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const matched = articles.find((a) => a.id === previewArticle.id) || {
                            id: previewArticle.id,
                            title: previewArticle.title,
                            slug: previewArticle.slug,
                            status: previewArticle.status as ArticleStatus,
                            readingTime: previewArticle.readingTime,
                            wordCount: 0,
                            isFeatured: false,
                            submittedAt: null,
                            reviewLockedAt: null,
                            author: { name: previewArticle.author.name, username: previewArticle.author.username },
                            category: { name: previewArticle.category.name },
                          };
                          setSelectedArticle(matched);
                          setModalMode('reject');
                        }}
                        className="border-border text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Tolak
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const matched = articles.find((a) => a.id === previewArticle.id) || {
                            id: previewArticle.id,
                            title: previewArticle.title,
                            slug: previewArticle.slug,
                            status: previewArticle.status as ArticleStatus,
                            readingTime: previewArticle.readingTime,
                            wordCount: 0,
                            isFeatured: false,
                            submittedAt: null,
                            reviewLockedAt: null,
                            author: { name: previewArticle.author.name, username: previewArticle.author.username },
                            category: { name: previewArticle.category.name },
                          };
                          handlePrepareRevisionModal(matched);
                        }}
                        className="hover:bg-foreground hover:text-background"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1 text-amber-600" />
                        <span>Minta Revisi {annotationCount > 0 ? `(${annotationCount} Catatan)` : ''}</span>
                      </Button>

                      <Button
                        variant="solid"
                        size="sm"
                        onClick={() => {
                          const matched = articles.find((a) => a.id === previewArticle.id) || {
                            id: previewArticle.id,
                            title: previewArticle.title,
                            slug: previewArticle.slug,
                            status: previewArticle.status as ArticleStatus,
                            readingTime: previewArticle.readingTime,
                            wordCount: 0,
                            isFeatured: false,
                            submittedAt: null,
                            reviewLockedAt: null,
                            author: { name: previewArticle.author.name, username: previewArticle.author.username },
                            category: { name: previewArticle.category.name },
                          };
                          setSelectedArticle(matched);
                          setModalMode('approve');
                        }}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Setujui & Publikasikan
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CURATION DECISION MODAL DIALOG */}
      {modalMode && selectedArticle && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border-2 border-foreground bg-background p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl">
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
                  Naskah akan langsung diterbitkan secara publik di katalog warta dan halaman utama Perpusjal Blora. Penulis akan menerima pemberitahuan otomatis.
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
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                      Catatan Perbaikan untuk Penulis (Wajib)
                    </label>
                    {annotationCount > 0 && (
                      <span className="font-mono text-[10px] text-amber-600 font-bold">
                        {annotationCount} Catatan Blok Terangkum Otomatis
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={8}
                    placeholder="Jelaskan bagian naskah yang perlu disempurnakan atau diperbaiki..."
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    className="w-full p-3 bg-surface border border-border text-xs font-mono leading-relaxed focus:outline-none focus:border-foreground rounded-none"
                  />
                  <p className="font-mono text-[10px] text-muted">
                    Catatan ini akan dikirimkan langsung ke lonceng notifikasi dan dasbor penulis agar dapat diperbaiki dengan jelas.
                  </p>
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
                    Catatan Penjelasan Tambahan (Opsional)
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
                    className="bg-destructive border-destructive text-white hover:bg-destructive/90"
                  >
                    Konfirmasi Tolak Naskah
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
