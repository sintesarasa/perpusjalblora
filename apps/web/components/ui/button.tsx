import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'solid',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono uppercase tracking-widest text-[11px] font-semibold transition-colors duration-150 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground disabled:opacity-40 disabled:pointer-events-none select-none';

    const variants = {
      solid:
        'bg-foreground text-background border border-foreground hover:bg-background hover:text-foreground',
      outline:
        'bg-transparent text-foreground border border-foreground hover:bg-foreground hover:text-background',
      ghost:
        'bg-transparent text-foreground hover:bg-surface-muted border border-transparent',
      danger:
        'bg-transparent text-foreground border-2 border-foreground hover:bg-foreground hover:text-background',
    };

    const sizes = {
      sm: 'h-8 px-3.5 text-[10px]',
      md: 'h-10 px-5 text-[11px]',
      lg: 'h-12 px-7 text-xs',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-current animate-ping" />
            <span>MEMUAT...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
