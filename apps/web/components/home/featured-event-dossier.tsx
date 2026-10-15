'use client';

import * as React from 'react';
import Link from 'next/link';
import { LandingFeaturedEventData, LandingFeaturedEventSetting } from '@perpusjal/types';
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  Ticket,
  Clock,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DigitalStampEffect } from '@/components/circulation/digital-stamp-effect';

interface FeaturedEventDossierProps {
  setting: LandingFeaturedEventSetting;
  event: LandingFeaturedEventData;
  className?: string;
}

export function FeaturedEventDossier({
  setting,
  event,
  className,
}: FeaturedEventDossierProps) {
  // Calculate countdown days
  const countdownText = React.useMemo(() => {
    if (!event.startAt) return null;
    const now = new Date();
    const target = new Date(event.startAt);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'SEDANG BERLANGSUNG / SELESAI';
    if (diffDays === 0) return 'HARI INI DIGELAR DI TERPAL!';
    if (diffDays === 1) return 'BESOK DIGELAR (H-1)';
    return `H-${diffDays} MENUJU AGENDA TERPAL`;
  }, [event.startAt]);

  const formattedDate = React.useMemo(() => {
    if (!event.startAt) return '';
    const dateObj = new Date(event.startAt);
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [event.startAt]);

  const formattedTime = React.useMemo(() => {
    if (!event.startAt) return '';
    const start = new Date(event.startAt).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const end = event.endAt
      ? new Date(event.endAt).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Selesai';
    return `${start} - ${end} WIB`;
  }, [event.startAt, event.endAt]);

  return (
    <div
      className={cn(
        'border-2 border-foreground bg-surface text-foreground p-6 sm:p-10 relative overflow-hidden rounded-none',
        className
      )}
    >
      {/* Background Constructivist Watermark */}
      <div className="absolute right-4 bottom-2 opacity-[0.03] pointer-events-none font-serif text-[120px] sm:text-[180px] font-black leading-none select-none tracking-tighter">
        AGENDA
      </div>

      <div className="space-y-6 relative z-10">
        {/* Top Broadsheet Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-foreground pb-4 sm:pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
              [ {setting.customBadge || 'MAKLUMAT RESMI // AGENDA TERPAL'} ]
            </span>

            <span className="px-2 py-0.5 border border-border-hairline bg-surface-muted font-mono text-xs uppercase font-bold tracking-wider text-muted rounded-none">
              [{event.type || 'KEGIATAN AKBAR'}]
            </span>
          </div>

          {setting.showCountdown && countdownText && (
            <div className="font-mono text-xs uppercase font-bold tracking-wider text-foreground px-2.5 py-1 border border-foreground bg-surface-muted/60 self-start sm:self-auto rounded-none">
              ⏳ {countdownText}
            </div>
          )}
        </div>

        {/* Main Event Headline & Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <h3 className="font-serif text-[28px] sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground leading-tight">
              {event.title}
            </h3>

            {setting.customLead ? (
              <p className="font-serif italic text-base sm:text-lg text-foreground/90 leading-relaxed max-w-2xl border-l-4 border-foreground pl-4 py-1">
                &ldquo;{setting.customLead}&rdquo;
              </p>
            ) : event.descriptionPlain ? (
              <p className="font-serif text-sm sm:text-base text-muted leading-relaxed max-w-2xl line-clamp-3">
                {event.descriptionPlain}
              </p>
            ) : null}

            {/* 4 Metadata Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 bg-background border border-border-hairline flex items-start gap-3 rounded-none">
                <Calendar className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-[9.5px] uppercase text-muted tracking-wider">WAKTU &amp; TANGGAL:</div>
                  <div className="font-bold text-foreground text-xs mt-0.5">{formattedDate}</div>
                  <div className="text-[11px] text-muted">{formattedTime}</div>
                </div>
              </div>

              <div className="p-3 bg-background border border-border-hairline flex items-start gap-3 rounded-none">
                <MapPin className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-[9.5px] uppercase text-muted tracking-wider">TITIK KUMPUL LAPAK:</div>
                  <div className="font-bold text-foreground text-xs mt-0.5 truncate">{event.locationName}</div>
                  <div className="text-[11px] text-muted truncate">{event.locationDetail || 'Blora, Jawa Tengah'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Attendance Slip & Digital Stamp */}
          <div className="lg:col-span-4 p-5 bg-background border-2 border-foreground space-y-4 font-mono text-xs self-stretch flex flex-col justify-between rounded-none">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-hairline pb-2 text-[9.5px] uppercase tracking-wider text-muted">
                <span>BERKAS AGENDA LAPAK</span>
                <span className="font-bold text-foreground">100% BEBAS BIAYA</span>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase text-muted">STATUS PARTISIPASI:</div>
                <div className="font-serif text-lg font-bold text-foreground">
                  Terbuka untuk Umum
                </div>
                <p className="text-[10px] text-muted leading-relaxed">
                  Bawa semangat membaca dan rasa ingin tahu. Seluruh perlengkapan baca dan terpal disediakan komunitas.
                </p>
              </div>

              {typeof event.quota === 'number' && event.quota > 0 && (
                <div className="p-2.5 bg-surface border border-border-hairline flex items-center justify-between">
                  <span className="text-[10px] uppercase text-muted flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-foreground" />
                    <span>Kuota Tersedia:</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {event.registeredCount || 0} / {event.quota} Warga
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <DigitalStampEffect variant="TERSEDIA" size="sm" />
                <span className="text-[9px] uppercase tracking-widest text-muted">RESMI PERPUSJAL</span>
              </div>

              <Link
                href={`/kegiatan/${event.slug}`}
                className="w-full py-3 bg-foreground text-background font-mono text-xs uppercase font-bold tracking-wider hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 border border-foreground rounded-none"
              >
                <Ticket className="w-4 h-4" />
                <span>DAFTAR PRESENSI PESERTA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
