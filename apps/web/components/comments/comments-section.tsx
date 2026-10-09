'use client';

import * as React from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { CommentItem, CommentStatus } from '@perpusjal/types';
import { CommentForm } from './comment-form';
import { CommentItemComponent } from './comment-item';
import { CustomLoader } from '@/components/ui/custom-loader';
import { MessageSquare, Info, Check, LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentsSectionProps {
  articleId?: string;
  letterId?: string;
  authorId?: string;
  initialCount?: number;
}

export function CommentsSection({
  articleId,
  letterId,
  authorId,
  initialCount = 0,
}: CommentsSectionProps) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = React.useState<CommentItem[]>([]);
  const [total, setTotal] = React.useState(initialCount);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  // Progressive loading & sorting state
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');
  const [visibleLimit, setVisibleLimit] = React.useState(10);

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

  // Sort comments according to preference
  const sortedComments = React.useMemo(() => {
    const list = [...comments];
    if (sortOrder === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [comments, sortOrder]);

  const visibleComments = sortedComments.slice(0, visibleLimit);
  const remainingCount = sortedComments.length - visibleLimit;

  return (
    <section className="border-t border-border-hairline pt-10 space-y-6">
      {/* Header: Clean, roomy, with sort tabs */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-border-hairline gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-foreground" />
          <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-foreground">
            MAJELIS TANGGAPAN WARGA
          </h2>
          <span className="font-mono text-[11px] text-muted">
            ({total})
          </span>
        </div>

        {/* Sort Filter Tabs */}
        {comments.length > 1 && (
          <div className="flex items-center gap-1 font-mono text-[10.5px]">
            <button
              type="button"
              onClick={() => setSortOrder('newest')}
              className={cn(
                'px-2.5 py-1 uppercase tracking-wider transition-colors cursor-pointer rounded-none',
                sortOrder === 'newest'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground'
              )}
            >
              Terbaru
            </button>
            <button
              type="button"
              onClick={() => setSortOrder('oldest')}
              className={cn(
                'px-2.5 py-1 uppercase tracking-wider transition-colors cursor-pointer rounded-none',
                sortOrder === 'oldest'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground'
              )}
            >
              Terdahulu
            </button>
          </div>
        )}
      </div>

      {/* Editorial Code of Conduct: Subtle & lightweight */}
      <div className="flex items-start gap-2.5 text-xs font-sans text-muted leading-relaxed">
        <Info className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
        <p>
          Ruang dialektika kritis dan beradab. Tanggapan akun baru (<span className="text-foreground font-semibold">TL0</span>) melalui kurasi redaksi.
        </p>
      </div>

      {/* Temporary feedback banner */}
      {notice && (
        <div className="p-3 bg-surface border border-border-hairline font-mono text-xs text-foreground flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Top comment submission box or Guest Invitation */}
      {!isAuthenticated ? (
        <div className="py-5 px-4 sm:px-6 border-l-2 border-foreground bg-surface-muted/20 space-y-3 font-mono">
          <p className="font-serif italic text-sm sm:text-base text-foreground/85 leading-relaxed">
            &ldquo;Masuk dengan akun warga untuk menyumbangkan catatan kaki, kritik, atau perspektif Anda terhadap naskah ini.&rdquo;
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/login"
              className="h-8 px-3.5 bg-foreground text-background font-mono text-xs uppercase font-bold tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-2 rounded-none"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk ke Akun</span>
            </Link>
            <Link
              href="/register"
              className="h-8 px-3.5 border border-border-hairline hover:border-foreground transition-colors font-mono text-xs uppercase tracking-wider inline-flex items-center gap-2 rounded-none text-muted hover:text-foreground"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Warga Baru</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="pt-1">
          <CommentForm
            articleId={articleId}
            letterId={letterId}
            onSuccess={handleCommentCreated}
          />
        </div>
      )}

      {/* Comments List */}
      <div className="pt-2">
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
          <div className="py-12 text-center border-y border-border-hairline p-8 space-y-2">
            <span className="font-mono text-[11px] text-muted uppercase tracking-widest">
              [ LEMBAR PERCAKAPAN MASIH TERBUKA ]
            </span>
            <p className="font-serif text-base sm:text-lg text-foreground">
              Belum ada catatan kaki dari pembaca untuk naskah ini.
            </p>
            <p className="font-sans text-xs text-muted max-w-md mx-auto leading-relaxed">
              Buka dialektika pertama dan sumbangkan sudut pandang, kritik, atau elaborasi Anda terhadap gagasan di atas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-hairline/60">
            {visibleComments.map((comment) => (
              <CommentItemComponent
                key={comment.id}
                comment={comment}
                articleId={articleId}
                letterId={letterId}
                authorId={authorId}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
                onReplyCreated={handleReplyCreated}
              />
            ))}
          </div>
        )}

        {/* Load More Pagination Button for Mass Comments */}
        {remainingCount > 0 && !loading && (
          <div className="pt-8 pb-4 text-center">
            <button
              type="button"
              onClick={() => setVisibleLimit((prev) => prev + 10)}
              className="w-full sm:w-auto h-10 px-6 border border-foreground bg-background hover:bg-foreground hover:text-background transition-colors font-mono text-xs uppercase font-bold tracking-wider cursor-pointer rounded-none inline-flex items-center justify-center gap-2"
            >
              <span>TAMPILKAN 10 TANGGAPAN BERIKUTNYA</span>
              <span className="text-muted group-hover:text-background font-normal">
                ({remainingCount} tersisa)
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
