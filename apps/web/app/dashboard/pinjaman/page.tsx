'use client';

import * as React from 'react';
import Link from 'next/link';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { LoanItem, LoanStatus, WaitlistItem } from '@perpusjal/types';
import { PetaNavigasi } from '@/components/layout/peta-navigasi';
import { toast } from '@/components/ui/toast';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  XCircle,
  CreditCard,
  MapPin,
  ExternalLink,
  Users,
  Star,
  MessageCircle,
} from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/contact';
import { cn } from '@/lib/utils';

export default function MemberLoansDashboardPage() {
  const [activeTab, setActiveTab] = React.useState<'aktif' | 'riwayat' | 'antrean'>('aktif');
  const [loans, setLoans] = React.useState<LoanItem[]>([]);
  const [waitlists, setWaitlists] = React.useState<WaitlistItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    if (activeTab === 'antrean') {
      const res = await apiClient<{ data: WaitlistItem[] }>('/waitlist/me');
      setLoading(false);
      if (res.error) {
        setError(res.error.message);
        return;
      }
      setWaitlists(res.data?.data || []);
    } else {
      const res = await apiClient<{ data: LoanItem[] }>(`/loans/me?status=${activeTab}`);
      setLoading(false);
      if (res.error) {
        setError(res.error.message);
        return;
      }
      setLoans(res.data?.data || []);
    }
  }, [activeTab]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLeaveWaitlist = async (waitlistId: string) => {
    if (!window.confirm('Batalkan dan keluar dari daftar antrean buku ini?')) return;

    setActionLoading(true);
    setActionMessage(null);

    const res = await apiClient<{ message: string }>(`/waitlist/${waitlistId}`, {
      method: 'DELETE',
    });

    setActionLoading(false);

    if (res.error) {
      toast.error(res.error.message);
      return;
    }

    setActionMessage(res.data?.message || 'Berhasil keluar dari antrean.');
    fetchData();
  };

  const handleCancel = async (loanId: string) => {
    if (!window.confirm('Batalkan pengajuan peminjaman ini?')) return;

    setActionLoading(true);
    setActionMessage(null);

    const res = await apiClient<{ message: string }>(`/loans/${loanId}/cancel`, {
      method: 'POST',
    });

    setActionLoading(false);

    if (res.error) {
      toast.error(res.error.message);
      return;
    }

    setActionMessage(res.data?.message || 'Pengajuan berhasil dibatalkan.');
    fetchData();
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.PENDING:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-foreground/40 bg-surface text-foreground font-bold">
            MENUNGGU PERSETUJUAN
          </span>
        );
      case LoanStatus.APPROVED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-foreground text-background font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            SIAP DIAMBIL DI LAPAK
          </span>
        );
      case LoanStatus.BORROWED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border-2 border-foreground font-bold text-foreground inline-flex items-center gap-1 bg-surface">
            <BookOpen className="w-3 h-3" />
            SEDANG DIBACA
          </span>
        );
      case LoanStatus.OVERDUE:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-destructive text-destructive-foreground font-bold inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            TERLAMBAT
          </span>
        );
      case LoanStatus.RETURNED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border-hairline bg-surface-muted text-muted font-bold">
            SELESAI DIPULANGKAN
          </span>
        );
      case LoanStatus.RETURNED_LOST:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-destructive text-destructive font-bold">
            TERCATAT HILANG
          </span>
        );
      case LoanStatus.CANCELLED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border-hairline text-muted">
            DIBATALKAN
          </span>
        );
      case LoanStatus.REJECTED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border-hairline text-muted">
            DITOLAK
          </span>
        );
      case LoanStatus.EXPIRED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border-hairline text-muted">
            KEDALUWARSA
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border-hairline text-muted">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* 1. MASTHEAD BANNER */}
      <div className="border-b-2 border-foreground pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <PetaNavigasi
            items={[
              { label: 'PERPUSJAL', href: '/' },
              { label: 'RUANG KENDALI', href: '/dashboard' },
              { label: 'PINJAMAN BUKU' },
            ]}
            className="mb-2"
          />
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Buku Catatan Peminjaman
          </h1>
          <p className="font-serif text-xs sm:text-sm text-muted">
            Pantau status peminjaman aktif, kode pengambilan lapak, dan antrean tunggu buku incaranmu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/dashboard/kartu-anggota"
            className="min-h-[44px] px-4 py-2 border border-border-hairline hover:border-foreground bg-surface font-mono text-xs uppercase tracking-wider font-semibold transition-all active:scale-95 touch-tactile inline-flex items-center justify-center gap-1.5 text-center"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Kartu Anggota</span>
          </Link>
          <Link
            href="/buku"
            className="min-h-[44px] px-4 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 transition-all active:scale-95 touch-tactile inline-flex items-center justify-center gap-1.5 text-center"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cari Buku di Katalog</span>
          </Link>
        </div>
      </div>

      {/* 2. SEGMENTED CONTROL TABS (MOBILE-FRIENDLY & TOUCH TACTILE) */}
      <div className="grid grid-cols-3 gap-2 border-2 border-foreground bg-surface p-1 font-mono text-xs uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('aktif')}
          className={cn(
            'min-h-[44px] px-3 py-2 text-center transition-all active:scale-95 touch-tactile flex items-center justify-center gap-1.5 rounded-none font-bold',
            activeTab === 'aktif'
              ? 'bg-foreground text-background'
              : 'text-muted hover:text-foreground'
          )}
        >
          <span>Pinjaman Aktif</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('riwayat')}
          className={cn(
            'min-h-[44px] px-3 py-2 text-center transition-all active:scale-95 touch-tactile flex items-center justify-center gap-1.5 rounded-none font-bold',
            activeTab === 'riwayat'
              ? 'bg-foreground text-background'
              : 'text-muted hover:text-foreground'
          )}
        >
          <span>Riwayat Selesai</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('antrean')}
          className={cn(
            'min-h-[44px] px-3 py-2 text-center transition-all active:scale-95 touch-tactile flex items-center justify-center gap-1.5 rounded-none font-bold',
            activeTab === 'antrean'
              ? 'bg-foreground text-background'
              : 'text-muted hover:text-foreground'
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Antrean Pembaca</span>
          <span className="sm:hidden">Antrean</span>
          {waitlists.length > 0 && (
            <span
              className={cn(
                'px-1.5 py-0.2 text-[10px] font-bold font-mono ml-0.5',
                activeTab === 'antrean'
                  ? 'bg-background text-foreground'
                  : 'bg-foreground text-background'
              )}
            >
              {waitlists.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. ACTION FEEDBACK NOTICE */}
      {actionMessage && (
        <div className="p-3.5 bg-surface border-2 border-foreground font-mono text-xs text-foreground flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="p-1 hover:bg-surface-muted text-muted hover:text-foreground transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      {/* 4. CONTENT AREA */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <CustomLoader size="lg" label="MEMUAT CATATAN PINJAMAN..." />
        </div>
      ) : error ? (
        <div className="p-8 border-2 border-foreground bg-surface-muted text-center space-y-3 font-mono text-xs">
          <p className="text-foreground">{error}</p>
          <button
            onClick={fetchData}
            className="min-h-[44px] px-5 py-2 bg-foreground text-background font-bold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 touch-tactile"
          >
            Coba Lagi
          </button>
        </div>
      ) : activeTab === 'antrean' ? (
        waitlists.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-border-hairline bg-surface p-6 sm:p-10 space-y-3">
            <span className="font-mono text-xs text-muted uppercase tracking-widest block font-bold">
              [ TIDAK ADA ANTREAN ]
            </span>
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Kamu Belum Terdaftar di Antrean Buku Mana Pun
            </h2>
            <p className="font-sans text-xs text-muted max-w-md mx-auto leading-relaxed">
              Jika buku incaranmu sedang dipinjam oleh kawan pembaca lain, kamu bisa mendaftar antrean secara gratis melalui halaman katalog buku.
            </p>
            <div className="pt-2">
              <Link
                href="/buku"
                className="min-h-[44px] px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-all active:scale-95 touch-tactile"
              >
                <span>Jelajahi Katalog Buku</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {waitlists.map((w) => (
              <div
                key={w.id}
                className="border-2 border-foreground bg-surface p-4 sm:p-6 space-y-4 relative overflow-hidden"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-hairline pb-3 font-mono text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 bg-foreground text-background font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      ANTREAN #{w.position}
                    </span>
                    <span className="border border-border-hairline bg-surface-muted px-2 py-0.5 text-muted uppercase text-[10px] font-bold">
                      {w.status === 'NOTIFIED' ? 'SIAP DIALOKASIKAN' : 'MENUNGGU DIKEMBALIKAN'}
                    </span>
                  </div>
                  <span className="text-muted text-[11px]">
                    Terdaftar: {new Date(w.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Body Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  <div className="md:col-span-8 flex gap-3.5 sm:gap-4">
                    <div className="w-16 h-22 sm:w-20 sm:h-28 bg-surface-muted border border-border-hairline shrink-0 flex items-center justify-center p-1.5 text-center overflow-hidden">
                      {w.book.coverImage ? (
                        <img
                          src={w.book.coverImage}
                          alt={w.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-6 h-6 text-muted" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Link
                        href={`/buku/${w.book.slug}`}
                        className="font-serif font-bold text-base sm:text-xl text-foreground hover:underline line-clamp-2"
                      >
                        {w.book.title}
                      </Link>
                      <p className="font-sans text-xs text-muted">Karya {w.book.author}</p>
                      <p className="font-mono text-[11px] text-muted pt-1">
                        Ketersediaan koleksi saat ini:{' '}
                        <strong className="text-foreground">{w.book.availableCopies} eksemplar</strong>
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-4 bg-surface-muted/60 p-3.5 border border-border-hairline space-y-1 font-mono text-xs">
                    <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                      STATUS ALOKASI SISTEM
                    </span>
                    <p className="font-sans text-[11px] text-foreground/80 leading-relaxed">
                      {w.status === 'NOTIFIED'
                        ? 'Buku telah kembali ke lapak! Relawan sedang menyiapkan buku ini untuk kamu ambil.'
                        : 'Buku sedang dibaca peminjam lain. Sistem otomatis mengabari kamu saat buku dipulangkan.'}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-dashed border-border-hairline flex items-center justify-end font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => handleLeaveWaitlist(w.id)}
                    disabled={actionLoading}
                    className="min-h-[44px] px-4 py-2 border border-border-hairline text-muted hover:text-foreground hover:border-foreground uppercase tracking-wider transition-all active:scale-95 touch-tactile inline-flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Keluar dari Antrean</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : loans.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-border-hairline bg-surface p-6 sm:p-10 space-y-3">
          <span className="font-mono text-xs text-muted uppercase tracking-widest block font-bold">
            [ TIDAK ADA CATATAN ]
          </span>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            {activeTab === 'aktif'
              ? 'Tidak Ada Peminjaman Buku yang Berjalan'
              : 'Belum Ada Riwayat Peminjaman Buku'}
          </h2>
          <p className="font-sans text-xs text-muted max-w-md mx-auto leading-relaxed">
            Jelajahi koleksi pustaka Perpusjal Blora dan ajukan peminjaman buku bacaan secara gratis tanpa jaminan uang.
          </p>
          <div className="pt-2">
            <Link
              href="/buku"
              className="min-h-[44px] px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-all active:scale-95 touch-tactile"
            >
              <span>Jelajahi Katalog Buku</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {loans.map((loan) => {
            const dueDateObj = loan.dueDate ? new Date(loan.dueDate) : null;
            const diffDays = dueDateObj
              ? Math.ceil((dueDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={loan.id}
                className="border-2 border-foreground bg-surface p-4 sm:p-6 space-y-4 relative overflow-hidden"
              >
                {/* Top Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-hairline pb-3 font-mono text-xs">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-foreground text-sm font-mono tracking-wider">
                      {loan.loanCode}
                    </span>
                    {getStatusBadge(loan.status)}
                  </div>
                  <span className="text-muted text-[11px]">
                    Diajukan pada{' '}
                    {new Date(loan.requestedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Main Loan Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Book Summary */}
                  <div className="md:col-span-7 flex gap-3.5 sm:gap-4">
                    <div className="w-16 h-22 sm:w-20 sm:h-28 bg-surface-muted border border-border-hairline shrink-0 flex items-center justify-center p-1.5 text-center overflow-hidden">
                      {loan.book.coverImage ? (
                        <img
                          src={loan.book.coverImage}
                          alt={loan.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-6 h-6 text-muted" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <Link
                        href={`/buku/${loan.book.slug}`}
                        className="font-serif font-bold text-base sm:text-xl text-foreground hover:underline line-clamp-2"
                      >
                        {loan.book.title}
                      </Link>
                      <p className="font-sans text-xs text-muted">Karya {loan.book.author}</p>
                      {loan.bookCopy && (
                        <p className="font-mono text-[11px] text-muted pt-0.5">
                          Eksemplar Fisik: <strong className="text-foreground">{loan.bookCopy.inventoryCode}</strong>
                        </p>
                      )}
                      <div className="pt-1.5 font-mono text-[11px] text-muted flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Titik Ambil: {loan.pickupPoint}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Details Box */}
                  <div className="md:col-span-5 bg-surface-muted/60 p-3.5 border border-border-hairline space-y-2.5 font-mono text-xs">
                    {/* Pickup Code for APPROVED */}
                    {loan.status === LoanStatus.APPROVED && loan.pickupCode && (
                      <div className="text-center space-y-1 p-2.5 bg-surface border-2 border-foreground">
                        <span className="text-[9px] uppercase text-muted tracking-widest block font-bold">
                          KODE AMBIL DI LAPAK
                        </span>
                        <div className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-foreground py-0.5">
                          {loan.pickupCode}
                        </div>
                        <span className="text-[10px] text-muted block">
                          Tunjukkan ke relawan sebelum{' '}
                          {loan.pickupDeadline
                            ? new Date(loan.pickupDeadline).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })
                            : '-'}
                        </span>
                      </div>
                    )}

                    {/* Due Date Indicator */}
                    {dueDateObj && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between border-b border-border-hairline pb-1.5 text-[11px]">
                          <span className="text-muted uppercase">Tenggat Pengembalian:</span>
                          <span
                            className={cn(
                              'font-bold',
                              loan.status === LoanStatus.OVERDUE ? 'text-destructive' : 'text-foreground'
                            )}
                          >
                            {dueDateObj.toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {diffDays !== null && (
                          <div className="flex items-center justify-between text-[10px] text-muted">
                            <span>Sisa Waktu:</span>
                            <span
                              className={cn(
                                'font-bold font-mono',
                                diffDays < 0
                                  ? 'text-destructive'
                                  : diffDays <= 2
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-foreground'
                              )}
                            >
                              {diffDays < 0
                                ? `Terlambat ${Math.abs(diffDays)} hari`
                                : diffDays === 0
                                ? 'Hari ini jatuh tempo'
                                : `${diffDays} hari lagi`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-[11px] font-sans text-muted leading-relaxed">
                      <strong>Petunjuk:</strong> {loan.nextAction}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                {(loan.canCancel || loan.status === LoanStatus.BORROWED || loan.status === LoanStatus.RETURNED) && (
                  <div className="pt-3 border-t border-dashed border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                    {loan.status === LoanStatus.BORROWED ? (
                      <div className="text-[11px] text-muted font-sans italic bg-surface-muted p-2 border border-border-hairline">
                        * Perpanjangan masa pinjam (+7 hari) dilakukan oleh relawan di lapak atau hubungi relawan via WhatsApp.
                      </div>
                    ) : (
                      <div />
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto sm:self-end shrink-0">
                      {loan.status === LoanStatus.BORROWED && (
                        <a
                          href={getWhatsAppUrl(
                            `Halo Relawan Perpusjal Blora, mengenai pinjaman buku "${loan.book?.title}" (Kode: ${loan.loanCode}), saya ingin menanyakan perpanjangan...`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] px-3.5 py-2 border border-border-hairline hover:border-foreground bg-surface text-foreground font-mono text-xs uppercase tracking-wider font-semibold inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 touch-tactile text-center"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-foreground" />
                          <span>Hubungi Relawan WA</span>
                        </a>
                      )}

                      {loan.status === LoanStatus.RETURNED && (
                        <Link
                          href={`/buku/${loan.book.slug}#resensi`}
                          className="min-h-[44px] px-4 py-2 border border-foreground bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-all active:scale-95 touch-tactile text-center"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Tulis Resensi Buku</span>
                        </Link>
                      )}

                      {loan.canCancel && (
                        <button
                          type="button"
                          onClick={() => handleCancel(loan.id)}
                          disabled={actionLoading}
                          className="min-h-[44px] px-4 py-2 border border-destructive/50 text-destructive hover:border-destructive hover:bg-destructive/5 uppercase tracking-wider transition-all active:scale-95 touch-tactile inline-flex items-center justify-center gap-1 text-center"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Batalkan Pengajuan</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
