import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary } from '@perpusjal/types';
import { Eye, MessageSquare, Clock, ArrowRight, BookOpen, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserHonorBadge } from '@/components/gamification/user-honor-badge';

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
          'group p-6 sm:p-7 bg-surface border-2 border-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.9)] relative flex flex-col md:flex-row gap-6 items-start select-none',
          className
        )}
      >
        {/* Cover Image in broadsheet mode */}
        {showImage && article.coverImage && (
          <div className="w-full md:w-60 shrink-0 aspect-[16/10] overflow-hidden border-2 border-foreground bg-zinc-950 relative shadow-2xs">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-500"
              loading="lazy"
            />
            {article.isFeatured && (
              <div className="absolute top-2 left-2 bg-foreground text-background font-mono text-[8.5px] uppercase tracking-widest px-2 py-0.5 font-bold border border-background shadow-xs">
                ★ PILIHAN KURATOR
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between h-full space-y-4 w-full">
          <div className="space-y-3">
            {/* Category, Date & Read Time */}
            <div className="flex flex-wrap items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted border-b border-border-hairline pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground bg-surface-muted px-2 py-0.5 border border-foreground/30">
                  [{article.category?.name || 'WARTA & ESAI'}]
                </span>
                {article.isFeatured && (
                  <span className="px-1.5 py-0.5 bg-foreground text-background font-bold text-[9px] tracking-wider">
                    TAJUK PILIHAN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-foreground" />
                  {article.readingTime} Menit
                </span>
                <span>&bull;</span>
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Title */}
            <Link href={`/artikel/${article.slug}`} className="block focus:outline-none">
              <h3 className="font-serif text-2xl sm:text-3xl font-black leading-snug tracking-tight text-foreground group-hover:underline underline-offset-4 decoration-2">
                {article.title}
              </h3>
            </Link>

            {/* Subtitle or Excerpt */}
            {(article.subtitle || article.excerpt) && (
              <p className="font-serif text-sm sm:text-base text-foreground/80 leading-relaxed line-clamp-3">
                {article.subtitle || article.excerpt}
              </p>
            )}
          </div>

          {/* Bottom Byline & Action */}
          <div className="pt-4 border-t border-border-hairline flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-muted">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-foreground font-bold">
                Oleh {article.author?.name || 'Redaksi'}
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
              <span className="text-border-hairline">|</span>
              <span className="flex items-center gap-1 text-[10px]">
                <Eye className="w-3 h-3" /> {article.viewCount || 0}
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <MessageSquare className="w-3 h-3" /> {article.commentCount || 0}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {onQuickRead && (
                <button
                  type="button"
                  onClick={() => onQuickRead(article)}
                  className="px-3 py-1.5 border-2 border-foreground bg-surface hover:bg-foreground hover:text-background text-foreground text-[10px] tracking-widest font-bold transition-colors flex items-center gap-1 shadow-2xs active:translate-x-0.5 active:translate-y-0.5"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>BACA KILAS</span>
                </button>
              )}
              <Link
                href={`/artikel/${article.slug}`}
                className="px-3.5 py-1.5 bg-foreground text-background font-bold text-[10px] tracking-widest hover:bg-foreground/90 transition-opacity flex items-center gap-1 shadow-2xs active:translate-x-0.5 active:translate-y-0.5"
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

  // Classic Modern Grid Mode (Enhanced with Tactile Broadsheet Details)
  return (
    <article
      className={cn(
        'group flex flex-col justify-between p-5 sm:p-6 bg-surface border-2 border-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.9)] relative select-none',
        className
      )}
    >
      <div className="space-y-4">
        {/* Cover image if enabled and exists */}
        {showImage && article.coverImage && (
          <div className="w-full aspect-[16/10] overflow-hidden border-2 border-foreground bg-zinc-950 mb-3 relative shadow-2xs">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-500"
              loading="lazy"
            />
            {article.isFeatured && (
              <div className="absolute top-2 left-2 bg-foreground text-background font-mono text-[8.5px] uppercase tracking-widest px-2 py-0.5 font-bold border border-background shadow-xs">
                ★ PILIHAN KURATOR
              </div>
            )}
          </div>
        )}

        {/* Category & Reading Meta */}
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted border-b border-border-hairline pb-2.5">
          <span className="font-bold text-foreground bg-surface-muted px-2 py-0.5 border border-foreground/30">
            [{article.category?.name || 'WARTA'}]
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Clock className="w-3 h-3 text-foreground" />
              {article.readingTime} Menit
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/artikel/${article.slug}`} className="block focus:outline-none">
          <h3 className="font-serif text-xl sm:text-2xl font-black leading-snug tracking-tight text-foreground group-hover:underline underline-offset-4 decoration-2 line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt / Subtitle */}
        {(article.subtitle || article.excerpt) && (
          <p className="font-serif text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-3">
            {article.subtitle || article.excerpt}
          </p>
        )}
      </div>

      {/* Footer Byline & Quick Action */}
      <div className="pt-4 mt-6 border-t border-border-hairline flex flex-col gap-3">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted">
          <div className="flex items-center gap-1.5 truncate max-w-[75%]">
            <span className="text-foreground font-bold truncate">
              Oleh {article.author?.name || 'Redaksi'}
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
          <span className="text-[10px] shrink-0 font-medium">{formattedDate}</span>
        </div>

        <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-muted border-t border-dashed border-border-hairline">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {article.viewCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {article.commentCount || 0}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onQuickRead && (
              <button
                type="button"
                onClick={() => onQuickRead(article)}
                className="text-foreground font-bold hover:underline flex items-center gap-1 uppercase tracking-wider text-[10px] transition-colors"
              >
                <BookOpen className="w-3 h-3" />
                <span>Baca Kilas &rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
