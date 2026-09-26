'use client';

import * as React from 'react';
import { apiClient } from '@/lib/api';
import { CommentItem } from '@perpusjal/types';
import { MessageSquare, AlertCircle, CornerDownRight, X } from 'lucide-react';

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
  const [content, setContent] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const urlMatches = content.match(/https?:\/\//g) || [];
  const urlCount = urlMatches.length;
  const isUrlOverLimit = urlCount > 2;
  const charLength = content.length;
  const isCharOverLimit = charLength > 1500;
  const canSubmit = charLength >= 2 && !isUrlOverLimit && !isCharOverLimit && !submitting;

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
      onSuccess(res.data.comment, res.data.message);
      if (onCancelReply) {
        onCancelReply();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-sans">
      {replyingToName && (
        <div className="flex items-center justify-between p-2 sm:p-2.5 bg-surface-muted border border-border-hairline font-mono text-[11px]">
          <div className="flex items-center gap-2 text-foreground">
            <CornerDownRight className="w-3.5 h-3.5 text-muted shrink-0" />
            <span className="truncate">
              Membalas tanggapan dari <strong className="font-bold">{replyingToName}</strong>
            </span>
          </div>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="inline-flex items-center gap-1 text-muted hover:text-foreground transition-colors uppercase tracking-wider ml-2 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Batal
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tuliskan gagasan, tanggapan, atau kritik dengan santun dan berbobot..."
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
          className="w-full sm:w-auto h-8 px-4 bg-foreground text-background font-mono text-[11px] uppercase tracking-wider font-bold hover:bg-foreground/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-none flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-3 h-3" />
          <span>{submitting ? 'MENGIRIM...' : parentId ? 'KIRIM BALASAN' : 'KIRIM TANGGAPAN'}</span>
        </button>
      </div>
    </form>
  );
}
