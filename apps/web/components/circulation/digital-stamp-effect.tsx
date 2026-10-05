'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type StampVariant =
  | 'TERSEDIA'
  | 'DIPINJAM'
  | 'JATUH_TEMPO'
  | 'KEMBALI_LENGKAP'
  | 'BACA_DI_TEMPAT';

interface DigitalStampEffectProps {
  variant?: StampVariant;
  date?: string;
  customText?: string;
  className?: string;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rotation?: number; // e.g. -3, 2, -5
}

const STAMP_CONFIG: Record<
  StampVariant,
  {
    symbol: string;
    label: string;
    sublabel: string;
    borderStyle: string;
    dashStyle?: string;
  }
> = {
  TERSEDIA: {
    symbol: '●',
    label: 'TERSEDIA DI LAPAK',
    sublabel: 'SIAP DIBACA & DIPINJAM',
    borderStyle: 'border-2 border-foreground',
  },
  DIPINJAM: {
    symbol: '○',
    label: 'SEDANG DIBACA',
    sublabel: 'SIRKULASI AKTIF WARGA',
    borderStyle: 'border border-foreground',
  },
  JATUH_TEMPO: {
    symbol: '▲',
    label: 'JATUH TEMPO',
    sublabel: 'BAWA KE LAPAK MINGGU INI',
    borderStyle: 'border-2 border-foreground bg-foreground text-background',
  },
  KEMBALI_LENGKAP: {
    symbol: '■',
    label: 'KEMBALI LENGKAP',
    sublabel: 'TERIMA KASIH MERAWAT BUKU',
    borderStyle: 'border-2 border-foreground',
  },
  BACA_DI_TEMPAT: {
    symbol: '◓',
    label: 'BACA DI TEMPAT',
    sublabel: 'KOLEKSI KHUSUS TERPAL',
    borderStyle: 'border-2 border-dashed border-foreground',
  },
};

export function DigitalStampEffect({
  variant = 'TERSEDIA',
  date,
  customText,
  className,
  interactive = true,
  size = 'md',
  rotation = -3,
}: DigitalStampEffectProps) {
  const [isStamping, setIsStamping] = React.useState(false);
  const [impactCount, setImpactCount] = React.useState(0);

  const config = STAMP_CONFIG[variant];
  const displayDate = date || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleStampTrigger = () => {
    if (!interactive) return;
    setIsStamping(true);
    setImpactCount((c) => c + 1);
    setTimeout(() => {
      setIsStamping(false);
    }, 450);
  };

  const sizeClasses = {
    sm: 'p-2 text-[8px] max-w-[160px]',
    md: 'p-3 text-[10px] max-w-[210px]',
    lg: 'p-4 text-xs max-w-[260px]',
  };

  return (
    <div
      onClick={handleStampTrigger}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
      className={cn(
        'relative inline-block select-none transition-transform font-mono uppercase tracking-widest',
        interactive && 'cursor-pointer hover:scale-105 active:scale-95',
        className
      )}
      title={interactive ? 'Klik untuk cap ulang stempel sirkulasi' : undefined}
    >
      {/* Outer Slanted Frame inspired by Perpusjal Logo Parallelogram */}
      <div
        className={cn(
          'relative bg-surface/90 text-foreground overflow-hidden rounded-none',
          config.borderStyle,
          sizeClasses[size],
          isStamping && 'animate-[stampImpact_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]'
        )}
      >
        {/* Parallelogram Graphic Corner Seals */}
        <div className="flex items-center justify-between border-b border-current pb-1 mb-1.5 opacity-80 text-[7px] sm:text-[8px] tracking-widest">
          <span className="flex items-center gap-1 font-bold">
            <svg width="14" height="8" viewBox="0 0 100 55" className="fill-current inline-block">
              <polygon points="30,4 96,4 82,24 16,24" />
              <polygon points="18,30 84,30 70,50 4,50" />
            </svg>
            PERPUSJAL
          </span>
          <span className="font-bold tracking-tighter">BLORA // ARSIP</span>
        </div>

        {/* Core Stamp Body */}
        <div className="text-center py-1 space-y-0.5">
          <div className="flex items-center justify-center gap-1.5 font-bold tracking-wider">
            <span className="text-xs leading-none">{config.symbol}</span>
            <span className="font-black text-[11px] sm:text-xs">
              {customText || config.label}
            </span>
          </div>

          <div className="text-[8px] sm:text-[9px] opacity-85 tracking-wider font-semibold">
            {config.sublabel}
          </div>
        </div>

        {/* Date Ledger Bottom Strip */}
        <div className="border-t border-current pt-1 mt-1.5 flex items-center justify-between text-[7.5px] sm:text-[8.5px] opacity-80">
          <span className="font-mono">TGL: {displayDate}</span>
          <span className="font-mono font-bold">#CAP-{impactCount > 0 ? `${impactCount}`.padStart(2, '0') : '01'}</span>
        </div>

        {/* Distressed Ink Hairline Halo */}
        <div className="absolute inset-0.5 border border-current opacity-25 pointer-events-none" />
      </div>
    </div>
  );
}
