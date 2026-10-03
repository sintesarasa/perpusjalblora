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
  ChevronDown,
  Check,
  Info,
  HelpCircle,
  ExternalLink,
  Layers,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { UserBadgeListResponse, BadgeCategory, Role, UserBadgeProgress } from '@perpusjal/types';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { CustomLoader } from '@/components/ui/custom-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { BadgeInsignia } from '@/components/gamification/badge-insignia';

const PILLAR_CONFIG: Record<
  BadgeCategory,
  {
    name: string;
    subtitle: string;
    description: string;
    actionMetric: string;
    icon: any;
  }
> = {
  [BadgeCategory.WACANA]: {
    name: 'Pilar Wacana',
    subtitle: 'Membaca Artikel Pustaka & Opini Publik',
    description:
      'Dihitung dari pembacaan artikel unik secara utuh (minimal 10-15 detik durasi baca). Membaca ulang artikel yang sama atau artikel buatan sendiri tidak dihitung berulang.',
    actionMetric: 'Artikel Unik Dibaca',
    icon: BookOpen,
  },
  [BadgeCategory.TINTA]: {
    name: 'Pilar Tinta',
    subtitle: 'Menulis Karya & Suara Warga Terbit',
    description:
      'Dihitung dari karya tulisan, esai, atau opini reflektif yang berhasil lolos meja kurasi redaksi Perpusjal dan dipublikasikan ke publik.',
    actionMetric: 'Karya Terbit',
    icon: Feather,
  },
  [BadgeCategory.DIALEKTIKA]: {
    name: 'Pilar Dialektika',
    subtitle: 'Komentar Tanggapan & Diskusi Bernas',
    description:
      'Dihitung dari komentar dan tanggapan berbobot yang Anda kirimkan pada artikel di ruang wacana publik demi merawat nalar kritis bersama.',
    actionMetric: 'Komentar Dipublikasikan',
    icon: MessageSquare,
  },
  [BadgeCategory.AMANAH]: {
    name: 'Pilar Amanah',
    subtitle: 'Peminjaman Buku & Streak Tepat Waktu',
    description:
      'Dihitung dari peminjaman buku fisik dan rentetan pengembalian buku tepat waktu tanpa melewati batas tenggat pengembalian.',
    actionMetric: 'Streak Tepat Waktu',
    icon: ShieldCheck,
  },
  [BadgeCategory.PRESENSI]: {
    name: 'Pilar Presensi',
    subtitle: 'Kehadiran Lapak Fisik & Temu Komunitas',
    description:
      'Dihitung dari kehadiran nyata Anda di lapak baca mingguan di alun-alun, taman kota, atau agenda temu literasi yang digelar Perpusjal.',
    actionMetric: 'Kehadiran Terverifikasi',
    icon: Calendar,
  },
  [BadgeCategory.DONATUR]: {
    name: 'Pilar Donatur',
    subtitle: 'Hibah Buku Fisik untuk Rakyat',
    description:
      'Dihitung dari jumlah buku fisik layak baca yang Anda hibahkan ke koleksi lapak terbuka dan diverifikasi oleh kurator relawan.',
    actionMetric: 'Buku Fisik Dihibahkan',
    icon: Gift,
  },
  [BadgeCategory.GENERAL]: {
    name: 'Pilar Khusus',
    subtitle: 'Penghargaan Kearsipan Khusus',
    description: 'Lencana kehormatan khusus dan tonggak sejarah keanggotaan.',
    actionMetric: 'Pencapaian Khusus',
    icon: Award,
  },
};

