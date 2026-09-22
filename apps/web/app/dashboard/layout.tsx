'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/layout/notification-bell';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { Role } from '@perpusjal/types';
import { Menu, X, ArrowLeft } from 'lucide-react';

interface CurrentUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const res = await apiClient<any>('/auth/me');
        const userData = res.data?.user || (res.data?.id ? res.data : null);
        if (userData) {
          setUser(userData);
        } else {
          router.replace('/masuk');
        }
      } catch {
        router.replace('/masuk');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CustomLoader size="md" label="MEMVERIFIKASI SESI ANGGOTA..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. TOP DASHBOARD BANNER BAR */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border-hairline h-14 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-3">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-1.5 border border-border-hairline hover:bg-surface-muted text-foreground"
            aria-label="Toggle Sidebar"
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Link href="/" className="flex items-center space-x-2 group">
            <Logo className="h-6 w-auto text-foreground group-hover:opacity-80 transition-opacity" />
          </Link>

          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-muted border-l border-border-hairline pl-3">
            RUANG KENDALI WARGA
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-foreground hover:underline mr-2"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Situs Utama</span>
          </Link>

          <NotificationBell />
          <ThemeToggle />
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN LAYOUT (SIDEBAR + CONTENT) */}
      <div className="flex-1 flex flex-row min-h-[calc(100vh-3.5rem)]">
        {/* Desktop Sidebar (Left) */}
        <div className="hidden lg:block w-64 shrink-0 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
          <DashboardSidebar user={user} />
        </div>

        {/* Mobile Slide-Over Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] h-full bg-surface z-10 shadow-2xl animate-in slide-in-from-left duration-200">
              <DashboardSidebar user={user} onNavigate={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Right Content Area */}
        <main className="flex-1 min-w-0 bg-background overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
