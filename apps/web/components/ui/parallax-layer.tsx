'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface MaskedRevealProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  as?: React.ElementType;
}

/**
 * Masked Text Reveal (Inspired by Awwwards Site of the Day: Sobha Privy Collection)
 * Clips text within an overflow-hidden wrapper, sliding it up from translateY(100%)
 * when the element intersects the viewport.
 */
export function MaskedReveal({
  children,
  delayMs = 0,
  className,
  as: Component = 'div',
}: MaskedRevealProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const elementRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={elementRef as unknown as React.RefObject<HTMLDivElement>}
      className={cn('overflow-hidden', className)}
    >
      <div
        style={{
          transitionDelay: `${delayMs}ms`,
        }}
        className={cn(
          'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
          isVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0'
        )}
      >
        {children}
      </div>
    </Component>
  );
}

interface ParallaxItemProps {
  children: React.ReactNode;
  speed?: number; // e.g. -0.1 (slower) or 0.15 (faster)
  className?: string;
}

/**
 * Parallax Item: translates vertically based on scroll progress relative to viewport
 */
export function ParallaxItem({ children, speed = 0.1, className }: ParallaxItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = React.useState(0);

  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!ref.current) {
            ticking = false;
            return;
          }
          const rect = ref.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          // Calculate distance from center of viewport
          const distanceFromCenter = (rect.top + rect.height / 2) - windowHeight / 2;
          const calculatedOffset = distanceFromCenter * speed;
          setOffsetY(calculatedOffset);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      style={{
        transform: `translate3d(0, ${offsetY}px, 0)`,
        willChange: 'transform',
      }}
      className={className}
    >
      {children}
    </div>
  );
}

interface ScrollScaleProps {
  children: React.ReactNode;
  className?: string;
  minScale?: number;
  maxScale?: number;
}

/**
 * ScrollScale: scales the element smoothly as it moves through the viewport
 */
export function ScrollScale({
  children,
  className,
  minScale = 0.95,
  maxScale = 1.03,
}: ScrollScaleProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(minScale);

  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!ref.current) {
            ticking = false;
            return;
          }
          const rect = ref.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          // 0 when at bottom, 1 when at center
          const progress = Math.min(1, Math.max(0, 1 - Math.abs(rect.top - windowHeight / 2) / (windowHeight / 1.2)));
          const currentScale = minScale + (maxScale - minScale) * progress;
          setScale(currentScale);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [minScale, maxScale]);

  return (
    <div
      ref={ref}
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
      }}
      className={className}
    >
      {children}
    </div>
  );
}
