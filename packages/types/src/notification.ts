export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPreferenceItem {
  type: string;
  inApp: boolean;
  email: boolean;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
