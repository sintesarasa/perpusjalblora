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
  Radio,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { NotificationItem } from '@perpusjal/types';
import { useNotifications } from '@/contexts/notifications-context';
import { apiClient } from '@/lib/api';
import { CustomLoader } from '@/components/ui/custom-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

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

  const [activeTab, setActiveTab] = React.useState<'semua' | 'unread'>('semua');
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    try {
      const unreadParam = activeTab === 'unread' ? '&unreadOnly=true' : '';
      const url = `/notifications?page=${page}&limit=15${unreadParam}`;
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
  }, [page, activeTab]);

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
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-6xl">
      {/* ── 1. Masthead ── */}
      <div className="border-b-2 border-foreground pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-xs text-muted uppercase tracking-wider">
            <span>KOTAK MASUK ANGGOTA</span>
            <span className="text-border-hairline select-none font-sans" aria-hidden="true">/</span>
            <span>WARTA &amp; PEMBERITAHUAN</span>
            {isConnected && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 px-1.5 py-0.2 ml-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Kotak Warta Anggota
          </h1>
          <p className="font-sans text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
            Catatan sirkulasi peminjaman buku, hasil kurasi tulisan warga, diskusi komentar, dan agenda komunitas.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="w-full sm:w-auto px-4 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-semibold hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 min-h-[40px]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Tandai Semua Dibaca ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* ── 2. Tab Switchers ── */}
      <div className="flex items-center justify-between border-b border-border-hairline pb-px font-mono text-xs uppercase tracking-wider overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('semua');
              setPage(1);
            }}
            className={cn(
              'px-3 sm:px-4 py-2.5 border-b-2 transition-colors min-h-[38px]',
              activeTab === 'semua'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            )}
          >
            Semua Warta
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('unread');
              setPage(1);
            }}
            className={cn(
              'px-3 sm:px-4 py-2.5 border-b-2 transition-colors inline-flex items-center gap-1.5 min-h-[38px]',
              activeTab === 'unread'
                ? 'border-foreground text-foreground font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            )}
          >
            <span>Belum Dibaca</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-foreground text-background text-[10px] font-bold font-mono">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <span className="hidden sm:inline font-mono text-xs text-muted shrink-0 pl-2">
          Halaman {page} dari {totalPages || 1}
        </span>
      </div>

      {/* ── 3. Notification Feed ── */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <CustomLoader size="md" label="MEMUAT KOTAK WARTA ANGGOTA..." />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title={activeTab === 'unread' ? 'Semua Warta Telah Dibaca' : 'Kotak Warta Masih Bersih'}
          description={
            activeTab === 'unread'
              ? 'Tidak ada warta baru yang belum dibaca saat ini. Kamu selalu dapat meninjau warta terdahulu di tab Semua Warta.'
              : 'Belum ada warta atau catatan kegiatan yang dikirimkan ke kotak masukmu. Warta peminjaman dan kurasi akan tercatat otomatis di sini.'
          }
          actionLabel={activeTab === 'unread' ? 'Lihat Semua Warta' : undefined}
          onAction={activeTab === 'unread' ? () => setActiveTab('semua') : undefined}
        />
      ) : (
        <div className="divide-y divide-border-hairline border border-border-hairline bg-surface">
          {notifications.map((item) => (
            <article
              key={item.id}
              className={cn(
                'p-4 sm:p-5 transition-colors flex items-start gap-4',
                item.isRead
                  ? 'bg-surface opacity-80 hover:opacity-100 hover:bg-surface-muted/40'
                  : 'bg-surface-muted/40 hover:bg-surface-muted/80'
              )}
            >
              {/* Category Icon Container */}
              <div
                className={cn(
                  'w-9 h-9 border flex items-center justify-center shrink-0 mt-0.5',
                  item.isRead
                    ? 'border-border-hairline bg-surface-muted/30 text-muted'
                    : 'border-foreground bg-surface text-foreground'
                )}
              >
                {getNotificationCategoryIcon(item.type)}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {!item.isRead && (
                      <span
                        className="w-2 h-2 bg-foreground shrink-0"
                        title="Belum dibaca"
                      />
                    )}
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[11px] text-muted">
                    <Clock className="w-3 h-3 text-muted" />
                    <time dateTime={item.createdAt}>
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-serif text-base font-bold text-foreground leading-snug">
                  {item.title}
                </h3>

                {/* Body Text */}
                <p className="font-sans text-xs sm:text-sm text-foreground/80 mt-1 leading-relaxed">
                  {item.body}
                </p>

                {/* Action Links & Read Toggle */}
                <div className="mt-3.5 flex flex-wrap items-center gap-4 font-mono text-xs">
                  {item.actionUrl && (
                    <Link
                      href={item.actionUrl}
                      className="font-semibold text-foreground hover:underline inline-flex items-center gap-1.5"
                    >
                      <span>Buka Tautan Rincian</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="text-muted hover:text-foreground inline-flex items-center gap-1 hover:underline"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Tandai Sudah Dibaca</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── 4. Pagination Bar ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border-hairline font-mono text-xs">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 border border-border-hairline disabled:opacity-30 disabled:pointer-events-none hover:border-foreground transition-colors"
          >
            ← Halaman Sebelumnya
          </button>

          <span className="text-muted">
            Halaman {page} dari {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 border border-border-hairline disabled:opacity-30 disabled:pointer-events-none hover:border-foreground transition-colors"
          >
            Halaman Berikutnya →
          </button>
        </div>
      )}
    </div>
  );
}
