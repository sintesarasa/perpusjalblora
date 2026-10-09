'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Check,
  Printer,
  Maximize2,
  Minimize2,
  Type,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type TextScale = 'sm' | 'base' | 'lg' | 'xl';

interface ArticleReaderToolbarProps {
  title: string;
  slug: string;
  readingTime: number;
  commentCount: number;
  textScale: TextScale;
  onTextScaleChange: (scale: TextScale) => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  onScrollToComments?: () => void;
}

export function ArticleReaderToolbar({
  title,
  slug,
  readingTime,
  commentCount,
  textScale,
  onTextScaleChange,
  isZenMode,
  onToggleZenMode,
  onScrollToComments,
}: ArticleReaderToolbarProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent(`"${title}" — Baca catatan di Perpusjal Blora: ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const handleShareX = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent(`"${title}" via @perpusjalblora`);
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const nextScale: Record<TextScale, TextScale> = {
    sm: 'base',
    base: 'lg',
    lg: 'xl',
    xl: 'sm',
  };

  const scaleLabel: Record<TextScale, string> = {
    sm: 'Kecil',
    base: 'Standar',
    lg: 'Besar',
    xl: 'Ekstra',
  };

  return (
    <aside
      aria-label="Alat Baca Naskah"
      className={cn(
        'transition-all duration-300 print:hidden select-none',
        isZenMode
          ? 'fixed bottom-6 right-6 z-50 bg-background/95 backdrop-blur border-2 border-foreground p-2 flex items-center gap-2 font-mono text-xs rounded-none shadow-none'
          : 'border-y border-border-hairline py-2.5 my-6 max-w-[680px] mx-auto flex flex-wrap items-center justify-between gap-3 font-mono text-xs bg-surface-muted/20'
      )}
    >
      {/* Left side: Editorial Section Label */}
      {!isZenMode && (
        <div className="flex items-center gap-2 text-muted px-1">
          <span className="w-1.5 h-1.5 bg-foreground rounded-none" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold">
            LEMBARAN BACAAN
          </span>
        </div>
      )}

      {/* Right side: Reader Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap ml-auto">
        {/* Font size cycler */}
        <button
          type="button"
          onClick={() => onTextScaleChange(nextScale[textScale])}
          className="px-2.5 py-1 border border-border-hairline hover:border-foreground bg-surface text-foreground transition-colors flex items-center gap-1.5 text-[10.5px] tracking-wider uppercase rounded-none cursor-pointer"
          title={`Ubah ukuran font (Saat ini: ${scaleLabel[textScale]})`}
        >
          <Type className="w-3.5 h-3.5 text-muted" />
          <span>HURUF: {scaleLabel[textScale]}</span>
        </button>

        {/* Zen Mode Switch */}
        <button
          type="button"
          onClick={onToggleZenMode}
          className={cn(
            'px-2.5 py-1 border transition-colors flex items-center gap-1.5 text-[10.5px] tracking-wider uppercase rounded-none cursor-pointer',
            isZenMode
              ? 'bg-foreground text-background border-foreground font-bold'
              : 'border-border-hairline bg-surface hover:border-foreground text-foreground'
          )}
          title={isZenMode ? 'Keluar dari Mode Fokus (ESC)' : 'Mode Fokus Membaca (Zen Mode)'}
        >
          {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-muted" />}
          <span>{isZenMode ? 'Keluar Fokus' : 'Fokus Baca'}</span>
        </button>

        {/* Print Kliping Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="hidden md:flex px-2.5 py-1 border border-border-hairline hover:border-foreground bg-surface text-foreground transition-colors items-center gap-1.5 text-[10.5px] tracking-wider uppercase rounded-none cursor-pointer"
          title="Cetak Kliping Naskah"
        >
          <Printer className="w-3.5 h-3.5 text-muted" />
          <span>Cetak</span>
        </button>

        {/* Comments Jump if provided */}
        {onScrollToComments && !isZenMode && (
          <button
            type="button"
            onClick={onScrollToComments}
            className="px-2.5 py-1 border border-border-hairline hover:border-foreground bg-surface text-foreground transition-colors flex items-center gap-1.5 text-[10.5px] tracking-wider uppercase rounded-none cursor-pointer"
            title="Lihat Komentar & Respon Warga"
          >
            <MessageSquare className="w-3.5 h-3.5 text-muted" />
            <span>{commentCount} Respon</span>
          </button>
        )}

        {/* Quick Share / Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="px-2.5 py-1 border border-border-hairline hover:border-foreground bg-surface text-foreground transition-colors flex items-center gap-1 text-[10.5px] tracking-wider uppercase rounded-none cursor-pointer"
          title="Salin Tautan Naskah"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-foreground" /> : <Share2 className="w-3.5 h-3.5 text-muted" />}
          <span>{copied ? 'Tersalin' : 'Bagikan'}</span>
        </button>
      </div>
    </aside>
  );
}
