export enum BadgeCriteria {
  ARTICLES_READ = 'ARTICLES_READ',
  ARTICLES_PUBLISHED = 'ARTICLES_PUBLISHED',
  COMMENTS_PUBLISHED = 'COMMENTS_PUBLISHED',
  EVENTS_ATTENDED = 'EVENTS_ATTENDED',
  LOANS_RETURNED = 'LOANS_RETURNED',
  ONTIME_STREAK = 'ONTIME_STREAK',
  ACCOUNT_AGE_DAYS = 'ACCOUNT_AGE_DAYS',
  BOOKS_DONATED = 'BOOKS_DONATED',
  MANUAL = 'MANUAL',
}

export enum BadgeCategory {
  WACANA = 'WACANA',
  TINTA = 'TINTA',
  DIALEKTIKA = 'DIALEKTIKA',
  AMANAH = 'AMANAH',
  PRESENSI = 'PRESENSI',
  DONATUR = 'DONATUR',
  GENERAL = 'GENERAL',
}

export interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName: string;
  criteriaType: BadgeCriteria;
  criteriaValue: number;
  tier: number;
  category: string;
  titleReward?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserBadgeProgress {
  badge: BadgeItem;
  earned: boolean;
  earnedAt?: string | null;
  currentValue: number;
  targetValue: number;
  percent: number;
}

export interface UserBadgeListResponse {
  earnedCount: number;
  totalCount: number;
  equippedTitle?: string | null;
  equippedBadge?: { code: string; name: string; titleReward: string; tier: number; category: string } | null;
  availableTitles: string[];
  totalTitlesEarned: number;
  showcaseBadgeCodes?: string[];
  showcaseBadges?: Array<{ code: string; name: string; titleReward?: string | null; tier: number; category: string }>;
  badges: UserBadgeProgress[];
  stats?: {
    articlesRead: number;
    articlesPublished: number;
    commentsCount: number;
    loansReturned: number;
    onTimeStreak: number;
    eventsAttended: number;
    booksDonated: number;
  };
}

export interface EquipTitleInput {
  title: string | null;
}

export interface UpdateShowcaseInput {
  badgeCodes: string[];
}
