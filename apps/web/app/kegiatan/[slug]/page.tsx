'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomLoader } from '@/components/ui/custom-loader';
import { RichTextRenderer } from '@/components/articles/rich-text-renderer';
import { apiClient } from '@/lib/api';
import { EventDetail, EventRegistrationItem } from '@perpusjal/types';
import QRCode from 'qrcode';
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
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

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
          <CustomLoader size="lg" label="MEMBUKA LEMBAR AGENDA KEGIATAN..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-20 text-center space-y-6">
          <div className="border-2 border-foreground p-12 bg-surface space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              KODE // 404
            </span>
            <h1 className="font-serif text-3xl font-normal text-foreground">Kegiatan Tidak Ditemukan</h1>
            <p className="font-sans text-sm text-muted max-w-md mx-auto">
              {error || 'Agenda yang Anda cari tidak tersedia atau tautan tidak valid.'}
            </p>
            <div className="pt-4">
              <Link
                href="/kegiatan"
                className="font-mono text-xs uppercase tracking-wider text-foreground underline underline-offset-4"
              >
                &larr; Kembali ke Kalender Kegiatan
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
  const isPast = endDate < new Date();
  const myReg = event.myRegistration;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/kegiatan"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Kalender Kegiatan</span>
          </Link>
        </div>

        {/* Top Header Section */}
        <div className="border-b-2 border-foreground pb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs uppercase tracking-widest text-muted">
            <span className="px-2 py-0.5 border border-foreground text-foreground font-bold">
              {event.type}
            </span>
            <span>STATUS // {event.status}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {event.title}
          </h1>

          <p className="font-mono text-xs text-muted">
            Diselenggarakan oleh <strong className="text-foreground">{event.organizer.name}</strong>
          </p>
        </div>

        {/* Grid: Details Left, Registration Card Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Info & Description (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Meta Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-surface border border-border-hairline font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-muted uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-foreground" />
                  WAKTU PELAKSANAAN
                </span>
                <p className="font-bold text-foreground text-sm">{formattedDate}</p>
                <p className="text-muted">
                  Pukul {startTime} - {endTime} WIB
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-foreground" />
                  LOKASI KEGIATAN
                </span>
                <p className="font-bold text-foreground text-sm">{event.locationName}</p>
                {event.locationDetail && <p className="text-muted text-[11px]">{event.locationDetail}</p>}
                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-foreground underline underline-offset-2 mt-1"
                  >
                    <span>Buka Peta Petunjuk Arah</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

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
                  className="block p-2 bg-surface border border-border-hairline text-foreground underline break-all"
                >
                  {event.meetingUrl}
                </a>
              </div>
            )}

            {/* Description Narrative */}
            <div className="space-y-4">
              <h2 className="font-mono text-sm uppercase tracking-widest font-bold text-foreground border-b border-border-hairline pb-2">
                TENTANG KEGIATAN INI
              </h2>

              <div className="prose max-w-none text-foreground font-sans leading-relaxed">
                {typeof event.description === 'object' ? (
                  <RichTextRenderer content={event.description} />
                ) : (
                  <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
            </div>

            {/* Post-Event Documentation (FR-EVT-05) */}
            {event.summary && (
              <div className="pt-8 border-t-2 border-foreground space-y-6">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-foreground border-b border-border-hairline pb-2">
                  <Camera className="w-4 h-4 text-foreground" />
                  <span>DOKUMENTASI & RINGKASAN KEGIATAN</span>
                </div>

                <div className="p-6 bg-surface border border-border-hairline space-y-4 font-sans text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {event.summary}
                </div>

                {event.gallery && event.gallery.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {event.gallery.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-surface-muted border border-border-hairline overflow-hidden"
                      >
                        <img
                          src={imgUrl}
                          alt={`Dokumentasi ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Public Participants List (FR-EVT-06) */}
            {event.participants && event.participants.length > 0 && (
              <div className="pt-6 border-t border-border-hairline space-y-3 font-mono text-xs">
                <h3 className="uppercase tracking-widest font-bold text-foreground">
                  PESERTA YANG TELAH MENDAFTAR ({event.participants.length})
                </h3>
                <div className="p-4 bg-surface border border-border-hairline divide-y divide-border-hairline max-h-60 overflow-y-auto">
                  {event.participants.map((p, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <span className="text-foreground font-bold">{p.name}</span>
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
          </div>

          {/* RIGHT: Ticket / Registration Box (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border-2 border-foreground bg-surface p-6 space-y-6 shadow-md font-sans">
              <div className="border-b border-border-hairline pb-3">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest block">
                  TIKET KEHADIRAN
                </span>
                <h3 className="font-serif font-bold text-xl text-foreground mt-1">
                  Status Partisipasi
                </h3>
              </div>

              {actionMessage && (
                <div className="p-3 bg-surface-muted border border-foreground font-mono text-xs text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                  <span>{actionMessage}</span>
                </div>
              )}

              {actionError && (
                <div className="p-3 bg-surface-muted border border-destructive font-mono text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Status 1: User Registered */}
              {myReg ? (
                <div className="space-y-5">
                  <div className="p-4 bg-surface-muted border-2 border-foreground text-center space-y-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted block">
                      TIKET & KODE HADIR (CHECK-IN)
                    </span>

                    {/* QR Code SVG */}
                    {ticketQrSvg && (
                      <div className="flex justify-center py-1">
                        <div
                          className="bg-white p-2 border border-foreground inline-block shadow-xs"
                          dangerouslySetInnerHTML={{ __html: ticketQrSvg }}
                          title={`QR Code Hadir: ${myReg.attendanceCode}`}
                        />
                      </div>
                    )}

                    <div className="font-mono text-3xl font-extrabold tracking-widest text-foreground py-1 bg-surface border border-border-hairline">
                      {myReg.attendanceCode}
                    </div>
                    <p className="font-sans text-[11px] text-muted">
                      Tunjukkan QR Code atau kode 6 digit ini kepada relawan panitia saat tiba di lokasi kegiatan.
                    </p>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <a
                      href={myReg.calendarUrl}
                      download
                      className="w-full py-2.5 border border-foreground text-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      <span>Simpan ke Kalender (.ics)</span>
                    </a>

                    {myReg.canCancel ? (
                      <button
                        type="button"
                        onClick={handleCancelRegistration}
                        disabled={actionLoading}
                        className="w-full py-2 border border-border-hairline text-muted hover:text-destructive uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Batalkan Pendaftaran</span>
                      </button>
                    ) : (
                      <p className="font-sans text-[11px] text-muted text-center italic">
                        Batas waktu pembatalan mandiri telah berakhir (&le; H-1). Hubungi panitia jika berhalangan hadir.
                      </p>
                    )}
                  </div>
                </div>
              ) : isPast ? (
                /* Status 2: Event Completed / Past */
                <div className="p-4 bg-surface-muted border border-border-hairline text-center space-y-2 font-mono text-xs">
                  <span className="font-bold text-foreground block">KEGIATAN INI TELAH SELESAI</span>
                  <p className="font-sans text-xs text-muted">
                    Pendaftaran telah ditutup karena kegiatan telah terlaksana.
                  </p>
                </div>
              ) : isFull ? (
                /* Status 3: Quota Full */
                <div className="p-4 bg-surface-muted border border-border-hairline text-center space-y-2 font-mono text-xs">
                  <span className="font-bold text-foreground block">KUOTA PENUH</span>
                  <p className="font-sans text-xs text-muted">
                    Kapasitas peserta ({event.quota} orang) telah terisi penuh.
                  </p>
                </div>
              ) : (
                /* Status 4: Available to Register */
                <div className="space-y-4">
                  <div className="font-mono text-xs text-muted space-y-1">
                    <div className="flex justify-between">
                      <span>Kapasitas:</span>
                      <strong className="text-foreground">
                        {event.quota ? `${event.quota} Peserta` : 'Terbuka Umum'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Pendaftar Saat Ini:</span>
                      <strong className="text-foreground">{event.registeredCount} Peserta</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={actionLoading}
                    className="w-full py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionLoading ? 'Mendaftar...' : 'DAFTAR SEBAGAI PESERTA'}</span>
                  </button>

                  <p className="font-sans text-[11px] text-muted text-center leading-relaxed">
                    Pendaftaran gratis. Pembatalan mandiri dibuka hingga <strong>H-1 acara</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
