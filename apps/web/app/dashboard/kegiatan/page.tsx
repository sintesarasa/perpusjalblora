'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  CalendarCheck,
  Clock,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit3,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { EventItem, EventType, EventStatus, Role } from '@perpusjal/types';
import { EventFormModal } from '@/components/dashboard/event-form-modal';
import { EventCompleteModal } from '@/components/dashboard/event-complete-modal';

interface EventsApiResponse {
  data: EventItem[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export default function DashboardKegiatanPage() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'mendatang' | 'selesai' | 'draft'>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(null);

  const [isCompleteModalOpen, setIsCompleteModalOpen] = React.useState(false);
  const [completingEvent, setCompletingEvent] = React.useState<EventItem | null>(null);

  const loadEvents = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const params = new URLSearchParams();
    params.set('status', statusFilter);
    params.set('perPage', '50');

    if (typeFilter !== 'ALL') {
      params.set('type', typeFilter);
    }
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }

    try {
      const res = await apiClient<EventsApiResponse>(`/events?${params.toString()}`);
      if (res.error) {
        setErrorMsg(res.error.message || 'Gagal memuat agenda kegiatan.');
      } else if (res.data) {
        setEvents(res.data.data || []);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadEvents]);

  const handleDeleteEvent = async (event: EventItem) => {
    if (!window.confirm(`Hapus agenda kegiatan "${event.title}" secara permanen?`)) {
      return;
    }

    try {
      const res = await apiClient<{ message: string }>(`/events/${event.id}`, {
        method: 'DELETE',
      });
      if (res.error) {
        alert(res.error.message || 'Gagal menghapus kegiatan.');
        return;
      }
      loadEvents();
    } catch (err: any) {
      alert(err?.message || 'Terjadi kesalahan sistem.');
    }
  };

