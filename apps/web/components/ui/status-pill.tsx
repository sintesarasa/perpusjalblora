import * as React from 'react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'available'
  | 'borrowed'
  | 'reference'
  | 'draft'
  | 'review'
  | 'published'
  | 'overdue';

interface StatusPillProps {
  status: StatusType;
  label?: string;
  count?: number;
  className?: string;
}

export function StatusPill({ status, label, count, className }: StatusPillProps) {
  const configs: Record<
    StatusType,
    { symbol: string; text: string; style: string }
  > = {
    available: {
      symbol: '●',
      text: count !== undefined ? `TERSEDIA (${count})` : 'TERSEDIA',
      style: 'border border-foreground bg-foreground text-background',
    },
    borrowed: {
      symbol: '○',
      text: 'DIPINJAM',
      style: 'border border-border-hairline bg-transparent text-muted line-through decoration-1',
    },
    reference: {
      symbol: '◓',
      text: 'BACA DI TEMPAT',
      style: 'border border-foreground bg-transparent text-foreground border-dashed',
    },
    draft: {
      symbol: '▫',
      text: 'DRAF',
      style: 'border border-border-hairline bg-surface-muted text-muted',
    },
    review: {
      symbol: '◐',
      text: 'DALAM KURASI',
      style: 'border border-foreground bg-transparent text-foreground font-bold',
    },
    published: {
      symbol: '■',
      text: 'TERBIT',
      style: 'border border-foreground bg-foreground text-background',
    },
    overdue: {
      symbol: '▲',
      text: 'TERLAMBAT',
      style: 'border-2 border-foreground bg-background text-foreground font-bold underline',
    },
  };

  const item = configs[status] || configs.draft;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded-none select-none',
        item.style,
        className
      )}
    >
      <span className="text-[9px] leading-none">{item.symbol}</span>
      <span>{label || item.text}</span>
    </span>
  );
}
