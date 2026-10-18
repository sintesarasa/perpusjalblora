'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, BookOpen, Search, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin and dashboard pages since they have dedicated drawer navigation
  if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    return null;
  }

  const handleOpenSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-global-search'));
    }
  };

  const navItems = [
    {
      href: '/',
      label: 'Beranda',
      icon: Compass,
      isActive: pathname === '/',
    },
    {
      href: '/buku',
      label: 'Katalog',
      icon: BookOpen,
      isActive: pathname.startsWith('/buku'),
    },
    {
      href: '/cari',
      label: 'Cari',
      icon: Search,
      isActive: pathname.startsWith('/cari'),
      isAction: true,
      onClick: handleOpenSearch,
    },
    {
      href: '/artikel',
      label: 'Artikel',
      icon: FileText,
      isActive: pathname.startsWith('/artikel'),
    },
    {
      href: '/kegiatan',
      label: 'Kegiatan',
      icon: Calendar,
      isActive: pathname.startsWith('/kegiatan'),
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border-hairline print:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_10px_rgba(0,0,0,0.03)]"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={cn(
                  'flex flex-col items-center justify-center h-full w-full py-1 text-center touch-tactile active:scale-90 transition-transform duration-100 group select-none',
                  active ? 'text-foreground' : 'text-muted hover:text-foreground'
                )}
                aria-label="Buka pencarian arsip (Cmd+K)"
              >
                <div
                  className={cn(
                    'p-1 border transition-colors',
                    active
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border-hairline bg-surface group-hover:border-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-wider mt-1 font-semibold">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center h-full w-full py-1 text-center touch-tactile active:scale-90 transition-transform duration-100 select-none relative',
                active ? 'text-foreground font-bold' : 'text-muted hover:text-foreground'
              )}
            >
              {/* Subtle active top dot glyph */}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 w-1 h-1 bg-foreground rounded-none"
                />
              )}
              <Icon className={cn('w-4 h-4 transition-colors', active && 'stroke-[2.25]')} />
              <span className="text-[9px] font-mono uppercase tracking-wider mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
