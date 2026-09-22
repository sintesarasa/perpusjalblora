import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, rightElement, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="font-mono text-[10px] tracking-wider uppercase text-foreground/80 font-semibold select-none"
            >
              {label}
            </label>
            {hint && (
              <span className="font-mono text-[10px] text-muted tracking-tight">
                {hint}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              'w-full h-11 px-3.5 bg-transparent border text-sm text-foreground placeholder:text-muted/60',
              'font-sans transition-colors rounded-none focus:outline-none focus:ring-1 focus:ring-foreground',
              error
                ? 'border-foreground font-medium'
                : 'border-border hover:border-foreground/60',
              rightElement ? 'pr-11' : '',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="font-mono text-[10px] text-foreground tracking-tight flex items-center gap-1.5 pt-0.5">
            <span className="inline-block w-1 h-1 bg-foreground" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
