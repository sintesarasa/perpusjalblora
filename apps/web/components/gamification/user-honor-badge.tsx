'use client';

import * as React from 'react';
import Link from 'next/link';
import { Award, ChevronDown, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeInsignia } from './badge-insignia';
import { getTierInfo, inferTierFromTitle } from '@/lib/badge-tier-styles';

interface BadgeSummaryItem {
  code: string;
  name: string;
  iconName?: string;
  tier: number;
  category?: string;
  titleReward?: string | null;
}

interface UserHonorBadgeProps {
  equippedTitle?: string | null;
  equippedBadge?: BadgeSummaryItem | null;
  earnedBadgesCount?: number;
  badges?: any[];
  username?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function UserHonorBadge({
  equippedTitle,
  equippedBadge,
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

  // Normalize badges array because Prisma returns { badge: BadgeSummaryItem } while client DTO might pass BadgeSummaryItem directly
  const normalizedBadges: BadgeSummaryItem[] = React.useMemo(() => {
    if (!badges || !Array.isArray(badges)) return [];
    return badges
      .map((item: any) => (item?.badge ? item.badge : item))
      .filter((b): b is BadgeSummaryItem => Boolean(b && b.code));
  }, [badges]);

  // Resolve active badge to find its tier and icon
  const activeBadge: BadgeSummaryItem | undefined =
    equippedBadge ||
    (equippedTitle
      ? normalizedBadges.find((b) => b.titleReward === equippedTitle || b.name === equippedTitle)
      : undefined);

  // If active badge is not explicitly found, infer tier from title dictionary
  const activeTier = activeBadge?.tier || inferTierFromTitle(equippedTitle);
  const tierInfo = getTierInfo(activeTier);
  const extraCount = Math.max(0, earnedBadgesCount - (equippedTitle ? 1 : 0));

  return (
    <div
      className={cn('relative inline-flex items-center gap-1.5 font-mono select-none align-middle', className)}
      ref={popoverRef}
    >
      {/* ── 1. Primary Equipped Title Tag with Tier Colors & Insignia Icon ── */}
      {equippedTitle ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={cn(
            'group relative inline-flex items-center gap-1.5 transition-all duration-150 cursor-pointer font-bold rounded-none',
            tierInfo.honorBadgeClass,
            size === 'sm'
              ? 'px-2.5 py-0.5 text-[9.5px] hover:-translate-y-0.5'
              : 'px-3 py-1 text-xs hover:-translate-y-0.5'
          )}
          title={`Gelar Kehormatan: "${equippedTitle}" (Tier ${activeTier} • ${tierInfo.name}). Klik untuk koleksi lencana.`}
        >
          {/* Badge Insignia / Icon for Tier */}
          <BadgeInsignia
            code={activeBadge?.code || 'HONOR_BADGE'}
            tier={activeTier}
            category={activeBadge?.category}
            earned={true}
            size="xs"
            variant="solid-inverted"
            className="-my-1 -ml-1 shrink-0"
          />
          <span className="tracking-wider uppercase font-mono truncate max-w-[150px] sm:max-w-none">
            {equippedTitle}
          </span>
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
            'inline-flex items-center gap-1 border border-foreground/70 bg-surface text-foreground font-mono font-bold tracking-tight rounded-none transition-all duration-150 cursor-pointer',
            size === 'sm'
              ? 'px-2 py-0.5 text-[9px] hover:-translate-y-0.5'
              : 'px-2.5 py-0.5 text-[10px] hover:-translate-y-0.5',
            isOpen && 'bg-foreground text-background'
          )}
          title={`Lihat ${earnedBadgesCount} total lencana & gelar`}
        >
          <Award className="w-2.5 h-2.5 shrink-0" />
          <span>+{extraCount} Lencana</span>
          <ChevronDown className={cn('w-2 h-2 transition-transform duration-150', isOpen && 'rotate-180')} />
        </button>
      )}

      {/* ── 3. Popover Collection Folio (Koleksi Lencana & Julukan) ── */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-surface border-2 border-foreground z-50 p-4 animate-in fade-in-50 zoom-in-95 duration-100 rounded-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Folio Header */}
          <div className="flex items-center justify-between border-b-2 border-foreground pb-2.5 mb-3">
            <div className="space-y-0.5">
              <span className="font-mono text-[9px] uppercase font-black tracking-widest text-muted block">
                KOLEKSI LENCANA & JULUKAN
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
            <div className={cn('mb-3 p-2.5 border-2 flex items-center justify-between gap-2 rounded-none', tierInfo.honorBadgeClass)}>
              <div className="min-w-0">
                <span className="font-mono text-[8.5px] uppercase tracking-wider font-bold block opacity-80">
                  GELAR UTAMA TERPASANG (TIER {activeTier} • {tierInfo.name})
                </span>
                <span className="font-serif font-bold text-xs truncate block">
                  "{equippedTitle}"
                </span>
              </div>
              <BadgeInsignia
                code={activeBadge?.code || 'HONOR_BADGE'}
                tier={activeTier}
                category={activeBadge?.category}
                earned={true}
                size="xs"
                variant="solid-inverted"
              />
            </div>
          )}

          {/* List of Earned Badges with Bespoke Insignia */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted pb-1 border-b border-border-hairline">
              <span>CAPAIAN TERBUKA</span>
              <span>{earnedBadgesCount} Lencana</span>
            </div>

            <div className="max-h-52 overflow-y-auto divide-y divide-border-hairline pr-1 space-y-1 scrollbar-thin">
              {normalizedBadges.length > 0 ? (
                normalizedBadges.map((b, idx) => {
                  const bTier = getTierInfo(b.tier);
                  return (
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
                            Tier {b.tier} • {bTier.name} • {b.category || 'Pilar'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center font-mono text-[10px] text-muted leading-relaxed">
                  {earnedBadgesCount} Lencana telah tercatat di kearsipan koleksi.
                </div>
              )}
            </div>
          </div>

          {/* Footer Link to Public Profile */}
          {username && (
            <div className="pt-2.5 border-t border-border-hairline text-center">
              <Link
                href={`/warga/${username}`}
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 border border-foreground bg-foreground text-background font-mono text-[10px] uppercase font-bold hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>Buka Lembaran Prestasi di Profil</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
