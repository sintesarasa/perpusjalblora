import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary } from '@perpusjal/types';
import { Eye, MessageSquare, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/user-avatar';

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

  // ── Broadsheet (Newspaper Column / Row) Mode ──
  if (viewMode === 'broadsheet') {
    return (
      <article
        className={cn(
          'group p-6 sm:p-7 bg-surface border-2 border-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.9)] relative flex flex-col md:flex-row gap-6 items-start select-none',
          className
        )}
      >
        {/* Cover Photo only if image exists */}
        {showImage && article.coverImage && (
          <div className="w-full md:w-56 shrink-0 aspect-[16/10] overflow-hidden border-2 border-foreground bg-zinc-950 relative shadow-2xs">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-500"
              loading="lazy"
            />
            {article.isFeatured && (
              <div className="absolute top-2 left-2 bg-foreground text-background font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 font-bold border border-background shadow-xs">
                ★ PILIHAN
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between h-full space-y-4 w-full min-w-0">
          <div className="space-y-3">
            {/* Top Bar: Category & Duration (Single Occurrence) */}
            <div className="flex flex-wrap items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted border-b border-border-hairline pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground bg-surface-muted px-2 py-0.5 border border-foreground/30">
                  [{article.category?.name || 'WARTA'}]
                </span>
                {article.isFeatured && (
                  <span className="px-1.5 py-0.5 bg-foreground text-background font-bold text-[8.5px] tracking-wider">
                    TAJUK PILIHAN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Clock className="w-3 h-3 text-foreground" />
                  {article.readingTime} Menit Baca
                </span>
              </div>
            </div>

            {/* Title */}
            <Link href={`/artikel/${article.slug}`} className="block focus:outline-none">
              <h3 className="font-serif text-2xl sm:text-3xl font-black leading-snug tracking-tight text-foreground group-hover:underline decoration-2 underline-offset-4">
                {article.title}
              </h3>
            </Link>

            {/* Clean Author Byline */}
            <div className="flex items-center gap-2.5 py-0.5 flex-wrap">
              <UserAvatar
                src={article.author?.avatarUrl}
                name={article.author?.name || 'Redaksi'}
                username={article.author?.username}
                size="xs"
                shape="square"
                className="border border-foreground shrink-0 shadow-2xs"
              />
              <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                <span className="text-foreground font-bold">
                  {article.author?.name || 'Warga Perpusjal'}
                </span>
                {article.author?.username && (
                  <span className="text-muted text-[11px]">@{article.author.username}</span>
                )}
                {article.author?.equippedTitle && (
                  <span className="font-mono text-[8.5px] uppercase px-1.5 py-0.5 border border-foreground/40 bg-surface-muted text-foreground font-semibold">
                    {article.author.equippedTitle}
                  </span>
                )}
                <span className="text-muted">&bull;</span>
                <span className="text-muted text-[11px]">{formattedDate}</span>
              </div>
            </div>

            {/* Excerpt (Single Occurrence) */}
            {(article.subtitle || article.excerpt) && (
              <p className="font-serif text-sm text-foreground/80 leading-relaxed line-clamp-3">
                {article.subtitle || article.excerpt}
              </p>
            )}
          </div>

          {/* Bottom Metrik & Actions */}
          <div className="pt-3 border-t border-border-hairline flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px]">
                <Eye className="w-3.5 h-3.5 text-foreground" /> {article.viewCount || 0}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-[10px]">
                <MessageSquare className="w-3.5 h-3.5 text-foreground" /> {article.commentCount || 0}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {onQuickRead && (
                <button
                  type="button"
                  onClick={() => onQuickRead(article)}
                  className="px-3 py-1.5 border-2 border-foreground bg-surface hover:bg-foreground hover:text-background text-foreground text-[10px] tracking-widest font-bold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>BACA KILAS</span>
                </button>
              )}
              <Link
                href={`/artikel/${article.slug}`}
                className="px-3.5 py-1.5 bg-foreground text-background font-bold text-[10px] tracking-widest hover:bg-foreground/90 transition-opacity flex items-center gap-1 shadow-2xs cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
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

  // ── Classic Modern Grid Mode (Clean, Spacious & Dignified) ──
  return (
    <article
      className={cn(
        'group flex flex-col justify-between p-6 bg-surface border-2 border-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.9)] relative select-none',
        className
      )}
    >
      <div className="space-y-4">
        {/* Cover Photo: ONLY rendered if image actually exists */}
        {showImage && article.coverImage && (
          <div className="w-full aspect-[16/10] overflow-hidden border-2 border-foreground bg-zinc-950 mb-2 relative shadow-2xs">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-500"
              loading="lazy"
            />
            {article.isFeatured && (
              <div className="absolute top-2 left-2 bg-foreground text-background font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 font-bold border border-background shadow-xs">
                ★ PILIHAN
              </div>
            )}
          </div>
        )}

        {/* Category & Reading Time (Single Clean Bar) */}
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted border-b border-border-hairline pb-2.5">
          <span className="font-bold text-foreground bg-surface-muted px-2 py-0.5 border border-foreground/30">
            [{article.category?.name || 'WARTA'}]
          </span>
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Clock className="w-3 h-3 text-foreground" />
            {article.readingTime} Menit Baca
          </span>
        </div>

        {/* Title */}
        <Link href={`/artikel/${article.slug}`} className="block focus:outline-none">
          <h3 className="font-serif text-xl sm:text-2xl font-black leading-snug tracking-tight text-foreground group-hover:underline underline-offset-4 decoration-2 line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {/* Clean Author Byline (No blue badges, no noisy dropdowns) */}
        <div className="flex items-center gap-2.5 py-1">
          <UserAvatar
            src={article.author?.avatarUrl}
            name={article.author?.name || 'Redaksi'}
            username={article.author?.username}
            size="xs"
            shape="square"
            className="border border-foreground shrink-0 shadow-2xs"
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-foreground truncate">
                Oleh {article.author?.name || 'Warga Perpusjal'}
              </span>
              {article.author?.equippedTitle && (
                <span className="font-mono text-[8.5px] uppercase px-1.5 py-0.2 border border-foreground/40 bg-surface-muted text-foreground font-semibold">
                  {article.author.equippedTitle}
                </span>
              )}
            </div>
            <div className="font-mono text-[10px] text-muted flex items-center gap-2">
              <span>@{article.author?.username || 'redaksi'}</span>
              <span>&bull;</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Excerpt (Single Clean Paragraph) */}
        {(article.subtitle || article.excerpt) && (
          <p className="font-serif text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2 pt-2 border-t border-border-hairline">
            {article.subtitle || article.excerpt}
          </p>
        )}
      </div>

      {/* Footer Metrik & Quick Read Action */}
      <div className="pt-3.5 mt-5 border-t-2 border-foreground flex items-center justify-between font-mono text-[10px] text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-foreground font-semibold">
            <Eye className="w-3 h-3" /> {article.viewCount || 0}
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-foreground font-semibold">
            <MessageSquare className="w-3 h-3" /> {article.commentCount || 0}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onQuickRead && (
            <button
              type="button"
              onClick={() => onQuickRead(article)}
              className="text-foreground font-bold hover:underline flex items-center gap-1 uppercase tracking-wider text-[10px] cursor-pointer"
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
