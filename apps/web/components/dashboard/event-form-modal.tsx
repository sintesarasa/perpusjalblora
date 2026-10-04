'use client';

import * as React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Users,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Camera,
  Archive,
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { EventItem, EventDetail, EventType, EventStatus } from '@perpusjal/types';
import { EventCoverUploader } from '@/components/events/event-cover-uploader';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: EventItem | EventDetail | null;
  initialMode?: 'upcoming' | 'archive';
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

const COVER_PRESETS = [
  {
    name: 'Terpal CFD Alun-Alun',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Diskusi Buku Malam',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Workshop & Kriya Anak',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Kemah Tepi Hutan Jati',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80',
  },
];

export function EventFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  initialMode = 'upcoming',
}: EventFormModalProps) {
  const isEditing = Boolean(initialData);

  // Form Mode: Upcoming vs Historical Archive
  const [formMode, setFormMode] = React.useState<'upcoming' | 'archive'>('upcoming');

  const [title, setTitle] = React.useState('');
  const [type, setType] = React.useState<EventType>(EventType.LAPAK);
  const [startAt, setStartAt] = React.useState('');
  const [endAt, setEndAt] = React.useState('');
  const [locationName, setLocationName] = React.useState('');
  const [locationDetail, setLocationDetail] = React.useState('');
  const [mapUrl, setMapUrl] = React.useState('');
  const [coverImage, setCoverImage] = React.useState('');
  const [isOnline, setIsOnline] = React.useState(false);
  const [meetingUrl, setMeetingUrl] = React.useState('');
  const [quota, setQuota] = React.useState<string>('');
  const [status, setStatus] = React.useState<EventStatus>(EventStatus.PUBLISHED);
  const [isParticipantListPublic, setIsParticipantListPublic] = React.useState(false);
  const [description, setDescription] = React.useState('');

  // Historical Archive / Post-Event Specific Fields
  const [summary, setSummary] = React.useState('');
  const [galleryUrls, setGalleryUrls] = React.useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Initialize or reset form state
  React.useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const detailed = initialData as EventDetail;
      const isPast = detailed.status === EventStatus.COMPLETED || new Date(detailed.startAt).getTime() < Date.now();
      setFormMode(isPast ? 'archive' : 'upcoming');

      setTitle(initialData.title || '');
      setType(initialData.type || EventType.LAPAK);
      setStartAt(toLocalDatetimeInput(initialData.startAt));
      setEndAt(toLocalDatetimeInput(initialData.endAt));
      setLocationName(initialData.locationName || '');
      setCoverImage(initialData.coverImage || '');
      setQuota(initialData.quota ? String(initialData.quota) : '');
      setStatus(initialData.status || (isPast ? EventStatus.COMPLETED : EventStatus.PUBLISHED));
      setIsOnline(Boolean(initialData.isOnline));

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

      setSummary(detailed.summary || '');
      setGalleryUrls(detailed.gallery || []);
    } else {
      setFormMode(initialMode);

      if (initialMode === 'archive') {
        // Defaults for Past Archive Event: Past Sunday 06:00 - 09:00 WIB
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - ((pastDate.getDay() + 7) % 7 || 7));
        pastDate.setHours(6, 0, 0, 0);

        const endDate = new Date(pastDate);
        endDate.setHours(9, 0, 0, 0);

        setTitle('');
        setType(EventType.LAPAK);
        setStartAt(toLocalDatetimeInput(pastDate.toISOString()));
        setEndAt(toLocalDatetimeInput(endDate.toISOString()));
        setLocationName('Depan Pendopo Alun-Alun Blora');
        setLocationDetail('Di bawah pohon trembesi rindang seberang Masjid Agung.');
        setMapUrl('');
        setCoverImage(COVER_PRESETS[0].url);
        setIsOnline(false);
        setMeetingUrl('');
        setQuota('');
        setStatus(EventStatus.COMPLETED);
        setIsParticipantListPublic(false);
        setDescription('Dokumentasi lapak baca dan perjumpaan literasi warga yang telah selesai terselenggara.');
        setSummary('');
        setGalleryUrls([]);
      } else {
        // Defaults for Upcoming Event: Next Sunday 06:00 - 09:00 WIB
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + ((7 - nextDate.getDay()) % 7 || 7));
        nextDate.setHours(6, 0, 0, 0);

        const endDate = new Date(nextDate);
        endDate.setHours(9, 0, 0, 0);

        setTitle('');
        setType(EventType.LAPAK);
        setStartAt(toLocalDatetimeInput(nextDate.toISOString()));
        setEndAt(toLocalDatetimeInput(endDate.toISOString()));
        setLocationName('Depan Pendopo Alun-Alun Blora');
        setLocationDetail('Di bawah pohon trembesi rindang seberang Masjid Agung.');
        setMapUrl('');
        setCoverImage(COVER_PRESETS[0].url);
        setIsOnline(false);
        setMeetingUrl('');
        setQuota('');
        setStatus(EventStatus.PUBLISHED);
        setIsParticipantListPublic(true);
        setDescription(
          'Hamparan terpal biru di trotoar depan Pendopo Kabupaten Blora. Ambil buku yang kamu pesan lewat website ini, baca bersila di bawah naungan pohon trembesi, nikmati mewarnai gambar fabel untuk anak-anak, atau sekadar berbincang hangat.'
        );
        setSummary('');
        setGalleryUrls([]);
      }
    }
    setErrorMsg(null);
  }, [isOpen, initialData, initialMode]);

  if (!isOpen) return null;

  // Apply Quick Routine CFD Preset
  const handleApplyCfdPreset = () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + ((7 - nextDate.getDay()) % 7 || 7));
    nextDate.setHours(6, 0, 0, 0);

    const endDate = new Date(nextDate);
    endDate.setHours(9, 0, 0, 0);

    setTitle('Lapak Baca Rutin Car Free Day Alun-Alun Blora');
    setType(EventType.LAPAK);
    setStartAt(toLocalDatetimeInput(nextDate.toISOString()));
    setEndAt(toLocalDatetimeInput(endDate.toISOString()));
    setLocationName('Depan Pendopo Alun-Alun Blora');
    setLocationDetail('Trotoar barat Alun-Alun Blora, depan Pendopo Rumah Dinas Bupati.');
    setMapUrl('https://maps.google.com/?q=Alun-alun+Blora');
    setCoverImage(COVER_PRESETS[0].url);
    setIsOnline(false);
    setStatus(EventStatus.PUBLISHED);
    setDescription(
      'Hamparan terpal biru di trotoar depan Pendopo Kabupaten Blora. Ambil buku yang kamu pesan lewat website ini, baca bersila di bawah naungan pohon trembesi, nikmati mewarnai gambar fabel untuk anak-anak, atau sekadar berbincang hangat.'
    );
  };

  // Add Gallery Image
  const handleAddGalleryImage = () => {
    if (!newGalleryInput.trim()) return;
    try {
      new URL(newGalleryInput.trim());
      setGalleryUrls([...galleryUrls, newGalleryInput.trim()]);
      setNewGalleryInput('');
    } catch {
      setErrorMsg('Tautan foto galeri tidak valid. Gunakan format URL lengkap (https://...).');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
  };

  // Live countdown calculation helper
  const getCountdownLabel = () => {
    if (!startAt) return null;
    const target = new Date(startAt).getTime();
    const diff = target - Date.now();
    if (diff <= 0) {
      return { isPast: true, text: 'Waktu pelaksanaan sudah terlewati (Masa Lalu)' };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      isPast: false,
      text: `${days} hari ${hours} jam ${minutes} menit lagi dari sekarang`,
    };
  };

  const countdown = getCountdownLabel();

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

    // In archive mode, summary is highly recommended / required for historical value
    if (formMode === 'archive' && summary.trim().length > 0 && summary.trim().length < 10) {
      setErrorMsg('Ringkasan refleksi kegiatan minimal 10 karakter.');
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
      coverImage: coverImage.trim() || null,
      isOnline,
      meetingUrl: isOnline && meetingUrl.trim() ? meetingUrl.trim() : null,
      quota: quota.trim() ? parseInt(quota.trim(), 10) : null,
      status: formMode === 'archive' ? EventStatus.COMPLETED : status,
      isParticipantListPublic,
      description: description.trim() || 'Kegiatan literasi merdeka Perpustakaan Jalanan Blora.',
      summary: summary.trim() || null,
      gallery: galleryUrls.length > 0 ? galleryUrls : null,
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
      <div className="bg-surface border-2 border-foreground max-w-4xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Mode Switcher */}
        <div className="p-4 sm:p-5 border-b-2 border-foreground flex flex-wrap items-center justify-between gap-3 bg-surface-muted shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {isEditing ? 'SUNTING AGENDA // REDAKSI' : 'LEMBAR KERJA // MANAJEMEN AGENDA'}
              </span>
              <span className="px-1.5 py-0.2 border border-foreground bg-foreground text-background font-mono text-[9px] font-bold uppercase">
                {formMode === 'archive' ? 'ARSIP LAMPAU' : 'AGENDA MENDATANG'}
              </span>
            </div>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-foreground">
              {isEditing
                ? `Sunting: ${initialData?.title}`
                : formMode === 'archive'
                ? 'Rekam Arsip Kegiatan Lampau'
                : 'Buat Agenda Lapak Baru'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <div className="flex items-center border border-foreground bg-surface p-0.5 font-mono text-[10px] uppercase font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setFormMode('upcoming');
                    setStatus(EventStatus.PUBLISHED);
                  }}
                  className={`px-2.5 py-1 transition-colors flex items-center gap-1.5 ${
                    formMode === 'upcoming'
                      ? 'bg-foreground text-background'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Mendatang</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormMode('archive');
                    setStatus(EventStatus.COMPLETED);
                  }}
                  className={`px-2.5 py-1 transition-colors flex items-center gap-1.5 ${
                    formMode === 'archive'
                      ? 'bg-foreground text-background'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <Archive className="w-3 h-3 text-amber-500" />
                  <span>Arsip Lampau</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-surface border border-transparent hover:border-foreground transition-colors text-foreground"
              aria-label="Tutup Formulir"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Shortcut Bar (Only for upcoming events) */}
        {formMode === 'upcoming' && !isEditing && (
          <div className="px-4 sm:px-6 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Butuh jadwal cepat sesi akhir pekan?</span>
            </span>
            <button
              type="button"
              onClick={handleApplyCfdPreset}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-wider text-[10px] border border-black shadow-xs transition-colors"
            >
              ✦ Isi Template Lapak CFD Minggu Ini
            </button>
          </div>
        )}

        {/* Archive Mode Banner Alert */}
        {formMode === 'archive' && (
          <div className="px-4 sm:px-6 py-2.5 bg-zinc-900 text-white border-b border-foreground flex items-center gap-2 text-xs font-mono">
            <Archive className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Mode Arsip Kegiatan Lampau:</strong> Kegiatan ini akan langsung disimpan dengan status{' '}
              <span className="text-amber-400 font-bold">SELESAI (COMPLETED)</span> dan masuk ke tab Riwayat Kegiatan Warga.
            </span>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-surface-muted border-2 border-destructive flex items-start gap-2.5 font-mono text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Pokok Agenda */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                Judul Agenda Kegiatan <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Lapak Baca CFD Alun-Alun & Mewarnai Anak #45"
                className="w-full px-3 py-2 bg-surface border border-foreground font-sans text-sm font-semibold focus:outline-hidden focus:ring-1 focus:ring-foreground"
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
                  <option value={EventType.WORKSHOP}>Workshop / Lokakarya Kriya</option>
                  <option value={EventType.KELAS}>Kelas Literasi Warga</option>
                  <option value={EventType.NOBAR}>Nonton Bareng &amp; Bedah Film</option>
                  <option value={EventType.LAINNYA}>Agenda Khusus / Kemah</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                  Status Agenda
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  disabled={formMode === 'archive'}
                  className="w-full px-3 py-2 bg-surface border border-foreground font-mono text-xs uppercase focus:outline-hidden disabled:bg-surface-muted"
                >
                  <option value={EventStatus.PUBLISHED}>Terbit (Published)</option>
                  <option value={EventStatus.OPEN}>Pendaftaran Terbuka (Open)</option>
                  <option value={EventStatus.DRAFT}>Draf / Rencana Tertutup</option>
                  <option value={EventStatus.FULL}>Kuota Penuh (Full)</option>
                  <option value={EventStatus.CLOSED}>Pendaftaran Ditutup (Closed)</option>
                  <option value={EventStatus.COMPLETED}>Selesai / Diarsipkan (Completed)</option>
                  <option value={EventStatus.CANCELLED}>Dibatalkan (Cancelled)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Waktu & Live Countdown Preview */}
          <div className="space-y-3 p-3.5 bg-surface-muted/30 border border-border-hairline">
            <div className="flex items-center justify-between border-b border-border-hairline pb-2">
              <span className="font-mono text-xs uppercase tracking-widest font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Jadwal Waktu Pelaksanaan</span>
              </span>
              {countdown && (
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider ${
                    countdown.isPast
                      ? 'bg-surface-muted text-muted border border-border-hairline'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                  }`}
                >
                  ✦ {countdown.text}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider font-bold text-foreground">
                  Waktu Mulai <span className="text-destructive">*</span>
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
                <label className="block font-mono text-[11px] uppercase tracking-wider font-bold text-foreground">
                  Waktu Selesai <span className="text-destructive">*</span>
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
          </div>

          {/* Section 3: Foto Sampul & Visual Terpal (Upload with < 200KB compression + Cloudinary & Presets) */}
          <div className="space-y-3 p-3.5 border border-border-hairline bg-surface">
            <div className="flex items-center justify-between border-b border-border-hairline pb-2">
              <label className="font-mono text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-500" />
                <span>Foto Sampul &amp; Visual Terpal</span>
              </label>
              <span className="font-mono text-[10px] text-muted">Kompresi &lt; 200 KB &bull; Cloudinary CDN</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Form: EventCoverUploader (7 cols) */}
              <div className="lg:col-span-7">
                <EventCoverUploader
                  value={coverImage}
                  onChange={(url) => setCoverImage(url)}
                />
              </div>

              {/* Right: Live Editorial Mini-Card Preview (5 cols) */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[260px] bg-surface border-2 border-foreground p-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] select-none">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border-hairline font-mono text-[8px] uppercase tracking-widest text-muted">
                    <span>[ PRATINJAU HERO ]</span>
                    <span className="text-amber-500 font-bold">2026</span>
                  </div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-foreground/30 bg-zinc-950">
                    <img
                      src={
                        coverImage ||
                        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80'
                      }
                      alt="Pratinjau Foto"
                      className="w-full h-full object-cover grayscale contrast-110 hover:grayscale-0 transition-all duration-300"
                    />
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.2 bg-amber-500 text-black font-mono text-[7px] font-extrabold uppercase tracking-widest border border-black shadow-xs">
                      ✦ TERPAL RAKYAT ✦
                    </div>
                  </div>
                  <div className="pt-1.5 text-[9px] font-serif italic text-muted truncate">
                    &ldquo;{title || 'Judul Agenda Terpal'}&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Lokasi & Akses */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Nama Lokasi / Lapak <span className="text-destructive">*</span></span>
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Contoh: Depan Pendopo Alun-Alun Blora / Sendang Salak Doplang"
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
                  placeholder="Contoh: Bawa tumbler sendiri, lesehan di samping gapura timur"
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

          {/* Section 5: Kuota & Format Online */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>Batas Kuota Peserta</span>
              </label>
              <input
                type="number"
                min="1"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                placeholder="Kosongkan jika terbuka umum tanpa batas"
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
                <Globe className="w-3.5 h-3.5 text-amber-500" />
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
                * Tautan ini hanya terlihat oleh peserta yang terdaftar / panitia.
              </span>
            </div>
          )}

          {/* Section 6: Narasi / Deskripsi Terbuka */}
          <div className="space-y-1.5">
            <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground">
              Deskripsi & Narasi Kegiatan
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan latar belakang perjumpaan, topik diskusi, atau buku yang hendak dibedah..."
              className="w-full p-3 bg-surface border border-foreground font-sans text-sm focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Section 7: Kolom Khusus Rekam Arsip Lampau (Catatan Refleksi & Galeri) */}
          {(formMode === 'archive' || status === EventStatus.COMPLETED) && (
            <div className="space-y-4 p-4 border-2 border-foreground bg-surface-muted/30">
              <div className="flex items-center gap-2 border-b border-border-hairline pb-2">
                <Archive className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                  Catatan Refleksi & Dokumentasi Pasca-Kegiatan
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider font-bold text-foreground">
                  Rangkuman Jalannya Kegiatan / Notula Lapak
                </label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ceritakan suasana di atas terpal, antusiasme warga, buku apa yang paling ramai dipinjam, atau kutipan menarik dari diskusi..."
                  className="w-full p-3 bg-surface border border-foreground font-sans text-sm focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Multi-photo Gallery Input */}
              <div className="space-y-2">
                <label className="block font-mono text-[11px] uppercase tracking-wider font-bold text-foreground">
                  Tautan Galeri Foto Dokumentasi Warga
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newGalleryInput}
                    onChange={(e) => setNewGalleryInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... atau tautan foto dokumentasi"
                    className="flex-1 px-3 py-1.5 bg-surface border border-foreground font-mono text-xs focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-3 py-1.5 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Foto</span>
                  </button>
                </div>

                {galleryUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {galleryUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative group border border-foreground bg-black aspect-video overflow-hidden"
                      >
                        <img
                          src={url}
                          alt={`Dokumentasi ${index + 1}`}
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Hapus foto ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sticky Actions Footer */}
          <div className="pt-4 border-t-2 border-foreground flex items-center justify-between gap-3 shrink-0">
            <span className="font-mono text-[10px] text-muted">
              {formMode === 'archive'
                ? '* Dokumen akan disimpan sebagai arsip kegiatan historis'
                : '* Dokumen akan terbit di kalender agenda kegiatan warga'}
            </span>

            <div className="flex items-center gap-3">
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
                className="px-6 py-2 bg-foreground text-background border-2 border-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 transition-colors inline-flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)]"
              >
                {loading ? (
                  <span>MENYIMPAN DOKUMEN...</span>
                ) : (
                  <span>
                    {isEditing
                      ? 'PERBARUI AGENDA'
                      : formMode === 'archive'
                      ? 'REKAM KE ARSIP'
                      : 'TERBITKAN AGENDA'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
