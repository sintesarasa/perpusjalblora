'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookItem, BookAvailabilityStatus } from '@perpusjal/types';
import {
  X,
  BookOpen,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Tag,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BookQuickPeekDrawerProps {
  book: BookItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookQuickPeekDrawer({ book, isOpen, onClose }: BookQuickPeekDrawerProps) {
  // Close drawer on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !book) return null;

  const isAvailable = book.availableCopies > 0 && book.isBorrowable;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Sheet */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-surface border-l-2 border-foreground flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
          {/* Header Strip */}
          <div>
            <div className="p-4 sm:p-5 border-b-2 border-foreground flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                <span>[ PRATINJAU PUSTAKA CEPAT ]</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 border border-border-hairline hover:border-foreground text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                aria-label="Tutup pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              {/* Physical Book Cover Frame */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                <div className="sm:col-span-5 aspect-[3/4] border-2 border-foreground bg-surface-muted relative overflow-hidden">
                  {/* Left Spine Shadow */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/25 via-black/10 to-transparent z-10 pointer-events-none" />

                  {book.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col justify-between border-2 border-double border-foreground/30 bg-[#f4f4ee] dark:bg-[#141414] text-foreground text-center">
                      <span className="font-mono text-[8px] uppercase tracking-widest text-muted">
                        {book.category.name}
                      </span>
                      <div className="my-auto py-2">
                        <BookOpen className="w-6 h-6 text-foreground/40 mx-auto mb-1" />
                        <div className="font-serif font-bold text-xs uppercase line-clamp-3">
                          {book.title}
                        </div>
                      </div>
                      <span className="font-mono text-[8px] text-muted">PERPUSJAL BLORA</span>
                    </div>
                  )}
                </div>

                {/* Main Titles & Badge */}
                <div className="sm:col-span-7 space-y-2">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
                    <span className="px-2 py-0.5 border border-border-hairline bg-surface-muted uppercase font-bold text-foreground">
                      {book.category.name}
                    </span>
                    {book.publicationYear && <span>{book.publicationYear}</span>}
                  </div>

                  <h2 className="font-serif text-2xl font-black text-foreground uppercase tracking-tight leading-snug">
                    {book.title}
                  </h2>

                  <p className="font-mono text-xs text-muted">
                    Pengarang: <strong className="text-foreground">{book.author}</strong>
                  </p>

                  {/* Curator Note Banner (if present) */}
                  {book.curatorNote && (
                    <div className="mt-3 p-3 border-l-2 border-foreground bg-surface-muted/60 font-serif italic text-xs text-foreground/90 leading-relaxed">
                      "{book.curatorNote}"
                      <span className="block font-mono not-italic text-[9px] uppercase tracking-wider text-muted mt-1">
                        — Catatan Relawan Lapak
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Availability Strip */}
              <div className="border border-foreground p-4 bg-surface-muted/40 font-mono text-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                  <span className="text-[10px] uppercase text-muted">Status Ketersediaan:</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider',
                      isAvailable
                        ? 'bg-foreground text-background'
                        : 'border border-foreground bg-surface text-foreground'
                    )}
                  >
                    {isAvailable ? `● TERSEDIA (${book.availableCopies}/${book.totalCopies} DI RAK)` : '○ SEDANG KELANA / PINJAM'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Titik Ambil Lapak:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-foreground shrink-0" />
                      {book.shelfLocation || 'Alun-Alun / Basecamp'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase">Biaya / Denda:</span>
                    <span className="font-bold text-foreground block mt-0.5">Rp 0,- Nol Denda</span>
                  </div>
                </div>
              </div>

              {/* Description Synopsis */}
              <div className="space-y-2">
                <h3 className="font-mono text-[11px] uppercase tracking-wider font-bold text-foreground border-b border-border-hairline pb-1.5">
                  IKHTISAR / SINOPSIS BUKU
                </h3>
                <p className="font-serif text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                  {book.description ||
                    'Belum ada catatan sinopsis resmi yang tertera untuk edisi buku ini. Kamu dapat memeriksa fisik buku secara langsung di lapak terpal perpusjal atau mengunjungi halaman rincian.'}
                </p>
              </div>

              {/* Rule Note */}
              <div className="p-3 border border-dashed border-border-hairline bg-surface text-[11px] font-mono text-muted flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Buku dapat dipinjam selama 14 hari penuh. Tanpa jaminan kartu identitas fisik.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t-2 border-foreground bg-surface flex flex-wrap items-center gap-3">
            <Link
              href={`/buku/${book.slug}`}
              className="flex-1 text-center py-2.5 px-4 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-background hover:text-foreground border border-foreground transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <span>{isAvailable ? 'AJUKAN PINJAM DI LAPAK' : 'LIHAT DETAIL & ANTRE'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 border border-border-hairline text-muted hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
