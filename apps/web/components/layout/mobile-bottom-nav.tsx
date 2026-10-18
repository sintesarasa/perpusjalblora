'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Search, Newspaper, User, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { UserAvatar } from '@/components/ui/user-avatar';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide on admin and dashboard pages since they have dedicated bottom/drawer navigation
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
      icon: Home,
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
      icon: Newspaper,
      isActive: pathname.startsWith('/artikel'),
    },
    user
      ? {
          href: '/dashboard',
          label: 'Akun',
          icon: User,
          isActive: pathname.startsWith('/dashboard'),
          isUserSlot: true,
        }
      : {
          href: '/masuk',
          label: 'Masuk',
          icon: LogIn,
          isActive: pathname.startsWith('/masuk'),
          isUserSlot: true,
        },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border-hairline print:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_12px_rgba(0,0,0,0.04)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
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
                  'flex flex-col items-center justify-center h-full w-full py-1 text-center touch-tactile active:scale-95 transition-all select-none group relative',
                  active ? 'text-foreground' : 'text-muted hover:text-foreground'
                )}
                aria-label="Buka pencarian arsip (Cmd+K)"
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 inset-x-3 h-[2px] bg-foreground"
                  />
                )}
                <div
                  className={cn(
                    'w-7 h-7 flex items-center justify-center border transition-colors',
                    active
                      ? 'border-foreground bg-foreground text-background shadow-xs'
                      : 'border-border-hairline bg-surface group-hover:border-foreground'
                  )}
                >
                  <Icon className="w-4 h-4 stroke-[2.25]" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider mt-1.5 font-semibold">
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
                'flex flex-col items-center justify-center h-full w-full py-1 text-center touch-tactile active:scale-95 transition-all select-none relative',
                active ? 'text-foreground font-bold' : 'text-muted hover:text-foreground'
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
                {item.isUserSlot && user ? (
                  <>
                    <UserAvatar
                      src={user.avatarUrl}
                      name={user.name}
                      username={user.username}
                      size="xs"
                      className={cn(
                        'w-5 h-5 border transition-all',
                        active ? 'border-foreground ring-1 ring-foreground' : 'border-border-hairline'
                      )}
                    />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-background shadow-xs" />
                  </>
                ) : (
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-all duration-150',
                      active
                        ? 'text-foreground fill-current stroke-[2]'
                        : 'text-muted stroke-[1.75]'
                    )}
                  />
                )}
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
      </div>
    </nav>
  );
}
