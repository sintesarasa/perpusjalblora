import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary } from '@perpusjal/types';
import { BookOpen, Clock, Calendar, Eye, MessageSquare, ArrowRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserHonorBadge } from '@/components/gamification/user-honor-badge';

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
        'border-2 border-foreground bg-surface p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] select-none',
        className
      )}
    >
      {/* Top Gazette Rule */}
      <div className="flex flex-wrap items-center justify-between font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted border-b-2 border-foreground pb-4 mb-8 gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-foreground" />
          <span className="font-black text-foreground tracking-widest">
            TAJUK UTAMA LEMBARAN INI
          </span>
          <span className="text-border-hairline">//</span>
          <span className="text-foreground font-bold bg-surface-muted px-2 py-0.5 border border-foreground/30">
            {article.category?.name || 'WARTA & ESAI'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-muted font-bold">
          <span className="flex items-center gap-1 text-foreground">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTime} MENIT BACA
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-foreground" />
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Headlines & Excerpt (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-foreground text-background font-mono text-[10px] uppercase tracking-widest font-bold">
                EDISI KHUSUS
              </span>
              {article.isFeatured && (
                <span className="px-2 py-0.5 border border-foreground bg-surface-muted text-foreground font-mono text-[10px] uppercase tracking-wider font-bold">
                  ★ PILIHAN KURATOR
                </span>
              )}
            </div>

            <Link href={`/artikel/${article.slug}`} className="block group focus:outline-none">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.12] tracking-tight text-foreground group-hover:underline decoration-2 underline-offset-8">
                {article.title}
              </h2>
            </Link>

            {article.subtitle && (
              <p className="font-serif italic text-lg sm:text-xl text-foreground/80 font-normal leading-snug">
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

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border-hairline">
            <div className="font-mono text-xs uppercase tracking-wider text-muted space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-foreground font-bold">
                  Oleh {article.author?.name || 'Redaksi Perpusjal'}
                </p>
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
              <div className="flex items-center gap-3 text-[10px]">
                <span>{formattedDate}</span>
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

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {onQuickRead && (
                <button
                  type="button"
                  onClick={() => onQuickRead(article)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 border-2 border-foreground bg-surface hover:bg-foreground hover:text-background text-foreground font-mono text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs active:translate-x-0.5 active:translate-y-0.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Baca Kilas</span>
                </button>
              )}

              <Link href={`/artikel/${article.slug}`} className="flex-1 sm:flex-initial">
                <span className="px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 shadow-xs active:translate-x-0.5 active:translate-y-0.5">
                  <span>Lembaran Penuh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Cover Image Frame (5 cols) */}
        <div className="lg:col-span-5">
          {article.coverImage ? (
            <div className="border-2 border-foreground p-3 bg-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
              <div className="aspect-[4/3] overflow-hidden bg-zinc-950 relative group border border-foreground/30">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-500"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-foreground text-background font-mono text-[8px] font-black uppercase tracking-widest border border-background shadow-xs">
                  ✦ LEMBARAN TERPAL ✦
                </div>
              </div>
              {article.coverCredit && (
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted text-right pt-2">
                  Dokumentasi: {article.coverCredit}
                </p>
              )}
            </div>
          ) : (
            <div className="border-2 border-foreground p-8 bg-surface-muted flex flex-col items-center justify-center text-center space-y-4 min-h-[300px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
              <Quote className="w-8 h-8 text-foreground/40" />
              <span className="font-serif italic text-2xl text-foreground font-bold">
                Perpustakaan Jalanan Blora
              </span>
              <div className="w-16 h-0.5 bg-foreground mx-auto" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted max-w-xs">
                Lembaran Terbitan Swadaya Warga &bull; Dicetak &amp; Didiskusikan di Trotoar
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
