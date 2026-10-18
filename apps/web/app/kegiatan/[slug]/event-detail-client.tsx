'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomLoader } from '@/components/ui/custom-loader';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { RichTextRenderer } from '@/components/articles/rich-text-renderer';
import { apiClient } from '@/lib/api';
import { EventDetail, EventRegistrationItem, EventStatus, EventType } from '@perpusjal/types';
import { EventCountdown } from '@/components/events/event-countdown';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { JsonLd } from '@/components/seo/json-ld';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle2,
  CalendarPlus,
  XCircle,
  Video,
  ExternalLink,
  Camera,
  FileText,
  AlertCircle,
  QrCode as QrIcon,
  MessageCircle,
  Share2,
  Sparkles,
  Archive,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

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

export function EventDetailClient({ slug: propSlug }: { slug?: string }) {
  const params = useParams();
  const slug = propSlug || (params?.slug as string);

  const [event, setEvent] = React.useState<EventDetail | null>(null);
  const [ticketQrSvg, setTicketQrSvg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const loadEvent = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await apiClient<{ data: EventDetail }>(`/events/${slug}`);

    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data) {
      setEvent(res.data.data);
    }
  }, [slug]);

  React.useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  React.useEffect(() => {
    if (event?.myRegistration?.attendanceCode) {
      QRCode.toString(event.myRegistration.attendanceCode, {
        type: 'svg',
        margin: 1,
        width: 140,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((svg) => setTicketQrSvg(svg))
        .catch(() => setTicketQrSvg(null));
    } else {
      setTicketQrSvg(null);
    }
  }, [event?.myRegistration?.attendanceCode]);

  const handleRegister = async () => {
    if (!event) return;

    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);

    const res = await apiClient<{ data: EventRegistrationItem }>(`/events/${event.id}/register`, {
      method: 'POST',
    });

    setActionLoading(false);

    if (res.error) {
      setActionError(res.error.message);
      return;
    }

    setActionMessage('Selamat! Pendaftaran Anda berhasil tercatat.');
    loadEvent();
  };

  const handleCancelRegistration = async () => {
    if (!event) return;
    if (!window.confirm('Apakah Anda yakin ingin membatalkan keikutsertaan dalam kegiatan ini?')) return;

    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);

    const res = await apiClient<{ message: string }>(`/events/${event.id}/cancel-registration`, {
      method: 'POST',
    });

    setActionLoading(false);

    if (res.error) {
      setActionError(res.error.message);
      return;
    }

    setActionMessage(res.data?.message || 'Pendaftaran berhasil dibatalkan.');
    loadEvent();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-12">
          <CustomLoader size="lg" label="MEMBUKA LEMBAR DOKUMEN AGENDA..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground font-sans editorial-grain">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-20 text-center space-y-6">
          <div className="border-2 border-foreground p-10 sm:p-14 bg-surface space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              DOKUMEN AGENDA // 404
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-foreground">
              Agenda Tidak Ditemukan
            </h1>
            <p className="font-serif text-sm text-foreground/80 max-w-md mx-auto leading-relaxed">
              {error || 'Agenda yang kamu cari tidak tersedia atau tautan telah kedaluwarsa.'}
            </p>
            <div className="pt-4">
              <Link
                href="/kegiatan"
                className="px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold inline-flex items-center gap-2 hover:bg-foreground/90 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Kalender Kegiatan</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const startDate = new Date(event.startAt);
  const endDate = new Date(event.endAt);
  const formattedDate = startDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const startTime = startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const endTime = endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const isFull = event.quota ? event.registeredCount >= event.quota : false;
  const isPast = endDate < new Date() || event.status === EventStatus.COMPLETED;
  const myReg = event.myRegistration;

  const googleCalUrl = generateGoogleCalendarUrl(
    event.title,
    startDate,
    endDate,
    event.locationName,
    'Kegiatan literasi merdeka Perpustakaan Jalanan Blora.'
  );

  // WhatsApp Share URL
  const shareText = `📖 *${event.title}* - Perpustakaan Jalanan Blora\n🗓 ${formattedDate} • ${startTime} - ${endTime} WIB\n📍 ${event.locationName}\n\nMari bersila membaca dan merawat ruang temu warga tanpa syarat:\n👉 ${typeof window !== 'undefined' ? window.location.href : `https://perpusjalblora.org/kegiatan/${event.slug}`}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const getStatusBadge = (status: EventStatus) => {
    if (status === EventStatus.COMPLETED || isPast) {
      return (
        <span className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-0.5 border border-border-hairline bg-surface-muted text-muted font-bold">
          SELESAI (ARSIP KEGIATAN)
        </span>
      );
    }
    if (isFull) {
      return (
        <span className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-0.5 bg-foreground text-background font-bold">
          KUOTA PENUH
        </span>
      );
    }
    return (
      <span className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-0.5 border border-foreground/40 bg-surface-muted text-foreground font-bold">
        TERBUKA UMUM
      </span>
    );
  };

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description:
      typeof event.description === 'string'
        ? event.description.slice(0, 250)
        : `Kegiatan literasi merdeka ${event.title} di Perpustakaan Jalanan Blora.`,
    startDate: event.startAt,
    endDate: event.endAt,
    eventStatus: isPast
      ? 'https://schema.org/EventCompleted'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: event.isOnline
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: event.isOnline
      ? {
          '@type': 'VirtualLocation',
          url: event.meetingUrl || `https://perpusjalblora.org/kegiatan/${event.slug}`,
        }
      : {
          '@type': 'Place',
          name: event.locationName || 'Alun-Alun Blora',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Alun-Alun Blora (Depan Masjid Agung)',
            addressLocality: 'Blora',
            addressRegion: 'Jawa Tengah',
            postalCode: '58214',
            addressCountry: 'ID',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: -6.9697,
            longitude: 111.4178,
          },
        },
    image: [
      event.coverImage ||
        '/images/default-event-cover.svg',
    ],
    organizer: {
      '@type': 'Organization',
      name: event.organizer?.name || 'Perpustakaan Jalanan Blora',
      url: 'https://perpusjalblora.org',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
      availability: isFull
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
      url: `https://perpusjalblora.org/kegiatan/${event.slug}`,
      validFrom: event.startAt,
    },
    isAccessibleForFree: true,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Beranda',
        item: 'https://perpusjalblora.org',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Kalender Kegiatan',
        item: 'https://perpusjalblora.org/kegiatan',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: event.title,
        item: `https://perpusjalblora.org/kegiatan/${event.slug}`,
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans editorial-grain selection:bg-foreground selection:text-background">
      <JsonLd data={eventJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-36 sm:pt-12 sm:pb-16 space-y-10">
        {/* Masthead Navigation & Brand Stamp */}
        <div className="border-b border-border-hairline pb-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono uppercase tracking-widest text-muted">
          <div className="flex items-center gap-3">
            <Link
              href="/kegiatan"
              className="inline-flex items-center gap-1.5 text-muted hover:text-foreground font-bold transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Kalender Kegiatan</span>
            </Link>
            <span>//</span>
            <span className="text-foreground font-bold">DOKUMEN AGENDA</span>
          </div>

          <div className="flex items-center gap-2">
            <BrandStamp edition="KRONIK LAPAK" year="2026" />
          </div>
        </div>

        {/* Announcement Banner (when set by curator) */}
        {event.announcementText && (
          <div className="p-3.5 sm:p-4 bg-foreground text-background font-mono text-xs flex items-center justify-between gap-3 border-2 border-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-background shrink-0 animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-[11px]">
                MAKLUMAT PENTING: {event.announcementText}
              </span>
            </div>
            <span className="text-[10px] uppercase opacity-80 hidden sm:inline font-bold">
              [ WARTA RELAWAN ]
            </span>
          </div>
        )}

        {/* Hero Event Banner Card */}
        <RevealOnScroll variant="cinematic" delayMs={50}>
          <section className="border-2 border-foreground bg-surface p-6 sm:p-9 space-y-6">
            {/* Top Status Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-hairline text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-none bg-foreground animate-pulse" />
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                  {event.type}
                </span>
                <span className="text-muted">&bull;</span>
                {getStatusBadge(event.status)}
              </div>

              <div className="flex items-center gap-2">
                {/* WhatsApp Share Button */}
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground font-mono text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
                  title="Bagikan kabar kegiatan ini ke WhatsApp kawan-kawan"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Bagikan ke WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Grid Layout: Visual Cover (Left 5 cols) + Event Synopsis & Actions (Right 7 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Tactile Editorial Photography Cover (5 cols) */}
              <div className="lg:col-span-5 flex justify-center w-full">
                <div className="relative w-full max-w-md bg-surface border-2 border-foreground p-3.5 select-none">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-hairline font-mono text-[9px] uppercase tracking-widest text-muted">
                    <span>[ DOKUMENTASI TERPAL // PERPUSJAL ]</span>
                    <span className="font-bold text-foreground">2026</span>
                  </div>

                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-foreground/30 bg-zinc-950">
                    <img
                      src={
                        event.coverImage ||
                        '/images/default-event-cover.svg'
                      }
                      alt={event.title}
                      className="w-full h-full object-cover grayscale contrast-110 hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-foreground text-background font-mono text-[8px] font-extrabold uppercase tracking-widest border border-background">
                      ✦ TERPAL RAKYAT ✦
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <p className="font-serif italic text-xs leading-snug">
                        &ldquo;Membaca adalah hak warga; merawat perjumpaan adalah kerja kebudayaan.&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 flex items-center justify-between font-mono text-[9.5px] text-muted">
                    <span>{event.locationName}</span>
                    <span className="font-bold text-foreground uppercase">RUANG BACA SWADAYA</span>
                  </div>
                </div>
              </div>

              {/* Right: Event Headline & Venue Pillars (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-2">
                  <div className="inline-block px-2.5 py-0.5 border border-foreground bg-surface-muted text-foreground font-mono text-[9px] uppercase font-bold tracking-widest">
                    <span>✦ LEMBAR DOKUMEN AGENDA RESMI ✦</span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tight">
                    {event.title}
                  </h1>

                  <p className="font-mono text-xs text-muted">
                    Penyelenggara / Inisiator:{' '}
                    <strong className="text-foreground font-semibold">{event.organizer.name}</strong>
                  </p>
                </div>

                {/* 3 Key Venue Pillars Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-mono text-xs text-muted">
                  <div className="flex items-center gap-2 p-2.5 bg-surface-muted/60 border border-border-hairline">
                    <Clock className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] text-muted block uppercase">Waktu</span>
                      <span className="text-foreground font-semibold text-[11px]">
                        {startTime} – {endTime} WIB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 bg-surface-muted/60 border border-border-hairline truncate">
                    <MapPin className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] text-muted block uppercase">Lokasi</span>
                      <span className="text-foreground font-semibold text-[11px] truncate block">
                        {event.locationName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 bg-surface-muted/60 border border-border-hairline">
                    <Users className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted block uppercase">Partisipasi</span>
                      <span className="text-foreground font-semibold text-[11px]">
                        {event.quota ? `${event.registeredCount}/${event.quota}` : 'Terbuka Umum'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calendar & Map Quick Action Strip */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 font-mono text-xs">
                  <a
                    href={googleCalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 border border-border-hairline hover:border-foreground bg-surface text-foreground transition-colors inline-flex items-center gap-1.5"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-foreground" />
                    <span>Google Calendar</span>
                  </a>

                  {event.mapUrl && (
                    <a
                      href={event.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 border border-border-hairline hover:border-foreground bg-surface text-foreground transition-colors inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-foreground" />
                      <span>Petunjuk Rute Maps</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* 2-Column Content: Left Narrative + Right Registration/Ticket */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Info & Description & Past Archive (8 cols) */}
          <RevealOnScroll variant="cinematic" delayMs={100} className="lg:col-span-8 space-y-10">
            {/* Online Meeting Link (Only if registered) */}
            {event.isOnline && event.meetingUrl && (
              <div className="p-4 bg-surface-muted border-2 border-foreground font-mono text-xs space-y-2">
                <span className="font-bold text-foreground flex items-center gap-2">
                  <Video className="w-4 h-4 text-foreground" />
                  TAUTAN TEMU DARING (KHUSUS PESERTA TERDAFTAR):
                </span>
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-2 bg-surface border border-border-hairline text-foreground underline break-all font-semibold"
                >
                  {event.meetingUrl}
                </a>
              </div>
            )}

            {/* Description Narrative */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-foreground border-b-2 border-foreground pb-2">
                <FileText className="w-4 h-4 text-foreground" />
                <span>CATATAN &amp; NARASI KEGIATAN</span>
              </div>

              <div className="prose max-w-none text-foreground font-serif leading-relaxed text-base sm:text-lg">
                {typeof event.description === 'object' ? (
                  <RichTextRenderer content={event.description} />
                ) : (
                  <p className="whitespace-pre-line leading-relaxed text-foreground/90">
                    {event.description}
                  </p>
                )}
              </div>
            </div>

            {/* Etalase Buku Spesial Lapak (Buku yang dibawa ke kegiatan ini) */}
            {event.featuredBooks && event.featuredBooks.length > 0 && (
              <div className="border-2 border-foreground bg-surface p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border-hairline pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest font-bold text-foreground">
                      <BookOpen className="w-4 h-4 text-foreground" />
                      <span>ETALASE PUSTAKA SPESIAL // DIBERANGKATKAN KE LAPAK</span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mt-1">
                      Buku Pilihan di Kegiatan Ini
                    </h3>
                    <p className="font-sans text-xs text-muted mt-0.5">
                      Deretan buku pilihan yang dibawa langsung oleh relawan ke lokasi lapak ini.
                    </p>
                  </div>
                  <Link
                    href="/buku"
                    className="font-mono text-xs uppercase tracking-wider text-foreground hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Katalog Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Mobile horizontal snap-scroll / Desktop Grid */}
                <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-3 -mx-2 px-2 sm:mx-0 sm:px-0">
                  {event.featuredBooks.map((book) => (
                    <div
                      key={book.id}
                      className="min-w-[240px] sm:min-w-0 border border-border-hairline bg-surface p-3.5 flex flex-col justify-between space-y-3 snap-start transition-all hover:border-foreground group rounded-none"
                    >
                      <div className="flex gap-3">
                        {/* Book Spine / Cover */}
                        <div className="w-16 h-22 shrink-0 bg-surface-muted border border-border-hairline overflow-hidden shadow-xs relative group-hover:shadow-sm transition-shadow">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted/10 text-[9px] font-mono text-muted text-center p-1">
                              Sampul
                            </div>
                          )}
                          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="inline-block px-1.5 py-0.5 bg-foreground/5 border border-border-hairline font-mono text-[9px] uppercase text-muted truncate max-w-full">
                            {book.category?.name || 'Koleksi'}
                          </span>
                          <Link href={`/buku/${book.slug}`}>
                            <h4 className="font-serif font-bold text-sm text-foreground group-hover:underline line-clamp-2 leading-snug">
                              {book.title}
                            </h4>
                          </Link>
                          <p className="font-serif italic text-xs text-muted truncate">
                            {book.author}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border-hairline flex items-center justify-between font-mono text-[10px]">
                        <span className={cn(
                          'px-2 py-0.5 font-bold uppercase tracking-wider',
                          book.isBorrowable && book.availableCopies > 0
                            ? 'bg-foreground text-background'
                            : 'border border-border-hairline text-muted'
                        )}>
                          {book.isBorrowable && book.availableCopies > 0
                            ? '● Tersedia'
                            : !book.isBorrowable
                            ? '○ Di Tempat'
                            : '× Dipinjam'}
                        </span>

                        <Link
                          href={`/buku/${book.slug}`}
                          className="text-foreground hover:underline inline-flex items-center gap-1 font-semibold touch-tactile"
                        >
                          <span>Pinjam</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post-Event Documentation & Reflection (FR-EVT-05 & Arsip Lampau) */}
            {event.summary && (
              <div className="border-2 border-foreground bg-surface p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-foreground">
                    <Camera className="w-4 h-4 text-foreground" />
                    <span>JEJAK DOKUMENTASI &amp; REFLEKSI LAPAK</span>
                  </div>
                  <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-foreground text-background font-bold border border-foreground">
                    PASCA-KEGIATAN
                  </span>
                </div>

                <div className="p-4 sm:p-5 bg-surface-muted/50 border-l-4 border-l-foreground font-serif text-base sm:text-lg italic leading-relaxed text-foreground/90 whitespace-pre-line">
                  &ldquo;{event.summary}&rdquo;
                </div>

                {event.gallery && event.gallery.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted block">
                      GALERI DOKUMENTASI WARGA ({event.gallery.length} FOTO):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {event.gallery.map((imgUrl, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-zinc-950 border border-foreground/60 overflow-hidden relative group"
                        >
                          <img
                            src={imgUrl}
                            alt={`Dokumentasi Lapak ${i + 1}`}
                            className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                          />
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black/80 text-white font-mono text-[8px] uppercase">
                            #{i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Public Participants List (FR-EVT-06) */}
            {event.participants && event.participants.length > 0 && (
              <div className="border border-border-hairline bg-surface p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                  <h3 className="uppercase tracking-widest font-bold text-foreground">
                    WARGA YANG TELAH MENDAFTAR ({event.participants.length})
                  </h3>
                  <span className="text-[10px] text-muted">KOMUNITAS TROTOAR</span>
                </div>
                <div className="divide-y divide-border-hairline max-h-60 overflow-y-auto">
                  {event.participants.map((p, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <span className="text-foreground font-semibold">{p.name}</span>
                      <span className="text-muted text-[11px]">
                        {new Date(p.registeredAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </RevealOnScroll>

          {/* RIGHT: Countdown Ribbon & Ticket Registration Card (4 cols) */}
          <RevealOnScroll variant="stamp" delayMs={80} className="lg:col-span-4 space-y-6">
            {!isPast && (
              <EventCountdown
                variant="card"
                targetDate={event.startAt}
                endDate={event.endAt}
                title={event.title}
                locationName={event.locationName}
              />
            )}

            {/* Ticket & Registration Status Box */}
            <div id="tiket-kehadiran" className="border-2 border-foreground bg-surface p-6 space-y-6 font-sans scroll-mt-24">
              <div className="border-b border-border-hairline pb-3">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest block font-bold">
                  [ TIKET KEHADIRAN ]
                </span>
                <h3 className="font-serif font-black text-xl text-foreground mt-0.5">
                  Status Partisipasi
                </h3>
              </div>

              {actionMessage && (
                <div className="p-3 bg-surface-muted border-2 border-foreground font-mono text-xs text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                  <span>{actionMessage}</span>
                </div>
              )}

              {actionError && (
                <div className="p-3 bg-surface-muted border-2 border-destructive font-mono text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Status 1: User Registered */}
              {myReg ? (
                <div className="space-y-5">
                  <div className="p-4 bg-surface-muted border-2 border-foreground text-center space-y-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted block font-bold">
                      KODE TIKET &amp; QR HADIR (CHECK-IN)
                    </span>

                    {/* QR Code SVG */}
                    {ticketQrSvg && (
                      <div className="flex justify-center py-1">
                        <div
                          className="bg-white p-2 border-2 border-foreground inline-block"
                          dangerouslySetInnerHTML={{ __html: ticketQrSvg }}
                          title={`QR Code Hadir: ${myReg.attendanceCode}`}
                        />
                      </div>
                    )}

                    <div className="font-mono text-3xl font-black tracking-widest text-foreground py-1 bg-surface border border-foreground">
                      {myReg.attendanceCode}
                    </div>
                    <p className="font-sans text-[11px] text-muted leading-relaxed">
                      Tunjukkan QR Code atau kode 6 digit ini kepada relawan panitia saat tiba di atas terpal lapak.
                    </p>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs">
                    <a
                      href={myReg.calendarUrl}
                      download
                      className="w-full py-2.5 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <CalendarPlus className="w-4 h-4 text-foreground" />
                      <span>Unduh File Kalender (.ics)</span>
                    </a>

                    {myReg.canCancel ? (
                      <button
                        type="button"
                        onClick={handleCancelRegistration}
                        disabled={actionLoading}
                        className="w-full py-2 border border-border-hairline text-muted hover:text-destructive hover:border-destructive uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Batalkan Pendaftaran</span>
                      </button>
                    ) : (
                      <p className="font-sans text-[11px] text-muted text-center italic">
                        Batas pembatalan mandiri telah berakhir (&le; H-1). Hubungi panitia jika berhalangan.
                      </p>
                    )}
                  </div>
                </div>
              ) : isPast ? (
                /* Status 2: Event Completed / Past Archive */
                <div className="p-4 bg-surface-muted border-2 border-border-hairline text-center space-y-2 font-mono text-xs">
                  <Archive className="w-5 h-5 text-foreground mx-auto" />
                  <span className="font-bold text-foreground block uppercase">
                    KEGIATAN INI TELAH SELESAI
                  </span>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Agenda ini telah terlaksana dan tercatat dalam arsip rekam jejak literasi Perpustakaan Jalanan Blora.
                  </p>
                </div>
              ) : isFull ? (
                /* Status 3: Quota Full */
                <div className="p-4 bg-surface-muted border-2 border-foreground text-center space-y-2 font-mono text-xs">
                  <span className="font-bold text-foreground block uppercase">KUOTA PENUH</span>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Kapasitas peserta ({event.quota} orang) telah terisi penuh. Pantau agenda berikutnya di kalender kegiatan.
                  </p>
                </div>
              ) : (
                /* Status 4: Available to Register */
                <div className="space-y-4">
                  <div className="font-mono text-xs text-muted space-y-1.5 p-3 bg-surface-muted/50 border border-border-hairline">
                    <div className="flex justify-between">
                      <span>Batas Kuota:</span>
                      <strong className="text-foreground">
                        {event.quota ? `${event.quota} Kursi` : 'Terbuka Umum'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Warga Terdaftar:</span>
                      <strong className="text-foreground">{event.registeredCount} Orang</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={actionLoading}
                    className="w-full py-3.5 bg-foreground text-background border-2 border-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-background" />
                    <span>{actionLoading ? 'Mendaftarkan...' : 'AMBIL TIKET QR HADIR'}</span>
                  </button>

                  <p className="font-sans text-[11px] text-muted text-center leading-relaxed">
                    Tanpa biaya pendaftaran. Bebas hadir bersila di atas terpal.
                  </p>
                </div>
              )}
            </div>
          </RevealOnScroll>
        </div>
      </main>

      {/* Mobile Sticky Bottom Action Bar (Thumb zone friendly) */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t-2 border-foreground p-3 sm:hidden shadow-lg safe-bottom">
        <div className="flex items-center justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider block truncate">
              📍 {event.locationName}
            </span>
            <span className="font-serif font-bold text-xs text-foreground truncate block">
              {startTime} WIB • {isPast ? 'Selesai' : isFull ? 'Penuh' : 'Terbuka'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {event.mapUrl && (
              <a
                href={event.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="h-10 px-3 border border-border-hairline bg-surface text-foreground font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1 active:scale-95 touch-tactile"
                title="Buka Peta"
              >
                <MapPin className="w-3.5 h-3.5 text-foreground" />
                <span>Peta</span>
              </a>
            )}

            {!isPast && (
              myReg ? (
                <button
                  type="button"
                  onClick={() => {
                    const ticketEl = document.getElementById('tiket-kehadiran');
                    ticketEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-10 px-4 bg-foreground text-background font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 active:scale-95 touch-tactile"
                >
                  <QrIcon className="w-3.5 h-3.5" />
                  <span>Lihat QR</span>
                </button>
              ) : isFull ? (
                <span className="h-10 px-3 border border-border-hairline bg-surface-muted text-muted font-mono text-[10px] uppercase font-bold flex items-center">
                  Penuh
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={actionLoading}
                  className="h-10 px-4 bg-foreground text-background font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 active:scale-95 touch-tactile"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{actionLoading ? '...' : 'Ambil Tiket'}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <RevealOnScroll variant="fade" delayMs={60}>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}
