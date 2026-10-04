'use client';

import * as React from 'react';
import Lenis from 'lenis';

interface SmoothScrollProps {
  children: React.ReactNode;
}

/**
 * High-performance inertia smooth scroll provider (Lenis Engine)
 * Replicates the fluid, luxurious gliding scroll found on Awwwards Site-of-the-Day projects.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  React.useEffect(() => {
    // Respect user's motion preferences
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
      infinite: false,
    });

    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    // Synchronize window scroll events for third-party scroll listeners
    lenis.on('scroll', () => {
      window.dispatchEvent(new Event('scroll'));
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
