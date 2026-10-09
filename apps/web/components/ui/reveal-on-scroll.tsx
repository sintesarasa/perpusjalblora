'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type RevealVariant =
  | 'cinematic'
  | 'fade-up'
  | 'fade-down'
  | 'stamp'
  | 'slide-left'
  | 'slide-right'
  | 'fade';

export interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delayMs?: number;
  durationMs?: number;
  threshold?: number;
  rootMargin?: string;
  blur?: boolean;
  style?: React.CSSProperties;
}

export function RevealOnScroll({
  children,
  className,
  variant = 'cinematic',
  delayMs = 0,
  durationMs = 850,
  threshold = 0.08,
  rootMargin = '0px 0px -40px 0px',
  blur = true,
  style,
}: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // If IntersectionObserver is not supported (SSR/older environments)
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    // Respect user's motion preferences across all devices
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Fire once and cleanly unbind
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold, rootMargin]);

  const getVariantStyles = () => {
    const blurClass = blur
      ? isVisible
        ? 'blur-0'
        : 'blur-[5px]'
      : '';

    switch (variant) {
      case 'cinematic':
        return cn(
          isVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-12 scale-[0.97]',
          blurClass
        );
      case 'stamp':
        return cn(
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-[1.04] -translate-y-2',
          blur ? (isVisible ? 'blur-0' : 'blur-[2px]') : ''
        );
      case 'slide-left':
        return cn(
          isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-10',
          blurClass
        );
      case 'slide-right':
        return cn(
          isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-10',
          blurClass
        );
      case 'fade-down':
        return cn(
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-8',
          blurClass
        );
      case 'fade':
        return cn(
          isVisible ? 'opacity-100' : 'opacity-0',
          blur ? (isVisible ? 'blur-0' : 'blur-[6px]') : ''
        );
      case 'fade-up':
      default:
        return cn(
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8',
          blurClass
        );
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        transitionDuration: `${durationMs}ms`,
        transitionDelay: delayMs > 0 ? `${delayMs}ms` : undefined,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
      className={cn(
        'transition-[opacity,transform,filter] transform-gpu will-change-[opacity,transform]',
        getVariantStyles(),
        className
      )}
    >
      {children}
    </div>
  );
}
