'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Feather } from 'lucide-react';

interface ScrollRotatingSealProps {
  className?: string;
  size?: number;
}

export function ScrollRotatingSeal({ className, size = 110 }: ScrollRotatingSealProps) {
  const [rotation, setRotation] = React.useState(0);
  const rafId = React.useRef<number | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY || 0;
        setRotation(scrollY * 0.2); // Smooth subtle rotation speed
        rafId.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center select-none pointer-events-none',
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Outer Rotating SVG Seal */}
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full text-foreground transition-transform duration-75 ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <defs>
          <path
            id="sealCirclePath"
            d="M 60, 60 m -44, 0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0"
          />
        </defs>

        {/* Outer Circular Gazette Border */}
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Circular Curved Typewriter Text */}
        <text className="font-mono text-[8.5px] uppercase font-bold tracking-[0.22em] fill-current">
          <textPath href="#sealCirclePath" startOffset="0%">
            ✦ PERPUSJAL BLORA ✦ EDISI TERPAL ✦ 2026 ✦
          </textPath>
        </text>
      </svg>

      {/* Static Inner Hub with Feather Icon */}
      <div className="absolute inset-0 m-auto w-10 h-10 rounded-full border-2 border-foreground bg-surface flex items-center justify-center shadow-xs">
        <Feather className="w-4 h-4 text-foreground" />
      </div>
    </div>
  );
}
