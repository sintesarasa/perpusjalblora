'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  ExternalLink,
  Filter,
  BookOpen,
  Feather,
  MessageSquare,
  Award,
  Calendar,
  Radio,
} from 'lucide-react';
import { NotificationItem } from '@perpusjal/types';
import { useNotifications } from '@/contexts/notifications-context';
import { apiClient } from '@/lib/api';

function getNotificationCategoryIcon(type: string) {
  if (type.startsWith('LOAN_') || type.startsWith('WAITLIST_')) {
    return <BookOpen className="w-4 h-4 text-foreground" />;
  }
  if (type.startsWith('ARTICLE_')) {
    return <Feather className="w-4 h-4 text-foreground" />;
  }
  if (type.startsWith('COMMENT_')) {
    return <MessageSquare className="w-4 h-4 text-foreground" />;
  }
  if (type.startsWith('BADGE_')) {
    return <Award className="w-4 h-4 text-foreground" />;
  }
  if (type.startsWith('EVENT_')) {
    return <Calendar className="w-4 h-4 text-foreground" />;
  }
  return <Bell className="w-4 h-4 text-foreground" />;
}

export default function DashboardNotificationsPage() {
  const {
    unreadCount,
    markAsRead: contextMarkAsRead,
    markAllAsRead: contextMarkAllAsRead,
    isConnected,
  } = useNotifications();

  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = `/notifications?page=${page}&limit=20${unreadOnly ? '&unreadOnly=true' : ''}`;
      const res = await apiClient<{ items: NotificationItem[]; totalPages: number; unreadCount: number }>(url);
      if (res.data) {
        setNotifications(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await contextMarkAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await contextMarkAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. EDITORIAL HEADER SECTION */}
      <div className="border-b-2 border-foreground pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>KOTAK WARTA PERSONAL</span>
              {isConnected && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-2">
                  <Radio className="w-3 h-3 animate-pulse" />
                  SIARAN LANGSUNG
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Warta & Pemberitahuan
            </h1>
            <p className="font-serif text-sm text-muted mt-1 max-w-2xl leading-relaxed">
              Catatan sirkulasi peminjaman buku, perkembangan kurasi tulisan warga, komentar, dan agenda kegiatan komunitas yang relevan untukmu.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="font-mono text-xs uppercase tracking-wider font-semibold border-2 border-foreground bg-foreground text-background px-3.5 py-2 hover:opacity-90 transition-opacity self-start sm:self-auto flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)]"
            >
              <Check className="w-3.5 h-3.5" />
              Tandai Semua Terbaca ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* 2. FILTER & COUNT BAR */}
      <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-4 gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted" />
          <div className="flex items-center space-x-1 font-mono text-xs uppercase tracking-wider">
            <button
              onClick={() => {
                setUnreadOnly(false);
                setPage(1);
              }}
              className={`px-3 py-1 border transition-colors ${
                !unreadOnly
                  ? 'border-foreground bg-foreground text-background font-bold'
                  : 'border-border-hairline text-muted hover:text-foreground'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => {
                setUnreadOnly(true);
                setPage(1);
              }}
              className={`px-3 py-1 border transition-colors ${
                unreadOnly
                  ? 'border-foreground bg-foreground text-background font-bold'
                  : 'border-border-hairline text-muted hover:text-foreground'
              }`}
            >
              Belum Dibaca {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
        </div>

        <span className="font-mono text-xs text-muted">
          Halaman {page} dari {totalPages}
        </span>
      </div>

      {/* 3. NOTIFICATIONS FEED */}
      {loading ? (
        <div className="p-12 text-center font-mono text-xs text-muted border border-border-hairline bg-surface">
          Memuat kotak warta...
        </div>
      ) : notifications.length === 0 ? (
        <div className="border-2 border-dashed border-border-hairline p-12 text-center bg-surface">
          <Bell className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" />
          <p className="font-mono text-xs text-muted">
            {unreadOnly ? 'Tidak ada warta baru yang belum dibaca.' : 'Kotak warta kosong.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border-hairline border-2 border-foreground bg-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-5 transition-colors flex items-start gap-4 ${
                item.isRead ? 'opacity-70 bg-transparent' : 'bg-surface-muted/40 font-medium'
              } hover:bg-surface-muted/70`}
            >
              {/* Category Icon Badge */}
              <div
                className={`p-2 border border-border-hairline shrink-0 mt-0.5 ${
                  item.isRead ? 'bg-surface-muted/50' : 'bg-surface border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]'
                }`}
              >
                {getNotificationCategoryIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {!item.isRead && (
                      <span className="w-1.5 h-1.5 bg-foreground inline-block" />
                    )}
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <time className="font-mono text-[10px] text-muted">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>

                <h3 className="font-serif text-base font-bold text-foreground">
                  {item.title}
                </h3>

                <p className="font-serif text-xs sm:text-sm text-foreground/85 mt-1 leading-relaxed">
                  {item.body}
                </p>

                <div className="mt-3 flex items-center gap-4">
                  {item.actionUrl && (
                    <Link
                      href={item.actionUrl}
                      className="font-mono text-xs text-foreground font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Buka Tautan <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}

                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="font-mono text-xs text-muted hover:text-foreground inline-flex items-center gap-1 hover:underline"
                    >
                      <Check className="w-3.5 h-3.5" /> Tandai Dibaca
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2 font-mono text-xs">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 border border-border-hairline disabled:opacity-30 hover:border-foreground"
          >
            ← Sebelumnya
          </button>
          <span>
            Halaman {page} dari {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 border border-border-hairline disabled:opacity-30 hover:border-foreground"
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  );
}
