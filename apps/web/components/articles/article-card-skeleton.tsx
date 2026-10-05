'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  EditorialParallelogramWatermark,
  EditorialSkeletonLine,
} from '@/components/ui/editorial-skeleton';

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
          'p-6 bg-surface border-2 border-foreground/30 flex flex-col md:flex-row gap-6 items-start animate-pulse rounded-none relative overflow-hidden',
          className
        )}
      >
        {/* Corner Crop Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-foreground/30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-foreground/30 pointer-events-none" />

        {/* Image skeleton with constructivist watermark */}
        <div className="w-full md:w-56 shrink-0 aspect-[16/10] bg-surface-muted border border-border-hairline relative flex items-center justify-center">
          <EditorialParallelogramWatermark size="sm" />
          <div className="absolute bottom-1.5 left-2 font-mono text-[8px] text-muted tracking-wider">
            [ ARSIP-FOTO ]
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <EditorialSkeletonLine width="w-24" height="h-2.5" />
            <EditorialSkeletonLine width="w-20" height="h-2.5" />
          </div>

          <div className="space-y-2">
            <EditorialSkeletonLine width="w-3/4" height="h-5 sm:h-6" />
            <EditorialSkeletonLine width="w-1/2" height="h-5 sm:h-6" />
          </div>

          <div className="space-y-1.5 pt-1">
            <EditorialSkeletonLine width="w-full" height="h-3" />
            <EditorialSkeletonLine width="w-5/6" height="h-3" />
            <EditorialSkeletonLine width="w-2/3" height="h-3" />
          </div>

          <div className="pt-4 border-t border-border-hairline flex items-center justify-between">
            <EditorialSkeletonLine width="w-32" height="h-3" />
            <EditorialSkeletonLine width="w-24" height="h-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-6 bg-surface border-2 border-foreground/30 flex flex-col justify-between space-y-4 animate-pulse rounded-none relative overflow-hidden',
        className
      )}
    >
      {/* Corner Crop Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-foreground/30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-foreground/30 pointer-events-none" />

      <div className="space-y-4">
        {/* Cover image skeleton */}
        <div className="w-full aspect-[16/9] bg-surface-muted border border-border-hairline relative flex items-center justify-center">
          <EditorialParallelogramWatermark size="sm" />
          <div className="absolute bottom-1.5 left-2 font-mono text-[8px] text-muted tracking-wider">
            [ WARTA-CETAK ]
          </div>
        </div>

        {/* Category & read time */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-2.5">
          <EditorialSkeletonLine width="w-20" height="h-2.5" />
          <EditorialSkeletonLine width="w-16" height="h-2.5" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-2 pt-1">
          <EditorialSkeletonLine width="w-full" height="h-5" />
          <EditorialSkeletonLine width="w-4/5" height="h-5" />
        </div>

        {/* Excerpt skeleton */}
        <div className="space-y-1.5 pt-1">
          <EditorialSkeletonLine width="w-full" height="h-3" />
          <EditorialSkeletonLine width="w-5/6" height="h-3" />
          <EditorialSkeletonLine width="w-3/4" height="h-3" />
        </div>
      </div>

      {/* Footer byline skeleton */}
      <div className="pt-4 border-t border-border-hairline space-y-2">
        <div className="flex items-center justify-between">
          <EditorialSkeletonLine width="w-28" height="h-3" />
          <EditorialSkeletonLine width="w-20" height="h-3" />
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
