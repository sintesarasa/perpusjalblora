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
} from 'lucide-react';
import { AdminDashboardStats, AdminAuditLogItem } from '@perpusjal/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<AdminDashboardStats | null>(null);
  const [logs, setLogs] = React.useState<AdminAuditLogItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch('/api/v1/admin/stats', { credentials: 'include' }),
          fetch('/api/v1/admin/audit-logs?limit=10', { credentials: 'include' }),
        ]);

        if (statsRes.ok) {
          const sJson = await statsRes.json();
          setStats(sJson.data);
        }
        if (logsRes.ok) {
          const lJson = await logsRes.json();
          setLogs(lJson.data?.items || []);
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
      {/* 1. EDITORIAL HEADER BANNER */}
      <section className="border-b border-border-hairline bg-surface-muted/40 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>MEJA PENGURUS PUSAT (ADMIN DESK)</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Dasbor Operasional
            </h1>
            <p className="font-serif text-sm sm:text-base text-muted max-w-2xl mt-1.5">
              Pusat kendali sirkulasi perpustakaan, kurasi publikasi warta, moderasi dialog warga, dan kedaulatan data komunitas.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <Link
              href="/admin/sirkulasi"
              className="px-4 py-2 border border-foreground bg-foreground text-background font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Mode Lapak
            </Link>
            <Link
              href="/admin/kurasi"
              className="px-4 py-2 border border-border-hairline bg-surface hover:border-foreground text-foreground font-semibold uppercase tracking-wider transition-colors"
            >
              Meja Kurasi
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS & URGENT TASKS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-12">
        {loading ? (
          <div className="p-16 text-center font-mono text-xs text-muted border border-border-hairline bg-surface">
            Menghimpun statistik lintas modul Perpusjal...
          </div>
        ) : stats ? (
          <>
            {/* A. PRIORITAS AKSI TERTUNDA (PRD §20.1: Pekerjaan Tertunda Menonjol) */}
            <section>
              <div className="flex items-baseline justify-between border-b border-foreground pb-2 mb-4">
                <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-foreground">
                  Aksi Segera Membutuhkan Tindakan
                </h2>
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                  Daftar Tugas Pengurus Hari Ini
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Pengajuan Pinjam */}
                <Link
                  href="/admin/sirkulasi"
                  className={`p-5 border transition-all block group ${
                    stats.pendingLoans > 0
                      ? 'border-foreground bg-surface shadow-sm'
                      : 'border-border-hairline bg-surface-muted/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs mb-2">
                    <span className="text-muted uppercase">Peminjaman Baru</span>
                    <Clock className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <div className="font-serif text-3xl font-bold text-foreground">
                    {stats.pendingLoans}
                  </div>
                  <p className="font-mono text-[11px] text-muted mt-2 group-hover:underline inline-flex items-center gap-1">
                    Tinjau Pengajuan <ArrowRight className="w-3 h-3" />
                  </p>
                </Link>

                {/* 2. Pinjaman Terlambat */}
                <Link
                  href="/admin/sirkulasi"
                  className={`p-5 border transition-all block group ${
                    stats.overdueLoans > 0
                      ? 'border-foreground bg-surface shadow-sm'
                      : 'border-border-hairline bg-surface-muted/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs mb-2">
                    <span className="text-muted uppercase">Buku Jatuh Tempo</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <div className="font-serif text-3xl font-bold text-foreground">
                    {stats.overdueLoans}
                  </div>
                  <p className="font-mono text-[11px] text-muted mt-2 group-hover:underline inline-flex items-center gap-1">
                    Cek Keterlambatan <ArrowRight className="w-3 h-3" />
                  </p>
                </Link>

                {/* 3. Artikel Antrean Kurasi */}
                <Link
                  href="/admin/kurasi"
                  className={`p-5 border transition-all block group ${
                    stats.pendingArticles > 0
                      ? 'border-foreground bg-surface shadow-sm'
                      : 'border-border-hairline bg-surface-muted/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs mb-2">
                    <span className="text-muted uppercase">Naskah Baru</span>
                    <Feather className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <div className="font-serif text-3xl font-bold text-foreground">
                    {stats.pendingArticles}
                  </div>
                  <p className="font-mono text-[11px] text-muted mt-2 group-hover:underline inline-flex items-center gap-1">
                    Buka Meja Kurasi <ArrowRight className="w-3 h-3" />
                  </p>
                </Link>

                {/* 4. Surat Pembaca */}
                <Link
                  href="/surat-pembaca"
                  className={`p-5 border transition-all block group ${
                    stats.pendingLetters > 0
                      ? 'border-foreground bg-surface shadow-sm'
                      : 'border-border-hairline bg-surface-muted/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs mb-2">
                    <span className="text-muted uppercase">Surat Pembaca</span>
                    <BookOpen className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <div className="font-serif text-3xl font-bold text-foreground">
                    {stats.pendingLetters}
                  </div>
                  <p className="font-mono text-[11px] text-muted mt-2 group-hover:underline inline-flex items-center gap-1">
                    Tinjau Surat Masuk <ArrowRight className="w-3 h-3" />
                  </p>
                </Link>
              </div>
            </section>

            {/* B. RINGKASAN METRIK SISTEM */}
            <section>
              <div className="flex items-baseline justify-between border-b border-foreground pb-2 mb-4">
                <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-foreground">
                  Statistik Ekosistem Perpusjal
                </h2>
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                  Koleksi, Partisipasi & Acara
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-border-hairline bg-surface p-5 font-mono">
                  <div className="flex items-center gap-2 text-muted text-xs uppercase mb-1">
                    <Users className="w-3.5 h-3.5" /> Total Warga
                  </div>
                  <div className="font-serif text-2xl font-bold text-foreground">
                    {stats.totalUsers}
                  </div>
                  <div className="text-[10px] text-muted mt-1">
                    +{stats.usersThisWeek} bergabung minggu ini
                  </div>
                  <Link
                    href="/admin/pengguna"
                    className="text-[10px] font-bold text-foreground hover:underline block mt-3"
                  >
                    Kelola Pengguna →
                  </Link>
                </div>

                <div className="border border-border-hairline bg-surface p-5 font-mono">
                  <div className="flex items-center gap-2 text-muted text-xs uppercase mb-1">
                    <BookOpen className="w-3.5 h-3.5" /> Judul Buku
                  </div>
                  <div className="font-serif text-2xl font-bold text-foreground">
                    {stats.totalBooks}
                  </div>
                  <div className="text-[10px] text-muted mt-1">
                    {stats.availableCopies} eksemplar tersedia di lapak
                  </div>
                  <Link
                    href="/dashboard/buku"
                    className="text-[10px] font-bold text-foreground hover:underline block mt-3"
                  >
                    Kelola Koleksi Pustaka →
                  </Link>
                </div>

                <div className="border border-border-hairline bg-surface p-5 font-mono">
                  <div className="flex items-center gap-2 text-muted text-xs uppercase mb-1">
                    <Layers className="w-3.5 h-3.5" /> Pinjaman Berjalan
                  </div>
                  <div className="font-serif text-2xl font-bold text-foreground">
                    {stats.activeLoans}
                  </div>
                  <div className="text-[10px] text-muted mt-1">
                    {stats.readyPickupToday} siap diambil hari ini
                  </div>
                  <Link
                    href="/admin/sirkulasi"
                    className="text-[10px] font-bold text-foreground hover:underline block mt-3"
                  >
                    Papan Lapak →
                  </Link>
                </div>

                <div className="border border-border-hairline bg-surface p-5 font-mono">
                  <div className="flex items-center gap-2 text-muted text-xs uppercase mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Agenda Acara
                  </div>
                  <div className="font-serif text-2xl font-bold text-foreground">
                    {stats.upcomingEvents}
                  </div>
                  <div className="text-[10px] text-muted mt-1">
                    kegiatan mendatang teragenda
                  </div>
                  <Link
                    href="/kegiatan"
                    className="text-[10px] font-bold text-foreground hover:underline block mt-3"
                  >
                    Jadwal Lapak & Forum →
                  </Link>
                </div>
              </div>
            </section>

            {/* C. LOG AUDIT AKTIVITAS SISTEM TERBARU (PRD §20.4) */}
            <section>
              <div className="flex items-baseline justify-between border-b border-foreground pb-2 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-foreground" />
                  <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-foreground">
                    Rekaman Audit Terkini (Append-Only)
                  </h2>
                </div>
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                  PRD §20.4: Jejak Keamanan Sistem
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
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 border border-foreground bg-foreground text-background text-[10px] uppercase font-bold tracking-wider">
                          {log.action}
                        </span>
                        <span className="text-foreground">
                          {log.actorName ? log.actorName : 'Sistem'}
                          {log.actorUsername && (
                            <span className="text-muted"> (@{log.actorUsername})</span>
                          )}
                        </span>
                        <span className="text-muted">
                          pada entitas {log.entityType} ({log.entityId?.slice(0, 8)}...)
                        </span>
                      </div>

                      <time className="text-muted text-[11px] shrink-0">
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
