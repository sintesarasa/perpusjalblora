export interface TierInfo {
  tier: number;
  name: string;
  metal: string;
  badgeTagClass: string;
  honorBadgeClass: string;
  insigniaClass: string;
  borderClass: string;
  pillClass: string;
  headerTagClass: string;
  progressBarClass: string;
  cardEarnedBg: string;
  cardLockedBorder: string;
  hex: string;
}

export const TIER_CONFIG: Record<number, TierInfo> = {
  1: {
    tier: 1,
    name: 'Batu Cadas',
    metal: 'Giok Cadas',
    badgeTagClass:
      'bg-emerald-700 text-white border border-emerald-600 shadow-xs font-bold dark:bg-emerald-600 dark:border-emerald-500',
    honorBadgeClass:
      'bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-600 shadow-xs font-bold dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:border-emerald-500',
    insigniaClass:
      'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/80 dark:text-emerald-200',
    borderClass: 'border-emerald-600 dark:border-emerald-400',
    pillClass: 'bg-emerald-700 text-white border-emerald-600 font-bold',
    headerTagClass:
      'bg-emerald-700 text-white border-emerald-600 font-bold dark:bg-emerald-600 dark:border-emerald-500',
    progressBarClass: 'bg-emerald-600 dark:bg-emerald-400',
    cardEarnedBg:
      'bg-surface border-2 border-emerald-600 dark:border-emerald-400 shadow-xs',
    cardLockedBorder:
      'border-emerald-600/30 dark:border-emerald-500/30 bg-surface/50 hover:border-emerald-600 dark:hover:border-emerald-400',
    hex: '#059669',
  },
  2: {
    tier: 2,
    name: 'Perunggu',
    metal: 'Tembaga Kuno',
    badgeTagClass:
      'bg-orange-600 text-white border border-orange-500 shadow-xs font-bold dark:bg-orange-500 dark:border-orange-400',
    honorBadgeClass:
      'bg-orange-600 hover:bg-orange-700 text-white border border-orange-500 shadow-xs font-bold dark:bg-orange-500 dark:hover:bg-orange-400 dark:border-orange-400',
    insigniaClass:
      'border-orange-600 bg-orange-50 text-orange-800 dark:border-orange-400 dark:bg-orange-950/80 dark:text-orange-200',
    borderClass: 'border-orange-600 dark:border-orange-500',
    pillClass: 'bg-orange-600 text-white border-orange-500 font-bold',
    headerTagClass:
      'bg-orange-600 text-white border-orange-500 font-bold dark:bg-orange-500 dark:border-orange-400',
    progressBarClass: 'bg-orange-600 dark:bg-orange-500',
    cardEarnedBg:
      'bg-surface border-2 border-orange-600 dark:border-orange-500 shadow-xs',
    cardLockedBorder:
      'border-orange-600/30 dark:border-orange-500/30 bg-surface/50 hover:border-orange-600 dark:hover:border-orange-500',
    hex: '#EA580C',
  },
  3: {
    tier: 3,
    name: 'Biru Baja',
    metal: 'Baja Tinta',
    badgeTagClass:
      'bg-sky-600 text-white border border-sky-500 shadow-xs font-bold dark:bg-sky-500 dark:border-sky-400',
    honorBadgeClass:
      'bg-sky-600 hover:bg-sky-700 text-white border border-sky-500 shadow-xs font-bold dark:bg-sky-500 dark:hover:bg-sky-400 dark:border-sky-400',
    insigniaClass:
      'border-sky-600 bg-sky-50 text-sky-800 dark:border-sky-400 dark:bg-sky-950/80 dark:text-sky-200',
    borderClass: 'border-sky-600 dark:border-sky-400',
    pillClass: 'bg-sky-600 text-white border-sky-500 font-bold',
    headerTagClass:
      'bg-sky-600 text-white border-sky-500 font-bold dark:bg-sky-500 dark:border-sky-400',
    progressBarClass: 'bg-sky-600 dark:bg-sky-400',
    cardEarnedBg:
      'bg-surface border-2 border-sky-600 dark:border-sky-400 shadow-xs',
    cardLockedBorder:
      'border-sky-600/30 dark:border-sky-500/30 bg-surface/50 hover:border-sky-600 dark:hover:border-sky-400',
    hex: '#0284C7',
  },
  4: {
    tier: 4,
    name: 'Perak',
    metal: 'Perak Sterling',
    badgeTagClass:
      'bg-slate-700 text-white border border-slate-500 shadow-xs font-bold dark:bg-slate-300 dark:text-slate-950 dark:border-slate-400',
    honorBadgeClass:
      'bg-slate-700 hover:bg-slate-800 text-white border border-slate-500 shadow-xs font-bold dark:bg-slate-300 dark:hover:bg-white dark:text-slate-950 dark:border-slate-400',
    insigniaClass:
      'border-slate-500 bg-slate-100 text-slate-800 ring-1 ring-slate-300 dark:border-slate-300 dark:bg-slate-800 dark:text-slate-100',
    borderClass: 'border-slate-500 dark:border-slate-300',
    pillClass: 'bg-slate-700 text-white border-slate-500 font-bold',
    headerTagClass:
      'bg-slate-700 text-white border-slate-500 font-bold dark:bg-slate-300 dark:text-slate-950 dark:border-slate-400',
    progressBarClass: 'bg-slate-600 dark:bg-slate-300',
    cardEarnedBg:
      'bg-surface border-2 border-slate-500 dark:border-slate-300 shadow-xs',
    cardLockedBorder:
      'border-slate-400/40 dark:border-slate-500/30 bg-surface/50 hover:border-slate-600 dark:hover:border-slate-300',
    hex: '#64748B',
  },
  5: {
    tier: 5,
    name: 'Kecubung',
    metal: 'Kecubung Wulung',
    badgeTagClass:
      'bg-purple-700 text-white border border-purple-600 shadow-xs font-bold dark:bg-purple-600 dark:border-purple-400',
    honorBadgeClass:
      'bg-purple-700 hover:bg-purple-800 text-white border border-purple-600 shadow-xs font-bold dark:bg-purple-600 dark:hover:bg-purple-500 dark:border-purple-400',
    insigniaClass:
      'border-purple-600 bg-purple-50 text-purple-800 dark:border-purple-400 dark:bg-purple-950/80 dark:text-purple-200',
    borderClass: 'border-purple-600 dark:border-purple-400',
    pillClass: 'bg-purple-700 text-white border-purple-600 font-bold',
    headerTagClass:
      'bg-purple-700 text-white border-purple-600 font-bold dark:bg-purple-600 dark:border-purple-400',
    progressBarClass: 'bg-purple-600 dark:bg-purple-400',
    cardEarnedBg:
      'bg-surface border-2 border-purple-600 dark:border-purple-400 shadow-xs',
    cardLockedBorder:
      'border-purple-600/30 dark:border-purple-500/30 bg-surface/50 hover:border-purple-600 dark:hover:border-purple-400',
    hex: '#9333EA',
  },
  6: {
    tier: 6,
    name: 'Emas Kencana',
    metal: 'Emas Kencana 24K',
    badgeTagClass:
      'bg-amber-400 text-slate-950 border border-amber-500 shadow-sm font-black ring-1 ring-amber-300/80 dark:bg-yellow-400 dark:text-slate-950 dark:border-yellow-500 dark:ring-yellow-300',
    honorBadgeClass:
      'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 shadow-sm font-black ring-1 ring-amber-300/80 dark:bg-yellow-400 dark:hover:bg-yellow-300 dark:text-slate-950 dark:border-yellow-500 dark:ring-yellow-300',
    insigniaClass:
      'border-amber-600 bg-amber-100 text-amber-950 ring-2 ring-amber-400/60 dark:border-yellow-400 dark:bg-yellow-950/90 dark:text-yellow-200 dark:ring-yellow-400/60',
    borderClass: 'border-amber-600 dark:border-yellow-400',
    pillClass: 'bg-amber-400 text-slate-950 border-amber-500 font-black',
    headerTagClass:
      'bg-amber-400 text-slate-950 border-amber-500 font-black shadow-sm dark:bg-yellow-400 dark:text-slate-950 dark:border-yellow-500',
    progressBarClass: 'bg-gradient-to-r from-amber-600 to-yellow-500 dark:from-yellow-400 dark:to-amber-400',
    cardEarnedBg:
      'bg-surface border-2 border-amber-600 dark:border-yellow-400 shadow-xs',
    cardLockedBorder:
      'border-amber-500/40 dark:border-yellow-500/30 bg-surface/50 hover:border-amber-600 dark:hover:border-yellow-400',
    hex: '#D97706',
  },
};

