'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Feather,
  Award,
  CreditCard,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Shield,
  Layers,
  Sparkles,
  Compass,
  AlertTriangle,
  QrCode,
  MessageCircle,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { Role } from '@perpusjal/types';
import { PetaNavigasi } from '@/components/layout/peta-navigasi';
import { QuickQrModal } from '@/components/dashboard/quick-qr-modal';
import { getWhatsAppUrl } from '@/lib/contact';
import { cn } from '@/lib/utils';

export default function DashboardOverviewPage() {
  const [data, setData] = React.useState<any>(null);
  const [activeLoans, setActiveLoans] = React.useState<any[]>([]);
  const [articles, setArticles] = React.useState<any[]>([]);
  const [badgeProgress, setBadgeProgress] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadDashboard() {
      try {
        const [meRes, loansRes, articlesRes, badgesRes] = await Promise.all([
          apiClient<any>('/auth/me'),
          apiClient<any>('/loans/me?status=aktif'),
          apiClient<any>('/articles/me'),
          apiClient<any>('/badges/my-progress'),
        ]);

        const u = meRes.data?.user || (meRes.data?.id ? meRes.data : null);
        setData(u);

        if (loansRes.data?.data) {
          setActiveLoans(loansRes.data.data);
        } else if (Array.isArray(loansRes.data)) {
          setActiveLoans(loansRes.data);
        }

        if (articlesRes.data?.data) {
          setArticles(articlesRes.data.data);
        } else if (articlesRes.data?.items) {
          setArticles(articlesRes.data.items);
        } else if (Array.isArray(articlesRes.data)) {
          setArticles(articlesRes.data);
        }

        if (badgesRes.data) {
          setBadgeProgress(badgesRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Live Sunday CFD beacon indicator (WIB = UTC+7)
  const cfdStatus = React.useMemo(() => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMins = now.getUTCMinutes();
    const wibDay = (now.getUTCDay() + (utcHours + 7 >= 24 ? 1 : 0)) % 7;
    const wibHours = (utcHours + 7) % 24;
    const wibTotalMinutes = wibHours * 60 + utcMins;

    const isSunday = wibDay === 0;
    const isOpenNow = isSunday && wibTotalMinutes >= 360 && wibTotalMinutes <= 570; // 06.00 to 09.30
    const isOpeningSoon = isSunday && wibTotalMinutes >= 300 && wibTotalMinutes < 360; // 05.00 to 06.00

    return { isSunday, isOpenNow, isOpeningSoon };
  }, []);

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center min-h-[60vh]">
        <CustomLoader size="md" label="MEMUAT IKHTISAR PERSONAL..." />
      </div>
    );
  }

  const user = data;
  const nextBadge = badgeProgress?.badges?.find((b: any) => !b.earned);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* 1. WELCOME HERO & DIGITAL ID BAR */}
      <section className="border-2 border-foreground bg-surface p-4 sm:p-6 md:p-8 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-hairline">
          <div>
            <PetaNavigasi
              items={[
                { label: 'PERPUSJAL', href: '/' },
                { label: 'RUANG KENDALI WARGA', href: '/dashboard' },
                { label: 'IKHTISAR PERSONAL' },
              ]}
              className="mb-2"
            />
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Selamat Datang, {user?.name || 'Warga Blora'}
            </h1>
            <p className="font-serif text-xs sm:text-sm text-muted mt-1 leading-relaxed">
              @{user?.username} • Terdaftar sebagai{' '}
              <span className="text-foreground font-bold uppercase">{user?.role}</span> (Level {user?.trustLevel || 'TL1'})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Quick QR Peek Button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="min-h-[44px] px-4 py-2 border-2 border-foreground bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 transition-all active:scale-95 touch-tactile flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Anggota Cepat</span>
            </button>

            {/* Link to Full Member Card */}
            <Link
              href="/dashboard/kartu-anggota"
              className="min-h-[44px] px-4 py-2 border border-border-hairline hover:border-foreground bg-surface text-foreground font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4 text-muted" />
              <span>Kartu Lengkap</span>
            </Link>
          </div>
        </div>

        {/* Real-time Lapak Beacon Strip */}
        <div className="py-2.5 px-3 mt-4 border border-border-hairline bg-surface-muted/30 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                'w-2 h-2 shrink-0 animate-pulse',
                cfdStatus.isOpenNow ? 'bg-emerald-600' : 'bg-foreground'
              )}
            />
            <span className="font-bold uppercase tracking-wider truncate text-[11px]">
              {cfdStatus.isOpenNow
                ? 'LAPAK TERPAL ALUN-ALUN SEDANG BUKA SEKARANG (06.00–09.30 WIB)'
                : cfdStatus.isOpeningSoon
                ? 'LAPAK TERPAL CFD BUKA SEBENTAR LAGI PUKUL 06.00 WIB'
                : 'JADWAL LAPAK: CFD Alun-Alun Blora setiap Minggu Pagi (06.00–09.30 WIB)'}
            </span>
          </div>
          <Link
            href="/kegiatan"
            className="text-[10px] text-muted hover:text-foreground underline shrink-0 hidden sm:inline"
          >
            Lihat Agenda Lapak →
          </Link>
        </div>

        {/* 2. STATS 4-GRID (BENTO LAYOUT) */}
        <div className="pt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
          <div className="p-3.5 sm:p-4 border border-border-hairline bg-surface-muted/40 flex flex-col justify-between">
            <span className="text-[10px] text-muted uppercase tracking-wider block font-bold">
              Buku Dipinjam
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-black text-foreground mt-1 tabular-nums">
              {activeLoans.length}{' '}
              <span className="text-xs text-muted font-normal font-sans">
                / {user?.borrowing?.maxActive || 2} Kuota
              </span>
            </div>
            <span className="text-[10px] text-muted mt-2 block">
              Maksimal 2 buku amanah
            </span>
          </div>

          <div className="p-3.5 sm:p-4 border border-border-hairline bg-surface-muted/40 flex flex-col justify-between">
            <span className="text-[10px] text-muted uppercase tracking-wider block font-bold">
              Karya Tulisan
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-black text-foreground mt-1 tabular-nums">
              {articles.length}{' '}
              <span className="text-xs text-muted font-normal font-sans">Naskah</span>
            </div>
            <span className="text-[10px] text-muted mt-2 block">
              Esai &amp; resensi warga
            </span>
          </div>

          <div className="p-3.5 sm:p-4 border border-border-hairline bg-surface-muted/40 flex flex-col justify-between">
            <span className="text-[10px] text-muted uppercase tracking-wider block font-bold">
              Lencana Terbuka
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-black text-foreground mt-1 tabular-nums">
              {badgeProgress?.earnedCount || 0}{' '}
              <span className="text-xs text-muted font-normal font-sans">
                / {badgeProgress?.totalCount || badgeProgress?.badges?.length || 12}
              </span>
            </div>
            <span className="text-[10px] text-muted mt-2 block">
              Apresiasi 4 pilar rakyat
            </span>
          </div>

          <div className="p-3.5 sm:p-4 border border-border-hairline bg-surface-muted/40 flex flex-col justify-between">
            <span className="text-[10px] text-muted uppercase tracking-wider block font-bold">
              Hak Pinjam
            </span>
            {(() => {
              const isSuspended = Boolean(
                user?.borrowSuspendedUntil && new Date(user.borrowSuspendedUntil) > new Date()
              );
              const isEligible = user?.borrowing?.isEligible !== false && !isSuspended;

              return (
                <div>
                  <div className="text-xs sm:text-sm font-bold mt-1 flex items-center gap-1.5">
                    {isEligible ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                        <span className="truncate text-foreground font-mono">0 RUPIAH DENDA</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                        <span className="truncate text-destructive font-mono">
                          {isSuspended ? 'DITANGGUHKAN' : 'PERLU VERIFIKASI'}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-muted mt-2 block">
                    {isEligible ? 'Amanah warga terjaga' : 'Sapa relawan untuk konfirmasi'}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* 3. QUICK ACTIONS BAR */}
      <section>
        <div className="flex items-baseline justify-between border-b border-foreground pb-2 mb-4">
          <h2 className="font-serif text-base font-bold uppercase tracking-wider text-foreground">
            Aksi Cepat Warga
          </h2>
          <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
            Layanan Terbuka
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <Link
            href="/buku"
            className="p-4 border border-border-hairline bg-surface hover:border-foreground transition-all active:scale-95 touch-tactile flex flex-col justify-between min-h-[96px] group"
          >
            <BookOpen className="w-5 h-5 text-muted group-hover:text-foreground mb-3" />
            <div>
              <span className="font-bold text-foreground block">Pinjam Buku</span>
              <span className="text-[10px] text-muted">Jelajahi katalog lapak</span>
            </div>
          </Link>

          <Link
            href="/dashboard/tulisan/tulis"
            className="p-4 border border-border-hairline bg-surface hover:border-foreground transition-all active:scale-95 touch-tactile flex flex-col justify-between min-h-[96px] group"
          >
            <Feather className="w-5 h-5 text-muted group-hover:text-foreground mb-3" />
            <div>
              <span className="font-bold text-foreground block">Tulis Artikel</span>
              <span className="text-[10px] text-muted">Kirim esai/resensi</span>
            </div>
          </Link>

          <Link
            href="/cara-meminjam"
            className="p-4 border border-border-hairline bg-surface hover:border-foreground transition-all active:scale-95 touch-tactile flex flex-col justify-between min-h-[96px] group"
          >
            <Compass className="w-5 h-5 text-muted group-hover:text-foreground mb-3" />
            <div>
              <span className="font-bold text-foreground block">Cara Meminjam</span>
              <span className="text-[10px] text-muted">Pedoman tanpa kartu</span>
            </div>
          </Link>

          <Link
            href="/kegiatan"
            className="p-4 border border-border-hairline bg-surface hover:border-foreground transition-all active:scale-95 touch-tactile flex flex-col justify-between min-h-[96px] group"
          >
            <Calendar className="w-5 h-5 text-muted group-hover:text-foreground mb-3" />
            <div>
              <span className="font-bold text-foreground block">Agenda Lapak</span>
              <span className="text-[10px] text-muted">Jadwal CFD &amp; kemah</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. ACTIVE LOANS SECTION (SLIP SIRKULASI FISIK) */}
      <section>
        <div className="flex items-baseline justify-between border-b border-foreground pb-2 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-foreground" />
            <h2 className="font-serif text-base font-bold uppercase tracking-wider text-foreground">
              Peminjaman Berjalan ({activeLoans.length})
            </h2>
          </div>
          <Link
            href="/dashboard/pinjaman"
            className="font-mono text-xs text-foreground hover:underline inline-flex items-center gap-1"
          >
            Lihat Riwayat Penuh <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {activeLoans.length === 0 ? (
          <div className="border border-dashed border-border-hairline p-8 text-center bg-surface-muted/20">
            <p className="font-mono text-xs text-muted mb-3">
              Kamu sedang tidak memiliki pinjaman buku yang aktif berjalan.
            </p>
            <Link
              href="/buku"
              className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 border border-foreground bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 touch-tactile"
            >
              Cari Buku di Katalog Lapak
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => {
              // Calculate remaining days
              const dueDateObj = loan.dueDate ? new Date(loan.dueDate) : null;
              const diffDays = dueDateObj
                ? Math.ceil((dueDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div
                  key={loan.id}
                  className="border-2 border-foreground bg-surface p-5 flex flex-col justify-between font-mono relative overflow-hidden"
                >
                  {/* Perforated Slip Header */}
                  <div className="border-b border-dashed border-foreground/40 pb-3 mb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border border-foreground bg-foreground text-background">
                        {loan.status}
                      </span>
                      <span className="text-[11px] font-bold text-foreground">
                        KODE: {loan.loanCode}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-foreground line-clamp-2 mt-2">
                      {loan.book?.title}
                    </h3>
                    <p className="text-xs text-muted font-sans mt-0.5">
                      Penulis: {loan.book?.author}
                    </p>
                  </div>

                  {/* Pickup Code Box */}
                  {loan.pickupCode && (loan.status === 'APPROVED' || loan.status === 'PENDING') && (
                    <div className="p-3 bg-surface-muted border border-border-hairline text-center space-y-1 mb-3">
                      <span className="text-[9px] text-muted block uppercase font-bold tracking-wider">
                        KODE PENGAMBILAN DI LAPAK
                      </span>
                      <span className="font-mono text-2xl font-black tracking-widest text-foreground block">
                        {loan.pickupCode}
                      </span>
                      <span className="text-[10px] text-muted font-sans block">
                        Tunjukkan kode ini kepada relawan saat mengambil buku
                      </span>
                    </div>
                  )}

                  {/* Due Date & Remaining days counter */}
                  {dueDateObj && (
                    <div className="p-2.5 bg-surface-muted/40 border border-border-hairline text-xs space-y-1 mb-3">
                      <div className="flex items-center justify-between text-muted text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Jatuh Tempo:</span>
                        </span>
                        <strong className="text-foreground">
                          {dueDateObj.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </strong>
                      </div>
                      {diffDays !== null && (
                        <div className="text-[11px] font-bold pt-1 border-t border-border-hairline flex items-center justify-between">
                          <span>Status Siklus Baca:</span>
                          <span
                            className={cn(
                              diffDays < 0
                                ? 'text-destructive'
                                : diffDays <= 2
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-foreground'
                            )}
                          >
                            {diffDays < 0
                              ? `Terlambat ${Math.abs(diffDays)} Hari (Harap Sapa Relawan)`
                              : diffDays === 0
                              ? 'Hari Ini Jatuh Tempo'
                              : `Sisa ${diffDays} Hari Lagi`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Slip Action Buttons */}
                  <div className="pt-3 border-t border-border-hairline flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <a
                      href={getWhatsAppUrl(
                        `Halo Relawan Perpusjal Blora, mengenai pinjaman buku "${loan.book?.title}" (Kode: ${loan.loanCode})...`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-3 py-1.5 border border-border-hairline hover:border-foreground bg-surface text-foreground text-[11px] inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-foreground" />
                      <span>Sapa Relawan WA</span>
                    </a>

                    <Link
                      href="/dashboard/pinjaman"
                      className="min-h-[40px] px-3.5 py-1.5 bg-foreground text-background text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1 hover:opacity-90 transition-opacity text-center"
                    >
                      <span>Rincian &amp; Perpanjang</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. NEXT BADGE PROGRESS & RECENT WRITINGS (2-COLUMNS BENTO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Next Badge Progress */}
        <section className="border border-border-hairline bg-surface p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border-hairline pb-2 mb-4">
              <Award className="w-4 h-4 text-foreground" />
              <h2 className="font-serif text-base font-bold text-foreground uppercase tracking-wider">
                Progres Lencana Terdekat
              </h2>
            </div>

            {nextBadge ? (
              <div className="space-y-3 font-mono">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 border-2 border-foreground bg-surface-muted flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">
                      {nextBadge.badge.name}
                    </h3>
                    <p className="font-sans text-xs text-muted mt-0.5 leading-snug">
                      {nextBadge.badge.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs text-muted mb-1 font-mono">
                    <span>
                      Capaian: {nextBadge.currentValue} / {nextBadge.targetValue}
                    </span>
                    <span className="font-bold text-foreground">{nextBadge.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-muted border border-foreground overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, nextBadge.percent))}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="font-mono text-xs text-muted">
                Semua lencana apresiasi telah berhasil dibuka! Kontribusi luar biasa untuk literasi bersama.
              </p>
            )}
          </div>

          <Link
            href="/dashboard/badge"
            className="font-mono text-xs font-bold text-foreground hover:underline inline-flex items-center gap-1 mt-6 pt-3 border-t border-border-hairline"
          >
            Lihat Koleksi Seluruh Lencana <ArrowRight className="w-3 h-3" />
          </Link>
        </section>

        {/* Recent Writings */}
        <section className="border border-border-hairline bg-surface p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border-hairline pb-2 mb-4">
              <Feather className="w-4 h-4 text-foreground" />
              <h2 className="font-serif text-base font-bold text-foreground uppercase tracking-wider">
                Naskah Tulisan Terkini
              </h2>
            </div>

            {articles.length === 0 ? (
              <div className="text-center py-4">
                <p className="font-mono text-xs text-muted mb-3">
                  Belum ada naskah tulisan atau resensi yang kamu buat.
                </p>
                <Link
                  href="/dashboard/tulisan/tulis"
                  className="min-h-[44px] px-4 py-2 border border-foreground bg-foreground text-background font-mono text-xs font-bold uppercase inline-flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mulai Menulis Naskah</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border-hairline">
                {articles.slice(0, 3).map((art) => (
                  <div key={art.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href="/dashboard/tulisan"
                        className="font-serif text-sm font-bold text-foreground truncate block hover:underline"
                      >
                        {art.title}
                      </Link>
                      <span className="font-mono text-[10px] text-muted uppercase">
                        Status: <strong className="text-foreground">{art.status}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/dashboard/tulisan"
            className="font-mono text-xs font-bold text-foreground hover:underline inline-flex items-center gap-1 mt-6 pt-3 border-t border-border-hairline"
          >
            Buka Ruang Tulisan Saya <ArrowRight className="w-3 h-3" />
          </Link>
        </section>
      </div>

      {/* 6. ADMIN / CURATOR BANNER (IF APPLICABLE) */}
      {user && (user.role === Role.KURATOR || user.role === Role.ADMIN) && (
        <section className="border-2 border-foreground bg-surface p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-foreground">
              <Shield className="w-4 h-4" />
              <span>Akses Wewenang Pengurus Aktif</span>
            </div>
            <p className="font-serif text-xs sm:text-sm text-muted mt-1 leading-relaxed">
              Sebagai {user.role}, kamu memiliki hak akses langsung ke Meja Kurasi naskah dan Dasbor Sirkulasi Lapak.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
            <Link
              href="/dashboard/kurasi"
              className="min-h-[40px] px-3.5 py-2 border border-foreground bg-foreground text-background font-bold uppercase inline-flex items-center justify-center hover:opacity-90"
            >
              Meja Kurasi
            </Link>
            <Link
              href="/dashboard/sirkulasi"
              className="min-h-[40px] px-3.5 py-2 border border-border-hairline hover:border-foreground bg-surface text-foreground font-semibold uppercase inline-flex items-center justify-center transition-colors"
            >
              Mode Lapak
            </Link>
          </div>
        </section>
      )}

      {/* Quick QR Member Modal (Zero navigation required) */}
      <QuickQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        user={user}
      />
    </div>
  );
}
