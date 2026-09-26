'use client';

import * as React from 'react';
import { X, Camera, AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { EventItem, EventDetail } from '@perpusjal/types';

interface EventCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: EventItem | EventDetail | null;
}

export function EventCompleteModal({
  isOpen,
  onClose,
  onSuccess,
  event,
}: EventCompleteModalProps) {
  const [summary, setSummary] = React.useState('');
  const [galleryUrls, setGalleryUrls] = React.useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen || !event) return;

    const detailed = event as EventDetail;
    setSummary(detailed.summary || '');
    setGalleryUrls(detailed.gallery || []);
    setNewImageUrl('');
    setErrorMsg(null);
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    try {
      new URL(newImageUrl.trim());
      setGalleryUrls([...galleryUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    } catch {
      setErrorMsg('Tautan foto tidak valid. Masukkan format URL lengkap (https://...).');
    }
  };

  const handleRemoveImage = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!summary.trim() || summary.trim().length < 10) {
      setErrorMsg('Ringkasan jalannya kegiatan minimal 10 karakter.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient<{ message: string }>(`/events/${event.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          summary: summary.trim(),
          gallery: galleryUrls.length > 0 ? galleryUrls : undefined,
        }),
      });

      if (res.error) {
        setErrorMsg(res.error.message || 'Gagal menyimpan dokumentasi.');
        setLoading(false);
        return;
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
      <div className="bg-surface border-2 border-foreground max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-foreground flex items-center justify-between bg-surface-muted shrink-0">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-foreground" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                LAPORAN PASCAKEGIATAN
              </div>
              <h2 className="font-serif font-bold text-lg text-foreground truncate max-w-sm">
                Dokumentasi & Selesaikan Agenda
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-surface border border-transparent hover:border-foreground transition-colors text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <div className="p-3 bg-surface-muted/50 border border-border-hairline text-xs font-mono">
            <div className="font-bold text-foreground truncate">{event.title}</div>
            <div className="text-muted mt-0.5">
              Lokasi: {event.locationName} • Peserta: {event.registeredCount} terdaftar
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-surface-muted border-2 border-destructive flex items-start gap-2.5 font-mono text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Ringkasan Kegiatan */}
          <div className="space-y-1.5">
            <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground">
              Ringkasan Jalannya Kegiatan <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ceritakan jalannya lapak: berapa buku dipinjam warga di tempat, antusiasme diskusi, catatan panitia..."
              className="w-full p-3 bg-surface border border-foreground font-sans text-sm focus:outline-hidden leading-relaxed"
              required
            />
          </div>

          {/* Galeri Foto Dokumentasi */}
          <div className="space-y-2">
            <label className="block font-mono text-xs uppercase tracking-wider font-bold text-foreground">
              Tautan Foto Dokumentasi (Opsional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://... (URL foto kegiatan)"
                className="flex-1 px-3 py-1.5 bg-surface border border-border-hairline font-mono text-xs focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-3 py-1.5 border border-foreground bg-surface text-foreground font-mono text-xs uppercase font-bold hover:bg-surface-muted transition-colors inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {galleryUrls.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="font-mono text-[10px] uppercase text-muted tracking-wider block">
                  Foto Terlampir ({galleryUrls.length})
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {galleryUrls.map((url, i) => (
                    <div key={i} className="relative aspect-video bg-black/10 border border-border-hairline group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Dokumentasi ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white hover:bg-red-600 transition-colors"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/40 font-mono text-[11px] text-foreground">
            Menyimpan laporan ini akan secara otomatis mengubah status agenda menjadi <strong>SELESAI (COMPLETED)</strong> dan menampilkan dokumentasi pada arsip publik.
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t-2 border-foreground flex items-center justify-end gap-3 shrink-0">
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
              className="px-5 py-2 bg-foreground text-background border-2 border-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
            >
              {loading ? 'MENYIMPAN LAPORAN...' : 'SELESAIKAN & ARSIPKAN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