  // Metrics
  const totalEvents = events.length;
  const activeEvents = events.filter(
    (e) => e.status === EventStatus.PUBLISHED || e.status === EventStatus.OPEN
  ).length;
  const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);
  const totalAttended = events.reduce((acc, curr) => acc + (curr.attendedCount || 0), 0);

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PUBLISHED:
      case EventStatus.OPEN:
        return (
          <span className="px-2 py-0.5 border border-foreground bg-foreground text-background font-mono text-[9px] uppercase font-bold tracking-wider">
            TERBUKA
          </span>
        );
      case EventStatus.FULL:
        return (
          <span className="px-2 py-0.5 border border-amber-600 bg-amber-500/10 text-amber-700 font-mono text-[9px] uppercase font-bold tracking-wider">
            KUOTA PENUH
          </span>
        );
      case EventStatus.COMPLETED:
        return (
          <span className="px-2 py-0.5 border border-border-hairline bg-surface-muted text-muted font-mono text-[9px] uppercase font-bold tracking-wider">
            SELESAI
          </span>
        );
      case EventStatus.DRAFT:
        return (
          <span className="px-2 py-0.5 border border-dashed border-foreground/50 text-foreground/70 font-mono text-[9px] uppercase font-bold tracking-wider">
            DRAF
          </span>
        );
      case EventStatus.CANCELLED:
        return (
          <span className="px-2 py-0.5 border border-destructive bg-destructive/10 text-destructive font-mono text-[9px] uppercase font-bold tracking-wider">
            BATAL
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 border border-border-hairline text-muted font-mono text-[9px] uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl font-sans text-foreground">
      {/* 1. Header Masthead */}
      <div className="border-b-2 border-foreground pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            <span>OPERASIONAL LAPAK</span>
            <span>//</span>
            <span className="text-foreground font-bold">MEJA AGENDA & PRESENSI</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Agenda Kegiatan & Presensi Lapak
          </h1>
          <p className="font-serif text-xs sm:text-sm text-muted mt-1 max-w-2xl">
            Kelola jadwal lapak baca ruang terbuka Blora, kelas literasi, diskusi sastra warga, dan presensi partisipan di lokasi kegiatan.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingEvent(null);
            setIsFormModalOpen(true);
          }}
          className="self-start md:self-auto px-4 py-2.5 border-2 border-foreground bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:bg-foreground/90 transition-colors flex items-center gap-2 shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Agenda Baru</span>
        </button>
      </div>

      {/* 2. Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface border border-border-hairline space-y-1">
          <span className="font-mono text-[10px] uppercase text-muted tracking-widest block">
            TOTAL AGENDA
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground">
            {totalEvents}
          </div>
          <span className="text-[11px] text-muted block">Agenda terdata di sistem</span>
        </div>

        <div className="p-4 bg-surface border border-border-hairline space-y-1">
          <span className="font-mono text-[10px] uppercase text-muted tracking-widest block">
            AGENDA TERBUKA
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground">
            {activeEvents}
          </div>
          <span className="text-[11px] text-muted block">Menerima pendaftaran warga</span>
        </div>

        <div className="p-4 bg-surface border border-border-hairline space-y-1">
          <span className="font-mono text-[10px] uppercase text-muted tracking-widest block">
            WARGA TERDAFTAR
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground">
            {totalRegistrations}
          </div>
          <span className="text-[11px] text-muted block">Total tiket kegiatan diterbitkan</span>
        </div>

        <div className="p-4 bg-surface border border-border-hairline space-y-1">
          <span className="font-mono text-[10px] uppercase text-muted tracking-widest block">
            KEHADIRAN LAPAK
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground">
            {totalAttended}
          </div>
          <span className="text-[11px] text-muted block">
            {totalRegistrations > 0
              ? `${Math.round((totalAttended / totalRegistrations) * 100)}% rasio kehadiran`
              : 'Presensi tercatat di lapak'}
          </span>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface border border-border-hairline">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
          {[
            { id: 'all', label: 'SEMUA' },
            { id: 'mendatang', label: 'AKAN DATANG' },
            { id: 'selesai', label: 'SELESAI' },
            { id: 'draft', label: 'DRAF' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 uppercase font-bold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Type Select */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-surface border border-border-hairline font-mono text-xs uppercase focus:outline-hidden"
          >
            <option value="ALL">Semua Tipe</option>
            <option value={EventType.LAPAK}>Lapak Baca</option>
            <option value={EventType.DISKUSI}>Diskusi Sastra</option>
            <option value={EventType.WORKSHOP}>Workshop</option>
            <option value={EventType.KELAS}>Kelas Literasi</option>
            <option value={EventType.LAINNYA}>Lainnya</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul / lokasi..."
              className="pl-8 pr-3 py-1.5 bg-surface border border-border-hairline font-mono text-xs focus:outline-hidden w-40 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* 4. Events Table / List */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <CustomLoader size="md" label="MEMUAT AGENDA KEGIATAN..." />
        </div>
      ) : errorMsg ? (
        <div className="p-8 border border-destructive bg-surface text-center space-y-3 font-mono text-xs">
          <AlertCircle className="w-6 h-6 text-destructive mx-auto" />
          <p className="text-foreground">{errorMsg}</p>
          <button
            type="button"
            onClick={loadEvents}
            className="px-4 py-1.5 border border-foreground bg-surface uppercase font-bold hover:bg-surface-muted transition-colors"
          >
            Coba Muat Ulang
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-border-hairline bg-surface text-center space-y-3">
          <Calendar className="w-8 h-8 text-muted mx-auto" />
          <h3 className="font-serif font-bold text-base text-foreground">
            Belum Ada Agenda Kegiatan
          </h3>
          <p className="font-sans text-xs text-muted max-w-sm mx-auto">
            {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'all'
              ? 'Tidak ada agenda yang cocok dengan filter pencarian Anda.'
              : 'Belum ada agenda lapak yang dijadwalkan. Klik tombol di atas untuk membuat kegiatan baru.'}
          </p>
        </div>
      ) : (
        <div className="border border-border-hairline bg-surface overflow-x-auto shadow-xs">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b-2 border-foreground bg-surface-muted/60 font-mono text-[10px] uppercase tracking-wider text-muted select-none">
                <th className="py-3 px-4">Status & Tipe</th>
                <th className="py-3 px-4">Judul Agenda</th>
                <th className="py-3 px-4">Jadwal & Tempat</th>
                <th className="py-3 px-4">Partisipasi</th>
                <th className="py-3 px-4">Penyelenggara</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {events.map((ev) => {
                const startDate = new Date(ev.startAt);
                const dateStr = startDate.toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const timeStr = startDate.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={ev.id} className="hover:bg-surface-muted/30 transition-colors">
                    {/* Status & Type */}
                    <td className="py-3.5 px-4 align-top space-y-1.5 whitespace-nowrap">
                      <div>{getStatusBadge(ev.status)}</div>
                      <span className="font-mono text-[9px] text-muted uppercase tracking-wider block">
                        // {ev.type}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 align-top max-w-xs sm:max-w-sm">
                      <div className="font-serif font-bold text-sm text-foreground leading-snug">
                        {ev.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Link
                          href={`/kegiatan/${ev.slug}`}
                          target="_blank"
                          className="font-mono text-[10px] text-muted hover:text-foreground inline-flex items-center gap-1 hover:underline"
                        >
                          <span>Halaman Publik</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </td>

                    {/* Schedule & Location */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-muted" />
                        <span>{dateStr} • {timeStr}</span>
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5 truncate max-w-xs">
                        <MapPin className="w-3 h-3 text-muted shrink-0" />
                        <span className="truncate">{ev.locationName}</span>
                      </div>
                    </td>

                    {/* Participation Stats */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted" />
                        <span className="font-bold text-foreground">
                          {ev.registeredCount}
                          {ev.quota ? ` / ${ev.quota}` : ''}
                        </span>
                        <span className="text-[10px] text-muted">terdaftar</span>
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">
                        {ev.attendedCount || 0} hadir di lokasi
                      </div>
                    </td>

                    {/* Organizer */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <span className="font-mono text-xs text-foreground block">
                        {ev.organizer?.name || 'Panitia'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Presensi Peserta Button */}
                        <Link
                          href={`/dashboard/kegiatan/${ev.id}`}
                          className="px-2.5 py-1.5 bg-foreground text-background font-mono text-[11px] uppercase tracking-wider font-bold hover:bg-foreground/90 transition-colors inline-flex items-center gap-1 shadow-xs"
                          title="Buka Meja Presensi & Daftar Hadir Peserta"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Presensi</span>
                        </Link>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEvent(ev);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 border border-border-hairline hover:border-foreground bg-surface text-foreground transition-colors"
                          title="Sunting Agenda"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Complete & Document Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setCompletingEvent(ev);
                            setIsCompleteModalOpen(true);
                          }}
                          className="p-1.5 border border-border-hairline hover:border-foreground bg-surface text-foreground transition-colors"
                          title="Dokumentasi & Selesaikan Kegiatan"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(ev)}
                          className="p-1.5 border border-border-hairline hover:border-destructive hover:text-destructive bg-surface text-muted transition-colors"
                          title="Hapus Agenda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      <EventFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEvent(null);
        }}
        onSuccess={loadEvents}
        initialData={editingEvent}
      />

      {/* Complete & Document Modal */}
      <EventCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setCompletingEvent(null);
        }}
        onSuccess={loadEvents}
        event={completingEvent}
      />
    </div>
  );
}
