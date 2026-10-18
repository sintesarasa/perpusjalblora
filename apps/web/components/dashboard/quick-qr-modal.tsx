'use client';

import * as React from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { X, Copy, Check, ExternalLink, QrCode as QrIcon, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    username: string;
    role?: string;
    trustLevel?: string;
  } | null;
}

export function QuickQrModal({ isOpen, onClose, user }: QuickQrModalProps) {
  const [qrSvg, setQrSvg] = React.useState<string>('');
  const [copied, setCopied] = React.useState(false);

  const memberCode = user ? `PJL-${user.id.slice(-6).toUpperCase()}` : '';

  React.useEffect(() => {
    if (!isOpen || !memberCode) return;

    QRCode.toString(memberCode, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => {
        console.error('Failed to generate quick QR:', err);
      });
  }, [isOpen, memberCode]);

  // Lock body scroll and handle Escape key
  React.useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleCopyCode = () => {
    if (!memberCode) return;
    navigator.clipboard.writeText(memberCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Slide-up Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Kartu Akses Cepat Anggota"
        className="relative w-full sm:max-w-md bg-surface border-t-2 sm:border-2 border-foreground shadow-2xl p-5 sm:p-6 z-10 font-mono text-xs animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-foreground" />
            <span className="font-bold uppercase tracking-widest text-foreground text-[11px]">
              KARTU AKSES CEPAT LAPAK
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-border-hairline hover:border-foreground text-foreground transition-colors touch-tactile"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-center">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              {user.name}
            </h3>
            <p className="font-mono text-xs text-muted mt-0.5">
              @{user.username} • <span className="uppercase text-foreground font-semibold">{user.role || 'WARGA'}</span> (Level {user.trustLevel || 'TL1'})
            </p>
          </div>

          {/* High Contrast QR Code Box */}
          <div className="bg-white p-4 border-2 border-foreground inline-block shadow-sm mx-auto max-w-[240px] w-full aspect-square flex items-center justify-center">
            {qrSvg ? (
              <div
                className="w-full h-full [&_svg]:w-full [&_svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="animate-pulse w-full h-full bg-muted/20" />
            )}
          </div>

          {/* Member Code with Copy Button */}
          <div className="p-2.5 bg-surface-muted border border-border-hairline flex items-center justify-between gap-2 max-w-[280px] mx-auto">
            <div className="text-left">
              <span className="text-[9px] text-muted uppercase block leading-none">KODE ANGGOTA:</span>
              <span className="font-mono text-base font-black tracking-wider text-foreground">
                {memberCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-2.5 py-1.5 border border-foreground bg-foreground text-background font-mono text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 touch-tactile flex items-center gap-1 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          <p className="font-sans text-[11px] text-muted leading-relaxed max-w-xs mx-auto">
            Tunjukkan kode QR ini langsung ke kamera pemindai relawan saat serah-terima buku di lapak CFD Alun-Alun atau Basecamp.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-dashed border-border-hairline flex flex-col gap-2">
          <Link
            href="/dashboard/kartu-anggota"
            onClick={onClose}
            className="w-full py-2.5 border border-border-hairline hover:border-foreground bg-surface text-foreground font-mono text-xs uppercase tracking-wider font-bold text-center inline-flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
          >
            <span>Buka Versi Lengkap &amp; Cetak Zine</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
