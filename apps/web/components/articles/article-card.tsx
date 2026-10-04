import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary } from '@perpusjal/types';
import { Eye, MessageSquare, Clock, ArrowRight, BookOpen, Quote, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserHonorBadge } from '@/components/gamification/user-honor-badge';
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

  // ── Render Universal Cover Frame (Photo or Broadsheet Typographic Fallback) ──
  const renderCoverFrame = (aspect = 'aspect-[16/10]') => {
    if (!showImage) return null;

    if (article.coverImage) {
      return (
        <div className={cn('w-full overflow-hidden border-2 border-foreground bg-zinc-950 relative shadow-2xs group-hover:border-foreground', aspect)}>
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
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-foreground/80 text-background font-mono text-[8px] uppercase tracking-widest font-bold">
            FOTO WARGA
          </div>
        </div>
      );
    }

    // Broadsheet Typographic Artwork Fallback (when no coverImage is set)
    return (
      <div className={cn('w-full overflow-hidden border-2 border-foreground bg-surface-muted/70 relative p-3 flex flex-col justify-between shadow-2xs select-none', aspect)}>
        <div className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-widest text-muted border-b border-border-hairline pb-1.5">
          <span className="font-bold text-foreground truncate max-w-[140px]">
            {article.category?.name || 'WARTA WARGA'}
          </span>
          <span className="shrink-0">PERPUSJAL</span>
        </div>

        <div className="py-2 text-center space-y-1 my-auto">
          <Quote className="w-5 h-5 mx-auto text-foreground/30" />
          <p className="font-serif italic text-xs sm:text-sm text-foreground/85 line-clamp-2 leading-snug px-1">
            &ldquo;{article.excerpt || article.subtitle || article.title}&rdquo;
          </p>
        </div>

        <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-widest pt-1.5 border-t border-border-hairline text-muted">
          <span className="font-bold text-foreground">✦ NASKAH WARGA ✦</span>
          <span>{article.readingTime} Mnt Baca</span>
        </div>
      </div>
    );
  };

  // ── Broadsheet (Newspaper Horizontal Row) Mode ──
  if (viewMode === 'broadsheet') {
    return (
      <article
        className={cn(
          'group p-5 sm:p-7 bg-surface border-2 border-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.9)] relative flex flex-col md:flex-row gap-6 items-start select-none',
          className
        )}
      >
        {/* Cover Image or Broadsheet Fallback Frame */}
        <div className="w-full md:w-56 shrink-0">
          {renderCoverFrame('aspect-[16/10]')}
        </div>

        <div className="flex-1 flex flex-col justify-between h-full space-y-4 w-full min-w-0">
          <div className="space-y-3">
            {/* Top Gazette Status Bar */}
            <div className="flex flex-wrap items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted border-b border-border-hairline pb-2">
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

            {/* PROMINENT AUTHOR BYLINE BAR */}
            <div className="flex items-center gap-2.5 pt-1 pb-1 flex-wrap">
              <UserAvatar
                src={article.author?.avatarUrl}
                name={article.author?.name || 'Redaksi'}
                username={article.author?.username}
                size="xs"
                shape="square"
                className="border border-foreground shrink-0 shadow-2xs"
              />
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-muted">Ditulis oleh:</span>
                <span className="font-bold text-foreground hover:underline">
                  {article.author?.name || 'Warga Perpusjal'}
                </span>
                {article.author?.username && (
                  <span className="text-muted text-[11px]">(@{article.author.username})</span>
                )}
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
            </div>

            {/* Subtitle or Excerpt */}
            {(article.subtitle || article.excerpt) && (
              <p className="font-serif text-sm sm:text-base text-foreground/80 leading-relaxed line-clamp-3 pt-1">
                {article.subtitle || article.excerpt}
              </p>
            )}
          </div>

          {/* Bottom Metrik & Actions */}
          <div className="pt-3.5 border-t border-border-hairline flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-muted">
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

  // ── Classic Modern Grid Mode (Universal Cover Frame + Clear Author Byline) ──
  return (
    <article
      className={cn(
        'group flex flex-col justify-between p-5 sm:p-6 bg-surface border-2 border-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.9)] relative select-none',
        className
      )}
    >
      <div className="space-y-3.5">
        {/* Universal Cover Frame: Always Rendered! */}
        {renderCoverFrame('aspect-[16/10]')}

        {/* Category & Reading Time */}
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted border-b border-border-hairline pb-2">
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

        {/* PROMINENT AUTHOR BYLINE BAR */}
        <div className="flex items-center gap-2.5 pt-0.5 pb-1">
          <UserAvatar
            src={article.author?.avatarUrl}
            name={article.author?.name || 'Redaksi'}
            username={article.author?.username}
            size="xs"
            shape="square"
            className="border border-foreground shrink-0 shadow-2xs"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[11px] font-bold text-foreground truncate">
                Oleh {article.author?.name || 'Warga Perpusjal'}
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
            <div className="font-mono text-[9.5px] text-muted flex items-center gap-2">
              <span>@{article.author?.username || 'redaksi'}</span>
              <span>&bull;</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Excerpt / Subtitle */}
        {(article.subtitle || article.excerpt) && (
          <p className="font-serif text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2 pt-1 border-t border-dashed border-border-hairline">
            {article.subtitle || article.excerpt}
          </p>
        )}
      </div>

      {/* Footer Metrik & Quick Read Action */}
      <div className="pt-3 mt-4 border-t-2 border-foreground flex items-center justify-between font-mono text-[10px] text-muted">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-foreground">
            <Eye className="w-3 h-3" /> {article.viewCount || 0}
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-foreground">
            <MessageSquare className="w-3 h-3" /> {article.commentCount || 0}
          </span>
        </div>

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
    </article>
  );
}
