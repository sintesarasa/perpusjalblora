'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/logo';

interface CustomLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function CustomLoader({
  className,
  size = 'md',
  label = 'MEMBUKA LEMBARAN ARSIP...',
}: CustomLoaderProps) {
  const sizeMap = {
    sm: 'h-6 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-16 w-auto',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 py-8 select-none', className)}>
      {/* Animated Graphic Symbol inspired by the double slanted parallelogram */}
      <div className="relative flex items-center justify-center">
        {/* Kinetic Logo Icon with editorial scanning beam */}
        <div className="relative overflow-hidden p-2">
          <LogoIcon className={cn('transition-all', sizeMap[size])} />
          {/* Subtle horizontal scanning slit effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-background/80 to-transparent animate-[shimmer_1.8s_infinite] pointer-events-none"
            style={{ animation: 'pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          />
        </div>
      </div>

      {/* Editorial Tabular Ticker Label */}
      {label && (
        <div className="flex items-center space-x-2 font-mono text-[10px] uppercase tracking-ultra text-muted">
          <span className="inline-block w-1.5 h-1.5 bg-foreground animate-ping" />
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <CustomLoader size="lg" label="PERPUSJAL BLORA // MEMUAT LEMBARAN..." />
    </div>
  );
}
