'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  BookOpen,
  Feather,
  Clock,
  AlertTriangle,
  ArrowRight,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { AdminDashboardStats, AdminAuditLogItem } from '@perpusjal/types';
import { apiClient } from '@/lib/api';
import { PetaNavigasi } from '@/components/layout/peta-navigasi';
import { CustomLoader } from '@/components/ui/custom-loader';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<AdminDashboardStats | null>(null);
  const [logs, setLogs] = React.useState<AdminAuditLogItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          apiClient<AdminDashboardStats>('/admin/stats'),
          apiClient<{ items: AdminAuditLogItem[] }>('/admin/audit-logs?limit=10'),
        ]);

        if (statsRes.data) {
          setStats(statsRes.data);
        }
        if (logsRes.data) {
          setLogs(logsRes.data.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ── 1. EDITORIAL HEADER BANNER ── */}
      <section className="border-b border-border-hairline bg-surface-muted/30 py-8 sm:py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <PetaNavigasi
              items={[
                { label: 'PERPUSJAL', href: '/' },
                { label: 'PENGURUS PUSAT', href: '/admin' },
                { label: 'DASBOR OPERASIONAL' },
              ]}
              className="mb-1"
            />
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
                Dasbor Operasional
              </h1>
              <span className="px-2 py-0.5 bg-foreground text-background font-mono text-[9.5px] uppercase font-bold tracking-widest inline-flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 bg-background animate-pulse" />
                PENGURUS PUSAT
              </span>
            </div>
            <p className="font-sans text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
              Pusat kendali sirkulasi perpustakaan, kurasi publikasi warta, moderasi dialog warga, dan kedaulatan data komunitas Perpustakaan Jalanan Blora.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 font-mono text-xs w-full sm:w-auto shrink-0">
            <Link
              href="/dashboard/sirkulasi"
              className="min-h-[44px] sm:min-h-0 px-4 py-2.5 border-2 border-foreground bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 touch-tactile shadow-sm text-center"
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Mode Lapak</span>
            </Link>
            <Link
              href="/dashboard/kurasi"
              className="min-h-[44px] sm:min-h-0 px-4 py-2.5 border-2 border-foreground bg-surface hover:bg-surface-muted active:scale-[0.98] text-foreground font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 touch-tactile text-center"
            >
              <Feather className="w-3.5 h-3.5 shrink-0" />
              <span>Meja Kurasi</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. STATS & URGENT TASKS ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 space-y-10">
        {loading ? (
          <div className="p-16 text-center font-mono text-xs text-muted border border-border-hairline bg-surface">
            <CustomLoader size="md" label="MENGHIMPUN STATISTIK LINTAS MODUL PERPUSJAL..." />
          </div>
        ) : stats ? (
          <>
            {/* ── A. PRIORITAS AKSI TERTUNDA (BENTO GRID 2x4) ── */}
            <section className="space-y-4">
              <div className="flex items-baseline justify-between border-b-2 border-foreground pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-foreground" />
                  <h2 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wider text-foreground">
                    Aksi Segera Membutuhkan Tindakan
                  </h2>
                </div>
                <span className="font-mono text-[10px] sm:text-xs text-muted uppercase tracking-wider">
                  Tugas Hari Ini
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Pengajuan Pinjam */}
                <Link
                  href="/dashboard/sirkulasi"
                  className={cn(
                    'p-4 sm:p-5 border-2 transition-all block group relative overflow-hidden touch-tactile active:scale-[0.98]',
                    stats.pendingLoans > 0
                      ? 'border-foreground bg-surface shadow-xs'
                      : 'border-border-hairline bg-surface-muted/20 opacity-75 hover:opacity-100 hover:border-foreground/50'
                  )}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] sm:text-xs mb-2">
                    <span className="text-muted uppercase font-bold tracking-wider">Peminjaman Baru</span>
                    <Clock className="w-4 h-4 text-foreground shrink-0" />
                  </div>
                  <div className="font-mono text-3xl sm:text-4xl font-extrabold text-foreground tabular-nums tracking-tight">
                    {stats.pendingLoans}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-hairline">
                    <span className="font-mono text-[10.5px] sm:text-[11px] text-muted group-hover:text-foreground group-hover:underline inline-flex items-center gap-1 transition-colors">
                      Tinjau Pengajuan <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    {stats.pendingLoans > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                </Link>

                {/* 2. Pinjaman Terlambat */}
                <Link
                  href="/dashboard/sirkulasi"
                  className={cn(
                    'p-4 sm:p-5 border-2 transition-all block group relative overflow-hidden touch-tactile active:scale-[0.98]',
                    stats.overdueLoans > 0
                      ? 'border-red-600 dark:border-red-500 bg-red-50/40 dark:bg-red-950/20 shadow-xs'
                      : 'border-border-hairline bg-surface-muted/20 opacity-75 hover:opacity-100 hover:border-foreground/50'
                  )}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] sm:text-xs mb-2">
                    <span className="text-muted uppercase font-bold tracking-wider">Buku Jatuh Tempo</span>
                    <AlertTriangle className={cn('w-4 h-4 shrink-0', stats.overdueLoans > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground')} />
                  </div>
                  <div className={cn(
                    'font-mono text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight',
                    stats.overdueLoans > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                  )}>
                    {stats.overdueLoans}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-hairline">
                    <span className="font-mono text-[10.5px] sm:text-[11px] text-muted group-hover:text-foreground group-hover:underline inline-flex items-center gap-1 transition-colors">
                      Cek Keterlambatan <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    {stats.overdueLoans > 0 && (
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    )}
                  </div>
                </Link>

                {/* 3. Artikel Antrean Kurasi */}
                <Link
                  href="/dashboard/kurasi"
                  className={cn(
                    'p-4 sm:p-5 border-2 transition-all block group relative overflow-hidden touch-tactile active:scale-[0.98]',
                    stats.pendingArticles > 0
                      ? 'border-foreground bg-surface shadow-xs'
                      : 'border-border-hairline bg-surface-muted/20 opacity-75 hover:opacity-100 hover:border-foreground/50'
                  )}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] sm:text-xs mb-2">
                    <span className="text-muted uppercase font-bold tracking-wider">Naskah Warta Baru</span>
                    <Feather className="w-4 h-4 text-foreground shrink-0" />
                  </div>
                  <div className="font-mono text-3xl sm:text-4xl font-extrabold text-foreground tabular-nums tracking-tight">
                    {stats.pendingArticles}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-hairline">
                    <span className="font-mono text-[10.5px] sm:text-[11px] text-muted group-hover:text-foreground group-hover:underline inline-flex items-center gap-1 transition-colors">
                      Buka Meja Kurasi <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    {stats.pendingArticles > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                </Link>

                {/* 4. Surat Pembaca */}
                <Link
                  href="/dashboard/kurasi"
                  className={cn(
                    'p-4 sm:p-5 border-2 transition-all block group relative overflow-hidden touch-tactile active:scale-[0.98]',
                    stats.pendingLetters > 0
                      ? 'border-foreground bg-surface shadow-xs'
                      : 'border-border-hairline bg-surface-muted/20 opacity-75 hover:opacity-100 hover:border-foreground/50'
                  )}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] sm:text-xs mb-2">
                    <span className="text-muted uppercase font-bold tracking-wider">Surat Pembaca</span>
                    <BookOpen className="w-4 h-4 text-foreground shrink-0" />
                  </div>
                  <div className="font-mono text-3xl sm:text-4xl font-extrabold text-foreground tabular-nums tracking-tight">
                    {stats.pendingLetters}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-hairline">
                    <span className="font-mono text-[10.5px] sm:text-[11px] text-muted group-hover:text-foreground group-hover:underline inline-flex items-center gap-1 transition-colors">
                      Tinjau Surat Masuk <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    {stats.pendingLetters > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                </Link>
              </div>
            </section>

            {/* ── B. RINGKASAN METRIK SISTEM (BENTO GRID 2x4) ── */}
            <section className="space-y-4">
              <div className="flex items-baseline justify-between border-b-2 border-foreground pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-foreground" />
                  <h2 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wider text-foreground">
                    Statistik Ekosistem Perpusjal
                  </h2>
                </div>
                <span className="font-mono text-[10px] sm:text-xs text-muted uppercase tracking-wider">
                  Koleksi, Partisipasi &amp; Acara
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
                {/* 1. Total Warga */}
                <div className="border border-border-hairline bg-surface p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-muted text-[11px] uppercase font-bold tracking-wider mb-1">
                      <Users className="w-3.5 h-3.5 text-foreground shrink-0" />
                      <span>Total Warga</span>
                    </div>
                    <div className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
                      {stats.totalUsers}
                    </div>
                    <div className="text-[10px] text-muted mt-1 font-sans">
                      +{stats.usersThisWeek} bergabung minggu ini
                    </div>
                  </div>
                  <Link
                    href="/admin/pengguna"
                    className="text-[10.5px] font-bold text-foreground hover:underline inline-flex items-center gap-1 mt-4 pt-2 border-t border-border-hairline"
                  >
                    <span>Kelola Pengguna</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 2. Judul Buku */}
                <div className="border border-border-hairline bg-surface p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-muted text-[11px] uppercase font-bold tracking-wider mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-foreground shrink-0" />
                      <span>Judul Buku</span>
                    </div>
                    <div className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
                      {stats.totalBooks}
                    </div>
                    <div className="text-[10px] text-muted mt-1 font-sans">
                      {stats.availableCopies} eksemplar tersedia di lapak
                    </div>
                  </div>
                  <Link
                    href="/dashboard/buku"
                    className="text-[10.5px] font-bold text-foreground hover:underline inline-flex items-center gap-1 mt-4 pt-2 border-t border-border-hairline"
                  >
                    <span>Kelola Pustaka</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 3. Pinjaman Berjalan */}
                <div className="border border-border-hairline bg-surface p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-muted text-[11px] uppercase font-bold tracking-wider mb-1">
                      <Layers className="w-3.5 h-3.5 text-foreground shrink-0" />
                      <span>Pinjaman Berjalan</span>
                    </div>
                    <div className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
                      {stats.activeLoans}
                    </div>
                    <div className="text-[10px] text-muted mt-1 font-sans">
                      {stats.readyPickupToday} siap diambil hari ini
                    </div>
                  </div>
                  <Link
                    href="/dashboard/sirkulasi"
                    className="text-[10.5px] font-bold text-foreground hover:underline inline-flex items-center gap-1 mt-4 pt-2 border-t border-border-hairline"
                  >
                    <span>Papan Lapak</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 4. Agenda Acara */}
                <div className="border border-border-hairline bg-surface p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-muted text-[11px] uppercase font-bold tracking-wider mb-1">
                      <Calendar className="w-3.5 h-3.5 text-foreground shrink-0" />
                      <span>Agenda Acara</span>
                    </div>
                    <div className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
                      {stats.upcomingEvents}
                    </div>
                    <div className="text-[10px] text-muted mt-1 font-sans">
                      kegiatan mendatang teragenda
                    </div>
                  </div>
                  <Link
                    href="/dashboard/kegiatan"
                    className="text-[10.5px] font-bold text-foreground hover:underline inline-flex items-center gap-1 mt-4 pt-2 border-t border-border-hairline"
                  >
                    <span>Jadwal &amp; Forum</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </section>

            {/* ── C. LOG AUDIT AKTIVITAS SISTEM TERBARU (PRD §20.4) ── */}
            <section className="space-y-4">
              <div className="flex items-baseline justify-between border-b-2 border-foreground pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-foreground" />
                  <h2 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wider text-foreground">
                    Rekaman Audit Terkini (Append-Only)
                  </h2>
                </div>
                <span className="font-mono text-[10px] sm:text-xs text-muted uppercase tracking-wider">
                  PRD §20.4: Jejak Keamanan
                </span>
              </div>

              {logs.length === 0 ? (
                <div className="border border-dashed border-border-hairline p-8 text-center bg-surface font-mono text-xs text-muted">
                  Belum ada rekaman audit aktivitas tersimpan.
                </div>
              ) : (
                <div className="border border-border-hairline bg-surface divide-y divide-border-hairline">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs font-mono hover:bg-surface-muted/30 transition-colors"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 border border-foreground bg-foreground text-background text-[9.5px] uppercase font-bold tracking-wider shrink-0">
                          {log.action}
                        </span>
                        <span className="text-foreground font-semibold">
                          {log.actorName ? log.actorName : 'Sistem'}
                          {log.actorUsername && (
                            <span className="text-muted font-normal"> (@{log.actorUsername})</span>
                          )}
                        </span>
                        <span className="text-muted text-[11px]">
                          pada entitas <strong className="text-foreground font-mono">{log.entityType}</strong> ({log.entityId?.slice(0, 8)}...)
                        </span>
                      </div>

                      <time className="text-muted text-[10.5px] sm:text-[11px] shrink-0 font-mono">
                        {new Date(log.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
