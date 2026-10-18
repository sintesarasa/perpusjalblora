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
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border-hairline print:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_12px_rgba(0,0,0,0.04)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center h-full w-full py-1 text-center touch-tactile active:scale-95 transition-all select-none relative',
                active
                  ? 'text-foreground font-bold'
                  : 'text-muted hover:text-foreground'
              )}
            >
              {/* Crisp top active hairline indicator */}
              {active && (
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
                    active
                      ? 'text-foreground fill-current stroke-[2]'
                      : 'text-muted stroke-[1.75]'
                  )}
                />
              </div>

              <span
                className={cn(
                  'text-[10px] font-mono uppercase tracking-wider mt-1.5 leading-none',
                  active ? 'font-bold text-foreground' : 'text-muted'
                )}
              >
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
          aria-expanded={isMoreOpen}
        >
          {isMoreOpen && (
            <span
              aria-hidden="true"
              className="absolute top-0 inset-x-3 h-[2px] bg-foreground"
            />
          )}

          <div className="w-7 h-7 flex items-center justify-center relative">
            <Menu
              className={cn(
                'w-5 h-5 transition-all duration-150',
                isMoreOpen
                  ? 'text-foreground stroke-[2.5]'
                  : 'text-muted stroke-[1.75]'
              )}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-foreground rounded-full border-2 border-background animate-pulse" />
            )}
          </div>

          <span
            className={cn(
              'text-[10px] font-mono uppercase tracking-wider mt-1.5 leading-none',
              isMoreOpen ? 'font-bold text-foreground' : 'text-muted'
            )}
          >
            Lainnya
          </span>
        </button>
      </div>
    </nav>
  );
}
