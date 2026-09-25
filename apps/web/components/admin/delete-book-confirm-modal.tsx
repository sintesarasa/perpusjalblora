'use client';

import * as React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteBookConfirmModalProps {
  isOpen: boolean;
  bookTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isDeleting?: boolean;
}

export function DeleteBookConfirmModal({
  isOpen,
  bookTitle,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteBookConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={isDeleting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-surface border-2 border-foreground shadow-2xl p-6 font-mono text-xs space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-3">
          <div className="flex items-center gap-2 text-red-600 font-bold tracking-wider uppercase">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>KONFIRMASI ARSIP / HAPUS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 text-muted hover:text-foreground disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 font-serif">
          <p className="text-sm text-foreground leading-relaxed">
            Apakah Anda yakin ingin mengarsipkan / menghapus buku berikut dari katalog aktif?
          </p>
          <div className="p-3 bg-surface-muted border-l-2 border-red-600 font-sans text-xs">
            <span className="font-mono text-[10px] text-muted uppercase block">Judul Buku:</span>
            <strong className="text-foreground text-sm font-semibold">{bookTitle}</strong>
          </div>
          <p className="text-xs text-muted leading-relaxed font-sans">
            Buku akan disembunyikan dari katalog publik. Jika buku sedang dalam sirkulasi peminjaman aktif, penghapusan akan ditolak otomatis oleh sistem.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-hairline font-mono text-xs">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-border-hairline text-foreground hover:border-foreground transition-colors disabled:opacity-40"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wider uppercase transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Buku'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
