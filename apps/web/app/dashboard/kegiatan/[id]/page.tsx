'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarCheck,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Search,
  AlertCircle,
  Printer,
  QrCode,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { EventDetail, EventRegistrationItem, RegistrationStatus } from '@perpusjal/types';
import { CameraQrScannerModal } from '@/components/circulation/camera-qr-scanner-modal';

interface CheckinApiResponse {
  message: string;
  attendeeName?: string;
  alreadyAttended?: boolean;
}

export default function EventPresensiPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const [event, setEvent] = React.useState<EventDetail | null>(null);
  const [registrations, setRegistrations] = React.useState<EventRegistrationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Fast Check-in Input
  const [inputCode, setInputCode] = React.useState('');
  const [checkinLoading, setCheckinLoading] = React.useState(false);
  const [checkinSuccessMsg, setCheckinSuccessMsg] = React.useState<string | null>(null);
  const [checkinErrorMsg, setCheckinErrorMsg] = React.useState<string | null>(null);

  // Camera Scanner Modal
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);

  // Table Filter & Search
  const [attendanceTab, setAttendanceTab] = React.useState<'all' | 'attended' | 'pending'>('all');
  const [searchAttendee, setSearchAttendee] = React.useState('');

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const [eventRes, regRes] = await Promise.all([
        apiClient<{ data: EventDetail }>(`/events/admin/${eventId}`),
        apiClient<{ data: EventRegistrationItem[] }>(`/events/${eventId}/registrations`),
      ]);

      if (eventRes.error) {
        setErrorMsg(eventRes.error.message || 'Gagal memuat detail agenda.');
      } else if (eventRes.data) {
        setEvent(eventRes.data.data);
      }

      if (regRes.error) {
        setErrorMsg(regRes.error.message || 'Gagal memuat daftar peserta.');
      } else if (regRes.data) {
        setRegistrations(regRes.data.data || []);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Execute Check-in
  const executeCheckin = async (codeToSubmit: string) => {
    const cleanCode = codeToSubmit.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 5) {
      setCheckinErrorMsg('Kode hadir minimal 6 karakter.');
      return;
    }

    setCheckinLoading(true);
    setCheckinErrorMsg(null);
    setCheckinSuccessMsg(null);

    try {
      const res = await apiClient<CheckinApiResponse>(`/events/${eventId}/checkin`, {
        method: 'POST',
        body: JSON.stringify({ attendanceCode: cleanCode }),
      });

      setCheckinLoading(false);

      if (res.error) {
        setCheckinErrorMsg(res.error.message || 'Kode hadir tidak terdaftar dalam kegiatan ini.');
        return;
      }

      if (res.data) {
        setCheckinSuccessMsg(res.data.message);
        setInputCode('');
        // Reload registrations silently
        const regRes = await apiClient<{ data: EventRegistrationItem[] }>(
          `/events/${eventId}/registrations`
        );
        if (regRes.data) {
          setRegistrations(regRes.data.data || []);
        }
      }
    } catch (err: any) {
      setCheckinLoading(false);
      setCheckinErrorMsg(err?.message || 'Gagal memproses presensi.');
    }
  };

  // 1-Click Checkin from row
  const handleDirectCheckin = (reg: EventRegistrationItem) => {
    if (reg.attendanceCode) {
      executeCheckin(reg.attendanceCode);
    }
  };

  // Handle Scan Callback
  const handleCameraScan = (decodedText: string) => {
    // Trim spaces, extract alphanumeric 6 chars if needed
    const clean = decodedText.trim().toUpperCase();
    executeCheckin(clean);
  };

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    const isAttended = r.status === RegistrationStatus.ATTENDED;
    if (attendanceTab === 'attended' && !isAttended) return false;
    if (attendanceTab === 'pending' && isAttended) return false;

    if (searchAttendee.trim()) {
      const q = searchAttendee.toLowerCase();
      const matchName = r.user?.name?.toLowerCase().includes(q);
      const matchUsername = r.user?.username?.toLowerCase().includes(q);
      const matchEmail = r.user?.email?.toLowerCase().includes(q);
      const matchCode = r.attendanceCode?.toLowerCase().includes(q);
      return matchName || matchUsername || matchEmail || matchCode;
    }

    return true;
  });

  const totalRegistered = registrations.length;
  const totalAttended = registrations.filter((r) => r.status === RegistrationStatus.ATTENDED).length;
  const attendanceRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <CustomLoader size="md" label="MEMBUKA LEMBAR PRESENSI LAPAK..." />
      </div>
    );
  }

  if (errorMsg || !event) {
    return (
      <div className="p-10 max-w-xl mx-auto text-center space-y-4 font-sans">
        <div className="border-2 border-foreground p-8 bg-surface space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <h2 className="font-serif font-bold text-xl text-foreground">Gagal Membuka Presensi</h2>
          <p className="font-sans text-xs text-muted">{errorMsg || 'Agenda tidak ditemukan.'}</p>
          <div className="pt-2">
            <Link
              href="/dashboard/kegiatan"
              className="px-4 py-2 border border-foreground bg-foreground text-background font-mono text-xs uppercase font-bold inline-block hover:opacity-90"
            >
              &larr; Kembali ke Meja Agenda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.startAt);
  const formattedDate = startDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const startTime = startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl font-sans text-foreground">
      {/* 1. Top Navigation & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/kegiatan"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Meja Agenda</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-border-hairline hover:border-foreground bg-surface text-foreground font-mono text-xs uppercase font-bold transition-colors inline-flex items-center gap-1.5"
            title="Cetak lembar presensi untuk arsip fisik"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Lembar Presensi</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            className="p-1.5 border border-border-hairline hover:border-foreground bg-surface text-foreground transition-colors"
            title="Segarkan data presensi"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Event Header Masthead */}
      <div className="border-b-2 border-foreground pb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span className="px-2 py-0.5 border border-foreground bg-foreground text-background font-bold">
            {event.type}
          </span>
          <span>STATUS // {event.status}</span>
          <span>•</span>
          <span>KODE AGENDA // #{event.id.slice(-6).toUpperCase()}</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
          {event.title}
        </h1>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 font-mono text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-foreground" />
            <span className="text-foreground font-bold">{formattedDate} • {startTime} WIB</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-foreground" />
            <span className="text-foreground">{event.locationName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-foreground" />
            <span>
              Penyelenggara: <strong className="text-foreground">{event.organizer?.name}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Fast Check-in Bar (Interactive Desk) */}
      <div className="p-5 sm:p-6 bg-surface border-2 border-foreground shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-border-hairline pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-foreground" />
            <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
              Bilah Presensi Cepat (Fast Check-in)
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted hidden sm:inline">
            RELAVAN LAPAK • PERPUSJAL
          </span>
        </div>

        {/* Input Form & Camera Trigger */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCheckin(inputCode);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="KETIK 6 DIGIT KODE HADIR (MISAL: H7K92P)..."
              className="w-full px-4 py-3 bg-surface border-2 border-foreground font-mono text-base tracking-widest uppercase focus:outline-hidden focus:ring-2 focus:ring-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={checkinLoading || !inputCode.trim()}
            className="px-6 py-3 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold border-2 border-foreground hover:bg-foreground/90 transition-colors disabled:opacity-50 shrink-0"
          >
            {checkinLoading ? 'MEMERIKSA...' : 'KONFIRMASI HADIR'}
          </button>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-5 py-3 bg-surface border-2 border-foreground hover:bg-surface-muted text-foreground font-mono text-xs uppercase tracking-wider font-bold transition-colors inline-flex items-center justify-center gap-2 shrink-0 shadow-xs"
            title="Gunakan Kamera HP untuk Pindai QR Tiket Warga"
          >
            <Camera className="w-4 h-4" />
            <span>PINDAI KAMERA HP</span>
          </button>
        </form>

        {/* Feedback Banners */}
        {checkinSuccessMsg && (
          <div className="p-3 bg-emerald-950/10 border-2 border-emerald-600 text-emerald-900 font-mono text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{checkinSuccessMsg}</span>
          </div>
        )}

        {checkinErrorMsg && (
          <div className="p-3 bg-destructive/10 border-2 border-destructive text-destructive font-mono text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            <span>{checkinErrorMsg}</span>
          </div>
        )}
      </div>

      {/* 4. Stat Summary & Attendance Progress Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-surface border border-border-hairline space-y-1">
          <span className="font-mono text-[10px] uppercase text-muted tracking-widest block">
            TOTAL TERDAFTAR
          </span>
          <div className="font-mono text-2xl font-bold text-foreground">
            {totalRegistered} <span className="text-xs font-normal text-muted">warga</span>
          </div>
        </div>

        <div className="p-4 bg-surface border border-border-hairline space-y-1">
          <span className="font-mono text-[10px] uppercase text-muted tracking-widest block">
            SUDAH PRESENSI (HADIR)
          </span>
          <div className="font-mono text-2xl font-bold text-emerald-700">
            {totalAttended} <span className="text-xs font-normal text-muted">peserta</span>
          </div>
        </div>

        <div className="p-4 bg-surface border border-border-hairline space-y-1">
          <span className="font-mono text-[10px] uppercase text-muted tracking-widest block">
            RASIO KEHADIRAN LAPAK
          </span>
          <div className="font-mono text-2xl font-bold text-foreground">
            {attendanceRate}%
          </div>
          <div className="w-full h-1.5 bg-surface-muted border border-border-hairline overflow-hidden mt-1">
            <div
              className="h-full bg-foreground transition-all duration-300"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Attendee Table Section */}
      <div className="space-y-4">
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface border border-border-hairline">
          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setAttendanceTab('all')}
              className={`px-3 py-1.5 uppercase font-bold transition-colors ${
                attendanceTab === 'all'
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              SEMUA ({totalRegistered})
            </button>
            <button
              type="button"
              onClick={() => setAttendanceTab('attended')}
              className={`px-3 py-1.5 uppercase font-bold transition-colors ${
                attendanceTab === 'attended'
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              SUDAH HADIR ({totalAttended})
            </button>
            <button
              type="button"
              onClick={() => setAttendanceTab('pending')}
              className={`px-3 py-1.5 uppercase font-bold transition-colors ${
                attendanceTab === 'pending'
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              BELUM HADIR ({totalRegistered - totalAttended})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchAttendee}
              onChange={(e) => setSearchAttendee(e.target.value)}
              placeholder="Cari nama, email, atau kode hadir..."
              className="pl-8 pr-3 py-1.5 bg-surface border border-border-hairline font-mono text-xs focus:outline-hidden w-full sm:w-64"
            />
          </div>
        </div>

        {/* Table */}
        {filteredRegistrations.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-border-hairline bg-surface text-center space-y-2">
            <Users className="w-8 h-8 text-muted mx-auto" />
            <h4 className="font-serif font-bold text-sm text-foreground">
              Tidak Ada Peserta
            </h4>
            <p className="font-sans text-xs text-muted">
              {searchAttendee
                ? 'Tidak ada peserta yang cocok dengan kata kunci pencarian.'
                : 'Belum ada peserta dalam kategori ini.'}
            </p>
          </div>
        ) : (
          <div className="border border-border-hairline bg-surface overflow-x-auto shadow-xs">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b-2 border-foreground bg-surface-muted/60 font-mono text-[10px] uppercase tracking-wider text-muted select-none">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Nama Peserta</th>
                  <th className="py-3 px-4">Identitas Akun</th>
                  <th className="py-3 px-4">Kode Hadir</th>
                  <th className="py-3 px-4">Waktu Daftar</th>
                  <th className="py-3 px-4">Status Presensi</th>
                  <th className="py-3 px-4 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {filteredRegistrations.map((reg, idx) => {
                  const isAttended = reg.status === RegistrationStatus.ATTENDED;
                  const regDate = new Date(reg.registeredAt);
                  const regDateStr = regDate.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <tr
                      key={reg.id}
                      className={`hover:bg-surface-muted/30 transition-colors ${
                        isAttended ? 'bg-emerald-500/[0.03]' : ''
                      }`}
                    >
                      {/* Number */}
                      <td className="py-3 px-4 font-mono text-xs text-muted">
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 border border-foreground bg-foreground text-background flex items-center justify-center font-serif text-[11px] font-bold uppercase shrink-0">
                            {reg.user?.name?.slice(0, 1) || 'W'}
                          </div>
                          <span>{reg.user?.name || 'Warga'}</span>
                        </div>
                      </td>

                      {/* Account info */}
                      <td className="py-3 px-4 font-mono text-xs text-muted">
                        <div>@{reg.user?.username}</div>
                        <div className="text-[10px] text-muted/80">{reg.user?.email}</div>
                      </td>

                      {/* Attendance Code */}
                      <td className="py-3 px-4 font-mono text-sm font-extrabold tracking-widest text-foreground">
                        <span className="px-2 py-0.5 border border-border-hairline bg-surface-muted/50">
                          {reg.attendanceCode}
                        </span>
                      </td>

                      {/* Registered At */}
                      <td className="py-3 px-4 font-mono text-xs text-muted whitespace-nowrap">
                        {regDateStr}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isAttended ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 border border-emerald-600 bg-emerald-600 text-white font-mono text-[9px] uppercase font-bold tracking-wider inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>HADIR</span>
                            </span>
                            {reg.checkedInAt && (
                              <span className="block font-mono text-[9px] text-muted">
                                Pukul {new Date(reg.checkedInAt).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })} WIB
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 border border-border-hairline bg-surface-muted text-muted font-mono text-[9px] uppercase tracking-wider font-bold">
                            TERDAFTAR
                          </span>
                        )}
                      </td>

                      {/* 1-Click Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!isAttended ? (
                          <button
                            type="button"
                            onClick={() => handleDirectCheckin(reg)}
                            disabled={checkinLoading}
                            className="px-3 py-1 bg-foreground text-background font-mono text-[10px] uppercase font-bold hover:bg-foreground/90 transition-colors inline-flex items-center gap-1"
                            title="Presensikan Hadir (1-Klik)"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Presensikan</span>
                          </button>
                        ) : (
                          <span className="font-mono text-[10px] text-emerald-700 font-bold">
                            Terkonfirmasi
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Camera QR Scanner Modal */}
      <CameraQrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleCameraScan}
        title="Pemindai Presensi Lapak"
        instruction="Arahkan kamera ke QR Code Tiket Kehadiran pada ponsel warga"
      />
    </div>
  );
}
