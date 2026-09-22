'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { NotificationItem } from '@perpusjal/types';
import { apiClient } from '@/lib/api';

export function NotificationBell() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const res = await apiClient<{ unreadCount: number }>('/notifications/unread-count');
      if (res.data) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // User might be unauthenticated, silence
    }
  }, []);

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient<{ items: NotificationItem[]; unreadCount: number }>('/notifications?limit=5');
      if (res.data) {
        setNotifications(res.data.items || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Polling 1 min
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  React.useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Click outside to close
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient(`/notifications/${id}/read`, {
        method: 'PATCH',
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
      await apiClient('/notifications/mark-all-read', {
        method: 'POST',
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-muted hover:text-foreground hover:bg-surface-muted transition-colors flex items-center justify-center"
        aria-label="Pemberitahuan"
        title="Pemberitahuan"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 font-mono text-[9px] bg-foreground text-background px-1 py-0.2 leading-tight font-bold rounded-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-foreground shadow-2xl z-50 rounded-none animate-in fade-in-50 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border-hairline bg-surface-muted/50">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
              Warta & Pemberitahuan
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="font-mono text-[10px] text-muted hover:text-foreground hover:underline flex items-center gap-1 uppercase"
              >
                <Check className="w-3 h-3" />
                Tandai Dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border-hairline">
            {loading ? (
              <div className="p-4 text-center font-mono text-xs text-muted">
                Memuat warta...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-mono text-xs text-muted">Belum ada pemberitahuan.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 transition-colors ${
                    item.isRead ? 'opacity-70 bg-transparent' : 'bg-surface font-medium'
                  } hover:bg-surface-muted/60`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                    {!item.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        title="Tandai dibaca"
                        className="text-muted hover:text-foreground p-0.5"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <h4 className="text-xs font-serif font-bold text-foreground mt-0.5 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-muted line-clamp-2 mt-0.5 leading-relaxed font-sans">
                    {item.body}
                  </p>
                  {item.actionUrl && (
                    <div className="mt-1.5 flex items-center">
                      <Link
                        href={item.actionUrl}
                        onClick={() => setIsOpen(false)}
                        className="font-mono text-[10px] text-foreground hover:underline inline-flex items-center gap-1"
                      >
                        Buka tautan <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border-hairline bg-surface-muted/30 text-center">
            <Link
              href="/notifikasi"
              onClick={() => setIsOpen(false)}
              className="font-mono text-[10px] uppercase font-bold tracking-wider text-foreground hover:underline block py-1"
            >
              Lihat Seluruh Notifikasi →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
