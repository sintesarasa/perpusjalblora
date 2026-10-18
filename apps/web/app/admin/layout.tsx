'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/layout/notification-bell';
import { Role } from '@perpusjal/types';
import { ShieldAlert, ArrowLeft, Users, Layers, ExternalLink, Megaphone } from 'lucide-react';
import { AdminBottomNav } from '@/components/admin/admin-bottom-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/masuk?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CustomLoader size="md" label="MEMVERIFIKASI HAK AKSES PENGURUS PUSAT..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Strictly restrict admin area to KURATOR and ADMIN roles
  const hasAccess = user.role === Role.ADMIN || user.role === Role.KURATOR;
  // User management is strictly ADMIN only
  const isUserManagement = pathname.startsWith('/admin/pengguna');
  const hasUserMgmtAccess = user.role === Role.ADMIN;

  if (!hasAccess || (isUserManagement && !hasUserMgmtAccess)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full border-2 border-foreground p-8 bg-surface space-y-4">
          <div className="w-12 h-12 border-2 border-foreground mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-foreground" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            KODE // 403 FORBIDDEN
          </span>
          <h1 className="font-serif text-2xl font-bold">Akses Pengurus Ditolak</h1>
          <p className="font-sans text-xs text-muted leading-relaxed">
            Halaman ini berada di bawah wewenang Pengurus Pusat Perpusjal Blora. Akun Anda (@{user.username}) terdaftar dengan peran <span className="font-bold text-foreground uppercase">{user.role}</span>.
          </p>
          <div className="pt-4 flex flex-col gap-2 font-mono text-xs">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            >
              Kembali ke Ruang Kendali Warga
            </Link>
            <Link
              href="/"
              className="px-4 py-2 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider"
            >
              Ke Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Admin Quick Navbar */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border-hairline h-14 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2 group">
            <Logo className="h-6 w-auto text-foreground group-hover:opacity-80 transition-opacity" />
          </Link>

          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-widest text-muted border-l border-border-hairline pl-3">
            MEJA PENGURUS PUSAT
          </span>
        </div>

        {/* Quick Tabs for Admin Navigation */}
        <nav className="hidden md:flex items-center space-x-1 font-mono text-xs">
          <Link
            href="/admin"
            className={`px-3 py-1.5 border transition-colors ${
              pathname === '/admin'
                ? 'border-foreground bg-foreground text-background font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Dasbor</span>
            </span>
          </Link>

          <Link
            href="/admin/beranda"
            className={`px-3 py-1.5 border transition-colors ${
              pathname.startsWith('/admin/beranda')
                ? 'border-foreground bg-foreground text-background font-bold'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Etalase Beranda</span>
            </span>
          </Link>

          {user.role === Role.ADMIN && (
            <Link
              href="/admin/pengguna"
              className={`px-3 py-1.5 border transition-colors ${
                pathname === '/admin/pengguna'
                  ? 'border-foreground bg-foreground text-background font-bold'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Pengguna</span>
              </span>
            </Link>
          )}

          <Link
            href="/dashboard/sirkulasi"
            className="px-3 py-1.5 border border-transparent text-muted hover:text-foreground transition-colors"
          >
            <span>Mode Lapak</span>
          </Link>

          <Link
            href="/dashboard/kurasi"
            className="px-3 py-1.5 border border-transparent text-muted hover:text-foreground transition-colors"
          >
            <span>Meja Kurasi</span>
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-foreground hover:underline mr-2"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Dasbor Warga</span>
          </Link>

          <NotificationBell />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 min-w-0 bg-background pb-24 md:pb-8">{children}</main>

      {/* Admin Mobile Bottom Navigation */}
      <AdminBottomNav />
    </div>
  );
}
