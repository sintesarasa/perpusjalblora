'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface PramoedyaQuote {
  id: string;
  source: string;
  year: string;
  text: string;
  context: string;
}

const PRAMOEDYA_QUOTES: PramoedyaQuote[] = [
  {
    id: 'pram-01',
    source: 'Bumi Manusia',
    year: '1980',
    text: 'Seorang terpelajar harus sudah berbuat adil sejak dalam pikiran, apalagi dalam perbuatan.',
    context: 'Wejangan Jean Marais kepada Minke // Tetralogi Buru',
  },
  {
    id: 'pram-02',
    source: 'Anak Semua Bangsa',
    year: '1980',
    text: 'Orang boleh pandai setinggi langit, tapi selama ia tidak menulis, ia akan hilang di dalam masyarakat dan dari sejarah. Menulis adalah bekerja untuk keabadian.',
    context: 'Amanat Nyai Ontosoroh // Nalar & Keberanian Berpikir',
  },
  {
    id: 'pram-03',
    source: 'Bumi Manusia',
    year: '1980',
    text: 'Kalian boleh maju dalam pelajaran, mungkin mencapai deretan gelar, tapi tanpa mencintai sastra, kalian hanya hewan yang pandai.',
    context: 'Catatan Kemanusiaan // Sastra Pembebas Jiwa',
  },
  {
    id: 'pram-04',
    source: 'Jejak Langkah',
    year: '1985',
    text: 'Berterimakasihlah pada segala yang memberi kehidupan. Buku adalah guru yang tidak pernah memukul, menghina, atau berkhianat kepada pembacanya.',
    context: 'Pendidikan Merdeka // Tanah Kelahiran Blora',
  },
];

interface ScrollLitQuoteProps {
  className?: string;
}

type AnimationPhase = 'TYPING' | 'PAUSED' | 'PAGE_TURNING';

