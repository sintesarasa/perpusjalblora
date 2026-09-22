import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'outline' | 'subtle';
}

export function Badge({ className, variant = 'outline', children, ...props }: BadgeProps) {
  const variants = {
    solid: 'bg-foreground text-background border border-foreground',
    outline: 'border border-foreground text-foreground bg-transparent',
    subtle: 'border border-border-hairline text-muted bg-surface-muted',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
