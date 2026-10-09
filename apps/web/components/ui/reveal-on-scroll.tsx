'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Lightweight global scroll direction tracker
let globalScrollDirection: 'down' | 'up' = 'down';
let lastScrollY = 0;
let isScrollListenerBound = false;

function ensureScrollDirectionListener() {
  if (typeof window === 'undefined' || isScrollListenerBound) return;
  isScrollListenerBound = true;
  lastScrollY = window.scrollY;

  window.addEventListener(
    'scroll',
    () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY;
      if (Math.abs(diff) > 2) {
        globalScrollDirection = diff > 0 ? 'down' : 'up';
        lastScrollY = currentY;
      }
    },
    { passive: true }
  );
}

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
  once?: boolean;
  style?: React.CSSProperties;
}

export function RevealOnScroll({
  children,
  className,
  variant = 'cinematic',
  delayMs = 0,
  durationMs = 720,
  threshold = 0.08,
  rootMargin = '0px 0px -30px 0px',
  blur = true,
  once = false,
  style,
}: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [enterDirection, setEnterDirection] = React.useState<'down' | 'up'>('down');
  const hasMountedRef = React.useRef(false);
  const hasEnteredOnce = React.useRef(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    ensureScrollDirectionListener();

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

    let lastStateChangeTime = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const now = Date.now();
        if (entry.isIntersecting) {
          setEnterDirection(globalScrollDirection);
          setIsVisible(true);
          hasMountedRef.current = true;
          lastStateChangeTime = now;
          if (once) {
            observer.disconnect();
          }
        } else if (!once && hasMountedRef.current) {
          // Prevent boundary flutter when user stops scrolling right on the threshold line ("scroll nanggung")
          // Avoid toggling state rapidly within 350ms of entering
          if (now - lastStateChangeTime < 350) return;

          // HYSTERESIS: Only reset/un-reveal if the element has genuinely left the screen with generous buffer
          const rect = entry.boundingClientRect;
          const windowHeight = window.innerHeight || document.documentElement.clientHeight;
          const isFarBelow = rect.top > windowHeight + 80;
          const isFarAbove = rect.bottom < -80;

          if (isFarBelow || isFarAbove) {
            setIsVisible(false);
            hasEnteredOnce.current = true;
            lastStateChangeTime = now;
          }
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
  }, [threshold, rootMargin, once]);

  const getVariantStyles = () => {
    const blurClass = blur
      ? isVisible
        ? 'blur-0'
        : 'blur-[4px]'
      : '';

    const isScrollingUp = enterDirection === 'up';

    switch (variant) {
      case 'cinematic':
        return cn(
          isVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : isScrollingUp
            ? 'opacity-0 -translate-y-7 scale-[0.985]'
            : 'opacity-0 translate-y-7 scale-[0.985]',
          blurClass
        );
      case 'stamp':
        return cn(
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-[1.03] -translate-y-2',
          blur ? (isVisible ? 'blur-0' : 'blur-[2px]') : ''
        );
      case 'slide-left':
        return cn(
          isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-8',
          blurClass
        );
      case 'slide-right':
        return cn(
          isVisible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-8',
          blurClass
        );
      case 'fade-down':
        return cn(
          isVisible
            ? 'opacity-100 translate-y-0'
            : isScrollingUp
            ? 'opacity-0 translate-y-6'
            : 'opacity-0 -translate-y-6',
          blurClass
        );
      case 'fade':
        return cn(
          isVisible ? 'opacity-100' : 'opacity-0',
          blur ? (isVisible ? 'blur-0' : 'blur-[5px]') : ''
        );
      case 'fade-up':
      default:
        return cn(
          isVisible
            ? 'opacity-100 translate-y-0'
            : isScrollingUp
            ? 'opacity-0 -translate-y-6'
            : 'opacity-0 translate-y-6',
          blurClass
        );
    }
  };

  // On re-entry (scrolling back up/down), use a snappy delay so content responds quickly to user scroll
  const effectiveDelay = hasEnteredOnce.current ? Math.min(delayMs, 80) : delayMs;

  return (
    <div
      ref={elementRef}
      style={{
        transitionDuration: `${durationMs}ms`,
        transitionDelay: effectiveDelay > 0 ? `${effectiveDelay}ms` : undefined,
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
