'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade-up' | 'stamp' | 'slide-left' | 'slide-right' | 'fade';
  delayMs?: number;
  threshold?: number;
  rootMargin?: string;
}

export function RevealOnScroll({
  children,
  className,
  variant = 'fade-up',
  delayMs = 0,
  threshold = 0.1,
  rootMargin = '0px 0px -25px 0px',
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
          observer.disconnect(); // Fire once
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
    switch (variant) {
      case 'stamp':
        return isVisible
          ? 'opacity-100 scale-100 blur-0 translate-y-0'
          : 'opacity-0 scale-[1.02] sm:scale-105 blur-[1px] translate-y-2';
      case 'slide-left':
        return isVisible
          ? 'opacity-100 translate-x-0 translate-y-0'
          : 'opacity-0 -translate-x-3 sm:-translate-x-8 md:-translate-x-12 translate-y-2 sm:translate-y-0';
      case 'slide-right':
        return isVisible
          ? 'opacity-100 translate-x-0 translate-y-0'
          : 'opacity-0 translate-x-3 sm:translate-x-8 md:translate-x-12 translate-y-2 sm:translate-y-0';
      case 'fade':
        return isVisible ? 'opacity-100' : 'opacity-0';
      case 'fade-up':
      default:
        return isVisible
          ? 'opacity-100 translate-y-0 blur-0'
          : 'opacity-0 translate-y-4 sm:translate-y-8 blur-[0.5px]';
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        transitionDuration: '700ms',
        transitionDelay: `${delayMs}ms`,
      }}
      className={cn(
        'transition-all ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
        getVariantStyles(),
        className
      )}
    >
      {children}
    </div>
  );
}
