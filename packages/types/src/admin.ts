export interface AdminDashboardStats {
  totalUsers: number;
  usersThisWeek: number;
  totalArticles: number;
  pendingArticles: number;
  totalBooks: number;
  availableCopies: number;
  pendingLoans: number;
  activeLoans: number;
  overdueLoans: number;
  readyPickupToday: number;
  upcomingEvents: number;
  pendingComments: number;
  pendingLetters: number;
}

export interface AdminAuditLogItem {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorUsername: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: any | null;
  after: any | null;
  createdAt: string;
}

export interface LandingFeaturedEventSetting {
  isActive: boolean;
  eventId: string | null;
  customBadge?: string | null;
  customLead?: string | null;
  showCountdown?: boolean;
}

export interface LandingTickerItem {
  id: string;
  tag: string;
  text: string;
  link?: string | null;
}

export interface LandingTickerSetting {
  isActive: boolean;
  items: LandingTickerItem[];
}

export interface LandingCfdScheduleSetting {
  isActive: boolean;
  status: 'BUKA_NORMAL' | 'PINDAH_LOKASI' | 'LIBUR_CFD' | 'EDISI_KHUSUS';
  badgeText: string;
  note: string;
  alertNotice?: string | null;
}

export interface LandingSettings {
  featuredEvent: LandingFeaturedEventSetting;
  ticker: LandingTickerSetting;
  cfdSchedule: LandingCfdScheduleSetting;
}

export interface LandingFeaturedEventData {
  id: string;
  title: string;
  slug: string;
  type: string;
  descriptionPlain?: string;
  coverImage?: string | null;
  startAt: string;
  endAt: string;
  locationName: string;
  locationDetail?: string | null;
  quota?: number | null;
  registeredCount?: number;
  status: string;
}

export interface LandingPublicConfigResponse {
  settings: LandingSettings;
  featuredEventData?: LandingFeaturedEventData | null;
}

export const DEFAULT_LANDING_SETTINGS: LandingSettings = {
  featuredEvent: {
    isActive: false,
    eventId: null,
    customBadge: 'MAKLUMAT RESMI REDAKSI // EDISI KHUSUS',
    customLead: 'Agenda akbar literasi komunitas swadaya Blora terbuka untuk seluruh warga.',
    showCountdown: true,
  },
  ticker: {
    isActive: true,
    items: [
      {
        id: 't-1',
        tag: 'LAPAK RUTIN',
        text: 'Lesehan Terpal Setiap Minggu Pagi (CFD Alun-Alun Blora 06.00–10.00 WIB)',
        link: '/kegiatan',
      },
      {
        id: 't-2',
        tag: 'KOLEKSI BARU',
        text: '30 Eksemplar Pustaka Sastra & Catatan Sejarah Lokal Baru Saja Masuk ke Terpal',
        link: '/buku',
      },
      {
        id: 't-3',
        tag: 'WARTA WARGA',
        text: 'Ruang Redaksi Terbuka — Siapa Saja Boleh Menulis Ulasan dan Opini Bebas Sensor',
        link: '/tulis',
      },
      {
        id: 't-4',
        tag: 'PRINSIP KOMUNITAS',
        text: '“Membaca dan Berbahagia” — Tanpa Uang Jaminan, Tanpa Denda Rupiah Seumur Hidup',
        link: '/tentang',
      },
    ],
  },
  cfdSchedule: {
    isActive: true,
    status: 'BUKA_NORMAL',
    badgeText: 'MINGGU 06.00–10.00 WIB // ALUN-ALUN BLORA',
    note: 'Lapak Terbuka: Setiap Minggu 06.00–10.00 WIB di hamparan terpal trotoar Alun-Alun Blora.',
    alertNotice: null,
  },
};
