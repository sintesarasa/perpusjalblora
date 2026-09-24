'use client';

import * as React from 'react';
import { BookSpineStickerItem } from './book-spine-sticker-item';
import { StickerItem } from '@/lib/print-queue-context';
import { Printer, X, Grid, Info, ArrowLeft } from 'lucide-react';

interface BookSpineStickerSheetProps {
  items: StickerItem[];
  isOpen: boolean;
  onClose: () => void;
  onClearQueueAfterPrint?: () => void;
}

const TOTAL_SLOTS_A4 = 24; // 4 columns x 6 rows = 24 stickers per A4 page

export function BookSpineStickerSheet({
  items,
  isOpen,
  onClose,
  onClearQueueAfterPrint,
}: BookSpineStickerSheetProps) {
  // Flatten queue items by count
  const flatStickers = React.useMemo(() => {
    const list: StickerItem[] = [];
    for (const item of items) {
      const c = item.count || 1;
      for (let i = 0; i < c; i++) {
        list.push(item);
      }
    }
    return list;
  }, [items]);

  // Starting slot offset (0 to 23) to allow re-using half-cut/used sticker paper!
  const [startSlotIndex, setStartSlotIndex] = React.useState<number>(0);
  const [showCutGuides, setShowCutGuides] = React.useState<boolean>(true);

  // Trigger browser print
  const handlePrint = () => {
    window.print();
    if (onClearQueueAfterPrint && window.confirm('Apakah Anda ingin mengosongkan antrean cetak setelah berhasil mencetak?')) {
      onClearQueueAfterPrint();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Build grid with empty leading slots (from startSlotIndex)
  const renderSlots = () => {
    const slots: React.ReactNode[] = [];

    // Empty blank slots before startSlotIndex
    for (let i = 0; i < startSlotIndex; i++) {
      slots.push(
        <div
          key={`blank-${i}`}
          className="w-[38mm] h-[48mm] border border-dashed border-neutral-300 flex items-center justify-center text-[8px] text-neutral-400 font-mono select-none"
        >
          [ KOSONG / TERPAKAI ]
        </div>
      );
    }

    // Stickers
    flatStickers.forEach((sticker, idx) => {
      slots.push(
        <div key={`sticker-${sticker.inventoryCode}-${idx}`} className="relative">
          <BookSpineStickerItem
            bookTitle={sticker.bookTitle}
            author={sticker.author}
            categoryName={sticker.categoryName}
            categorySlug={sticker.categorySlug}
            inventoryCode={sticker.inventoryCode}
            bookSlug={sticker.bookSlug}
            shelfLocation={sticker.shelfLocation}
            copyNumber={sticker.copyNumber}
          />
        </div>
      );
    });

    return slots;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-start overflow-y-auto p-4 sm:p-6 print:p-0 print:bg-white print:overflow-visible">
      {/* 1. TOP TOOLBAR CONTROLS (HIDDEN DURING PRINT) */}
      <div className="sticky top-0 z-50 w-full max-w-4xl bg-surface border-2 border-foreground p-4 mb-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-border-hairline hover:border-foreground text-muted hover:text-foreground"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="font-bold text-sm text-foreground flex items-center gap-2">
              <span>PRATINJAU CETAK STIKER A4</span>
              <span className="px-1.5 py-0.5 bg-foreground text-background text-[10px]">
                {flatStickers.length} Stiker
              </span>
            </div>
            <p className="text-[11px] text-muted font-sans">
              Tata letak grid A4 presisi (maksimal 24 stiker per lembar A4).
            </p>
          </div>
        </div>

        {/* Starting Slot Picker & Print Trigger */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Slot picker for reusing paper */}
          <div className="flex items-center gap-1.5 bg-surface-muted px-2.5 py-1.5 border border-border-hairline">
            <Grid className="w-3.5 h-3.5 text-muted" />
            <span className="text-[10px] text-muted uppercase">Mulai Slot:</span>
            <select
              value={startSlotIndex}
              onChange={(e) => setStartSlotIndex(parseInt(e.target.value, 10))}
              className="bg-surface border border-border-hairline px-2 py-0.5 font-mono text-xs"
              title="Pilih slot awal jika kertas stiker Anda sudah pernah terpakai sebagian"
            >
              {Array.from({ length: TOTAL_SLOTS_A4 }).map((_, i) => (
                <option key={i} value={i}>
                  Slot #{i + 1} {i === 0 ? '(Awal Lembar)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Scissor Guides */}
          <label className="flex items-center gap-1 text-[11px] cursor-pointer text-muted hover:text-foreground">
            <input
              type="checkbox"
              checked={showCutGuides}
              onChange={(e) => setShowCutGuides(e.target.checked)}
              className="rounded-none border-foreground"
            />
            <span>Garis Potong</span>
          </label>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-foreground text-background font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md hover:opacity-90"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Sekarang</span>
          </button>
        </div>
      </div>

      {/* 2. INSTRUCTION HINT BANNER (HIDDEN DURING PRINT) */}
      <div className="w-full max-w-4xl bg-blue-50 border border-blue-200 text-blue-900 p-3 mb-6 font-mono text-xs flex items-start gap-2.5 print:hidden">
        <Info className="w-4 h-4 shrink-0 text-blue-700 mt-0.5" />
        <div className="space-y-1 font-sans text-xs">
          <p className="font-semibold text-blue-950 font-mono">
            Petunjuk Cetak Hemat Kertas:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-blue-800">
            <li>Pada dialog cetak browser, pilih <strong>Ukuran Kertas: A4</strong>, <strong>Margin: None / Default</strong>, dan <strong>Skala: 100%</strong>.</li>
            <li>Jika menggunakan kertas stiker sisa/bekas, ubah menu <em>"Mulai Slot"</em> di atas untuk melompati kotak yang sudah dipotong.</li>
          </ul>
        </div>
      </div>

      {/* 3. A4 PRINT SHEET (210mm x 297mm) */}
      <div
        id="printable-a4-sheet"
        className={`bg-white text-black p-[8mm] shadow-2xl print:shadow-none print:m-0 print:p-[5mm] box-border w-[210mm] min-h-[297mm] flex flex-col justify-start relative select-none ${
          showCutGuides ? 'cut-guides-active' : ''
        }`}
      >
        {/* Top Header Note (Only shows in print footer/header for curator audit) */}
        <div className="hidden print:flex items-center justify-between border-b border-neutral-300 pb-1 mb-2 text-[8px] font-mono text-neutral-500">
          <span>PERPUSJAL BLORA // LEMBAR LABEL PUSTAKA FISIK</span>
          <span>DICETAK: {new Date().toLocaleDateString('id-ID')}</span>
        </div>

        {/* 4 Columns x 6 Rows Grid */}
        <div className="grid grid-cols-4 gap-x-[3.5mm] gap-y-[4mm] justify-items-center items-start">
          {renderSlots()}
        </div>
      </div>

      {/* 4. ISOLATED PRINT STYLES */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide non-print areas */
          header,
          aside,
          nav,
          footer,
          .print\\:hidden {
            display: none !important;
          }
          #printable-a4-sheet {
            width: 100% !important;
            min-height: auto !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
