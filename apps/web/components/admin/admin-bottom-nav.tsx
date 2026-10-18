'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Role } from '@perpusjal/types';
import {
  Layers,
  Megaphone,
  Users,
  Clock,
  Menu,
  X,
  Feather,
  BookOpen,
  Calendar,
  BarChart3,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Close drawer on route change
  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  if (!user || (user.role !== Role.ADMIN && user.role !== Role.KURATOR)) {
    return null;
  }

  const isAdmin = user.role === Role.ADMIN;

  const navItems = [
    {
      label: 'Dasbor',
      href: '/admin',
      icon: Layers,
      isActive: pathname === '/admin',
    },
    {
      label: 'Beranda',
      href: '/admin/beranda',
      icon: Megaphone,
      isActive: pathname.startsWith('/admin/beranda'),
    },
    ...(isAdmin
      ? [
          {
            label: 'Pengguna',
            href: '/admin/pengguna',
            icon: Users,
            isActive: pathname.startsWith('/admin/pengguna'),
          },
        ]
      : []),
    {
      label: 'Lapak',
      href: '/dashboard/sirkulasi',
      icon: Clock,
      isActive: pathname.startsWith('/dashboard/sirkulasi'),
    },
  ];

  return (
    <>
      {/* ── FIXED MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav
        aria-label="Navigasi Pengurus Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border-hairline print:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_12px_rgba(0,0,0,0.04)]"
      >
        <div className={cn('grid h-16 items-center px-1', isAdmin ? 'grid-cols-5' : 'grid-cols-4')}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center h-full w-full py-1 text-center touch-tactile active:scale-95 transition-all select-none relative',
                  item.isActive
                    ? 'text-foreground font-bold'
                    : 'text-muted hover:text-foreground'
                )}
              >
                {/* Crisp top active hairline indicator */}
                {item.isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 inset-x-3 h-[2px] bg-foreground"
                  />
                )}

                {/* Icon Container with solid fill and spacing */}
                <div className="w-7 h-7 flex items-center justify-center relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-all duration-150',
                      item.isActive
                        ? 'text-foreground fill-current stroke-[2]'
                        : 'text-muted stroke-[1.75]'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-mono uppercase tracking-wider mt-1.5 leading-none',
                    item.isActive ? 'font-bold text-foreground' : 'text-muted'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center h-full w-full py-1 text-center touch-tactile active:scale-95 transition-all select-none relative',
              drawerOpen
                ? 'text-foreground font-bold'
                : 'text-muted hover:text-foreground'
            )}
            aria-expanded={drawerOpen}
            aria-label="Buka Menu Pengurus Tambahan"
          >
            {drawerOpen && (
              <span
                aria-hidden="true"
                className="absolute top-0 inset-x-3 h-[2px] bg-foreground"
              />
            )}
            <div className="w-7 h-7 flex items-center justify-center relative">
              <Menu
                className={cn(
                  'w-5 h-5 transition-all duration-150',
                  drawerOpen ? 'text-foreground stroke-[2.5]' : 'text-muted stroke-[1.75]'
                )}
              />
            </div>
            <span
              className={cn(
                'text-[10px] font-mono uppercase tracking-wider mt-1.5 leading-none',
                drawerOpen ? 'font-bold text-foreground' : 'text-muted'
              )}
            >
              Lainnya
            </span>
          </button>
        </div>
      </nav>

      {/* ── SMOOTH SLIDE-UP BOTTOM SHEET / DRAWER UNTUK MENU LAINNYA ── */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu Pengurus Pusat"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-background/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-full bg-surface border-t-2 border-foreground max-h-[85vh] overflow-y-auto flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div className="sticky top-0 z-10 bg-surface border-b border-border-hairline p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted block">
                  MEJA PENGURUS PUSAT
                </span>
                <h3 className="font-serif font-bold text-base text-foreground">
                  Modul &amp; Menu Manajemen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 border border-border-hairline hover:border-foreground text-foreground rounded-none transition-colors"
                aria-label="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu List */}
            <div className="p-4 space-y-4 font-mono text-xs">
              {/* Group 1: Modul Operasional Lapak & Kurasi */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted font-bold block mb-2">
                  Operasional &amp; Literasi
                </span>

                <Link
                  href="/dashboard/kurasi"
                  className="flex items-center justify-between p-3 border border-border-hairline bg-surface hover:border-foreground hover:bg-surface-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Feather className="w-4 h-4 text-foreground" />
                    <div>
                      <div className="font-bold text-foreground">Meja Kurasi</div>
                      <div className="text-[10px] text-muted font-sans">
                        Moderasi warta, surat warga, dan komentar
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </Link>

                <Link
                  href="/dashboard/buku"
                  className="flex items-center justify-between p-3 border border-border-hairline bg-surface hover:border-foreground hover:bg-surface-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-foreground" />
                    <div>
                      <div className="font-bold text-foreground">Koleksi Pustaka</div>
                      <div className="text-[10px] text-muted font-sans">
                        Katalog buku, eksemplar fisik &amp; stiker
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </Link>

                <Link
                  href="/dashboard/kegiatan"
                  className="flex items-center justify-between p-3 border border-border-hairline bg-surface hover:border-foreground hover:bg-surface-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-foreground" />
                    <div>
                      <div className="font-bold text-foreground">Agenda Kegiatan</div>
                      <div className="text-[10px] text-muted font-sans">
                        Jadwal lapak CFD, diskusi, dan arsip
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </Link>

                <Link
                  href="/dashboard/laporan"
                  className="flex items-center justify-between p-3 border border-border-hairline bg-surface hover:border-foreground hover:bg-surface-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4 text-foreground" />
                    <div>
                      <div className="font-bold text-foreground">Laporan Multi-Pilar</div>
                      <div className="text-[10px] text-muted font-sans">
                        Statistik sirkulasi, literasi, &amp; ekspor CSV
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </Link>
              </div>

              {/* Group 2: Pintasan Navigasi */}
              <div className="pt-2 border-t border-border-hairline space-y-2">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between p-3 border border-foreground bg-foreground text-background font-bold uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Dasbor Warga</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-background/70" />
                </Link>

                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-between p-3 border border-border-hairline text-muted hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Halaman Publik Perpusjal</span>
                  </div>
                  <span className="text-[10px] text-muted">Tab Baru &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
