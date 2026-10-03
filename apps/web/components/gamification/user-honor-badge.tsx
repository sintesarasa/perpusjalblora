'use client';

import * as React from 'react';
import Link from 'next/link';
import { Award, ChevronDown, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeInsignia } from './badge-insignia';

interface UserHonorBadgeProps {
  equippedTitle?: string | null;
  earnedBadgesCount?: number;
  badges?: Array<{
    code: string;
    name: string;
    iconName?: string;
    tier: number;
    category?: string;
  }>;
  username?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function UserHonorBadge({
  equippedTitle,
  earnedBadgesCount = 0,
  badges = [],
  username,
  className,
  size = 'sm',
}: UserHonorBadgeProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!equippedTitle && earnedBadgesCount === 0) {
    return null;
  }

  const extraCount = Math.max(0, earnedBadgesCount - (equippedTitle ? 1 : 0));

  return (
    <div
      className={cn('relative inline-flex items-center gap-1.5 font-mono select-none align-middle', className)}
      ref={popoverRef}
    >
      {/* ── 1. Primary Equipped Title Tag (Editorial Broadsheet Medal) ── */}
      {equippedTitle ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={cn(
            'group relative inline-flex items-center gap-1.5 transition-all duration-150 cursor-pointer font-bold',
            size === 'sm'
              ? 'px-2 py-0.5 text-[9.5px] border-2 border-foreground bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.85)] hover:-translate-y-0.5'
              : 'px-2.5 py-1 text-xs border-2 border-foreground bg-foreground text-background shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-0.5'
          )}
          title={`Gelar Kehormatan: "${equippedTitle}". Klik untuk paspor lencana.`}
        >
          {/* Ornamental Star */}
          <span className="text-amber-400 dark:text-amber-300 text-[10px] leading-none">✦</span>
          <span className="tracking-wider uppercase font-mono">{equippedTitle}</span>
        </button>
      ) : null}

      {/* ── 2. Extra Badges Medallion Pill ── */}
      {extraCount > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={cn(
            'inline-flex items-center gap-1 border-2 border-foreground bg-surface text-foreground font-mono font-bold tracking-tight transition-all duration-150 cursor-pointer',
            size === 'sm'
              ? 'px-1.5 py-0.5 text-[9px] shadow-[1.5px_1.5px_0px_0px_currentColor] hover:-translate-y-0.5'
              : 'px-2 py-0.5 text-[10px] shadow-[2px_2px_0px_0px_currentColor] hover:-translate-y-0.5',
            isOpen && 'bg-foreground text-background'
          )}
          title={`Lihat ${earnedBadgesCount} total gelar & pencapaian`}
        >
          <Award className="w-2.5 h-2.5 shrink-0" />
          <span>+{extraCount} Gelar</span>
          <ChevronDown className={cn('w-2 h-2 transition-transform duration-150', isOpen && 'rotate-180')} />
        </button>
      )}

      {/* ── 3. Popover Passport Folio (Broadsheet Press Passport) ── */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-surface border-2 border-foreground shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.95)] z-50 p-4 animate-in fade-in-50 zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gazette Passport Header */}
          <div className="flex items-center justify-between border-b-2 border-foreground pb-2.5 mb-3">
            <div className="space-y-0.5">
              <span className="font-mono text-[9px] uppercase font-black tracking-widest text-muted block">
                PASPOR LENCANA RESMI
              </span>
              <h4 className="font-serif font-bold text-sm text-foreground leading-tight">
                Perpustakaan Jalanan Blora
              </h4>
            </div>
            {username && (
              <span className="font-mono text-[10px] font-bold text-muted uppercase">
                @{username}
              </span>
            )}
          </div>

          {/* Active Equipped Title Plaque */}
          {equippedTitle && (
            <div className="mb-3 p-2.5 border-2 border-foreground bg-surface-muted/40 flex items-center justify-between gap-2 shadow-xs">
              <div className="min-w-0">
                <span className="font-mono text-[8.5px] uppercase tracking-wider text-muted font-bold block">
                  GELAR UTAMA TERPASANG
                </span>
                <span className="font-serif font-bold text-xs text-foreground truncate block">
                  "{equippedTitle}"
                </span>
              </div>
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
          )}

          {/* List of Earned Badges with Bespoke Insignia */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted pb-1 border-b border-border-hairline">
              <span>DAFTAR CAPAIAN TERBUKA</span>
              <span>{earnedBadgesCount} Lencana</span>
            </div>

            <div className="max-h-52 overflow-y-auto divide-y divide-border-hairline pr-1 space-y-1 scrollbar-thin">
              {badges.length > 0 ? (
                badges.map((b, idx) => (
                  <div
                    key={b.code || idx}
                    className="pt-2 pb-1.5 flex items-center justify-between text-xs gap-2 group hover:bg-surface-muted/20 px-1 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BadgeInsignia
                        code={b.code}
                        tier={b.tier}
                        category={b.category}
                        earned={true}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <span className="font-serif font-bold text-xs text-foreground block truncate">
                          {b.name}
                        </span>
                        <span className="font-mono text-[9px] text-muted block uppercase">
                          Tier {b.tier} &bull; {b.category || 'Pilar'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center font-mono text-[10px] text-muted leading-relaxed">
                  {earnedBadgesCount} Gelar telah tercatat di kearsipan paspor.
                </div>
              )}
            </div>
          </div>

          {/* Footer Link to Public Profile */}
          {username && (
            <div className="pt-2.5 border-t border-border-hairline text-center">
              <Link
                href={`/u/${username}`}
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 border border-foreground bg-foreground text-background font-mono text-[10px] uppercase font-bold hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>Buka Paspor Lengkap di Profil</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
