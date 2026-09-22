'use client';

import * as React from 'react';
import { apiClient } from '@/lib/api';
import { CommentItem, CommentStatus, ReportReason } from '@perpusjal/types';
import { CommentForm } from './comment-form';
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
} from 'lucide-react';

interface CommentItemProps {
  comment: CommentItem;
  articleId?: string;
  letterId?: string;
  isReply?: boolean;
  onCommentUpdated: (id: string, newContent: string) => void;
  onCommentDeleted: (id: string) => void;
  onReplyCreated: (parentId: string, reply: CommentItem) => void;
}

export function CommentItemComponent({
  comment,
  articleId,
  letterId,
  isReply = false,
  onCommentUpdated,
  onCommentDeleted,
  onReplyCreated,
}: CommentItemProps) {
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

  // Format date
  const formattedDate = new Date(comment.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article
      className={`border-b border-border-hairline py-4 last:border-b-0 font-sans ${
        comment.pendingModeration ? 'bg-surface-muted/60 p-4 border border-dashed border-foreground/40' : ''
      }`}
    >
      {/* Header: Author info & meta */}
      <div className="flex items-start justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-6 h-6 border border-foreground flex items-center justify-center font-mono text-[10px] font-bold bg-surface uppercase shrink-0">
            {comment.author.name.charAt(0)}
          </div>

          <span className="font-serif font-bold text-sm text-foreground">
            {comment.author.name}
          </span>

          <span className="font-mono text-[11px] text-muted">
            @{comment.author.username}
          </span>

          {/* Role / Trust Level Badge */}
          {comment.author.role === 'KURATOR' || comment.author.role === 'ADMIN' ? (
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-foreground text-background font-bold inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {comment.author.role}
            </span>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.2 border border-border-hairline text-muted">
              {comment.author.trustLevel}
            </span>
          )}

          {comment.pendingModeration && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-foreground bg-surface text-foreground font-bold inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              MENUNGGU KURASI
            </span>
          )}
        </div>

        <div className="font-mono text-[11px] text-muted shrink-0">
          {formattedDate}
          {comment.editedAt && <span className="ml-1 italic text-[10px]">(disunting)</span>}
        </div>
      </div>

      {/* Body: Content or Edit form */}
      <div className="mt-2.5">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-2 mt-2">
            <textarea
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 bg-surface border border-foreground focus:outline-none rounded-none text-sm text-foreground font-sans resize-y"
            />
            {actionError && (
              <p className="text-xs font-mono text-destructive">{actionError}</p>
            )}
            <div className="flex items-center gap-2 justify-end font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading || !editContent.trim()}
                className="px-3 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-40"
              >
                {actionLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        ) : (
          <p
            className={`text-sm leading-relaxed ${
              isDeletedByUser ? 'italic text-muted font-serif' : 'text-foreground font-sans'
            }`}
          >
            {comment.content}
          </p>
        )}
      </div>

      {/* Actions footer */}
      {!isDeletedByUser && !isEditing && (
        <div className="mt-3 flex items-center gap-4 font-mono text-[11px] text-muted uppercase tracking-wider">
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
            className="hover:text-foreground transition-colors inline-flex items-center gap-1 ml-auto"
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
        <div className="mt-3 pl-4 border-l-2 border-foreground">
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

      {/* Nested Replies (Depth 1) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-4 sm:pl-6 border-l-2 border-border-hairline space-y-2">
          {comment.replies.map((reply) => (
            <CommentItemComponent
              key={reply.id}
              comment={reply}
              articleId={articleId}
              letterId={letterId}
              isReply={true}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
              onReplyCreated={onReplyCreated}
            />
          ))}
        </div>
      )}
    </article>
  );
}
