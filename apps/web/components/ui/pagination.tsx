import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  createPageUrl: (page: number) => string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  createPageUrl,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Generate visible page numbers
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return (
    <nav
      aria-label="Paginasi Arsip"
      className={cn('flex flex-wrap items-center justify-center gap-1.5 font-mono text-xs select-none', className)}
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="h-9 px-3.5 border border-foreground inline-flex items-center justify-center hover:bg-foreground hover:text-background transition-colors uppercase tracking-wider"
        >
          &larr; Sebelumnya
        </Link>
      ) : (
        <span className="h-9 px-3.5 border border-border text-muted inline-flex items-center justify-center opacity-40 cursor-not-allowed uppercase tracking-wider">
          &larr; Sebelumnya
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-muted">
                ...
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <Link
              key={`page-${p}`}
              href={createPageUrl(p)}
              className={cn(
                'w-9 h-9 border inline-flex items-center justify-center transition-colors font-medium',
                isActive
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-surface text-foreground border-border hover:border-foreground'
              )}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="h-9 px-3.5 border border-foreground inline-flex items-center justify-center hover:bg-foreground hover:text-background transition-colors uppercase tracking-wider"
        >
          Selanjutnya &rarr;
        </Link>
      ) : (
        <span className="h-9 px-3.5 border border-border text-muted inline-flex items-center justify-center opacity-40 cursor-not-allowed uppercase tracking-wider">
          Selanjutnya &rarr;
        </span>
      )}
    </nav>
  );
}
