'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, Search, BookOpen } from 'lucide-react';

interface StickyGazetteStreamerProps {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onFocusSearch: () => void;
  className?: string;
}

export function StickyGazetteStreamer({
  totalCount,
  currentPage,
  totalPages,
  onFocusSearch,
  className,
}: StickyGazetteStreamerProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      setProgress(Math.min(100, Math.max(0, currentProgress)));
      setIsVisible(scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={cn(
        'fixed top-14 sm:top-16 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-b-2 border-foreground transition-all duration-300 transform shadow-xs select-none',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none',
        className
      )}
    >
      {/* ── Top Ink Progress Line ── */}
      <div className="w-full h-[2.5px] bg-border-hairline relative overflow-hidden">
        <div
          className="h-full bg-foreground transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Streamer Content Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 sm:h-10 flex items-center justify-between font-mono text-[10px] sm:text-[11px] uppercase tracking-wider">
        {/* Left: Gazette Edition Info */}
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          <span className="w-2 h-2 rounded-full bg-foreground shrink-0 animate-pulse" />
          <span className="font-bold text-foreground truncate">
            [ MIMBAR WARGA // ARSIP TULISAN TROTOAR ]
          </span>
          <span className="text-muted hidden md:inline">&bull;</span>
          <span className="text-muted hidden md:inline">
            {totalCount} Naskah Diterbitkan (Hal. {currentPage}/{totalPages})
          </span>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onFocusSearch}
            className="px-2.5 py-1 border border-foreground/40 bg-background hover:bg-foreground hover:text-background text-foreground transition-colors flex items-center gap-1 font-bold cursor-pointer"
            title="Cari naskah (⌘K)"
          >
            <Search className="w-3 h-3" />
            <span className="hidden sm:inline">Pencarian</span>
            <span className="text-[9px] text-muted">[⌘K]</span>
          </button>

          <button
            type="button"
            onClick={scrollToTop}
            className="px-2.5 py-1 border border-foreground bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1 font-bold cursor-pointer"
            title="Kembali ke atas"
          >
            <ArrowUp className="w-3 h-3" />
            <span>Ke Atas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
