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

  const statusTab = (searchParams.get('status') as 'mendatang' | 'selesai') || 'mendatang';
  const typeFilter = (searchParams.get('type') as EventType) || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState({ page: 1, perPage: 12, total: 0, totalPages: 1 });

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
    router.push(`/kegiatan?${next.toString()}`);
  };

  // The featured spotlight event (first upcoming event or automatic Sunday Lapak CFD)
  const spotlightEvent = React.useMemo(() => {
    if (statusTab === 'mendatang' && events.length > 0) {
      return events[0];
    }
    return null;
  }, [statusTab, events]);

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
      <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
        TERBUKA UMUM
      </span>
    );
  };

  const getTypeTheme = (type: EventType) => {
    switch (type) {
      case EventType.LAPAK:
        return {
          label: 'Lapak Baca',
          border: 'border-l-4 border-l-amber-500',
          badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40',
        };
      case EventType.DISKUSI:
        return {
          label: 'Diskusi Buku',
          border: 'border-l-4 border-l-rose-600',
          badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40',
        };
      case EventType.WORKSHOP:
        return {
          label: 'Workshop Kriya',
          border: 'border-l-4 border-l-emerald-600',
          badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
        };
      case EventType.KELAS:
        return {
          label: 'Kelas Belajar',
          border: 'border-l-4 border-l-indigo-600',
          badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/40',
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
        <section className="border-b-2 border-foreground pb-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3 mb-6 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <BrandStamp edition="KRONIK AGENDA" year="2026" />
              <span className="hidden sm:inline">[ WARTA KEGIATAN &bull; RUANG PERJUMPAAN ]</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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

        {/* ========================================================= */}
        {/* 2. CINEMATIC HERO COUNTDOWN SPOTLIGHT (THE OBSIDIAN VAULT)*/}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted pb-2 border-b border-border-hairline">
            <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>[ HITUNG MUNDUR SESI TERDEKAT ]</span>
            </span>
            <span>BLORA, JAWA TENGAH</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Interactive Realtime Countdown Plinth (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <EventCountdown
                targetDate={spotlightEvent ? spotlightEvent.startAt : sundaySession.startAt}
                endDate={spotlightEvent ? spotlightEvent.endAt : sundaySession.endAt}
                title={spotlightEvent?.title}
                locationName={spotlightEvent?.locationName}
                className="h-full flex flex-col justify-between"
              />
            </div>

            {/* Right: Featured Session Context Box (5 cols) */}
            <div className="lg:col-span-5 border-2 border-foreground bg-surface p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.9)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border-hairline pb-2.5 text-[10px] font-mono uppercase tracking-wider text-muted">
                  <span className="font-bold text-foreground">
                    {spotlightEvent ? `TIPE // ${spotlightEvent.type}` : 'SESI MINGGUAN CFD'}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ● AKTIF DIGELAR
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-black text-foreground leading-snug">
                  {spotlightEvent
                    ? spotlightEvent.title
                    : 'Lapak Baca Rutin Car Free Day Alun-Alun Blora'}
                </h3>

                <p className="font-serif text-sm text-foreground/80 leading-relaxed">
                  {spotlightEvent
                    ? 'Agenda terdekat yang disiapkan oleh kolektif kawan-kawan perpusjal. Buka rincian untuk memastikan ketersediaan kursi atau topik diskusi.'
                    : 'Hamparan terpal biru di trotoar depan Pendopo Kabupaten Blora. Ambil buku yang kamu pesan lewat website, baca bersila bersama kawan, atau nikmati mewarnai gambar fabel untuk anak-anak.'}
                </p>

                <div className="space-y-2 font-mono text-xs text-muted pt-2 border-t border-border-hairline">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span>
                      {spotlightEvent
                        ? `${new Date(spotlightEvent.startAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(spotlightEvent.endAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`
                        : 'Pukul 06.00 – 09.00 WIB (Setiap Minggu Pagi)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span className="line-clamp-1">
                      {spotlightEvent
                        ? spotlightEvent.locationName
                        : 'Depan Pendopo Kabupaten Blora (Alun-Alun Kota)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border-hairline flex flex-wrap items-center gap-2.5">
                {spotlightEvent ? (
                  <Link
                    href={`/kegiatan/${spotlightEvent.slug}`}
                    className="px-5 py-3 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
                  >
                    <span>RINCIAN &amp; TIKET QR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <a
                    href="https://maps.google.com/?q=Alun-Alun+Blora"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>PETUNJUK LOKASI MAPS</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <a
                  href={googleCalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 border border-foreground bg-surface hover:bg-foreground hover:text-background font-mono text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                  title="Tambahkan Pengingat ke Google Calendar"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">SIMPAN KE KALENDER</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. DUA SAYAP GERAKAN // TITIK RUANG BACA RUTIN            */}
        {/* ========================================================= */}
        <section className="border-t-2 border-foreground pt-10 sm:pt-14 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b-2 border-foreground gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-ultra text-muted">
                [ BASIS FISIK // TITIK SAYAP ]
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
                Tiga Titik Nyala Gerakan
              </h2>
            </div>
            <p className="font-mono text-xs text-muted max-w-sm">
              Tempat di mana buku fisik digelar dan kawan-kawan relawan berkumpul secara berkala.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wing 1: Kota CFD */}
            <div className="border-2 border-foreground bg-surface p-6 flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] group hover:border-amber-500 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase text-muted tracking-widest pb-2 border-b border-border-hairline">
                  <span>01 // SAYAP KOTA</span>
                  <Coffee className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="font-serif text-2xl font-black text-foreground leading-tight">
                  Lapak CFD Alun-Alun
                </h3>
                <p className="font-serif text-xs text-foreground/80 leading-relaxed">
                  Ruang temu mingguan di pusat kota. Digelar setiap Minggu pagi pukul 06.00 – 09.00 WIB
                  di depan Pendopo Kabupaten Blora. Tempat pengambilan pesanan buku daring dan ruang baca trotoar.
                </p>
              </div>
              <div className="pt-3 border-t border-border-hairline font-mono text-[10.5px] text-muted flex items-center justify-between">
                <span className="font-bold text-foreground">Minggu 06.00 – 09.00 WIB</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">RUTIN</span>
              </div>
            </div>

            {/* Wing 2: Sayap Hutan Doplang */}
            <div className="border-2 border-foreground bg-surface p-6 flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] group hover:border-amber-500 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase text-muted tracking-widest pb-2 border-b border-border-hairline">
                  <span>02 // SAYAP HUTAN</span>
                  <TreePine className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-serif text-2xl font-black text-foreground leading-tight">
                  Mata Air Sendang Salak
                </h3>
                <p className="font-serif text-xs text-foreground/80 leading-relaxed">
                  Sayap literasi di Blora Selatan (Tanggel, Kecamatan Doplang). Mendekatkan buku dongeng dan
                  sains ke desa tepian hutan, serta menjadi lokasi kemah literasi tahunan <em>&ldquo;Nginep Alas&rdquo;</em>.
                </p>
              </div>
              <div className="pt-3 border-t border-border-hairline font-mono text-[10.5px] text-muted flex items-center justify-between">
                <span className="font-bold text-foreground">Doplang, Blora Selatan</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">TEMATIK</span>
              </div>
            </div>

            {/* Wing 3: Omah Talang Bocor */}
            <div className="border-2 border-foreground bg-surface p-6 flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] group hover:border-amber-500 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase text-muted tracking-widest pb-2 border-b border-border-hairline">
                  <span>03 // MARKAS KREATIF</span>
                  <Palette className="w-4 h-4 text-indigo-500" />
                </div>
                <h3 className="font-serif text-2xl font-black text-foreground leading-tight">
                  Omah Talang Bocor
                </h3>
                <p className="font-serif text-xs text-foreground/80 leading-relaxed">
                  Basecamp dan bengkel kriya mandiri dekat Stadion Kridosono Blora. Tempat perbaikan buku rusak,
                  workshop sablon cukil kayu murah, dan batik ecoprint daun jati bersama pemuda kampung.
                </p>
              </div>
              <div className="pt-3 border-t border-border-hairline font-mono text-[10.5px] text-muted flex items-center justify-between">
                <span className="font-bold text-foreground">Karangjati, Blora Kota</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">BASECAMP</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. KATALOG AGENDA LENGKAP & DOKUMENTASI ARSIP             */}
        {/* ========================================================= */}
        <section className="border-t-2 border-foreground pt-10 sm:pt-14 space-y-8">
          {/* Header & Tabs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b-2 border-foreground gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-ultra text-muted">
                  [ KALENDER KEGIATAN // DAFTAR LENGKAP ]
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
                  Daftar Kegiatan Warga
                </h2>
              </div>

              {/* Status Tab Switchers */}
              <div className="flex items-center gap-2 border-b-2 sm:border-b-0 border-foreground font-mono text-xs uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => updateFilters({ status: 'mendatang', page: '1' })}
                  className={cn(
                    'px-4 py-2 border-2 transition-all cursor-pointer font-bold',
                    statusTab === 'mendatang'
                      ? 'bg-foreground text-background border-foreground shadow-xs'
                      : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                  )}
                >
                  Agenda Mendatang
                </button>
                <button
                  type="button"
                  onClick={() => updateFilters({ status: 'selesai', page: '1' })}
                  className={cn(
                    'px-4 py-2 border-2 transition-all cursor-pointer font-bold',
                    statusTab === 'selesai'
                      ? 'bg-foreground text-background border-foreground shadow-xs'
                      : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                  )}
                >
                  Arsip Dokumentasi
                </button>
              </div>
            </div>

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
              ].map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => updateFilters({ type: chip.val || null, page: '1' })}
                  className={cn(
                    'px-3 py-1 border transition-colors cursor-pointer text-[11px] font-bold',
                    typeFilter === chip.val
                      ? 'bg-amber-500 text-black border-amber-600'
                      : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

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
                {events.map((event) => {
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
                    <article
                      key={event.id}
                      className={cn(
                        'border-2 border-foreground bg-surface hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.9)] transition-all flex flex-col justify-between group',
                        theme.border
                      )}
                    >
                      <div>
                        {/* Top Header Card: Calendar Stamp Date & Status Badge */}
                        <div className="p-5 border-b border-border-hairline bg-surface-muted/30 flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {/* Calendar Stamp */}
                            <div className="border-2 border-foreground bg-surface w-14 h-14 flex flex-col items-center justify-center font-mono shrink-0 shadow-xs">
                              <span className="text-[9px] uppercase font-bold text-muted leading-tight">
                                {dayName}
                              </span>
                              <span className="text-xl font-black leading-none text-foreground">
                                {day}
                              </span>
                              <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 leading-tight">
                                {month}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <span
                                className={cn(
                                  'font-mono text-[9px] uppercase font-bold px-2 py-0.5 border rounded-xs inline-block',
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
                            <h3 className="font-serif text-xl font-bold text-foreground leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:underline transition-colors line-clamp-2">
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
                          className="font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 inline-flex items-center gap-1 uppercase tracking-wider transition-colors"
                        >
                          <span>RINCIAN</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="pt-8 border-t border-border-hairline flex justify-center">
                  <Pagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
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
        <section className="border-2 border-foreground bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6 sm:p-10 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)]">
          {/* Subtle gold glow */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[9px] uppercase font-bold tracking-widest">
                <Sparkles className="w-3 h-3" />
                <span>KOLABORASI RUANG BUKA // GERAKAN SWADAYA</span>
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl font-black text-white leading-tight">
                Punya Gagasan Diskusi, Workshop, atau Pentas Akustik di Lapak?
              </h3>
              <p className="font-serif text-sm sm:text-base text-zinc-300 leading-relaxed">
                Kami selalu membuka pintu terpal bagi komunitas literasi lain, guru desa, musisi akustik,
                seniman cukil, maupun pegiat lingkungan yang ingin berkolaborasi menyemarakkan ruang baca rakyat.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Perpusjal%20Blora,%20kami%20ingin%20berkolaborasi%20kegiatan%20bersama"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider text-center transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-black" />
                <span>KOLABORASI VIA WHATSAPP</span>
              </a>

              <Link
                href="/tentang"
                className="px-5 py-3.5 border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider text-center transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>KRONIK GERAKAN</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
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
