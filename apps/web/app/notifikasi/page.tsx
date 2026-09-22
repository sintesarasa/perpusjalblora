'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, Check, ExternalLink, Filter } from 'lucide-react';
import { NotificationItem } from '@perpusjal/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/v1/notifications?page=${page}&limit=20${unreadOnly ? '&unreadOnly=true' : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data?.items || []);
        setUnreadCount(json.data?.unreadCount || 0);
        setTotalPages(json.data?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/v1/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* 1. EDITORIAL HEADER */}
      <section className="border-b border-border-hairline bg-surface-muted/30 py-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>KOTAK MASUK PERSONAL</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Warta & Pemberitahuan
            </h1>
            <p className="font-serif text-sm text-muted mt-1">
              Catatan peminjaman, respon tulisan, dan informasi kegiatan yang relevan untukmu.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="font-mono text-xs uppercase tracking-wider font-semibold border border-foreground bg-foreground text-background px-3 py-2 hover:opacity-90 transition-opacity self-start sm:self-auto flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Tandai Semua Terbaca
            </button>
          )}
        </div>
      </section>

      {/* 2. FILTER & LIST */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 pt-8">
        {/* Filter Bar */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-4 mb-6">
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

        {/* Notifications List */}
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-muted border border-border-hairline bg-surface">
            Memuat kotak masuk...
          </div>
        ) : notifications.length === 0 ? (
          <div className="border border-dashed border-border-hairline p-12 text-center bg-surface">
            <Bell className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
            <p className="font-mono text-xs text-muted">
              {unreadOnly ? 'Tidak ada pemberitahuan baru yang belum dibaca.' : 'Kotak masuk kosong.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-hairline border border-border-hairline bg-surface">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-5 transition-colors flex items-start gap-4 ${
                  item.isRead ? 'opacity-70 bg-transparent' : 'bg-surface-muted/30'
                } hover:bg-surface-muted/60`}
              >
                <div className="w-2 h-2 rounded-none mt-2 shrink-0 bg-foreground opacity-90" style={{ visibility: item.isRead ? 'hidden' : 'visible' }} />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                    <time className="font-mono text-[10px] text-muted">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
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
                        className="font-mono text-xs text-muted hover:text-foreground inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Tandai Dibaca
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 font-mono text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 border border-border-hairline disabled:opacity-30 hover:border-foreground"
            >
              ← Sebelumnya
            </button>
            <span>Halaman {page} dari {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 border border-border-hairline disabled:opacity-30 hover:border-foreground"
            >
              Selanjutnya →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
