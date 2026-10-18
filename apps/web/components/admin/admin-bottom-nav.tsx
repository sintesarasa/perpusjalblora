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
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border-hairline h-16 px-2 flex items-center justify-around select-none shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)]"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-none transition-all duration-150 touch-tactile active:scale-95',
                item.isActive
                  ? 'text-foreground font-bold'
                  : 'text-muted hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-150',
                    item.isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                  )}
                />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full" />
                )}
              </div>
              <span className="font-mono text-[10px] tracking-tight mt-1">
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
            'flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-none transition-all duration-150 touch-tactile active:scale-95',
            drawerOpen
              ? 'text-foreground font-bold'
              : 'text-muted hover:text-foreground'
          )}
          aria-expanded={drawerOpen}
          aria-label="Buka Menu Pengurus Tambahan"
        >
          <div className="relative">
            <Menu className="w-5 h-5 stroke-[1.75]" />
          </div>
          <span className="font-mono text-[10px] tracking-tight mt-1">
            Lainnya
          </span>
        </button>
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
