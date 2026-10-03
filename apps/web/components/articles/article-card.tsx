import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary } from '@perpusjal/types';
import { Eye, MessageSquare, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  article: ArticleSummary;
  className?: string;
  showImage?: boolean;
  viewMode?: 'grid' | 'broadsheet';
  onQuickRead?: (article: ArticleSummary) => void;
}

export function ArticleCard({
  article,
  className,
  showImage = true,
  viewMode = 'grid',
  onQuickRead,
}: ArticleCardProps) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  // Broadsheet (Newspaper Column) Mode
  if (viewMode === 'broadsheet') {
    return (
      <article
        className={cn(
          'group p-6 bg-surface border border-border transition-all hover:border-foreground relative flex flex-col md:flex-row gap-6 items-start',
          className
        )}
      >
        {/* Cover Image in broadsheet mode */}
        {showImage && article.coverImage && (
          <div className="w-full md:w-56 shrink-0 aspect-[16/10] overflow-hidden border border-border-hairline bg-surface-muted relative">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between h-full space-y-4 w-full">
          <div className="space-y-3">
            {/* Category, Date & Read Time */}
            <div className="flex flex-wrap items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted border-b border-border-hairline pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">
                  [{article.category?.name || 'WARTA & ESAI'}]
                </span>
                {article.isFeatured && (
                  <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold">
                    PILIHAN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readingTime} Menit
                </span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Title */}
            <Link href={`/artikel/${article.slug}`} className="block focus:outline-none">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-snug tracking-tight text-foreground group-hover:underline group-hover:decoration-1 underline-offset-4">
                {article.title}
              </h3>
            </Link>

            {/* Subtitle or Excerpt */}
            {(article.subtitle || article.excerpt) && (
              <p className="font-sans text-sm text-foreground/80 leading-relaxed line-clamp-3">
                {article.subtitle || article.excerpt}
              </p>
            )}
          </div>

          {/* Bottom Byline & Action */}
          <div className="pt-4 border-t border-border-hairline flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-muted">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-semibold">
                Oleh {article.author?.name || 'Redaksi'}
              </span>
              {article.author?.equippedTitle && (
                <span className="px-1.5 py-0.5 border border-border-hairline bg-surface-muted text-foreground font-bold text-[9px]">
                  {article.author.equippedTitle}
                </span>
              )}
              <span className="text-border-hairline">|</span>
              <span className="flex items-center gap-1 text-[10px]">
                <Eye className="w-3 h-3" /> {article.viewCount || 0}
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <MessageSquare className="w-3 h-3" /> {article.commentCount || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onQuickRead && (
                <button
                  type="button"
                  onClick={() => onQuickRead(article)}
                  className="px-2.5 py-1 border border-border bg-background hover:bg-surface-muted hover:border-foreground text-foreground text-[10px] tracking-widest font-semibold transition-colors flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>BACA KILAS</span>
                </button>
              )}
              <Link
                href={`/artikel/${article.slug}`}
                className="px-3 py-1 bg-foreground text-background font-bold text-[10px] tracking-widest hover:opacity-85 transition-opacity flex items-center gap-1"
              >
                <span>BACA LENGKAP</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Classic Modern Grid Mode
  return (
    <article
      className={cn(
        'group flex flex-col justify-between p-6 bg-surface border border-border transition-all duration-200 hover:border-foreground hover:shadow-sm relative',
        className
      )}
    >
      <div className="space-y-4">
        {/* Cover image if enabled and exists */}
        {showImage && article.coverImage && (
          <div className="w-full aspect-[16/9] overflow-hidden border border-border-hairline bg-surface-muted mb-3 relative">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {article.isFeatured && (
              <div className="absolute top-2 left-2 bg-foreground text-background font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold shadow-sm">
                PILIHAN REDAKSI
              </div>
            )}
          </div>
        )}

        {/* Category & Reading Meta */}
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted border-b border-border-hairline pb-2.5">
          <span className="font-semibold text-foreground">
            [{article.category?.name || 'WARTA'}]
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTime} Menit
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/artikel/${article.slug}`} className="block focus:outline-none">
          <h3 className="font-serif text-xl sm:text-2xl font-normal leading-snug tracking-tight text-foreground group-hover:underline group-hover:decoration-1 underline-offset-4 line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        )}
      </div>

      {/* Footer Byline & Quick Action */}
      <div className="pt-4 mt-6 border-t border-border-hairline flex flex-col gap-3">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted">
          <div className="flex items-center gap-1.5 truncate max-w-[70%]">
            <span className="text-foreground/90 font-medium truncate">
              Oleh {article.author?.name || 'Redaksi'}
            </span>
            {article.author?.equippedTitle && (
              <span
                className="px-1 py-0.2 border border-border-hairline bg-surface-muted text-foreground font-bold text-[8.5px] shrink-0"
                title={`Gelar: ${article.author.equippedTitle}`}
              >
                {article.author.equippedTitle}
              </span>
            )}
          </div>
          <span className="text-[10px] shrink-0">{formattedDate}</span>
        </div>

        <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-muted">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {article.viewCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {article.commentCount || 0}
            </span>
          </div>

          {onQuickRead && (
            <button
              type="button"
              onClick={() => onQuickRead(article)}
              className="text-foreground font-semibold hover:underline flex items-center gap-1 uppercase tracking-wider text-[10px]"
            >
              <BookOpen className="w-3 h-3" />
              <span>Baca Kilas &rarr;</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
