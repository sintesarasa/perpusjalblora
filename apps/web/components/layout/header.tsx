'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { NotificationBell } from '@/components/layout/notification-bell';
import { UserMenu } from '@/components/layout/user-menu';
import { Menu, X, Search } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/artikel', label: 'Artikel' },
    { href: '/buku', label: 'Katalog Buku' },
    { href: '/kegiatan', label: 'Kegiatan' },
    { href: '/surat-pembaca', label: 'Surat Pembaca' },
    { href: '/cara-meminjam', label: 'Cara Meminjam' },
    { href: '/tentang', label: 'Tentang' },
  ];

  return (
    <>
      <ScrollProgress />
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border-hairline transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* 1. LEFT: OFFICIAL LOGO */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group" aria-label="Beranda Perpusjal Blora">
              <Logo className="h-6 sm:h-7 w-auto text-foreground group-hover:opacity-80 transition-opacity" />
            </Link>
            <span className="hidden xl:inline text-[10px] font-mono uppercase tracking-widest text-muted border-l border-border-hairline pl-3">
              Blora, Jawa Tengah
            </span>
          </div>

          {/* 2. CENTER: SLEEK MINIMALIST DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center space-x-1 font-mono text-[11px] uppercase tracking-wider">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'px-3 py-1.5 transition-colors',
                    isActive
                      ? 'font-bold text-foreground bg-surface-muted border-b border-foreground'
                      : 'text-foreground/75 hover:text-foreground hover:bg-surface-muted/50'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* 3. RIGHT: SEARCH, THEME TOGGLE, AND COMPACT ACTION */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/cari"
              className="p-1.5 sm:px-2.5 sm:py-1 text-muted hover:text-foreground hover:bg-surface-muted transition-colors flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider"
              title="Cari katalog..."
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] text-muted">Cari</span>
            </Link>

            <NotificationBell />

            <ThemeToggle />

            <UserMenu />

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-foreground hover:bg-surface-muted transition-colors border border-border-hairline"
              aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 4. MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border-hairline bg-surface p-5">
            <nav className="flex flex-col space-y-2 font-mono text-xs uppercase tracking-wider">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'py-2 px-3 transition-colors',
                      isActive ? 'bg-surface-muted font-bold text-foreground border-l-2 border-foreground' : 'text-foreground/80 hover:bg-surface-muted/50'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-border-hairline flex flex-col gap-2">
                <Link
                  href="/dashboard/pinjaman"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 bg-foreground text-background font-bold text-xs tracking-wider"
                >
                  DASBOR ANGGOTA & PINJAMAN
                </Link>
                <div className="flex gap-2">
                  <Link
                    href="/tulis"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 border border-foreground text-foreground text-xs font-bold"
                  >
                    + Tulis
                  </Link>
                  <Link
                    href="/masuk"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 border border-border-hairline text-muted hover:text-foreground text-xs"
                  >
                    Masuk
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
