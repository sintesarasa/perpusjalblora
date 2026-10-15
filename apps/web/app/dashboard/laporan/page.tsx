'use client';

import * as React from 'react';
import Link from 'next/link';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient, getApiUrl } from '@/lib/api';
import { Role } from '@perpusjal/types';
import { PetaNavigasi } from '@/components/layout/peta-navigasi';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Download,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Sparkles,
  RefreshCw,
  Printer,
  Calendar,
  Users,
  Feather,
  Mail,
  FileText,
  Check,
  ChevronDown,
  Bookmark,
  Award,
  HeartHandshake,
} from 'lucide-react';

type ReportTab = 'SIRKULASI' | 'LITERASI' | 'KOMUNITAS';
type PeriodFilter = '30d' | 'month' | 'year' | 'all';

interface ReportData {
  period: string;
  metrics: {
    totalLoans: number;
    monthLoans: number;
    periodLoans: number;
    activeLoans: number;
    returnedLoans: number;
    overdueLoans: number;
    returnedLostLoans: number;
    totalCopies: number;
    availableCopies: number;
    totalBorrows: number;
    onTimeRate: number;
  };
  topBooks: Array<{
    id: string;
    title: string;
    author: string;
    slug: string;
    borrowCount: number;
    totalCopies: number;
    availableCopies: number;
  }>;
  conditionStats: Array<{
    condition: string;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    borrowed: number;
    returned: number;
  }>;
  literacy: {
    totalArticles: number;
    publishedArticles: number;
    pendingArticles: number;
    revisionArticles: number;
    rejectedArticles: number;
    periodArticles: number;
    topCategories: Array<{
      id: string;
      name: string;
      slug: string;
      articleCount: number;
      bookCount: number;
    }>;
    topAuthors: Array<{
      id: string;
      name: string;
      username: string;
      publishedCount: number;
    }>;
  };
  community: {
    totalMembers: number;
    newMembersThisMonth: number;
    periodMembers: number;
    totalEvents: number;
    totalRegistrations: number;
    totalLetters: number;
    resolvedLetters: number;
    donatedBooksCount: number;
  };
}

