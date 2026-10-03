'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Feather,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Gift,
  Clock,
  Layers,
  ChevronDown,
  Check,
} from 'lucide-react';
import { UserBadgeListResponse, BadgeCategory, Role } from '@perpusjal/types';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { CustomLoader } from '@/components/ui/custom-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

function getPillarIcon(category: string) {
  switch (category) {
    case BadgeCategory.WACANA:
      return <BookOpen className="w-4 h-4" />;
    case BadgeCategory.TINTA:
      return <Feather className="w-4 h-4" />;
    case BadgeCategory.DIALEKTIKA:
      return <MessageSquare className="w-4 h-4" />;
    case BadgeCategory.AMANAH:
      return <ShieldCheck className="w-4 h-4" />;
    case BadgeCategory.PRESENSI:
      return <Calendar className="w-4 h-4" />;
    case BadgeCategory.DONATUR:
      return <Gift className="w-4 h-4" />;
    default:
      return <Award className="w-4 h-4" />;
  }
}

export default function DashboardBadgesPage() {
  const { user: currentUser } = useAuth();
  const [data, setData] = React.useState<UserBadgeListResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<string>('ALL');
  const [equipping, setEquipping] = React.useState(false);
  const [equipMessage, setEquipMessage] = React.useState<string | null>(null);

  // Curator Donation Recording State
  const [donateTargetUsername, setDonateTargetUsername] = React.useState('');
  const [donateCount, setDonateCount] = React.useState(1);
  const [donateNote, setDonateNote] = React.useState('');
  const [donating, setDonating] = React.useState(false);
  const [donateMessage, setDonateMessage] = React.useState<string | null>(null);
  const [donateError, setDonateError] = React.useState<string | null>(null);

  const fetchBadges = React.useCallback(async () => {
    try {
      const res = await apiClient<UserBadgeListResponse>('/badges/my-progress');
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load badges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const handleEquipTitle = async (title: string | null) => {
    setEquipping(true);
    setEquipMessage(null);
    try {
      const res = await apiClient<{ equippedTitle: string | null }>('/badges/equip-title', {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      });
      if (res.data) {
        setData((prev) => (prev ? { ...prev, equippedTitle: res.data?.equippedTitle ?? null } : null));
        setEquipMessage(title ? `Gelar "${title}" berhasil disematkan!` : 'Gelar kehormatan telah dilepas.');
        setTimeout(() => setEquipMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah gelar.');
    } finally {
      setEquipping(false);
    }
  };

  const handleRecordDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donateTargetUsername.trim() || donateCount <= 0) return;
    setDonating(true);
    setDonateMessage(null);
    setDonateError(null);
    try {
      const userRes = await apiClient<any>(`/users/profile/${donateTargetUsername.trim().replace(/^@/, '')}`);
      if (!userRes.data?.id) {
        throw new Error('Pengguna tidak ditemukan.');
      }
      const res = await apiClient<any>('/badges/admin/record-donation', {
        method: 'POST',
        body: JSON.stringify({
          targetUserId: userRes.data.id,
          count: donateCount,
          note: donateNote.trim() || undefined,
        }),
      });
      if (res.error) {
        throw new Error(res.error.message);
      }
      setDonateMessage(`Berhasil mencatat ${donateCount} buku donasi untuk @${donateTargetUsername}!`);
      setDonateTargetUsername('');
      setDonateCount(1);
      setDonateNote('');
      fetchBadges();
    } catch (err: any) {
      setDonateError(err.message || 'Gagal mencatat donasi.');
    } finally {
      setDonating(false);
    }
  };

  const tabs = [
    { key: 'ALL', label: 'Semua Jalur' },
    { key: BadgeCategory.WACANA, label: '📖 Wacana' },
    { key: BadgeCategory.TINTA, label: '✍️ Tinta' },
    { key: BadgeCategory.DIALEKTIKA, label: '💬 Dialektika' },
    { key: BadgeCategory.AMANAH, label: '📚 Amanah' },
    { key: BadgeCategory.PRESENSI, label: '🎪 Presensi' },
    { key: BadgeCategory.DONATUR, label: '🎁 Donatur' },
  ];

  const filteredBadges = (data?.badges || []).filter((b) => {
    if (activeTab === 'ALL') return true;
    return b.badge.category === activeTab;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-6xl">
      {/* ── 1. Masthead ── */}
      <div className="border-b-2 border-foreground pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-widest">
            <span>RUANG APRESIASI ANGGOTA</span>
            <span>// POHON PENCAPAIAN LITERASI</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Lencana & Julukan Kehormatan
          </h1>
          <p className="font-sans text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
            Jejak langkah nyata dalam merawat perpustakaan jalanan: membaca wacana, menulis kritik, hadir di lapak fisik, hingga menjaga amanah buku.
          </p>
        </div>

        {data && (
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="px-3.5 py-2 border-2 border-foreground bg-foreground text-background font-bold uppercase tracking-wider shadow-xs">
              {data.earnedCount} / {data.totalCount} Terbuka
            </span>
          </div>
        )}
      </div>

      {/* ── 2. Player Identity & Active Title Dossier Card ── */}
      {data && (
        <section className="border-2 border-foreground bg-surface p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-hairline pb-4">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted block">
                GELAR KEHORMATAN UTAMA AKTIF
              </span>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-foreground" />
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  {data.equippedTitle ? data.equippedTitle : 'Belum Ada Gelar yang Dipasang'}
                </h2>
              </div>
              <p className="font-sans text-xs text-muted">
                Gelar ini akan terpampang di samping namamu saat menulis komentar, menerbitkan artikel, dan di kartu anggota.
              </p>
            </div>

            {/* Title Selector */}
            <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Pilih Gelar yang Tersedia ({data.availableTitles.length})
              </span>
              <div className="flex items-center gap-2">
                <select
                  disabled={equipping || data.availableTitles.length === 0}
                  value={data.equippedTitle || ''}
                  onChange={(e) => handleEquipTitle(e.target.value || null)}
                  className="font-mono text-xs px-3 py-1.5 border-2 border-foreground bg-surface text-foreground font-semibold disabled:opacity-50 cursor-pointer focus:outline-none"
                >
                  <option value="">-- Tanpa Gelar Utama --</option>
                  {data.availableTitles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {equipMessage && (
            <div className="p-2.5 bg-foreground text-background font-mono text-xs font-semibold flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />
              <span>{equipMessage}</span>
            </div>
          )}

          {/* Quick Stats Grid */}
          {data.stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1 font-mono text-xs">
              <div className="p-2.5 border border-border-hairline bg-surface-muted/40">
                <span className="text-[10px] text-muted uppercase block">Artikel Dibaca</span>
                <span className="font-bold text-base text-foreground">{data.stats.articlesRead}</span>
              </div>
              <div className="p-2.5 border border-border-hairline bg-surface-muted/40">
                <span className="text-[10px] text-muted uppercase block">Karya Terbit</span>
                <span className="font-bold text-base text-foreground">{data.stats.articlesPublished}</span>
              </div>
              <div className="p-2.5 border border-border-hairline bg-surface-muted/40">
                <span className="text-[10px] text-muted uppercase block">Komentar Wacana</span>
                <span className="font-bold text-base text-foreground">{data.stats.commentsCount}</span>
              </div>
              <div className="p-2.5 border border-border-hairline bg-surface-muted/40">
                <span className="text-[10px] text-muted uppercase block">Streak Tepat Waktu</span>
                <span className="font-bold text-base text-foreground">{data.stats.onTimeStreak}x</span>
              </div>
              <div className="p-2.5 border border-border-hairline bg-surface-muted/40">
                <span className="text-[10px] text-muted uppercase block">Hadir Lapak Fisik</span>
                <span className="font-bold text-base text-foreground">{data.stats.eventsAttended}x</span>
              </div>
              <div className="p-2.5 border border-border-hairline bg-surface-muted/40">
                <span className="text-[10px] text-muted uppercase block">Buku Dihibahkan</span>
                <span className="font-bold text-base text-foreground">{data.stats.booksDonated} Eks</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── 2B. MEJA APRESIASI KURATOR (ADMIN & KURATOR ONLY) ── */}
      {currentUser && (currentUser.role === Role.KURATOR || currentUser.role === Role.ADMIN) && (
        <section className="border-2 border-foreground bg-surface-muted/30 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-hairline pb-3">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted block">
                KEWENANGAN PENGURUS & KURATOR LAPAK
              </span>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Meja Verifikasi Hibah Buku Anggota
              </h3>
            </div>
            <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-foreground bg-foreground text-background font-bold self-start sm:self-auto">
              {currentUser.role}
            </span>
          </div>

          <form onSubmit={handleRecordDonation} className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div>
              <label className="block text-[10px] uppercase text-muted mb-1 font-bold">
                Username Anggota
              </label>
              <input
                type="text"
                placeholder="misal: pembacablora"
                value={donateTargetUsername}
                onChange={(e) => setDonateTargetUsername(e.target.value)}
                className="w-full px-3 py-2 border border-foreground bg-surface text-foreground font-mono focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-muted mb-1 font-bold">
                Jumlah Buku (Eks)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={donateCount}
                onChange={(e) => setDonateCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-foreground bg-surface text-foreground font-mono focus:outline-none"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase text-muted mb-1 font-bold">
                Catatan / Judul Hibah
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="misal: 3 novel sastra & 2 buku sejarah"
                  value={donateNote}
                  onChange={(e) => setDonateNote(e.target.value)}
                  className="w-full px-3 py-2 border border-foreground bg-surface text-foreground font-mono focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={donating}
                  className="px-4 py-2 border border-foreground bg-foreground text-background font-bold uppercase hover:bg-foreground/90 transition-colors shrink-0 disabled:opacity-50"
                >
                  {donating ? 'Mencatat...' : 'Verifikasi'}
                </button>
              </div>
            </div>
          </form>

          {donateMessage && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500 text-emerald-800 dark:text-emerald-300 font-mono text-xs flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />
              <span>{donateMessage}</span>
            </div>
          )}

          {donateError && (
            <div className="p-2.5 bg-red-500/10 border border-red-500 text-red-800 dark:text-red-300 font-mono text-xs">
              {donateError}
            </div>
          )}
        </section>
      )}

      {/* ── 3. Tab Navigation per Pilar ── */}
      <div className="flex items-center gap-1.5 border-b border-border-hairline pb-px font-mono text-xs uppercase tracking-wider overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-3.5 py-2 border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.key
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 4. Badges Grid Feed ── */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <CustomLoader size="md" label="MEMUAT POHON PENCAPAIAN..." />
        </div>
      ) : filteredBadges.length === 0 ? (
        <EmptyState
          title="Belum Ada Lencana di Kategori Ini"
          description="Lakukan aktivitas membaca, menulis naskah, atau hadir di lapak fisik untuk mulai membuka lencana."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBadges.map((item) => {
            const isEquipped = data?.equippedTitle === item.badge.titleReward;
            return (
              <article
                key={item.badge.id}
                className={cn(
                  'border p-5 flex flex-col justify-between transition-all duration-150',
                  item.earned
                    ? 'border-foreground bg-surface shadow-xs'
                    : 'border-border-hairline bg-surface-muted/30 opacity-75'
                )}
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2 font-mono text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 border border-border-hairline font-bold uppercase tracking-wider text-muted">
                        TIER {item.badge.tier || 1}
                      </span>
                      <span className="uppercase text-muted tracking-wider">
                        {item.badge.category}
                      </span>
                    </div>

                    {item.earned ? (
                      <span className="font-bold text-foreground inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> TERBUKA
                      </span>
                    ) : (
                      <span className="text-muted inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> TERKUNCI
                      </span>
                    )}
                  </div>

                  {/* Stamp & Title Header */}
                  <div className="flex items-start gap-3.5 mb-2.5">
                    <div
                      className={cn(
                        'w-11 h-11 border-2 flex items-center justify-center shrink-0 mt-0.5',
                        item.earned
                          ? 'border-foreground bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]'
                          : 'border-border-hairline bg-surface text-muted border-dashed'
                      )}
                    >
                      {getPillarIcon(item.badge.category)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-lg font-bold text-foreground leading-tight">
                        {item.badge.name}
                      </h3>
                      {item.badge.titleReward && (
                        <div className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-muted">
                          <span>Julukan:</span>
                          <span className="font-bold text-foreground underline decoration-dotted">
                            "{item.badge.titleReward}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-sans text-xs text-foreground/80 leading-relaxed mb-4">
                    {item.badge.description}
                  </p>
                </div>

                {/* Progress Bar & Actions */}
                <div className="space-y-3 pt-3 border-t border-border-hairline">
                  {/* Dynamic RPG Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-muted mb-1">
                      <span>Progres Pencapaian</span>
                      <span className="font-bold text-foreground">
                        {item.currentValue} / {item.targetValue} ({item.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 border border-foreground/40 bg-surface p-0.5">
                      <div
                        className={cn(
                          'h-full transition-all duration-300',
                          item.earned ? 'bg-foreground' : 'bg-foreground/70'
                        )}
                        style={{ width: `${Math.min(100, item.percent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Bottom Action */}
                  <div className="flex items-center justify-between pt-1 font-mono text-xs">
                    {item.earned ? (
                      <>
                        <span className="text-[10px] text-muted">
                          {item.earnedAt &&
                            `Diraih: ${new Date(item.earnedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}`}
                        </span>

                        {isEquipped ? (
                          <span className="px-2 py-0.5 border border-foreground bg-foreground text-background font-bold text-[10px] uppercase">
                            ✓ Gelar Aktif
                          </span>
                        ) : item.badge.titleReward ? (
                          <button
                            type="button"
                            disabled={equipping}
                            onClick={() => handleEquipTitle(item.badge.titleReward || null)}
                            className="text-foreground hover:underline font-bold text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
                          >
                            <span>Pasang Gelar</span> →
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-[10px] text-muted italic">
                        Kurang {Math.max(0, item.targetValue - item.currentValue)} aksi lagi untuk membuka gelar ini.
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
