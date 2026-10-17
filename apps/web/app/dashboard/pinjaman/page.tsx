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
} from 'lucide-react';

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
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border-hairline text-muted">
            MENUNGGU PERSETUJUAN
          </span>
        );
      case LoanStatus.APPROVED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-foreground text-background font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            SIAP DIAMBIL
          </span>
        );
      case LoanStatus.BORROWED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-foreground font-bold text-foreground inline-flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            SEDANG DIPINJAM
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
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border-hairline text-muted">
            SELESAI
          </span>
        );
      case LoanStatus.RETURNED_LOST:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-destructive text-destructive">
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
    <div className="p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-6xl">
      {/* Masthead */}
        <div className="border-b-2 border-foreground pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <PetaNavigasi
              items={[
                { label: 'PERPUSJAL', href: '/' },
                { label: 'DASBOR', href: '/dashboard' },
                { label: 'SIRKULASI', href: '/dashboard/pinjaman' },
                { label: 'STATUS PINJAMAN BUKU' },
              ]}
              className="mb-2"
            />
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Dasbor Peminjaman
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/dashboard/kartu-anggota"
              className="px-4 py-2 border border-foreground font-mono text-xs uppercase tracking-wider font-semibold hover:bg-foreground hover:text-background transition-colors inline-flex items-center justify-center gap-1.5 text-center"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Kartu Anggota</span>
            </Link>
            <Link
              href="/buku"
              className="px-4 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-1.5 text-center"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cari Buku Lain</span>
            </Link>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border-hairline font-mono text-xs uppercase tracking-wider pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('aktif')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'aktif'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            Pinjaman Aktif
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('riwayat')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'riwayat'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            Riwayat Selesai
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('antrean')}
            className={`px-4 py-2 border-b-2 transition-colors inline-flex items-center gap-1.5 ${
              activeTab === 'antrean'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Antrean Pembaca</span>
            {waitlists.length > 0 && (
              <span className="px-1.5 py-0.5 bg-foreground text-background text-[10px] font-bold">
                {waitlists.length}
              </span>
            )}
          </button>
        </div>

        {/* Action feedback notice */}
        {actionMessage && (
          <div className="p-3 bg-surface border border-foreground font-mono text-xs text-foreground flex items-center justify-between">
            <span>{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-muted hover:text-foreground"
            >
              &times;
            </button>
          </div>
        )}

        {/* Loan list */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <CustomLoader size="lg" label="MEMUAT DATA PEMINJAMAN..." />
          </div>
        ) : error ? (
          <div className="p-8 border border-foreground bg-surface-muted text-center space-y-3 font-mono text-xs">
            <p className="text-foreground">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider"
            >
              Coba Lagi
            </button>
          </div>
        ) : activeTab === 'antrean' ? (
          waitlists.length === 0 ? (
            <div className="py-16 text-center border border-border-hairline bg-surface p-8 space-y-3">
              <span className="font-mono text-xs text-muted uppercase tracking-widest">
                [ BELUM ADA ANTREAN ]
              </span>
              <h2 className="font-serif text-2xl font-normal text-foreground">
                Anda Belum Terdaftar di Antrean Buku Mana Pun
              </h2>
              <p className="font-sans text-xs text-muted max-w-md mx-auto">
                Jika buku bacaan yang Anda inginkan sedang dipinjam oleh pembaca lain, Anda dapat mendaftar antrean melalui halaman detail buku di katalog.
              </p>
              <div className="pt-2">
                <Link
                  href="/buku"
                  className="px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold inline-block hover:bg-foreground/90 transition-colors"
                >
                  Jelajahi Katalog Buku &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {waitlists.map((w) => (
                <div
                  key={w.id}
                  className="border-2 border-foreground bg-surface p-4 sm:p-6 space-y-4 sm:space-y-6"
                >
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-4 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-foreground text-background font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        ANTREAN POSISI #{w.position}
                      </span>
                      <span className="border border-border-hairline px-2 py-0.5 text-muted uppercase text-[10px]">
                        {w.status === 'NOTIFIED' ? 'SIAP DIALOKASIKAN' : 'MENUNGGU DIKEMBALIKAN'}
                      </span>
                    </div>
                    <span className="text-muted">
                      Terdaftar pada{' '}
                      {new Date(w.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Body grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-8 flex gap-4">
                      <div className="w-16 h-22 sm:w-20 sm:h-28 bg-surface-muted border border-border-hairline shrink-0 flex items-center justify-center p-2 text-center overflow-hidden">
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
                          className="font-serif font-bold text-lg sm:text-xl text-foreground hover:underline line-clamp-2"
                        >
                          {w.book.title}
                        </Link>
                        <p className="font-sans text-xs text-muted">Karya {w.book.author}</p>
                        <p className="font-mono text-[11px] text-muted pt-1">
                          Ketersediaan Lapak saat ini:{' '}
                          <strong className="text-foreground">{w.book.availableCopies} eksemplar</strong>
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-4 bg-surface-muted p-4 border border-border-hairline space-y-2 font-mono text-xs">
                      <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                        STATUS ALOKASI
                      </span>
                      <p className="font-sans text-xs text-muted leading-relaxed">
                        {w.status === 'NOTIFIED'
                          ? 'Buku telah tersedia! Kurator lapak sedang memproses alokasi pinjaman untuk Anda.'
                          : 'Buku sedang dibaca peminjam lain. Anda akan otomatis mendapat prioritas pertama saat buku kembali ke lapak.'}
                      </p>
                    </div>
                  </div>

                  {/* Footer action */}
                  <div className="pt-3 border-t border-border-hairline flex items-center justify-end font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => handleLeaveWaitlist(w.id)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 border border-border-hairline text-muted hover:text-foreground hover:border-foreground uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
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
          <div className="py-16 text-center border border-border-hairline bg-surface p-8 space-y-3">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">
              [ TIDAK ADA CATATAN ]
            </span>
            <h2 className="font-serif text-2xl font-normal text-foreground">
              {activeTab === 'aktif'
                ? 'Tidak Ada Pinjaman yang Sedang Berjalan'
                : 'Belum Ada Riwayat Peminjaman Buku'}
            </h2>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              Jelajahi koleksi pustaka kami dan ajukan peminjaman buku bacaan secara gratis.
            </p>
            <div className="pt-2">
              <Link
                href="/buku"
                className="px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold inline-block hover:bg-foreground/90 transition-colors"
              >
                Jelajahi Katalog Buku &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="border-2 border-foreground bg-surface p-4 sm:p-6 space-y-4 sm:space-y-6"
              >
                {/* Top header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-4 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground text-sm">{loan.loanCode}</span>
                    {getStatusBadge(loan.status)}
                  </div>
                  <span className="text-muted">
                    Diajukan pada{' '}
                    {new Date(loan.requestedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Main loan content grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Book summary */}
                  <div className="md:col-span-7 flex gap-4">
                    <div className="w-16 h-22 sm:w-20 sm:h-28 bg-surface-muted border border-border-hairline shrink-0 flex items-center justify-center p-2 text-center overflow-hidden">
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

                    <div className="space-y-1">
                      <Link
                        href={`/buku/${loan.book.slug}`}
                        className="font-serif font-bold text-lg sm:text-xl text-foreground hover:underline line-clamp-2"
                      >
                        {loan.book.title}
                      </Link>
                      <p className="font-sans text-xs text-muted">Karya {loan.book.author}</p>
                      {loan.bookCopy && (
                        <p className="font-mono text-[11px] text-muted pt-1">
                          Eksemplar Fisik: <strong>{loan.bookCopy.inventoryCode}</strong>
                        </p>
                      )}
                      <div className="pt-2 font-mono text-xs text-muted flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Titik Ambil: {loan.pickupPoint}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pickup Code or Dates */}
                  <div className="md:col-span-5 bg-surface-muted p-4 border border-border-hairline space-y-3 font-mono text-xs">
                    {loan.status === LoanStatus.APPROVED && loan.pickupCode && (
                      <div className="text-center space-y-1 p-3 bg-surface border-2 border-foreground">
                        <span className="text-[10px] uppercase text-muted tracking-widest block">
                          KODE AMBIL DI LAPAK
                        </span>
                        <div className="font-mono text-3xl font-extrabold tracking-widest text-foreground py-1">
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

                    {loan.dueDate && (
                      <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                        <span className="text-muted uppercase">Tenggat Pengembalian:</span>
                        <span
                          className={`font-bold ${
                            loan.status === LoanStatus.OVERDUE ? 'text-destructive' : 'text-foreground'
                          }`}
                        >
                          {new Date(loan.dueDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}

                    <div className="text-[11px] font-sans text-muted">
                      <strong>Petunjuk:</strong> {loan.nextAction}
                    </div>
                  </div>
                </div>

                {/* Footer action buttons & volunteer info */}
                {(loan.canCancel || loan.status === LoanStatus.BORROWED || loan.status === LoanStatus.RETURNED) && (
                  <div className="pt-3 border-t border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                    {loan.status === LoanStatus.BORROWED ? (
                      <div className="text-[11px] text-muted font-sans italic bg-surface-muted p-2 border border-border-hairline">
                        * Perpanjangan masa pinjam (+7 hari) dilakukan oleh relawan di lapak atau hubungi relawan via WhatsApp.
                      </div>
                    ) : (
                      <div />
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto sm:self-end shrink-0">
                      {loan.status === LoanStatus.RETURNED && (
                        <Link
                          href={`/buku/${loan.book.slug}#resensi`}
                          className="px-3 py-1.5 border border-border-hairline text-foreground hover:bg-muted-bg transition-colors inline-flex items-center justify-center gap-1.5 uppercase font-medium tracking-wider text-center"
                        >
                          <Star className="w-3.5 h-3.5 fill-foreground/20 text-foreground" />
                          Tulis Resensi
                        </Link>
                      )}

                      {loan.canCancel && (
                        <button
                          type="button"
                          onClick={() => handleCancel(loan.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1 text-center"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Batalkan Pengajuan
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
