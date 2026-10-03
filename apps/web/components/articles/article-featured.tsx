import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary } from '@perpusjal/types';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Calendar, Eye, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        'border-2 border-foreground bg-surface p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm',
        className
      )}
    >
      {/* Top Gazette Rule */}
      <div className="flex flex-wrap items-center justify-between font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted border-b-2 border-foreground pb-4 mb-8 gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-foreground" />
          <span className="font-bold text-foreground tracking-widest">
            TAJUK UTAMA LEMBARAN INI
          </span>
          <span className="text-border-hairline">//</span>
          <span className="text-foreground font-semibold">
            {article.category?.name || 'WARTA & ESAI'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-muted">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTime} MENIT BACA
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Headlines & Excerpt */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-foreground text-background font-mono text-[10px] uppercase tracking-widest font-bold">
                EDISI KHUSUS
              </span>
              {article.isFeatured && (
                <span className="px-2 py-0.5 border border-amber-600/40 text-amber-700 dark:text-amber-400 font-mono text-[10px] uppercase tracking-wider font-semibold">
                  ★ PILIHAN KURATOR
                </span>
              )}
            </div>

            <Link href={`/artikel/${article.slug}`} className="block group focus:outline-none">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.12] tracking-tight text-foreground group-hover:underline decoration-1 underline-offset-8">
                {article.title}
              </h2>
            </Link>

            {article.subtitle && (
              <p className="font-serif italic text-lg sm:text-xl text-muted font-normal leading-snug">
                {article.subtitle}
              </p>
            )}
          </div>

          {article.excerpt && (
            <div className="relative pl-5 border-l-2 border-foreground/30">
              <p className="font-serif text-base sm:text-lg text-foreground/90 leading-relaxed first-letter:float-left first-letter:text-5xl first-letter:font-serif first-letter:pr-3.5 first-letter:pt-1 first-letter:font-bold first-letter:text-foreground">
                {article.excerpt}
              </p>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border-hairline">
            <div className="font-mono text-xs uppercase tracking-wider text-muted space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-foreground font-semibold">
                  Oleh {article.author?.name || 'Redaksi Perpusjal'}
                </p>
                {article.author?.equippedTitle && (
                  <span className="px-1.5 py-0.5 border border-foreground bg-surface text-foreground font-bold text-[9px] uppercase tracking-wider shadow-xs">
                    ★ {article.author.equippedTitle}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {article.viewCount || 0} Pembaca
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {article.commentCount || 0} Tanggapan
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onQuickRead && (
                <button
                  type="button"
                  onClick={() => onQuickRead(article)}
                  className="flex-1 sm:flex-initial px-4 py-2 border border-border bg-background hover:bg-surface-muted hover:border-foreground text-foreground font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Baca Kilas</span>
                </button>
              )}

              <Link href={`/artikel/${article.slug}`} className="flex-1 sm:flex-initial">
                <Button variant="solid" size="md" className="w-full">
                  <span>Lembaran Penuh</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Cover Image Frame */}
        <div className="lg:col-span-5">
          {article.coverImage ? (
            <div className="border-2 border-foreground p-2.5 bg-background shadow-sm">
              <div className="aspect-[4/3] overflow-hidden bg-surface-muted relative group">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {article.coverCredit && (
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted text-right pt-2.5">
                  Kredit Dokumen: {article.coverCredit}
                </p>
              )}
            </div>
          ) : (
            <div className="border-2 border-foreground p-8 bg-surface-muted flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
              <span className="font-serif italic text-3xl text-foreground font-normal">
                Perpusjal Blora
              </span>
              <div className="w-12 h-0.5 bg-foreground mx-auto" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted max-w-xs">
                Lembaran Terbitan Swadaya Warga • Dicetak & Dipublikasikan di Tanah Blora
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
