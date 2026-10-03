'use client';

import * as React from 'react';
import Link from 'next/link';
import { Award, ChevronDown, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserHonorBadgeProps {
  equippedTitle?: string | null;
  earnedBadgesCount?: number;
  badges?: Array<{ code: string; name: string; iconName: string; tier: number }>;
  username?: string;
  className?: string;
}

export function UserHonorBadge({
  equippedTitle,
  earnedBadgesCount = 0,
  badges = [],
  username,
  className,
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
    <div className={cn('relative inline-flex items-center gap-1.5 font-mono select-none', className)} ref={popoverRef}>
      {/* 1. Primary Equipped Title Tag */}
      {equippedTitle && (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-foreground bg-surface text-foreground font-bold text-[9px] uppercase tracking-wider shadow-xs"
          title={`Gelar Kehormatan: ${equippedTitle}`}
        >
          <Sparkles className="w-2.5 h-2.5 text-foreground" />
          <span>{equippedTitle}</span>
        </span>
      )}

      {/* 2. Extra Badges Medallion Pill */}
      {extraCount > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={cn(
            'inline-flex items-center gap-0.5 px-1 py-0.2 border border-border-hairline text-muted hover:text-foreground hover:border-foreground transition-colors text-[9px] font-mono tracking-tight',
            isOpen && 'border-foreground bg-surface-muted text-foreground'
          )}
          title={`Lihat ${earnedBadgesCount} total pencapaian`}
        >
          <Award className="w-2.5 h-2.5" />
          <span>+{extraCount} Gelar</span>
          <ChevronDown className="w-2 h-2" />
        </button>
      )}

      {/* 3. Popover Mini Passport Folio */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1.5 w-64 sm:w-72 bg-surface border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] z-50 p-3 animate-in fade-in-50 zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-hairline pb-2 mb-2">
            <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-muted">
              PASPOR PENCAPAIAN
            </span>
            <span className="font-mono text-[9px] text-foreground font-bold">
              {earnedBadgesCount} Gelar Terbuka
            </span>
          </div>

          {/* List of badges */}
          <div className="max-h-48 overflow-y-auto divide-y divide-border-hairline pr-1 space-y-1">
            {badges.length > 0 ? (
              badges.map((b, idx) => (
                <div key={b.code || idx} className="pt-1.5 pb-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 border border-border-hairline bg-surface-muted flex items-center justify-center shrink-0">
                      <Award className="w-3 h-3 text-foreground" />
                    </div>
                    <span className="font-serif font-bold text-[11px] text-foreground truncate">
                      {b.name}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] uppercase px-1 border border-border-hairline text-muted shrink-0">
                    T{b.tier || 1}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-3 text-center font-mono text-[10px] text-muted">
                {earnedBadgesCount} Gelar telah tercatat di kearsipan.
              </div>
            )}
          </div>

          {/* Footer Link to Public Profile */}
          {username && (
            <div className="mt-2.5 pt-2 border-t border-border-hairline text-center">
              <Link
                href={`/u/${username}`}
                onClick={() => setIsOpen(false)}
                className="font-mono text-[10px] uppercase font-bold text-foreground hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Paspor Lengkap di Profil →</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
