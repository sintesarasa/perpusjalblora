import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border border-border-hairline py-16 px-8 text-center max-w-xl mx-auto bg-surface-muted/40 my-8 rounded-none relative',
        className
      )}
    >
      <div className="font-mono text-[10px] uppercase tracking-ultra text-muted mb-4">
        [ FOLIO KOSONG // LEMBAR BELUM TERISI ]
      </div>
      <h4 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground mb-3">
        {title}
      </h4>
      <p className="font-serif italic text-sm sm:text-base text-muted mb-8 max-w-md mx-auto leading-relaxed">
        "{description}"
      </p>
      {actionLabel && (
        <Button variant="solid" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
