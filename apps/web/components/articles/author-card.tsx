import * as React from 'react';
import Link from 'next/link';
import { ArticleAuthor } from '@perpusjal/types';
import { cn } from '@/lib/utils';

interface AuthorCardProps {
  author: ArticleAuthor;
  className?: string;
}

export function AuthorCard({ author, className }: AuthorCardProps) {
  const initials = author.name
    ? author.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'PJ';

  return (
    <div
      className={cn(
        'border-y border-border-hairline py-6 my-8 flex flex-col sm:flex-row items-start sm:items-center gap-5',
        className
      )}
    >
      {/* Avatar or Monogram Frame */}
      <div className="w-14 h-14 shrink-0 border border-foreground/30 bg-surface-muted flex items-center justify-center overflow-hidden">
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.name}
            className="w-full h-full object-cover grayscale contrast-105"
          />
        ) : (
          <span className="font-mono font-bold text-base tracking-wider text-foreground">
            {initials}
          </span>
        )}
      </div>

      {/* Author Metadata */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold">
            KOLOFON PENULIS
          </span>
          <span className="text-muted/60 text-[10px]">&bull;</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            @{author.username}
          </span>
        </div>
        <h4 className="font-serif text-lg sm:text-xl font-normal text-foreground">
          {author.name}
        </h4>
        {author.bio ? (
          <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed max-w-xl">
            {author.bio}
          </p>
        ) : (
          <p className="font-sans text-xs text-muted leading-relaxed">
            Kontributor warta &amp; pegiat literasi di Perpustakaan Jalanan Blora.
          </p>
        )}
      </div>
    </div>
  );
}
