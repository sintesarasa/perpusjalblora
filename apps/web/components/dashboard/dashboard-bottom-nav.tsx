'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Feather,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/notifications-context';

interface DashboardBottomNavProps {
  onOpenMore: () => void;
  isMoreOpen?: boolean;
}

export function DashboardBottomNav({ onOpenMore, isMoreOpen }: DashboardBottomNavProps) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const navItems = [
    {
      href: '/dashboard',
      label: 'Ikhtisar',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
    {
      href: '/dashboard/pinjaman',
      label: 'Pinjaman',
      icon: BookOpen,
      isActive: pathname.startsWith('/dashboard/pinjaman'),
    },
    {
      href: '/dashboard/kartu-anggota',
      label: 'Kartu QR',
      icon: CreditCard,
      isActive: pathname.startsWith('/dashboard/kartu-anggota'),
    },
    {
      href: '/dashboard/tulisan',
      label: 'Tulisan',
      icon: Feather,
      isActive: pathname.startsWith('/dashboard/tulisan'),
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Ruang Kendali"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-surface/98 backdrop-blur-md border-t-2 border-foreground print:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center h-full w-full py-1 text-center touch-tactile active:scale-95 transition-all select-none',
                active
                  ? 'text-foreground font-bold'
                  : 'text-muted hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'p-1.5 transition-all',
                  active
                    ? 'border-2 border-foreground bg-foreground text-background'
                    : 'border border-transparent hover:border-border-hairline'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider mt-0.5 leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* 5th Slot: Menu Lainnya (Bottom Sheet / Drawer trigger) */}
        <button
          type="button"
          onClick={onOpenMore}
          className={cn(
            'flex flex-col items-center justify-center h-full w-full py-1 text-center touch-tactile active:scale-95 transition-all select-none relative',
            isMoreOpen
              ? 'text-foreground font-bold'
              : 'text-muted hover:text-foreground'
          )}
          aria-label="Buka menu lengkap anggota"
        >
          <div
            className={cn(
              'p-1.5 transition-all relative',
              isMoreOpen
                ? 'border-2 border-foreground bg-foreground text-background'
                : 'border border-transparent hover:border-border-hairline'
            )}
          >
            <Menu className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-foreground rounded-full border-2 border-background animate-pulse" />
            )}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider mt-0.5 leading-none">
            Lainnya
          </span>
        </button>
      </div>
    </nav>
  );
}
