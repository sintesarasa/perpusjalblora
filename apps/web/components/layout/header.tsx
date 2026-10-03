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
import { GlobalSearchModal } from '@/components/layout/global-search-modal';
import {
  Menu,
  X,
  Search,
  ChevronDown,
  ArrowRight,
  BookOpen,
  FileText,
  Calendar,
  Compass,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchModalOpen, setSearchModalOpen] = React.useState(false);
  const [lapakDropdownOpen, setLapakDropdownOpen] = React.useState(false);

  const pathname = usePathname();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close mobile drawer and dropdown on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setLapakDropdownOpen(false);
  }, [pathname]);

  // Click outside to close lapak dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLapakDropdownOpen(false);
      }
    }
    if (lapakDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [lapakDropdownOpen]);

  // Close mobile drawer on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setLapakDropdownOpen(false);
      }
    };
    if (mobileMenuOpen || lapakDropdownOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [mobileMenuOpen, lapakDropdownOpen]);

  // Global shortcut (Cmd+K / Ctrl+K or '/') to open GlobalSearchModal
  React.useEffect(() => {
    const handleGlobalSearchKey = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'k' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalSearchKey);
    return () => window.removeEventListener('keydown', handleGlobalSearchKey);
  }, []);

  const isLapakActive =
    pathname === '/cara-meminjam' ||
    pathname?.startsWith('/cara-meminjam/') ||
    pathname === '/surat-pembaca' ||
    pathname?.startsWith('/surat-pembaca/');

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border-hairline transition-colors print:hidden shadow-2xs">
        {/* Scroll reading progress indicator at bottom hairline */}
        <ScrollProgress />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* 1. LEFT: OFFICIAL LOGO */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link href="/" className="flex items-center space-x-2 group" aria-label="Beranda Perpusjal Blora">
              <Logo className="h-6 sm:h-7 w-auto text-foreground group-hover:opacity-85 transition-opacity" />
            </Link>
            <span className="hidden xl:inline text-[10px] font-mono uppercase tracking-widest text-muted border-l border-border-hairline pl-3">
              Blora, Jawa Tengah
            </span>
          </div>

          {/* 2. CENTER: STREAMLINED & BALANCED DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center space-x-1 font-mono text-[11px] uppercase tracking-wider">
            {/* Artikel */}
            <Link
              href="/artikel"
              aria-current={pathname?.startsWith('/artikel') ? 'page' : undefined}
              className={cn(
                'px-3 py-1.5 transition-colors border-b-2 font-mono text-[11px] uppercase tracking-wider',
                pathname?.startsWith('/artikel')
                  ? 'font-bold text-foreground bg-surface-muted border-foreground'
                  : 'text-foreground/75 hover:text-foreground hover:bg-surface-muted/50 border-transparent'
              )}
            >
              Artikel
            </Link>

            {/* Buku */}
            <Link
              href="/buku"
              aria-current={pathname?.startsWith('/buku') ? 'page' : undefined}
              className={cn(
                'px-3 py-1.5 transition-colors border-b-2 font-mono text-[11px] uppercase tracking-wider',
                pathname?.startsWith('/buku')
                  ? 'font-bold text-foreground bg-surface-muted border-foreground'
                  : 'text-foreground/75 hover:text-foreground hover:bg-surface-muted/50 border-transparent'
              )}
            >
              Buku
            </Link>

            {/* Kegiatan */}
            <Link
              href="/kegiatan"
              aria-current={pathname?.startsWith('/kegiatan') ? 'page' : undefined}
              className={cn(
                'px-3 py-1.5 transition-colors border-b-2 font-mono text-[11px] uppercase tracking-wider',
                pathname?.startsWith('/kegiatan')
                  ? 'font-bold text-foreground bg-surface-muted border-foreground'
                  : 'text-foreground/75 hover:text-foreground hover:bg-surface-muted/50 border-transparent'
              )}
            >
              Kegiatan
            </Link>

            {/* Lapak & Panduan Dropdown */}
            <div className="relative group/lapak" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setLapakDropdownOpen((prev) => !prev)}
                aria-expanded={lapakDropdownOpen}
                className={cn(
                  'px-3 py-1.5 transition-colors border-b-2 font-mono text-[11px] uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer',
                  isLapakActive
                    ? 'font-bold text-foreground bg-surface-muted border-foreground'
                    : 'text-foreground/75 hover:text-foreground hover:bg-surface-muted/50 border-transparent'
                )}
              >
                <span>Lapak</span>
                <ChevronDown className="w-3 h-3 text-muted group-hover/lapak:text-foreground group-hover/lapak:rotate-180 transition-transform duration-150" />
              </button>

              {/* Dropdown Panel (Hover & Click supported) */}
              <div
                className={cn(
                  'absolute left-0 top-full pt-1.5 z-50',
                  lapakDropdownOpen ? 'block' : 'hidden group-hover/lapak:block'
                )}
              >
                <div className="w-64 bg-surface border-2 border-foreground shadow-2xl p-2 space-y-1 font-mono animate-in fade-in-50 duration-150">
                  <Link
                    href="/cara-meminjam"
                    onClick={() => setLapakDropdownOpen(false)}
                    className={cn(
                      'block p-2.5 hover:bg-surface-muted transition-colors border',
                      pathname === '/cara-meminjam'
                        ? 'border-foreground bg-surface-muted font-bold'
                        : 'border-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between text-xs text-foreground">
                      <span className="font-bold flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-foreground" />
                        Cara Meminjam
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted" />
                    </div>
                    <p className="font-serif text-[11px] text-muted normal-case mt-1 leading-snug">
                      Pedoman peminjaman koleksi di lapak terpal tanpa kartu &amp; nol denda.
                    </p>
                  </Link>

                  <div className="border-t border-border-hairline" />

                  <Link
                    href="/surat-pembaca"
                    onClick={() => setLapakDropdownOpen(false)}
                    className={cn(
                      'block p-2.5 hover:bg-surface-muted transition-colors border',
                      pathname === '/surat-pembaca'
                        ? 'border-foreground bg-surface-muted font-bold'
                        : 'border-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between text-xs text-foreground">
                      <span className="font-bold flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-foreground" />
                        Surat Pembaca
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted" />
                    </div>
                    <p className="font-serif text-[11px] text-muted normal-case mt-1 leading-snug">
                      Ruang suara warga, saran buku bacaan, dan korespondensi terbuka.
                    </p>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tentang */}
            <Link
              href="/tentang"
              aria-current={pathname === '/tentang' ? 'page' : undefined}
              className={cn(
                'px-3 py-1.5 transition-colors border-b-2 font-mono text-[11px] uppercase tracking-wider',
                pathname === '/tentang'
                  ? 'font-bold text-foreground bg-surface-muted border-foreground'
                  : 'text-foreground/75 hover:text-foreground hover:bg-surface-muted/50 border-transparent'
              )}
            >
              Tentang
            </Link>
          </nav>

          {/* 3. RIGHT: SEARCH, THEME TOGGLE, AND USER CLUSTER */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Quick Interactive Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="px-2 sm:px-2.5 py-1.5 text-muted hover:text-foreground hover:bg-surface-muted transition-colors flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider border border-border-hairline hover:border-foreground cursor-pointer shadow-2xs"
              title="Pencarian cepat arsip (Cmd+K atau /)"
              aria-label="Buka pencarian global (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-foreground" />
              <span className="hidden sm:inline text-[10px] font-bold">Cari</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 text-[9px] font-mono text-muted/80 bg-surface-muted px-1 py-0.2 border border-border-hairline ml-0.5">
                <span>⌘</span>
                <span>K</span>
              </kbd>
            </button>

            {/* Notifications (only shown when authenticated) */}
            <NotificationBell />

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* User Session Dropdown / Login */}
            <UserMenu />

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-foreground hover:bg-surface-muted transition-colors border border-border-hairline cursor-pointer"
              aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 4. MOBILE DRAWER WITH BACKDROP */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 top-14 sm:top-16 bg-background/60 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-50 lg:hidden border-t border-border-hairline bg-surface p-5 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto font-mono text-xs">
              {/* Quick Search in Mobile Drawer */}
              <div className="pb-3 border-b border-border-hairline">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full px-3 py-2 border border-border-hairline bg-background text-muted hover:border-foreground hover:text-foreground transition-colors flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-foreground" />
                    <span>Cari buku, artikel, arsip...</span>
                  </span>
                  <span className="text-[10px] font-bold border border-border-hairline px-1.5 py-0.5 bg-surface-muted">
                    ⌘K
                  </span>
                </button>
              </div>

              {/* Main Navigation Links */}
              <nav className="py-3 space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-muted font-bold block mb-1">
                  NAVIGASI UTAMA
                </span>

                <Link
                  href="/artikel"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2 px-3 transition-colors border-l-2',
                    pathname?.startsWith('/artikel')
                      ? 'bg-surface-muted font-bold text-foreground border-foreground'
                      : 'text-foreground/80 hover:bg-surface-muted/50 border-transparent'
                  )}
                >
                  Artikel &amp; Warta
                </Link>

                <Link
                  href="/buku"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2 px-3 transition-colors border-l-2',
                    pathname?.startsWith('/buku')
                      ? 'bg-surface-muted font-bold text-foreground border-foreground'
                      : 'text-foreground/80 hover:bg-surface-muted/50 border-transparent'
                  )}
                >
                  Katalog Koleksi Buku
                </Link>

                <Link
                  href="/kegiatan"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2 px-3 transition-colors border-l-2',
                    pathname?.startsWith('/kegiatan')
                      ? 'bg-surface-muted font-bold text-foreground border-foreground'
                      : 'text-foreground/80 hover:bg-surface-muted/50 border-transparent'
                  )}
                >
                  Agenda Kegiatan Lapak
                </Link>

                <Link
                  href="/tentang"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2 px-3 transition-colors border-l-2',
                    pathname === '/tentang'
                      ? 'bg-surface-muted font-bold text-foreground border-foreground'
                      : 'text-foreground/80 hover:bg-surface-muted/50 border-transparent'
                  )}
                >
                  Tentang Perpustakaan Jalanan
                </Link>
              </nav>

              {/* Lapak & Community Links */}
              <div className="py-3 border-t border-border-hairline space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-muted font-bold block mb-1">
                  LAPAK &amp; SIRKULASI
                </span>

                <Link
                  href="/cara-meminjam"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2 px-3 transition-colors border-l-2',
                    pathname === '/cara-meminjam'
                      ? 'bg-surface-muted font-bold text-foreground border-foreground'
                      : 'text-foreground/80 hover:bg-surface-muted/50 border-transparent'
                  )}
                >
                  Cara Meminjam (Nol Denda)
                </Link>

                <Link
                  href="/surat-pembaca"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2 px-3 transition-colors border-l-2',
                    pathname === '/surat-pembaca'
                      ? 'bg-surface-muted font-bold text-foreground border-foreground'
                      : 'text-foreground/80 hover:bg-surface-muted/50 border-transparent'
                  )}
                >
                  Surat Pembaca &amp; Warga
                </Link>
              </div>

              {/* User Shortcuts in Mobile Drawer */}
              <div className="pt-3 border-t border-border-hairline flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-foreground text-background font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity"
                >
                  Dasbor Anggota
                </Link>
                <div className="flex gap-2">
                  <Link
                    href="/tulis"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 border border-foreground text-foreground text-xs font-bold uppercase hover:bg-surface-muted transition-colors"
                  >
                    + Tulis Naskah
                  </Link>
                  <Link
                    href="/masuk"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 border border-border-hairline text-muted hover:text-foreground text-xs uppercase hover:bg-surface-muted transition-colors"
                  >
                    Masuk
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Global Interactive Search Modal (Command Palette) */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}
