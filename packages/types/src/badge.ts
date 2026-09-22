export enum BadgeCriteria {
  ARTICLES_READ = 'ARTICLES_READ',
  ARTICLES_PUBLISHED = 'ARTICLES_PUBLISHED',
  COMMENTS_PUBLISHED = 'COMMENTS_PUBLISHED',
  EVENTS_ATTENDED = 'EVENTS_ATTENDED',
  LOANS_RETURNED = 'LOANS_RETURNED',
  ONTIME_STREAK = 'ONTIME_STREAK',
  ACCOUNT_AGE_DAYS = 'ACCOUNT_AGE_DAYS',
  MANUAL = 'MANUAL',
}

export interface BadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName: string;
  criteriaType: BadgeCriteria;
  criteriaValue: number;
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
  badges: UserBadgeProgress[];
}
