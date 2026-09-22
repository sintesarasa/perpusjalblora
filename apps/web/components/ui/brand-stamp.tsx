import * as React from 'react';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/logo';

interface BrandStampProps {
  className?: string;
  edition?: string;
  year?: string;
}

export function BrandStamp({
  className,
  edition = 'EDISI NO. 03',
  year = '2026',
}: BrandStampProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 border border-foreground px-3 py-1.5 bg-surface font-mono select-none',
        className
      )}
    >
      <LogoIcon className="h-4 w-auto text-foreground" />
      <div className="flex flex-col text-[9px] leading-tight uppercase tracking-wider text-muted">
        <span className="font-bold text-foreground">{edition}</span>
        <span>BLORA // {year}</span>
      </div>
    </div>
  );
}
