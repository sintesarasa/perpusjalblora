'use client';

import * as React from 'react';
import Link from 'next/link';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  LoanItem,
  LoanPickupBoardItem,
  LoanPickupBoardResponse,
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
  Users,
  MessageCircle,
  FileCheck2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const CameraQrScannerModal = dynamic(
  () => import('@/components/circulation/camera-qr-scanner-modal').then((mod) => mod.CameraQrScannerModal),
  { ssr: false }
);

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

  const [activeTab, setActiveTab] = React.useState<'board' | 'approvals'>('board');

  // Tab 0: Persetujuan Pinjaman (Pending Approvals)
  const [pendingLoans, setPendingLoans] = React.useState<LoanItem[]>([]);
  const [pendingLoading, setPendingLoading] = React.useState(false);
  const [pendingError, setPendingError] = React.useState<string | null>(null);
  const [pendingSuccess, setPendingSuccess] = React.useState<string | null>(null);
  const [selectedCopiesForPending, setSelectedCopiesForPending] = React.useState<Record<string, string>>({});
  const [actionLoanId, setActionLoanId] = React.useState<string | null>(null);

  // Reject Modal
  const [rejectModalLoan, setRejectModalLoan] = React.useState<LoanItem | null>(null);
  const [rejectReason, setRejectReason] = React.useState('');
  const [rejectLoading, setRejectLoading] = React.useState(false);

  // Session Logs (Riwayat transaksi lapak hari ini) — survive page refresh via sessionStorage
  const [sessionLogs, setSessionLogs] = React.useState<SessionLogItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('lapak_session_logs');
        return saved ? (JSON.parse(saved) as SessionLogItem[]) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Modal Serah-Terima (Pickup)
  const [pickupCodeInput, setPickupCodeInput] = React.useState('');
  const [pickupLoan, setPickupLoan] = React.useState<LoanItem | null>(null);
  const [availableCopies, setAvailableCopies] = React.useState<Array<{ id: string; inventoryCode: string; condition?: string }>>([]);
  const [selectedCopyId, setSelectedCopyId] = React.useState('');
  const [pickupLoading, setPickupLoading] = React.useState(false);
  const [pickupError, setPickupError] = React.useState<string | null>(null);
  const [pickupSuccess, setPickupSuccess] = React.useState<string | null>(null);

  // Modal Pengembalian (Return)
  const [returnCodeInput, setReturnCodeInput] = React.useState('');
  const [returnLoan, setReturnLoan] = React.useState<LoanItem | null>(null);
  const [returnCondition, setReturnCondition] = React.useState<ReturnCondition>(ReturnCondition.BAIK);
  const [returnNote, setReturnNote] = React.useState('');
  const [returnLoading, setReturnLoading] = React.useState(false);
  const [returnError, setReturnError] = React.useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = React.useState<string | null>(null);

  // Waitlist Recommendation state for Return Handover
  const [recommendedWaitlist, setRecommendedWaitlist] = React.useState<{
    id: string;
    position: number;
    user: { id: string; name: string; username: string };
  } | null>(null);
  const [allocateLoading, setAllocateLoading] = React.useState(false);

  // Modal Peminjaman Langsung di Lapak (Walk-in Loan)
  const [walkInModalOpen, setWalkInModalOpen] = React.useState(false);
  const [walkInMemberInput, setWalkInMemberInput] = React.useState('');
  const [walkInBookInput, setWalkInBookInput] = React.useState('');
  const [walkInPickupPoint, setWalkInPickupPoint] = React.useState('Lapak Perpusjal Blora');
  const [walkInNote, setWalkInNote] = React.useState('');
  const [walkInLoading, setWalkInLoading] = React.useState(false);
  const [walkInError, setWalkInError] = React.useState<string | null>(null);
  const [walkInSuccess, setWalkInSuccess] = React.useState<string | null>(null);

  // Universal Quick Scan / Search Bar
  const [universalSearchInput, setUniversalSearchInput] = React.useState('');
  const [universalSearchLoading, setUniversalSearchLoading] = React.useState(false);
  const [universalSearchMessage, setUniversalSearchMessage] = React.useState<string | null>(null);

  // Volunteer Extension states
  const [extendLoadingId, setExtendLoadingId] = React.useState<string | null>(null);
  const [actionBanner, setActionBanner] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Board
  const [boardData, setBoardData] = React.useState<LoanPickupBoardResponse | null>(null);
  const [boardLoading, setBoardLoading] = React.useState(false);

  // Active Loans Drawer / Table (Pilihan A)
  const [showActiveLoansDrawer, setShowActiveLoansDrawer] = React.useState(false);
  const [activeLoansList, setActiveLoansList] = React.useState<LoanItem[]>([]);
  const [activeLoansLoading, setActiveLoansLoading] = React.useState(false);
  const [activeLoansSearch, setActiveLoansSearch] = React.useState('');

  // Camera QR Scanner Modal State
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [scannerContext, setScannerContext] = React.useState<
    'pickup' | 'pickupCopy' | 'return' | 'universal' | 'walkInMember' | 'walkInBook'
  >('universal');

  // GAP-07: Confirmation modal for HILANG condition (irreversible action)
  const [showHilangConfirm, setShowHilangConfirm] = React.useState(false);

  // GAP-09: Sync sessionLogs to sessionStorage on every change
  React.useEffect(() => {
    try {
      sessionStorage.setItem('lapak_session_logs', JSON.stringify(sessionLogs));
    } catch {
      // sessionStorage might be full — ignore
    }
  }, [sessionLogs]);

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
    const res = await apiClient<{ data: LoanPickupBoardResponse }>('/loans/pickup-board');
    setBoardLoading(false);
    if (res.data) {
      setBoardData(res.data.data);
    }
  }, []);

  // Load Active Loans List (BORROWED)
  const loadActiveLoans = React.useCallback(async () => {
    setActiveLoansLoading(true);
    const res = await apiClient<{ data: LoanItem[] }>('/loans?status=BORROWED&perPage=50&sort=jatuhTempo');
    setActiveLoansLoading(false);
    if (res.data) {
      setActiveLoansList(res.data.data);
    }
  }, []);

  const filteredActiveLoans = React.useMemo(() => {
    if (!activeLoansSearch.trim()) return activeLoansList;
    const q = activeLoansSearch.toLowerCase();
    return activeLoansList.filter(
      (l) =>
        l.book.title.toLowerCase().includes(q) ||
        (l.borrower?.name && l.borrower.name.toLowerCase().includes(q)) ||
        (l.borrower?.username && l.borrower.username.toLowerCase().includes(q)) ||
        l.loanCode.toLowerCase().includes(q) ||
        (l.bookCopy?.inventoryCode && l.bookCopy.inventoryCode.toLowerCase().includes(q))
    );
  }, [activeLoansList, activeLoansSearch]);

  const [maintenanceLoading, setMaintenanceLoading] = React.useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = React.useState<string | null>(null);

  const handleRunMaintenance = async () => {
    setMaintenanceLoading(true);
    const res = await apiClient<{ data: { expiredCount: number; overdueCount: number }; message: string }>(
      '/loans/admin/maintenance',
      { method: 'POST' }
    );
    setMaintenanceLoading(false);

    if (res.error) {
      alert(res.error.message);
      return;
    }

    const { expiredCount, overdueCount } = res.data?.data || { expiredCount: 0, overdueCount: 0 };
    setMaintenanceMessage(
      `Pemeliharaan selesai: ${expiredCount} pinjaman kedaluwarsa dibatalkan, ${overdueCount} pinjaman terlambat diperbarui.`
    );
    loadBoard();
    setTimeout(() => setMaintenanceMessage(null), 5000);
  };

  React.useEffect(() => {
    if (activeTab === 'board') {
      loadBoard();
      // GAP-06: Auto-refresh board every 60s while tab is active
      const interval = setInterval(() => {
        loadBoard();
      }, 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [activeTab, loadBoard]);

  // Load Pending Loans Callback
  const loadPendingLoans = React.useCallback(async () => {
    setPendingLoading(true);
    setPendingError(null);
    const res = await apiClient<{ data: LoanItem[] }>('/loans?status=PENDING&perPage=50');
    setPendingLoading(false);
    if (res.data) {
      setPendingLoans(res.data.data);
      const copyMap: Record<string, string> = {};
      res.data.data.forEach((loan) => {
        const copies = loan.book.copies || [];
        if (copies.length > 0) {
          copyMap[loan.id] = copies[0].id;
        }
      });
      setSelectedCopiesForPending((prev) => ({ ...copyMap, ...prev }));
    } else if (res.error) {
      setPendingError(res.error.message);
    }
  }, []);

  React.useEffect(() => {
    loadPendingLoans();
  }, [loadPendingLoans]);

  // Action: Approve only (issue 6-digit pickupCode, 3-day deadline)
  const handleApproveOnly = async (loan: LoanItem) => {
    setActionLoanId(loan.id);
    setPendingError(null);
    const res = await apiClient<{ data: LoanItem; message: string }>(`/loans/${loan.id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ pickupDeadlineDays: 3 }),
    });
    setActionLoanId(null);
    if (res.error) {
      setPendingError(res.error.message);
      return;
    }
    setPendingSuccess(
      `Pengajuan "${loan.book.title}" berhasil disetujui! Kode Ambil: ${res.data?.data.pickupCode || '-'}`
    );
    loadPendingLoans();
    loadBoard();
  };

  // Action: Approve & Pickup in one step (instant handover)
  const handleApproveAndPickup = async (loan: LoanItem, bookCopyId?: string) => {
    setActionLoanId(loan.id);
    setPendingError(null);
    const res = await apiClient<{ data: LoanItem; message: string }>(`/loans/${loan.id}/approve-and-pickup`, {
      method: 'POST',
      body: JSON.stringify({ bookCopyId: bookCopyId || undefined }),
    });
    setActionLoanId(null);
    if (res.error) {
      setPendingError(res.error.message);
      return;
    }
    const borrowerName = loan.borrower?.name || 'Pembaca';
    setPendingSuccess(`Buku "${loan.book.title}" berhasil disetujui dan diserahkan kepada ${borrowerName}!`);
    setSessionLogs((prev) => [
      {
        id: Math.random().toString(),
        type: 'pickup',
        code: loan.loanCode,
        title: loan.book.title,
        borrower: borrowerName,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 8),
    ]);
    loadPendingLoans();
    loadBoard();
  };

  // Action: Confirm rejection with reason
  const handleConfirmReject = async () => {
    if (!rejectModalLoan || !rejectReason.trim()) return;
    setRejectLoading(true);
    const res = await apiClient<{ message: string }>(`/loans/${rejectModalLoan.id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: rejectReason.trim() }),
    });
    setRejectLoading(false);
    if (res.error) {
      alert(res.error.message);
      return;
    }
    setPendingSuccess(`Pengajuan pinjaman "${rejectModalLoan.book.title}" telah ditolak.`);
    setRejectModalLoan(null);
    setRejectReason('');
    loadPendingLoans();
    loadBoard();
  };

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
      if (data.loan.status !== LoanStatus.APPROVED && data.loan.status !== LoanStatus.PENDING) {
        setPickupError(
          `Pinjaman ditemukan tetapi berstatus ${data.loan.status}. Hanya status APPROVED atau PENDING yang dapat diproses di meja ini.`
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

    const res = await apiClient<{
      data: LoanItem;
      message: string;
      pendingWaitlist?: {
        id: string;
        position: number;
        user: { id: string; name: string; username: string };
      } | null;
    }>(
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
    if (res.data?.pendingWaitlist) {
      setRecommendedWaitlist(res.data.pendingWaitlist);
    } else {
      setRecommendedWaitlist(null);
    }

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
    setShowHilangConfirm(false);
    loadBoard();
  };

  const handleAllocateWaitlist = async (waitlistId: string) => {
    setAllocateLoading(true);
    const res = await apiClient<{ message: string; loan?: any }>(
      `/waitlist/${waitlistId}/allocate`,
      {
        method: 'POST',
        body: JSON.stringify({ pickupDeadlineDays: 3 }),
      }
    );
    setAllocateLoading(false);

    if (res.error) {
      alert(res.error.message);
      return;
    }

    setRecommendedWaitlist(null);
    setReturnSuccess(
      res.data?.message || 'Buku berhasil dialokasikan kepada antrean pembaca!'
    );
    loadBoard();
  };

  // Quick process from Board items
  const handleBoardQuickPickup = (pickupCode: string) => {
    setPickupCodeInput(pickupCode);
    setPickupSuccess(null);
    setPickupError(null);
    executePickupLookup(pickupCode);
  };

  const handleBoardQuickReturn = (loanCode: string) => {
    setReturnCodeInput(loanCode);
    setReturnSuccess(null);
    setReturnError(null);
    executeReturnLookup(loanCode);
  };

  // Volunteer Action: Extend active loan by 7 days
  const handleVolunteerExtend = async (loanId: string, bookTitle: string) => {
    if (!window.confirm(`Perpanjang masa pinjam buku "${bookTitle}" selama 7 hari?`)) return;

    setExtendLoadingId(loanId);
    setActionBanner(null);

    const res = await apiClient<{ data: LoanItem; message: string }>(`/loans/${loanId}/extend`, {
      method: 'POST',
    });

    setExtendLoadingId(null);

    if (res.error) {
      setActionBanner({ type: 'error', message: res.error.message });
      return;
    }

    const newDueDate = res.data?.data.dueDate
      ? new Date(res.data.data.dueDate).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '7 hari ke depan';

    setActionBanner({
      type: 'success',
      message: `Masa pinjam "${bookTitle}" berhasil diperpanjang oleh relawan hingga ${newDueDate}.`,
    });

    loadBoard();
    if (showActiveLoansDrawer) {
      loadActiveLoans();
    }
  };

  // Walk-in Loan submission
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInMemberInput.trim() || !walkInBookInput.trim()) {
      setWalkInError('Identitas member dan kode stiker buku wajib diisi.');
      return;
    }

    setWalkInLoading(true);
    setWalkInError(null);
    setWalkInSuccess(null);

    const res = await apiClient<{ data: LoanItem; message: string }>('/loans/walk-in', {
      method: 'POST',
      body: JSON.stringify({
        memberIdentifier: walkInMemberInput.trim(),
        bookCopyIdentifier: walkInBookInput.trim(),
        pickupPoint: walkInPickupPoint.trim() || 'Lapak Perpusjal Blora',
        note: walkInNote.trim() || undefined,
      }),
    });

    setWalkInLoading(false);

    if (res.error) {
      setWalkInError(res.error.message);
      return;
    }

    const loan = res.data?.data;
    const borrowerName = loan?.borrower?.name || walkInMemberInput;
    const bookTitle = loan?.book?.title || walkInBookInput;

    setWalkInSuccess(`Pinjaman langsung "${bookTitle}" untuk ${borrowerName} berhasil diterbitkan (Tenggat: 14 hari).`);
    setSessionLogs((prev) => [
      {
        id: Math.random().toString(),
        type: 'pickup',
        title: bookTitle,
        borrower: borrowerName,
        code: loan?.loanCode || 'WALK-IN',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 8),
    ]);

    // Reset form fields
    setWalkInMemberInput('');
    setWalkInBookInput('');
    setWalkInNote('');
    loadBoard();
    if (showActiveLoansDrawer) {
      loadActiveLoans();
    }
  };

  // Universal Lookup Handler
  const executeUniversalLookup = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setUniversalSearchLoading(true);
    setUniversalSearchMessage(null);

    const res = await apiClient<{ data: LookupResponse }>(
      `/loans/lookup?code=${encodeURIComponent(trimmed)}`
    );

    setUniversalSearchLoading(false);

    if (res.error) {
      setUniversalSearchMessage(
        `Kode "${trimmed}" tidak cocok dengan pinjaman aktif (${res.error.message}). Gunakan tombol "⚡ Pinjam Langsung" jika ingin meminjamkan di tempat.`
      );
      return;
    }

    if (res.data?.data) {
      const data = res.data.data;
      if (data.loan.status === LoanStatus.APPROVED) {
        setPickupLoan(data.loan);
        setAvailableCopies(data.availableCopies || []);
        if (data.availableCopies && data.availableCopies.length > 0) {
          setSelectedCopyId(data.availableCopies[0].id);
        }
      } else if (
        data.loan.status === LoanStatus.BORROWED ||
        data.loan.status === LoanStatus.OVERDUE
      ) {
        setReturnLoan(data.loan);
        setReturnCondition(ReturnCondition.BAIK);
        setReturnNote('');
      } else if (data.loan.status === LoanStatus.PENDING) {
        setActiveTab('approvals');
        setUniversalSearchMessage(
          `Pengajuan untuk buku "${data.loan.book.title}" masih berstatus MENUNGGU PERSETUJUAN (PENDING). Beralih ke meja persetujuan.`
        );
      } else {
        setUniversalSearchMessage(
          `Pinjaman buku "${data.loan.book.title}" ditemukan tetapi berstatus ${data.loan.status} (bukan pinjaman aktif).`
        );
      }
    }
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

    if (scannerContext === 'universal') {
      setUniversalSearchInput(cleanText);
      executeUniversalLookup(cleanText);
    } else if (scannerContext === 'walkInMember') {
      setWalkInMemberInput(cleanText);
    } else if (scannerContext === 'walkInBook') {
      setWalkInBookInput(cleanText);
    } else if (scannerContext === 'pickup') {
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
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto font-sans">
      {/* Masthead Header */}
      <div className="border-b-2 border-foreground pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] sm:text-xs text-muted uppercase tracking-widest">
            <span>Operasional Relawan Lapak</span>
            <span>// MODE SIRKULASI REALTIME</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Meja Sirkulasi Lapak
            </h1>
            <span className="px-2 py-0.5 bg-foreground text-background font-mono text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-none bg-background animate-pulse" />
              LAPAK AKTIF
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 font-mono text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setWalkInError(null);
              setWalkInSuccess(null);
              setWalkInModalOpen(true);
            }}
            className="h-10 sm:h-9 px-4 bg-foreground text-background font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 hover:bg-foreground/90 transition-colors"
          >
            <Zap className="w-4 h-4 fill-background text-background shrink-0" />
            <span>⚡ Pinjam Langsung (Walk-in)</span>
          </button>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              type="button"
              onClick={handleRunMaintenance}
              disabled={maintenanceLoading}
              className="h-10 sm:h-9 px-3 border border-border-hairline bg-surface hover:border-foreground transition-colors inline-flex items-center justify-center gap-1.5 text-muted hover:text-foreground"
              title="Jalankan pemeriksaan sirkulasi kedaluwarsa & pengingat keterlambatan"
            >
              <RefreshCw className={cn('w-3.5 h-3.5 shrink-0', maintenanceLoading && 'animate-spin')} />
              <span>{maintenanceLoading ? 'Memeriksa...' : 'Sinkron'}</span>
            </button>

            <Link
              href="/dashboard/buku"
              className="h-10 sm:h-9 px-3 border border-border-hairline bg-surface hover:border-foreground transition-colors inline-flex items-center justify-center gap-1.5 text-foreground"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Katalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Maintenance Notification Banner */}
      {maintenanceMessage && (
        <div className="p-3 bg-surface border border-foreground font-mono text-xs text-foreground flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
            <span>{maintenanceMessage}</span>
          </div>
          <button onClick={() => setMaintenanceMessage(null)} className="text-muted hover:text-foreground p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab switchers - horizontally scrollable on mobile */}
      <div className="flex items-center gap-1 border-b border-border-hairline font-mono text-xs uppercase tracking-wider pb-px overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setActiveTab('board');
          }}
          className={`shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 border-b-2 transition-colors flex items-center gap-2 min-h-[44px] ${
            activeTab === 'board'
              ? 'border-foreground text-foreground font-bold'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Papan Pantau Lapak</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('approvals');
            setPendingSuccess(null);
            setPendingError(null);
          }}
          className={`shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 border-b-2 transition-colors flex items-center gap-2 min-h-[44px] ${
            activeTab === 'approvals'
              ? 'border-foreground text-foreground font-bold'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Antrean Persetujuan Online</span>
          {pendingLoans.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-foreground text-background font-bold leading-none">
              {pendingLoans.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 0: PERSETUJUAN PINJAMAN (APPROVALS) */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">
                Antrean Persetujuan Pinjaman Buku
              </h2>
              <p className="font-sans text-xs text-muted mt-1">
                Tinjau permohonan pinjaman warga yang masuk. Setujui untuk menerbitkan kode ambil atau langsung serahkan buku di lapak.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadPendingLoans}
                disabled={pendingLoading}
                className="px-3 py-1.5 border border-border-hairline bg-surface hover:border-foreground font-mono text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pendingLoading ? 'animate-spin' : ''}`} />
                <span>Segarkan Data</span>
              </button>
            </div>
          </div>

          {pendingSuccess && (
            <div className="p-4 bg-surface-muted border border-foreground font-mono text-xs text-foreground flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-foreground mt-0.5" />
              <span>{pendingSuccess}</span>
            </div>
          )}

          {pendingError && (
            <div className="p-4 bg-surface-muted border border-destructive font-mono text-xs text-destructive flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
              <span>{pendingError}</span>
            </div>
          )}

          {pendingLoading ? (
            <div className="py-20 flex justify-center">
              <CustomLoader size="md" label="MEMUAT ANTREAN PERSETUJUAN..." />
            </div>
          ) : pendingLoans.length === 0 ? (
            <div className="p-12 text-center border-2 border-border-hairline bg-surface space-y-3 font-mono text-xs">
              <FileCheck2 className="w-8 h-8 text-muted mx-auto stroke-1" />
              <p className="font-bold text-foreground uppercase tracking-widest">
                TIDAK ADA PERMOHONAN MENUNGGU
              </p>
              <p className="font-sans text-muted max-w-md mx-auto">
                Semua permohonan peminjaman buku dari warga telah selesai diproses. Pengajuan baru yang masuk akan otomatis tampil di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingLoans.map((loan) => {
                const copies = loan.book.copies || [];
                const selectedCopy = selectedCopiesForPending[loan.id] || (copies.length > 0 ? copies[0].id : '');

                return (
                  <div
                    key={loan.id}
                    className="p-5 border-2 border-foreground bg-surface space-y-4 font-mono text-xs"
                  >
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline pb-2 text-muted">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500 text-black font-bold text-[10px]">
                          PENDING
                        </span>
                        <span className="text-foreground font-bold tracking-wider">{loan.loanCode}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span>Diajukan: <strong className="text-foreground">{new Date(loan.requestedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</strong></span>
                        <span>•</span>
                        <span>Titik Ambil: <strong className="text-foreground">{loan.pickupPoint}</strong></span>
                      </div>
                    </div>

                    {/* Book & Borrower columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Book */}
                      <div className="flex gap-3">
                        <div className="w-16 h-22 shrink-0 bg-surface-muted border border-border-hairline overflow-hidden flex items-center justify-center">
                          {loan.book.coverImage ? (
                            <img src={loan.book.coverImage} alt={loan.book.title} className="w-full h-full object-cover grayscale" />
                          ) : (
                            <BookOpen className="w-6 h-6 text-muted" />
                          )}
                        </div>
                        <div className="space-y-1 font-sans">
                          <Link href={`/buku/${loan.book.slug}`} target="_blank" className="font-serif font-bold text-base text-foreground hover:underline block leading-snug">
                            {loan.book.title}
                          </Link>
                          <p className="text-xs text-muted">Penulis: {loan.book.author}</p>
                          <p className="text-[11px] font-mono text-muted pt-1">
                            Sisa Stok Rak: <strong className="text-foreground">{loan.book.availableCopies ?? '-'}</strong> eksemplar
                          </p>
                        </div>
                      </div>

                      {/* Right: Borrower & Note */}
                      <div className="p-3 bg-surface-muted border border-border-hairline space-y-2 font-sans text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-foreground">{loan.borrower?.name}</p>
                            <p className="text-muted text-[11px]">@{loan.borrower?.username} • {loan.borrower?.email}</p>
                          </div>
                          {loan.pickupDatePlan && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-surface border border-border-hairline text-muted">
                              Rencana: {new Date(loan.pickupDatePlan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>

                        {loan.userNote ? (
                          <div className="text-[11px] italic bg-surface p-2 border border-border-hairline text-foreground">
                            &ldquo;{loan.userNote}&rdquo;
                          </div>
                        ) : (
                          <p className="text-[11px] text-muted italic">Tidak ada catatan peminjam.</p>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions & Physical Copy Selection */}
                    <div className="pt-3 border-t border-border-hairline flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Physical Copy selector for instant handover */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-[11px] text-muted uppercase font-bold shrink-0">
                          PILIH EKSEMPLAR:
                        </label>
                        {copies.length > 0 ? (
                          <select
                            value={selectedCopy}
                            onChange={(e) =>
                              setSelectedCopiesForPending((prev) => ({
                                ...prev,
                                [loan.id]: e.target.value,
                              }))
                            }
                            className="h-10 sm:h-8 px-2 bg-surface border border-border-hairline text-xs font-mono text-foreground focus:outline-none focus:border-foreground"
                          >
                            {copies.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.inventoryCode} ({c.condition || 'BAIK'})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[11px] text-destructive italic">Tidak ada eksemplar tersedia di rak</span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectModalLoan(loan);
                            setRejectReason('');
                          }}
                          disabled={actionLoanId === loan.id}
                          className="h-10 sm:h-8 px-3 border border-border-hairline text-muted hover:text-destructive hover:border-destructive uppercase font-bold tracking-wider transition-colors inline-flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApproveOnly(loan)}
                          disabled={actionLoanId === loan.id}
                          className="h-10 sm:h-8 px-3 border-2 border-foreground text-foreground hover:bg-surface-muted uppercase font-bold tracking-wider transition-colors inline-flex items-center justify-center gap-1.5"
                          title="Setujui permohonan dan terbitkan kode ambil 6 digit untuk diambil dalam 3 hari"
                        >
                          {actionLoanId === loan.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                          <span>Setujui (Kode Ambil)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApproveAndPickup(loan, selectedCopy)}
                          disabled={actionLoanId === loan.id || !selectedCopy}
                          className="h-10 sm:h-8 px-4 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-40 transition-colors inline-flex items-center justify-center gap-1.5"
                          title="Setujui permohonan dan serahkan buku seketika kepada peminjam yang ada di lapak"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui & Serahkan di Tempat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

          {/* Volunteer Action Feedback Banner */}
          {actionBanner && (
            <div
              className={`p-3 border font-mono text-xs flex items-center justify-between gap-2 ${
                actionBanner.type === 'success'
                  ? 'bg-surface border-foreground text-foreground'
                  : 'bg-destructive/10 border-destructive text-destructive'
              }`}
            >
              <div className="flex items-center gap-2">
                {actionBanner.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                )}
                <span>{actionBanner.message}</span>
              </div>
              <button onClick={() => setActionBanner(null)} className="text-muted hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Universal Quick Scan & Search Bar */}
          <div className="p-3 sm:p-4 bg-surface border-2 border-foreground space-y-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Universal Search / Scanner Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={universalSearchInput}
                  onChange={(e) => setUniversalSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      executeUniversalLookup(universalSearchInput);
                    }
                  }}
                  placeholder="Scan stiker buku (PJ-xxxx), QR Member, kode ambil (6 digit), atau kode pinjam..."
                  className="w-full h-11 sm:h-10 pl-9 pr-9 bg-surface-muted border-2 border-foreground font-mono text-xs text-foreground placeholder:text-muted placeholder:font-sans focus:outline-none"
                />
                {universalSearchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setUniversalSearchInput('');
                      setUniversalSearchMessage(null);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => executeUniversalLookup(universalSearchInput)}
                  disabled={universalSearchLoading || !universalSearchInput.trim()}
                  className="h-11 sm:h-10 px-4 bg-foreground text-background font-mono text-xs uppercase font-bold tracking-wider hover:bg-foreground/90 disabled:opacity-40 transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  {universalSearchLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>Periksa</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScannerContext('universal');
                    setScannerOpen(true);
                  }}
                  className="h-11 sm:h-10 px-4 border-2 border-foreground bg-surface hover:bg-surface-muted font-mono text-xs uppercase font-bold tracking-wider transition-colors inline-flex items-center justify-center gap-1.5 text-foreground"
                  title="Pindai QR / Barcode menggunakan Kamera HP"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan Kamera</span>
                </button>
              </div>
            </div>

            {/* Universal Search Message / Prompt */}
            {universalSearchMessage && (
              <div className="p-3 bg-surface-muted border border-border-hairline font-mono text-xs flex items-center justify-between gap-2">
                <span className="text-foreground">{universalSearchMessage}</span>
                <button
                  type="button"
                  onClick={() => setUniversalSearchMessage(null)}
                  className="text-muted hover:text-foreground text-[10px] uppercase font-bold px-2 py-1"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>

          {pendingLoans.length > 0 && (
            <div className="p-3.5 sm:p-4 border-2 border-foreground bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-foreground shrink-0" />
                <div>
                  <span className="font-bold text-foreground uppercase tracking-wider block">
                    ADA {pendingLoans.length} PENGAJUAN PINJAMAN MENUNGGU PERSETUJUAN
                  </span>
                  <span className="text-muted text-[11px] font-sans">
                    Warga telah mengajukan pinjaman dan menunggu persetujuan kurator sebelum serah-terima di lapak.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('approvals')}
                className="h-10 sm:h-9 px-4 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors shrink-0 inline-flex items-center justify-center gap-1.5"
              >
                <span>Tinjau di Meja Persetujuan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {boardLoading ? (
            <div className="py-20 flex justify-center">
              <CustomLoader size="md" label="MEMUAT PAPAN PANTAU LAPAK..." />
            </div>
          ) : boardData ? (
            <div className="space-y-6">
              {/* 5 EDITORIAL STAT TILES (MOBILE FRIENDLY & TOUCH TARGETS) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 font-mono">
                {/* Tile 1: Sedang Dipinjam Warga (Clickable Drawer Toggle) */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !showActiveLoansDrawer;
                    setShowActiveLoansDrawer(next);
                    if (next) loadActiveLoans();
                  }}
                  className={cn(
                    'p-3 sm:p-3.5 border-2 text-left transition-all relative flex flex-col justify-between group min-h-[96px]',
                    showActiveLoansDrawer
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-foreground bg-surface text-foreground hover:bg-surface-muted'
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider w-full">
                    <span className={showActiveLoansDrawer ? 'text-background/80 font-bold' : 'text-muted font-bold'}>
                      Sedang Dipinjam
                    </span>
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform shrink-0', showActiveLoansDrawer && 'rotate-180')} />
                  </div>
                  <div className="my-1 sm:my-1.5 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    {boardData.totalActiveLoans ?? 0}
                  </div>
                  <div className="text-[10px] flex items-center justify-between w-full">
                    <span className={showActiveLoansDrawer ? 'text-background/80' : 'text-muted'}>Sirkulasi Aktif</span>
                    <span className="font-bold underline text-[9px] uppercase tracking-wider">
                      {showActiveLoansDrawer ? 'Tutup' : 'Daftar'}
                    </span>
                  </div>
                </button>

                {/* Tile 2: Siap Diambil */}
                <div className="p-3 sm:p-3.5 border border-border-hairline hover:border-foreground bg-surface text-foreground flex flex-col justify-between transition-colors min-h-[96px]">
                  <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider font-bold">
                    <span>Siap Diambil</span>
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <div className="my-1 sm:my-1.5 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    {boardData.readyForPickup.length}
                  </div>
                  <div className="text-[10px] text-muted">Antrean di Lapak</div>
                </div>

                {/* Tile 3: Jatuh Tempo Besok (H-1) */}
                <div
                  className={cn(
                    'p-3 sm:p-3.5 border flex flex-col justify-between transition-colors min-h-[96px]',
                    (boardData.dueTomorrow?.length || 0) > 0
                      ? 'border-amber-500/80 bg-amber-500/5 text-foreground'
                      : 'border-border-hairline bg-surface text-foreground'
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold">
                    <span className={(boardData.dueTomorrow?.length || 0) > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-muted'}>
                      Tenggat Besok
                    </span>
                    <span className="text-[10px] font-bold px-1 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 leading-none">
                      H-1
                    </span>
                  </div>
                  <div className="my-1 sm:my-1.5 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    {boardData.dueTomorrow?.length || 0}
                  </div>
                  <div className="text-[10px] text-muted">Pengingat WhatsApp</div>
                </div>

                {/* Tile 4: Jatuh Tempo Hari Ini */}
                <div
                  className={cn(
                    'p-3 sm:p-3.5 border flex flex-col justify-between transition-colors min-h-[96px]',
                    boardData.dueToday.length > 0
                      ? 'border-foreground bg-surface-muted text-foreground'
                      : 'border-border-hairline bg-surface text-foreground'
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider font-bold">
                    <span>Tenggat Hari Ini</span>
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <div className="my-1 sm:my-1.5 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    {boardData.dueToday.length}
                  </div>
                  <div className="text-[10px] text-muted">Harus Kembali</div>
                </div>

                {/* Tile 5: Terlambat / Overdue */}
                <div
                  className={cn(
                    'col-span-2 sm:col-span-1 p-3 sm:p-3.5 border-2 flex flex-col justify-between transition-colors min-h-[96px]',
                    boardData.overdue.length > 0
                      ? 'border-destructive bg-destructive/5 text-destructive'
                      : 'border-border-hairline bg-surface text-foreground'
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold">
                    <span className={boardData.overdue.length > 0 ? 'text-destructive' : 'text-muted'}>
                      Terlambat
                    </span>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <div
                    className={cn(
                      'my-1 sm:my-1.5 font-serif text-2xl sm:text-3xl font-bold tracking-tight',
                      boardData.overdue.length > 0 ? 'text-destructive' : 'text-foreground'
                    )}
                  >
                    {boardData.overdue.length}
                  </div>
                  <div className={cn('text-[10px]', boardData.overdue.length > 0 ? 'text-destructive' : 'text-muted')}>
                    {boardData.overdue.length > 0 ? 'Teguran & Denda' : 'Semua Tertib'}
                  </div>
                </div>
              </div>

              {/* EXPANDABLE ACTIVE LOANS DRAWER (MOBILE CARDS + DESKTOP TABLE) */}
              {showActiveLoansDrawer && (
                <div className="border-2 border-foreground p-3.5 sm:p-5 bg-surface-muted space-y-4 font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        type="text"
                        value={activeLoansSearch}
                        onChange={(e) => setActiveLoansSearch(e.target.value)}
                        placeholder="Cari judul buku, nama peminjam, atau kode eksemplar..."
                        className="w-full h-10 pl-8 pr-3 bg-surface border border-border-hairline font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                      />
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 text-muted text-[11px]">
                      <span>
                        Menampilkan <strong className="text-foreground">{filteredActiveLoans.length}</strong> dari {activeLoansList.length} pinjaman
                      </span>
                      <button
                        type="button"
                        onClick={loadActiveLoans}
                        disabled={activeLoansLoading}
                        className="h-8 px-2.5 border border-border-hairline bg-surface hover:border-foreground text-foreground transition-colors inline-flex items-center gap-1"
                        title="Segarkan daftar"
                      >
                        <RefreshCw className={cn('w-3 h-3', activeLoansLoading && 'animate-spin')} />
                        <span className="hidden sm:inline">Segarkan</span>
                      </button>
                    </div>
                  </div>

                  {activeLoansLoading ? (
                    <div className="py-12 flex justify-center">
                      <CustomLoader size="sm" label="MEMUAT PINJAMAN BERJALAN..." />
                    </div>
                  ) : filteredActiveLoans.length === 0 ? (
                    <div className="p-8 text-center border border-border-hairline bg-surface font-sans text-xs text-muted">
                      {activeLoansSearch ? (
                        <p>Tidak ada pinjaman berjalan yang cocok dengan kata kunci &ldquo;{activeLoansSearch}&rdquo;.</p>
                      ) : (
                        <p>Saat ini tidak ada buku yang sedang dipinjam warga.</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* MOBILE CARD VIEW (sm:hidden) */}
                      <div className="block sm:hidden space-y-3">
                        {filteredActiveLoans.map((loan) => {
                          const now = new Date();
                          const dueDate = loan.dueDate ? new Date(loan.dueDate) : null;
                          const diffDays = dueDate
                            ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                            : null;

                          let badgeClass = 'bg-surface-muted text-muted border-border-hairline';
                          let badgeText = `${diffDays} hari lagi`;

                          if (diffDays !== null) {
                            if (diffDays < 0) {
                              badgeClass = 'bg-destructive/10 text-destructive border-destructive font-bold';
                              badgeText = `Terlambat ${Math.abs(diffDays)}h`;
                            } else if (diffDays === 0) {
                              badgeClass = 'bg-amber-500/20 text-amber-600 border-amber-500 font-bold';
                              badgeText = 'Hari ini!';
                            } else if (diffDays <= 3) {
                              badgeClass = 'bg-amber-500/10 text-amber-600 border-amber-500/40';
                              badgeText = `${diffDays} hari lagi`;
                            } else {
                              badgeClass = 'bg-surface-muted text-foreground border-border-hairline';
                              badgeText = `${diffDays} hari lagi`;
                            }
                          }

                          const cleanPhone = loan.borrower?.phoneNumber ? loan.borrower.phoneNumber.replace(/\D/g, '') : '';
                          const dueDateStr = dueDate
                            ? dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                            : '-';
                          const waText = `Halo ${loan.borrower?.name || 'Kak'}, salam literasi dari Perpusjal Blora! Mengingatkan peminjaman buku "${loan.book.title}" (Tenggat: ${dueDateStr}). Selamat membaca!`;
                          const waHref = cleanPhone
                            ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`
                            : `https://wa.me/?text=${encodeURIComponent(waText)}`;

                          return (
                            <div key={loan.id} className="p-3 bg-surface border border-border-hairline space-y-2.5">
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <Link
                                    href={`/buku/${loan.book.slug}`}
                                    target="_blank"
                                    className="font-serif font-bold text-sm text-foreground hover:underline line-clamp-1"
                                  >
                                    {loan.book.title}
                                  </Link>
                                  <div className="font-mono text-[10px] text-muted flex items-center gap-1.5 flex-wrap">
                                    <span>{loan.book.author}</span>
                                    {loan.bookCopy && (
                                      <>
                                        <span>•</span>
                                        <span className="font-bold text-foreground">
                                          {loan.bookCopy.inventoryCode}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <span className={`shrink-0 px-2 py-0.5 text-[10px] font-mono border ${badgeClass}`}>
                                  {badgeText}
                                </span>
                              </div>

                              <div className="text-[11px] font-sans flex items-center justify-between text-muted border-t border-border-hairline pt-2">
                                <div>
                                  Peminjam: <strong className="text-foreground">{loan.borrower?.name}</strong>
                                </div>
                                <div className="font-mono text-[10px]">Tenggat: {dueDateStr}</div>
                              </div>

                              {/* Card Action Buttons (Thumb Accessible) */}
                              <div className="space-y-2 pt-1.5 border-t border-border-hairline">
                                <button
                                  type="button"
                                  onClick={() => handleBoardQuickReturn(loan.loanCode)}
                                  className="w-full h-10 border-2 border-foreground bg-surface text-foreground font-mono text-xs uppercase font-bold hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  <span>Catat Pengembalian Buku</span>
                                </button>

                                <div className="grid grid-cols-2 gap-2">
                                  {loan.status === LoanStatus.BORROWED && loan.extensionCount === 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => handleVolunteerExtend(loan.id, loan.book.title)}
                                      disabled={extendLoadingId === loan.id}
                                      className="h-10 border border-border-hairline bg-surface hover:border-foreground text-foreground font-mono text-xs uppercase font-bold transition-colors flex items-center justify-center gap-1.5"
                                      title="Perpanjang masa pinjam (+7 Hari) oleh relawan"
                                    >
                                      <RefreshCw className={cn('w-3.5 h-3.5', extendLoadingId === loan.id && 'animate-spin')} />
                                      <span>+7 Hari</span>
                                    </button>
                                  ) : (
                                    <div className="h-10 border border-border-hairline bg-surface-muted text-muted font-mono text-[10px] uppercase font-bold flex items-center justify-center text-center px-1">
                                      Perpanjangan Habis
                                    </div>
                                  )}

                                  <a
                                    href={waHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-10 border border-border-hairline bg-surface hover:border-foreground text-foreground font-mono text-xs uppercase font-bold transition-colors flex items-center justify-center gap-1.5"
                                    title={`Chat WhatsApp ${loan.borrower?.name || 'Peminjam'}`}
                                  >
                                    <MessageCircle className="w-4 h-4 text-foreground shrink-0" />
                                    <span>Chat WA</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* DESKTOP TABLE VIEW (hidden sm:block) */}
                      <div className="hidden sm:block overflow-x-auto border border-border-hairline bg-surface">
                        <table className="w-full text-left font-mono text-xs">
                          <thead>
                            <tr className="border-b border-border-hairline bg-surface-muted text-muted uppercase text-[10px] tracking-wider">
                              <th className="p-3">Buku & Eksemplar</th>
                              <th className="p-3">Peminjam</th>
                              <th className="p-3">Tgl Pinjam</th>
                              <th className="p-3">Tenggat Kembali</th>
                              <th className="p-3">Sisa Waktu</th>
                              <th className="p-3 text-right">Aksi Cepat</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-hairline font-sans">
                            {filteredActiveLoans.map((loan) => {
                              const now = new Date();
                              const dueDate = loan.dueDate ? new Date(loan.dueDate) : null;
                              const diffDays = dueDate
                                ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                : null;

                              let badgeClass = 'bg-surface-muted text-muted border-border-hairline';
                              let badgeText = `${diffDays} hari lagi`;

                              if (diffDays !== null) {
                                if (diffDays < 0) {
                                  badgeClass = 'bg-destructive/10 text-destructive border-destructive font-bold';
                                  badgeText = `Terlambat ${Math.abs(diffDays)} hari`;
                                } else if (diffDays === 0) {
                                  badgeClass = 'bg-amber-500/20 text-amber-600 border-amber-500 font-bold';
                                  badgeText = 'Hari ini!';
                                } else if (diffDays <= 3) {
                                  badgeClass = 'bg-amber-500/10 text-amber-600 border-amber-500/40';
                                  badgeText = `${diffDays} hari lagi`;
                                } else {
                                  badgeClass = 'bg-surface-muted text-foreground border-border-hairline';
                                  badgeText = `${diffDays} hari lagi`;
                                }
                              }

                              const cleanPhone = loan.borrower?.phoneNumber ? loan.borrower.phoneNumber.replace(/\D/g, '') : '';
                              const dueDateFormatted = dueDate
                                ? dueDate.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '-';
                              const waText = `Halo ${loan.borrower?.name || 'Kak'}, salam literasi dari Perpusjal Blora! Sekadar menyapa mengenai buku "${loan.book.title}" yang sedang Anda pinjam (Tenggat: ${dueDateFormatted}). Selamat membaca!`;
                              const waHref = cleanPhone
                                ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`
                                : `https://wa.me/?text=${encodeURIComponent(waText)}`;

                              return (
                                <tr key={loan.id} className="hover:bg-surface-muted/50 transition-colors">
                                  <td className="p-3">
                                    <div className="space-y-0.5">
                                      <Link
                                        href={`/buku/${loan.book.slug}`}
                                        target="_blank"
                                        className="font-serif font-bold text-xs text-foreground hover:underline line-clamp-1"
                                      >
                                        {loan.book.title}
                                      </Link>
                                      <div className="font-mono text-[10px] text-muted flex items-center gap-1.5">
                                        <span>{loan.book.author}</span>
                                        {loan.bookCopy && (
                                          <>
                                            <span>•</span>
                                            <span className="font-bold text-foreground">
                                              {loan.bookCopy.inventoryCode}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  <td className="p-3 font-sans text-xs">
                                    <div className="font-medium text-foreground">{loan.borrower?.name}</div>
                                    <div className="font-mono text-[10px] text-muted">@{loan.borrower?.username}</div>
                                  </td>

                                  <td className="p-3 font-mono text-xs text-muted">
                                    {loan.borrowedAt
                                      ? new Date(loan.borrowedAt).toLocaleDateString('id-ID', {
                                          day: 'numeric',
                                          month: 'short',
                                        })
                                      : '-'}
                                  </td>

                                  <td className="p-3 font-mono text-xs text-foreground font-medium">
                                    {dueDateFormatted}
                                  </td>

                                  <td className="p-3">
                                    <span className={`inline-block px-2 py-0.5 text-[10px] font-mono border ${badgeClass}`}>
                                      {badgeText}
                                    </span>
                                  </td>

                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => handleBoardQuickReturn(loan.loanCode)}
                                        className="px-2.5 py-1.5 border border-border-hairline text-foreground hover:border-foreground font-mono text-[10px] uppercase font-bold tracking-wider transition-colors inline-flex items-center gap-1 bg-surface"
                                        title="Catat pengembalian buku"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Kembali</span>
                                      </button>

                                      {loan.status === LoanStatus.BORROWED && loan.extensionCount === 0 && (
                                        <button
                                          type="button"
                                          onClick={() => handleVolunteerExtend(loan.id, loan.book.title)}
                                          disabled={extendLoadingId === loan.id}
                                          className="px-2.5 py-1.5 border border-border-hairline text-foreground hover:border-foreground font-mono text-[10px] uppercase font-bold tracking-wider transition-colors inline-flex items-center gap-1 bg-surface"
                                          title="Perpanjang masa pinjam (+7 Hari) oleh relawan"
                                        >
                                          <RefreshCw className={cn('w-3 h-3', extendLoadingId === loan.id && 'animate-spin')} />
                                          <span>+7 Hari</span>
                                        </button>
                                      )}

                                      {loan.borrower?.name && (
                                        <a
                                          href={waHref}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-2.5 py-1.5 border border-border-hairline text-foreground hover:bg-foreground hover:text-background font-mono text-[10px] uppercase font-bold tracking-wider transition-colors inline-flex items-center gap-1"
                                          title={`Chat WhatsApp ${loan.borrower.name}`}
                                        >
                                          <MessageCircle className="w-3 h-3" />
                                          <span>Chat WA</span>
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 4-COLUMN KANBAN BOARD (REFINED 2-TIER ACTIONS & MOBILE FRIENDLY) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Column 1: Siap Diambil */}
                <div className="border-2 border-foreground bg-surface p-4 space-y-4">
                  <div className="border-b border-border-hairline pb-2 flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-foreground" />
                      Siap Diambil ({boardData.readyForPickup.length})
                    </span>
                    <span className="text-[10px] text-muted">APPROVED</span>
                  </div>

                  {boardData.readyForPickup.length === 0 ? (
                    <p className="text-xs text-muted italic font-mono py-6 text-center">Tidak ada antrean ambil.</p>
                  ) : (
                    <div className="space-y-3">
                      {boardData.readyForPickup.map((item) => {
                        const cleanPhone = item.borrowerPhone ? item.borrowerPhone.replace(/\D/g, '') : '';
                        const waText = `Halo Kak ${item.borrowerName}, buku "${item.bookTitle}" yang diajukan sudah siap diambil di Meja Lapak Perpusjal Blora (Kode Ambil: ${item.pickupCode}). Ditunggu kedatangannya ya!`;
                        const waHref = cleanPhone
                          ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`
                          : `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

                        return (
                          <div
                            key={item.id}
                            className="p-3 bg-surface-muted border border-border-hairline text-xs font-mono space-y-2.5 hover:border-foreground transition-colors"
                          >
                            <div className="flex justify-between font-bold items-center gap-2">
                              <span className="text-foreground truncate">{item.borrowerName}</span>
                              <span className="text-sm tracking-wider bg-surface px-1.5 py-0.5 border border-border-hairline font-bold shrink-0">
                                {item.pickupCode}
                              </span>
                            </div>
                            <p className="font-sans text-xs text-muted line-clamp-1">{item.bookTitle}</p>
                            {item.borrowerPhone && (
                              <p className="text-[10px] text-muted font-mono">{item.borrowerPhone}</p>
                            )}

                              {/* 2-Tier Action Layout */}
                            <div className="space-y-1.5 pt-1">
                              {/* Tier 1: Primary Action Button */}
                              <button
                                type="button"
                                onClick={() => handleBoardQuickPickup(item.pickupCode || '')}
                                className="w-full h-9 bg-foreground text-background font-mono text-[11px] uppercase font-bold tracking-wider hover:bg-foreground/90 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <span>Serahkan Buku</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              {/* Tier 2: WhatsApp Notification Button */}
                              <a
                                href={waHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-9 border border-border-hairline bg-surface hover:border-foreground text-foreground transition-colors flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase font-bold"
                                title="Kirim pesan WhatsApp buku siap diambil"
                              >
                                <MessageCircle className="w-4 h-4 text-foreground shrink-0" />
                                <span>Chat WA Siap Ambil</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 2: Jatuh Tempo Besok (H-1) */}
                <div className="border border-border-hairline bg-surface p-4 space-y-4">
                  <div className="border-b border-border-hairline pb-2 flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-foreground" />
                      Jatuh Tempo Besok ({boardData.dueTomorrow?.length || 0})
                    </span>
                    <span className="text-[10px] font-bold text-foreground">H-1</span>
                  </div>

                  {!boardData.dueTomorrow || boardData.dueTomorrow.length === 0 ? (
                    <p className="text-xs text-muted italic font-mono py-6 text-center">Nihil jatuh tempo besok.</p>
                  ) : (
                    <div className="space-y-3">
                      {boardData.dueTomorrow.map((item) => {
                        const cleanPhone = item.borrowerPhone ? item.borrowerPhone.replace(/\D/g, '') : '';
                        const dueDateFormatted = item.dueDate
                          ? new Date(item.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                          : 'besok';
                        const waText = `Halo Kak ${item.borrowerName}, salam hangat dari relawan Perpusjal Blora! Sekadar mengingatkan bahwa peminjaman buku "${item.bookTitle}" akan jatuh tempo besok (${dueDateFormatted}). Jika ingin memperpanjang masa pinjam (+7 hari), Kakak bisa konfirmasi ke relawan lapak ya. Terima kasih!`;
                        const waHref = cleanPhone
                          ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`
                          : `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

                        return (
                          <div
                            key={item.id}
                            className="p-3 bg-surface-muted border border-border-hairline text-xs font-mono space-y-2.5 hover:border-foreground transition-colors"
                          >
                            <div className="flex justify-between font-bold items-center gap-2">
                              <span className="text-foreground truncate">{item.borrowerName}</span>
                              <span className="text-[10px] text-muted shrink-0">{item.loanCode}</span>
                            </div>
                            <p className="font-sans text-xs text-muted line-clamp-1">{item.bookTitle}</p>
                            {item.borrowerPhone && (
                              <p className="text-[10px] text-muted font-mono">{item.borrowerPhone}</p>
                            )}

                            {/* 2-Tier Action Layout */}
                            <div className="space-y-1.5 pt-1">
                              {/* Tier 1: Primary Action Button */}
                              <button
                                type="button"
                                onClick={() => handleBoardQuickReturn(item.loanCode)}
                                className="w-full h-9 border-2 border-foreground bg-surface text-foreground font-mono text-[11px] uppercase font-bold hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-1.5"
                              >
                                <span>Terima Kembali</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              {/* Tier 2: 50/50 Split for Volunteer Extend + WhatsApp */}
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleVolunteerExtend(item.id, item.bookTitle)}
                                  disabled={extendLoadingId === item.id}
                                  className="h-9 border border-border-hairline bg-surface hover:border-foreground text-foreground font-mono text-[10px] uppercase font-bold transition-colors flex items-center justify-center gap-1"
                                  title="Perpanjang masa pinjam (+7 Hari) oleh relawan"
                                >
                                  <RefreshCw className={cn('w-3 h-3', extendLoadingId === item.id && 'animate-spin')} />
                                  <span>+7 Hari</span>
                                </button>

                                <a
                                  href={waHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-9 border border-border-hairline bg-surface hover:border-foreground text-foreground transition-colors flex items-center justify-center gap-1 font-mono text-[10px] uppercase font-bold"
                                  title="Kirim pengingat WhatsApp H-1"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-foreground shrink-0" />
                                  <span>Chat WA</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 3: Jatuh Tempo Hari Ini */}
                <div className="border border-border-hairline bg-surface p-4 space-y-4">
                  <div className="border-b border-border-hairline pb-2 flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-foreground" />
                      Jatuh Tempo Hari Ini ({boardData.dueToday.length})
                    </span>
                    <span className="text-[10px] text-muted">BORROWED</span>
                  </div>

                  {boardData.dueToday.length === 0 ? (
                    <p className="text-xs text-muted italic font-mono py-6 text-center">Nihil hari ini.</p>
                  ) : (
                    <div className="space-y-3">
                      {boardData.dueToday.map((item) => {
                        const cleanPhone = item.borrowerPhone ? item.borrowerPhone.replace(/\D/g, '') : '';
                        const waText = `Halo Kak ${item.borrowerName}, kami dari relawan Perpusjal Blora mengingatkan bahwa peminjaman buku "${item.bookTitle}" jatuh tempo hari ini. Mohon dikembalikan ke lapak terdekat ya Kak. Terima kasih!`;
                        const waHref = cleanPhone
                          ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`
                          : `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

                        return (
                          <div
                            key={item.id}
                            className="p-3 bg-surface-muted border border-border-hairline text-xs font-mono space-y-2.5 hover:border-foreground transition-colors"
                          >
                            <div className="flex justify-between font-bold items-center gap-2">
                              <span className="text-foreground truncate">{item.borrowerName}</span>
                              <span className="text-[10px] text-muted shrink-0">{item.loanCode}</span>
                            </div>
                            <p className="font-sans text-xs text-muted line-clamp-1">{item.bookTitle}</p>
                            {item.borrowerPhone && (
                              <p className="text-[10px] text-muted font-mono">{item.borrowerPhone}</p>
                            )}

                            {/* 2-Tier Action Layout */}
                            <div className="space-y-1.5 pt-1">
                              {/* Tier 1: Primary Action Button */}
                              <button
                                type="button"
                                onClick={() => handleBoardQuickReturn(item.loanCode)}
                                className="w-full h-9 border-2 border-foreground bg-surface text-foreground font-mono text-[11px] uppercase font-bold hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-1.5"
                              >
                                <span>Terima Kembali</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              {/* Tier 2: 50/50 Split for Volunteer Extend + WhatsApp */}
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleVolunteerExtend(item.id, item.bookTitle)}
                                  disabled={extendLoadingId === item.id}
                                  className="h-9 border border-border-hairline bg-surface hover:border-foreground text-foreground font-mono text-[10px] uppercase font-bold transition-colors flex items-center justify-center gap-1"
                                  title="Perpanjang masa pinjam (+7 Hari) oleh relawan"
                                >
                                  <RefreshCw className={cn('w-3 h-3', extendLoadingId === item.id && 'animate-spin')} />
                                  <span>+7 Hari</span>
                                </button>

                                <a
                                  href={waHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-9 border border-border-hairline bg-surface hover:border-foreground text-foreground transition-colors flex items-center justify-center gap-1 font-mono text-[10px] uppercase font-bold"
                                  title="Kirim pengingat WhatsApp jatuh tempo hari ini"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-foreground shrink-0" />
                                  <span>Chat WA</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 4: Terlambat / Overdue */}
                <div className="border-2 border-destructive/60 bg-surface p-4 space-y-4">
                  <div className="border-b border-destructive/30 pb-2 flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                      Terlambat / Overdue ({boardData.overdue.length})
                    </span>
                    <span className="text-[10px] text-destructive font-bold">PERINGATAN</span>
                  </div>

                  {boardData.overdue.length === 0 ? (
                    <p className="text-xs text-muted italic font-mono py-6 text-center">Tidak ada pinjaman terlambat.</p>
                  ) : (
                    <div className="space-y-3">
                      {boardData.overdue.map((item) => {
                        const cleanPhone = item.borrowerPhone ? item.borrowerPhone.replace(/\D/g, '') : '';
                        const waText = `Halo Kak ${item.borrowerName}, kami dari relawan Perpusjal Blora. Buku "${item.bookTitle}" yang Kakak pinjam telah melewati jatuh tempo pengembalian. Mohon segera dikembalikan ke lapak demi kenyamanan pembaca lain ya Kak. Terima kasih!`;
                        const waHref = cleanPhone
                          ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`
                          : `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

                        return (
                          <div
                            key={item.id}
                            className="p-3 bg-surface-muted border border-destructive/40 text-xs font-mono space-y-2.5"
                          >
                            <div className="flex justify-between font-bold text-destructive items-center gap-2">
                              <span className="truncate">{item.borrowerName}</span>
                              <span className="text-[10px] shrink-0">{item.loanCode}</span>
                            </div>
                            <p className="font-sans text-xs text-muted line-clamp-1">{item.bookTitle}</p>
                            {item.borrowerPhone && (
                              <p className="text-[10px] text-destructive font-mono">{item.borrowerPhone}</p>
                            )}

                            {/* 2-Tier Action Layout */}
                            <div className="space-y-1.5 pt-1">
                              {/* Tier 1: Primary Action Button */}
                              <button
                                type="button"
                                onClick={() => handleBoardQuickReturn(item.loanCode)}
                                className="w-full h-9 border-2 border-destructive bg-destructive/10 text-destructive font-mono text-[11px] uppercase font-bold hover:bg-destructive hover:text-white transition-colors flex items-center justify-center gap-1.5"
                              >
                                <span>Terima Pengembalian</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              {/* Tier 2: WhatsApp Reminder */}
                              <a
                                href={waHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-9 border border-destructive bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase font-bold"
                                title="Kirim teguran WhatsApp keterlambatan"
                              >
                                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Tegur Lewat WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Session Activity Log (Riwayat Transaksi Sesi Lapak Ini) */}
      {sessionLogs.length > 0 && (
        <div className="border-2 border-foreground bg-surface p-4 sm:p-5 space-y-3 sm:space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2">
            <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-foreground shrink-0" />
              <span>Riwayat Transaksi Sesi Ini ({sessionLogs.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setSessionLogs([])}
              className="text-[10px] text-muted hover:text-foreground uppercase underline"
            >
              Bersihkan
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
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
                  <span className="text-muted font-mono">{log.time}</span>
                </div>
                <p className="font-sans font-bold text-foreground text-xs line-clamp-1">{log.title}</p>
                <div className="flex justify-between text-[11px] text-muted pt-0.5 font-sans">
                  <span className="truncate">
                    Peminjam: <strong className="text-foreground">{log.borrower}</strong>
                  </span>
                  {log.condition && (
                    <span className="uppercase font-bold text-foreground shrink-0 ml-1 font-mono text-[10px]">
                      ({log.condition})
                    </span>
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
          scannerContext === 'walkInMember'
            ? 'Scan QR Kartu Anggota (Walk-in)'
            : scannerContext === 'walkInBook'
            ? 'Scan Stiker Punggung Buku (Walk-in)'
            : scannerContext === 'pickupCopy'
            ? 'Scan Stiker Punggung Eksemplar Buku'
            : scannerContext === 'pickup'
            ? 'Scan QR Kartu Anggota / Kode Ambil'
            : scannerContext === 'return'
            ? 'Scan Stiker Buku / Kode Pinjam'
            : 'Pindai Kode Stiker / QR Member / Kode Pinjam'
        }
        instruction={
          scannerContext === 'walkInMember'
            ? 'Arahkan kamera ponsel ke QR Kartu Anggota digital pembaca.'
            : scannerContext === 'walkInBook'
            ? 'Arahkan kamera ponsel ke stiker di punggung buku yang ingin dipinjamkan langsung.'
            : scannerContext === 'pickupCopy'
            ? 'Arahkan kamera ponsel ke stiker di punggung buku fisik yang akan diserahkan.'
            : scannerContext === 'pickup'
            ? 'Arahkan kamera ponsel ke QR Kartu Anggota digital pembaca atau kode ambil 6-digit.'
            : scannerContext === 'return'
            ? 'Arahkan kamera ponsel ke stiker punggung buku yang sedang dikembalikan oleh pembaca.'
            : 'Arahkan kamera ke barcode stiker buku, kartu anggota, atau kode pinjaman.'
        }
      />

      {/* MODAL PINJAM LANGSUNG (WALK-IN LOAN) */}
      {walkInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-surface border-t-2 sm:border-2 border-foreground max-w-lg w-full p-5 sm:p-6 space-y-4 font-mono text-xs max-h-[92dvh] sm:max-h-[90dvh] overflow-y-auto rounded-none">
            <div className="flex items-center justify-between border-b border-border-hairline pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-foreground fill-foreground shrink-0" />
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Pinjam Langsung di Lapak (Walk-in)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWalkInModalOpen(false);
                  setWalkInError(null);
                }}
                className="text-muted hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-sans text-xs text-muted leading-relaxed">
              Layanan peminjaman instan di tempat tanpa reservasi daring. Buku langsung diserahkan dengan tenggat 14 hari ke depan.
            </p>

            {walkInSuccess && (
              <div className="p-3 bg-surface-muted border border-foreground font-mono text-xs text-foreground flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-foreground mt-0.5" />
                <span>{walkInSuccess}</span>
              </div>
            )}

            {walkInError && (
              <div className="p-3 bg-surface-muted border border-destructive font-mono text-xs text-destructive flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
                <span>{walkInError}</span>
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              {/* Member input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground">
                  IDENTITAS MEMBER / PEMINJAM (WAJIB):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={walkInMemberInput}
                    onChange={(e) => setWalkInMemberInput(e.target.value)}
                    placeholder="Username, Email, No. HP, atau ID Member..."
                    className="flex-1 h-11 sm:h-10 px-3 bg-surface-muted border border-border-hairline font-mono text-sm sm:text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScannerContext('walkInMember');
                      setScannerOpen(true);
                    }}
                    className="h-11 sm:h-10 px-3 border border-border-hairline bg-surface hover:border-foreground text-foreground flex items-center justify-center gap-1 font-mono text-xs uppercase font-bold shrink-0"
                    title="Scan QR Kartu Anggota Digital"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="hidden sm:inline">Scan QR</span>
                  </button>
                </div>
                <span className="text-[10px] text-muted block font-sans">
                  Ketik username (tanpa @), no. WhatsApp terdaftar, atau scan QR kartu anggota.
                </span>
              </div>

              {/* Book input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground">
                  STIKER EKSEMPLAR BUKU (WAJIB):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={walkInBookInput}
                    onChange={(e) => setWalkInBookInput(e.target.value)}
                    placeholder="Contoh: PJ-2026-0001, judul buku, atau slug..."
                    className="flex-1 h-11 sm:h-10 px-3 bg-surface-muted border border-border-hairline font-mono text-sm sm:text-xs text-foreground focus:outline-none focus:border-foreground uppercase font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScannerContext('walkInBook');
                      setScannerOpen(true);
                    }}
                    className="h-11 sm:h-10 px-3 border border-border-hairline bg-surface hover:border-foreground text-foreground flex items-center justify-center gap-1 font-mono text-xs uppercase font-bold shrink-0"
                    title="Scan barcode/stiker di punggung buku"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="hidden sm:inline">Scan Stiker</span>
                  </button>
                </div>
                <span className="text-[10px] text-muted block font-sans">
                  Arahkan scanner ke stiker punggung buku atau ketik kode inventaris PJ-2026-xxxx.
                </span>
              </div>

              {/* Pickup point */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground">
                  TITIK LAPAK / LOKASI:
                </label>
                <input
                  type="text"
                  value={walkInPickupPoint}
                  onChange={(e) => setWalkInPickupPoint(e.target.value)}
                  placeholder="Lapak Perpusjal Blora"
                  className="w-full h-11 sm:h-10 px-3 bg-surface-muted border border-border-hairline font-mono text-sm sm:text-xs text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground">
                  CATATAN (OPSIONAL):
                </label>
                <input
                  type="text"
                  value={walkInNote}
                  onChange={(e) => setWalkInNote(e.target.value)}
                  placeholder="Catatan relawan..."
                  className="w-full h-11 sm:h-10 px-3 bg-surface-muted border border-border-hairline font-mono text-sm sm:text-xs text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWalkInModalOpen(false);
                    setWalkInError(null);
                  }}
                  disabled={walkInLoading}
                  className="h-11 sm:h-10 px-4 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider font-bold transition-colors flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={walkInLoading || !walkInMemberInput.trim() || !walkInBookInput.trim()}
                  className="h-11 sm:h-10 px-4 bg-foreground text-background uppercase tracking-wider font-bold hover:bg-foreground/90 transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
                >
                  {walkInLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Terbitkan Pinjaman</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SERAH-TERIMA BUKU (PICKUP) */}
      {pickupLoan && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-surface border-t-2 sm:border-2 border-foreground max-w-lg w-full p-5 sm:p-6 space-y-4 font-mono text-xs max-h-[92dvh] sm:max-h-[90dvh] overflow-y-auto rounded-none">
            <div className="flex items-center justify-between border-b border-border-hairline pb-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-foreground shrink-0" />
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Serah-Terima Buku ke Pembaca
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPickupLoan(null);
                  setPickupError(null);
                }}
                className="text-muted hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pickupSuccess && (
              <div className="p-3 bg-surface-muted border border-foreground font-mono text-xs text-foreground flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-foreground mt-0.5" />
                <span>{pickupSuccess}</span>
              </div>
            )}

            {pickupError && (
              <div className="p-3 bg-surface-muted border border-destructive font-mono text-xs text-destructive flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
                <span>{pickupError}</span>
              </div>
            )}

            <div className="p-3 bg-surface-muted border border-border-hairline space-y-2">
              <div className="flex justify-between items-center text-muted">
                <span>KODE PINJAM: <strong className="text-foreground">{pickupLoan.loanCode}</strong></span>
                {pickupLoan.pickupCode && (
                  <span className="px-2 py-0.5 bg-foreground text-background font-bold text-[10px]">
                    KODE AMBIL: {pickupLoan.pickupCode}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-foreground font-sans">{pickupLoan.book.title}</h4>
                <p className="font-sans text-xs text-muted">Penulis: {pickupLoan.book.author}</p>
              </div>
              <div className="pt-1 text-[11px] text-muted space-y-0.5 border-t border-border-hairline font-sans">
                <div>Peminjam: <strong className="text-foreground">{pickupLoan.borrower?.name}</strong> (@{pickupLoan.borrower?.username})</div>
                <div>Titik Ambil: <span className="text-foreground">{pickupLoan.pickupPoint}</span></div>
                {pickupLoan.userNote && (
                  <div className="italic text-foreground">Catatan: &ldquo;{pickupLoan.userNote}&rdquo;</div>
                )}
              </div>
            </div>

            {/* Physical Copy Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] text-foreground uppercase font-bold flex items-center justify-between">
                <span>PILIH EKSEMPLAR FISIK:</span>
                <span className="text-[10px] text-muted font-normal">Cocokkan stiker buku</span>
              </label>
              {availableCopies.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={selectedCopyId}
                    onChange={(e) => setSelectedCopyId(e.target.value)}
                    className="flex-1 h-11 sm:h-10 px-2 bg-surface border-2 border-foreground rounded-none text-xs text-foreground focus:outline-none font-mono"
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
                    className="h-11 sm:h-10 px-3 border-2 border-foreground bg-surface hover:bg-surface-muted transition-colors inline-flex items-center justify-center gap-1 font-mono text-xs uppercase font-bold text-foreground shrink-0"
                    title="Scan stiker punggung buku yang diambil"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan</span>
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-muted italic font-sans">
                  Eksemplar fisik akan otomatis dialokasikan / dibuat oleh sistem.
                </p>
              )}
            </div>

            <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPickupLoan(null);
                  setPickupError(null);
                }}
                disabled={pickupLoading}
                className="h-11 sm:h-10 px-4 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider font-bold transition-colors flex items-center justify-center"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleExecutePickup}
                disabled={pickupLoading}
                className="h-11 sm:h-10 px-4 bg-foreground text-background uppercase tracking-wider font-bold hover:bg-foreground/90 transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
              >
                {pickupLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Serahkan Buku</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGEMBALIAN BUKU (RETURN) */}
      {returnLoan && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-surface border-t-2 sm:border-2 border-foreground max-w-lg w-full p-5 sm:p-6 space-y-4 font-mono text-xs max-h-[92dvh] sm:max-h-[90dvh] overflow-y-auto rounded-none">
            <div className="flex items-center justify-between border-b border-border-hairline pb-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-foreground shrink-0" />
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Penerimaan Pengembalian Buku
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReturnLoan(null);
                  setReturnError(null);
                  setRecommendedWaitlist(null);
                  setShowHilangConfirm(false);
                }}
                className="text-muted hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {returnSuccess && (
              <div className="p-3 bg-surface-muted border border-foreground font-mono text-xs text-foreground flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-foreground mt-0.5" />
                <span>{returnSuccess}</span>
              </div>
            )}

            {returnError && (
              <div className="p-3 bg-surface-muted border border-destructive font-mono text-xs text-destructive flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
                <span>{returnError}</span>
              </div>
            )}

            {/* Waitlist recommendation card */}
            {recommendedWaitlist && (
              <div className="p-3 bg-foreground text-background space-y-2">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
                  <Users className="w-4 h-4 text-background shrink-0" />
                  <span>Ada Pembaca Menunggu di Waitlist!</span>
                </div>
                <p className="font-sans text-xs opacity-90">
                  Buku ini telah dinanti oleh <strong>{recommendedWaitlist.user.name}</strong> (@{recommendedWaitlist.user.username}). Alokasikan segera agar buku dapat langsung dipinjamkan kembali.
                </p>
                <button
                  type="button"
                  onClick={() => handleAllocateWaitlist(recommendedWaitlist.id)}
                  disabled={allocateLoading}
                  className="w-full h-10 bg-background text-foreground font-mono text-xs uppercase font-bold tracking-wider hover:bg-surface-muted transition-colors flex items-center justify-center gap-1.5"
                >
                  {allocateLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  <span>Alokasikan ke Antrean Pembaca Ini</span>
                </button>
              </div>
            )}

            <div className="p-3 bg-surface-muted border border-border-hairline space-y-2">
              <div className="flex justify-between items-center text-muted">
                <span>KODE PINJAM: <strong className="text-foreground">{returnLoan.loanCode}</strong></span>
                <span
                  className={`px-2 py-0.5 font-bold text-[10px] ${
                    returnLoan.status === LoanStatus.OVERDUE
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-foreground text-background'
                  }`}
                >
                  {returnLoan.status === LoanStatus.OVERDUE ? 'TERLAMBAT' : returnLoan.status}
                </span>
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-foreground font-sans">{returnLoan.book.title}</h4>
                <p className="font-sans text-xs text-muted">Penulis: {returnLoan.book.author}</p>
              </div>
              <div className="pt-1 text-[11px] text-muted space-y-0.5 border-t border-border-hairline font-sans">
                <div>Peminjam: <strong className="text-foreground">{returnLoan.borrower?.name}</strong> (@{returnLoan.borrower?.username})</div>
                <div>Eksemplar: <strong className="text-foreground font-mono">{returnLoan.bookCopy?.inventoryCode || '-'}</strong></div>
                <div>
                  Tenggat: <span className="text-foreground">{returnLoan.dueDate ? new Date(returnLoan.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                </div>
              </div>
            </div>

            {/* Condition options */}
            <div className="space-y-1.5">
              <label className="block text-[11px] text-foreground uppercase font-bold">
                KONDISI FISIK BUKU SAAT KEMBALI:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: ReturnCondition.BAIK, label: 'BAIK', desc: 'Mulus & utuh' },
                  { value: ReturnCondition.RUSAK, label: 'RUSAK', desc: 'Coretan/basah' },
                  { value: ReturnCondition.HILANG, label: 'HILANG', desc: 'Tidak ketemu' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`p-2 sm:p-2.5 border-2 cursor-pointer transition-colors block text-center sm:text-left ${
                      returnCondition === opt.value
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border-hairline hover:border-foreground bg-surface text-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnCondition"
                      value={opt.value}
                      checked={returnCondition === opt.value}
                      onChange={() => {
                        setReturnCondition(opt.value);
                        if (opt.value === ReturnCondition.HILANG) {
                          setShowHilangConfirm(true);
                        } else {
                          setShowHilangConfirm(false);
                        }
                      }}
                      className="sr-only"
                    />
                    <div className="font-bold text-xs uppercase">{opt.label}</div>
                    <div className={`text-[10px] mt-0.5 line-clamp-1 ${returnCondition === opt.value ? 'opacity-80' : 'text-muted'}`}>
                      {opt.desc}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {showHilangConfirm && (
              <div className="p-3 bg-destructive/10 border-2 border-destructive font-mono text-xs text-destructive space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>KONFIRMASI BUKU HILANG</span>
                </div>
                <p className="font-sans text-foreground text-[11px]">
                  Tindakan ini permanen: eksemplar fisik akan ditandai HILANG dan jumlah stok berkurang.
                </p>
              </div>
            )}

            {/* Note input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] text-foreground uppercase font-bold">
                CATATAN RELAWAN (OPSIONAL):
              </label>
              <input
                type="text"
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                placeholder="Catatan kondisi buku saat diterima..."
                className="w-full h-11 sm:h-10 px-3 bg-surface-muted border border-border-hairline font-mono text-sm sm:text-xs text-foreground focus:outline-none focus:border-foreground"
              />
            </div>

            <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setReturnLoan(null);
                  setReturnError(null);
                  setRecommendedWaitlist(null);
                  setShowHilangConfirm(false);
                }}
                disabled={returnLoading}
                className="h-11 sm:h-10 px-4 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider font-bold transition-colors flex items-center justify-center"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleExecuteReturn}
                disabled={returnLoading}
                className={`h-11 sm:h-10 px-4 uppercase tracking-wider font-bold transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-1.5 ${
                  returnCondition === ReturnCondition.HILANG
                    ? 'bg-destructive text-white hover:bg-destructive/90'
                    : 'bg-foreground text-background hover:bg-foreground/90'
                }`}
              >
                {returnLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                <span>Buku Diterima</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENOLAKAN PENGAJUAN */}
      {rejectModalLoan && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface border-t-2 sm:border-2 border-foreground max-w-md w-full p-5 sm:p-6 space-y-4 font-mono text-xs max-h-[92dvh] overflow-y-auto rounded-none">
            <div className="flex items-center justify-between border-b border-border-hairline pb-2">
              <h3 className="font-serif text-lg font-bold text-foreground">Tolak Pengajuan Pinjaman</h3>
              <button
                type="button"
                onClick={() => {
                  setRejectModalLoan(null);
                  setRejectReason('');
                }}
                className="text-muted hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-sans text-xs text-muted leading-relaxed">
              Anda akan menolak pengajuan pinjaman buku <strong className="text-foreground">&ldquo;{rejectModalLoan.book.title}&rdquo;</strong> oleh <strong className="text-foreground">{rejectModalLoan.borrower?.name}</strong>. Stok ketersediaan buku di rak akan dipulihkan secara otomatis.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground">
                ALASAN PENOLAKAN (WAJIB):
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Misal: Buku fisik sedang dalam perbaikan, batas kuota tercapai, dll."
                className="w-full p-2.5 bg-surface-muted border border-border-hairline font-sans text-sm sm:text-xs text-foreground focus:outline-none focus:border-foreground resize-none"
              />
            </div>

            <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalLoan(null);
                  setRejectReason('');
                }}
                disabled={rejectLoading}
                className="h-11 sm:h-10 px-4 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider font-bold transition-colors flex items-center justify-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectLoading || !rejectReason.trim()}
                className="h-11 sm:h-10 px-4 bg-destructive text-white uppercase tracking-wider font-bold hover:bg-destructive/90 transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
              >
                {rejectLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Konfirmasi Tolak</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
