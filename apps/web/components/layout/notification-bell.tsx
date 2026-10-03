'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  ExternalLink,
  BookOpen,
  Feather,
  MessageSquare,
  Award,
  Calendar,
} from 'lucide-react';
import { useNotifications } from '@/contexts/notifications-context';
import { useAuth } from '@/contexts/auth-context';

function getNotificationCategoryIcon(type: string) {
  if (type.startsWith('LOAN_') || type.startsWith('WAITLIST_')) {
    return <BookOpen className="w-3.5 h-3.5 text-foreground" />;
  }
  if (type.startsWith('ARTICLE_')) {
    return <Feather className="w-3.5 h-3.5 text-foreground" />;
  }
  if (type.startsWith('COMMENT_')) {
    return <MessageSquare className="w-3.5 h-3.5 text-foreground" />;
  }
  if (type.startsWith('BADGE_')) {
    return <Award className="w-3.5 h-3.5 text-foreground" />;
  }
  if (type.startsWith('EVENT_')) {
    return <Calendar className="w-3.5 h-3.5 text-foreground" />;
  }
  return <Bell className="w-3.5 h-3.5 text-foreground" />;
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const {
    unreadCount,
    recentNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    isConnected,
  } = useNotifications();

  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // When opening dropdown, ensure we fetch latest items
  React.useEffect(() => {
    if (isOpen) {
      setLoading(true);
      refreshNotifications().finally(() => setLoading(false));
    }
  }, [isOpen, refreshNotifications]);

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
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-muted hover:text-foreground hover:bg-surface-muted transition-colors flex items-center justify-center border border-transparent hover:border-border-hairline"
        aria-label="Pemberitahuan"
        title={isConnected ? 'Warta Real-time Aktif' : 'Pemberitahuan'}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 font-mono text-[9px] bg-foreground text-background px-1 py-0.2 leading-tight font-bold rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] z-50 rounded-none animate-in fade-in-50 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border-hairline bg-surface-muted/50">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                Warta & Pemberitahuan
              </span>
              {isConnected && (
                <span className="inline-flex items-center gap-1 font-mono text-[9px] text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>

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
            {loading && recentNotifications.length === 0 ? (
              <div className="p-4 text-center font-mono text-xs text-muted">
                Memuat warta...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-mono text-xs text-muted">Belum ada warta terbaru.</p>
              </div>
            ) : (
              recentNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 transition-colors ${
                    item.isRead ? 'opacity-70 bg-transparent' : 'bg-surface-muted/40 font-medium'
                  } hover:bg-surface-muted/80`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="p-1 border border-border-hairline bg-surface shrink-0">
                        {getNotificationCategoryIcon(item.type)}
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-muted truncate">
                        {item.type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {!item.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        title="Tandai dibaca"
                        className="text-muted hover:text-foreground p-0.5 shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-xs font-serif font-bold text-foreground mt-1 line-clamp-1">
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
                        className="font-mono text-[10px] text-foreground font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Buka rincian <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-border-hairline bg-surface-muted/30 text-center">
            <Link
              href="/dashboard/notifikasi"
              onClick={() => setIsOpen(false)}
              className="font-mono text-[10px] uppercase font-bold tracking-wider text-foreground hover:underline block py-0.5"
            >
              Buka Arsip Kotak Masuk Lengkap →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
