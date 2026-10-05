'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  EditorialParallelogramWatermark,
  EditorialSkeletonLine,
} from '@/components/ui/editorial-skeleton';

export function BookCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border-2 border-foreground/40 bg-surface flex flex-col justify-between h-[360px] animate-pulse relative overflow-hidden rounded-none',
        className
      )}
    >
      {/* Corner Crop Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-foreground/40 pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-foreground/40 pointer-events-none z-10" />

      <div>
        {/* Book Cover Wireframe (2:3 Aspect ratio standard) */}
        <div className="aspect-[4/3] bg-surface-muted/70 border-b border-border-hairline relative flex items-center justify-center overflow-hidden">
          {/* Subtle Book Spine Fold Indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-foreground/5 border-r border-border-hairline" />

          {/* Constructivist Parallelogram Watermark */}
          <div className="opacity-25 transition-opacity">
            <EditorialParallelogramWatermark size="sm" />
          </div>

          {/* Top Stamp Placeholder */}
          <div className="absolute top-2 right-2 border border-border-hairline bg-surface px-1.5 py-0.5 font-mono text-[8px] text-muted tracking-wider">
            [ PJ-SCAN ]
          </div>
        </div>

        {/* Shelf & Category Metadata Row */}
        <div className="p-3 pb-0 flex items-center justify-between border-b border-border-hairline/60 pb-2">
          <EditorialSkeletonLine width="w-20" height="h-2.5" />
          <EditorialSkeletonLine width="w-14" height="h-2.5" />
        </div>

        {/* Book Title & Author Lines */}
        <div className="p-3 pt-2.5 space-y-2">
          <EditorialSkeletonLine width="w-5/6" height="h-4" />
          <EditorialSkeletonLine width="w-3/5" height="h-3" />
          <div className="pt-1">
            <EditorialSkeletonLine width="w-1/2" height="h-2.5" />
          </div>
        </div>
      </div>

      {/* Footer Circulation Ledger Row */}
      <div className="p-3 pt-2 border-t border-border-hairline flex items-center justify-between bg-surface-muted/40 font-mono text-[9px]">
        <EditorialSkeletonLine width="w-16" height="h-3" />
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-foreground/30 inline-block" />
          <EditorialSkeletonLine width="w-12" height="h-3" />
        </div>
      </div>
    </div>
  );
}

export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
