'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { DigitalStampEffect, StampVariant } from './digital-stamp-effect';

export interface CheckoutSlipRecord {
  id: string;
  borrowDate: string;
  dueDate: string;
  borrowerName: string;
  borrowerId?: string;
  status: StampVariant;
  note?: string;
}

interface LibraryCheckoutSlipProps {
  bookCode?: string;
  bookTitle?: string;
  bookAuthor?: string;
  shelfLocation?: string;
  records?: CheckoutSlipRecord[];
  activeLoan?: {
    borrowDate: string;
    dueDate: string;
    borrowerName: string;
    status: StampVariant;
  } | null;
  className?: string;
}

const DEFAULT_SAMPLE_RECORDS: CheckoutSlipRecord[] = [
  {
    id: 'rec-01',
    borrowDate: '12 Jan 2026',
    dueDate: '26 Jan 2026',
    borrowerName: 'Siti Rahmawati',
    status: 'KEMBALI_LENGKAP',
  },
  {
    id: 'rec-02',
    borrowDate: '02 Feb 2026',
    dueDate: '16 Feb 2026',
    borrowerName: 'Budi Santoso',
    status: 'KEMBALI_LENGKAP',
  },
  {
    id: 'rec-03',
    borrowDate: '01 Mar 2026',
    dueDate: '15 Mar 2026',
    borrowerName: 'Wawan Prasetyo',
    status: 'KEMBALI_LENGKAP',
  },
];

export function LibraryCheckoutSlip({
  bookCode = 'PJ-2026-0001',
  bookTitle = 'Bumi Manusia',
  bookAuthor = 'Pramoedya Ananta Toer',
  shelfLocation = 'RAK-SAS-01 (TERPAL ALUN-ALUN)',
  records = DEFAULT_SAMPLE_RECORDS,
  activeLoan = {
    borrowDate: '22 Mar 2026',
    dueDate: '05 Apr 2026',
    borrowerName: 'Rina Kusuma (Kamu)',
    status: 'DIPINJAM',
  },
  className,
}: LibraryCheckoutSlipProps) {
  const [selectedRecordId, setSelectedRecordId] = React.useState<string | null>(null);

  // Combine past records with active loan
  const displayRecords = [...records];
  if (activeLoan) {
    displayRecords.push({
      id: 'active-loan',
      borrowDate: activeLoan.borrowDate,
      dueDate: activeLoan.dueDate,
      borrowerName: activeLoan.borrowerName,
      status: activeLoan.status,
    });
  }

  // Pad to at least 6 rows for vintage card realism
  const emptyRowsCount = Math.max(0, 6 - displayRecords.length);

  return (
    <div
      className={cn(
        'relative bg-[#FAF8F5] dark:bg-[#141414] border-2 border-foreground text-foreground p-5 sm:p-7 rounded-none font-mono select-none overflow-hidden',
        className
      )}
    >
      {/* Decorative Corner Tabs */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-foreground/40 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-foreground/40 pointer-events-none" />

      {/* Slip Masthead */}
      <div className="border-b-2 border-foreground pb-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg width="22" height="12" viewBox="0 0 100 55" className="fill-current inline-block">
              <polygon points="30,4 96,4 82,24 16,24" />
              <polygon points="18,30 84,30 70,50 4,50" />
            </svg>
            <span className="font-bold tracking-widest text-xs uppercase">
              PERPUSTAKAAN JALANAN BLORA
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted border border-border-hairline px-2 py-0.5 bg-background">
            SLIP KENDALI SIRKULASI EKSEMPLAR
          </span>
        </div>

        {/* Book Identity Card Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border-hairline text-xs">
          <div>
            <span className="text-muted text-[10px] block uppercase">NOMOR REGISTER:</span>
            <span className="font-bold tracking-wider text-sm bg-foreground text-background px-1.5 py-0.5 inline-block">
              {bookCode}
            </span>
          </div>
          <div>
            <span className="text-muted text-[10px] block uppercase">LOKASI RAK / TERPAL:</span>
            <span className="font-semibold text-foreground">{shelfLocation}</span>
          </div>
          <div className="sm:col-span-2 pt-1">
            <span className="text-muted text-[10px] block uppercase">JUDUL &amp; PENGARANG:</span>
            <div className="font-serif font-black text-base text-foreground leading-tight">
              {bookTitle}
            </div>
            <div className="font-serif italic text-xs text-muted">oleh {bookAuthor}</div>
          </div>
        </div>
      </div>

      {/* Instructions Warning */}
      <div className="py-2.5 px-3 bg-foreground/5 border-b border-border-hairline text-[9px] sm:text-[10px] text-muted tracking-wider leading-relaxed">
        <strong>PERINGATAN SIRKULASI:</strong> Buku ini milik bersama warga Blora. Mohon jaga keutuhan halaman dan kembalikan sesuai batas jatuh tempo pada lapak Minggu pagi CFD Alun-Alun Blora.
      </div>

      {/* Circulation Ledger Table */}
      <div className="pt-3 overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-foreground font-mono text-[9px] uppercase tracking-wider text-muted">
              <th className="py-2 px-2 w-8">NO.</th>
              <th className="py-2 px-2">TGL PINJAM</th>
              <th className="py-2 px-2">JATUH TEMPO</th>
              <th className="py-2 px-2">NAMA PEMINJAM</th>
              <th className="py-2 px-2 text-right">CAP STEMPEL LAPAK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline text-[11px]">
            {displayRecords.map((rec, idx) => {
              const isActive = rec.id === 'active-loan';
              return (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={cn(
                    'transition-colors',
                    isActive ? 'bg-surface-muted/60 font-semibold' : 'hover:bg-surface-muted/30'
                  )}
                >
                  <td className="py-3 px-2 font-mono text-muted text-[10px]">
                    {`${idx + 1}`.padStart(2, '0')}
                  </td>
                  <td className="py-3 px-2 font-mono">{rec.borrowDate}</td>
                  <td className="py-3 px-2 font-mono font-bold text-foreground">
                    {rec.dueDate}
                  </td>
                  <td className="py-3 px-2">
                    <span className="truncate max-w-[140px] inline-block font-sans">
                      {rec.borrowerName}
                    </span>
                    {isActive && (
                      <span className="block font-mono text-[8px] text-muted tracking-wider">
                        [ PINJAMAN BERJALAN ]
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <DigitalStampEffect
                      variant={rec.status}
                      date={rec.dueDate}
                      size="sm"
                      rotation={isActive ? -4 : (idx % 2 === 0 ? 3 : -2)}
                    />
                  </td>
                </tr>
              );
            })}

            {/* Empty ledger lines for vintage authenticity */}
            {Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="opacity-40">
                <td className="py-3 px-2 font-mono text-muted text-[10px]">
                  {`${displayRecords.length + idx + 1}`.padStart(2, '0')}
                </td>
                <td className="py-3 px-2 font-mono text-muted">..............</td>
                <td className="py-3 px-2 font-mono text-muted">..............</td>
                <td className="py-3 px-2 text-muted">..............................</td>
                <td className="py-3 px-2 text-right font-mono text-[9px] text-muted">
                  [ RUANG CAP KOSONG ]
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pocket Sleeve Fold at bottom */}
      <div className="mt-6 pt-4 border-t-2 border-dashed border-foreground/50 flex flex-col sm:flex-row sm:items-center justify-between text-[9px] text-muted tracking-widest gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-foreground inline-block" />
          <span>KANTONG KARTU BUKU PERPUSJAL BLORA</span>
        </div>
        <div>FORMAT CETAK RESMI // 0% BIAYA PINJAM</div>
      </div>
    </div>
  );
}
