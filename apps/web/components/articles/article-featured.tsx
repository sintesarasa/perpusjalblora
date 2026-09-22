import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary } from '@perpusjal/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ArticleFeaturedProps {
  article: ArticleSummary;
  className?: string;
}

export function ArticleFeatured({ article, className }: ArticleFeaturedProps) {
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
        'border-2 border-foreground bg-surface p-6 sm:p-10 lg:p-12 relative overflow-hidden',
        className
      )}
    >
      {/* Top Gazette Rule */}
      <div className="flex items-center justify-between font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted border-b border-foreground pb-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-foreground" />
          <span className="font-bold text-foreground">TAJUK UTAMA EDISI INI</span>
          <span>//</span>
          <span>{article.category?.name || 'LITERASI'}</span>
        </div>
        <span>{article.readingTime} MENIT BACA</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Headlines & Excerpt */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <Link href={`/artikel/${article.slug}`} className="block group focus:outline-none">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-tight text-foreground group-hover:underline decoration-1 underline-offset-8">
                {article.title}
              </h2>
            </Link>
            {article.subtitle && (
              <p className="font-serif italic text-lg sm:text-xl text-muted font-normal">
                {article.subtitle}
              </p>
            )}
          </div>

          {article.excerpt && (
            <p className="font-serif text-base sm:text-lg text-foreground/85 leading-relaxed first-letter:float-left first-letter:text-5xl first-letter:font-serif first-letter:pr-3.5 first-letter:pt-1 first-letter:font-bold first-letter:text-foreground">
              {article.excerpt}
            </p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border-hairline">
            <div className="font-mono text-xs uppercase tracking-wider text-muted space-y-0.5">
              <p className="text-foreground font-semibold">Oleh {article.author?.name || 'Redaksi Perpusjal'}</p>
              <p className="text-[10px]">{formattedDate}</p>
            </div>

            <Link href={`/artikel/${article.slug}`}>
              <Button variant="solid" size="md">
                Baca Selengkapnya &rarr;
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Cover Image Frame */}
        <div className="lg:col-span-5">
          {article.coverImage ? (
            <div className="border border-foreground p-2 bg-background">
              <div className="aspect-[4/3] overflow-hidden bg-surface-muted relative">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              </div>
              {article.coverCredit && (
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted text-right pt-2">
                  Kredit: {article.coverCredit}
                </p>
              )}
            </div>
          ) : (
            <div className="border border-foreground p-8 bg-surface-muted flex flex-col items-center justify-center text-center space-y-4 min-h-[260px]">
              <span className="font-serif italic text-2xl text-muted">Perpusjal Blora</span>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Ruang Publikasi Swadaya
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
