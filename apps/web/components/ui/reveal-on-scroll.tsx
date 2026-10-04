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
  threshold = 0.02,
  rootMargin = '0px 0px 80px 0px',
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
    switch (variant) {
      case 'stamp':
        return isVisible
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-[0.98] translate-y-2';
      case 'slide-left':
        return isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 -translate-x-6';
      case 'slide-right':
        return isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-6';
      case 'fade':
        return isVisible ? 'opacity-100' : 'opacity-0';
      case 'fade-up':
      default:
        return isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4';
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        transitionDuration: '500ms',
        transitionDelay: delayMs > 0 ? `${delayMs}ms` : undefined,
      }}
      className={cn(
        'transition-[opacity,transform] ease-out transform-gpu',
        getVariantStyles(),
        className
      )}
    >
      {children}
    </div>
  );
}
