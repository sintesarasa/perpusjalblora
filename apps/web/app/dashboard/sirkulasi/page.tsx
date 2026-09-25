'use client';

import * as React from 'react';
import Link from 'next/link';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import {
  LoanItem,
  LoanPickupBoardItem,
  ReturnCondition,
  LoanStatus,
  Role,
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
  RefreshCw,
  Printer,
  ShieldAlert,
  ArrowRight,
  Camera,
  X,
  History,
  Calendar,
} from 'lucide-react';
import { CameraQrScannerModal } from '@/components/circulation/camera-qr-scanner-modal';

interface LookupResponse {
  loan: LoanItem;
  availableCopies: Array<{ id: string; inventoryCode: string; condition: string }>;
}

interface SessionLogItem {
  id: string;
  type: 'pickup' | 'return';
  title: string;
  borrower: string;
  code: string;
  time: string;
  condition?: ReturnCondition;
}

export default function DashboardCirculationPage() {
  const [currentUser, setCurrentUser] = React.useState<{ id: string; role: Role; name: string } | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  const [activeTab, setActiveTab] = React.useState<'pickup' | 'return' | 'board'>('pickup');

  // Session Logs (Riwayat transaksi lapak hari ini)
  const [sessionLogs, setSessionLogs] = React.useState<SessionLogItem[]>([]);

  // Tab 1: Pickup
  const [pickupCodeInput, setPickupCodeInput] = React.useState('');
  const [pickupLoan, setPickupLoan] = React.useState<LoanItem | null>(null);
  const [availableCopies, setAvailableCopies] = React.useState<Array<{ id: string; inventoryCode: string; condition?: string }>>([]);
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

  // Camera QR Scanner Modal State
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [scannerContext, setScannerContext] = React.useState<'pickup' | 'pickupCopy' | 'return'>('pickup');

  // Check user role
  React.useEffect(() => {
    async function checkRole() {
      try {
        const res = await apiClient<any>('/auth/me');
        const user = res.data?.user || (res.data?.id ? res.data : null);
        if (user) {
          setCurrentUser(user);
        }
      } catch {
        // Failed
      } finally {
        setAuthLoading(false);
      }
    }
    checkRole();
  }, []);

  // Load Board Callback
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

  // Lookup for Pickup (by 6-digit pickup code, member code PJL-, or loan code)
  const executePickupLookup = async (codeToSearch: string) => {
    const trimmed = codeToSearch.trim();
    if (!trimmed) return;

    setPickupLoading(true);
    setPickupError(null);
    setPickupLoan(null);

    const res = await apiClient<{ data: LookupResponse }>(
      `/loans/lookup?code=${encodeURIComponent(trimmed)}`
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
          `Pinjaman ditemukan tetapi berstatus ${data.loan.status}. Hanya status APPROVED yang dapat diserahkan ke peminjam.`
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

  const handlePickupLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    executePickupLookup(pickupCodeInput);
  };

  // Execute Pickup Handover
  const handleExecutePickup = async () => {
    if (!pickupLoan) return;

    setPickupLoading(true);
    setPickupError(null);

    const res = await apiClient<{ data: LoanItem; message: string }>('/loans/pickup', {
      method: 'POST',
      body: JSON.stringify({
        pickupCode: pickupLoan.pickupCode || pickupCodeInput.trim(),
        bookCopyId: selectedCopyId || undefined,
      }),
    });

    setPickupLoading(false);

    if (res.error) {
      setPickupError(res.error.message);
      return;
    }

    const borrowerName = pickupLoan.borrower?.name || 'Pembaca';
    const bookTitle = pickupLoan.book.title;
    const loanCode = pickupLoan.loanCode;

    setPickupSuccess(`Buku "${bookTitle}" berhasil diserahkan kepada ${borrowerName}!`);
    setSessionLogs((prev) => [
      {
        id: Math.random().toString(),
        type: 'pickup',
        title: bookTitle,
        borrower: borrowerName,
        code: loanCode,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 8),
    ]);
    setPickupLoan(null);
    setPickupCodeInput('');
    loadBoard();
  };

  // Lookup for Return (by Book Copy code PJ-, Loan code, or Member code PJL-)
  const executeReturnLookup = async (codeToSearch: string) => {
    const trimmed = codeToSearch.trim();
    if (!trimmed) return;

    setReturnLoading(true);
    setReturnError(null);
    setReturnLoan(null);

    const res = await apiClient<{ data: LookupResponse }>(
      `/loans/lookup?code=${encodeURIComponent(trimmed)}`
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

  const handleReturnLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    executeReturnLookup(returnCodeInput);
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

    const borrowerName = returnLoan.borrower?.name || 'Pembaca';
    const bookTitle = returnLoan.book.title;
    const loanCode = returnLoan.loanCode;

    setReturnSuccess(`Pengembalian buku "${bookTitle}" berhasil dicatat (Kondisi: ${returnCondition}).`);
    setSessionLogs((prev) => [
      {
        id: Math.random().toString(),
        type: 'return',
        title: bookTitle,
        borrower: borrowerName,
        code: loanCode,
        condition: returnCondition,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 8),
    ]);
    setReturnLoan(null);
    setReturnCodeInput('');
    setReturnNote('');
    loadBoard();
  };

  // Quick process from Board items
  const handleBoardQuickPickup = (pickupCode: string) => {
    setPickupCodeInput(pickupCode);
    setActiveTab('pickup');
    setPickupSuccess(null);
    setPickupError(null);
    executePickupLookup(pickupCode);
  };

  const handleBoardQuickReturn = (loanCode: string) => {
    setReturnCodeInput(loanCode);
    setActiveTab('return');
    setReturnSuccess(null);
    setReturnError(null);
    executeReturnLookup(loanCode);
  };

  // Handle scan result from CameraQrScannerModal
  const handleScanResult = (scannedText: string) => {
    let cleanText = scannedText.trim();

    // If scanned text is a URL (e.g. from book sticker or profile QR), extract code or parameter
    if (cleanText.startsWith('http://') || cleanText.startsWith('https://')) {
      try {
        const url = new URL(cleanText);
        const searchCopy = url.searchParams.get('copy');
        if (searchCopy) {
          cleanText = searchCopy;
        } else {
          const parts = url.pathname.split('/').filter(Boolean);
          if (parts.length >= 2 && parts[0] === 'u') {
            cleanText = `@${parts[1]}`;
          }
        }
      } catch {
        // keep as is
      }
    }

    if (scannerContext === 'pickup') {
      setPickupCodeInput(cleanText);
      setPickupSuccess(null);
      setPickupError(null);
      executePickupLookup(cleanText);
    } else if (scannerContext === 'return') {
      setReturnCodeInput(cleanText);
      setReturnSuccess(null);
      setReturnError(null);
      executeReturnLookup(cleanText);
    } else if (scannerContext === 'pickupCopy') {
      const matched = availableCopies.find(
        (c) => c.inventoryCode.toLowerCase() === cleanText.toLowerCase()
      );
      if (matched) {
        setSelectedCopyId(matched.id);
        setPickupSuccess(`Stiker eksemplar "${matched.inventoryCode}" berhasil dicocokkan!`);
        setPickupError(null);
      } else {
        setPickupError(`Eksemplar fisik "${cleanText}" tidak tersedia untuk judul ini.`);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <CustomLoader size="md" label="MEMERIKSA HAK AKSES SIRKULASI LAPAK..." />
      </div>
    );
  }

  // Restrict to KURATOR and ADMIN
  if (!currentUser || (currentUser.role !== Role.KURATOR && currentUser.role !== Role.ADMIN)) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-4 font-mono text-xs">
        <div className="p-6 border-2 border-destructive bg-surface text-destructive space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Akses Khusus Kurator & Admin Lapak</span>
          </div>
          <p className="font-sans text-xs text-foreground">
            Halaman Meja Sirkulasi Lapak hanya dapat diakses oleh akun dengan peran <strong>KURATOR</strong> atau <strong>ADMIN</strong> untuk keperluan operasional serah-terima buku di lapak fisik.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 transition-colors"
            >
              Kembali ke Dasbor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Masthead Header */}
      <div className="border-b-2 border-foreground pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-widest">
            <span>Operasional Relawan Lapak</span>
            <span>// MODE SIRKULASI REALTIME</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Meja Sirkulasi Lapak
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Link
            href="/dashboard/buku"
            className="px-3 py-1.5 border border-border-hairline bg-surface hover:border-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kelola Buku & Stiker</span>
          </Link>
          <span className="px-2.5 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LAPAK AKTIF
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
          <span>Serah-Terima (Ambil Cepat)</span>
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
          onClick={() => {
            setActiveTab('board');
          }}
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

      {/* TAB 1: SERAH-TERIMA (PICKUP CEPAT) */}
      {activeTab === 'pickup' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 bg-surface border-2 border-foreground space-y-5">
            <div className="border-b border-border-hairline pb-3">
              <h2 className="font-serif text-xl font-bold text-foreground">
                Serah-Terima Buku ke Pembaca
              </h2>
              <p className="font-sans text-xs text-muted mt-1">
                Masukkan Kode Ambil (6 digit), scan QR Kartu Anggota (<strong className="font-mono text-foreground">PJL-XXXXXX</strong>), atau Kode Pinjam.
              </p>
            </div>

            {pickupSuccess && (
              <div className="p-4 bg-surface-muted border border-foreground font-mono text-xs text-foreground flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-foreground mt-0.5" />
                <span>{pickupSuccess}</span>
              </div>
            )}

            {pickupError && (
              <div className="p-4 bg-surface-muted border border-destructive font-mono text-xs text-destructive flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
                <span>{pickupError}</span>
              </div>
            )}

            <form onSubmit={handlePickupLookup} className="space-y-4">
              <div className="space-y-2">
                <label className="block font-mono text-xs uppercase tracking-widest text-foreground font-bold">
                  KODE AMBIL (6 DIGIT) ATAU QR ANGGOTA:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={pickupCodeInput}
                      onChange={(e) => setPickupCodeInput(e.target.value)}
                      placeholder="Contoh: 482913 atau PJL-A1B2C3"
                      className="w-full p-3 pr-8 text-center sm:text-left font-mono text-lg tracking-wider font-bold bg-surface-muted border-2 border-foreground focus:outline-none rounded-none text-foreground uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-muted"
                    />
                    {pickupCodeInput && (
                      <button
                        type="button"
                        onClick={() => setPickupCodeInput('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground transition-colors"
                        aria-label="Bersihkan input"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={pickupLoading || !pickupCodeInput.trim()}
                      className="flex-1 sm:flex-none px-6 py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 disabled:opacity-40 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      {pickupLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>{pickupLoading ? 'Mencari...' : 'Periksa'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerContext('pickup');
                        setScannerOpen(true);
                      }}
                      className="px-4 py-3 border-2 border-foreground bg-surface hover:bg-surface-muted transition-colors inline-flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-wider font-bold text-foreground"
                      title="Pindai QR Kartu Anggota atau Kode Ambil menggunakan Kamera HP"
                    >
                      <Camera className="w-4 h-4 text-foreground" />
                      <span className="hidden sm:inline">Scan Kamera HP</span>
                      <span className="sm:hidden">Scan</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Found Loan Verification Card */}
            {pickupLoan && (
              <div className="pt-4 border-t-2 border-foreground space-y-4 font-mono text-xs">
                <div className="p-4 bg-surface-muted border border-border-hairline space-y-3">
                  <div className="flex justify-between items-center text-muted">
                    <span>KODE PINJAM: <strong className="text-foreground">{pickupLoan.loanCode}</strong></span>
                    <span className="px-2 py-0.5 bg-foreground text-background font-bold text-[10px]">
                      APPROVED
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-lg text-foreground font-sans">
                      {pickupLoan.book.title}
                    </h3>
                    <p className="font-sans text-xs text-muted">
                      Penulis: {pickupLoan.book.author}
                    </p>
                  </div>

                  <div className="p-2.5 bg-surface border border-border-hairline space-y-1">
                    <p className="font-sans text-xs text-muted">
                      Peminjam: <strong className="text-foreground">{pickupLoan.borrower?.name}</strong> (@{pickupLoan.borrower?.username})
                    </p>
                    <p className="font-mono text-[11px] text-muted">
                      Titik Pengambilan: <span className="text-foreground">{pickupLoan.pickupPoint}</span>
                    </p>
                  </div>
                </div>

                {/* Physical Copy Selector */}
                <div className="space-y-2">
                  <label className="block text-[11px] text-foreground uppercase font-bold flex items-center justify-between">
                    <span>PILIH EKSEMPLAR FISIK YANG DISERAHKAN:</span>
                    <span className="text-[10px] text-muted font-normal">
                      Cocokkan kode stiker punggung buku
                    </span>
                  </label>
                  {availableCopies.length > 0 ? (
                    <div className="flex gap-2">
                      <select
                        value={selectedCopyId}
                        onChange={(e) => setSelectedCopyId(e.target.value)}
                        className="flex-1 p-2.5 bg-surface border-2 border-foreground rounded-none text-xs text-foreground focus:outline-none font-mono"
                      >
                        {availableCopies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.inventoryCode} — Kondisi: {c.condition}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setScannerContext('pickupCopy');
                          setScannerOpen(true);
                        }}
                        className="px-3 py-2 border-2 border-foreground bg-surface hover:bg-surface-muted transition-colors inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider font-bold text-foreground shrink-0"
                        title="Scan stiker punggung buku yang diambil"
                      >
                        <Camera className="w-3.5 h-3.5 text-foreground" />
                        <span>Scan Stiker</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive space-y-1">
                      <p>Tidak ada eksemplar fisik berstatus AVAILABLE untuk buku ini.</p>
                      <Link
                        href={`/dashboard/buku?q=${encodeURIComponent(pickupLoan.book.title)}`}
                        className="inline-block underline font-bold hover:text-foreground"
                      >
                        Buka Meja Koleksi Buku untuk menambah eksemplar &rarr;
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPickupLoan(null);
                      setPickupCodeInput('');
                      setPickupError(null);
                    }}
                    className="px-4 py-3 border border-border-hairline bg-surface hover:border-foreground transition-colors font-bold text-xs uppercase tracking-wider text-muted hover:text-foreground"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePickup}
                    disabled={pickupLoading || !selectedCopyId}
                    className="flex-1 py-3 bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>SERAHKAN BUKU KE PEMINJAM</span>
                  </button>
                </div>
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
              <p className="font-sans text-xs text-muted mt-1">
                Scan kode stiker buku (<strong className="font-mono text-foreground">PJ-XXXX-XXXX</strong>), Kode Pinjam, atau Kode Anggota.
              </p>
            </div>

            {returnSuccess && (
              <div className="p-4 bg-surface-muted border border-foreground font-mono text-xs text-foreground flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-foreground mt-0.5" />
                <span>{returnSuccess}</span>
              </div>
            )}

            {returnError && (
              <div className="p-4 bg-surface-muted border border-destructive font-mono text-xs text-destructive flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
                <span>{returnError}</span>
              </div>
            )}

            <form onSubmit={handleReturnLookup} className="space-y-4">
              <div className="space-y-2">
                <label className="block font-mono text-xs uppercase tracking-widest text-foreground font-bold">
                  KODE STIKER BUKU / KODE PINJAM:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={returnCodeInput}
                      onChange={(e) => setReturnCodeInput(e.target.value)}
                      placeholder="Contoh: PJ-2026-0001 atau LN-XXXXXX"
                      className="w-full p-3 pr-8 font-mono text-sm bg-surface-muted border-2 border-foreground focus:outline-none rounded-none text-foreground uppercase placeholder:normal-case placeholder:text-muted"
                    />
                    {returnCodeInput && (
                      <button
                        type="button"
                        onClick={() => setReturnCodeInput('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground transition-colors"
                        aria-label="Bersihkan input"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={returnLoading || !returnCodeInput.trim()}
                      className="flex-1 sm:flex-none px-6 py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 disabled:opacity-40 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      {returnLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>{returnLoading ? 'Mencari...' : 'Cari Data'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerContext('return');
                        setScannerOpen(true);
                      }}
                      className="px-4 py-3 border-2 border-foreground bg-surface hover:bg-surface-muted transition-colors inline-flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-wider font-bold text-foreground"
                      title="Pindai Stiker Punggung Buku menggunakan Kamera HP"
                    >
                      <Camera className="w-4 h-4 text-foreground" />
                      <span className="hidden sm:inline">Scan Kamera HP</span>
                      <span className="sm:hidden">Scan</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Found Return Verification Card */}
            {returnLoan && (
              <div className="pt-4 border-t-2 border-foreground space-y-5 font-mono text-xs">
                <div className="p-4 bg-surface-muted border border-border-hairline space-y-2.5">
                  <div className="flex justify-between items-center text-muted">
                    <span>KODE: <strong className="text-foreground">{returnLoan.loanCode}</strong></span>
                    <span className="font-bold px-2 py-0.5 bg-foreground text-background text-[10px]">
                      {returnLoan.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-lg text-foreground font-sans">
                      {returnLoan.book.title}
                    </h3>
                    <p className="font-sans text-xs text-muted">
                      Penulis: {returnLoan.book.author}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-hairline text-[11px]">
                    <div>
                      <span className="text-muted block">PEMINJAM:</span>
                      <strong className="text-foreground">{returnLoan.borrower?.name}</strong> (@{returnLoan.borrower?.username})
                    </div>
                    <div>
                      <span className="text-muted block">EKSEMPLAR FISIK:</span>
                      <strong className="text-foreground">
                        {returnLoan.bookCopy?.inventoryCode || 'Belum Terikat'}
                      </strong>
                    </div>
                  </div>

                  {/* Overdue / Due Date Context Banner */}
                  {returnLoan.dueDate && (() => {
                    const isOverdue = new Date(returnLoan.dueDate) < new Date();
                    const overdueDays = isOverdue
                      ? Math.max(1, Math.ceil((Date.now() - new Date(returnLoan.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
                      : 0;

                    return isOverdue ? (
                      <div className="p-3 bg-destructive/10 border-2 border-destructive flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2 font-bold text-destructive">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-destructive" />
                          <span>TERLAMBAT {overdueDays} HARI</span>
                        </div>
                        <span className="text-[10px] text-destructive uppercase tracking-wider">
                          Tenggat: {new Date(returnLoan.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-surface border border-border-hairline flex items-center justify-between text-xs font-mono text-muted">
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tepat Waktu (Dalam Masa Pinjam)</span>
                        </div>
                        <span className="text-[10px]">
                          Tenggat: {new Date(returnLoan.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Physical condition selection */}
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
                            : 'border-border-hairline hover:border-foreground bg-surface'
                        }`}
                      >
                        <span className="block text-xs uppercase text-foreground">{item.label}</span>
                        <span className="block text-[10px] text-muted mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Curator Note */}
                <div className="space-y-1">
                  <label className="block text-[11px] text-muted uppercase">Catatan Kurator / Relawan (Opsional):</label>
                  <input
                    type="text"
                    value={returnNote}
                    onChange={(e) => setReturnNote(e.target.value)}
                    placeholder="Keterangan kondisi halaman, keterlambatan, atau catatan lapak..."
                    className="w-full p-2.5 bg-surface-muted border border-border-hairline rounded-none text-xs focus:outline-none focus:border-foreground text-foreground"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setReturnLoan(null);
                      setReturnCodeInput('');
                      setReturnNote('');
                      setReturnError(null);
                    }}
                    className="px-4 py-3 border border-border-hairline bg-surface hover:border-foreground transition-colors font-bold text-xs uppercase tracking-wider text-muted hover:text-foreground"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteReturn}
                    disabled={returnLoading}
                    className="flex-1 py-3 bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CATAT PENGEMBALIAN BUKU</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PAPAN PANTAU LAPAK (REALTIME MONITOR) */}
      {activeTab === 'board' && (
        <div className="space-y-6 font-sans">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-muted uppercase tracking-wider">
              Daftar pinjaman aktif yang memerlukan tindakan di lapak hari ini.
            </p>
            <button
              type="button"
              onClick={loadBoard}
              disabled={boardLoading}
              className="px-3 py-1.5 border border-border-hairline bg-surface hover:border-foreground font-mono text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${boardLoading ? 'animate-spin' : ''}`} />
              <span>Muat Ulang</span>
            </button>
          </div>

          {boardLoading ? (
            <div className="py-20 flex justify-center">
              <CustomLoader size="md" label="MEMUAT PAPAN PANTAU LAPAK..." />
            </div>
          ) : boardData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Siap Diambil */}
              <div className="border-2 border-foreground bg-surface p-5 space-y-4">
                <div className="border-b border-border-hairline pb-2 flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-foreground" />
                    Siap Diambil ({boardData.readyForPickup.length})
                  </span>
                  <span className="text-[10px] text-muted">APPROVED</span>
                </div>

                {boardData.readyForPickup.length === 0 ? (
                  <p className="text-xs text-muted italic font-mono py-4 text-center">Tidak ada antrean ambil.</p>
                ) : (
                  <div className="space-y-3">
                    {boardData.readyForPickup.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-surface-muted border border-border-hairline text-xs font-mono space-y-2 hover:border-foreground transition-colors"
                      >
                        <div className="flex justify-between font-bold items-center">
                          <span className="text-foreground truncate">{item.borrowerName}</span>
                          <span className="text-base tracking-wider bg-surface px-1.5 border border-border-hairline font-bold">
                            {item.pickupCode}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-muted line-clamp-1">{item.bookTitle}</p>
                        <button
                          type="button"
                          onClick={() => handleBoardQuickPickup(item.pickupCode || '')}
                          className="w-full mt-1 py-1.5 border border-foreground bg-surface text-foreground font-mono text-[10px] uppercase font-bold hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-1"
                        >
                          <span>Proses Ambil</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 2: Jatuh Tempo Hari Ini */}
              <div className="border border-border-hairline bg-surface p-5 space-y-4">
                <div className="border-b border-border-hairline pb-2 flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-foreground" />
                    Jatuh Tempo Hari Ini ({boardData.dueToday.length})
                  </span>
                  <span className="text-[10px] text-muted">BORROWED</span>
                </div>

                {boardData.dueToday.length === 0 ? (
                  <p className="text-xs text-muted italic font-mono py-4 text-center">Nihil hari ini.</p>
                ) : (
                  <div className="space-y-3">
                    {boardData.dueToday.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-surface-muted border border-border-hairline text-xs font-mono space-y-2 hover:border-foreground transition-colors"
                      >
                        <div className="flex justify-between font-bold">
                          <span className="text-foreground truncate">{item.borrowerName}</span>
                          <span className="text-xs text-muted">{item.loanCode}</span>
                        </div>
                        <p className="font-sans text-xs text-muted line-clamp-1">{item.bookTitle}</p>
                        <button
                          type="button"
                          onClick={() => handleBoardQuickReturn(item.loanCode)}
                          className="w-full mt-1 py-1.5 border border-border-hairline bg-surface text-foreground font-mono text-[10px] uppercase font-bold hover:border-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-1"
                        >
                          <span>Proses Kembali</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 3: Terlambat / Overdue */}
              <div className="border-2 border-destructive/60 bg-surface p-5 space-y-4">
                <div className="border-b border-destructive/30 pb-2 flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                    Terlambat / Overdue ({boardData.overdue.length})
                  </span>
                  <span className="text-[10px] text-destructive font-bold">PERINGATAN</span>
                </div>

                {boardData.overdue.length === 0 ? (
                  <p className="text-xs text-muted italic font-mono py-4 text-center">Tidak ada pinjaman terlambat.</p>
                ) : (
                  <div className="space-y-3">
                    {boardData.overdue.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-surface-muted border border-destructive/40 text-xs font-mono space-y-2"
                      >
                        <div className="flex justify-between font-bold text-destructive">
                          <span className="truncate">{item.borrowerName}</span>
                          <span>{item.loanCode}</span>
                        </div>
                        <p className="font-sans text-xs text-muted line-clamp-1">{item.bookTitle}</p>
                        <button
                          type="button"
                          onClick={() => handleBoardQuickReturn(item.loanCode)}
                          className="w-full mt-1 py-1.5 border border-destructive bg-destructive/10 text-destructive font-mono text-[10px] uppercase font-bold hover:bg-destructive hover:text-white transition-colors flex items-center justify-center gap-1"
                        >
                          <span>Terima Pengembalian</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Session Activity Log (Riwayat Transaksi Sesi Lapak Ini) */}
      {sessionLogs.length > 0 && (
        <div className="border-2 border-foreground bg-surface p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-foreground" />
              <span>Riwayat Transaksi Sesi Lapak Ini ({sessionLogs.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setSessionLogs([])}
              className="text-[10px] text-muted hover:text-foreground uppercase underline"
            >
              Bersihkan Riwayat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sessionLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-surface-muted border border-border-hairline text-xs space-y-1.5 hover:border-foreground transition-colors"
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span
                    className={`px-1.5 py-0.5 font-bold uppercase tracking-wider ${
                      log.type === 'pickup'
                        ? 'bg-foreground text-background'
                        : 'border border-foreground text-foreground'
                    }`}
                  >
                    {log.type === 'pickup' ? 'SERAH-TERIMA' : 'PENGEMBALIAN'}
                  </span>
                  <span className="text-muted">{log.time}</span>
                </div>
                <p className="font-sans font-bold text-foreground text-xs line-clamp-1">{log.title}</p>
                <div className="flex justify-between text-[11px] text-muted pt-0.5">
                  <span className="truncate">Peminjam: <strong className="text-foreground">{log.borrower}</strong></span>
                  {log.condition && (
                    <span className="uppercase font-bold text-foreground shrink-0 ml-1">({log.condition})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Camera QR/Barcode Scanner Modal */}
      <CameraQrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanResult}
        title={
          scannerContext === 'pickup'
            ? 'Scan QR Kartu Anggota / Kode Ambil'
            : scannerContext === 'pickupCopy'
            ? 'Scan Stiker Punggung Eksemplar Buku'
            : 'Scan Stiker Buku / Kode Pinjam'
        }
        instruction={
          scannerContext === 'pickup'
            ? 'Arahkan kamera ponsel ke QR Kartu Anggota digital pembaca atau kode ambil 6-digit.'
            : scannerContext === 'pickupCopy'
            ? 'Arahkan kamera ponsel ke stiker di punggung buku fisik yang akan diserahkan.'
            : 'Arahkan kamera ponsel ke stiker punggung buku yang sedang dikembalikan oleh pembaca.'
        }
      />
    </div>
  );
}
