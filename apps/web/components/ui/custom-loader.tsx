'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CustomLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function CustomLoader({
  className,
  size = 'md',
  label = 'PERPUSJAL BLORA // MEMBUKA LEMBARAN ARSIP...',
}: CustomLoaderProps) {
  const sizeConfig = {
    sm: { width: 48, height: 26, stroke: 1, text: 'text-[9px]' },
    md: { width: 80, height: 44, stroke: 1.5, text: 'text-[10px]' },
    lg: { width: 120, height: 66, stroke: 2, text: 'text-xs' },
  };

  const currentSize = sizeConfig[size];

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 py-8 select-none', className)}>
      {/* KINETIC CONSTRUCTIVIST PARALLELOGRAM LOADER */}
      <div className="relative flex items-center justify-center p-3">
        <svg
          width={currentSize.width}
          height={currentSize.height}
          viewBox="0 0 100 55"
          className="overflow-visible text-foreground"
          aria-label="Memuat data..."
        >
          <style>
            {`
              @keyframes slideTopParallelogram {
                0% {
                  transform: translateX(0px);
                  opacity: 1;
                }
                50% {
                  transform: translateX(-16px);
                  opacity: 0.6;
                }
                100% {
                  transform: translateX(0px);
                  opacity: 1;
                }
              }

              @keyframes slideBottomParallelogram {
                0% {
                  transform: translateX(0px);
                  opacity: 1;
                }
                50% {
                  transform: translateX(16px);
                  opacity: 0.6;
                }
                100% {
                  transform: translateX(0px);
                  opacity: 1;
                }
              }

              @keyframes scanLaser {
                0% {
                  transform: translateY(-2px);
                  opacity: 0;
                }
                20% {
                  opacity: 0.8;
                }
                80% {
                  opacity: 0.8;
                }
                100% {
                  transform: translateY(56px);
                  opacity: 0;
                }
              }

              .animate-top-slab {
                animation: slideTopParallelogram 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
              }

              .animate-bottom-slab {
                animation: slideBottomParallelogram 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
              }

              .animate-scan-line {
                animation: scanLaser 1.8s linear infinite;
              }
            `}
          </style>

          {/* Top Slanted Parallelogram */}
          <polygon
            points="30,4 96,4 82,24 16,24"
            fill="currentColor"
            className="animate-top-slab origin-center"
          />

          {/* Bottom Slanted Parallelogram */}
          <polygon
            points="18,30 84,30 70,50 4,50"
            fill="currentColor"
            className="animate-bottom-slab origin-center"
          />

          {/* Hairline Scan Beam */}
          <line
            x1="0"
            y1="0"
            x2="100"
            y2="0"
            stroke="currentColor"
            strokeWidth="1"
            className="animate-scan-line opacity-75"
          />
        </svg>

        {/* Subtle Outer Frame Accent */}
        <div className="absolute inset-0 border border-border-hairline pointer-events-none scale-110 opacity-30" />
      </div>

      {/* Editorial Gazette Ticker Label */}
      {label && (
        <div className={cn('flex items-center space-x-2 font-mono uppercase tracking-ultra text-muted', currentSize.text)}>
          <span className="inline-block w-1.5 h-1.5 bg-foreground animate-ping" />
          <span>{label}</span>
          <span className="animate-pulse">■</span>
        </div>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in-50 duration-200">
      <div className="border border-foreground bg-surface p-8 max-w-sm text-center shadow-2xl">
        <CustomLoader size="lg" label="PERPUSJAL // MEMBUKA LEMBARAN..." />
        <p className="font-mono text-[10px] text-muted tracking-widest mt-2 uppercase">
          PERPUSTAKAAN JALANAN BLORA
        </p>
      </div>
    </div>
  );
}
