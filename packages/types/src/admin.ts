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