export default function DashboardReportsPage() {
  const [currentUser, setCurrentUser] = React.useState<{ id: string; role: Role } | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [data, setData] = React.useState<ReportData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [downloading, setDownloading] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState<ReportTab>('SIRKULASI');
  const [period, setPeriod] = React.useState<PeriodFilter>('30d');
  const [exportMenuOpen, setExportMenuOpen] = React.useState(false);

  // Check role
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

  const loadReport = React.useCallback(async (p: PeriodFilter = period) => {
    setLoading(true);
    setError(null);
    const res = await apiClient<{ data: ReportData }>(`/loans/reports/overview?period=${p}`);
    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data?.data) {
      setData(res.data.data);
    }
  }, [period]);

  React.useEffect(() => {
    if (currentUser && (currentUser.role === Role.KURATOR || currentUser.role === Role.ADMIN)) {
      loadReport(period);
    }
  }, [currentUser, period, loadReport]);

  const handleExportCsv = async (endpoint: string, defaultFilename: string) => {
    setDownloading(true);
    setExportMenuOpen(false);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}${endpoint}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error('Gagal mengunduh berkas laporan.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${defaultFilename}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err?.message || 'Gagal mengunduh berkas CSV.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="p-16 flex items-center justify-center">
        <CustomLoader size="md" label="MEMERIKSA HAK AKSES LAPORAN..." />
      </div>
    );
  }

  // Restrict to KURATOR and ADMIN
  if (!currentUser || (currentUser.role !== Role.KURATOR && currentUser.role !== Role.ADMIN)) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-4 font-mono text-xs">
        <div className="p-6 border-2 border-destructive bg-surface text-destructive space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Akses Khusus Kurator & Pengurus</span>
          </div>
          <p className="font-sans text-xs text-foreground">
            Laporan dan analitik sirkulasi hanya dapat diakses oleh akun dengan peran <strong>KURATOR</strong> atau <strong>ADMIN</strong> demi akuntabilitas perpustakaan komunitas.
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

  // Calculate highest count for SVG trend chart scaling
  const maxMonthlyCount = data?.monthlyTrend
    ? Math.max(...data.monthlyTrend.flatMap((t) => [t.borrowed, t.returned, 1]))
    : 1;

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* ──────────────────────────────────────────────────────────
          PRINT-ONLY OFFICIAL LETTERHEAD & SUMMARY
          ────────────────────────────────────────────────────────── */}
      <div className="hidden print:block space-y-6 pb-6 border-b-2 border-black font-sans text-black">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div>
            <h1 className="text-2xl font-black font-serif tracking-tight uppercase">
              PERPUSTAKAAN JALANAN BLORA
            </h1>
            <p className="font-mono text-xs tracking-wider uppercase text-gray-700">
              Kolektif Literasi Independen Rakyat Blora & Lapak Baca Terbuka
            </p>
          </div>
          <div className="text-right font-mono text-[10px]">
            <p>DOKUMEN AKUNTABILITAS PUBLIK</p>
            <p>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">Periode: {period.toUpperCase()}</p>
          </div>
        </div>

        <div className="text-center py-2">
          <h2 className="text-lg font-bold font-serif uppercase tracking-wider underline">
            LEMBAR LAPORAN PERTANGGUNGJAWABAN & STATISTIK KOLEKTIF
          </h2>
        </div>

        {data && (
          <div className="grid grid-cols-3 gap-4 font-mono text-xs border border-black p-4">
            <div>
              <p className="font-bold border-b border-black pb-1">I. SIRKULASI BUKU</p>
              <p>Total Sirkulasi: {data.metrics.totalLoans}</p>
              <p>Buku Aktif Dipinjam: {data.metrics.activeLoans}</p>
              <p>Kepatuhan Tenggat: {data.metrics.onTimeRate}%</p>
              <p>Total Eksemplar Fisik: {data.metrics.totalCopies}</p>
            </div>
            <div>
              <p className="font-bold border-b border-black pb-1">II. WARTA & LITERASI</p>
              <p>Naskah Diterbitkan: {data.literacy.publishedArticles}</p>
              <p>Antrean Kurasi: {data.literacy.pendingArticles}</p>
              <p>Naskah Perlu Revisi: {data.literacy.revisionArticles}</p>
              <p>Total Wacana Masuk: {data.literacy.totalArticles}</p>
            </div>
            <div>
              <p className="font-bold border-b border-black pb-1">III. KOMUNITAS</p>
              <p>Anggota Terdaftar: {data.community.totalMembers}</p>
              <p>Donasi Buku Masuk: {data.community.donatedBooksCount} eks</p>
              <p>Kegiatan Terlaksana: {data.community.totalEvents}</p>
              <p>Surat Warga Terjawab: {data.community.resolvedLetters}</p>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────
          SCREEN HEADER / MASTHEAD
          ────────────────────────────────────────────────────────── */}
      <div className="print:hidden border-b-2 border-foreground pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <PetaNavigasi
            items={[
              { label: 'PERPUSJAL', href: '/' },
              { label: 'DASBOR', href: '/dashboard' },
              { label: 'KURATOR & RELAWAN', href: '/dashboard/laporan' },
              { label: 'LAPORAN & STATISTIK' },
            ]}
            className="mb-1"
          />
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Laporan & Analitik Kolektif
          </h1>
          <p className="font-mono text-xs text-muted">
            Transparansi sirkulasi buku, denyut literasi warga, dan akuntabilitas komunitas Blora.
          </p>
        </div>

        {/* Global Toolbar: Refresh, Period & Export */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs shrink-0">
          <button
            type="button"
            onClick={() => loadReport(period)}
            disabled={loading}
            className="px-2.5 sm:px-3 py-2 border border-foreground bg-surface hover:bg-surface-muted transition-colors inline-flex items-center gap-1.5 cursor-pointer text-muted hover:text-foreground"
            title="Segarkan data laporan"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 sm:px-3 py-2 border border-foreground bg-surface hover:bg-surface-muted transition-colors inline-flex items-center gap-1.5 cursor-pointer text-muted hover:text-foreground"
            title="Cetak Lembar Laporan Akuntabilitas"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak PDF</span>
          </button>

          {/* Export Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              disabled={downloading}
              className="px-3.5 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:bg-foreground/90 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Mengunduh...' : 'Ekspor CSV'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 border-2 border-foreground bg-background shadow-lg z-30 font-mono text-xs py-1 animate-in fade-in-50 duration-150">
                <button
                  type="button"
                  onClick={() => handleExportCsv('/loans/reports/export', 'laporan-sirkulasi-perpusjal')}
                  className="w-full text-left px-3 py-2 hover:bg-surface-muted text-foreground flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-muted" />
                  <span>Sirkulasi Pinjaman (.CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCsv('/loans/reports/export-inventory', 'inventaris-buku-perpusjal')}
                  className="w-full text-left px-3 py-2 hover:bg-surface-muted text-foreground flex items-center gap-2 cursor-pointer border-t border-border-hairline"
                >
                  <Layers className="w-3.5 h-3.5 text-muted" />
                  <span>Inventaris Buku Rak (.CSV)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          CONTROLS: MULTI-PILLAR TABS & TIMEFRAME SELECTOR
          ────────────────────────────────────────────────────────── */}
      <div className="print:hidden space-y-4">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b-2 border-foreground overflow-x-auto scrollbar-none font-mono text-xs uppercase tracking-wider select-none">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { key: 'SIRKULASI' as ReportTab, label: 'Sirkulasi & Buku', icon: BookOpen, short: 'Sirkulasi' },
              { key: 'LITERASI' as ReportTab, label: 'Literasi & Naskah', icon: Feather, short: 'Literasi' },
              { key: 'KOMUNITAS' as ReportTab, label: 'Komunitas & Warga', icon: Users, short: 'Komunitas' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCurrentTab(tab.key)}
                  className={cn(
                    'px-3 sm:px-4 py-2.5 transition-colors flex items-center gap-1.5 sm:gap-2 border-t-2 border-x-2 -mb-[2px] whitespace-nowrap shrink-0 rounded-none cursor-pointer',
                    isActive
                      ? 'border-foreground bg-surface text-foreground font-bold shadow-xs'
                      : 'border-transparent text-muted hover:text-foreground hover:bg-surface-muted/50'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden inline">{tab.short}</span>
                </button>
              );
            })}
          </div>

          {/* Timeframe Filter Pills */}
          <div className="flex items-center gap-1 pb-1 font-mono text-[11px] shrink-0">
            <span className="text-muted mr-1 hidden md:inline text-[10px] tracking-wider">RENTANG:</span>
            {[
              { key: '30d' as PeriodFilter, label: '30 Hari' },
              { key: 'month' as PeriodFilter, label: 'Bulan Ini' },
              { key: 'year' as PeriodFilter, label: 'Tahun Ini' },
              { key: 'all' as PeriodFilter, label: 'Semua' },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={cn(
                  'px-2 sm:px-2.5 py-1 border transition-colors cursor-pointer text-[10px] sm:text-[11px] font-semibold',
                  period === p.key
                    ? 'border-foreground bg-foreground text-background font-bold'
                    : 'border-border bg-surface text-muted hover:text-foreground hover:border-foreground/50'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          MAIN REPORT CONTENT BODY
          ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <CustomLoader size="lg" label="MENGAGREGASI DATA LAPORAN MULTI-PILAR..." />
        </div>
      ) : error ? (
        <div className="p-8 border-2 border-destructive bg-surface text-center space-y-3 font-mono text-xs">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-foreground font-semibold">{error}</p>
          <button
            onClick={() => loadReport(period)}
            className="px-4 py-2 bg-foreground text-background font-bold uppercase tracking-wider cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* ──────────────────────────────────────────────────────
              TAB 1: SIRKULASI & KOLEKSI BUKU
              ────────────────────────────────────────────────────── */}
          {currentTab === 'SIRKULASI' && (
            <div className="space-y-8 animate-in fade-in-50 duration-200">
              {/* 1. Key Metrics Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 font-mono">
                {/* Total Sirkulasi */}
                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    SIRKULASI KUMULATIF
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                    {data.metrics.totalLoans}
                  </div>
                  <span className="text-[11px] text-muted block pt-1">
                    {data.metrics.periodLoans} pada periode ini
                  </span>
                </div>

                {/* Kepatuhan Tenggat Waktu */}
                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    KEPATUHAN TEPAT WAKTU
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground flex items-baseline gap-1">
                    <span>{data.metrics.onTimeRate}%</span>
                  </div>
                  <span className="text-[11px] text-muted block pt-1">
                    {data.metrics.returnedLoans} dikembalikan ke lapak
                  </span>
                </div>

                {/* Pinjaman Berjalan */}
                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    SEDANG DIBACA WARGA
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                    {data.metrics.activeLoans}
                  </div>
                  <span className={cn('text-[11px] block pt-1 font-semibold', data.metrics.overdueLoans > 0 ? 'text-destructive font-bold' : 'text-muted')}>
                    {data.metrics.overdueLoans} melewati batas tempo
                  </span>
                </div>

                {/* Total Eksemplar Fisik */}
                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    TOTAL KOLEKSI RAK
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                    {data.metrics.totalCopies}
                  </div>
                  <span className="text-[11px] text-muted block pt-1">
                    {data.metrics.availableCopies} siap dipinjam warga
                  </span>
                </div>
              </div>

              {/* 2. Visual Trend Chart & Physical Health */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* 6-Month Circulation Trend Chart (SVG) */}
                <div className="md:col-span-7 p-5 sm:p-6 border-2 border-foreground bg-surface space-y-4">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-2 font-mono text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-muted" />
                      TREN SIRKULASI 6 BULAN TERAKHIR
                    </span>
                    <span className="text-muted text-[10px] hidden sm:inline">GRAFIK AKTIVITAS LAPAK</span>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* SVG Bar Chart */}
                    <div className="w-full h-44 flex items-end gap-2 sm:gap-4 justify-between border-b border-foreground pb-2 px-1">
                      {data.monthlyTrend.map((m) => {
                        const borrowedHeight = Math.max(8, Math.round((m.borrowed / maxMonthlyCount) * 110));
                        const returnedHeight = Math.max(8, Math.round((m.returned / maxMonthlyCount) * 110));

                        return (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                            <div className="flex items-end justify-center gap-1 w-full h-[120px]">
                              {/* Borrowed Bar */}
                              <div
                                style={{ height: `${borrowedHeight}px` }}
                                className="w-3 sm:w-4 bg-foreground relative transition-all duration-300 hover:opacity-80"
                                title={`Dipinjam: ${m.borrowed}`}
                              >
                                {m.borrowed > 0 && (
                                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    {m.borrowed}
                                  </span>
                                )}
                              </div>
                              {/* Returned Bar */}
                              <div
                                style={{ height: `${returnedHeight}px` }}
                                className="w-3 sm:w-4 bg-muted/50 border border-foreground relative transition-all duration-300 hover:bg-muted"
                                title={`Dikembalikan: ${m.returned}`}
                              >
                                {m.returned > 0 && (
                                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    {m.returned}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-mono text-[10px] text-muted text-center tracking-tight truncate w-full">
                              {m.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chart Legend */}
                    <div className="flex items-center justify-between font-mono text-[11px] text-muted pt-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 bg-foreground inline-block" />
                          <span>Buku Dipinjam</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 bg-muted/50 border border-foreground inline-block" />
                          <span>Buku Kembali</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-muted hidden sm:inline">Pembaruan otomatis tiap hari</span>
                    </div>
                  </div>
                </div>

                {/* Physical Health Breakdown */}
                <div className="md:col-span-5 p-5 sm:p-6 border-2 border-foreground bg-surface space-y-4">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-2 font-mono text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-muted" />
                      KESEHATAN FISIK BUKU
                    </span>
                    <span className="text-muted text-[10px]">INVENTARIS</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {data.conditionStats.length === 0 ? (
                      <p className="text-muted italic py-6 text-center">Belum ada data kondisi fisik tercatat.</p>
                    ) : (
                      data.conditionStats.map((item) => {
                        const totalRecorded = data.conditionStats.reduce((sum, c) => sum + c.count, 0) || 1;
                        const pct = Math.round((item.count / totalRecorded) * 100);
                        return (
                          <div key={item.condition} className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-foreground uppercase">{item.condition}</span>
                              <span className="text-muted">
                                {item.count} eks ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-surface-muted border border-border-hairline overflow-hidden">
                              <div
                                className="h-full bg-foreground transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-3 border-t border-border-hairline font-mono text-[11px] text-muted flex items-center justify-between">
                    <span>Buku Hilang Tercatat:</span>
                    <strong className="text-destructive font-bold">{data.metrics.returnedLostLoans} judul</strong>
                  </div>
                </div>
              </div>

              {/* 3. Top 10 Most Read Books */}
              <div className="border-2 border-foreground bg-surface p-4 sm:p-6 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-foreground" />
                    <h2 className="font-serif font-bold text-base sm:text-lg text-foreground">
                      10 Buku Paling Banyak Dibaca Warga
                    </h2>
                  </div>
                  <span className="text-[10px] text-muted uppercase tracking-wider hidden sm:inline">
                    FREKUENSI SIRKULASI
                  </span>
                </div>

                {data.topBooks.length === 0 ? (
                  <p className="text-muted italic py-8 text-center">Belum ada data peminjaman yang tercatat.</p>
                ) : (
                  <>
                    {/* Desktop Table View (>=md) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead className="bg-surface-muted border-b border-border-hairline text-muted uppercase text-[10px]">
                          <tr>
                            <th className="p-3 font-bold w-12 text-center">#</th>
                            <th className="p-3 font-bold">Judul Buku</th>
                            <th className="p-3 font-bold">Pengarang / Penulis</th>
                            <th className="p-3 font-bold text-center">Total Terbaca</th>
                            <th className="p-3 font-bold text-center">Stok Rak</th>
                            <th className="p-3 font-bold text-right">Tautan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-hairline">
                          {data.topBooks.map((book, idx) => (
                            <tr key={book.id} className="hover:bg-surface-muted/30">
                              <td className="p-3 text-center font-bold text-foreground">{idx + 1}</td>
                              <td className="p-3 font-bold text-foreground">
                                <Link href={`/buku/${book.slug}`} className="hover:underline line-clamp-1">
                                  {book.title}
                                </Link>
                              </td>
                              <td className="p-3 text-muted">{book.author}</td>
                              <td className="p-3 text-center font-bold text-foreground">
                                <span className="px-2 py-0.5 bg-surface-muted border border-border-hairline">
                                  {book.borrowCount}x
                                </span>
                              </td>
                              <td className="p-3 text-center text-muted">
                                {book.availableCopies} / {book.totalCopies}
                              </td>
                              <td className="p-3 text-right">
                                <Link
                                  href={`/buku/${book.slug}`}
                                  className="p-1 text-muted hover:text-foreground inline-flex items-center"
                                  title="Buka rincian buku"
                                >
                                  <ArrowUpRight className="w-4 h-4" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Editorial Card List (<md) */}
                    <div className="md:hidden divide-y divide-border-hairline">
                      {data.topBooks.map((book, idx) => (
                        <div key={book.id} className="py-3 flex items-start justify-between gap-3 font-sans">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="font-mono text-xs font-bold text-muted w-5 shrink-0 pt-0.5">
                              #{idx + 1}
                            </span>
                            <div className="space-y-0.5 min-w-0">
                              <Link
                                href={`/buku/${book.slug}`}
                                className="font-serif font-bold text-foreground text-sm line-clamp-1 hover:underline"
                              >
                                {book.title}
                              </Link>
                              <p className="font-mono text-[11px] text-muted truncate">{book.author}</p>
                              <div className="font-mono text-[10px] text-muted flex items-center gap-2 pt-1">
                                <span>Stok: {book.availableCopies}/{book.totalCopies}</span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="px-2 py-0.5 bg-surface-muted border border-border-hairline font-mono text-[11px] font-bold text-foreground">
                              {book.borrowCount}x Pinjam
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────
              TAB 2: LITERASI & WARTA WARGA
              ────────────────────────────────────────────────────── */}
          {currentTab === 'LITERASI' && (
            <div className="space-y-8 animate-in fade-in-50 duration-200">
              {/* Literacy Key Metrics Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 font-mono">
                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    NASKAH TERBIT
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                    {data.literacy.publishedArticles}
                  </div>
                  <span className="text-[11px] text-muted block pt-1">
                    dari {data.literacy.totalArticles} naskah masuk
                  </span>
                </div>

                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    MENUNGGU KURASI
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                    {data.literacy.pendingArticles}
                  </div>
                  <span className="text-[11px] text-muted block pt-1">
                    dalam antrean meja redaksi
                  </span>
                </div>

                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    PERLU REVISI
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                    {data.literacy.revisionArticles}
                  </div>
                  <span className="text-[11px] text-muted block pt-1">
                    catatan kurator dikirim ke penulis
                  </span>
                </div>

                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    NASKAH DITOLAK
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                    {data.literacy.rejectedArticles}
                  </div>
                  <span className="text-[11px] text-muted block pt-1">
                    tidak lolos kriteria kurasi
                  </span>
                </div>
              </div>

              {/* Top Writers and Category Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Citizen Writers Leaderboard */}
                <div className="md:col-span-6 p-5 sm:p-6 border-2 border-foreground bg-surface space-y-4">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-2 font-mono text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Feather className="w-4 h-4 text-muted" />
                      PENULIS WARGA PALING AKTIF
                    </span>
                    <span className="text-muted text-[10px]">PRODUKTIVITAS KARYA</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {data.literacy.topAuthors.length === 0 ? (
                      <p className="text-muted italic py-6 text-center">Belum ada penulis terdaftar.</p>
                    ) : (
                      data.literacy.topAuthors.map((author, idx) => (
                        <div
                          key={author.id}
                          className="p-3 bg-surface-muted/40 border border-border-hairline flex items-center justify-between gap-3 hover:border-foreground transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 flex items-center justify-center font-bold text-[10px] bg-foreground text-background shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground truncate">{author.name}</p>
                              <p className="text-[10px] text-muted truncate">@{author.username}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-surface border border-border-hairline font-bold text-[11px] shrink-0">
                            {author.publishedCount} Naskah Terbit
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Popular Categories */}
                <div className="md:col-span-6 p-5 sm:p-6 border-2 border-foreground bg-surface space-y-4">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-2 font-mono text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-muted" />
                      KATEGORI WACANA TERPOPULER
                    </span>
                    <span className="text-muted text-[10px]">MINAT TULISAN</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {data.literacy.topCategories.length === 0 ? (
                      <p className="text-muted italic py-6 text-center">Belum ada kategori tercatat.</p>
                    ) : (
                      data.literacy.topCategories.map((cat) => {
                        const totalArticles = data.literacy.totalArticles || 1;
                        const pct = Math.round((cat.articleCount / totalArticles) * 100);
                        return (
                          <div key={cat.id} className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-foreground">{cat.name}</span>
                              <span className="text-muted">
                                {cat.articleCount} naskah &bull; {cat.bookCount} buku ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-surface-muted border border-border-hairline overflow-hidden">
                              <div
                                className="h-full bg-foreground transition-all duration-500"
                                style={{ width: `${Math.max(5, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-2 border-t border-border-hairline font-mono text-[11px] text-muted flex items-center justify-between">
                    <span>Akses Meja Kurasi Redaksi:</span>
                    <Link
                      href="/dashboard/kurasi"
                      className="font-bold uppercase tracking-wider text-foreground hover:underline inline-flex items-center gap-1"
                    >
                      Buka Kurasi &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────
              TAB 3: KOMUNITAS & RELAWAN
              ────────────────────────────────────────────────────── */}
          {currentTab === 'KOMUNITAS' && (
            <div className="space-y-8 animate-in fade-in-50 duration-200">
              {/* Community Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 font-mono">
                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    WARGA TERDAFTAR
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                    {data.community.totalMembers}
                  </div>
                  <span className="text-[11px] text-muted block pt-1">
                    +{data.community.newMembersThisMonth} pendaftar bulan ini
                  </span>
                </div>

                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    BUKU DARI DONATUR
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                    {data.community.donatedBooksCount}
                  </div>
                  <span className="text-[11px] text-muted block pt-1">
                    eksemplar titipan rakyat
                  </span>
                </div>

                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    KEGIATAN & LAPAK FISIK
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                    {data.community.totalEvents}
                  </div>
                  <span className="text-[11px] text-muted block pt-1">
                    {data.community.totalRegistrations} partisipasi warga
                  </span>
                </div>

                <div className="p-4 sm:p-5 bg-surface border-2 border-foreground space-y-1">
                  <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                    SURAT WARGA DIRESPON
                  </span>
                  <div className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                    {data.community.resolvedLetters}
                  </div>
                  <span className="text-[11px] text-muted block pt-1">
                    dari {data.community.totalLetters} aspirasi masuk
                  </span>
                </div>
              </div>

              {/* Community Mission & Accountability Statement */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 p-6 border-2 border-foreground bg-surface space-y-4">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-foreground border-b border-border-hairline pb-2">
                    <HeartHandshake className="w-4 h-4 text-muted" />
                    <span>PRINSIP AKUNTABILITAS KOLEKTIF</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                    Kolektif Literasi Terbuka untuk Seluruh Warga Blora
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-foreground/85 leading-relaxed">
                    Perpustakaan Jalanan Blora bertumpu pada solidaritas akar rumput dan gotong royong. Seluruh data sirkulasi buku, naskah warga, dan donasi buku dilaporkan secara transparan agar amanah masyarakat tetap terjaga secara organik.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 font-mono text-[11px]">
                    <span className="px-2.5 py-1 bg-surface-muted border border-border-hairline">
                      &bull; Tanpa Biaya Peminjaman
                    </span>
                    <span className="px-2.5 py-1 bg-surface-muted border border-border-hairline">
                      &bull; Akses Terbuka Tanpa Diskriminasi
                    </span>
                    <span className="px-2.5 py-1 bg-surface-muted border border-border-hairline">
                      &bull; Kurasi Mandiri Redaksi Warga
                    </span>
                  </div>
                </div>

                <div className="md:col-span-5 p-6 border-2 border-foreground bg-surface-muted/40 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-foreground">
                      <Printer className="w-4 h-4" />
                      <span>LEMBAR PERTANGGUNGJAWABAN</span>
                    </div>
                    <p className="font-sans text-xs text-muted leading-relaxed">
                      Butuh berkas fisik resmi untuk dilaporkan kepada donatur, komunitas relawan, atau pihak desa? Anda dapat langsung mencetak lembar akuntabilitas ini dalam format A4 rapi.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border-hairline font-mono text-xs flex items-center justify-between">
                    <span className="text-muted text-[10px]">FORMAT A4 CETAK RESMI</span>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="font-bold uppercase tracking-wider text-foreground underline underline-offset-2 hover:opacity-80 cursor-pointer"
                    >
                      Buka Mode Cetak &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
