'use client';

import * as React from 'react';
import { X, Calendar, Clock, MapPin, Globe, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { EventItem, EventDetail, EventType, EventStatus } from '@perpusjal/types';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: EventItem | EventDetail | null;
}

function toLocalDatetimeInput(isoString?: string | null): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function EventFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: EventFormModalProps) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = React.useState('');
  const [type, setType] = React.useState<EventType>(EventType.LAPAK);
  const [startAt, setStartAt] = React.useState('');
  const [endAt, setEndAt] = React.useState('');
  const [locationName, setLocationName] = React.useState('');
  const [locationDetail, setLocationDetail] = React.useState('');
  const [mapUrl, setMapUrl] = React.useState('');
  const [isOnline, setIsOnline] = React.useState(false);
  const [meetingUrl, setMeetingUrl] = React.useState('');
  const [quota, setQuota] = React.useState<string>('');
  const [status, setStatus] = React.useState<EventStatus>(EventStatus.PUBLISHED);
  const [isParticipantListPublic, setIsParticipantListPublic] = React.useState(false);
  const [description, setDescription] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setTitle(initialData.title || '');
      setType(initialData.type || EventType.LAPAK);
      setStartAt(toLocalDatetimeInput(initialData.startAt));
      setEndAt(toLocalDatetimeInput(initialData.endAt));
      setLocationName(initialData.locationName || '');
      setQuota(initialData.quota ? String(initialData.quota) : '');
      setStatus(initialData.status || EventStatus.PUBLISHED);
      setIsOnline(Boolean(initialData.isOnline));

      const detailed = initialData as EventDetail;
      setLocationDetail(detailed.locationDetail || '');
      setMapUrl(detailed.mapUrl || '');
      setMeetingUrl(detailed.meetingUrl || '');
      setIsParticipantListPublic(Boolean(detailed.isParticipantListPublic));

      if (typeof detailed.description === 'string') {
        setDescription(detailed.description);
      } else if (detailed.description && typeof detailed.description === 'object') {
        setDescription(JSON.stringify(detailed.description, null, 2));
      } else {
        setDescription('');
      }
    } else {
      // Defaults for new event: Next Sunday 15:30 - 17:30
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + ((7 - nextDate.getDay()) % 7 || 7));
      nextDate.setHours(15, 30, 0, 0);

      const endDate = new Date(nextDate);
      endDate.setHours(17, 30, 0, 0);

      setTitle('');
      setType(EventType.LAPAK);
      setStartAt(toLocalDatetimeInput(nextDate.toISOString()));
      setEndAt(toLocalDatetimeInput(endDate.toISOString()));
      setLocationName('Alun-Alun Blora Barat');
      setLocationDetail('Di bawah pohon trembesi rindang seberang Masjid Agung.');
      setMapUrl('');
      setIsOnline(false);
      setMeetingUrl('');
      setQuota('');
      setStatus(EventStatus.PUBLISHED);
      setIsParticipantListPublic(true);
      setDescription(
        'Lapak baca buku gratis dan ruang temu literasi terbuka untuk seluruh warga Blora. Bawa bacaan favoritmu atau pinjam koleksi kami di tempat.'
      );
    }
    setErrorMsg(null);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg('Judul kegiatan minimal 3 karakter.');
      return;
    }
    if (!startAt || !endAt) {
      setErrorMsg('Waktu mulai dan selesai wajib ditentukan.');
      return;
    }
    if (new Date(endAt) <= new Date(startAt)) {
      setErrorMsg('Waktu selesai harus setelah waktu mulai.');
      return;
    }
    if (!locationName.trim()) {
      setErrorMsg('Nama lokasi kegiatan wajib diisi.');
      return;
    }

    setLoading(true);

    const payload: any = {
      title: title.trim(),
      type,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      locationName: locationName.trim(),
      locationDetail: locationDetail.trim() || null,
      mapUrl: mapUrl.trim() || null,
      isOnline,
      meetingUrl: isOnline && meetingUrl.trim() ? meetingUrl.trim() : null,
      quota: quota.trim() ? parseInt(quota.trim(), 10) : null,
      status,
      isParticipantListPublic,
      description: description.trim() || 'Kegiatan literasi Perpustakaan Jalanan Blora.',
    };

    try {
      if (isEditing && initialData) {
        const res = await apiClient<{ data: EventDetail }>(`/events/${initialData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });

        if (res.error) {
          setErrorMsg(res.error.message || 'Gagal memperbarui kegiatan.');
          setLoading(false);
          return;
        }
      } else {
        const res = await apiClient<{ data: EventDetail }>('/events', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        if (res.error) {
          setErrorMsg(res.error.message || 'Gagal membuat kegiatan baru.');
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Terjadi kesalahan sistem.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-surface border-2 border-foreground max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-foreground flex items-center justify-between bg-surface-muted shrink-0">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {isEditing ? 'SUNTING AGENDA // REDAKSI' : 'AGENDA BARU // DOKUMEN LAPAK'}
            </div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-foreground">
              {isEditing ? `Sunting: ${initialData?.title}` : 'Buat Agenda Lapak Baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-surface border border-transparent hover:border-foreground transition-colors text-foreground"
            aria-label="Tutup Formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-surface-muted border-2 border-destructive flex items-start gap-2.5 font-mono text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Judul Kegiatan */}
          <div className="space-y-1.5">
            <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground">
              Judul Agenda Kegiatan <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Lapak Baca Sore & Donasi Buku Warga #42"
              className="w-full px-3 py-2 bg-surface border border-foreground font-sans text-sm focus:outline-hidden focus:ring-1 focus:ring-foreground"
              required
            />
          </div>

          {/* Tipe & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                Tipe Kegiatan
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full px-3 py-2 bg-surface border border-foreground font-mono text-xs uppercase focus:outline-hidden"
              >
                <option value={EventType.LAPAK}>Lapak Baca (Rutin)</option>
                <option value={EventType.DISKUSI}>Diskusi Sastra & Bedah Buku</option>
                <option value={EventType.WORKSHOP}>Workshop / Lokakarya Menulis</option>
                <option value={EventType.KELAS}>Kelas Literasi Warga</option>
                <option value={EventType.LAINNYA}>Kegiatan Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                Status Agenda
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-3 py-2 bg-surface border border-foreground font-mono text-xs uppercase focus:outline-hidden"
              >
                <option value={EventStatus.PUBLISHED}>Terbit (Published)</option>
                <option value={EventStatus.OPEN}>Pendaftaran Terbuka (Open)</option>
                <option value={EventStatus.DRAFT}>Draf / Belum Diumumkan</option>
                <option value={EventStatus.FULL}>Kuota Penuh (Full)</option>
                <option value={EventStatus.CLOSED}>Pendaftaran Ditutup (Closed)</option>
                <option value={EventStatus.COMPLETED}>Selesai (Completed)</option>
                <option value={EventStatus.CANCELLED}>Dibatalkan (Cancelled)</option>
              </select>
            </div>
          </div>

          {/* Waktu Mulai & Waktu Selesai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-surface-muted/30 border border-border-hairline">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Waktu Mulai <span className="text-destructive">*</span></span>
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-foreground font-mono text-xs focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Waktu Selesai <span className="text-destructive">*</span></span>
              </label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-foreground font-mono text-xs focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Lokasi & Detail */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Nama Lokasi / Lapak <span className="text-destructive">*</span></span>
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Contoh: Alun-Alun Blora Barat / Taman Tirtonadi"
                className="w-full px-3 py-2 bg-surface border border-foreground font-sans text-sm focus:outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-muted">
                  Petunjuk Detail Arah (Opsional)
                </label>
                <input
                  type="text"
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  placeholder="Contoh: Bawa tikar, dekat pohon beringin timur"
                  className="w-full px-3 py-1.5 bg-surface border border-border-hairline font-sans text-xs focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-muted">
                  Tautan Google Maps (Opsional)
                </label>
                <input
                  type="url"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3 py-1.5 bg-surface border border-border-hairline font-sans text-xs focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Kuota & Format Daring/Luring */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Batas Kuota Peserta</span>
              </label>
              <input
                type="number"
                min="1"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                placeholder="Kosongkan jika terbuka tanpa batas"
                className="w-full px-3 py-2 bg-surface border border-border-hairline font-mono text-xs focus:outline-hidden"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs">
                <input
                  type="checkbox"
                  checked={isParticipantListPublic}
                  onChange={(e) => setIsParticipantListPublic(e.target.checked)}
                  className="rounded-none border-foreground focus:ring-0"
                />
                <span>Tampilkan daftar peserta secara publik</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs">
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                  className="rounded-none border-foreground focus:ring-0"
                />
                <span>Kegiatan Daring (Online / Webinar)</span>
              </label>
            </div>
          </div>

          {isOnline && (
            <div className="space-y-1.5 p-3 bg-surface-muted/40 border border-border-hairline animate-in fade-in">
              <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Tautan Pertemuan Online (Google Meet / Zoom)</span>
              </label>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-1.5 bg-surface border border-foreground font-mono text-xs focus:outline-hidden"
              />
              <span className="text-[10px] text-muted font-mono block">
                * Tautan ini hanya terlihat oleh peserta yang sudah terdaftar.
              </span>
            </div>
          )}

          {/* Deskripsi Narasi */}
          <div className="space-y-1.5">
            <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground">
              Deskripsi & Narasi Kegiatan
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan latar belakang, pembicara/fasilitator, agenda lapak, serta hal yang perlu dibawa peserta..."
              className="w-full p-3 bg-surface border border-foreground font-sans text-sm focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Sticky Actions Footer */}
          <div className="pt-4 border-t-2 border-foreground flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-border-hairline hover:border-foreground text-foreground font-mono text-xs uppercase tracking-wider font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-foreground text-background border-2 border-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
            >
              {loading ? (
                <span>MENYIMPAN DOKUMEN...</span>
              ) : (
                <span>{isEditing ? 'PERBARUI AGENDA' : 'TERBITKAN AGENDA'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
