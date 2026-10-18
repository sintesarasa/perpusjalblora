'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function ScrollProgress({ className }: { className?: string }) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalScroll = window.scrollY || document.documentElement.scrollTop;
          const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          if (windowHeight > 0) {
            setProgress((totalScroll / windowHeight) * 100);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={cn(
        'pointer-events-none overflow-hidden z-50',
        className ? className : 'absolute bottom-0 left-0 right-0 h-[2px] bg-transparent'
      )}
    >
      <div
        className="h-full bg-foreground transition-all duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
