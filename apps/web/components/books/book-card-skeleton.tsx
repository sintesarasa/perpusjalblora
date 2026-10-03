import * as React from 'react';
import { cn } from '@/lib/utils';

export function BookCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border-2 border-foreground/30 bg-surface flex flex-col justify-between h-[330px] animate-pulse relative overflow-hidden',
        className
      )}
    >
      <div>
        {/* Book Cover Placeholder */}
        <div className="aspect-[4/3] bg-surface-muted/60 border-b border-border-hairline relative">
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/10 to-transparent" />
          <div className="absolute top-2 right-2 h-4 w-16 bg-foreground/15" />
        </div>

        {/* Category & Shelf location */}
        <div className="p-3 pb-0 flex items-center justify-between">
          <div className="h-2.5 w-16 bg-foreground/10" />
          <div className="h-2.5 w-14 bg-foreground/10" />
        </div>

        {/* Title & Author */}
        <div className="p-3 pt-2 space-y-1.5">
          <div className="h-4 w-5/6 bg-foreground/15" />
          <div className="h-3 w-1/2 bg-foreground/10" />
        </div>
      </div>

      {/* Footer Byline */}
      <div className="p-3 pt-2 border-t border-border-hairline flex items-center justify-between bg-surface-muted/20">
        <div className="h-3 w-16 bg-foreground/10" />
        <div className="h-3 w-16 bg-foreground/15" />
      </div>
    </div>
  );
}

export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
