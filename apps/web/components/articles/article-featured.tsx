import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary } from '@perpusjal/types';
import { BookOpen, Clock, Calendar, Eye, MessageSquare, ArrowRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserHonorBadge } from '@/components/gamification/user-honor-badge';
import { UserAvatar } from '@/components/ui/user-avatar';

interface ArticleFeaturedProps {
  article: ArticleSummary;
  className?: string;
  onQuickRead?: (article: ArticleSummary) => void;
}

export function ArticleFeatured({
  article,
  className,
  onQuickRead,
}: ArticleFeaturedProps) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <section
      className={cn(
        'border-2 border-foreground bg-surface p-6 sm:p-9 lg:p-10 relative overflow-hidden space-y-6 sm:space-y-8',
        className
      )}
    >
      {/* ── Top Gazette Status Bar (Minimal, No Date Duplication) ── */}
      <div className="flex flex-wrap items-center justify-between font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] border-b-2 border-foreground pb-3.5 gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-foreground inline-block shrink-0" />
          <span className="font-black text-foreground tracking-widest">
            TAJUK UTAMA LEMBARAN
          </span>
          <span className="text-border-hairline">//</span>
          <span className="font-bold text-foreground bg-surface-muted px-2 py-0.5 border border-foreground/30">
            {article.category?.name || 'WARTA & ESAI'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-foreground font-bold">
          {article.isFeatured && (
            <span className="px-2 py-0.5 border border-foreground bg-surface-muted font-mono text-[9px] uppercase tracking-wider">
              ★ PILIHAN KURATOR
            </span>
          )}
          <span className="flex items-center gap-1 font-mono text-[10px]">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTime} MENIT BACA
          </span>
        </div>
      </div>

      {/* ── Grid: Left Narrative + Right Visual Frame ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Headlines & Excerpt (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2.5">
            <Link href={`/artikel/${article.slug}`} className="block group focus:outline-none">
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight text-foreground group-hover:underline decoration-2 underline-offset-8">
                {article.title}
              </h2>
            </Link>

            {article.subtitle && (
              <p className="font-serif italic text-base sm:text-lg text-foreground/85 leading-snug">
                {article.subtitle}
              </p>
            )}
          </div>

          {article.excerpt && (
            <div className="relative pl-5 border-l-2 border-foreground">
              <p className="font-serif text-base sm:text-lg text-foreground/90 leading-relaxed first-letter:float-left first-letter:text-5xl first-letter:font-serif first-letter:pr-3.5 first-letter:pt-1 first-letter:font-black first-letter:text-foreground">
                {article.excerpt}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Visual Frame (5 cols) */}
        <div className="lg:col-span-5">
          {article.coverImage ? (
            <div className="border-2 border-foreground p-2.5 bg-surface">
              <div className="aspect-[4/3] overflow-hidden bg-zinc-950 relative group border border-foreground/30">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-500"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-foreground text-background font-mono text-[8px] font-black uppercase tracking-widest border border-background">
                  ✦ FOTO LEMBARAN ✦
                </div>
              </div>
              {article.coverCredit && (
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted text-right pt-2">
                  Dokumentasi: {article.coverCredit}
                </p>
              )}
            </div>
          ) : (
            <div className="border-2 border-foreground p-7 bg-surface-muted flex flex-col items-center justify-center text-center space-y-3 min-h-[260px]">
              <Quote className="w-7 h-7 text-foreground/40" />
              <span className="font-serif italic text-xl text-foreground font-bold">
                Perpustakaan Jalanan Blora
              </span>
              <div className="w-12 h-0.5 bg-foreground mx-auto" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted max-w-xs">
                Lembaran Swadaya Warga &bull; Ditulis &amp; Didiskusikan di Ruang Terbuka
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Dedicated Bottom Control Bar: Byline on Left, Buttons on Right ── */}
      <div className="pt-5 border-t-2 border-foreground flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left Area: Author Byline & Metrics */}
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar
            src={article.author?.avatarUrl}
            name={article.author?.name || 'Redaksi'}
            username={article.author?.username}
            size="md"
            shape="square"
            className="border-2 border-foreground shrink-0"
          />

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif text-sm sm:text-base font-bold text-foreground truncate">
                Oleh {article.author?.name || 'Redaksi Perpusjal'}
              </span>
              {article.author && (
                <UserHonorBadge
                  equippedTitle={article.author.equippedTitle}
                  equippedBadge={article.author.equippedBadge}
                  earnedBadgesCount={article.author.earnedBadgesCount}
                  badges={article.author.badges}
                  username={article.author.username}
                  size="sm"
                />
              )}
            </div>

            <div className="flex items-center gap-3 font-mono text-[10.5px] text-muted flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Calendar className="w-3 h-3 text-foreground" />
                {formattedDate}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {article.viewCount || 0} Pembaca
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> {article.commentCount || 0} Tanggapan
              </span>
            </div>
          </div>
        </div>

        {/* Right Area: Clean, Spacious Action Buttons (No collisions) */}
        <div className="flex items-center gap-3 shrink-0">
          {onQuickRead && (
            <button
              type="button"
              onClick={() => onQuickRead(article)}
              className="px-4 py-2.5 border-2 border-foreground bg-surface hover:bg-surface-muted text-foreground font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Baca Kilas</span>
            </button>
          )}

          <Link href={`/artikel/${article.slug}`}>
            <span className="px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5">
              <span>Lembaran Penuh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
