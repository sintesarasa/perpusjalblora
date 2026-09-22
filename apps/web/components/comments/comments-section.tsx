'use client';

import * as React from 'react';
import { apiClient } from '@/lib/api';
import { CommentItem, CommentStatus } from '@perpusjal/types';
import { CommentForm } from './comment-form';
import { CommentItemComponent } from './comment-item';
import { CustomLoader } from '@/components/ui/custom-loader';
import { MessageSquare, Info, Check } from 'lucide-react';

interface CommentsSectionProps {
  articleId?: string;
  letterId?: string;
  initialCount?: number;
}

export function CommentsSection({
  articleId,
  letterId,
  initialCount = 0,
}: CommentsSectionProps) {
  const [comments, setComments] = React.useState<CommentItem[]>([]);
  const [total, setTotal] = React.useState(initialCount);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const fetchComments = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const param = articleId ? `articleId=${articleId}` : `letterId=${letterId}`;
    const res = await apiClient<{ data: CommentItem[]; meta: { total: number } }>(
      `/comments?${param}&perPage=50`
    );

    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data) {
      setComments(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    }
  }, [articleId, letterId]);

  React.useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentCreated = (newComment: CommentItem, message?: string) => {
    if (newComment.pendingModeration) {
      setNotice(message || 'Komentar Anda telah terkirim dan masuk antrean kurasi (TL0).');
    } else {
      setComments((prev) => [newComment, ...prev]);
      setTotal((prev) => prev + 1);
      setNotice('Komentar Anda berhasil dipublikasikan.');
    }

    setTimeout(() => {
      setNotice(null);
    }, 4000);
  };

  const handleReplyCreated = (parentId: string, reply: CommentItem) => {
    if (reply.pendingModeration) {
      setNotice('Balasan Anda telah terkirim dan masuk antrean kurasi (TL0).');
    } else {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), reply],
            };
          }
          return c;
        })
      );
      setNotice('Balasan Anda berhasil dipublikasikan.');
    }

    setTimeout(() => {
      setNotice(null);
    }, 4000);
  };

  const handleCommentUpdated = (id: string, newContent: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            content: newContent,
            editedAt: new Date().toISOString(),
          };
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === id
                ? {
                    ...r,
                    content: newContent,
                    editedAt: new Date().toISOString(),
                  }
                : r
            ),
          };
        }
        return c;
      })
    );
  };

  const handleCommentDeleted = (id: string) => {
    setComments((prev) =>
      prev
        .map((c) => {
          if (c.id === id) {
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                content: '[Komentar ini telah dihapus oleh penulis]',
                status: CommentStatus.DELETED_BY_USER,
              };
            }
            return null;
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.filter((r) => r.id !== id),
            };
          }
          return c;
        })
        .filter(Boolean) as CommentItem[]
    );
    setTotal((prev) => Math.max(0, prev - 1));
  };

  return (
    <section className="border-t-2 border-foreground pt-8 space-y-6">
      {/* Header with double rule */}
      <div className="border-b border-border-hairline pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-foreground" />
          <h2 className="font-mono text-sm uppercase tracking-widest font-bold text-foreground">
            DISKUSI & TANGGAPAN
          </h2>
        </div>
        <span className="font-mono text-xs text-muted uppercase tracking-widest">
          // {total} TANGGAPAN
        </span>
      </div>

      {/* Gazette Editorial Code of Conduct Notice */}
      <div className="p-3.5 bg-surface-muted border-l-2 border-foreground flex items-start gap-3 text-xs font-sans text-muted leading-relaxed">
        <Info className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
        <p>
          Ruang diskusi Perpusjal Blora mengedepankan dialektika yang bermartabat, kritis, dan berdasar.
          Komentar akun baru (TL0) dikurasi terlebih dahulu demi ketertiban ruang bersama.
        </p>
      </div>

      {/* Temporary feedback banner */}
      {notice && (
        <div className="p-3 bg-surface border border-foreground font-mono text-xs text-foreground flex items-center gap-2">
          <Check className="w-4 h-4 text-foreground" />
          <span>{notice}</span>
        </div>
      )}

      {/* Top comment submission box */}
      <div className="p-4 sm:p-5 bg-surface border border-border-hairline">
        <span className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground mb-3">
          Sampaikan Tanggapan Baru
        </span>
        <CommentForm
          articleId={articleId}
          letterId={letterId}
          onSuccess={handleCommentCreated}
        />
      </div>

      {/* Comments List */}
      <div className="space-y-2 pt-2">
        {loading ? (
          <div className="py-12 flex justify-center">
            <CustomLoader size="md" label="MEMUAT TANGGAPAN..." />
          </div>
        ) : error ? (
          <div className="p-4 border border-foreground bg-surface-muted text-center space-y-2 font-mono text-xs">
            <p className="text-foreground">{error}</p>
            <button
              onClick={fetchComments}
              className="px-3 py-1 bg-foreground text-background font-bold uppercase tracking-wider"
            >
              Coba Lagi
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-12 text-center border border-border-hairline p-8 bg-surface space-y-2">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">
              [ KOLOM KOSONG ]
            </span>
            <p className="font-serif text-base text-foreground">
              Belum ada tanggapan untuk naskah ini.
            </p>
            <p className="font-sans text-xs text-muted max-w-sm mx-auto">
              Jadilah yang pertama menyumbangkan pandangan, kritik, atau perspektif Anda.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-hairline">
            {comments.map((comment) => (
              <CommentItemComponent
                key={comment.id}
                comment={comment}
                articleId={articleId}
                letterId={letterId}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
                onReplyCreated={handleReplyCreated}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
