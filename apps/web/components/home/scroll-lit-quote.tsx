'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_QUOTE =
  'Kata yang lahir dari kejujuran batin tak butuh singgasana; gemetar suaramu lebih abadi daripada deretan gelar yang membisu. Tuliskanlah apa yang kau rasa dan kau saksikan, sebab sejarah tak pernah dirawat oleh mereka yang bungkam, melainkan oleh jiwa-jiwa merdeka yang berani bersuara.';

interface ScrollLitQuoteProps {
  text?: string;
  author?: string;
  tagline?: string;
  className?: string;
}

export function ScrollLitQuote({
  text = DEFAULT_QUOTE,
  author = 'Perpustakaan Jalanan Blora',
  tagline = 'Membaca dan Berbahagia.',
  className,
}: ScrollLitQuoteProps) {
  const containerRef = React.useRef<HTMLElement>(null);
  const [progress, setProgress] = React.useState(0);

  // Split text into words
  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const totalWords = words.length;

  React.useEffect(() => {
    let ticking = false;

    const clamp = (val: number, min: number, max: number) =>
      Math.min(Math.max(val, min), max);

    const updateProgress = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const innerHeight = window.innerHeight;

      // Formula: q = clamp((innerHeight * 0.85 - rect.top) / (rect.height + innerHeight * 0.35), 0, 1)
      const rawQ =
        (innerHeight * 0.85 - rect.top) /
        (rect.height + innerHeight * 0.35);
      const q = clamp(rawQ, 0, 1);

      setProgress(q);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    updateProgress();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={cn(
        'border-b-2 border-foreground max-w-7xl mx-auto py-20 sm:py-28 md:py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none',
        className
      )}
    >
      <div className="max-w-5xl mx-auto">
        {/* Editorial Top Ledger */}
        <div className="flex items-center gap-2 mb-8 sm:mb-12 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-muted">
          <span className="w-2 h-2 bg-foreground rounded-none" />
          <span>[ FALSAFAH MEJA KURASI // INTEGRITAS SUARA ]</span>
        </div>

        {/* The Scroll-Lit Quote Blockquote */}
        <blockquote
          className="font-serif font-semibold text-foreground text-left"
          style={{
            fontSize: 'clamp(26px, 5.4vw, 70px)',
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
          }}
        >
          {words.map((word, i) => {
            // Formula: kata ke-i menyala bila i / jumlahKata < q * 1.05
            const isLit = i / totalWords < progress * 1.05;

            return (
              <React.Fragment key={`${word}-${i}`}>
                <span
                  style={{
                    opacity: isLit ? 1 : 0.14,
                    transition: 'opacity 0.25s ease',
                  }}
                  className="inline-block"
                >
                  {word}
                </span>
                {i < totalWords - 1 ? ' ' : ''}
              </React.Fragment>
            );
          })}
        </blockquote>

        {/* Editorial Citation & Attribution: Perpustakaan Jalanan Blora */}
        <div
          className="mt-10 sm:mt-14 pt-6 border-t-2 border-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono"
          style={{
            opacity: progress > 0.8 ? 1 : Math.max(0.2, 0.2 + progress * 0.8),
            transition: 'opacity 0.3s ease',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-foreground rounded-none shrink-0" />
            <div>
              <cite className="not-italic font-serif font-bold text-base sm:text-xl text-foreground block tracking-tight">
                {author}
              </cite>
              <span className="font-serif italic text-xs sm:text-sm text-foreground/80 block mt-0.5">
                &mdash; {tagline}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-widest text-muted">
            <span className="w-1.5 h-1.5 bg-foreground/50 rounded-none" />
            <span>[ RUANG BACA RAKYAT // BLORA ]</span>
          </div>
        </div>
      </div>
    </section>
  );
}
