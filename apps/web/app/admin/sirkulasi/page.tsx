'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import {
  LoanItem,
  LoanPickupBoardItem,
  ReturnCondition,
  LoanStatus,
} from '@perpusjal/types';
import {
  BookOpen,
  QrCode,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Check,
  UserCheck,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface LookupResponse {
  loan: LoanItem;
  availableCopies: Array<{ id: string; inventoryCode: string; condition: string }>;
}

export default function CirculationDeskPage() {
  const [activeTab, setActiveTab] = React.useState<'pickup' | 'return' | 'board'>('pickup');

  // Tab 1: Pickup
  const [pickupCodeInput, setPickupCodeInput] = React.useState('');
  const [pickupLoan, setPickupLoan] = React.useState<LoanItem | null>(null);
  const [availableCopies, setAvailableCopies] = React.useState<Array<{ id: string; inventoryCode: string }>>([]);
  const [selectedCopyId, setSelectedCopyId] = React.useState('');
  const [pickupLoading, setPickupLoading] = React.useState(false);
  const [pickupError, setPickupError] = React.useState<string | null>(null);
  const [pickupSuccess, setPickupSuccess] = React.useState<string | null>(null);

  // Tab 2: Return
  const [returnCodeInput, setReturnCodeInput] = React.useState('');
  const [returnLoan, setReturnLoan] = React.useState<LoanItem | null>(null);
  const [returnCondition, setReturnCondition] = React.useState<ReturnCondition>(ReturnCondition.BAIK);
  const [returnNote, setReturnNote] = React.useState('');
  const [returnLoading, setReturnLoading] = React.useState(false);
  const [returnError, setReturnError] = React.useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = React.useState<string | null>(null);

  // Tab 3: Board
  const [boardData, setBoardData] = React.useState<{
    readyForPickup: LoanPickupBoardItem[];
    dueToday: LoanPickupBoardItem[];
    overdue: LoanPickupBoardItem[];
  } | null>(null);
  const [boardLoading, setBoardLoading] = React.useState(false);

  // Load Board
  const loadBoard = React.useCallback(async () => {
    setBoardLoading(true);
    const res = await apiClient<{
      data: {
        readyForPickup: LoanPickupBoardItem[];
        dueToday: LoanPickupBoardItem[];
        overdue: LoanPickupBoardItem[];
      };
    }>('/loans/pickup-board');
    setBoardLoading(false);
    if (res.data) {
      setBoardData(res.data.data);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'board') {
      loadBoard();
    }
  }, [activeTab, loadBoard]);

  // Lookup for Pickup
  const handlePickupLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCodeInput.trim()) return;

    setPickupLoading(true);
    setPickupError(null);
    setPickupLoan(null);

    const res = await apiClient<{ data: LookupResponse }>(
      `/loans/lookup?code=${encodeURIComponent(pickupCodeInput.trim())}`
    );

    setPickupLoading(false);

    if (res.error) {
      setPickupError(res.error.message);
      return;
    }

    if (res.data) {
      const data = res.data.data;
      if (data.loan.status !== LoanStatus.APPROVED) {
        setPickupError(
          `Pinjaman ditemukan tetapi berstatus ${data.loan.status}. Hanya status APPROVED yang dapat diserahkan.`
        );
        return;
      }
      setPickupLoan(data.loan);
      setAvailableCopies(data.availableCopies || []);
      if (data.availableCopies && data.availableCopies.length > 0) {
        setSelectedCopyId(data.availableCopies[0].id);
      }
    }
  };

  // Execute Pickup Handover
  const handleExecutePickup = async () => {
    if (!pickupLoan) return;

    setPickupLoading(true);
    setPickupError(null);

    const res = await apiClient<{ data: LoanItem; message: string }>('/loans/pickup', {
      method: 'POST',
      body: JSON.stringify({
        pickupCode: pickupCodeInput.trim(),
        bookCopyId: selectedCopyId || undefined,
      }),
    });

    setPickupLoading(false);

    if (res.error) {
      setPickupError(res.error.message);
      return;
    }

    setPickupSuccess(`Buku "${pickupLoan.book.title}" berhasil diserahkan kepada ${pickupLoan.borrower?.name}!`);
    setPickupLoan(null);
    setPickupCodeInput('');
  };

  // Lookup for Return
  const handleReturnLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnCodeInput.trim()) return;

    setReturnLoading(true);
    setReturnError(null);
    setReturnLoan(null);

    const res = await apiClient<{ data: LookupResponse }>(
      `/loans/lookup?code=${encodeURIComponent(returnCodeInput.trim())}`
    );

    setReturnLoading(false);

    if (res.error) {
      setReturnError(res.error.message);
      return;
    }

    if (res.data) {
      const data = res.data.data;
      if (data.loan.status !== LoanStatus.BORROWED && data.loan.status !== LoanStatus.OVERDUE) {
        setReturnError(
          `Pinjaman ini berstatus ${data.loan.status}. Hanya pinjaman aktif (BORROWED / OVERDUE) yang dapat diproses pengembaliannya.`
        );
        return;
      }
      setReturnLoan(data.loan);
    }
  };

  // Execute Return Handover
  const handleExecuteReturn = async () => {
    if (!returnLoan) return;

    setReturnLoading(true);
    setReturnError(null);

    const res = await apiClient<{ data: LoanItem; message: string }>(
      `/loans/${returnLoan.id}/return`,
      {
        method: 'POST',
        body: JSON.stringify({
          condition: returnCondition,
          note: returnNote.trim() || undefined,
        }),
      }
    );

    setReturnLoading(false);

    if (res.error) {
      setReturnError(res.error.message);
      return;
    }

    setReturnSuccess(`Pengembalian buku "${returnLoan.book.title}" berhasil dicatat (Kondisi: ${returnCondition}).`);
    setReturnLoan(null);
    setReturnCodeInput('');
    setReturnNote('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Masthead */}
        <div className="border-b-2 border-foreground pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-widest">
              <span>Meja Sirkulasi Lapak</span>
              <span>// OPERASIONAL RELAWAN & KURATOR</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Mode Lapak Perpusjal
            </h1>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 bg-foreground text-background font-bold uppercase tracking-wider">
              ONLINE
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border-hairline font-mono text-xs uppercase tracking-wider pb-px">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pickup');
              setPickupSuccess(null);
              setPickupError(null);
            }}
            className={`px-5 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pickup'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Papan Ambil Cepat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('return');
              setReturnSuccess(null);
              setReturnError(null);
            }}
            className={`px-5 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'return'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Pengembalian Buku</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`px-5 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'board'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Papan Pantau Lapak</span>
          </button>
        </div>

        {/* TAB 1: PICKUP CEPAT */}
        {activeTab === 'pickup' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 bg-surface border-2 border-foreground space-y-5">
              <div className="border-b border-border-hairline pb-3">
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Serah-Terima Buku (Kode Ambil)
                </h2>
                <p className="font-sans text-xs text-muted">
                  Masukkan 6 digit angka kode pengambilan yang ditunjukkan oleh anggota.
                </p>
              </div>

              {pickupSuccess && (
                <div className="p-4 bg-surface-muted border border-foreground font-mono text-xs text-foreground flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-foreground" />
                  <span>{pickupSuccess}</span>
                </div>
              )}

              {pickupError && (
                <div className="p-4 bg-surface-muted border border-destructive font-mono text-xs text-destructive flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-destructive" />
                  <span>{pickupError}</span>
                </div>
              )}

              <form onSubmit={handlePickupLookup} className="space-y-4">
                <div className="space-y-2">
                  <label className="block font-mono text-xs uppercase tracking-widest text-foreground font-bold">
                    KODE PENGAMBILAN 6 DIGIT:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={pickupCodeInput}
                      onChange={(e) => setPickupCodeInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Contoh: 482913"
                      className="flex-1 p-3 text-center font-mono text-2xl tracking-[0.3em] font-bold bg-surface-muted border-2 border-foreground focus:outline-none rounded-none text-foreground"
                    />
                    <button
                      type="submit"
                      disabled={pickupLoading || pickupCodeInput.length !== 6}
                      className="px-6 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 disabled:opacity-40 transition-colors"
                    >
                      {pickupLoading ? 'Mencari...' : 'Periksa'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Found Loan Verification Card */}
              {pickupLoan && (
                <div className="pt-4 border-t-2 border-foreground space-y-4 font-mono text-xs">
                  <div className="p-4 bg-surface-muted border border-border-hairline space-y-2">
                    <div className="flex justify-between items-center text-muted">
                      <span>KODE PINJAM: {pickupLoan.loanCode}</span>
                      <span className="px-2 py-0.5 bg-foreground text-background font-bold text-[10px]">
                        APPROVED
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-foreground font-sans">
                      {pickupLoan.book.title}
                    </h3>
                    <p className="font-sans text-xs text-muted">
                      Peminjam: <strong className="text-foreground">{pickupLoan.borrower?.name}</strong> (@{pickupLoan.borrower?.username})
                    </p>
                  </div>

                  {/* Physical Copy Selector */}
                  <div className="space-y-2">
                    <label className="block text-[11px] text-foreground uppercase font-bold">
                      PILIH EKSEMPLAR FISIK YANG DISERAHKAN:
                    </label>
                    {availableCopies.length > 0 ? (
                      <select
                        value={selectedCopyId}
                        onChange={(e) => setSelectedCopyId(e.target.value)}
                        className="w-full p-2.5 bg-surface border border-foreground rounded-none text-xs text-foreground focus:outline-none font-mono"
                      >
                        {availableCopies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.inventoryCode}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-destructive">
                        Tidak ada eksemplar fisik berstatus AVAILABLE.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleExecutePickup}
                    disabled={pickupLoading || !selectedCopyId}
                    className="w-full py-3 bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>SERAHKAN BUKU KE PEMINJAM</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PENGEMBALIAN BUKU */}
        {activeTab === 'return' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 bg-surface border-2 border-foreground space-y-5">
              <div className="border-b border-border-hairline pb-3">
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Penerimaan Pengembalian Buku
                </h2>
                <p className="font-sans text-xs text-muted">
                  Cari berdasarkan Kode Pinjam (contoh: PJM-2026-0451) atau Kode Ambil.
                </p>
              </div>

              {returnSuccess && (
                <div className="p-4 bg-surface-muted border border-foreground font-mono text-xs text-foreground flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-foreground" />
                  <span>{returnSuccess}</span>
                </div>
              )}

              {returnError && (
                <div className="p-4 bg-surface-muted border border-destructive font-mono text-xs text-destructive flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-destructive" />
                  <span>{returnError}</span>
                </div>
              )}

              <form onSubmit={handleReturnLookup} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={returnCodeInput}
                    onChange={(e) => setReturnCodeInput(e.target.value)}
                    placeholder="Masukkan Kode Pinjam / Kode Ambil..."
                    className="flex-1 p-3 font-mono text-sm bg-surface-muted border-2 border-foreground focus:outline-none rounded-none text-foreground"
                  />
                  <button
                    type="submit"
                    disabled={returnLoading || !returnCodeInput.trim()}
                    className="px-6 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 disabled:opacity-40 transition-colors"
                  >
                    {returnLoading ? 'Mencari...' : 'Cari Data'}
                  </button>
                </div>
              </form>

              {/* Found Return Verification Card */}
              {returnLoan && (
                <div className="pt-4 border-t-2 border-foreground space-y-5 font-mono text-xs">
                  <div className="p-4 bg-surface-muted border border-border-hairline space-y-2">
                    <div className="flex justify-between items-center text-muted">
                      <span>{returnLoan.loanCode}</span>
                      <span className="font-bold text-foreground">{returnLoan.status}</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-foreground font-sans">
                      {returnLoan.book.title}
                    </h3>
                    <p className="font-sans text-xs text-muted">
                      Peminjam: <strong className="text-foreground">{returnLoan.borrower?.name}</strong>
                    </p>
                    {returnLoan.bookCopy && (
                      <p className="text-muted text-[11px]">
                        Eksemplar: <strong>{returnLoan.bookCopy.inventoryCode}</strong>
                      </p>
                    )}
                  </div>

                  {/* Physical condition radio buttons */}
                  <div className="space-y-2">
                    <label className="block text-[11px] text-foreground uppercase font-bold">
                      KONDISI FISIK BUKU SAAT DIKEMBALIKAN:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: ReturnCondition.BAIK, label: 'BAIK', desc: 'Buku utuh & terawat' },
                        { val: ReturnCondition.RUSAK, label: 'RUSAK', desc: 'Robek / basah / cacat' },
                        { val: ReturnCondition.HILANG, label: 'HILANG', desc: 'Buku hilang' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setReturnCondition(item.val)}
                          className={`p-3 text-left border transition-colors ${
                            returnCondition === item.val
                              ? 'border-2 border-foreground bg-surface-muted font-bold'
                              : 'border-border-hairline hover:border-foreground'
                          }`}
                        >
                          <span className="block text-xs uppercase text-foreground">{item.label}</span>
                          <span className="block text-[10px] text-muted mt-0.5">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note input */}
                  <div className="space-y-1">
                    <label className="block text-[11px] text-muted uppercase">Catatan Tambahan (Opsional):</label>
                    <input
                      type="text"
                      value={returnNote}
                      onChange={(e) => setReturnNote(e.target.value)}
                      placeholder="Keterangan kondisi atau catatan relawan..."
                      className="w-full p-2.5 bg-surface-muted border border-border-hairline rounded-none text-xs focus:outline-none focus:border-foreground"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteReturn}
                    disabled={returnLoading}
                    className="w-full py-3 bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PROSES PENGEMBALIAN BUKU</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PAPAN PANTAU LAPAK */}
        {activeTab === 'board' && (
          <div className="space-y-8 font-sans">
            {boardLoading ? (
              <div className="py-20 flex justify-center">
                <CustomLoader size="md" label="MEMUAT PAPAN PANTAU LAPAK..." />
              </div>
            ) : boardData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Siap Diambil */}
                <div className="border border-border-hairline bg-surface p-5 space-y-4">
                  <div className="border-b border-border-hairline pb-2 flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      Siap Diambil ({boardData.readyForPickup.length})
                    </span>
                  </div>

                  {boardData.readyForPickup.length === 0 ? (
                    <p className="text-xs text-muted italic font-mono">Nihil</p>
                  ) : (
                    <div className="space-y-3">
                      {boardData.readyForPickup.map((item) => (
                        <div key={item.id} className="p-3 bg-surface-muted border border-border-hairline text-xs font-mono space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-foreground">{item.borrowerName}</span>
                            <span className="text-base tracking-wider">{item.pickupCode}</span>
                          </div>
                          <p className="text-muted font-sans text-xs line-clamp-1">{item.bookTitle}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 2: Jatuh Tempo Hari Ini */}
                <div className="border border-border-hairline bg-surface p-5 space-y-4">
                  <div className="border-b border-border-hairline pb-2 flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Jatuh Tempo Hari Ini ({boardData.dueToday.length})
                    </span>
                  </div>

                  {boardData.dueToday.length === 0 ? (
                    <p className="text-xs text-muted italic font-mono">Nihil</p>
                  ) : (
                    <div className="space-y-3">
                      {boardData.dueToday.map((item) => (
                        <div key={item.id} className="p-3 bg-surface-muted border border-border-hairline text-xs font-mono space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-foreground">{item.borrowerName}</span>
                            <span>{item.loanCode}</span>
                          </div>
                          <p className="text-muted font-sans text-xs line-clamp-1">{item.bookTitle}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 3: Terlambat */}
                <div className="border border-destructive/40 bg-surface p-5 space-y-4">
                  <div className="border-b border-border-hairline pb-2 flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Terlambat / Overdue ({boardData.overdue.length})
                    </span>
                  </div>

                  {boardData.overdue.length === 0 ? (
                    <p className="text-xs text-muted italic font-mono">Nihil</p>
                  ) : (
                    <div className="space-y-3">
                      {boardData.overdue.map((item) => (
                        <div key={item.id} className="p-3 bg-surface-muted border border-destructive/40 text-xs font-mono space-y-1">
                          <div className="flex justify-between font-bold text-destructive">
                            <span>{item.borrowerName}</span>
                            <span>{item.loanCode}</span>
                          </div>
                          <p className="text-muted font-sans text-xs line-clamp-1">{item.bookTitle}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
