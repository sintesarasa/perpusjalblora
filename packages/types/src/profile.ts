import { Role, UserStatus, TrustLevel } from './enums';
import { UserBadgeProgress } from './badge';

export interface PublicUserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  role: Role;
  trustLevel: TrustLevel;
  createdAt: string;
  isProfilePublic: boolean;
  showBadges: boolean;
  stats: {
    totalArticles: number;
    badgesCount: number;
  };
  badges: UserBadgeProgress[];
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: string;
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  avatarUrl?: string;
  isProfilePublic?: boolean;
  showBadges?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ContributorItem {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  role: Role;
  articlesCount: number;
  badgesCount: number;
  joinedAt: string;
}

export interface AdminUserListItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  trustLevel: TrustLevel;
  createdAt: string;
  lastLoginAt: string | null;
  activeLoansCount: number;
  borrowSuspendedUntil: string | null;
  suspensionReason: string | null;
}

export interface UserDataExport {
  exportedAt: string;
  profile: {
    id: string;
    name: string;
    username: string;
    email: string;
    bio: string | null;
    role: string;
    status: string;
    createdAt: string;
  };
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: string;
    publishedAt: string | null;
  }>;
  loans: Array<{
    id: string;
    bookTitle: string;
    status: string;
    borrowedAt: string | null;
    dueAt: string | null;
    returnedAt: string | null;
  }>;
  comments: Array<{
    id: string;
    content: string;
    status: string;
    createdAt: string;
  }>;
  eventRegistrations: Array<{
    id: string;
    eventTitle: string;
    status: string;
    registeredAt: string;
  }>;
  badges: Array<{
    name: string;
    code: string;
    earnedAt: string | null;
  }>;
}
