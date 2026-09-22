'use client';

import * as React from 'react';
import { apiClient } from '@/lib/api';
import { BookCondition, BookCopyStatus } from '@perpusjal/types';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Wrench,
  HelpCircle,
} from 'lucide-react';

interface BookCopyItem {
  id: string;
  inventoryCode: string;
  condition: BookCondition;
  status: BookCopyStatus;
  note: string | null;
  createdAt: string;
}

interface AdminBookCopiesModalProps {
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onCopiesUpdated?: () => void;
}

export function AdminBookCopiesModal({
  bookId,
  bookTitle,
  isOpen,
  onClose,
  onCopiesUpdated,
}: AdminBookCopiesModalProps) {
  const [copies, setCopies] = React.useState<BookCopyItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // New copy form state
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newInventoryCode, setNewInventoryCode] = React.useState('');
  const [newCondition, setNewCondition] = React.useState<BookCondition>(BookCondition.BAIK);
  const [newStatus, setNewStatus] = React.useState<BookCopyStatus>(BookCopyStatus.AVAILABLE);
  const [newNote, setNewNote] = React.useState('');

  // Edit condition state
  const [editingCopyId, setEditingCopyId] = React.useState<string | null>(null);
  const [editCondition, setEditCondition] = React.useState<BookCondition>(BookCondition.BAIK);
  const [editStatus, setEditStatus] = React.useState<BookCopyStatus>(BookCopyStatus.AVAILABLE);
  const [editNote, setEditNote] = React.useState('');

  const fetchCopies = React.useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<{ data: BookCopyItem[] }>(`/books/${bookId}/copies`);
      if (res.error) {
        setError(res.error.message);
      } else if (res.data) {
        setCopies(res.data.data || []);
      }
    } catch {
      setError('Gagal memuat daftar eksemplar fisik.');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  React.useEffect(() => {
    if (isOpen) {
      fetchCopies();
      setShowAddForm(false);
      setSuccessMessage(null);
      setError(null);
    }
  }, [isOpen, fetchCopies]);

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await apiClient<{ data: BookCopyItem; message: string }>(
        `/books/${bookId}/copies`,
        {
          method: 'POST',
          body: JSON.stringify({
            inventoryCode: newInventoryCode.trim() || undefined,
            condition: newCondition,
            status: newStatus,
            note: newNote.trim() || undefined,
          }),
        }
      );

      if (res.error) {
        setError(res.error.message);
      } else {
        setSuccessMessage(res.data?.message || 'Eksemplar baru berhasil ditambahkan.');
        setNewInventoryCode('');
        setNewNote('');
        setShowAddForm(false);
        fetchCopies();
        onCopiesUpdated?.();
      }
    } catch {
      setError('Terjadi kendala saat menambahkan eksemplar.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCopy = async (copyId: string) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await apiClient<{ data: BookCopyItem; message: string }>(
        `/books/copies/${copyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            condition: editCondition,
            status: editStatus,
            note: editNote.trim() || null,
          }),
        }
      );

      if (res.error) {
        setError(res.error.message);
      } else {
        setSuccessMessage('Kondisi eksemplar berhasil diperbarui.');
        setEditingCopyId(null);
        fetchCopies();
        onCopiesUpdated?.();
      }
    } catch {
      setError('Terjadi kendala saat memperbarui eksemplar.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCopy = async (copyId: string, code: string) => {
    if (!window.confirm(`Yakin ingin menghapus eksemplar fisik ${code}? Tindakan ini permanen.`)) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await apiClient<{ message: string }>(`/books/copies/${copyId}`, {
        method: 'DELETE',
      });

      if (res.error) {
        setError(res.error.message);
      } else {
        setSuccessMessage(res.data?.message || 'Eksemplar berhasil dihapus.');
        fetchCopies();
        onCopiesUpdated?.();
      }
    } catch {
      setError('Gagal menghapus eksemplar.');
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (copy: BookCopyItem) => {
    setEditingCopyId(copy.id);
    setEditCondition(copy.condition);
    setEditStatus(copy.status);
    setEditNote(copy.note || '');
  };

  const getConditionBadge = (condition: BookCondition) => {
    switch (condition) {
      case BookCondition.BARU:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-foreground bg-foreground text-background font-bold">
            <CheckCircle2 className="w-3 h-3" />
            BARU
          </span>
        );
      case BookCondition.BAIK:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-foreground bg-foreground text-background font-bold">
            <CheckCircle2 className="w-3 h-3" />
            BAIK
          </span>
        );
      case BookCondition.CUKUP:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-foreground bg-surface text-foreground font-semibold">
            CUKUP
          </span>
        );
      case BookCondition.RUSAK_RINGAN:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-red-500 bg-red-50 text-red-700 font-bold">
            <AlertTriangle className="w-3 h-3" />
            RUSAK RINGAN
          </span>
        );
      default:
        return <span className="font-mono text-[10px]">{condition}</span>;
    }
  };

  const getStatusBadge = (status: BookCopyStatus) => {
    switch (status) {
      case BookCopyStatus.AVAILABLE:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-foreground text-foreground font-bold">
            TERSEDIA DI LAPAK
          </span>
        );
      case BookCopyStatus.BORROWED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-foreground text-background font-bold inline-flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            SEDANG DIPINJAM
          </span>
        );
      case BookCopyStatus.RESERVED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-border-hairline text-muted">
            DIPESAN (MENUNGGU AMBIL)
          </span>
        );
      case BookCopyStatus.UNAVAILABLE:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-amber-600 bg-amber-50 text-amber-800 font-bold inline-flex items-center gap-1">
            <Wrench className="w-2.5 h-2.5" />
            TIDAK TERSEDIA
          </span>
        );
      case BookCopyStatus.DAMAGED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-red-500 bg-red-50 text-red-700 font-bold inline-flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" />
            RUSAK
          </span>
        );
      case BookCopyStatus.LOST:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-red-600 bg-red-100 text-red-800">
            HILANG
          </span>
        );
      default:
        return <span className="font-mono text-[10px]">{status}</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-3xl bg-surface border-2 border-foreground shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border-hairline flex items-start justify-between bg-surface-muted/30">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
              <span>INVENTARIS LAPAK</span>
              <span>// EKSEMPLAR FISIK</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mt-0.5 line-clamp-1">
              {bookTitle}
            </h2>
            <p className="font-mono text-xs text-muted mt-1">
              Total: {copies.length} Eksemplar Fisik terdaftar
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 border border-border-hairline hover:bg-foreground hover:text-background text-foreground transition-colors shrink-0 ml-4"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notices */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-800 font-mono text-xs flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold ml-2">&times;</button>
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 font-mono text-xs flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="font-bold ml-2">&times;</button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Action Toolbar */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-muted font-bold">
              Daftar Eksemplar Buku
            </span>

            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 border border-foreground bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Eksemplar Baru</span>
              </button>
            )}
          </div>

          {/* Form: Add New Copy */}
          {showAddForm && (
            <form
              onSubmit={handleAddCopy}
              className="p-4 border-2 border-foreground bg-surface-muted/30 space-y-4 font-mono text-xs animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                <span className="font-bold uppercase tracking-wider text-foreground">
                  + Pendaftaran Eksemplar Fisik Baru
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-muted hover:text-foreground text-xs"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-muted mb-1 font-bold">
                    Kode Inventaris (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newInventoryCode}
                    onChange={(e) => setNewInventoryCode(e.target.value)}
                    placeholder="Kosongkan untuk auto-generate (PJ-YYYY-XXXX)"
                    className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                  />
                  <span className="text-[9px] text-muted block mt-1">
                    Format standar: PJ-{new Date().getFullYear()}-0001
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-muted mb-1 font-bold">
                    Kondisi Awal Fisik
                  </label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as BookCondition)}
                    className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                  >
                    <option value={BookCondition.BARU}>BARU (Kondisi Segel/Baru)</option>
                    <option value={BookCondition.BAIK}>BAIK (Lengkap, Layak Baca)</option>
                    <option value={BookCondition.CUKUP}>CUKUP (Halaman Menguning/Lengkap)</option>
                    <option value={BookCondition.RUSAK_RINGAN}>RUSAK RINGAN (Cover lecet/sudut terlipat)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-muted mb-1 font-bold">
                    Status Sirkulasi Awal
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as BookCopyStatus)}
                    className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                  >
                    <option value={BookCopyStatus.AVAILABLE}>AVAILABLE (Siap di Lapak)</option>
                    <option value={BookCopyStatus.UNAVAILABLE}>UNAVAILABLE (Belum Siap/Disimpan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-muted mb-1 font-bold">
                    Catatan Fisik (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Contoh: Donasi dari Mas Budi, stempel di hal. 3"
                    className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 border border-border-hairline text-muted hover:text-foreground"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
                >
                  {actionLoading ? 'Menyimpan...' : 'Daftarkan Eksemplar'}
                </button>
              </div>
            </form>
          )}

          {/* Copies List */}
          {loading ? (
            <div className="py-12 text-center font-mono text-xs text-muted">
              Memuat daftar eksemplar fisik...
            </div>
          ) : copies.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border-hairline font-mono text-xs space-y-2">
              <p className="text-muted">Buku ini belum memiliki eksemplar fisik yang terdaftar.</p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="text-foreground underline font-bold"
              >
                + Tambah eksemplar pertama sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {copies.map((copy) => {
                const isEditing = editingCopyId === copy.id;

                if (isEditing) {
                  return (
                    <div
                      key={copy.id}
                      className="p-4 border-2 border-foreground bg-surface space-y-3 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-border-hairline pb-2 font-bold">
                        <span>Sunting Eksemplar: {copy.inventoryCode}</span>
                        <button
                          type="button"
                          onClick={() => setEditingCopyId(null)}
                          className="text-muted hover:text-foreground text-xs"
                        >
                          Batal
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-muted uppercase font-bold mb-1">
                            Kondisi Fisik
                          </label>
                          <select
                            value={editCondition}
                            onChange={(e) => setEditCondition(e.target.value as BookCondition)}
                            className="w-full px-2.5 py-1.5 border border-border-hairline bg-surface text-foreground font-mono text-xs"
                          >
                            <option value={BookCondition.BARU}>BARU</option>
                            <option value={BookCondition.BAIK}>BAIK</option>
                            <option value={BookCondition.CUKUP}>CUKUP</option>
                            <option value={BookCondition.RUSAK_RINGAN}>RUSAK RINGAN</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-muted uppercase font-bold mb-1">
                            Status Sirkulasi
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as BookCopyStatus)}
                            className="w-full px-2.5 py-1.5 border border-border-hairline bg-surface text-foreground font-mono text-xs"
                          >
                            <option value={BookCopyStatus.AVAILABLE}>AVAILABLE (Di Lapak)</option>
                            <option value={BookCopyStatus.BORROWED}>BORROWED (Dipinjam)</option>
                            <option value={BookCopyStatus.RESERVED}>RESERVED</option>
                            <option value={BookCopyStatus.UNAVAILABLE}>UNAVAILABLE (Tidak Tersedia)</option>
                            <option value={BookCopyStatus.DAMAGED}>DAMAGED (Rusak)</option>
                            <option value={BookCopyStatus.LOST}>LOST (Hilang)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-muted uppercase font-bold mb-1">
                          Catatan Tambahan
                        </label>
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Catatan kondisi eksemplar..."
                          className="w-full px-2.5 py-1.5 border border-border-hairline bg-surface text-foreground font-mono text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingCopyId(null)}
                          className="px-3 py-1 border border-border-hairline text-muted hover:text-foreground text-xs"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCopy(copy.id)}
                          disabled={actionLoading}
                          className="px-3 py-1 bg-foreground text-background font-bold text-xs uppercase"
                        >
                          {actionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={copy.id}
                    className="p-3.5 border border-border-hairline bg-surface hover:border-foreground transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Stylized Inventory Code */}
                        <span className="font-bold text-foreground text-sm tracking-wider px-2 py-0.5 bg-surface-muted border border-border-hairline">
                          {copy.inventoryCode}
                        </span>
                        {getConditionBadge(copy.condition)}
                        {getStatusBadge(copy.status)}
                      </div>

                      {copy.note && (
                        <p className="text-[11px] text-muted font-sans">
                          Catatan: {copy.note}
                        </p>
                      )}

                      <div className="text-[10px] text-muted">
                        Terdaftar: {new Date(copy.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => startEdit(copy)}
                        className="px-2.5 py-1 border border-border-hairline hover:border-foreground text-foreground text-[11px] uppercase tracking-wider font-semibold transition-colors"
                      >
                        Ubah Status
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCopy(copy.id, copy.inventoryCode)}
                        disabled={copy.status === BookCopyStatus.BORROWED}
                        title={
                          copy.status === BookCopyStatus.BORROWED
                            ? 'Eksemplar sedang dipinjam'
                            : 'Hapus eksemplar fisik'
                        }
                        className="p-1 text-muted hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border-hairline bg-surface-muted/30 flex items-center justify-between font-mono text-xs">
          <span className="text-[11px] text-muted">
            Kode eksemplar digunakan saat relawan menyerahkan dan menerima buku di lapak.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider hover:opacity-90"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
