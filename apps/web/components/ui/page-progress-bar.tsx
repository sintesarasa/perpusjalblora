'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PageProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [animating, setAnimating] = React.useState(false);

  React.useEffect(() => {
    // When path or params change, trigger a brief hairline flash
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!animating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none overflow-hidden">
      <div className="h-full bg-foreground animate-[progressBeam_0.4s_ease-out_forwards]" />
      <style>
        {`
          @keyframes progressBeam {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </div>
  );
}
