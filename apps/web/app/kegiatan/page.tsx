'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Pagination } from '@/components/ui/pagination';
import { apiClient } from '@/lib/api';
import { EventItem, EventType, EventStatus } from '@perpusjal/types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Filter,
  Sparkles,
  ExternalLink,
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

  const getStatusBadge = (status: EventStatus, quota: number | null, registeredCount: number) => {
    if (status === EventStatus.COMPLETED) {
      return (
        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border-hairline text-muted">
          SELESAI
        </span>
      );
    }
    if (quota && registeredCount >= quota) {
      return (
        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-foreground text-background font-bold">
          KUOTA PENUH
        </span>
      );
    }
    return (
      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-foreground bg-surface text-foreground font-bold">
        TERBUKA
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Gazette Masthead */}
        <div className="border-b-2 border-foreground pb-4 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-muted uppercase tracking-widest">
            <span>AGENDA LITERASI & LAPAK</span>
            <span>// RUANG GERAK KOMUNITAS</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Kegiatan & Lapak Baca
          </h1>
          <p className="font-sans text-sm text-muted max-w-2xl leading-relaxed">
            Jadwal lapak perpustakaan jalanan mingguan di ruang terbuka Blora, kelas diskusi buku alternatif,
            workshop kepenulisan, dan pertunjukan literasi warga.
          </p>
        </div>

        {/* Tab switchers & Type filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border-hairline font-mono text-xs uppercase tracking-wider pb-px">
            <button
              type="button"
              onClick={() => updateFilters({ status: 'mendatang', page: '1' })}
              className={`px-5 py-2.5 border-b-2 transition-colors ${
                statusTab === 'mendatang'
                  ? 'border-foreground text-foreground font-bold'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              Agenda Mendatang
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ status: 'selesai', page: '1' })}
              className={`px-5 py-2.5 border-b-2 transition-colors ${
                statusTab === 'selesai'
                  ? 'border-foreground text-foreground font-bold'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              Arsip Dokumentasi & Selesai
            </button>
          </div>

          {/* Type filter chips */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider pt-1">
            <span className="text-muted text-[11px] mr-1">Jenis:</span>
            {[
              { val: '', label: 'Semua' },
              { val: EventType.LAPAK, label: 'Lapak Baca' },
              { val: EventType.DISKUSI, label: 'Diskusi Buku' },
              { val: EventType.KELAS, label: 'Kelas Belajar' },
              { val: EventType.WORKSHOP, label: 'Workshop' },
            ].map((chip) => (
              <button
                key={chip.val}
                type="button"
                onClick={() => updateFilters({ type: chip.val || null })}
                className={`px-3 py-1 border transition-colors ${
                  typeFilter === chip.val
                    ? 'bg-foreground text-background border-foreground font-bold'
                    : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <CustomLoader size="lg" label="MEMUAT AGENDA KEGIATAN..." />
          </div>
        ) : error ? (
          <div className="p-8 border border-foreground bg-surface-muted text-center space-y-3 font-mono text-xs">
            <p className="text-foreground">{error}</p>
            <button
              onClick={fetchEvents}
              className="px-4 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider"
            >
              Coba Lagi
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center border-2 border-foreground bg-surface p-8 space-y-3">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">
              [ JADWAL KOSONG ]
            </span>
            <h2 className="font-serif text-2xl font-normal text-foreground">
              {statusTab === 'mendatang'
                ? 'Belum Ada Agenda Mendatang yang Terjadwal'
                : 'Belum Ada Dokumentasi Kegiatan Lampau'}
            </h2>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              Pantau terus ruang warta dan media sosial kami untuk kabar lapak baca mingguan berikutnya.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const startDate = new Date(event.startAt);
                const endDate = new Date(event.endAt);
                const day = startDate.getDate();
                const month = startDate.toLocaleDateString('id-ID', { month: 'short' });
                const year = startDate.getFullYear();
                const startTime = startDate.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const endTime = endDate.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <article
                    key={event.id}
                    className="border border-border-hairline bg-surface hover:border-foreground transition-all duration-150 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header Card: Big Date Stamp & Type */}
                      <div className="p-5 border-b border-border-hairline bg-surface-muted/40 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="border-2 border-foreground bg-surface w-14 h-14 flex flex-col items-center justify-center font-mono">
                            <span className="text-xl font-extrabold leading-none">{day}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted">
                              {month}
                            </span>
                          </div>

                          <div>
                            <span className="font-mono text-[10px] uppercase font-bold text-foreground block">
                              {event.type}
                            </span>
                            <span className="font-mono text-xs text-muted">
                              {year} // {startTime} WIB
                            </span>
                          </div>
                        </div>

                        {getStatusBadge(event.status, event.quota, event.registeredCount)}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <Link href={`/kegiatan/${event.slug}`} className="block">
                          <h2 className="font-serif text-xl font-bold text-foreground leading-snug group-hover:underline underline-offset-2 line-clamp-2">
                            {event.title}
                          </h2>
                        </Link>

                        <div className="space-y-1.5 font-mono text-xs text-muted pt-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-foreground" />
                            <span className="line-clamp-1">{event.locationName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 shrink-0 text-muted" />
                            <span>
                              {startTime} - {endTime} WIB
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 shrink-0 text-muted" />
                            <span>
                              {event.quota
                                ? `${event.registeredCount}/${event.quota} Peserta Terdaftar`
                                : 'Terbuka Umum (Tanpa Batas Kuota)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Link */}
                    <div className="p-5 pt-3 border-t border-border-hairline flex items-center justify-between font-mono text-xs">
                      <span className="text-muted text-[11px]">
                        Diselenggarakan oleh {event.organizer.name}
                      </span>
                      <Link
                        href={`/kegiatan/${event.slug}`}
                        className="font-bold text-foreground group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 uppercase tracking-wider"
                      >
                        <span>Rincian</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
      </main>

      <Footer />
    </div>
  );
}

export default function EventCatalogPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <CustomLoader size="md" label="MEMBUKA AGENDA KEGIATAN..." />
        </div>
      }
    >
      <EventCatalogContent />
    </React.Suspense>
  );
}
