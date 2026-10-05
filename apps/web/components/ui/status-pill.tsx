import * as React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'available'       // [ ● TERSEDIA (3) ] — Hairline border
  | 'last_copy'       // [ ◐ SISA 1 EKSEMPLAR ] — Border 2px tegas
  | 'borrowed'        // [ ○ SEDANG DIPINJAM ] — Hairline muted
  | 'reference'       // [ ◓ BACA DI TEMPAT ] — Border dashed
  | 'overdue'         // [ ▲ TERLAMBAT 3 HARI ] — Inverse fill pekat
  | 'review'          // [ ◌ MENUNGGU REVIEW ] — Teks muted berbingkai
  | 'published'       // [ ■ TERBIT ] — Badge solid
  | 'draft';          // [ ▫ DRAF ] — Surface muted

interface StatusPillProps {
  status: StatusType;
  label?: string;
  count?: number;
  daysOverdue?: number;
  className?: string;
}

export function StatusPill({ status, label, count, daysOverdue, className }: StatusPillProps) {
  const configs: Record<
    StatusType,
    { symbol: string; text: string; style: string }
  > = {
    available: {
      symbol: '●',
      text: count !== undefined ? `TERSEDIA (${count})` : 'TERSEDIA',
      style: 'border border-border-hairline bg-surface text-foreground',
    },
    last_copy: {
      symbol: '◐',
      text: 'SISA 1 EKSEMPLAR',
      style: 'border-2 border-foreground bg-surface text-foreground font-bold',
    },
    borrowed: {
      symbol: '○',
      text: 'SEDANG DIPINJAM',
      style: 'border border-border-hairline bg-transparent text-muted',
    },
    reference: {
      symbol: '◓',
      text: 'BACA DI TEMPAT',
      style: 'border border-foreground bg-transparent text-foreground border-dashed',
    },
    overdue: {
      symbol: '▲',
      text: daysOverdue !== undefined ? `TERLAMBAT ${daysOverdue} HARI` : 'TERLAMBAT',
      style: 'border border-foreground bg-foreground text-background font-bold',
    },
    review: {
      symbol: '◌',
      text: 'MENUNGGU REVIEW',
      style: 'border border-border bg-surface-muted/60 text-muted font-medium',
    },
    published: {
      symbol: '■',
      text: 'TERBIT',
      style: 'border border-foreground bg-foreground text-background font-bold',
    },
    draft: {
      symbol: '▫',
      text: 'DRAF ARSIP',
      style: 'border border-border-hairline bg-surface-muted text-muted',
    },
  };

  const item = configs[status] || configs.draft;
  const displayText = label || item.text;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded-none select-none transition-colors',
        item.style,
        className
      )}
      role="status"
      aria-label={displayText}
    >
      <span className="text-[9px] leading-none shrink-0" aria-hidden="true">
        {item.symbol}
      </span>
      <span>{displayText}</span>
    </span>
  );
}
