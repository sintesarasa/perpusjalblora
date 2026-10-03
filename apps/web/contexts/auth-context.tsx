'use client';

import * as React from 'react';
import { Role, UserStatus, TrustLevel } from '@perpusjal/types';
import { apiClient } from '@/lib/api';

export interface CurrentUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  trustLevel: TrustLevel;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  borrowing?: {
    eligible: boolean;
    activeCount: number;
    maxActive: number;
    hasOverdue: boolean;
  };
  unreadNotificationsCount?: number;
}

interface AuthContextType {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginUser: (user: CurrentUser) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<CurrentUser | null>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshUser = React.useCallback(async (): Promise<CurrentUser | null> => {
    try {
      const res = await apiClient<any>('/auth/me');
      if (res.error) {
        setUser(null);
        return null;
      }

      // Structure from /auth/me returns { data: userObject }
      const u = res.data?.user || (res.data?.id ? res.data : null);
      if (u) {
        setUser(u as CurrentUser);
        return u as CurrentUser;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginUser = React.useCallback((newUser: CurrentUser) => {
    setUser(newUser);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
    }
  }, []);

  const value = React.useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      loginUser,
      logout,
      refreshUser,
    }),
    [user, isLoading, loginUser, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
