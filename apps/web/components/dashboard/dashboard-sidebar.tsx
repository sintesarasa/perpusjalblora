'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Feather,
  Award,
  Settings,
  Shield,
  Layers,
  Users,
  LogOut,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Role } from '@perpusjal/types';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';

interface DashboardSidebarProps {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: Role;
    avatarUrl?: string | null;
  } | null;
  onNavigate?: () => void;
}

export function DashboardSidebar({ user, onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignored
    } finally {
      window.location.href = '/masuk';
    }
  };

  const navItems = [
    {
      href: '/dashboard',
      label: 'Ikhtisar Personal',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/dashboard/pinjaman',
      label: 'Pinjaman Buku',
      icon: BookOpen,
      exact: false,
    },
    {
      href: '/dashboard/kartu-anggota',
      label: 'Kartu Anggota Digital',
      icon: CreditCard,
      exact: false,
    },
    {
      href: '/dashboard/tulisan',
      label: 'Karya Tulisan Saya',
      icon: Feather,
      exact: false,
    },
    {
      href: '/dashboard/badge',
      label: 'Lencana Apresiasi',
      icon: Award,
      exact: false,
    },
    {
      href: '/dashboard/profil',
      label: 'Pengaturan & Privasi',
      icon: Settings,
      exact: false,
    },
  ];

  return (
    <aside className="w-full h-full flex flex-col justify-between bg-surface border-r border-border-hairline font-mono text-xs select-none">
      {/* Top Section */}
      <div className="p-4 space-y-6">
        {/* User Mini Card */}
        {user && (
          <div className="p-3 border border-border-hairline bg-surface-muted/40 flex items-center gap-3">
            <div className="w-10 h-10 border border-foreground bg-foreground text-background flex items-center justify-center font-serif text-sm font-bold uppercase shrink-0">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover grayscale" />
              ) : (
                user.name.slice(0, 1)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-serif font-bold text-xs text-foreground truncate">
                {user.name}
              </div>
              <div className="text-[10px] text-muted truncate">@{user.username}</div>
              <span className="inline-block mt-1 px-1.5 py-0.2 border border-foreground bg-foreground text-background text-[9px] font-bold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Member Navigation Section */}
        <div>
          <div className="px-2 pb-2 text-[10px] uppercase tracking-widest text-muted font-bold flex items-center justify-between">
            <span>Menu Anggota</span>
            <span className="text-[9px]">WARGA</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');

              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 transition-colors border-l-2',
                    isActive
                      ? 'border-foreground bg-foreground text-background font-bold'
                      : 'border-transparent text-foreground/80 hover:bg-surface-muted hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('w-4 h-4', isActive ? 'text-background' : 'text-muted')} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3 h-3 text-background" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ROLE-BASED: CURATOR / ADMIN SECTION */}
        {user && (user.role === Role.KURATOR || user.role === Role.ADMIN) && (
          <div className="pt-4 border-t border-border-hairline">
            <div className="px-2 pb-2 text-[10px] uppercase tracking-widest text-muted font-bold flex items-center justify-between">
              <span>Meja Kurasi</span>
              <span className="text-[9px] px-1 bg-surface-muted border border-border-hairline font-mono">
                {user.role}
              </span>
            </div>
            <nav className="space-y-1">
              <Link
                href="/admin/kurasi"
                onClick={onNavigate}
                className={cn(
                  'flex items-center justify-between px-3 py-2 transition-colors border-l-2',
                  pathname.startsWith('/admin/kurasi')
                    ? 'border-foreground bg-foreground text-background font-bold'
                    : 'border-transparent text-foreground/80 hover:bg-surface-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-muted" />
                  <span>Meja Kurasi Naskah</span>
                </div>
              </Link>
            </nav>
          </div>
        )}

        {/* ROLE-BASED: ADMIN SECTION */}
        {user && user.role === Role.ADMIN && (
          <div className="pt-4 border-t border-border-hairline">
            <div className="px-2 pb-2 text-[10px] uppercase tracking-widest text-muted font-bold flex items-center justify-between">
              <span>Pengurus Inti</span>
              <span className="text-[9px] px-1 bg-surface-muted border border-border-hairline font-mono">
                ADMIN
              </span>
            </div>
            <nav className="space-y-1">
              <Link
                href="/admin"
                onClick={onNavigate}
                className={cn(
                  'flex items-center justify-between px-3 py-2 transition-colors border-l-2',
                  pathname === '/admin'
                    ? 'border-foreground bg-foreground text-background font-bold'
                    : 'border-transparent text-foreground/80 hover:bg-surface-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-muted" />
                  <span>Dasbor Operasional</span>
                </div>
              </Link>

              <Link
                href="/admin/sirkulasi"
                onClick={onNavigate}
                className={cn(
                  'flex items-center justify-between px-3 py-2 transition-colors border-l-2',
                  pathname.startsWith('/admin/sirkulasi')
                    ? 'border-foreground bg-foreground text-background font-bold'
                    : 'border-transparent text-foreground/80 hover:bg-surface-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-muted" />
                  <span>Mode Lapak Sirkulasi</span>
                </div>
              </Link>

              <Link
                href="/admin/pengguna"
                onClick={onNavigate}
                className={cn(
                  'flex items-center justify-between px-3 py-2 transition-colors border-l-2',
                  pathname.startsWith('/admin/pengguna')
                    ? 'border-foreground bg-foreground text-background font-bold'
                    : 'border-transparent text-foreground/80 hover:bg-surface-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-muted" />
                  <span>Manajemen Pengguna</span>
                </div>
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-border-hairline bg-surface-muted/20 space-y-2">
        {user && (
          <Link
            href={`/u/${user.username}`}
            target="_blank"
            className="flex items-center justify-between px-3 py-1.5 text-muted hover:text-foreground hover:bg-surface-muted transition-colors text-[11px]"
          >
            <span>Lihat Profil Publik</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 border border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors text-left font-bold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </aside>
  );
}
