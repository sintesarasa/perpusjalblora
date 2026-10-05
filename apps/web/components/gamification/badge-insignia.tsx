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
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BadgeCategory } from '@perpusjal/types';
import { getTierInfo } from '@/lib/badge-tier-styles';

interface BadgeInsigniaProps {
  code: string;
  category?: string;
  tier?: number;
  earned?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTierTag?: boolean;
  variant?: 'default' | 'solid-inverted';
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
  variant = 'default',
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

      // ── SECRET EASTER EGGS ──
      case 'SECRET_NIGHT_OWL':
        return <Moon className={iconSizeClass} />;
      case 'SECRET_SPEED_COMMENT':
        return <Zap className={iconSizeClass} />;
      case 'SECRET_CURATOR_FAVORITE':
        return <Sparkles className={iconSizeClass} />;

      default:
        return <Sparkles className={iconSizeClass} />;
    }
  };

  const sizeBoxClass = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-18 h-18',
  }[size];

  const tierInfo = getTierInfo(tier);

  // Concentric double-ring styling for an authentic literary medallion
  const tierFrameStyle = {
    1: 'border-2',
    2: 'border-2',
    3: 'border-2',
    4: 'border-2',
    5: 'border-2 outline outline-1 outline-foreground/30',
    6: 'border-2 outline outline-2 outline-foreground',
  }[tier] || 'border-2';

  // Distinct stark monochrome locked medallion styling
  const lockedInsigniaClass =
    'border-border-hairline bg-surface-muted/50 text-muted/60 border-dashed';

  const solidInvertedClass =
    tier === 6
      ? 'border-slate-950/40 bg-black/15 text-slate-950 ring-0 shadow-none'
      : tier === 4
      ? 'border-white/50 bg-white/20 text-white dark:border-slate-950/40 dark:bg-black/15 dark:text-slate-950 ring-0 shadow-none'
      : 'border-white/50 bg-white/20 text-white ring-0 shadow-none';

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center shrink-0', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-none transition-transform duration-200 select-none shrink-0',
          sizeBoxClass,
          variant === 'solid-inverted' ? 'border' : tierFrameStyle,
          variant === 'solid-inverted'
            ? solidInvertedClass
            : earned
            ? tierInfo.insigniaClass
            : lockedInsigniaClass
        )}
      >
        {/* Center Symbol (Clean and unhampered, free of background watermarks) */}
        <div className="relative z-10 flex items-center justify-center">{renderIcon()}</div>

        {/* Minimalist Locked Padlock Accent if not earned */}
        {!earned && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-surface border border-border-hairline rounded-none p-0.5">
            <Lock className="w-2.5 h-2.5 text-muted" />
          </div>
        )}

        {/* Tier 6 Crown Accents */}
        {tier === 6 && earned && (
          <div className="absolute -top-1 -right-1 bg-foreground text-background p-0.5 rounded-none">
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
