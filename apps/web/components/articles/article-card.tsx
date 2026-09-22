import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary } from '@perpusjal/types';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  article: ArticleSummary;
  className?: string;
  showImage?: boolean;
}

export function ArticleCard({
  article,
  className,
  showImage = true,
}: ArticleCardProps) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <article
      className={cn(
        'group flex flex-col justify-between p-6 bg-surface border border-border transition-colors hover:border-foreground relative',
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
              className="w-full h-full object-cover grayscale transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        )}

        {/* Category & Reading Meta */}
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted border-b border-border-hairline pb-2.5">
          <span className="font-semibold text-foreground">
            [{article.category?.name || 'WARTA'}]
          </span>
          <span>{article.readingTime} Menit Baca</span>
        </div>

        {/* Title */}
        <Link href={`/artikel/${article.slug}`} className="block focus:outline-none">
          <h3 className="font-serif text-xl sm:text-2xl font-normal leading-snug tracking-tight text-foreground group-hover:underline group-hover:decoration-1 underline-offset-4">
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

      {/* Footer Byline */}
      <div className="pt-5 mt-6 border-t border-border-hairline flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted">
        <span className="text-foreground/90 font-medium truncate max-w-[60%]">
          Oleh {article.author?.name || 'Redaksi'}
        </span>
        <span className="text-[10px] shrink-0">{formattedDate}</span>
      </div>
    </article>
  );
}
