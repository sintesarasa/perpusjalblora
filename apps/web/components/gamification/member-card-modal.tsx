'use client';

import * as React from 'react';
import {
  CreditCard,
  X,
  Printer,
  Copy,
  Check,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeInsignia } from './badge-insignia';
import { getTierInfo } from '@/lib/badge-tier-styles';
import { UserAvatar } from '@/components/ui/user-avatar';

interface MemberCardModalProps {
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
    role: string;
    createdAt: string;
    equippedTitle?: string | null;
    equippedBadge?: {
      code: string;
      name: string;
      tier: number;
      category?: string;
    } | null;
    stats: {
      totalArticles: number;
      badgesCount: number;
      loansCount?: number;
      booksDonated?: number;
      onTimeStreak?: number;
    };
  };
  triggerClassName?: string;
}

export function MemberCardModal({ user, triggerClassName }: MemberCardModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const joinedYear = new Date(user.createdAt).getFullYear();
  const memberRegNo = `BLR-${joinedYear}-${user.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;

  const activeTier = user.equippedBadge?.tier || 1;
  const tierInfo = getTierInfo(activeTier);

  // Close on ESC
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/u/${user.username}` : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground bg-surface hover:bg-foreground hover:text-background font-mono text-xs uppercase font-bold tracking-wider transition-colors shadow-xs cursor-pointer',
          triggerClassName
        )}
        title="Buka Kartu Anggota Digital Kolektif"
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>Kartu Anggota Digital</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-surface border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.9)] p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Controls */}
            <div className="flex items-center justify-between border-b-2 border-foreground pb-3 print:hidden">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted">
                DOKUMEN KEARSIPAN RESMI PERPUSJAL
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-surface-muted text-foreground transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── THE PRINTABLE VINTAGE MEMBER CARD ── */}
            <div
              id="printable-member-card"
              className="border-2 border-foreground p-5 sm:p-6 bg-surface relative overflow-hidden select-none space-y-4"
            >
              {/* Card Watermark */}
              <div className="absolute right-3 -bottom-6 font-mono font-black text-7xl text-foreground/5 pointer-events-none select-none">
                BLORA
              </div>

              {/* Card Masthead */}
              <div className="flex items-start justify-between border-b-2 border-foreground pb-3 gap-2">
                <div className="space-y-0.5">
                  <span className="font-mono text-[9px] uppercase font-black tracking-widest text-muted block">
                    KARTU ANGGOTA KOLEKTIF LITERASI
                  </span>
                  <h3 className="font-serif font-black text-lg sm:text-xl text-foreground tracking-tight leading-tight">
                    Perpustakaan Jalanan Blora
                  </h3>
                  <span className="font-mono text-[9px] text-muted block">
                    Ruang Baca Merdeka & Wacana Kritis Warga
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-[9px] uppercase font-bold text-muted block">
                    NO. REGISTRASI
                  </span>
                  <span className="font-mono text-xs font-bold text-foreground tracking-wider block">
                    {memberRegNo}
                  </span>
                </div>
              </div>

              {/* Card Identity & Equipped Medal */}
              <div className="flex items-center gap-4 py-2">
                <UserAvatar
                  src={user.avatarUrl}
                  name={user.name}
                  username={user.username}
                  size="lg"
                  shape="circle"
                  className="border-2 border-foreground shrink-0 shadow-xs"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-serif font-bold text-base sm:text-lg text-foreground truncate">
                    {user.name}
                  </h4>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-muted uppercase">
                    <span>@{user.username}</span>
                    <span>&bull;</span>
                    <span>Warga Sejak {joinedYear}</span>
                  </div>

                  {/* Active Equipped Title Medal */}
                  {user.equippedTitle ? (
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 border-2 text-[10px] font-mono font-bold uppercase tracking-wider',
                        tierInfo.badgeTagClass
                      )}
                    >
                      {user.equippedBadge && (
                        <BadgeInsignia
                          code={user.equippedBadge.code}
                          tier={activeTier}
                          category={user.equippedBadge.category}
                          earned={true}
                          size="xs"
                          className="scale-75 -my-1 -ml-1"
                        />
                      )}
                      <span>{user.equippedTitle}</span>
                    </div>
                  ) : (
                    <span className="font-mono text-[9px] text-muted italic block">
                      (Belum menyematkan gelar kehormatan)
                    </span>
                  )}
                </div>
              </div>

              {/* Card Stats Registry */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t-2 border-foreground font-mono text-center">
                <div className="p-1.5 border border-border-hairline bg-surface-muted/30">
                  <span className="text-[8px] uppercase text-muted block font-semibold">Tulisan</span>
                  <span className="font-bold text-sm text-foreground">{user.stats.totalArticles}</span>
                </div>
                <div className="p-1.5 border border-border-hairline bg-surface-muted/30">
                  <span className="text-[8px] uppercase text-muted block font-semibold">Lencana</span>
                  <span className="font-bold text-sm text-foreground">{user.stats.badgesCount}</span>
                </div>
                <div className="p-1.5 border border-border-hairline bg-surface-muted/30">
                  <span className="text-[8px] uppercase text-muted block font-semibold">Pinjaman</span>
                  <span className="font-bold text-sm text-foreground">{user.stats.loansCount ?? 0}</span>
                </div>
                <div className="p-1.5 border border-border-hairline bg-surface-muted/30">
                  <span className="text-[8px] uppercase text-muted block font-semibold">Streak Amanah</span>
                  <span className="font-bold text-sm text-foreground">{user.stats.onTimeStreak ?? 0}x</span>
                </div>
              </div>

              {/* Official Seal / Signature Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-dashed border-border-hairline font-mono text-[8.5px] text-muted uppercase">
                <span>TERVERIFIKASI SISTEM KEARSIPAN</span>
                <span className="font-bold text-foreground">RUANG BACA RAKYAT BLORA</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden font-mono text-xs">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 border-2 border-foreground bg-surface hover:bg-surface-muted text-foreground font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan Profil'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 border-2 border-foreground bg-foreground text-background hover:bg-foreground/90 font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan Kartu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
