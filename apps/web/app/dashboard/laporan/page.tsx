'use client';

import * as React from 'react';
import Link from 'next/link';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { Role } from '@perpusjal/types';
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
} from 'lucide-react';

interface ReportData {
  metrics: {
    totalLoans: number;
    monthLoans: number;
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
}

export default function DashboardReportsPage() {
  const [currentUser, setCurrentUser] = React.useState<{ id: string; role: Role } | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [data, setData] = React.useState<ReportData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [downloading, setDownloading] = React.useState(false);

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

  const loadReport = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiClient<{ data: ReportData }>('/loans/reports/overview');
    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data?.data) {
      setData(res.data.data);
    }
  }, []);

  React.useEffect(() => {
    if (currentUser && (currentUser.role === Role.KURATOR || currentUser.role === Role.ADMIN)) {
      loadReport();
    }
  }, [currentUser, loadReport]);

  const handleExportCsv = async () => {
    setDownloading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/loans/reports/export`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error('Gagal mengunduh laporan sirkulasi.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-sirkulasi-perpusjal-${new Date().toISOString().slice(0, 10)}.csv`;
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
      <div className="p-8 max-w-2xl mx-auto space-y-4 font-mono text-xs">
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

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl">
      {/* Header / Masthead */}
      <div className="border-b-2 border-foreground pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-widest">
            <span>Kurator & Relawan</span>
            <span>// STATISTIK & AKUNTABILITAS SIRKULASI</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Laporan & Analitik Sirkulasi
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadReport}
            disabled={loading}
            className="px-3 py-2 border border-foreground font-mono text-xs uppercase tracking-wider font-semibold hover:bg-surface-muted transition-colors inline-flex items-center gap-1.5"
            title="Segarkan data laporan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={downloading}
            className="px-4 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:bg-foreground/90 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Mengunduh...' : 'Unduh Laporan (.CSV)'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <CustomLoader size="lg" label="MENGAGREGASI DATA SIRKULASI PUSTAKA..." />
        </div>
      ) : error ? (
        <div className="p-8 border border-foreground bg-surface-muted text-center space-y-3 font-mono text-xs">
          <p className="text-foreground">{error}</p>
          <button
            onClick={loadReport}
            className="px-4 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider"
          >
            Coba Lagi
          </button>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* 1. KEY METRICS TILES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            {/* Total Pinjaman */}
            <div className="p-5 bg-surface border-2 border-foreground space-y-1">
              <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                TOTAL SIRKULASI KUMULATIF
              </span>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                {data.metrics.totalLoans}
              </div>
              <span className="text-[11px] text-muted block pt-1">
                {data.metrics.monthLoans} sirkulasi bulan ini
              </span>
            </div>

            {/* Tingkat Kepatuhan */}
            <div className="p-5 bg-surface border-2 border-foreground space-y-1">
              <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                KEPATUHAN TENGGAT WAKTU
              </span>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-foreground flex items-baseline gap-1">
                <span>{data.metrics.onTimeRate}%</span>
              </div>
              <span className="text-[11px] text-muted block pt-1">
                {data.metrics.returnedLoans} dikembalikan tepat waktu
              </span>
            </div>

            {/* Pinjaman Berjalan */}
            <div className="p-5 bg-surface border-2 border-foreground space-y-1">
              <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                SEDANG DIBACA WARGA
              </span>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                {data.metrics.activeLoans}
              </div>
              <span className="text-[11px] text-destructive block pt-1 font-bold">
                {data.metrics.overdueLoans} melewati jatuh tempo
              </span>
            </div>

            {/* Total Eksemplar Fisik */}
            <div className="p-5 bg-surface border-2 border-foreground space-y-1">
              <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                TOTAL EKSEMPLAR FISIK
              </span>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                {data.metrics.totalCopies}
              </div>
              <span className="text-[11px] text-muted block pt-1">
                {data.metrics.availableCopies} siap dipinjam di rak
              </span>
            </div>
          </div>

          {/* 2. PHYSICAL HEALTH & REHABILITATION STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 p-6 border-2 border-foreground bg-surface space-y-4">
              <div className="flex items-center justify-between border-b border-border-hairline pb-2 font-mono text-xs">
                <span className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-muted" />
                  KESEHATAN FISIK KOLEKSI BUKU
                </span>
                <span className="text-muted text-[10px]">INVENTARIS LAPAK</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {data.conditionStats.length === 0 ? (
                  <p className="text-muted italic py-4 text-center">Belum ada data kondisi fisik tercatat.</p>
                ) : (
                  data.conditionStats.map((item) => {
                    const totalRecorded = data.conditionStats.reduce((sum, c) => sum + c.count, 0) || 1;
                    const pct = Math.round((item.count / totalRecorded) * 100);
                    return (
                      <div key={item.condition} className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-foreground uppercase">{item.condition}</span>
                          <span className="text-muted">
                            {item.count} eksemplar ({pct}%)
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

              <div className="pt-2 border-t border-border-hairline font-mono text-[11px] text-muted flex items-center justify-between">
                <span>Total Buku Hilang Tercatat:</span>
                <strong className="text-destructive">{data.metrics.returnedLostLoans} judul</strong>
              </div>
            </div>

            {/* Quick Accountability Note */}
            <div className="md:col-span-6 p-6 border-2 border-foreground bg-surface-muted/40 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>TRANSPARANSI ARSIP PERPUSTAKAAN</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Akuntabilitas Koleksi Komunitas Blora
                </h3>
                <p className="font-sans text-xs text-muted leading-relaxed">
                  Laporan ini dihimpun secara langsung dari seluruh transaksi serah-terima di lapak fisik Perpusjal Blora. Unduhan berkas CSV dapat digunakan sebagai bukti pertanggungjawaban kepada para donatur dan masyarakat umum.
                </p>
              </div>

              <div className="pt-4 border-t border-border-hairline font-mono text-xs flex items-center justify-between">
                <span className="text-muted text-[10px]">FORMAT BERKAS: STANDAR RFC 4180 CSV</span>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={downloading}
                  className="font-bold uppercase tracking-wider text-foreground underline underline-offset-2 hover:opacity-80"
                >
                  Ekspor Sekarang &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* 3. TOP 10 MOST READ BOOKS */}
          <div className="border-2 border-foreground bg-surface p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-foreground" />
                <h2 className="font-serif font-bold text-lg text-foreground font-sans">
                  10 Buku Paling Banyak Dibaca Warga
                </h2>
              </div>
              <span className="text-[10px] text-muted uppercase tracking-wider">
                BERDASARKAN FREKUENSI PINJAM
              </span>
            </div>

            {data.topBooks.length === 0 ? (
              <p className="text-muted italic py-8 text-center">Belum ada data peminjaman yang tercatat.</p>
            ) : (
              <div className="overflow-x-auto">
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
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
