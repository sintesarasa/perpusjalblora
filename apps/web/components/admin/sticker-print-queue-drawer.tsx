'use client';

import * as React from 'react';
import { usePrintQueue } from '@/lib/print-queue-context';
import { BookSpineStickerSheet } from './book-spine-sticker-sheet';
import {
  Tag,
  Printer,
  Trash2,
  Plus,
  Minus,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface StickerPrintQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StickerPrintQueueDrawer({ isOpen, onClose }: StickerPrintQueueDrawerProps) {
  const { queue, removeFromQueue, updateCount, clearQueue, totalCount } = usePrintQueue();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Slide-over Drawer Panel */}
        <div className="relative w-full max-w-md bg-surface border-l-2 border-foreground h-full shadow-2xl flex flex-col font-mono text-xs z-10 animate-in slide-in-from-right duration-200">
          {/* 1. Header */}
          <div className="p-4 sm:p-5 border-b border-border-hairline flex items-center justify-between bg-surface-muted/30">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <Tag className="w-4 h-4" />
              <span>ANTEAN CETAK STIKER PUNGGUNG</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Sub-info Banner */}
          <div className="p-3 bg-surface-muted border-b border-border-hairline flex items-center justify-between text-[11px] text-muted">
            <span>
              Total Stiker: <strong className="text-foreground">{totalCount}</strong> buah ({queue.length} item)
            </span>
            {queue.length > 0 && (
              <button
                type="button"
                onClick={clearQueue}
                className="text-red-700 hover:underline inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Kosongkan Antrean</span>
              </button>
            )}
          </div>

          {/* 3. List of Items in Queue */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {queue.length === 0 ? (
              <div className="py-16 text-center space-y-3 font-sans">
                <FileText className="w-10 h-10 text-muted mx-auto stroke-1" />
                <p className="text-sm text-foreground font-medium">Antrean cetak stiker masih kosong.</p>
                <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
                  Tambahkan buku atau eksemplar fisik ke antrean melalui tombol <strong>"+ Antrean Stiker"</strong> di katalog buku.
                </p>
              </div>
            ) : (
              queue.map((item) => (
                <div
                  key={item.inventoryCode}
                  className="p-3 border border-border-hairline bg-surface hover:border-foreground transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-foreground text-xs px-1.5 py-0.2 bg-surface-muted border border-border-hairline">
                        {item.inventoryCode}
                      </span>
                      {item.shelfLocation && (
                        <span className="text-[10px] text-muted">
                          [{item.shelfLocation}]
                        </span>
                      )}
                    </div>
                    <div className="font-serif font-bold text-xs text-foreground truncate">
                      {item.bookTitle}
                    </div>
                    <div className="text-[10px] text-muted truncate">
                      {item.author}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-border-hairline bg-surface-muted">
                      <button
                        type="button"
                        onClick={() => updateCount(item.inventoryCode, item.count - 1)}
                        className="p-1 hover:bg-surface text-muted hover:text-foreground"
                        title="Kurangi jumlah stiker"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold text-xs text-foreground">
                        {item.count}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCount(item.inventoryCode, item.count + 1)}
                        className="p-1 hover:bg-surface text-muted hover:text-foreground"
                        title="Tambah jumlah stiker"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromQueue(item.inventoryCode)}
                      className="p-1.5 text-muted hover:text-red-700 transition-colors"
                      title="Hapus dari antrean"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 4. Footer Actions */}
          <div className="p-4 border-t border-border-hairline bg-surface-muted/30 space-y-3">
            <div className="flex items-center gap-2 text-[10px] text-muted">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-foreground" />
              <span>
                1 Lembar A4 dapat memuat hingga 24 stiker. Cetak saat terkumpul banyak agar hemat kertas.
              </span>
            </div>

            <button
              type="button"
              disabled={queue.length === 0}
              onClick={() => setIsSheetOpen(true)}
              className="w-full py-2.5 bg-foreground text-background font-bold uppercase tracking-wider text-xs inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-opacity"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Lembar A4 ({totalCount} Stiker)</span>
            </button>
          </div>
        </div>
      </div>

      {/* A4 Print Sheet Modal */}
      {isSheetOpen && (
        <BookSpineStickerSheet
          items={queue}
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onClearQueueAfterPrint={clearQueue}
        />
      )}
    </>
  );
}
