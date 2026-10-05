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
        'transition-all duration-300 print:hidden',
        isZenMode
          ? 'fixed bottom-6 right-6 z-50 bg-background/95 backdrop-blur border-2 border-foreground p-2 flex items-center gap-2 font-mono text-xs'
          : 'border-y border-border-hairline py-3 my-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs bg-surface/50'
      )}
    >
      {/* Left side: Back to archive & Meta */}
      {!isZenMode && (
        <div className="flex items-center gap-3">
          <Link
            href="/artikel"
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              KEMBALI KE ARSIP
            </span>
          </Link>
          <span className="text-border-hairline">|</span>
          <span className="text-muted text-[11px] hidden sm:inline">
            Estimasi: {readingTime} Menit Baca
          </span>
        </div>
      )}

      {/* Right side: Reader Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap ml-auto">
        {/* Font size cycler */}
        <button
          type="button"
          onClick={() => onTextScaleChange(nextScale[textScale])}
          className="px-2.5 py-1.5 border border-border bg-background hover:bg-surface-muted hover:border-foreground text-foreground transition-colors flex items-center gap-1.5 text-[11px] tracking-wider"
          title={`Ubah ukuran font (Saat ini: ${scaleLabel[textScale]})`}
        >
          <Type className="w-3.5 h-3.5 text-muted" />
          <span className="uppercase">{scaleLabel[textScale]}</span>
        </button>

        {/* Zen Mode Switch */}
        <button
          type="button"
          onClick={onToggleZenMode}
          className={cn(
            'px-2.5 py-1.5 border transition-colors flex items-center gap-1.5 text-[11px] tracking-wider uppercase',
            isZenMode
              ? 'bg-foreground text-background border-foreground font-bold'
              : 'border-border bg-background hover:bg-surface-muted hover:border-foreground text-foreground'
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
          className="hidden md:flex px-2.5 py-1.5 border border-border bg-background hover:bg-surface-muted hover:border-foreground text-foreground transition-colors items-center gap-1.5 text-[11px] tracking-wider uppercase"
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
            className="px-2.5 py-1.5 border border-border bg-background hover:bg-surface-muted hover:border-foreground text-foreground transition-colors flex items-center gap-1.5 text-[11px] tracking-wider uppercase"
            title="Lihat Komentar & Respon Warga"
          >
            <MessageSquare className="w-3.5 h-3.5 text-muted" />
            <span>{commentCount} Respon</span>
          </button>
        )}

        {/* Share buttons */}
        <div className="flex items-center border border-border bg-background">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-2.5 py-1.5 hover:bg-surface-muted text-muted hover:text-foreground transition-colors border-r border-border text-[11px] flex items-center gap-1 uppercase"
            title="Salin Tautan"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Bagikan'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-2 py-1.5 hover:bg-surface-muted text-emerald-600 transition-colors border-r border-border text-[11px] font-bold"
            title="Kirim ke WhatsApp"
          >
            WA
          </button>

          <button
            type="button"
            onClick={handleShareX}
            className="px-2 py-1.5 hover:bg-surface-muted text-muted hover:text-foreground transition-colors text-[11px] font-bold"
            title="Bagikan ke X / Twitter"
          >
            𝕏
          </button>
        </div>
      </div>
    </aside>
  );
}
