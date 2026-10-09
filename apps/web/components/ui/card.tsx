import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border border-border-hairline bg-surface p-4 sm:p-5 md:p-6 rounded-none transition-colors hover:border-foreground relative',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 sm:space-y-2 mb-3 sm:mb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs font-mono uppercase tracking-wider text-muted', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('font-serif text-xs sm:text-sm leading-relaxed text-foreground/80', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between pt-3 sm:pt-4 mt-4 sm:mt-6 border-t border-border-hairline text-xs font-mono uppercase tracking-widest', className)}
      {...props}
    />
  );
}