export function getTierInfo(tier: number = 1): TierInfo {
  return TIER_CONFIG[tier] || TIER_CONFIG[1];
}

/**
 * Fallback mapping from official titleReward strings to their respective Tier number.
 * Guarantees correct tier color and insignia even if badge objects are not provided.
 */
export const TITLE_TO_TIER_MAP: Record<string, number> = {
  // Tier 1
  'Perintis Lembaran': 1,
  'Pena Perdana': 1,
  'Pemberi Suara': 1,
  'Penjelajah Rak': 1,
  'Penyapa Lapak': 1,
  'Penyemai Benih': 1,

  // Tier 2
  'Penjelajah Wacana': 2,
  'Pencatat Realitas': 2,
  'Teman Berbincang': 2,
  'Pemegang Janji': 2,
  'Kawan Kumpul': 2,
  'Kawan Berderma': 2,

  // Tier 3
  'Kutu Buku Lapak': 3,
  'Wartawan Rakyat': 3,
  'Penjaga Logika': 3,
  'Penjaga Amanah': 3,
  'Penggerak Lapak': 3,
  'Donatur Setia': 3,

  // Tier 4
  'Pelahap Aksara': 4,
  'Kolumnis Garis Depan': 4,
  'Juru Debat Lapak': 4,
  'Benteng Integritas': 4,
  'Garda Gelaran': 4,
  'Pembangun Rak': 4,

  // Tier 5
  'Resi Pustaka': 5,
  'Mpu Gubahan': 5,
  'Penjaga Dialektika': 5,
  'Ksatria Pustaka': 5,
  'Saksi Sejarah': 5,
  'Penyokong Pustaka': 5,

  // Tier 6
  'Begawan Sastra': 6,
  'Pujangga Arus Bawah': 6,
  'Mursyid Diskusi': 6,
  'Wali Amanah Buku': 6,
  'Jiwa Perpusjal': 6,
  'Bapak/Ibu Asuh Pustaka': 6,

  // Secret Badges
  'Kelana Malam': 2,
  'Penyulut Nalar': 3,
  'Pena Pilihan': 5,
};

export function inferTierFromTitle(title?: string | null): number {
  if (!title) return 1;
  return TITLE_TO_TIER_MAP[title] || 1;
}
