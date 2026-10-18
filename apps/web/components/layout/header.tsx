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
import { apiClient } from '@/lib/api';
import {
  Menu,
  X,
  Search,
  BookOpen,
  FileText,
  Calendar,
  Compass,
  Sparkles,
  MapPin,
  Clock,
  Radio,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface LapakScheduleStatus {
  badgeText: string;
  isLiveNow: boolean;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchModalOpen, setSearchModalOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollYRef = React.useRef(0);

  const [lapakStatus, setLapakStatus] = React.useState<LapakScheduleStatus>({
    badgeText: 'CFD ALUN-ALUN BLORA (MINGGU 06.00–09.30 WIB)',
    isLiveNow: false,
  });

  const pathname = usePathname();

  // 1. Detect if CFD Lapak is currently live (Sunday 06:00 - 09:30 WIB / UTC+7)
  React.useEffect(() => {
    const checkLiveSession = () => {
      const now = new Date();
      // WIB is UTC+7
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const wibDate = new Date(utc + 3600000 * 7);

      const day = wibDate.getDay(); // 0 is Sunday
      const hours = wibDate.getHours();
      const minutes = wibDate.getMinutes();
      const timeNum = hours + minutes / 60;

      if (day === 0 && timeNum >= 6.0 && timeNum <= 9.5) {
        setLapakStatus({
          badgeText: 'LAPAK TERPAL SEDANG BERLANGSUNG DI ALUN-ALUN BLORA',
          isLiveNow: true,
        });
      } else {
        setLapakStatus({
          badgeText: 'LAPAK RUTIN MINGGU INI: CFD ALUN-ALUN BLORA (06.00–09.30 WIB)',
          isLiveNow: false,
        });
      }
    };

    checkLiveSession();
    const interval = setInterval(checkLiveSession, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch remote announcement if available from landing-config
  React.useEffect(() => {
    let isMounted = true;
    async function loadAnnouncement() {
      try {
        const res = await apiClient<any>('/landing/config');
        if (isMounted && res.data?.settings?.cfdSchedule?.badgeText) {
          const cfg = res.data.settings.cfdSchedule;
          setLapakStatus((prev) => ({
            badgeText: cfg.badgeText,
            isLiveNow: cfg.status === 'BERLANGSUNG' || prev.isLiveNow,
          }));
        }
      } catch {
        // graceful fallback to local detection
      }
    }
    loadAnnouncement();
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Direction-aware Smart Sticky Header (auto-hides on scroll down, shows on scroll up)
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show at the very top of the page
      if (currentScrollY <= 40) {
        setIsVisible(true);
        setIsScrolled(false);
      } else {
        setIsScrolled(true);

        // If scrolling down by more than 10px, hide header
        if (currentScrollY > lastScrollYRef.current + 10 && currentScrollY > 90) {
          if (!mobileMenuOpen && !searchModalOpen) {
            setIsVisible(false);
          }
        }
        // If scrolling up by more than 6px, show header
        else if (currentScrollY < lastScrollYRef.current - 6) {
          setIsVisible(true);
        }
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen, searchModalOpen]);

  // 4. Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // 5. Close mobile drawer on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [mobileMenuOpen]);

  // 6. Listen for Global Search Trigger Event & Shortcut (Cmd+K / Ctrl+K / '/')
  React.useEffect(() => {
    const handleOpenSearchEvent = () => {
      setSearchModalOpen(true);
    };

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

    window.addEventListener('open-global-search', handleOpenSearchEvent);
    window.addEventListener('keydown', handleGlobalSearchKey);
    return () => {
      window.removeEventListener('open-global-search', handleOpenSearchEvent);
      window.removeEventListener('keydown', handleGlobalSearchKey);
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300 ease-in-out print:hidden',
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none',
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-foreground shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
            : 'bg-background/85 backdrop-blur-md border-b border-border-hairline'
        )}
      >
        {/* Scroll reading progress indicator at bottom hairline */}
        <ScrollProgress />

        {/* 1. EDITORIAL TOP ANNOUNCEMENT TICKER (MICRO-STRIP) */}
        <div className="border-b border-border-hairline/80 bg-surface-muted/60 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider py-1 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-none shrink-0',
                  lapakStatus.isLiveNow ? 'bg-red-600 animate-pulse' : 'bg-foreground'
                )}
              />
              <span className="font-semibold text-foreground truncate">
                {lapakStatus.badgeText}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-3 text-muted shrink-0 text-[9.5px]">
              <span>Sirkulasi Mandiri &bull; Bebas Denda</span>
              <span className="text-border-hairline">{'//'}</span>
              <Link
                href="/cara-meminjam"
                className="hover:text-foreground transition-colors underline underline-offset-2"
              >
                Panduan Peminjaman
              </Link>
            </div>
          </div>
        </div>

        {/* 2. MAIN HEADER BAR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* LEFT: OFFICIAL LOGO */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link href="/" className="flex items-center space-x-2 group" aria-label="Beranda Perpusjal Blora">
              <Logo className="h-6 sm:h-7 w-auto text-foreground group-hover:opacity-85 transition-opacity" />
            </Link>
            <span className="hidden xl:inline text-[10px] font-mono uppercase tracking-widest text-muted border-l border-border-hairline pl-3">
              Blora, Jawa Tengah
            </span>
          </div>

          {/* CENTER: DESKTOP NAVIGATION (5 DIRECT LINKS) */}
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
              Artikel &amp; Warta
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
              Katalog Buku
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
              Agenda Lapak
            </Link>

            {/* Cara Meminjam */}
            <Link
              href="/cara-meminjam"
              aria-current={pathname === '/cara-meminjam' || pathname?.startsWith('/cara-meminjam/') ? 'page' : undefined}
              className={cn(
                'px-3 py-1.5 transition-colors border-b-2 font-mono text-[11px] uppercase tracking-wider',
                pathname === '/cara-meminjam' || pathname?.startsWith('/cara-meminjam/')
                  ? 'font-bold text-foreground bg-surface-muted border-foreground'
                  : 'text-foreground/75 hover:text-foreground hover:bg-surface-muted/50 border-transparent'
              )}
            >
              Cara Meminjam
            </Link>

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

          {/* RIGHT: SEARCH, THEME TOGGLE, AND USER CLUSTER */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Quick Interactive Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="px-2 sm:px-2.5 py-1.5 text-muted hover:text-foreground hover:bg-surface-muted transition-colors flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider border border-border-hairline hover:border-foreground cursor-pointer touch-tactile"
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

            {/* Notifications (only shown when authenticated, desktop/tablet) */}
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            {/* Dark / Light Theme Toggle (desktop/tablet, mobile is inside drawer) */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* User Session Dropdown / Login */}
            <UserMenu />

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-w-[38px] min-h-[38px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center text-foreground hover:bg-surface-muted transition-colors border border-border-hairline cursor-pointer touch-tactile active:scale-95"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu lengkap'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 3. MOBILE EXTENDED DRAWER WITH BACKDROP */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 top-[88px] bg-background/60 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-50 lg:hidden border-t border-b-2 border-border-hairline border-b-foreground bg-surface p-5 max-h-[calc(100vh-6rem)] overflow-y-auto font-mono text-xs shadow-xl pb-24">
              {/* Quick Search in Mobile Drawer */}
              <div className="pb-3 border-b border-border-hairline">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full px-3 py-2 border border-border-hairline bg-background text-muted hover:border-foreground hover:text-foreground transition-colors flex items-center justify-between text-left cursor-pointer touch-tactile"
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
                  INDEX HALAMAN
                </span>

                <Link
                  href="/artikel"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2.5 px-3 transition-colors border-l-2',
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
                    'block py-2.5 px-3 transition-colors border-l-2',
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
                    'block py-2.5 px-3 transition-colors border-l-2',
                    pathname?.startsWith('/kegiatan')
                      ? 'bg-surface-muted font-bold text-foreground border-foreground'
                      : 'text-foreground/80 hover:bg-surface-muted/50 border-transparent'
                  )}
                >
                  Agenda Kegiatan Lapak
                </Link>

                <Link
                  href="/cara-meminjam"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2.5 px-3 transition-colors border-l-2',
                    pathname === '/cara-meminjam' || pathname?.startsWith('/cara-meminjam/')
                      ? 'bg-surface-muted font-bold text-foreground border-foreground'
                      : 'text-foreground/80 hover:bg-surface-muted/50 border-transparent'
                  )}
                >
                  Cara Meminjam (Nol Denda)
                </Link>

                <Link
                  href="/tentang"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2.5 px-3 transition-colors border-l-2',
                    pathname === '/tentang'
                      ? 'bg-surface-muted font-bold text-foreground border-foreground'
                      : 'text-foreground/80 hover:bg-surface-muted/50 border-transparent'
                  )}
                >
                  Tentang Perpustakaan Jalanan
                </Link>

                <Link
                  href="/surat-pembaca"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2.5 px-3 transition-colors border-l-2',
                    pathname === '/surat-pembaca' || pathname?.startsWith('/surat-pembaca/')
                      ? 'bg-surface-muted font-bold text-foreground border-foreground'
                      : 'text-foreground/80 hover:bg-surface-muted/50 border-transparent'
                  )}
                >
                  Mimbar Surat Pembaca
                </Link>

                <Link
                  href="/kontributor"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2.5 px-3 transition-colors border-l-2',
                    pathname === '/kontributor'
                      ? 'bg-surface-muted font-bold text-foreground border-foreground'
                      : 'text-foreground/80 hover:bg-surface-muted/50 border-transparent'
                  )}
                >
                  Jejaring Pegiat &amp; Relawan
                </Link>
              </nav>

              {/* User Shortcuts & Mobile Preferences */}
              <div className="pt-3 border-t border-border-hairline flex flex-col gap-2.5">
                <div className="flex items-center justify-between py-1 px-1 border-b border-border-hairline">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted font-mono">
                    Mode Tema Tampilan
                  </span>
                  <ThemeToggle />
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-foreground text-background font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity touch-tactile"
                >
                  Dasbor Anggota
                </Link>
                <div className="flex gap-2">
                  <Link
                    href="/dashboard/tulisan/tulis"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 border border-foreground text-foreground text-xs font-bold uppercase hover:bg-surface-muted transition-colors touch-tactile"
                  >
                    + Tulis Naskah
                  </Link>
                  <Link
                    href="/dashboard/notifikasi"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 border border-border-hairline text-foreground text-xs font-bold uppercase hover:bg-surface-muted transition-colors flex items-center justify-center gap-1.5 touch-tactile"
                  >
                    <NotificationBell />
                    <span>Warta</span>
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
