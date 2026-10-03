import * as React from 'react';
import { cn } from '@/lib/utils';

interface ArticleCardSkeletonProps {
  viewMode?: 'grid' | 'broadsheet';
  className?: string;
}

export function ArticleCardSkeleton({
  viewMode = 'grid',
  className,
}: ArticleCardSkeletonProps) {
  if (viewMode === 'broadsheet') {
    return (
      <div
        className={cn(
          'p-6 bg-surface border border-border flex flex-col md:flex-row gap-6 items-start animate-pulse',
          className
        )}
      >
        {/* Image skeleton */}
        <div className="w-full md:w-56 shrink-0 aspect-[16/10] bg-surface-muted border border-border-hairline" />

        {/* Content skeleton */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <div className="h-3 w-24 bg-foreground/10 rounded-none" />
            <div className="h-3 w-20 bg-foreground/10 rounded-none" />
          </div>

          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-foreground/15 rounded-none" />
            <div className="h-6 w-1/2 bg-foreground/15 rounded-none" />
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full bg-foreground/10 rounded-none" />
            <div className="h-3 w-5/6 bg-foreground/10 rounded-none" />
            <div className="h-3 w-2/3 bg-foreground/10 rounded-none" />
          </div>

          <div className="pt-4 border-t border-border-hairline flex items-center justify-between">
            <div className="h-3 w-32 bg-foreground/10 rounded-none" />
            <div className="h-7 w-28 bg-foreground/10 rounded-none" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-6 bg-surface border border-border flex flex-col justify-between space-y-4 animate-pulse',
        className
      )}
    >
      <div className="space-y-4">
        {/* Cover image skeleton */}
        <div className="w-full aspect-[16/9] bg-surface-muted border border-border-hairline" />

        {/* Category & read time */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-2.5">
          <div className="h-3 w-20 bg-foreground/10 rounded-none" />
          <div className="h-3 w-16 bg-foreground/10 rounded-none" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-2 pt-1">
          <div className="h-5 w-full bg-foreground/15 rounded-none" />
          <div className="h-5 w-4/5 bg-foreground/15 rounded-none" />
        </div>

        {/* Excerpt skeleton */}
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-full bg-foreground/10 rounded-none" />
          <div className="h-3 w-5/6 bg-foreground/10 rounded-none" />
          <div className="h-3 w-3/4 bg-foreground/10 rounded-none" />
        </div>
      </div>

      {/* Footer byline skeleton */}
      <div className="pt-4 border-t border-border-hairline space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-28 bg-foreground/10 rounded-none" />
          <div className="h-3 w-20 bg-foreground/10 rounded-none" />
        </div>
      </div>
    </div>
  );
}

export function ArticleGridSkeleton({
  count = 6,
  viewMode = 'grid',
}: {
  count?: number;
  viewMode?: 'grid' | 'broadsheet';
}) {
  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-6'
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
