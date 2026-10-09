'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArticleSummary, ArticleCategory } from '@perpusjal/types';
import { ArrowRight, BookOpen } from 'lucide-react';

interface RelatedArticlesProps {
  articles: ArticleSummary[];
  category?: ArticleCategory;
}

export function RelatedArticles({ articles, category }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <aside
      aria-label="Bacaan Terkait"
      className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-16 pt-12 border-t border-border-hairline space-y-6"
    >
      {/* Section Header: Roomy, balanced editorial headline */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-border-hairline gap-3 font-mono text-xs uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-foreground rounded-none" />
          <h3 className="font-bold text-foreground tracking-widest">
            LEMBARAN TERKAIT {category?.name ? `// ${category.name}` : ''}
          </h3>
          <span className="text-muted text-[11px] font-normal">
            ({articles.length.toString().padStart(2, '0')})
          </span>
        </div>

        {category?.slug && (
          <Link
            href={`/artikel?kategori=${category.slug}`}
            className="inline-flex items-center gap-1.5 text-muted hover:text-foreground font-bold tracking-wider text-[11px] transition-colors group cursor-pointer"
          >
            <span>JELAJAHI ARSIP {category.name}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* The Editorial Triad: 3-column clean visual grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-1">
        {articles.map((item) => {
          const formattedDate = item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '';

          return (
            <article key={item.id} className="group flex flex-col justify-between">
              <Link href={`/artikel/${item.slug}`} className="block focus:outline-none space-y-3">
                {/* Visual Thumbnail or Typographic Fallback */}
                <div className="w-full aspect-[16/10] border border-border-hairline bg-surface overflow-hidden relative">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-muted/30 flex flex-col items-center justify-center p-4 text-center group-hover:bg-surface-muted/50 transition-colors">
                      <BookOpen className="w-6 h-6 text-muted/60 mb-2 stroke-[1.5]" />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                        [ PERPUSJAL BLORA ]
                      </span>
                    </div>
                  )}

                  {/* Reading Time Tag */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-background/90 backdrop-blur font-mono text-[9.5px] uppercase font-bold text-foreground border border-border-hairline select-none">
                    {item.readingTime} Mnt Baca
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold block">
                    {item.category?.name || 'WARTA'}
                  </span>

                  <h4 className="font-serif font-bold text-base sm:text-[17px] leading-snug tracking-tight text-foreground group-hover:underline underline-offset-3 decoration-1 line-clamp-2">
                    {item.title}
                  </h4>

                  {(item.subtitle || item.excerpt) && (
                    <p className="font-serif text-xs text-foreground/75 leading-relaxed line-clamp-2 pt-0.5">
                      {item.subtitle || item.excerpt}
                    </p>
                  )}
                </div>
              </Link>

              {/* Byline Footer */}
              <div className="pt-2.5 mt-2.5 border-t border-border-hairline/60 flex items-center justify-between font-mono text-[10.5px] text-muted">
                <span className="truncate max-w-[140px]">
                  Oleh {item.author?.name || 'Warga'}
                </span>
                <span className="text-[10px] shrink-0">{formattedDate}</span>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