export default function DashboardBadgesPage() {
  const { user: currentUser } = useAuth();
  const [data, setData] = React.useState<UserBadgeListResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<'PILLARS' | 'GRID'>('PILLARS');
  const [filterPillar, setFilterPillar] = React.useState<string>('ALL');
  const [filterStatus, setFilterStatus] = React.useState<'ALL' | 'EARNED' | 'LOCKED'>('ALL');
  const [showHandbook, setShowHandbook] = React.useState(false);
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
        setEquipMessage(
          title ? `Gelar kehormatan "${title}" berhasil disematkan ke akunmu!` : 'Gelar kehormatan telah dilepas.'
        );
        setTimeout(() => setEquipMessage(null), 3500);
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
      setDonateMessage(`Berhasil memverifikasi ${donateCount} buku donasi untuk @${donateTargetUsername}!`);
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

  // Group badges by Pillar (Category)
  const pillarsList = [
    BadgeCategory.WACANA,
    BadgeCategory.TINTA,
    BadgeCategory.DIALEKTIKA,
    BadgeCategory.AMANAH,
    BadgeCategory.PRESENSI,
    BadgeCategory.DONATUR,
  ];

  const badgesByPillar = React.useMemo(() => {
    if (!data?.badges) return {};
    const map: Record<string, UserBadgeProgress[]> = {};
    for (const b of data.badges) {
      const cat = b.badge.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(b);
    }
    // Sort each pillar ascending by tier
    for (const cat in map) {
      map[cat].sort((a, b) => a.badge.tier - b.badge.tier);
    }
    return map;
  }, [data?.badges]);

  // Filtered Badges for Grid mode
  const filteredBadges = (data?.badges || []).filter((b) => {
    if (filterPillar !== 'ALL' && b.badge.category !== filterPillar) return false;
    if (filterStatus === 'EARNED' && !b.earned) return false;
    if (filterStatus === 'LOCKED' && b.earned) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-6xl">
      {/* ── 1. Masthead ── */}
      <div className="border-b-2 border-foreground pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-widest">
            <span>PASPOR APRESIASI ANGGOTA</span>
            <span>// POHON PENCAPAIAN PERPUSJAL</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Lencana & Julukan Kehormatan
          </h1>
          <p className="font-sans text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
            Sistem pengakuan atas kontribusi nyata merawat literasi rakyat Blora: dari membaca wacana kritis, menulis warta warga, menjaga amanah pinjaman buku, hingga menggelar lapak terbuka.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowHandbook(!showHandbook)}
            className="px-3 py-2 border-2 border-foreground bg-surface hover:bg-surface-muted font-mono text-xs font-bold uppercase tracking-wider text-foreground inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-foreground" />
            <span>{showHandbook ? 'Tutup Panduan' : 'Buku Panduan & Aturan'}</span>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showHandbook && 'rotate-180')} />
          </button>

          {data && (
            <span className="px-3.5 py-2 border-2 border-foreground bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider shadow-xs">
              {data.earnedCount} / {data.totalCount} Lencana Terbuka
            </span>
          )}
        </div>
      </div>

      {/* ── 2. Petunjuk Jelas & Panduan Sistem (Collapsible Handbook) ── */}
      {showHandbook && (
        <section className="border-2 border-foreground bg-surface p-5 sm:p-7 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.95)] animate-in fade-in-50 duration-150 space-y-6">
          <div className="border-b border-border-hairline pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-foreground" />
              <h2 className="font-serif text-xl font-bold text-foreground">
                Buku Panduan Sistem Apresiasi & Paspor Kehormatan
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold text-muted tracking-wider">
              EDISI III &bull; 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs sm:text-sm">
            {/* Kolom 1: Filosofi 6 Pilar */}
            <div className="space-y-2 p-3.5 border border-border-hairline bg-surface-muted/30">
              <div className="flex items-center gap-1.5 text-foreground font-serif font-bold text-sm">
                <BookOpen className="w-4 h-4 text-foreground" />
                <h3>1. Enam Pilar Literasi</h3>
              </div>
              <p className="text-muted leading-relaxed text-xs">
                Apresiasi di Perpusjal tidak hanya dinilai dari uang atau pangkat, melainkan aksi nyata dalam 6 pilar:
              </p>
              <ul className="text-xs text-foreground/80 space-y-1 list-disc list-inside">
                <li><strong>Wacana:</strong> Membaca artikel arsip secara tuntas.</li>
                <li><strong>Tinta:</strong> Menulis naskah yang lolos kurasi publik.</li>
                <li><strong>Dialektika:</strong> Memberikan komentar bernas dan sehat.</li>
                <li><strong>Amanah:</strong> Mengembalikan buku fisik tepat waktu.</li>
                <li><strong>Presensi:</strong> Hadir di lapak baca fisik & diskusi.</li>
                <li><strong>Donatur:</strong> Menghibahkan buku fisik untuk warga.</li>
              </ul>
            </div>

            {/* Kolom 2: Hirarki 6 Tier & Gelar */}
            <div className="space-y-2 p-3.5 border border-border-hairline bg-surface-muted/30">
              <div className="flex items-center gap-1.5 text-foreground font-serif font-bold text-sm">
                <Award className="w-4 h-4 text-foreground" />
                <h3>2. Hirarki Kemahiran (Tier I - VI)</h3>
              </div>
              <p className="text-muted leading-relaxed text-xs">
                Setiap pilar memiliki 6 tingkatan yang dirancang bertahap dari pemula hingga legenda:
              </p>
              <ul className="text-xs text-foreground/80 space-y-1 list-disc list-inside">
                <li><strong>Tier I: Perintis</strong> (Membuktikan inisiasi awal).</li>
                <li><strong>Tier II: Penjelajah / Kawan</strong> (Konsistensi awal).</li>
                <li><strong>Tier III: Penggerak / Penjaga</strong> (Aktif & tangguh).</li>
                <li><strong>Tier IV: Kolumnis / Benteng</strong> (Kader teruji).</li>
                <li><strong>Tier V: Mpu / Resi</strong> (Tokoh inspirasi nalar).</li>
                <li><strong>Tier VI: Begawan / Legenda</strong> (Sosok teladan sejati).</li>
              </ul>
            </div>

            {/* Kolom 3: Cara Kerja Gelar Publik & Anti-Spam */}
            <div className="space-y-2 p-3.5 border border-border-hairline bg-surface-muted/30">
              <div className="flex items-center gap-1.5 text-foreground font-serif font-bold text-sm">
                <Sparkles className="w-4 h-4 text-foreground" />
                <h3>3. Gelar Publik & Kejujuran</h3>
              </div>
              <p className="text-muted leading-relaxed text-xs">
                Setiap lencana membuka satu <strong>Julukan Kehormatan</strong>. Anda dapat memilih gelar aktif di kartu identitas di bawah. Gelar ini akan <strong>terpampang mencolok</strong> di samping nama Anda saat menulis naskah dan berkomentar.
              </p>
              <p className="text-muted leading-relaxed text-xs border-t border-border-hairline pt-2">
                <strong>Integritas Anti-Spam:</strong> Pembacaan artikel dihitung berdasarkan durasi baca wajar dan artikel unik (membaca ulang artikel yang sama berulang kali tidak melipatgandakan progres).
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. Player Dossier Card (Status Gelar Utama & Statistik Diri) ── */}
      {data && (
        <section className="border-2 border-foreground bg-surface p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-foreground pb-4">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted block">
                PASPOR KEHORMATAN &bull; IDENTITAS RESMI
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                  {data.equippedTitle ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-amber-500">✦</span>
                      <span>"{data.equippedTitle}"</span>
                    </span>
                  ) : (
                    'Belum Memasang Gelar Utama'
                  )}
                </h2>
              </div>
              <p className="font-sans text-xs text-muted max-w-xl">
                Gelar ini terpampang di samping namamu saat menulis komentar, menerbitkan warta/esai, dan pada kartu profil paspor publik.
              </p>
            </div>

            {/* Title Selector */}
            <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
                Pilih Gelar Utama ({data.availableTitles.length} Terbuka)
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  disabled={equipping || data.availableTitles.length === 0}
                  value={data.equippedTitle || ''}
                  onChange={(e) => handleEquipTitle(e.target.value || null)}
                  className="font-mono text-xs px-3 py-2 border-2 border-foreground bg-surface text-foreground font-bold disabled:opacity-50 cursor-pointer focus:outline-none w-full sm:w-64"
                >
                  <option value="">-- Tanpa Gelar Utama --</option>
                  {data.availableTitles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
                {data.equippedTitle && (
                  <button
                    type="button"
                    disabled={equipping}
                    onClick={() => handleEquipTitle(null)}
                    className="px-2.5 py-2 border border-border-hairline hover:border-foreground text-muted hover:text-foreground text-xs font-mono"
                    title="Lepas Gelar"
                  >
                    Lepas
                  </button>
                )}
              </div>
            </div>
          </div>

          {equipMessage && (
            <div className="p-3 bg-foreground text-background font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in-50">
              <Check className="w-4 h-4 shrink-0" />
              <span>{equipMessage}</span>
            </div>
          )}

          {/* Quick Stats Grid */}
          {data.stats && (
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted font-bold block mb-2">
                REKAM JEJAK AKTIVITAS ANGGOTA
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 font-mono text-xs">
                <div className="p-3 border-2 border-border-hairline bg-surface-muted/30">
                  <span className="text-[9.5px] text-muted uppercase block font-semibold">Artikel Dibaca</span>
                  <span className="font-bold text-lg text-foreground">{data.stats.articlesRead} Unik</span>
                </div>
                <div className="p-3 border-2 border-border-hairline bg-surface-muted/30">
                  <span className="text-[9.5px] text-muted uppercase block font-semibold">Karya Terbit</span>
                  <span className="font-bold text-lg text-foreground">{data.stats.articlesPublished} Naskah</span>
                </div>
                <div className="p-3 border-2 border-border-hairline bg-surface-muted/30">
                  <span className="text-[9.5px] text-muted uppercase block font-semibold">Komentar Bernas</span>
                  <span className="font-bold text-lg text-foreground">{data.stats.commentsCount} Diskusi</span>
                </div>
                <div className="p-3 border-2 border-border-hairline bg-surface-muted/30">
                  <span className="text-[9.5px] text-muted uppercase block font-semibold">Streak Tepat Waktu</span>
                  <span className="font-bold text-lg text-foreground">{data.stats.onTimeStreak}x Beruntun</span>
                </div>
                <div className="p-3 border-2 border-border-hairline bg-surface-muted/30">
                  <span className="text-[9.5px] text-muted uppercase block font-semibold">Hadir Lapak Fisik</span>
                  <span className="font-bold text-lg text-foreground">{data.stats.eventsAttended} Agenda</span>
                </div>
                <div className="p-3 border-2 border-border-hairline bg-surface-muted/30">
                  <span className="text-[9.5px] text-muted uppercase block font-semibold">Buku Dihibahkan</span>
                  <span className="font-bold text-lg text-foreground">{data.stats.booksDonated} Eks</span>
                </div>
              </div>
            </div>
          )}

          {currentUser?.username && (
            <div className="pt-1 flex items-center justify-between text-xs font-mono">
              <span className="text-muted">
                Profil Publik: <strong className="text-foreground">/u/{currentUser.username}</strong>
              </span>
              <Link
                href={`/u/${currentUser.username}`}
                className="text-foreground hover:underline font-bold inline-flex items-center gap-1 uppercase tracking-wider text-[11px]"
              >
                <span>Lihat Tampilan Paspor Publik Anda</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ── 4. MEJA VERIFIKASI KURATOR (ADMIN & KURATOR ONLY) ── */}
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

      {/* ── 5. View Mode Switcher & Filter Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-foreground pb-3 font-mono text-xs">
        {/* Toggle Mode: Linear Tree per Pilar vs Katalog Grid */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('PILLARS')}
            className={cn(
              'px-3 py-1.5 border-2 transition-all font-bold uppercase tracking-wider',
              viewMode === 'PILLARS'
                ? 'border-foreground bg-foreground text-background shadow-xs'
                : 'border-border-hairline bg-surface text-muted hover:border-foreground hover:text-foreground'
            )}
          >
            Peta 6 Pilar (Linear Tier I-VI)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('GRID')}
            className={cn(
              'px-3 py-1.5 border-2 transition-all font-bold uppercase tracking-wider',
              viewMode === 'GRID'
                ? 'border-foreground bg-foreground text-background shadow-xs'
                : 'border-border-hairline bg-surface text-muted hover:border-foreground hover:text-foreground'
            )}
          >
            Katalog Seluruh Lencana (Kisi)
          </button>
        </div>

        {/* Filter Controls for Grid Mode */}
        {viewMode === 'GRID' && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterPillar}
              onChange={(e) => setFilterPillar(e.target.value)}
              className="px-2.5 py-1.5 border border-foreground bg-surface text-foreground font-mono text-xs focus:outline-none"
            >
              <option value="ALL">Semua Pilar</option>
              {pillarsList.map((cat) => (
                <option key={cat} value={cat}>
                  {PILLAR_CONFIG[cat]?.name || cat}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-1.5 border border-foreground bg-surface text-foreground font-mono text-xs focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="EARNED">Hanya Terbuka</option>
              <option value="LOCKED">Hanya Terkunci</option>
            </select>
          </div>
        )}
      </div>

      {/* ── 6. BADGES DISPLAY ── */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <CustomLoader size="md" label="MEMUAT POHON PENCAPAIAN PERPUSJAL..." />
        </div>
      ) : viewMode === 'PILLARS' ? (
        /* ═════════════════════════════════════════════════════════
           MODE 1: POHON 6 PILAR (LINEAR JOURNEY TIER I S/D VI)
           ═════════════════════════════════════════════════════════ */
        <div className="space-y-10">
          {pillarsList.map((cat) => {
            const pillarCfg = PILLAR_CONFIG[cat];
            const badgesInPillar = badgesByPillar[cat] || [];
            const earnedInPillar = badgesInPillar.filter((b) => b.earned).length;
            const PillarIcon = pillarCfg.icon;

            return (
              <section
                key={cat}
                className="border-2 border-foreground bg-surface p-5 sm:p-7 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] space-y-6"
              >
                {/* Pillar Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-foreground pb-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 border-2 border-foreground bg-surface flex items-center justify-center shrink-0 shadow-xs">
                      <PillarIcon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-muted font-bold">
                          PILAR KEHORMATAN
                        </span>
                        <span className="text-border-hairline">//</span>
                        <span className="font-mono text-[9px] uppercase font-bold text-foreground">
                          {pillarCfg.actionMetric}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                        {pillarCfg.name}
                      </h3>
                      <p className="font-sans text-xs text-muted max-w-xl">
                        {pillarCfg.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs shrink-0 self-start sm:self-auto">
                    <span className="px-2.5 py-1 border border-foreground bg-foreground text-background font-bold uppercase tracking-wider text-[11px]">
                      {earnedInPillar} / {badgesInPillar.length} Tier Terbuka
                    </span>
                  </div>
                </div>

                {/* 6 Linear Tier Grid (Tier I to VI) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
                  {badgesInPillar.map((item) => {
                    const isEquipped = data?.equippedTitle === item.badge.titleReward;
                    return (
                      <div
                        key={item.badge.id}
                        className={cn(
                          'border-2 p-3.5 flex flex-col justify-between transition-all duration-150 relative',
                          item.earned
                            ? 'border-foreground bg-surface shadow-xs'
                            : 'border-border-hairline bg-surface-muted/20 opacity-80 border-dashed'
                        )}
                      >
                        <div>
                          {/* Tier & Status Bar */}
                          <div className="flex items-center justify-between font-mono text-[9px] pb-2 border-b border-border-hairline mb-2.5">
                            <span className="font-bold text-muted uppercase tracking-wider">
                              TIER {item.badge.tier}
                            </span>
                            {item.earned ? (
                              <span className="font-bold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> DIRAIH
                              </span>
                            ) : (
                              <span className="text-muted inline-flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> TERKUNCI
                              </span>
                            )}
                          </div>

                          {/* Bespoke Badge Insignia */}
                          <div className="flex justify-center py-1 mb-2">
                            <BadgeInsignia
                              code={item.badge.code}
                              tier={item.badge.tier}
                              category={item.badge.category}
                              earned={item.earned}
                              size="md"
                            />
                          </div>

                          {/* Badge Name & Title */}
                          <div className="text-center space-y-0.5 mb-2">
                            <h4 className="font-serif font-bold text-sm text-foreground leading-snug">
                              {item.badge.name}
                            </h4>
                            {item.badge.titleReward && (
                              <span className="font-mono text-[9.5px] font-bold text-muted block">
                                "{item.badge.titleReward}"
                              </span>
                            )}
                          </div>

                          {/* Requirement / Description */}
                          <p className="font-sans text-[11px] text-muted text-center leading-relaxed mb-3">
                            {item.badge.description}
                          </p>
                        </div>

                        {/* Progress Bar & Actions */}
                        <div className="pt-2 border-t border-border-hairline space-y-2">
                          <div>
                            <div className="flex items-center justify-between font-mono text-[9px] text-muted mb-1">
                              <span>Progres</span>
                              <span className="font-bold text-foreground">
                                {item.currentValue} / {item.targetValue}
                              </span>
                            </div>
                            <div className="w-full h-2 border border-foreground/30 bg-surface p-0.5">
                              <div
                                className={cn(
                                  'h-full transition-all duration-300',
                                  item.earned ? 'bg-foreground' : 'bg-foreground/60'
                                )}
                                style={{ width: `${Math.min(100, item.percent)}%` }}
                              />
                            </div>
                          </div>

                          {/* Bottom Action Button */}
                          <div className="text-center font-mono">
                            {item.earned ? (
                              isEquipped ? (
                                <span className="w-full py-1 border border-foreground bg-foreground text-background font-bold text-[9px] uppercase tracking-wider block">
                                  ✓ Gelar Aktif
                                </span>
                              ) : item.badge.titleReward ? (
                                <button
                                  type="button"
                                  disabled={equipping}
                                  onClick={() => handleEquipTitle(item.badge.titleReward || null)}
                                  className="w-full py-1 border border-foreground hover:bg-foreground hover:text-background font-bold text-[9px] uppercase tracking-wider transition-colors block"
                                >
                                  Pasang Gelar
                                </button>
                              ) : null
                            ) : (
                              <span className="text-[9px] text-muted italic block">
                                Kurang {Math.max(0, item.targetValue - item.currentValue)} lagi
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* ═════════════════════════════════════════════════════════
           MODE 2: KISI SELURUH LENCANA (CODEX GRID VIEW)
           ═════════════════════════════════════════════════════════ */
        <div>
          {filteredBadges.length === 0 ? (
            <EmptyState
              title="Tidak Ada Lencana yang Sesuai Filter"
              description="Coba ubah filter pilar atau status lencana di bagian atas."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBadges.map((item) => {
                const isEquipped = data?.equippedTitle === item.badge.titleReward;
                return (
                  <article
                    key={item.badge.id}
                    className={cn(
                      'border-2 p-4 flex flex-col justify-between transition-all duration-150',
                      item.earned
                        ? 'border-foreground bg-surface shadow-xs'
                        : 'border-border-hairline bg-surface-muted/20 opacity-80 border-dashed'
                    )}
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between font-mono text-[10px] pb-2 border-b border-border-hairline mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 border border-border-hairline font-bold uppercase tracking-wider text-muted">
                            TIER {item.badge.tier}
                          </span>
                          <span className="uppercase text-muted tracking-wider font-semibold">
                            {item.badge.category}
                          </span>
                        </div>

                        {item.earned ? (
                          <span className="font-bold text-foreground inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> DIRAIH
                          </span>
                        ) : (
                          <span className="text-muted inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" /> TERKUNCI
                          </span>
                        )}
                      </div>

                      {/* Insignia + Meta Header */}
                      <div className="flex items-start gap-3.5 mb-3">
                        <BadgeInsignia
                          code={item.badge.code}
                          tier={item.badge.tier}
                          category={item.badge.category}
                          earned={item.earned}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif text-base font-bold text-foreground leading-tight">
                            {item.badge.name}
                          </h4>
                          {item.badge.titleReward && (
                            <span className="font-mono text-[10.5px] font-bold text-muted block mt-0.5">
                              Julukan: "{item.badge.titleReward}"
                            </span>
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
                      <div>
                        <div className="flex items-center justify-between font-mono text-[10px] text-muted mb-1">
                          <span>Progres Target</span>
                          <span className="font-bold text-foreground">
                            {item.currentValue} / {item.targetValue} ({item.percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 border border-foreground/30 bg-surface p-0.5">
                          <div
                            className={cn(
                              'h-full transition-all duration-300',
                              item.earned ? 'bg-foreground' : 'bg-foreground/70'
                            )}
                            style={{ width: `${Math.min(100, item.percent)}%` }}
                          />
                        </div>
                      </div>

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
                            Kurang {Math.max(0, item.targetValue - item.currentValue)} lagi untuk membuka lencana ini.
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
      )}
    </div>
  );
}
