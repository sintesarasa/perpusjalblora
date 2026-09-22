'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  BookOpen,
  CreditCard,
  Feather,
  Award,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  Users,
} from 'lucide-react';
import { Role } from '@perpusjal/types';
import { apiClient } from '@/lib/api';

interface CurrentUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
}

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const fetchCurrentUser = React.useCallback(async () => {
    try {
      const res = await apiClient<{ user: CurrentUser }>('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Click outside to close
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignored
    } finally {
      setUser(null);
      router.push('/masuk');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="hidden sm:inline-block w-20 h-7 bg-surface-muted/50 border border-border-hairline animate-pulse" />
    );
  }

  // GUEST STATE
  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link
          href="/masuk"
          className="hidden sm:inline-flex items-center px-3 py-1 border border-foreground font-mono text-[11px] uppercase tracking-wider font-semibold hover:bg-foreground hover:text-background transition-colors"
        >
          Masuk
        </Link>
        <Link
          href="/daftar"
          className="hidden md:inline-flex items-center px-3 py-1 border border-border-hairline bg-surface-muted text-foreground font-mono text-[11px] uppercase tracking-wider hover:border-foreground transition-colors"
        >
          Daftar
        </Link>
      </div>
    );
  }

  // AUTHENTICATED STATE
  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 border border-foreground bg-surface hover:bg-surface-muted transition-colors"
        aria-expanded={isOpen}
      >
        {/* Monogram / Avatar */}
        <div className="w-5 h-5 bg-foreground text-background flex items-center justify-center font-serif text-[11px] font-bold uppercase shrink-0">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover grayscale" />
          ) : (
            user.name.slice(0, 1)
          )}
        </div>

        {/* Display name & role */}
        <div className="hidden sm:flex flex-col text-left leading-none">
          <span className="font-serif text-xs font-bold text-foreground truncate max-w-[110px]">
            {user.name.split(' ')[0]}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted mt-0.5">
            {user.role}
          </span>
        </div>

        <ChevronDown className="w-3 h-3 text-muted" />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface border border-foreground shadow-2xl z-50 animate-in fade-in-50 duration-150 divide-y divide-border-hairline">
          {/* User Header */}
          <div className="p-3 bg-surface-muted/40 font-mono">
            <div className="text-xs font-bold font-serif text-foreground truncate">{user.name}</div>
            <div className="text-[10px] text-muted truncate">@{user.username}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 border border-foreground bg-foreground text-background text-[9px] font-bold uppercase tracking-wider">
                {user.role}
              </span>
              <span className="text-[9px] text-muted truncate">{user.email}</span>
            </div>
          </div>

          {/* Member Services (Dasbor) */}
          <div className="py-1 font-mono text-xs">
            <div className="px-3 py-1 text-[9px] uppercase tracking-widest text-muted font-bold">
              Dasbor Anggota
            </div>

            <Link
              href="/dashboard/pinjaman"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-surface-muted transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-muted" />
              <span>Pinjaman Buku</span>
            </Link>

            <Link
              href="/dashboard/kartu-anggota"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-surface-muted transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-muted" />
              <span>Kartu Anggota</span>
            </Link>

            <Link
              href="/dashboard/tulisan"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-surface-muted transition-colors"
            >
              <Feather className="w-3.5 h-3.5 text-muted" />
              <span>Tulisan Saya</span>
            </Link>

            <Link
              href="/dashboard/badge"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-surface-muted transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-muted" />
              <span>Lencana Apresiasi</span>
            </Link>

            <Link
              href={`/u/${user.username}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-surface-muted transition-colors"
            >
              <User className="w-3.5 h-3.5 text-muted" />
              <span>Profil Publik</span>
            </Link>

            <Link
              href="/dashboard/profil"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-surface-muted transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-muted" />
              <span>Pengaturan & Privasi</span>
            </Link>
          </div>

          {/* Pengurus Area (Kurator / Admin) */}
          {(user.role === Role.KURATOR || user.role === Role.ADMIN) && (
            <div className="py-1 font-mono text-xs bg-surface-muted/20">
              <div className="px-3 py-1 text-[9px] uppercase tracking-widest text-muted font-bold">
                Kewenangan Pengurus
              </div>

              <Link
                href="/admin/kurasi"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-surface-muted transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-muted" />
                <span>Meja Kurasi</span>
              </Link>

              {user.role === Role.ADMIN && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-surface-muted transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-muted" />
                    <span>Dasbor Utama</span>
                  </Link>

                  <Link
                    href="/admin/sirkulasi"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-surface-muted transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-muted" />
                    <span>Mode Lapak Sirkulasi</span>
                  </Link>

                  <Link
                    href="/admin/pengguna"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-foreground hover:bg-surface-muted transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-muted" />
                    <span>Kelola Pengguna</span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Logout */}
          <div className="p-1 font-mono text-xs">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5 text-red-700" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
