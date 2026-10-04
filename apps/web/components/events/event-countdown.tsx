'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Clock, Calendar, Sparkles, MapPin } from 'lucide-react';

interface EventCountdownProps {
  targetDate?: Date | string | null;
  endDate?: Date | string | null;
  title?: string;
  locationName?: string;
  className?: string;
  variant?: 'card' | 'embedded';
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
  isPast: boolean;
  totalMs: number;
}

/**
 * Calculates the next upcoming Sunday Lapak CFD session (06:00 - 09:00 WIB)
 */
export function getNextSundayLapakSession(): { startAt: Date; endAt: Date } {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday
  let daysUntilSunday = (7 - day) % 7;

  // If today is Sunday but past 09:00 WIB, advance to next Sunday
  if (day === 0 && now.getHours() >= 9) {
    daysUntilSunday = 7;
  }

  const startAt = new Date(now);
  startAt.setDate(now.getDate() + daysUntilSunday);
  startAt.setHours(6, 0, 0, 0);

  const endAt = new Date(startAt);
  endAt.setHours(9, 0, 0, 0);

  return { startAt, endAt };
}

export function EventCountdown({
  targetDate,
  endDate,
  title,
  locationName,
  className,
  variant = 'card',
}: EventCountdownProps) {
  const [mounted, setMounted] = React.useState(false);

  // Compute actual start and end dates
  const { actualStart, actualEnd, isRecurringSunday } = React.useMemo(() => {
    if (targetDate) {
      const start = new Date(targetDate);
      const end = endDate ? new Date(endDate) : new Date(start.getTime() + 3 * 60 * 60 * 1000);
      return { actualStart: start, actualEnd: end, isRecurringSunday: false };
    }
    const session = getNextSundayLapakSession();
    return { actualStart: session.startAt, actualEnd: session.endAt, isRecurringSunday: true };
  }, [targetDate, endDate]);

  const calculateTime = React.useCallback((): TimeRemaining => {
    const now = new Date().getTime();
    const startTime = actualStart.getTime();
    const endTime = actualEnd.getTime();

    // Check if event is currently happening right now
    if (now >= startTime && now <= endTime) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isLive: true,
        isPast: false,
        totalMs: 0,
      };
    }

    const difference = startTime - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isLive: false,
        isPast: true,
        totalMs: 0,
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      isLive: false,
      isPast: false,
      totalMs: difference,
    };
  }, [actualStart, actualEnd]);

  const [time, setTime] = React.useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
    isPast: false,
    totalMs: 0,
  });

  React.useEffect(() => {
    setMounted(true);
    setTime(calculateTime());

    const timer = setInterval(() => {
      setTime(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTime]);

  const formatUnit = (val: number) => String(val).padStart(2, '0');

  // SSR skeleton render to prevent layout shift
  if (!mounted) {
    if (variant === 'embedded') {
      return (
        <div className={cn('p-3 sm:p-3.5 border border-border-hairline bg-surface-muted/50 rounded-xs', className)}>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground font-bold">
            <Clock className="w-3.5 h-3.5 animate-pulse text-foreground" />
            <span>MEMUAT HITUNG MUNDUR...</span>
          </div>
        </div>
      );
    }
    return (
      <div className={cn('bg-surface text-foreground p-6 border-2 border-foreground rounded-xs', className)}>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>MEMUAT PENGHITUNG WAKTU...</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // EMBEDDED VARIANT (for seamless integration)
  // ==========================================
  if (variant === 'embedded') {
    if (time.isLive) {
      return (
        <div className={cn('p-3 sm:p-3.5 bg-emerald-500/10 border-2 border-emerald-500/70 rounded-xs flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-300 font-mono select-none', className)}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>SESI SEDANG BERLANGSUNG DI ALUN-ALUN SAAT INI</span>
          </div>
          <span className="text-[11px] font-semibold hidden sm:inline text-muted">Merapat Langsung &bull; Gratis</span>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'p-3 sm:p-3.5 bg-surface-muted/60 border border-border-hairline rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none transition-colors hover:border-foreground/30',
          className
        )}
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-foreground tracking-wider">
            <Clock className="w-3.5 h-3.5 text-foreground shrink-0" />
            <span>[ ⏳ WAKTU TERSISA MENUJU TERPAL ]</span>
          </div>
          <p className="font-serif italic text-xs text-muted leading-tight">
            {isRecurringSunday ? 'Hitung mundur otomatis ke sesi Minggu pagi terdekat.' : 'Persiapkan kehadiranmu di atas terpal.'}
          </p>
        </div>

        {/* 4 Digit Boxes */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 shrink-0 select-none">
          <div className="bg-surface border border-foreground/30 px-2 sm:px-2.5 py-1 text-center rounded-xs min-w-[44px] sm:min-w-[50px] shadow-2xs">
            <span className="font-mono font-black text-lg sm:text-xl text-foreground block leading-tight">
              {formatUnit(time.days)}
            </span>
            <span className="font-mono text-[7px] sm:text-[7.5px] uppercase tracking-widest text-muted block font-bold mt-0.5">
              HARI
            </span>
          </div>

          <div className="bg-surface border border-foreground/30 px-2 sm:px-2.5 py-1 text-center rounded-xs min-w-[44px] sm:min-w-[50px] shadow-2xs">
            <span className="font-mono font-black text-lg sm:text-xl text-foreground block leading-tight">
              {formatUnit(time.hours)}
            </span>
            <span className="font-mono text-[7px] sm:text-[7.5px] uppercase tracking-widest text-muted block font-bold mt-0.5">
              JAM
            </span>
          </div>

          <div className="bg-surface border border-foreground/30 px-2 sm:px-2.5 py-1 text-center rounded-xs min-w-[44px] sm:min-w-[50px] shadow-2xs">
            <span className="font-mono font-black text-lg sm:text-xl text-foreground block leading-tight">
              {formatUnit(time.minutes)}
            </span>
            <span className="font-mono text-[7px] sm:text-[7.5px] uppercase tracking-widest text-muted block font-bold mt-0.5">
              MENIT
            </span>
          </div>

          <div className="bg-surface border border-foreground/30 px-2 sm:px-2.5 py-1 text-center rounded-xs min-w-[44px] sm:min-w-[50px] shadow-2xs">
            <span className="font-mono font-black text-lg sm:text-xl text-foreground block leading-tight">
              {formatUnit(time.seconds)}
            </span>
            <span className="font-mono text-[7px] sm:text-[7.5px] uppercase tracking-widest text-muted block font-bold mt-0.5">
              DETIK
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CARD VARIANT (Default Standalone Box)
  // ==========================================
  if (time.isLive) {
    return (
      <div
        className={cn(
          'relative bg-[#090a0c] text-white p-6 sm:p-8 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.25)] rounded-xs overflow-hidden',
          className
        )}
      >
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase font-bold tracking-widest text-emerald-400 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>SESI SEDANG BERLANGSUNG SAAT INI</span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl font-black text-white leading-tight">
          {title || (isRecurringSunday ? 'Lapak CFD Alun-Alun Blora Sedang Digelar' : 'Kegiatan Sedang Berlangsung')}
        </h3>

        <p className="font-serif text-sm text-zinc-300 mt-2 max-w-xl">
          Terpal telah dihamparkan! Mari merapat langsung untuk membaca bersila, meminjam buku, atau sekadar bertukar sapa.
        </p>

        {locationName && (
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2 font-mono text-xs text-amber-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{locationName}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative bg-[#090a0c] text-white p-6 sm:p-8 border-2 border-amber-500/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)] rounded-xs select-none',
        className
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.12) 0%, transparent 45%), radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.08) 0%, transparent 40%)',
      }}
    >
      {/* Corner vintage marks */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/80 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/80 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/80 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/80 pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-amber-500/30">
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-amber-400">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>
            {isRecurringSunday
              ? 'SESI LAPAK RUTIN MINGGU PAGI // CFD ALUN-ALUN'
              : 'HITUNG MUNDUR KEGIATAN MENDATANG'}
          </span>
        </div>
        <div className="font-mono text-[10px] sm:text-[11px] text-zinc-400 flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-amber-400" />
          <span>
            {actualStart.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}{' '}
            &bull; 06.00 WIB
          </span>
        </div>
      </div>

      {/* Countdown Grid (4 Digit Blocks) */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-lg mx-auto py-2">
        <div className="bg-zinc-950/90 border border-amber-500/40 p-3 sm:p-4 text-center rounded-xs shadow-inner">
          <span className="font-mono font-black text-3xl sm:text-5xl text-amber-300 block tracking-tight">
            {formatUnit(time.days)}
          </span>
          <span className="font-mono text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mt-1">
            HARI
          </span>
        </div>

        <div className="bg-zinc-950/90 border border-amber-500/40 p-3 sm:p-4 text-center rounded-xs shadow-inner">
          <span className="font-mono font-black text-3xl sm:text-5xl text-amber-300 block tracking-tight">
            {formatUnit(time.hours)}
          </span>
          <span className="font-mono text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mt-1">
            JAM
          </span>
        </div>

        <div className="bg-zinc-950/90 border border-amber-500/40 p-3 sm:p-4 text-center rounded-xs shadow-inner">
          <span className="font-mono font-black text-3xl sm:text-5xl text-amber-300 block tracking-tight">
            {formatUnit(time.minutes)}
          </span>
          <span className="font-mono text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mt-1">
            MENIT
          </span>
        </div>

        <div className="bg-zinc-950/90 border border-amber-500/40 p-3 sm:p-4 text-center rounded-xs shadow-inner">
          <span className="font-mono font-black text-3xl sm:text-5xl text-amber-400 block tracking-tight">
            {formatUnit(time.seconds)}
          </span>
          <span className="font-mono text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mt-1">
            DETIK
          </span>
        </div>
      </div>

      {/* Subtitle / Venue context */}
      <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-300">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {locationName ||
              'Trotoar Depan Pendopo Kabupaten Blora &bull; Car Free Day (06.00 – 09.00 WIB)'}
          </span>
        </div>
        <div className="text-amber-300/90 font-bold uppercase tracking-wider text-[11px]">
          [ BEBAS BERSILA &bull; TANPA TIKET ]
        </div>
      </div>
    </div>
  );
}
