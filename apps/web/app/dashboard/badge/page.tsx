'use client';

import * as React from 'react';
import Link from 'next/link';
import { Award, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserBadgeListResponse, UserBadgeProgress } from '@perpusjal/types';

export default function DashboardBadgesPage() {
  const [data, setData] = React.useState<UserBadgeListResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchBadges = React.useCallback(async () => {
    try {
      const res = await fetch('/api/v1/badges/my-progress', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const earnedBadges = data?.badges.filter((b) => b.earned) || [];
  const lockedBadges = data?.badges.filter((b) => !b.earned) || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* 1. EDITORIAL HEADER BANNER */}
      <section className="border-b border-border-hairline bg-surface-muted/30 py-10 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>GAMIFIKASI & PENGHARGAAN KOMUNITAS</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Lencana Apresiasi Literasi
          </h1>
          <p className="font-serif text-sm sm:text-base text-muted max-w-2xl mt-2 leading-relaxed">
            Apresiasi atas langkah kecil yang kamu lakukan untuk merawat ruang literasi. Tidak ada papan peringkat dan kompetisi — setiap kemajuan adalah kemenangan personal.
          </p>

          {data && (
            <div className="mt-6 flex items-center gap-4 font-mono text-xs">
              <span className="px-3 py-1.5 border border-foreground bg-foreground text-background font-bold uppercase tracking-wider">
                {data.earnedCount} dari {data.totalCount} Lencana Terbuka
              </span>
              <span className="text-muted">
                {Math.round((data.earnedCount / data.totalCount) * 100)}% Kelengkapan
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 2. MAIN CONTENT */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-10">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-muted border border-border-hairline bg-surface">
            Menghitung riwayat kontribusi dan progres lencana...
          </div>
        ) : (
          <div className="space-y-12">
            {/* A. LENCANA DIRAIH */}
            <section>
              <div className="flex items-baseline justify-between border-b border-foreground pb-2 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-foreground" />
                  <h2 className="font-serif text-lg font-bold uppercase tracking-wider">
                    Lencana Terbuka ({earnedBadges.length})
                  </h2>
                </div>
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                  Tampil di Profil Publik
                </span>
              </div>

              {earnedBadges.length === 0 ? (
                <div className="border border-dashed border-border-hairline p-8 text-center bg-surface">
                  <p className="font-mono text-xs text-muted">
                    Belum ada lencana yang terbuka. Mulai membaca artikel, meminjam buku, atau hadir di kegiatan!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {earnedBadges.map((b) => (
                    <div
                      key={b.badge.id}
                      className="border border-foreground bg-surface p-5 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 border border-foreground bg-foreground text-background flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-base font-bold text-foreground truncate">
                            {b.badge.name}
                          </h3>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-muted block mt-0.5">
                            KODE: {b.badge.code}
                          </span>
                        </div>
                      </div>

                      <p className="font-serif text-xs text-muted mt-3 leading-relaxed">
                        {b.badge.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-border-hairline flex items-center justify-between font-mono text-[10px] text-muted">
                        <span>TERCAPAI</span>
                        {b.earnedAt && (
                          <span>
                            {new Date(b.earnedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* B. LENCANA DALAM PROGRES (LOCKED) */}
            <section>
              <div className="flex items-baseline justify-between border-b border-foreground pb-2 mb-6">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted" />
                  <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-foreground">
                    Lencana Terkunci & Progres ({lockedBadges.length})
                  </h2>
                </div>
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                  FR-BDG-03: Progres Terbuka
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {lockedBadges.map((b) => (
                  <div
                    key={b.badge.id}
                    className="border border-border-hairline bg-surface-muted/20 p-5 flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 border border-border-hairline bg-surface flex items-center justify-center shrink-0 text-muted">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-base font-bold text-foreground truncate">
                            {b.badge.name}
                          </h3>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-muted block mt-0.5">
                            {b.badge.code}
                          </span>
                        </div>
                      </div>

                      <p className="font-serif text-xs text-muted mt-3 leading-relaxed">
                        {b.badge.description}
                      </p>
                    </div>

                    {/* Progress Bar & Details */}
                    <div className="mt-5 pt-3 border-t border-border-hairline">
                      <div className="flex items-center justify-between font-mono text-[10px] text-muted mb-1.5">
                        <span>Progres: {b.currentValue} / {b.targetValue}</span>
                        <span>{b.percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-muted border border-border-hairline overflow-hidden">
                        <div
                          className="h-full bg-foreground transition-all duration-300"
                          style={{ width: `${b.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        <div className="mt-12 text-center pt-8 border-t border-border-hairline">
          <Link
            href="/dashboard/profil"
            className="font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
          >
            Atur visibilitas lencana di pengaturan profil <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </main>
    </div>
  );
}
