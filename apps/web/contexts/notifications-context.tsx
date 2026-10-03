'use client';

import * as React from 'react';
import { NotificationItem } from '@perpusjal/types';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';

interface NotificationsContextType {
  unreadCount: number;
  recentNotifications: NotificationItem[];
  activeToast: NotificationItem | null;
  dismissToast: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  isConnected: boolean;
}

const NotificationsContext = React.createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [recentNotifications, setRecentNotifications] = React.useState<NotificationItem[]>([]);
  const [activeToast, setActiveToast] = React.useState<NotificationItem | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const toastTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = React.useRef<EventSource | null>(null);

  const dismissToast = React.useCallback(() => {
    setActiveToast(null);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = React.useCallback((item: NotificationItem) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setActiveToast(item);
    // Auto dismiss after 8 seconds
    toastTimerRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 8000);
  }, []);

  // Fetch recent notifications for dropdown
  const refreshNotifications = React.useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient<{ items: NotificationItem[]; unreadCount: number }>('/notifications?limit=6');
      if (res.data) {
        setRecentNotifications(res.data.items || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Ignore background refresh errors
    }
  }, [isAuthenticated]);

  // Initial fetch unread count and recent notifications
  React.useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
    } else {
      setUnreadCount(0);
      setRecentNotifications([]);
      setActiveToast(null);
      setIsConnected(false);
    }
  }, [isAuthenticated, refreshNotifications]);

  // Server-Sent Events (SSE) connection
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    let retryTimeout: NodeJS.Timeout | null = null;
    let isCleanedUp = false;

    const connectSSE = () => {
      if (isCleanedUp) return;

      try {
        const es = new EventSource('/api/v1/notifications/stream', {
          withCredentials: true,
        });
        eventSourceRef.current = es;

        es.onopen = () => {
          if (!isCleanedUp) {
            setIsConnected(true);
          }
        };

        // Connected event with initial count
        es.addEventListener('connected', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (typeof data.unreadCount === 'number') {
              setUnreadCount(data.unreadCount);
            }
          } catch (e) {
            // Ignore parse errors
          }
        });

        // Real-time notification received
        es.addEventListener('notification', (event: MessageEvent) => {
          try {
            const notification: NotificationItem = JSON.parse(event.data);
            setUnreadCount((prev) => prev + 1);
            setRecentNotifications((prev) => [
              notification,
              ...prev.filter((item) => item.id !== notification.id).slice(0, 5),
            ]);
            showToast(notification);
          } catch (e) {
            console.error('Failed to parse incoming SSE notification:', e);
          }
        });

        // Unread count sync event
        es.addEventListener('unread_count', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (typeof data.unreadCount === 'number') {
              setUnreadCount(data.unreadCount);
            }
          } catch (e) {
            // Ignore parse errors
          }
        });

        // General fallback message event
        es.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type === 'CONNECTED' && typeof data.unreadCount === 'number') {
              setUnreadCount(data.unreadCount);
            } else if (data?.type === 'NOTIFICATION' && data.notification) {
              setUnreadCount((prev) => prev + 1);
              setRecentNotifications((prev) => [
                data.notification,
                ...prev.filter((item) => item.id !== data.notification.id).slice(0, 5),
              ]);
              showToast(data.notification);
            }
          } catch {
            // Ignore parse errors
          }
        };

        es.onerror = () => {
          es.close();
          if (!isCleanedUp) {
            setIsConnected(false);
            // Reconnect after 7 seconds
            retryTimeout = setTimeout(() => {
              connectSSE();
            }, 7000);
          }
        };
      } catch (err) {
        if (!isCleanedUp) {
          setIsConnected(false);
          retryTimeout = setTimeout(() => {
            connectSSE();
          }, 10000);
        }
      }
    };

    connectSSE();

    return () => {
      isCleanedUp = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [isAuthenticated, user, showToast]);

  const markAsRead = React.useCallback(async (id: string) => {
    try {
      await apiClient(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = React.useCallback(async () => {
    try {
      await apiClient('/notifications/mark-all-read', {
        method: 'POST',
      });
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const value = React.useMemo<NotificationsContextType>(
    () => ({
      unreadCount,
      recentNotifications,
      activeToast,
      dismissToast,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
      isConnected,
    }),
    [
      unreadCount,
      recentNotifications,
      activeToast,
      dismissToast,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
      isConnected,
    ]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = React.useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
