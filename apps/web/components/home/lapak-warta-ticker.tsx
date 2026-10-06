'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Play, Pause } from 'lucide-react';

export interface TickerItem {
  id: string;
  tag: string;
  content?: string;
  text?: string;
  href?: string | null;
  link?: string | null;
}

const DEFAULT_TICKER_ITEMS: TickerItem[] = [
  {
    id: 't-1',
    tag: 'WARTA LAPAK CFD',
    content: 'Gelaran terpal Minggu pagi di Alun-Alun Blora (06.00 - 09.30 WIB). Buka lapak, gelar bacaan, diskusi terbuka.',
    href: '/kegiatan',
  },
  {
    id: 't-2',
    tag: 'SIRKULASI AMANAH',
    content: 'Sirkulasi 100% tanpa denda uang seumur hidup. Rawat buku seperti merawat martabat sesama kawan.',
    href: '/cara-meminjam',
  },
  {
    id: 't-3',
    tag: 'PUSTAKA PRAMOEDYA',
    content: '“Kalian boleh maju dalam pelajaran, tapi tanpa budi pekerti, kalian hanya pintar menipu sesama.” — Bumi Manusia',
    href: '/buku/bumi-manusia',
  },
  {
    id: 't-4',
    tag: 'WARGA BERKARYA',
    content: 'Rubrik opini & resensi warga terbuka untuk seluruh pembaca. Tulis suaramu di Studio Naskah.',
    href: '/dashboard/tulisan/tulis',
  },
  {
    id: 't-5',
    tag: 'SEJARAH SAMIN',
    content: 'Membaca kearifan Sedulur Sikep Klopoduwur: Kejujuran kata, kesederhanaan laku, kedaulatan tanah adat.',
    href: '/tentang',
  },
];

export function LapakWartaTicker({
  items = DEFAULT_TICKER_ITEMS,
  className,
}: {
  items?: TickerItem[];
  className?: string;
}) {
  const [isPaused, setIsPaused] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta',
        }) + ' WIB'
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Duplicate items for continuous seamless loop marquee
  const loopItems = [...items, ...items];

  return (
    <div
      className={cn(
        'w-full border-y-2 border-foreground bg-background text-foreground font-mono select-none overflow-hidden relative',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-stretch">
        {/* Left Sticky Badge / Header */}
        <div className="shrink-0 bg-foreground text-background px-3 sm:px-4 py-2 flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider z-10 border-r border-foreground">
          <span className="w-2 h-2 bg-background inline-block animate-ping" />
          <span className="hidden md:inline">KRONIK WARTA LAPAK</span>
          <span className="md:hidden">WARTA</span>
          {currentTime && (
            <span className="hidden sm:inline opacity-75 font-normal border-l border-background/40 pl-2 text-[9px]">
              {currentTime}
            </span>
          )}
        </div>

        {/* Marquee Track */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex-1 overflow-hidden relative flex items-center py-2"
        >
          <div
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
            className="flex items-center gap-8 whitespace-nowrap animate-ticker-continuous will-change-transform"
          >
            {loopItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="inline-flex items-center gap-3 text-xs">
                {/* Parallelogram divider icon */}
                <span className="inline-flex items-center text-foreground/40 shrink-0">
                  <svg width="12" height="7" viewBox="0 0 100 55" className="fill-current">
                    <polygon points="30,4 96,4 82,24 16,24" />
                    <polygon points="18,30 84,30 70,50 4,50" />
                  </svg>
                </span>

                <span className="font-bold text-[10px] uppercase tracking-widest text-muted border border-border-hairline px-1.5 py-0.5 bg-surface shrink-0">
                  [{item.tag}]
                </span>

                {(item.href || item.link) ? (
                  <Link
                    href={item.href || item.link || '#'}
                    className="font-serif text-xs sm:text-sm text-foreground hover:underline decoration-1 underline-offset-2 transition-colors cursor-pointer"
                  >
                    {item.content || item.text}
                  </Link>
                ) : (
                  <span className="font-serif text-xs sm:text-sm text-foreground">
                    {item.content || item.text}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Controls */}
        <div className="shrink-0 flex items-center border-l border-foreground bg-surface px-2 sm:px-3 z-10">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 text-muted hover:text-foreground text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 transition-colors"
            title={isPaused ? 'Lanjutkan Warta' : 'Jeda Warta'}
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden lg:inline">PUTAR</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span className="hidden lg:inline">JEDA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
