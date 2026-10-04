'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary } from '@perpusjal/types';
import {
  X,
  BookOpen,
  Clock,
  Eye,
  MessageSquare,
  Share2,
  Check,
  ArrowRight,
  Sparkles,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { UserAvatar } from '@/components/ui/user-avatar';

interface ArticleQuickReadDrawerProps {
  article: ArticleSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleQuickReadDrawer({
  article,
  isOpen,
  onClose,
}: ArticleQuickReadDrawerProps) {
  const [copied, setCopied] = React.useState(false);

  // Close on ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !article) return null;

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/artikel/${article.slug}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/artikel/${article.slug}`;
      const text = encodeURIComponent(`"${article.title}" — Baca warta di Perpusjal Blora: ${url}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-xl bg-background border-l-2 border-foreground shadow-2xl z-10 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-border-hairline flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>PRATINJAU KILAS NASKAH // DOKUMEN PUBLIK</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-surface-muted text-muted hover:text-foreground transition-colors border border-transparent hover:border-border"
            aria-label="Tutup Pratinjau"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Tag & Reading Time */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline pb-4 font-mono text-xs">
            <span className="font-bold text-foreground tracking-widest uppercase">
              [{article.category?.name || 'WARTA & ESAI'}]
            </span>
            <div className="flex items-center gap-4 text-muted text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readingTime} Menit Baca
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-foreground">
              {article.title}
            </h2>
            {article.subtitle && (
              <p className="font-serif italic text-base text-muted">
                {article.subtitle}
              </p>
            )}
          </div>

          {/* Cover Image if any */}
          {article.coverImage && (
            <div className="border border-border p-2 bg-surface">
              <div className="aspect-[16/9] overflow-hidden bg-surface-muted">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {article.coverCredit && (
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted text-right pt-2">
                  Kredit Foto: {article.coverCredit}
                </p>
              )}
            </div>
          )}

          {/* Excerpt / Summary */}
          {article.excerpt && (
            <div className="p-5 bg-surface border-l-4 border-foreground space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted block">
                INTISARI NASKAH
              </span>
              <p className="font-serif text-base text-foreground/90 leading-relaxed italic">
                “{article.excerpt}”
              </p>
            </div>
          )}

          {/* Author Card Box */}
          <div className="p-4 bg-surface border border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={article.author?.avatarUrl}
                name={article.author?.name || 'Redaksi'}
                username={article.author?.username}
                size="sm"
                linkToProfile={!!article.author?.username}
              />
              <div className="space-y-0.5">
                <Link
                  href={article.author?.username ? `/u/${article.author.username}` : '#'}
                  className="font-serif text-sm font-bold text-foreground hover:underline block leading-tight"
                >
                  {article.author?.name || 'Redaksi Perpusjal'}
                </Link>
                <p className="font-mono text-[10px] text-muted">
                  @{article.author?.username || 'redaksi'} • Penulis Warga
                </p>
              </div>
            </div>

            {article.isFeatured && (
              <span className="px-2 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-mono text-[9px] uppercase tracking-widest font-bold">
                ★ PILIHAN REDAKSI
              </span>
            )}
          </div>

          {/* Engagement Statistics */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 border border-border bg-surface text-center">
              <span className="text-[10px] text-muted block uppercase">DIBACA SEBANYAK</span>
              <span className="font-bold text-base text-foreground">{article.viewCount || 0} Kali</span>
            </div>
            <div className="p-3 border border-border bg-surface text-center">
              <span className="text-[10px] text-muted block uppercase">RESPON WARGA</span>
              <span className="font-bold text-base text-foreground">{article.commentCount || 0} Komentar</span>
            </div>
          </div>

          {/* Tags if available */}
          {article.tags && article.tags.length > 0 && (
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted block">
                KATA KUNCI ARSIP
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {article.tags.map((t) => (
                  <span
                    key={t.id}
                    className="px-2 py-0.5 bg-surface border border-border text-muted"
                  >
                    #{t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t-2 border-foreground bg-surface flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial px-3 py-2.5 border border-border bg-background hover:bg-surface-muted font-mono text-xs text-muted hover:text-foreground flex items-center justify-center gap-1.5 transition-colors"
              title="Salin Tautan"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Bagikan'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-2.5 border border-border bg-background hover:bg-surface-muted font-mono text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
              title="Kirim ke WhatsApp"
            >
              WA
            </button>
          </div>

          <Link
            href={`/artikel/${article.slug}`}
            onClick={onClose}
            className="w-full sm:flex-1 py-2.5 px-4 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
          >
            <span>Buka Lembaran Naskah Lengkap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
