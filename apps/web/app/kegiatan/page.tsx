'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Pagination } from '@/components/ui/pagination';
import { EventCountdown, getNextSundayLapakSession } from '@/components/events/event-countdown';
import { apiClient } from '@/lib/api';
import { EventItem, EventType, EventStatus } from '@perpusjal/types';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  ArrowUpRight,
  Filter,
  Sparkles,
  CalendarPlus,
  Compass,
  TreePine,
  Coffee,
  Palette,
  ExternalLink,
  MessageCircle,
  Radio,
  CheckCircle2,
  Tent,
  Archive,
} from 'lucide-react';

interface EventsApiResponse {
  data: EventItem[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

function generateGoogleCalendarUrl(
  title: string,
  start: Date,
  end: Date,
  location: string,
  details: string
) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatIso = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  const dates = `${formatIso(start)}/${formatIso(end)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function EventCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusTab = (searchParams.get('status') as 'mendatang' | 'selesai') || 'selesai';
  const typeFilter = (searchParams.get('type') as EventType) || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState({ page: 1, perPage: 12, total: 0, totalPages: 1 });

  // Independent Hero Spotlight & Upcoming Counter
  const [heroSpotlightEvent, setHeroSpotlightEvent] = React.useState<EventItem | null>(null);
  const [upcomingTotal, setUpcomingTotal] = React.useState<number>(0);

  React.useEffect(() => {
    async function loadSpotlight() {
      try {
        const res = await apiClient<EventsApiResponse>('/events?status=mendatang&perPage=5');
        if (res.data?.data && res.data.data.length > 0) {
          setHeroSpotlightEvent(res.data.data[0]);
          setUpcomingTotal(res.data.meta?.total ?? res.data.data.length);
        } else {
          setHeroSpotlightEvent(null);
          setUpcomingTotal(0);
        }
      } catch {
        setHeroSpotlightEvent(null);
      }
    }
    loadSpotlight();
  }, []);

  const fetchEvents = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    queryParams.set('status', statusTab);
    if (typeFilter) queryParams.set('type', typeFilter);
    queryParams.set('page', page.toString());
    queryParams.set('perPage', '12');

    const res = await apiClient<EventsApiResponse>(`/events?${queryParams.toString()}`);

    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data) {
      setEvents(res.data.data || []);
      setMeta(res.data.meta || { page: 1, perPage: 12, total: 0, totalPages: 1 });
    }
  }, [statusTab, typeFilter, page]);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    if (!('page' in newParams)) {
      next.delete('page');
    }
    router.push(`/kegiatan?${next.toString()}`, { scroll: false });
  };

  // The featured spotlight event (independent upcoming hero event or fallback to Sunday CFD)
  const spotlightEvent = heroSpotlightEvent;

  const sundaySession = React.useMemo(() => getNextSundayLapakSession(), []);

  const googleCalUrl = React.useMemo(() => {
    if (spotlightEvent) {
      return generateGoogleCalendarUrl(
        spotlightEvent.title,
        new Date(spotlightEvent.startAt),
        new Date(spotlightEvent.endAt),
        spotlightEvent.locationName,
        'Kegiatan literasi merdeka Perpustakaan Jalanan Blora.'
      );
    }
    return generateGoogleCalendarUrl(
      'Lapak Baca CFD Alun-Alun Blora (Perpusjal)',
      sundaySession.startAt,
      sundaySession.endAt,
      'Depan Pendopo Kabupaten Blora, Jawa Tengah',
      'Lesehan baca buku gratis, peminjaman buku tanpa uang jaminan, dan perjumpaan warga di Car Free Day Blora.'
    );
  }, [spotlightEvent, sundaySession]);

  const getStatusBadge = (status: EventStatus, quota: number | null, registeredCount: number) => {
    if (status === EventStatus.COMPLETED) {
      return (
        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border border-border-hairline bg-surface-muted text-muted font-bold">
          SELESAI
        </span>
      );
    }
    if (quota && registeredCount >= quota) {
      return (
        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 bg-foreground text-background font-bold">
          KUOTA PENUH
        </span>
      );
    }
    return (
      <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border border-foreground/40 bg-surface-muted text-foreground font-bold">
        TERBUKA UMUM
      </span>
    );
  };

  const getTypeTheme = (type: EventType) => {
    switch (type) {
      case EventType.LAPAK:
        return {
          label: 'Lapak Baca',
          border: 'border-l-4 border-l-foreground',
          badge: 'bg-surface-muted text-foreground border-foreground/40',
        };
      case EventType.DISKUSI:
        return {
          label: 'Diskusi Buku',
          border: 'border-l-4 border-l-foreground',
          badge: 'bg-surface-muted text-foreground border-foreground/40',
        };
      case EventType.WORKSHOP:
        return {
          label: 'Workshop Kriya',
          border: 'border-l-4 border-l-foreground',
          badge: 'bg-surface-muted text-foreground border-foreground/40',
        };
      case EventType.KELAS:
        return {
          label: 'Kelas Belajar',
          border: 'border-l-4 border-l-foreground',
          badge: 'bg-surface-muted text-foreground border-foreground/40',
        };
      case EventType.NOBAR:
        return {
          label: 'Nonton Bareng & Bedah Film',
          border: 'border-l-4 border-l-foreground',
          badge: 'bg-surface-muted text-foreground border-foreground/40',
        };
      default:
        return {
          label: 'Agenda Khusus',
          border: 'border-l-4 border-l-foreground',
          badge: 'bg-surface-muted text-foreground border-border-hairline',
        };
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background editorial-grain">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12 sm:space-y-16">
        {/* ========================================================= */}
        {/* 1. EDITORIAL GAZETTE MASTHEAD                             */}
        {/* ========================================================= */}
        <RevealOnScroll variant="cinematic" delayMs={50}>
          <section className="border-b-2 border-foreground pb-8 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3 mb-6 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <BrandStamp edition="KRONIK AGENDA" year="2026" />
                <span className="hidden sm:inline">[ WARTA KEGIATAN &bull; RUANG PERJUMPAAN ]</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-none bg-foreground animate-pulse" />
                <span className="text-foreground font-semibold">LAPAK RUTIN: SETIAP MINGGU PAGI</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-foreground font-mono text-[9px] uppercase font-bold tracking-widest bg-foreground text-background">
                <span>GERAKAN LITERASI SWADAYA</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-foreground leading-[1.05]">
                Ruang Perjumpaan di Balik Terpal.
              </h1>

              <p className="font-serif text-base sm:text-lg text-foreground/85 max-w-3xl leading-relaxed">
                Kami menghamparkan ratusan buku di ruang terbuka Blora, menyelenggarakan forum diskusi buku
                alternatif, lokakarya kriya mandiri, dan kemah literasi di tepian hutan jati. Seluruh kegiatan
                terbuka bagi siapa saja tanpa syarat kartu tanda penduduk, tanpa uang pendaftaran, dan tanpa sekat kelas sosial.
              </p>
            </div>
          </section>
        </RevealOnScroll>

        {/* ========================================================= */}
        {/* 2. UNIFIED HERO EVENT STAGE & EMBEDDED COUNTDOWN           */}
        {/* ========================================================= */}
        <RevealOnScroll variant="cinematic" delayMs={100}>
          <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted pb-2 border-b border-border-hairline">
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-foreground" />
              <span>[ AGENDA UTAMA &bull; SESI TERDEKAT ]</span>
            </span>
            <span>BLORA, JAWA TENGAH</span>
          </div>

          {/* Unified Monumental Event Stage Card */}
          <div className="border-2 border-foreground bg-surface p-6 sm:p-9 relative overflow-hidden space-y-7">
            {/* Top Gazette Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-hairline text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-none bg-foreground animate-pulse" />
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                  {spotlightEvent ? `AGENDA // ${spotlightEvent.type}` : 'SESI RUTIN // LAPAK BACA CFD'}
                </span>
                <span className="text-muted hidden sm:inline">&bull;</span>
                <span className="text-muted hidden sm:inline text-[11px]">Kolektif Trotoar Blora</span>
              </div>

              <div className="flex items-center gap-2 text-muted text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-foreground" />
                <span className="font-bold text-foreground">
                  {spotlightEvent
                    ? new Date(spotlightEvent.startAt).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : sundaySession.startAt.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                </span>
              </div>
            </div>

            {/* Grid Layout: Left Tactile Photo Mockup (5 cols) + Right Narrative, Countdown & Actions (7 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Tactile Editorial Photography Mockup (5 cols) */}
              <div className="lg:col-span-5 flex justify-center w-full">
                <div className="relative w-full max-w-sm sm:max-w-md bg-surface border-2 border-foreground p-3.5 select-none">
                  {/* Top Photo Strip */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-hairline font-mono text-[9px] uppercase tracking-widest text-muted">
                    <span>[ DOKUMENTASI TROTOAR // LAPAK CFD ]</span>
                    <span className="font-bold text-foreground">2026</span>
                  </div>

                  {/* Image Canvas Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-foreground/30 bg-zinc-950">
                    <img
                      src={
                        spotlightEvent?.coverImage ||
                        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80'
                      }
                      alt={spotlightEvent?.title || 'Suasana Lapak Baca Terpal Perpusjal Blora'}
                      className="w-full h-full object-cover grayscale contrast-110 hover:grayscale-0 transition-all duration-500"
                    />

                    {/* Gradient Overlay for Mood */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                    {/* Vintage Corner Badge on Photo */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-foreground text-background font-mono text-[8px] font-extrabold uppercase tracking-widest border border-background">
                      ✦ TERPAL RAKYAT ✦
                    </div>

                    {/* Photo Caption Overlay */}
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <p className="font-serif italic text-xs leading-snug">
                        &ldquo;Buku menemukan jiwanya saat disentuh jemari dan diperbincangkan di trotoar.&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Bottom Photo Metadata */}
                  <div className="pt-2.5 flex items-center justify-between font-mono text-[9.5px] text-muted">
                    <span>Lesehan Alun-Alun Blora</span>
                    <span className="font-bold text-foreground">RUANG BACA SWADAYA</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Event Narrative, Countdown Ticker & Actions (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-block px-2.5 py-0.5 border border-foreground/40 bg-surface-muted text-foreground font-mono text-[9px] uppercase font-bold tracking-widest">
                  <span>✦ SOROTAN SESI TERDEKAT ✦</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tight">
                  {spotlightEvent
                    ? spotlightEvent.title
                    : 'Lapak Baca Rutin Car Free Day Alun-Alun Blora'}
                </h2>

                <p className="font-serif text-base sm:text-lg text-foreground/85 leading-relaxed">
                  {spotlightEvent
                    ? 'Agenda terdekat yang disiapkan oleh kolektif kawan-kawan perpusjal. Buka rincian lengkap untuk memesan kursi, mengklaim tiket QR kehadiran, atau melihat topik bahasan.'
                    : 'Hamparan terpal biru di trotoar depan Pendopo Kabupaten Blora. Ambil buku yang kamu pesan lewat website ini, baca bersila di bawah naungan pohon trembesi, nikmati mewarnai gambar fabel untuk anak-anak, atau sekadar berbincang hangat.'}
                </p>

                {/* 3 Key Venue Pillars Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-mono text-xs text-muted">
                  <div className="flex items-center gap-2 p-2 bg-surface-muted/60 border border-border-hairline rounded-none">
                    <Clock className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span className="text-foreground font-semibold text-[11px]">
                      {spotlightEvent
                        ? `${new Date(spotlightEvent.startAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(spotlightEvent.endAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                        : '06.00 – 09.00 WIB'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-surface-muted/60 border border-border-hairline rounded-none truncate">
                    <MapPin className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span className="text-foreground font-semibold text-[11px] truncate">
                      {spotlightEvent
                        ? spotlightEvent.locationName
                        : 'Depan Pendopo Alun-Alun'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-surface-muted/60 border border-border-hairline rounded-none">
                    <Users className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span className="text-foreground font-semibold text-[11px]">
                      {spotlightEvent && spotlightEvent.quota
                        ? `${spotlightEvent.registeredCount}/${spotlightEvent.quota} Terdaftar`
                        : 'Terbuka Umum'}
                    </span>
                  </div>
                </div>

                {/* Integrated Countdown Ribbon (Directly In-Flow) */}
                <div className="pt-1">
                  <EventCountdown
                    variant="embedded"
                    targetDate={spotlightEvent ? spotlightEvent.startAt : sundaySession.startAt}
                    endDate={spotlightEvent ? spotlightEvent.endAt : sundaySession.endAt}
                    title={spotlightEvent?.title}
                    locationName={spotlightEvent?.locationName}
                  />
                </div>

                {/* Action Bar (Directly Anchored to Narrative & Countdown) */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border-hairline">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {spotlightEvent ? (
                      <Link
                        href={`/kegiatan/${spotlightEvent.slug}`}
                        className="px-5 py-2.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
                      >
                        <span>RINCIAN &amp; TIKET QR</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <a
                        href="https://maps.google.com/?q=Alun-Alun+Blora"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-background" />
                        <span>PETUNJUK LOKASI DI GOOGLE MAPS</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <a
                      href={googleCalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 border-2 border-foreground bg-surface hover:bg-foreground hover:text-background font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-foreground" />
                      <span>SIMPAN KE GOOGLE CALENDAR</span>
                    </a>
                  </div>

                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Perpusjal%20Blora,%20saya%20ingin%20bertanya%20tentang%20sesi%20lapak%20berikutnya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs uppercase font-bold text-foreground hover:underline inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>TANYA RELAWAN &rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

        {/* ========================================================= */}
        {/* 4. KATALOG AGENDA LENGKAP & DOKUMENTASI ARSIP             */}
        {/* ========================================================= */}
        <section id="daftar-kegiatan" className="border-t-2 border-foreground pt-10 sm:pt-14 space-y-8 scroll-mt-20">
          {/* Header & Tabs */}
          <RevealOnScroll variant="cinematic" delayMs={50}>
            <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b-2 border-foreground gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-ultra text-foreground font-bold flex items-center gap-1.5 mb-1">
                  <Archive className="w-3.5 h-3.5 text-foreground" />
                  <span>[ KRONIK PERJALANAN // ARSIP DOKUMENTASI LAPAK ]</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
                  {statusTab === 'selesai'
                    ? 'Rekam Jejak & Dokumentasi Kegiatan'
                    : 'Jadwal Agenda Mendatang Lainnya'}
                </h2>
                <p className="font-serif text-sm sm:text-base text-foreground/80 max-w-2xl mt-1 leading-relaxed">
                  {statusTab === 'selesai'
                    ? 'Menelusuri lintasan perjumpaan di balik terpal, arsip foto kegiatan, notula diskusi, dan kesaksian warga dari masa ke masa.'
                    : 'Daftar kegiatan literasi yang siap digelar oleh relawan dan kawan-kawan kolektif trotoar Blora.'}
                </p>
              </div>

              {/* Status Tab Switchers */}
              <div className="flex items-center gap-2 border-b-2 sm:border-b-0 border-foreground font-mono text-xs uppercase tracking-wider shrink-0">
                <button
                  type="button"
                  onClick={() => updateFilters({ status: 'selesai', page: '1' })}
                  className={cn(
                    'px-4 py-2 border-2 transition-all cursor-pointer font-bold',
                    statusTab === 'selesai'
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                  )}
                >
                  📜 Arsip Dokumentasi Lapak
                </button>
                <button
                  type="button"
                  onClick={() => updateFilters({ status: 'mendatang', page: '1' })}
                  className={cn(
                    'px-4 py-2 border-2 transition-all cursor-pointer font-bold flex items-center gap-1.5',
                    statusTab === 'mendatang'
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5 text-current" />
                  <span>Agenda Mendatang {upcomingTotal > 0 ? `(${upcomingTotal})` : ''}</span>
                </button>
              </div>
            </div>

            {/* Pinned Banner when browsing archive and upcoming events exist */}
            {statusTab === 'selesai' && upcomingTotal > 0 && (
              <div className="p-3.5 bg-surface-muted border-2 border-foreground flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-foreground shrink-0" />
                  <span className="text-foreground">
                    Terdapat <strong>{upcomingTotal} agenda kegiatan mendatang</strong> yang siap digelar di Blora.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateFilters({ status: 'mendatang', page: '1' })}
                  className="px-3 py-1 bg-foreground hover:bg-foreground/90 text-background font-bold uppercase tracking-wider text-[11px] border border-foreground cursor-pointer transition-colors"
                >
                  Buka Agenda Mendatang &rarr;
                </button>
              </div>
            )}

            {/* Type Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider pt-1">
              <span className="text-muted text-[11px] mr-1 flex items-center gap-1 font-bold">
                <Filter className="w-3 h-3" />
                <span>FILTER TIPE:</span>
              </span>
              {[
                { val: '', label: 'Semua Agenda' },
                { val: EventType.LAPAK, label: 'Lapak Baca' },
                { val: EventType.DISKUSI, label: 'Diskusi Buku' },
                { val: EventType.WORKSHOP, label: 'Workshop Kriya' },
                { val: EventType.KELAS, label: 'Kelas Belajar' },
                { val: EventType.NOBAR, label: 'Nobar & Film' },
              ].map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => updateFilters({ type: chip.val || null, page: '1' })}
                  className={cn(
                    'px-3 py-1 border transition-colors cursor-pointer text-[11px] font-bold',
                    typeFilter === chip.val
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* Events Grid / State Renderers */}
          {loading ? (
            <div className="py-20 flex justify-center border-2 border-foreground bg-surface">
              <CustomLoader size="lg" label="MEMUAT AGENDA KEGIATAN..." />
            </div>
          ) : error ? (
            <div className="p-8 border-2 border-foreground bg-surface-muted text-center space-y-3 font-mono text-xs">
              <p className="text-foreground font-bold">{error}</p>
              <button
                onClick={fetchEvents}
                className="px-5 py-2 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors"
              >
                Coba Muat Ulang
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center border-2 border-foreground bg-surface p-8 space-y-4">
              <span className="font-mono text-xs text-muted uppercase tracking-widest block">
                [ STATUS: BELUM ADA JADWAL KHUSUS ]
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {statusTab === 'mendatang'
                  ? 'Belum Ada Agenda Khusus yang Diumumkan'
                  : 'Belum Ada Dokumentasi Kegiatan Lampau'}
              </h3>
              <p className="font-serif text-sm text-muted max-w-lg mx-auto leading-relaxed">
                Namun jangan khawatir, <strong>Lapak CFD Alun-Alun Blora</strong> tetap rutin digelar setiap
                Minggu pagi pukul 06.00 – 09.00 WIB. Kamu bisa langsung merapat ke depan Pendopo tanpa perlu mendaftar.
              </p>
              <div className="pt-2">
                <a
                  href="https://instagram.com/perpusjal.dope"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 border-2 border-foreground bg-surface hover:bg-foreground hover:text-background font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>PANTAU INSTAGRAM UNTUK KABAR TERKINI</span>
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, idx) => {
                  const startDate = new Date(event.startAt);
                  const endDate = new Date(event.endAt);
                  const day = startDate.getDate();
                  const month = startDate.toLocaleDateString('id-ID', { month: 'short' });
                  const year = startDate.getFullYear();
                  const dayName = startDate.toLocaleDateString('id-ID', { weekday: 'short' });
                  const startTime = startDate.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const endTime = endDate.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const theme = getTypeTheme(event.type);

                  return (
                    <RevealOnScroll
                      key={event.id}
                      variant="cinematic"
                      delayMs={(idx % 3) * 80}
                      className="h-full"
                    >
                      <article
                        className={cn(
                          'border-2 border-foreground bg-surface transition-all flex flex-col justify-between group overflow-hidden h-full',
                          theme.border
                        )}
                      >
                        <div>
                          {/* Optional Card Cover Image Thumbnail */}
                          {event.coverImage && (
                            <Link href={`/kegiatan/${event.slug}`} className="block relative aspect-[16/9] w-full overflow-hidden border-b-2 border-foreground bg-zinc-950">
                              <img
                                src={event.coverImage}
                                alt={event.title}
                                className="w-full h-full object-cover grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 text-white font-mono text-[8.5px] font-bold uppercase tracking-widest border border-white/30 backdrop-blur-xs">
                                {statusTab === 'selesai' ? '✦ DOKUMENTASI TERPAL ✦' : '✦ POSTER AGENDA ✦'}
                              </div>
                            </Link>
                          )}

                          {/* Top Header Card: Calendar Stamp Date & Status Badge */}
                          <div className="p-5 border-b border-border-hairline bg-surface-muted/30 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {/* Calendar Stamp */}
                              <div className="border-2 border-foreground bg-surface w-14 h-14 flex flex-col items-center justify-center font-mono shrink-0">
                                <span className="text-[9px] uppercase font-bold text-muted leading-tight">
                                  {dayName}
                                </span>
                                <span className="text-xl font-black leading-none text-foreground">
                                  {day}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-foreground leading-tight">
                                  {month}
                                </span>
                              </div>

                              <div className="space-y-0.5">
                                <span
                                  className={cn(
                                    'font-mono text-[9px] uppercase font-bold px-2 py-0.5 border rounded-none inline-block',
                                    theme.badge
                                  )}
                                >
                                  {theme.label}
                                </span>
                                <span className="font-mono text-xs text-muted block">
                                  {year} &bull; {startTime} WIB
                                </span>
                              </div>
                            </div>

                            {getStatusBadge(event.status, event.quota, event.registeredCount)}
                          </div>

                          {/* Body Details */}
                          <div className="p-5 space-y-3">
                            <Link href={`/kegiatan/${event.slug}`} className="block">
                              <h3 className="font-serif text-xl font-bold text-foreground leading-snug group-hover:underline transition-colors line-clamp-2">
                                {event.title}
                              </h3>
                            </Link>

                            <div className="space-y-2 font-mono text-xs text-muted pt-2 border-t border-border-hairline">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 shrink-0 text-foreground" />
                                <span className="line-clamp-1">{event.locationName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 shrink-0 text-muted" />
                                <span>
                                  {startTime} – {endTime} WIB
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 shrink-0 text-muted" />
                                <span>
                                  {event.quota
                                    ? `${event.registeredCount}/${event.quota} Kursi Terisi`
                                    : 'Terbuka Umum (Bebas Hadir)'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-5 pt-3 border-t border-border-hairline flex items-center justify-between font-mono text-xs bg-surface-muted/20">
                          <span className="text-muted text-[10.5px] truncate max-w-[150px]">
                            Oleh {event.organizer.name}
                          </span>
                          <Link
                            href={`/kegiatan/${event.slug}`}
                            className="font-bold text-foreground hover:underline inline-flex items-center gap-1 uppercase tracking-wider transition-colors"
                          >
                            <span>{statusTab === 'selesai' ? 'REKAM JEJAK' : 'RINCIAN'}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </article>
                    </RevealOnScroll>
                  );
                })}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="pt-8 border-t border-border-hairline flex justify-center">
                  <Pagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    scroll={false}
                    createPageUrl={(p) => {
                      const next = new URLSearchParams(searchParams.toString());
                      next.set('page', p.toString());
                      return `/kegiatan?${next.toString()}`;
                    }}
                  />
                </div>
              )}
            </>
          )}
        </section>

        {/* ========================================================= */}
        {/* 5. AJAKAN KOLABORASI // GELAR LAPAK BERSAMA KAMI          */}
        {/* ========================================================= */}
        <RevealOnScroll variant="stamp" delayMs={80}>
          <section className="border-2 border-foreground bg-foreground text-background p-6 sm:p-10 relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-background/15 border border-background/30 text-background font-mono text-[9px] uppercase font-bold tracking-widest">
                  <Sparkles className="w-3 h-3 text-background" />
                  <span>KOLABORASI RUANG BUKA // GERAKAN SWADAYA</span>
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl font-black text-background leading-tight">
                  Punya Gagasan Diskusi, Workshop, atau Pentas Akustik di Lapak?
                </h3>
                <p className="font-serif text-sm sm:text-base text-background/80 leading-relaxed">
                  Kami selalu membuka pintu terpal bagi komunitas literasi lain, guru desa, musisi akustik,
                  seniman cukil, maupun pegiat lingkungan yang ingin berkolaborasi menyemarakkan ruang baca rakyat.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Perpusjal%20Blora,%20kami%20ingin%20berkolaborasi%20kegiatan%20bersama"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-background text-foreground hover:bg-background/90 font-mono text-xs font-bold uppercase tracking-wider text-center transition-colors inline-flex items-center justify-center gap-2 border border-foreground"
                >
                  <MessageCircle className="w-4 h-4 text-foreground" />
                  <span>KOLABORASI VIA WHATSAPP</span>
                </a>

                <Link
                  href="/tentang"
                  className="px-5 py-3.5 border border-background/40 bg-transparent hover:bg-background/10 text-background font-mono text-xs font-bold uppercase tracking-wider text-center transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-4 h-4" />
                  <span>KRONIK GERAKAN</span>
                </Link>
              </div>
            </div>
          </section>
        </RevealOnScroll>
      </main>

      <RevealOnScroll variant="fade" delayMs={60}>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}

export default function EventCatalogPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <CustomLoader size="md" label="MEMBUKA AGENDA KEGIATAN..." />
        </div>
      }
    >
      <EventCatalogContent />
    </React.Suspense>
  );
}
