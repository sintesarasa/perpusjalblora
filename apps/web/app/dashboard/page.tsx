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
} from 'lucide-react';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { Role } from '@perpusjal/types';

export default function DashboardOverviewPage() {
  const [data, setData] = React.useState<any>(null);
  const [activeLoans, setActiveLoans] = React.useState<any[]>([]);
  const [articles, setArticles] = React.useState<any[]>([]);
  const [badgeProgress, setBadgeProgress] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

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

        if (articlesRes.data?.items) {
          setArticles(articlesRes.data.items);
        } else if (Array.isArray(articlesRes.data)) {
          setArticles(articlesRes.data);
        }

        if (badgesRes.data) {
          setBadgeProgress(badgesRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center">
        <CustomLoader size="md" label="MEMUAT IKHTISAR PERSONAL..." />
      </div>
    );
  }

  const user = data;
  const nextBadge = badgeProgress?.badges?.find((b: any) => !b.earned);

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-6xl">
      {/* 1. WELCOME HERO & DIGITAL ID BAR */}
      <section className="border border-border-hairline bg-surface p-6 sm:p-8 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border-hairline">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
              <span>PORTAL ANGGOTA</span>
              <span>//</span>
              <span className="text-foreground font-bold">IKHTISAR PERSONAL</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Selamat Datang, {user?.name || 'Warga Blora'}
            </h1>
            <p className="font-serif text-sm text-muted mt-1">
              @{user?.username} • Terdaftar sebagai <span className="text-foreground font-bold uppercase">{user?.role}</span> (Level {user?.trustLevel || 'TL1'})
            </p>
          </div>

          <Link
            href="/dashboard/kartu-anggota"
            className="self-start md:self-auto px-4 py-2.5 border-2 border-foreground bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            <span>Kartu Anggota Digital</span>
          </Link>
        </div>

        {/* STATS 4-GRID */}
        <div className="pt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border-hairline font-mono">
          <div className="pr-4">
            <span className="text-[10px] text-muted uppercase tracking-wider block">Buku Sedang Dipinjam</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
              {activeLoans.length} <span className="text-xs text-muted font-normal">/ {user?.borrowing?.maxActive || 2} Kuota</span>
            </div>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4 pr-4">
            <span className="text-[10px] text-muted uppercase tracking-wider block">Karya Tulisan</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
              {articles.length} <span className="text-xs text-muted font-normal">Naskah</span>
            </div>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4 pr-4">
            <span className="text-[10px] text-muted uppercase tracking-wider block">Lencana Terbuka</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
              {badgeProgress?.earnedCount || 0} <span className="text-xs text-muted font-normal">/ 12 Badge</span>
            </div>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="text-[10px] text-muted uppercase tracking-wider block">Status Hak Pinjam</span>
            <div className="text-xs font-bold text-foreground mt-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-foreground" />
              <span>Memenuhi Syarat</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK ACTIONS BAR */}
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
            className="p-4 border border-border-hairline bg-surface hover:border-foreground transition-colors flex flex-col justify-between group"
          >
            <BookOpen className="w-5 h-5 text-muted group-hover:text-foreground mb-3" />
            <div>
              <span className="font-bold text-foreground block">Pinjam Buku</span>
              <span className="text-[10px] text-muted">Jelajahi katalog lapak</span>
            </div>
          </Link>

          <Link
            href="/tulis"
            className="p-4 border border-border-hairline bg-surface hover:border-foreground transition-colors flex flex-col justify-between group"
          >
            <Feather className="w-5 h-5 text-muted group-hover:text-foreground mb-3" />
            <div>
              <span className="font-bold text-foreground block">Tulis Artikel</span>
              <span className="text-[10px] text-muted">Kirim naskah esai/resensi</span>
            </div>
          </Link>

          <Link
            href="/surat-pembaca"
            className="p-4 border border-border-hairline bg-surface hover:border-foreground transition-colors flex flex-col justify-between group"
          >
            <Sparkles className="w-5 h-5 text-muted group-hover:text-foreground mb-3" />
            <div>
              <span className="font-bold text-foreground block">Surat Pembaca</span>
              <span className="text-[10px] text-muted">Suarakan aspirasi warga</span>
            </div>
          </Link>

          <Link
            href="/kegiatan"
            className="p-4 border border-border-hairline bg-surface hover:border-foreground transition-colors flex flex-col justify-between group"
          >
            <Calendar className="w-5 h-5 text-muted group-hover:text-foreground mb-3" />
            <div>
              <span className="font-bold text-foreground block">Agenda Lapak</span>
              <span className="text-[10px] text-muted">Lihat jadwal kegiatan</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. ACTIVE LOANS SECTION */}
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
            <p className="font-mono text-xs text-muted mb-2">
              Kamu tidak memiliki pinjaman buku yang sedang berjalan.
            </p>
            <Link
              href="/buku"
              className="inline-block px-4 py-2 border border-foreground bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90"
            >
              Cari Buku di Katalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => (
              <div
                key={loan.id}
                className="border border-foreground bg-surface p-5 flex flex-col justify-between font-mono"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border border-foreground bg-foreground text-background">
                      {loan.status}
                    </span>
                    <span className="text-[10px] text-muted">
                      KODE: {loan.loanCode}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-foreground line-clamp-2">
                    {loan.book?.title}
                  </h3>
                  <p className="text-xs text-muted font-sans mt-0.5">
                    Penulis: {loan.book?.author}
                  </p>

                  {loan.pickupCode && loan.status === 'APPROVED' && (
                    <div className="mt-3 p-2 bg-surface-muted border border-border-hairline text-center">
                      <span className="text-[10px] text-muted block uppercase">Kode Pengambilan di Lapak</span>
                      <span className="font-mono text-xl font-bold tracking-widest text-foreground">
                        {loan.pickupCode}
                      </span>
                    </div>
                  )}

                  {loan.dueDate && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Jatuh Tempo: {new Date(loan.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border-hairline flex justify-end">
                  <Link
                    href="/dashboard/pinjaman"
                    className="text-xs font-bold text-foreground hover:underline inline-flex items-center gap-1"
                  >
                    Buka Rincian Pinjaman <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. NEXT BADGE PROGRESS & WRITINGS IN 2 COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Next Badge Progress */}
        <section className="border border-border-hairline bg-surface p-6 flex flex-col justify-between">
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
                  <div className="w-10 h-10 border border-foreground bg-surface-muted flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-foreground" />
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
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>Capaian: {nextBadge.currentValue} / {nextBadge.targetValue}</span>
                    <span>{nextBadge.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-muted border border-border-hairline overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-300"
                      style={{ width: `${nextBadge.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="font-mono text-xs text-muted">
                Semua lencana telah terbuka! Kontribusi luar biasa untuk literasi bersama.
              </p>
            )}
          </div>

          <Link
            href="/dashboard/badge"
            className="font-mono text-xs font-bold text-foreground hover:underline inline-flex items-center gap-1 mt-6"
          >
            Lihat Koleksi Seluruh Lencana <ArrowRight className="w-3 h-3" />
          </Link>
        </section>

        {/* Recent Writings */}
        <section className="border border-border-hairline bg-surface p-6 flex flex-col justify-between">
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
                  Belum ada naskah tulisan yang kamu buat.
                </p>
                <Link
                  href="/tulis"
                  className="px-3 py-1.5 border border-foreground bg-foreground text-background font-mono text-xs font-bold uppercase inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Mulai Menulis
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border-hairline">
                {articles.slice(0, 3).map((art) => (
                  <div key={art.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-serif text-sm font-bold text-foreground truncate block hover:underline">
                        <Link href={`/dashboard/tulisan`}>{art.title}</Link>
                      </span>
                      <span className="font-mono text-[10px] text-muted uppercase">
                        Status: {art.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/dashboard/tulisan"
            className="font-mono text-xs font-bold text-foreground hover:underline inline-flex items-center gap-1 mt-6"
          >
            Buka Ruang Tulisan Saya <ArrowRight className="w-3 h-3" />
          </Link>
        </section>
      </div>

      {/* 5. ADMIN / CURATOR BANNER (IF APPLICABLE) */}
      {user && (user.role === Role.KURATOR || user.role === Role.ADMIN) && (
        <section className="border-2 border-foreground bg-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-foreground">
              <Shield className="w-4 h-4" />
              <span>Akses Wewenang Pengurus Aktif</span>
            </div>
            <p className="font-serif text-xs sm:text-sm text-muted mt-1">
              Sebagai {user.role}, kamu memiliki hak akses langsung ke Meja Kurasi naskah dan Dasbor Sirkulasi Lapak.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
            <Link
              href="/admin/kurasi"
              className="px-3 py-2 border border-foreground bg-foreground text-background font-bold uppercase"
            >
              Meja Kurasi
            </Link>
            {user.role === Role.ADMIN && (
              <Link
                href="/admin"
                className="px-3 py-2 border border-border-hairline hover:border-foreground uppercase font-semibold"
              >
                Dasbor Admin
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
