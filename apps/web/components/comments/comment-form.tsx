'use client';

import * as React from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { CommentItem } from '@perpusjal/types';
import { MessageSquare, AlertCircle, CornerDownRight, X, LogIn } from 'lucide-react';

interface CommentFormProps {
  articleId?: string;
  letterId?: string;
  parentId?: string;
  replyingToName?: string;
  onSuccess: (comment: CommentItem, message?: string) => void;
  onCancelReply?: () => void;
}

export function CommentForm({
  articleId,
  letterId,
  parentId,
  replyingToName,
  onSuccess,
  onCancelReply,
}: CommentFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const draftKey = `draft_comment_${articleId || letterId || 'general'}_${parentId || 'root'}`;

  // Restore draft on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(draftKey);
        if (saved && !content) {
          setContent(saved);
        }
      } catch {}
    }
  }, [draftKey]);

  const handleContentChange = (val: string) => {
    setContent(val);
    if (typeof window !== 'undefined') {
      try {
        if (val.trim()) {
          localStorage.setItem(draftKey, val);
        } else {
          localStorage.removeItem(draftKey);
        }
      } catch {}
    }
  };

  const urlMatches = content.match(/https?:\/\//g) || [];
  const urlCount = urlMatches.length;
  const isUrlOverLimit = urlCount > 2;
  const charLength = content.length;
  const isCharOverLimit = charLength > 1500;
  const canSubmit = charLength >= 2 && !isUrlOverLimit && !isCharOverLimit && !submitting && isAuthenticated;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      articleId,
      letterId,
      parentId,
      content: content.trim(),
    };

    const res = await apiClient<{ comment: CommentItem; message?: string }>('/comments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data) {
      setContent('');
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(draftKey);
        } catch {}
      }
      onSuccess(res.data.comment, res.data.message);
      if (onCancelReply) {
        onCancelReply();
      }
    }
  };

  // If unauthenticated inside reply form
  if (!isAuthenticated) {
    return (
      <div className="p-3.5 bg-surface border border-border-hairline font-mono text-xs space-y-2.5">
        <p className="text-muted leading-relaxed font-sans">
          Silakan masuk dengan akun warga untuk membalas tanggapan dari <strong className="font-bold text-foreground">{replyingToName}</strong>.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <Link
            href="/login"
            className="h-7 px-3 bg-foreground text-background font-mono text-[11px] uppercase font-bold tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5 rounded-none"
          >
            <LogIn className="w-3 h-3" />
            <span>Masuk</span>
          </Link>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="h-7 px-3 border border-border-hairline text-muted hover:text-foreground font-mono text-[11px] uppercase tracking-wider transition-colors rounded-none"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-sans">
      {/* Identity Pill when replying or creating */}
      {replyingToName ? (
        <div className="flex items-center justify-between pb-1 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-foreground truncate">
            <CornerDownRight className="w-3.5 h-3.5 text-muted shrink-0" />
            <span className="truncate">
              Membalas <strong className="font-bold">{replyingToName}</strong>
            </span>
          </div>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="inline-flex items-center gap-1 text-muted hover:text-foreground transition-colors uppercase tracking-wider ml-2 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Batal
            </button>
          )}
        </div>
      ) : user ? (
        <div className="flex items-center justify-between pb-2 border-b border-border-hairline font-mono text-[11px]">
          <div className="flex items-center gap-2 text-foreground truncate">
            <span className="w-1.5 h-1.5 bg-foreground rounded-none shrink-0" />
            <span className="truncate">
              Menanggapi sebagai <strong className="font-bold">{user.name}</strong> (@{user.username})
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted shrink-0 ml-2">
            [{user.role}]
          </span>
        </div>
      ) : null}

      <div className="relative">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={
            replyingToName
              ? `Tulis balasan untuk ${replyingToName}...`
              : 'Tuliskan tanggapan, kritik bernas, atau catatan kaki Anda dengan santun dan berbobot...'
          }
          disabled={submitting}
          className="w-full p-3 sm:p-3.5 bg-background border border-border focus:border-foreground focus:outline-none rounded-none text-sm leading-relaxed text-foreground placeholder:text-muted/60 resize-y transition-colors font-sans"
        />
      </div>

      {error && (
        <div className="p-3 border border-destructive/40 bg-destructive/5 flex items-start gap-2 text-xs font-mono text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono text-muted">
        <div className="flex items-center gap-3">
          <span className={charLength > 1500 ? 'text-destructive font-bold' : ''}>
            {charLength}/1500 karakter
          </span>
          <span>&bull;</span>
          <span className={isUrlOverLimit ? 'text-destructive font-bold' : ''}>
            {urlCount}/2 tautan URL
          </span>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto h-8 px-4 bg-foreground text-background font-mono text-[11px] uppercase tracking-wider font-bold hover:bg-foreground/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-none flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <MessageSquare className="w-3 h-3" />
          <span>{submitting ? 'MENGIRIM...' : parentId ? 'KIRIM BALASAN' : 'KIRIM TANGGAPAN'}</span>
        </button>
      </div>
    </form>
  );
}