export function ScrollLitQuote({ className }: ScrollLitQuoteProps) {
  const containerRef = React.useRef<HTMLElement>(null);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<AnimationPhase>('TYPING');
  const [hasStarted, setHasStarted] = React.useState(false);

  const currentQuote = PRAMOEDYA_QUOTES[activeIdx];
  const fullText = currentQuote.text;

  // Trigger typing when section scrolls into viewport
  React.useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Phase 1: Mechanical Typing Engine (Does not pause on hover)
  React.useEffect(() => {
    if (!hasStarted || phase !== 'TYPING') return;

    let timer: NodeJS.Timeout;

    if (charIndex < fullText.length) {
      const char = fullText[charIndex];
      let delay = 24; // Base speed per character

      // Natural cadence pauses
      if (char === ',') delay = 150;
      else if (char === '.' || char === '!' || char === '?') delay = 320;
      else if (char === ';') delay = 180;
      else if (char === ' ') delay = 36;

      timer = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, delay);
    } else {
      // Completed typing -> Switch to PAUSED phase
      setPhase('PAUSED');
    }

    return () => clearTimeout(timer);
  }, [charIndex, fullText, hasStarted, phase]);

  // Phase 2: Pause Jeda (4.5s) then trigger Phase 3: Page Turn (Does not pause on hover)
  React.useEffect(() => {
    if (phase !== 'PAUSED') return;

    // Wait 4.5 seconds so reader can absorb the complete quote
    const timer = setTimeout(() => {
      setPhase('PAGE_TURNING');
    }, 4500);

    return () => clearTimeout(timer);
  }, [phase]);

  // Phase 3: Page-turn animation -> advance to next quote
  React.useEffect(() => {
    if (phase !== 'PAGE_TURNING') return;

    // Page-turn slide-out duration (480ms)
    const timer = setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % PRAMOEDYA_QUOTES.length);
      setCharIndex(0);
      setPhase('TYPING');
    }, 480);

    return () => clearTimeout(timer);
  }, [phase]);

  // Manual actions
  const handleNextSheet = () => {
    setPhase('PAGE_TURNING');
  };

  const handleSelectQuote = (index: number) => {
    if (index === activeIdx) return;
    setActiveIdx(index);
    setCharIndex(0);
    setPhase('TYPING');
  };

  const handleReplay = () => {
    setCharIndex(0);
    setPhase('TYPING');
  };

  const typedText = fullText.slice(0, charIndex);
  const phantomText = fullText.slice(charIndex);

  return (
    <section
      ref={containerRef}
      className={cn(
        'border-b-2 border-foreground max-w-7xl mx-auto py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none bg-background',
        className
      )}
    >
      <div className="max-w-5xl mx-auto space-y-7 sm:space-y-10">
        {/* Top Header: 100% Consistent Monospace Label + Sheet Ledger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-hairline pb-4 gap-3">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
            [ FALSAFAH MEJA KURASI // INTEGRITAS SUARA ]
          </div>

          {/* Interactive Sheet Switcher & Indicators */}
          <div className="flex items-center gap-2 font-mono text-xs self-start sm:self-auto">
            <span className="text-muted uppercase tracking-wider text-[11px] font-bold mr-1">
              LEMBARAN {activeIdx + 1}/4:
            </span>

            {/* 4 Page / Sheet Selector Tabs */}
            <div className="flex items-center gap-1">
              {PRAMOEDYA_QUOTES.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleSelectQuote(idx)}
                  className={cn(
                    'w-6 h-6 border font-mono text-[10px] font-bold transition-all flex items-center justify-center rounded-none cursor-pointer',
                    idx === activeIdx
                      ? 'bg-foreground text-background border-foreground font-black'
                      : 'bg-surface text-muted border-border-hairline hover:border-foreground hover:text-foreground'
                  )}
                  title={`Buka Lembaran ${idx + 1}: ${q.source}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleReplay}
              title="Ketik Ulang Lembaran Ini"
              className="ml-1 p-1.5 border border-border-hairline hover:border-foreground bg-surface text-foreground transition-colors cursor-pointer rounded-none active:scale-[0.98]"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={handleNextSheet}
              title="Buka Lembaran Berikutnya"
              className="px-2.5 py-1 bg-foreground text-background font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5 cursor-pointer rounded-none active:scale-[0.98]"
            >
              <span>BUKA LEMBARAN</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* The BroadSheet Turning Page Container */}
        <div className="relative min-h-[190px] sm:min-h-[220px] md:min-h-[250px] flex flex-col justify-center">
          <div
            className={cn(
              'transition-all duration-400 ease-out transform',
              phase === 'PAGE_TURNING'
                ? '-translate-x-10 opacity-0 -rotate-1 pointer-events-none'
                : 'translate-x-0 opacity-100 rotate-0'
            )}
          >
            {/* Source Label Stamp */}
            <div className="font-mono text-xs uppercase tracking-wider text-muted font-bold mb-3 sm:mb-4">
              KARYA PRAMOEDYA ANANTA TOER &bull; {currentQuote.source.toUpperCase()} ({currentQuote.year})
            </div>

            {/* Refined High-Contrast Literary Typography (Bold Solid Black, Larger Size) */}
            <blockquote
              className="font-serif italic font-medium sm:font-semibold text-foreground text-left tracking-normal"
              style={{
                fontSize: 'clamp(24px, 4.5vw, 50px)',
                lineHeight: 1.28,
                letterSpacing: '-0.02em',
              }}
            >
              <span className="text-foreground/60 mr-1.5 not-italic font-serif font-bold">&ldquo;</span>
              {/* Active Typed Ink - Deep High-Contrast Solid Black */}
              <span className="text-foreground font-medium sm:font-semibold drop-shadow-[0_0.5px_0_rgba(0,0,0,0.1)] dark:drop-shadow-none">
                {typedText}
              </span>

              {/* Linotype Mechanical Cursor */}
              <span
                className={cn(
                  'inline-block bg-foreground align-baseline ml-1 rounded-none',
                  phase === 'PAUSED' ? 'animate-pulse opacity-60' : 'opacity-100'
                )}
                style={{
                  width: '0.32em',
                  height: '0.86em',
                  verticalAlign: '-0.04em',
                }}
              />

              {/* Faint Phantom Blueprint to prevent Layout Shift */}
              <span aria-hidden="true" className="opacity-[0.06] select-none pointer-events-none">
                {phantomText}
              </span>
              <span className="text-foreground/60 ml-1.5 not-italic font-serif font-bold">&rdquo;</span>
            </blockquote>
          </div>
        </div>

        {/* Reading Progress Indicator (Always runs during PAUSED reading window, never pauses on hover) */}
        <div className="h-[2.5px] w-full bg-border-hairline rounded-none overflow-hidden relative">
          <div
            key={`${activeIdx}-${phase}`}
            className={cn(
              'h-full bg-foreground rounded-none origin-left',
              phase === 'PAUSED'
                ? 'animate-underline-progress duration-[4500ms]'
                : 'w-0'
            )}
            style={{
              animationDuration: phase === 'PAUSED' ? '4500ms' : '0ms',
            }}
          />
        </div>

        {/* Editorial Citation Footer */}
        <div className="pt-4 border-t-2 border-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div>
            <cite className="not-italic font-serif font-bold text-base sm:text-xl text-foreground block tracking-tight">
              Pramoedya Ananta Toer
            </cite>
            <span className="font-serif italic text-xs sm:text-sm text-foreground/85 block mt-0.5">
              &mdash; {currentQuote.context}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted">
            <span className="hidden sm:inline">TANAH KELAHIRAN BLORA // 1925–2006</span>
            <span className="px-2 py-0.5 border border-border-hairline bg-surface text-[10px] font-bold text-foreground">
              {phase === 'TYPING'
                ? 'MENGETIK NASKAH...'
                : phase === 'PAUSED'
                ? 'MEMBACA (JEDA LEMBARAN)'
                : 'MEMBUKA LEMBARAN...'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
