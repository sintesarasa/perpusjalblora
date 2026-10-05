'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  X,
  BookOpen,
  Feather,
  MessageSquare,
  Award,
  Calendar,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { useNotifications } from '@/contexts/notifications-context';

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

export function NotificationToast() {
  const { activeToast, dismissToast, markAsRead } = useNotifications();

  if (!activeToast) return null;

  const handleActionClick = () => {
    markAsRead(activeToast.id);
    dismissToast();
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] bg-surface border-2 border-foreground animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      {/* Top Banner / Ticker */}
      <div className="flex items-center justify-between border-b border-foreground bg-foreground text-background px-3 py-1.5">
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest">
          <span className="inline-block w-2 h-2 bg-background animate-pulse rounded-none" />
          <span>WARTA KILAT REAL-TIME</span>
        </div>
        <button
          onClick={dismissToast}
          aria-label="Tutup notifikasi"
          className="text-background hover:opacity-75 transition-opacity p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4">
        <div className="flex items-start gap-2.5 mb-1.5">
          <div className="p-1 border border-border-hairline bg-surface-muted/50 shrink-0 mt-0.5">
            {getNotificationCategoryIcon(activeToast.type)}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[9px] uppercase font-bold tracking-wider text-muted block mb-0.5">
              {activeToast.type.replace(/_/g, ' ')}
            </span>
            <h4 className="font-serif text-sm font-bold text-foreground leading-snug line-clamp-2">
              {activeToast.title}
            </h4>
          </div>
        </div>

        <p className="font-serif text-xs text-foreground/80 pl-8 leading-relaxed line-clamp-3 mb-3">
          {activeToast.body}
        </p>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border-hairline pl-8 font-mono text-[11px]">
          {activeToast.actionUrl ? (
            <Link
              href={activeToast.actionUrl}
              onClick={handleActionClick}
              className="font-bold uppercase tracking-wider text-foreground hover:underline inline-flex items-center gap-1"
            >
              Lihat Rincian <ExternalLink className="w-3 h-3" />
            </Link>
          ) : (
            <span className="text-[10px] text-muted uppercase">Pemberitahuan Sistem</span>
          )}

          <button
            onClick={() => {
              markAsRead(activeToast.id);
              dismissToast();
            }}
            className="text-muted hover:text-foreground uppercase tracking-wider hover:underline"
          >
            Tandai Dibaca
          </button>
        </div>
      </div>
    </div>
  );
}
