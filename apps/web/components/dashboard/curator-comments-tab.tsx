'use client';

import * as React from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { CommentStatus, ReportReason, Role, TrustLevel } from '@perpusjal/types';
import { CustomLoader } from '@/components/ui/custom-loader';
import { EmptyState } from '@/components/ui/empty-state';
import {
  MessageSquare,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Check,
  EyeOff,
  Trash2,
  RefreshCw,
  ExternalLink,
  Clock,
  Flag,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminCommentItem {
  id: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  reportCount: number;
  author: {
    id: string;
    name: string;
    username: string;
    role: Role;
    trustLevel: TrustLevel;
  };
  article?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  reports?: Array<{
    id: string;
    reason: ReportReason;
    note?: string | null;
    createdAt: string;
  }>;
}

export function CuratorCommentsTab() {
  const [statusFilter, setStatusFilter] = React.useState<CommentStatus>(CommentStatus.PENDING);
  const [comments, setComments] = React.useState<AdminCommentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Action state
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Confirm delete state
  const [deleteTarget, setDeleteTarget] = React.useState<AdminCommentItem | null>(null);

  const fetchComments = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiClient<{ data: AdminCommentItem[]; meta: any }>(
      `/comments/admin/queue?status=${statusFilter}`
    );
    setLoading(false);

    if (res.error) {
      setError(res.error.message || 'Gagal memuat antrean moderasi komentar.');
      return;
    }

    if (res.data) {
      setComments(res.data.data || []);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleModerate = async (id: string, action: 'approve' | 'hide' | 'delete') => {
    setActionLoadingId(id);

    const res = await apiClient<{ message: string }>(`/comments/admin/${id}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });

    setActionLoadingId(null);

    if (res.error) {
      setFeedback({ type: 'error', message: res.error.message || 'Gagal memproses tindakan komentar.' });
      return;
    }

    const actionText =
      action === 'approve'
        ? 'Komentar berhasil disetujui dan dipublikasikan.'
        : action === 'hide'
        ? 'Komentar berhasil disembunyikan dari ruang publik.'
        : 'Komentar berhasil dihapus permanen.';

    setFeedback({ type: 'success', message: actionText });
    setDeleteTarget(null);
    fetchComments();

    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Subheader info & filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border-hairline bg-surface-muted/30">
        <div className="space-y-1">
          <span className="font-mono text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Antrean Moderasi Komentar &amp; Laporan Warga
          </span>
          <p className="font-sans text-xs text-muted max-w-2xl leading-relaxed">
            Jaga dialektika ruang bersama. Komentar dari akun baru (TL0) memerlukan verifikasi kurator sebelum tayang, sementara komentar yang dilaporkan berulang (&ge; 3 kali) disembunyikan otomatis untuk ditinjau.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <button
            onClick={fetchComments}
            disabled={loading}
            className="px-3 py-1.5 border border-border hover:border-foreground bg-surface transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] uppercase tracking-wider border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setStatusFilter(CommentStatus.PENDING)}
          className={cn(
            'px-3.5 py-1.5 border transition-colors flex items-center gap-1.5',
            statusFilter === CommentStatus.PENDING
              ? 'bg-foreground text-background border-foreground font-bold'
              : 'bg-transparent text-muted border-border hover:border-foreground'
          )}
        >
          <Clock className="w-3 h-3" />
          <span>Menunggu Kurasi (TL0)</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(CommentStatus.HIDDEN)}
          className={cn(
            'px-3.5 py-1.5 border transition-colors flex items-center gap-1.5',
            statusFilter === CommentStatus.HIDDEN
              ? 'bg-foreground text-background border-foreground font-bold'
              : 'bg-transparent text-muted border-border hover:border-foreground'
          )}
        >
          <Flag className="w-3 h-3" />
          <span>Disembunyikan / Dilaporkan</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={cn(
            'p-3 border font-mono text-xs flex items-center gap-2',
            feedback.type === 'success'
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
              : 'border-destructive bg-destructive/10 text-destructive'
          )}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-16 flex items-center justify-center">
          <CustomLoader size="md" label="MEMERIKSA ANTREAN MODERASI..." />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 border border-destructive bg-surface text-center space-y-2 font-mono text-xs">
          <p className="text-destructive font-bold">{error}</p>
          <button
            onClick={fetchComments}
            className="px-3 py-1 bg-foreground text-background uppercase tracking-wider font-bold"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && comments.length === 0 && (
        <EmptyState
          title={
            statusFilter === CommentStatus.PENDING
              ? 'Tidak Ada Komentar Menunggu Kurasi'
              : 'Tidak Ada Komentar yang Disembunyikan'
          }
          description={
            statusFilter === CommentStatus.PENDING
              ? 'Semua komentar akun warga telah disetujui atau dipublikasikan.'
              : 'Ruang diskusi bersih dari laporan pelanggaran etika atau spam.'
          }
        />
      )}

      {/* Comment Cards List */}
      {!loading && !error && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isProcessing = actionLoadingId === comment.id;
            const dateStr = new Date(comment.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={comment.id}
                className={cn(
                  'p-4 sm:p-5 border bg-surface space-y-3 font-sans transition-colors',
                  comment.reportCount > 0 ? 'border-destructive/60' : 'border-border'
                )}
              >
                {/* Header: Author & Context */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-hairline pb-2.5 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-6 h-6 border border-foreground/30 flex items-center justify-center font-mono text-[10px] font-bold bg-surface-muted uppercase shrink-0">
                      {comment.author.name.charAt(0)}
                    </div>
                    <span className="font-serif font-bold text-foreground">{comment.author.name}</span>
                    <span className="font-mono text-[11px] text-muted">@{comment.author.username}</span>

                    {/* Badge Role or TrustLevel */}
                    <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.2 border border-border-hairline text-muted font-bold">
                      {comment.author.trustLevel}
                    </span>

                    {comment.status === CommentStatus.PENDING && (
                      <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-500 text-black font-bold flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        KURASI TL0
                      </span>
                    )}

                    {comment.reportCount > 0 && (
                      <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-destructive text-white font-bold flex items-center gap-1">
                        <Flag className="w-2.5 h-2.5" />
                        {comment.reportCount} LAPORAN WARGA
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-[10px] text-muted shrink-0">
                    {dateStr}
                  </div>
                </div>

                {/* Article Context */}
                {comment.article && (
                  <div className="font-mono text-[11px] text-muted flex items-center gap-1.5">
                    <span>Pada Naskah:</span>
                    <Link
                      href={`/artikel/${comment.article.slug}`}
                      target="_blank"
                      className="font-serif text-foreground underline underline-offset-2 hover:text-muted inline-flex items-center gap-1"
                    >
                      <span>{comment.article.title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Comment Content */}
                <div className="p-3 bg-surface-muted/40 border border-border-hairline text-sm leading-relaxed text-foreground/90 font-sans">
                  {comment.content}
                </div>

                {/* Citizen Reports Breakdown (if any) */}
                {comment.reports && comment.reports.length > 0 && (
                  <div className="p-3 bg-destructive/5 border border-destructive/30 space-y-1.5 font-mono text-xs">
                    <span className="font-bold text-destructive flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <AlertTriangle className="w-3 h-3" />
                      Rincian Aduan Warga:
                    </span>
                    <ul className="divide-y divide-destructive/10 text-[11px] text-foreground">
                      {comment.reports.map((rep, rIdx) => (
                        <li key={rIdx} className="py-1">
                          <span className="font-bold text-destructive">[{rep.reason}]</span>{' '}
                          {rep.note ? <span className="italic">&ldquo;{rep.note}&rdquo;</span> : <span className="text-muted">(Tanpa catatan)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1 font-mono text-xs">
                  {comment.status === CommentStatus.PENDING && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleModerate(comment.id, 'approve')}
                      className="h-8 px-3 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-40 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Setujui (Publikasikan)</span>
                    </button>
                  )}

                  {comment.status === CommentStatus.HIDDEN && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleModerate(comment.id, 'approve')}
                      className="h-8 px-3 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-40 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Pulihkan (Setujui)</span>
                    </button>
                  )}

                  {comment.status !== CommentStatus.HIDDEN && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleModerate(comment.id, 'hide')}
                      className="h-8 px-3 border border-border hover:border-foreground text-muted hover:text-foreground uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Sembunyikan</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setDeleteTarget(comment)}
                    className="h-8 px-3 border border-border text-destructive hover:bg-destructive hover:text-white hover:border-destructive uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Permanen</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-background border-2 border-destructive p-6 space-y-4 font-sans animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase tracking-widest text-destructive font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  HAPUS KOMENTAR PERMANEN
                </span>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Konfirmasi Hapus Komentar?
                </h3>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-sans text-xs text-muted leading-relaxed">
              Komentar dari <strong>{deleteTarget.author.name}</strong> akan dihapus secara permanen dari basis data dan jumlah komentar naskah akan disesuaikan.
            </p>

            <div className="p-3 bg-surface-muted border border-border-hairline text-xs font-sans text-foreground/80 italic">
              &ldquo;{deleteTarget.content}&rdquo;
            </div>

            <div className="flex justify-end gap-2 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-border text-muted hover:text-foreground uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleModerate(deleteTarget.id, 'delete')}
                className="px-5 py-2 bg-destructive text-white uppercase tracking-widest font-bold hover:bg-destructive/90"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
