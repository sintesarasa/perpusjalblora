'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Perpusjal Constructivist Parallelogram Logo Watermark
 * Geometric twin slanted parallelograms based on the official brand identity.
 */
export function EditorialParallelogramWatermark({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeMap = {
    sm: { width: 32, height: 18 },
    md: { width: 56, height: 32 },
    lg: { width: 96, height: 54 },
    xl: { width: 140, height: 78 },
  };

  const { width, height } = sizeMap[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 55"
      className={cn('text-foreground/15 overflow-visible select-none pointer-events-none', className)}
      aria-hidden="true"
    >
      {/* Top Slanted Parallelogram */}
      <polygon points="30,4 96,4 82,24 16,24" fill="currentColor" />
      {/* Bottom Slanted Parallelogram */}
      <polygon points="18,30 84,30 70,50 4,50" fill="currentColor" />
    </svg>
  );
}

/**
 * Editorial Skeleton Text Line
 * Mimics printed letterpress typography with variable widths and newsprint pulse.
 */
export function EditorialSkeletonLine({
  width = 'w-full',
  height = 'h-3.5',
  className,
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-foreground/10 rounded-none relative overflow-hidden',
        width,
        height,
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
    </div>
  );
}

/**
 * Editorial Skeleton Block
 * Newspaper wireframe container with hairline borders, corner crop marks, and halftone feel.
 */
export function EditorialSkeletonBlock({
  className,
  children,
  showWatermark = true,
}: {
  className?: string;
  children?: React.ReactNode;
  showWatermark?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative bg-surface border border-border-hairline p-5 rounded-none overflow-hidden animate-pulse',
        className
      )}
    >
      {/* Editorial Corner Crop Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-foreground/30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-foreground/30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-foreground/30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-foreground/30 pointer-events-none" />

      {/* Background Watermark */}
      {showWatermark && (
        <div className="absolute right-3 bottom-3 opacity-20 pointer-events-none">
          <EditorialParallelogramWatermark size="lg" />
        </div>
      )}

      {children}
    </div>
  );
}

/**
 * Editorial Newspaper Broadsheet Skeleton
 * Full newsprint skeleton with masthead ledger, headline, drop cap, and editorial columns.
 */
export function EditorialNewspaperSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('border-2 border-foreground bg-surface p-6 sm:p-8 space-y-6 rounded-none', className)}>
      {/* Masthead Ledger Placeholder */}
      <div className="flex items-center justify-between border-b-2 border-foreground pb-3 font-mono text-[10px] uppercase tracking-widest text-muted">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-foreground/40 rounded-none animate-ping" />
          <EditorialSkeletonLine width="w-32" height="h-2.5" />
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <EditorialSkeletonLine width="w-24" height="h-2.5" />
          <EditorialSkeletonLine width="w-28" height="h-2.5" />
        </div>
        <EditorialSkeletonLine width="w-20" height="h-2.5" />
      </div>

      {/* Main Headline Block */}
      <div className="space-y-3 py-2">
        <EditorialSkeletonLine width="w-3/4" height="h-8 sm:h-10" />
        <EditorialSkeletonLine width="w-1/2" height="h-6 sm:h-8" />
        <div className="pt-2 flex items-center gap-4">
          <EditorialSkeletonLine width="w-24" height="h-3" />
          <EditorialSkeletonLine width="w-16" height="h-3" />
          <EditorialSkeletonLine width="w-20" height="h-3" />
        </div>
      </div>

      {/* Three Column Broadsheet Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-border-hairline">
        {/* Column 1: Feature with Image Placeholder */}
        <div className="md:col-span-5 space-y-3">
          <div className="w-full aspect-[16/10] bg-surface-muted/60 border border-border-hairline relative flex items-center justify-center">
            <EditorialParallelogramWatermark size="md" />
            <div className="absolute bottom-2 left-2 right-2 flex justify-between font-mono text-[8px] text-muted">
              <span>[ MEMUAT REPRODUKSI ARSIP ]</span>
              <span>pj-img-loading</span>
            </div>
          </div>
          <div className="space-y-2">
            <EditorialSkeletonLine width="w-full" height="h-3" />
            <EditorialSkeletonLine width="w-5/6" height="h-3" />
            <EditorialSkeletonLine width="w-4/6" height="h-3" />
          </div>
        </div>

        {/* Column 2: Lead Paragraph with Drop-Cap Wireframe */}
        <div className="md:col-span-4 space-y-3 border-t md:border-t-0 md:border-l border-border-hairline pt-4 md:pt-0 md:pl-6">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 border border-foreground/30 bg-surface-muted/80 flex items-center justify-center font-serif text-xl font-bold text-foreground/40 shrink-0">
              P
            </div>
            <div className="flex-1 space-y-2">
              <EditorialSkeletonLine width="w-full" height="h-3" />
              <EditorialSkeletonLine width="w-full" height="h-3" />
            </div>
          </div>
          <div className="space-y-2 pt-1">
            <EditorialSkeletonLine width="w-full" height="h-3" />
            <EditorialSkeletonLine width="w-11/12" height="h-3" />
            <EditorialSkeletonLine width="w-5/6" height="h-3" />
            <EditorialSkeletonLine width="w-full" height="h-3" />
            <EditorialSkeletonLine width="w-3/4" height="h-3" />
          </div>
        </div>

        {/* Column 3: Marginalia / Side Dispatches */}
        <div className="md:col-span-3 space-y-4 border-t md:border-t-0 md:border-l border-border-hairline pt-4 md:pt-0 md:pl-6">
          <div className="border border-border-hairline p-3 bg-surface-muted/30 space-y-2">
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted">
              [ WARTA SINGKAT ]
            </div>
            <EditorialSkeletonLine width="w-full" height="h-3" />
            <EditorialSkeletonLine width="w-4/5" height="h-3" />
          </div>
          <div className="space-y-2">
            <EditorialSkeletonLine width="w-full" height="h-2.5" />
            <EditorialSkeletonLine width="w-3/4" height="h-2.5" />
            <EditorialSkeletonLine width="w-5/6" height="h-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Editorial Page Skeleton
 * Comprehensive full-page loading fallback for Next.js App Router Suspense.
 */
export function EditorialPageSkeleton({
  title = 'MEMBUKA LEMBARAN ARSIP PERPUSJAL',
}: {
  title?: string;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Banner Notice */}
      <div className="flex items-center justify-between border-b-2 border-foreground pb-4 font-mono text-[11px] uppercase tracking-widest text-muted">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <span className="w-2 h-2 bg-foreground rounded-none animate-ping" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>MEMUAT DARI MEJA KURATOR</span>
          <span className="animate-pulse">■</span>
        </div>
      </div>

      {/* Main Newspaper Skeleton */}
      <EditorialNewspaperSkeleton />
    </div>
  );
}
