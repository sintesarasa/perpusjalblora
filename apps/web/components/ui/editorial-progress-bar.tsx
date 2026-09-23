'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export type ProgressStage = 'idle' | 'compressing' | 'uploading' | 'complete' | 'error';

interface EditorialProgressBarProps {
  stage: ProgressStage;
  percent: number;
  label?: string;
  detail?: string;
  className?: string;
}

export function EditorialProgressBar({
  stage,
  percent,
  label,
  detail,
  className,
}: EditorialProgressBarProps) {
  if (stage === 'idle') return null;

  const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)));

  // Generate ASCII block visual ticker e.g. [████████░░░░░░░░░░] 40%
  const totalBlocks = 16;
  const filledBlocks = Math.round((clampedPercent / 100) * totalBlocks);
  const asciiBar = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return (
    <div
      className={cn(
        'p-3.5 border-2 border-foreground bg-surface font-mono text-xs space-y-2 select-none animate-in fade-in duration-150',
        stage === 'error' && 'border-red-600 bg-red-50 text-red-900',
        stage === 'complete' && 'border-foreground bg-surface-muted/40',
        className
      )}
    >
      {/* 1. Header with stage label and percentage ticker */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-[11px] truncate">
          {stage === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-foreground shrink-0" />}
          {stage === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
          <span className="truncate">{label || 'MEMPROSES CITRA...'}</span>
        </div>

        <div className="font-bold text-foreground text-xs shrink-0 tracking-widest">
          {clampedPercent}%
        </div>
      </div>

      {/* 2. Visual Linear Bar (1px hairline container with smooth solid fill) */}
      <div className="w-full h-2.5 border border-foreground bg-surface p-0.5 overflow-hidden">
        <div
          className={cn(
            'h-full bg-foreground transition-all duration-200 ease-out',
            stage === 'compressing' && 'animate-pulse',
            stage === 'error' && 'bg-red-600'
          )}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      {/* 3. Footer Telemetry & ASCII Ticker */}
      <div className="flex items-center justify-between text-[10px] text-muted pt-0.5">
        <span className="font-mono tracking-tighter hidden sm:inline text-foreground">
          [{asciiBar}]
        </span>

        {detail && <span className="font-mono text-foreground font-semibold">{detail}</span>}
      </div>
    </div>
  );
}
