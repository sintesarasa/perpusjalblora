'use client';

import * as React from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { CommentItem, CommentStatus, ReportReason } from '@perpusjal/types';
import { CommentForm } from './comment-form';
import { UserHonorBadge } from '@/components/gamification/user-honor-badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';
import {
  CornerDownRight,
  Edit2,
  Trash2,
  Flag,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Check,
  X,
  PenTool,
} from 'lucide-react';

interface CommentItemProps {
  comment: CommentItem;
  articleId?: string;
  letterId?: string;
  authorId?: string;
  isReply?: boolean;
  onCommentUpdated: (id: string, newContent: string) => void;
  onCommentDeleted: (id: string) => void;
  onReplyCreated: (parentId: string, reply: CommentItem) => void;
}

export function CommentItemComponent({
  comment,
  articleId,
  letterId,
  authorId,
  isReply = false,
  onCommentUpdated,
  onCommentDeleted,
  onReplyCreated,
}: CommentItemProps) {
  const [showAllReplies, setShowAllReplies] = React.useState(false);
  const [isReplying, setIsReplying] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.content);
  const [isReporting, setIsReporting] = React.useState(false);
  const [reportReason, setReportReason] = React.useState<ReportReason>(ReportReason.SPAM);
  const [reportNote, setReportNote] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);

  const isDeletedByUser = comment.status === CommentStatus.DELETED_BY_USER;
  const isArticleAuthor = Boolean(authorId && comment.author.id === authorId);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() || actionLoading) return;

    setActionLoading(true);
    setActionError(null);

    const res = await apiClient<{ data: { content: string } }>(`/comments/${comment.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content: editContent.trim() }),
    });

    setActionLoading(false);

    if (res.error) {
      setActionError(res.error.message);
      return;
    }

    onCommentUpdated(comment.id, editContent.trim());
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return;

    setActionLoading(true);
    setActionError(null);

    const res = await apiClient(`/comments/${comment.id}`, {
      method: 'DELETE',
    });

    setActionLoading(false);

    if (res.error) {
      setActionError(res.error.message);
      return;
    }

    onCommentDeleted(comment.id);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);

    const res = await apiClient<{ message: string }>(`/comments/${comment.id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason: reportReason, note: reportNote.trim() || undefined }),
    });

    setActionLoading(false);

    if (res.error) {
      setActionError(res.error.message);
      return;
    }

    setActionSuccess('Laporan Anda telah dikirim.');
    setTimeout(() => {
      setIsReporting(false);
      setActionSuccess(null);
    }, 2000);
  };

  // Format date & relative time
  const formattedDate = new Date(comment.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const relativeTime = React.useMemo(() => {
    const now = new Date();
    const date = new Date(comment.createdAt);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} hr lalu`;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [comment.createdAt]);

  return (
    <article
      className={cn(
        'font-sans transition-colors',
        isReply ? 'py-3' : 'py-6',
        comment.pendingModeration && 'bg-surface-muted/60 p-4 border border-dashed border-foreground/40'
      )}
    >
      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* Kolom Kiri: Avatar selalu locked di kiri atas, tidak akan pernah wrap */}
        <UserAvatar
          src={comment.author.avatarUrl}
          name={comment.author.name}
          username={comment.author.username}
          size={isReply ? 'xs' : 'sm'}
          shape="circle"
          linkToProfile
          className="shrink-0 mt-0.5"
        />

        {/* Kolom Kanan: Identitas, konten, dan aksi */}
        <div className="flex-1 min-w-0">
          {/* Header Identitas & Waktu Terbit */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/warga/${comment.author.username}`}
              className="font-serif font-bold text-sm sm:text-base text-foreground hover:underline tracking-tight"
            >
              {comment.author.name}
            </Link>

            <span className="font-mono text-[11px] text-muted">
              @{comment.author.username}
            </span>

            {/* Penulis Naskah Highlight Badge */}
            {isArticleAuthor && (
              <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-foreground text-background font-bold inline-flex items-center gap-1 select-none">
                <PenTool className="w-2.5 h-2.5" />
                PENULIS NASKAH
              </span>
            )}

            {/* User Honor Title & Badges */}
            <UserHonorBadge
              equippedTitle={comment.author.equippedTitle}
              equippedBadge={comment.author.equippedBadge}
              earnedBadgesCount={comment.author.earnedBadgesCount}
              badges={comment.author.badges}
              username={comment.author.username}
              size="sm"
            />

            {/* Role / Trust Level Badge */}
            {comment.author.role === 'KURATOR' || comment.author.role === 'ADMIN' ? (
              <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-foreground text-background font-bold inline-flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                {comment.author.role}
              </span>
            ) : null}

            {comment.pendingModeration && (
              <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border border-foreground bg-surface text-foreground font-bold inline-flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                MENUNGGU KURASI
              </span>
            )}

            <span className="text-muted/40 text-[10px] hidden sm:inline">&bull;</span>

            <span className="font-mono text-[10.5px] text-muted" title={formattedDate}>
              {relativeTime}
              {comment.editedAt && <span className="ml-1 italic text-[9px]">(disunting)</span>}
            </span>
          </div>

          {/* Body: Content or Edit form */}
          <div className="mt-1.5">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-2 mt-2">
                <textarea
                  rows={3}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 bg-background border border-border focus:border-foreground focus:outline-none rounded-none text-sm text-foreground font-sans resize-y"
                />
                {actionError && (
                  <p className="text-xs font-mono text-destructive">{actionError}</p>
                )}
                <div className="flex items-center gap-2 justify-end font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="h-7 px-3 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider text-[11px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !editContent.trim()}
                    className="h-7 px-3 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-40 text-[11px]"
                  >
                    {actionLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            ) : (
              <p
                className={cn(
                  'text-[14.5px] sm:text-[15px] leading-relaxed text-foreground/90 font-sans',
                  isDeletedByUser && 'italic text-muted font-serif'
                )}
              >
                {comment.content}
              </p>
            )}
          </div>

          {/* Actions footer */}
          {!isDeletedByUser && !isEditing && (
            <div className="mt-2.5 flex items-center gap-3.5 font-mono text-[10px] sm:text-[11px] text-muted uppercase tracking-wider">
              {/* Depth constraint: only parent comments can receive replies (BR-COM-02) */}
              {!isReply && (
                <button
                  type="button"
                  onClick={() => setIsReplying(!isReplying)}
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <CornerDownRight className="w-3 h-3" />
                  Balas
                </button>
              )}

              {comment.canEdit && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Sunting
                </button>
              )}

              {comment.canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="hover:text-destructive transition-colors inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsReporting(!isReporting)}
                className="hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <Flag className="w-3 h-3" />
                Laporkan
              </button>
            </div>
          )}

          {/* Reporting Modal / Box */}
          {isReporting && (
            <form
              onSubmit={handleReport}
              className="mt-3 p-3 bg-surface border border-foreground space-y-2 font-mono text-xs"
            >
              <div className="flex items-center justify-between font-bold uppercase text-foreground">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Laporkan Komentar Ini
                </span>
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="text-muted hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 pt-1">
                <label className="block text-[11px] text-muted uppercase">Alasan Pelaporan:</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as ReportReason)}
                  className="w-full p-2 bg-surface-muted border border-border-hairline rounded-none text-foreground text-xs focus:outline-none focus:border-foreground"
                >
                  <option value={ReportReason.SPAM}>SPAM / Promosi Tak Relevan</option>
                  <option value={ReportReason.ABUSE}>Ujaran Kebencian / Pelecehan</option>
                  <option value={ReportReason.OFF_TOPIC}>Melenceng Jauh dari Topik</option>
                  <option value={ReportReason.PERSONAL_INFO}>Penyebaran Data Pribadi (Doxxing)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-muted uppercase">Catatan Tambahan (Opsional):</label>
                <input
                  type="text"
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Berikan konteks tambahan bila diperlukan..."
                  className="w-full p-2 bg-surface-muted border border-border-hairline rounded-none text-foreground text-xs focus:outline-none focus:border-foreground font-sans"
                />
              </div>

              {actionError && <p className="text-destructive font-bold">{actionError}</p>}
              {actionSuccess && (
                <p className="text-foreground font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {actionSuccess}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="px-3 py-1.5 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-3 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-40"
                >
                  {actionLoading ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>
            </form>
          )}

          {/* Inline Reply Form */}
          {isReplying && (
            <div className="mt-3.5 pl-4 sm:pl-6 border-l border-border/60">
              <CommentForm
                articleId={articleId}
                letterId={letterId}
                parentId={comment.id}
                replyingToName={comment.author.name}
                onSuccess={(newReply) => {
                  onReplyCreated(comment.id, newReply);
                  setIsReplying(false);
                }}
                onCancelReply={() => setIsReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies (Depth 1) with open airy tree threading */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-2 sm:ml-6 pl-4 sm:pl-6 border-l border-border/60 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted/70 flex items-center justify-between pb-1">
            <span>↳ UTAS BALASAN ({comment.replies.length})</span>
            {comment.replies.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAllReplies(!showAllReplies)}
                className="text-[10px] uppercase tracking-wider text-muted hover:text-foreground underline cursor-pointer"
              >
                {showAllReplies ? 'Lipat Balasan' : `Lihat Semua (${comment.replies.length})`}
              </button>
            )}
          </div>

          <div className="space-y-3 divide-y divide-border-hairline/30">
            {(showAllReplies ? comment.replies : comment.replies.slice(0, 2)).map((reply) => (
              <CommentItemComponent
                key={reply.id}
                comment={reply}
                articleId={articleId}
                letterId={letterId}
                authorId={authorId}
                isReply={true}
                onCommentUpdated={onCommentUpdated}
                onCommentDeleted={onCommentDeleted}
                onReplyCreated={onReplyCreated}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
