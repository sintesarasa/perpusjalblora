'use client';

import * as React from 'react';
import {
  BookOpen,
  BookMarked,
  Library,
  Flame,
  GraduationCap,
  Crown,
  Feather,
  FileText,
  Newspaper,
  PenTool,
  Scroll,
  MessageSquare,
  MessageCircle,
  MessagesSquare,
  Zap,
  Shield,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Award,
  Key,
  MapPin,
  Users,
  Calendar,
  Landmark,
  Gift,
  Heart,
  Package,
  Layers,
  Lock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeCategory } from '@perpusjal/types';

interface BadgeInsigniaProps {
  code: string;
  category?: string;
  tier?: number;
  earned?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTierTag?: boolean;
}

const ROMAN_NUMERALS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
};

export function BadgeInsignia({
  code,
  category,
  tier = 1,
  earned = false,
  size = 'md',
  className,
  showTierTag = false,
}: BadgeInsigniaProps) {
  // Render specific icon based on badge code
  const renderIcon = () => {
    const iconSizeClass = {
      xs: 'w-3 h-3',
      sm: 'w-3.5 h-3.5',
      md: 'w-5 h-5',
      lg: 'w-7 h-7',
      xl: 'w-9 h-9',
    }[size];

    switch (code) {
      // ── WACANA ──
      case 'WACANA_T1':
        return <BookOpen className={iconSizeClass} />;
      case 'WACANA_T2':
        return <BookMarked className={iconSizeClass} />;
      case 'WACANA_T3':
        return <Library className={iconSizeClass} />;
      case 'WACANA_T4':
        return <Flame className={iconSizeClass} />;
      case 'WACANA_T5':
        return <GraduationCap className={iconSizeClass} />;
      case 'WACANA_T6':
        return <Crown className={iconSizeClass} />;

      // ── TINTA ──
      case 'TINTA_T1':
        return <Feather className={iconSizeClass} />;
      case 'TINTA_T2':
        return <FileText className={iconSizeClass} />;
      case 'TINTA_T3':
        return <Newspaper className={iconSizeClass} />;
      case 'TINTA_T4':
        return <PenTool className={iconSizeClass} />;
      case 'TINTA_T5':
        return <Scroll className={iconSizeClass} />;
      case 'TINTA_T6':
        return <Crown className={iconSizeClass} />;

      // ── DIALEKTIKA ──
      case 'DIALEKTIKA_T1':
        return <MessageSquare className={iconSizeClass} />;
      case 'DIALEKTIKA_T2':
        return <MessageCircle className={iconSizeClass} />;
      case 'DIALEKTIKA_T3':
        return <MessagesSquare className={iconSizeClass} />;
      case 'DIALEKTIKA_T4':
        return <Zap className={iconSizeClass} />;
      case 'DIALEKTIKA_T5':
        return <Shield className={iconSizeClass} />;
      case 'DIALEKTIKA_T6':
        return <Crown className={iconSizeClass} />;

      // ── AMANAH ──
      case 'AMANAH_T1':
        return <Compass className={iconSizeClass} />;
      case 'AMANAH_T2':
        return <CheckCircle2 className={iconSizeClass} />;
      case 'AMANAH_T3':
        return <ShieldCheck className={iconSizeClass} />;
      case 'AMANAH_T4':
        return <Shield className={iconSizeClass} />;
      case 'AMANAH_T5':
        return <Award className={iconSizeClass} />;
      case 'AMANAH_T6':
        return <Key className={iconSizeClass} />;

      // ── PRESENSI ──
      case 'PRESENSI_T1':
        return <MapPin className={iconSizeClass} />;
      case 'PRESENSI_T2':
        return <Users className={iconSizeClass} />;
      case 'PRESENSI_T3':
        return <Calendar className={iconSizeClass} />;
      case 'PRESENSI_T4':
        return <Flame className={iconSizeClass} />;
      case 'PRESENSI_T5':
        return <Landmark className={iconSizeClass} />;
      case 'PRESENSI_T6':
        return <Crown className={iconSizeClass} />;

      // ── DONATUR ──
      case 'DONATUR_T1':
        return <Gift className={iconSizeClass} />;
      case 'DONATUR_T2':
        return <Heart className={iconSizeClass} />;
      case 'DONATUR_T3':
        return <Package className={iconSizeClass} />;
      case 'DONATUR_T4':
        return <Layers className={iconSizeClass} />;
      case 'DONATUR_T5':
        return <Award className={iconSizeClass} />;
      case 'DONATUR_T6':
        return <Crown className={iconSizeClass} />;

      default:
        return <Sparkles className={iconSizeClass} />;
    }
  };

  const sizeBoxClass = {
    xs: 'w-7 h-7 text-[8px]',
    sm: 'w-9 h-9 text-[9px]',
    md: 'w-12 h-12 text-[10px]',
    lg: 'w-16 h-16 text-xs',
    xl: 'w-20 h-20 text-sm',
  }[size];

  // Editorial frame styles per tier
  const tierFrameStyle = {
    1: 'border',
    2: 'border-2',
    3: 'border-2 shadow-[2px_2px_0px_0px_currentColor]',
    4: 'border-2 shadow-[3px_3px_0px_0px_currentColor]',
    5: 'border-2 ring-1 ring-foreground/20 shadow-[3px_3px_0px_0px_currentColor]',
    6: 'border-2 ring-2 ring-amber-500/30 shadow-[4px_4px_0px_0px_rgba(217,119,6,0.5)]',
  }[tier] || 'border';

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center shrink-0', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center transition-transform duration-200 select-none',
          sizeBoxClass,
          tierFrameStyle,
          earned
            ? tier === 6
              ? 'border-amber-600 bg-amber-500/10 text-amber-800 dark:text-amber-300 dark:border-amber-400'
              : 'border-foreground bg-surface text-foreground shadow-xs'
            : 'border-border-hairline bg-surface-muted/50 text-muted/60 border-dashed'
        )}
      >
        {/* Tier Roman Numeral Watermark in background */}
        <span
          className={cn(
            'absolute font-mono font-black pointer-events-none opacity-10 select-none leading-none',
            size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-2xl' : 'text-base'
          )}
        >
          {ROMAN_NUMERALS[tier] || tier}
        </span>

        {/* Center Symbol */}
        <div className="relative z-10">{renderIcon()}</div>

        {/* Locked Padlock Accent if not earned */}
        {!earned && (
          <div className="absolute -top-1 -right-1 bg-surface border border-border-hairline p-0.5 shadow-xs">
            <Lock className="w-2 h-2 text-muted" />
          </div>
        )}

        {/* Tier 6 Crown Accents */}
        {tier === 6 && earned && (
          <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-background p-0.5 rounded-full shadow-xs">
            <Crown className="w-2.5 h-2.5" />
          </div>
        )}
      </div>

      {showTierTag && (
        <span className="mt-1 font-mono text-[9px] font-bold text-muted uppercase tracking-widest">
          T{ROMAN_NUMERALS[tier] || tier}
        </span>
      )}
    </div>
  );
}
