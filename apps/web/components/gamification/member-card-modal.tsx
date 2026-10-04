'use client';

import * as React from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import {
  Sparkles,
  Download,
  Share2,
  Copy,
  Check,
  X,
  RefreshCw,
  Quote,
  Loader2,
  ShieldCheck,
  Award,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo, LogoIcon } from '@/components/logo';
import { BadgeInsignia } from './badge-insignia';
import { getTierInfo } from '@/lib/badge-tier-styles';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  CitizenQuote,
  getQuoteByUsername,
  getRandomQuote,
} from '@/lib/citizen-quotes';

interface MemberCardModalProps {
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
    bio?: string | null;
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
  const [currentQuote, setCurrentQuote] = React.useState<CitizenQuote>(() =>
    getQuoteByUsername(user.username)
  );
  const [isCustomBio, setIsCustomBio] = React.useState(false);
  const [qrSvg, setQrSvg] = React.useState<string>('');
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [downloaded, setDownloaded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const cardRef = React.useRef<HTMLDivElement>(null);

  const joinedYear = new Date(user.createdAt).getFullYear();
  const memberRegNo = `BLR-${joinedYear}-${user.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;

  const activeTier = user.equippedBadge?.tier || 1;
  const tierInfo = getTierInfo(activeTier);

  // Generate QR Code on mount or open
  React.useEffect(() => {
    if (!isOpen) return;

    const profileUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/warga/${user.username}`
        : `https://perpusjalblora.id/warga/${user.username}`;

    QRCode.toString(profileUrl, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#f4f4f0',
        light: '#0b0c0e',
      },
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });
  }, [isOpen, user.username]);

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

  // Shuffle Quote
  const handleShuffleQuote = () => {
    setIsCustomBio(false);
    setCurrentQuote(getRandomQuote());
  };

  // Copy Profile Link
  const handleCopyLink = async () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/warga/${user.username}`
        : `https://perpusjalblora.id/warga/${user.username}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Download Image as PNG HD (html-to-image)
  const handleDownloadImage = async () => {
    const node = cardRef.current;
    if (!node) return;
    setIsDownloading(true);

    try {
      // Calculate precise dimensions with safety margin so no border is cut off
      const width = node.offsetWidth;
      const height = node.scrollHeight;

      const dataUrl = await toPng(node, {
        width,
        height: height + 8,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#090a0c',
        style: {
          margin: '0',
          transform: 'none',
        },
      });

      const link = document.createElement('a');
      link.download = `kartu-kehormatan-${user.username}.png`;
      link.href = dataUrl;
      link.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to export card image:', err);
      // Fallback: copy link if image generation encounters canvas restrictions
      handleCopyLink();
    } finally {
      setIsDownloading(false);
    }
  };

  // Smart Social Share
  const handleShare = async () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/warga/${user.username}`
        : `https://perpusjalblora.id/warga/${user.username}`;

    const quoteText = isCustomBio && user.bio ? user.bio : currentQuote.quote;
    const authorText = isCustomBio ? user.name : currentQuote.author;

    const shareText = `Buka rekam jejak literasi & kartu kehormatan warga ${user.name} (@${user.username}) di Perpustakaan Jalanan Blora:\n\n"${quoteText}" — ${authorText}\n\nKunjungi: ${url}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Try sharing with PNG file if supported
        if (cardRef.current) {
          try {
            const node = cardRef.current;
            const width = node.offsetWidth;
            const height = node.scrollHeight;

            const dataUrl = await toPng(node, {
              width,
              height: height + 8,
              pixelRatio: 2,
              cacheBust: true,
              backgroundColor: '#090a0c',
              style: {
                margin: '0',
                transform: 'none',
              },
            });
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], `kartu-warga-${user.username}.png`, {
              type: 'image/png',
            });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `Kartu Kehormatan Warga: ${user.name}`,
                text: shareText,
                files: [file],
              });
              return;
            }
          } catch {
            // fallback to link share
          }
        }

        await navigator.share({
          title: `Kartu Kehormatan Warga: ${user.name}`,
          text: shareText,
          url,
        });
        return;
      } catch {
        // User cancelled or failed
      }
    }

    // Desktop WhatsApp fallback
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
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
        title="Buka Kartu Kehormatan Warga Literasi"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Kartu Kehormatan Warga</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in-50 overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-[#111215] border-2 border-amber-500/60 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.95),0_0_30px_rgba(245,158,11,0.2)] p-4 sm:p-6 space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Controls */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>KARTU KEHORMATAN WARGA • SIAP MEDSOS</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quote Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-zinc-900/80 border border-zinc-800 font-mono text-xs">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <Quote className="w-3 h-3 text-amber-400" />
                <span>Pilih Kutipan Kartu:</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleShuffleQuote}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 transition-colors cursor-pointer"
                  title="Pilih kutipan cadas lainnya secara acak"
                >
                  <RefreshCw className="w-3 h-3 animate-spin-hover" />
                  <span>Acak Kutipan 🎲</span>
                </button>

                {user.bio && (
                  <button
                    type="button"
                    onClick={() => setIsCustomBio(!isCustomBio)}
                    className={cn(
                      'px-2.5 py-1 font-mono text-[10px] uppercase font-bold tracking-wider border transition-colors cursor-pointer',
                      isCustomBio
                        ? 'bg-amber-400 text-black border-amber-400 font-black'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                    )}
                  >
                    {isCustomBio ? '✓ Bio Saya' : 'Gunakan Bio'}
                  </button>
                )}
              </div>
            </div>

            {/* ── THE STUNNING DARK CITIZEN SOCIAL CARD ── */}
            <div
              ref={cardRef}
              id="citizen-social-card"
              className="relative bg-[#090a0c] text-[#f4f4f0] p-5 sm:p-6 pb-6 sm:pb-7 border-2 border-amber-500/70 shadow-[0_15px_40px_rgba(0,0,0,0.9)] select-none space-y-4 box-border"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 40%), radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.05) 0%, transparent 35%)',
              }}
            >
              {/* Background decorative wrapper (clipped to container bounds) */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-none">
                {/* Corner Ornamental Accents */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/60" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/60" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/60" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/60" />

                {/* Background Watermark */}
                <div className="absolute right-2 -bottom-2 font-mono font-black text-7xl text-amber-500/[0.04] select-none tracking-tighter">
                  PERPUSJAL
                </div>
              </div>

              {/* 1. Card Top Ribbon / Masthead with Official Logo & Tagline */}
              <div className="relative z-10 flex items-start justify-between border-b-2 border-amber-500/40 pb-3 gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Logo className="h-5 sm:h-6 w-auto text-amber-400" />
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase font-bold tracking-widest text-amber-400">
                    <span>★ KARTU KEHORMATAN WARGA LITERASI ★</span>
                  </div>
                  <span className="font-serif italic text-[11px] text-zinc-300 block tracking-wide">
                    "Membaca dan Berbahagia di Bawah Langit Blora"
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-[8px] uppercase font-bold tracking-widest text-zinc-400 block mb-0.5">
                    NO. REGISTRASI
                  </span>
                  <span className="font-mono text-[10.5px] font-bold text-amber-300 tracking-wider px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-xs block">
                    {memberRegNo}
                  </span>
                </div>
              </div>

              {/* 2. Hero Persona Identity */}
              <div className="relative z-10 flex items-center gap-4 py-1.5">
                <div className="relative shrink-0">
                  <UserAvatar
                    src={user.avatarUrl}
                    name={user.name}
                    username={user.username}
                    size="xl"
                    shape="circle"
                    className="ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-[9px] shadow-sm">
                    ✓
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-serif font-black text-xl sm:text-2xl text-white tracking-tight leading-tight truncate">
                      {user.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10.5px] text-zinc-400">
                    <span className="text-amber-300 font-semibold">@{user.username}</span>
                    <span>&bull;</span>
                    <span>Warga Sejak {joinedYear}</span>
                  </div>

                  {/* Active Equipped Title Ribbon */}
                  <div className="pt-0.5">
                    {user.equippedTitle ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-400/60 bg-amber-500/15 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                        {user.equippedBadge && (
                          <BadgeInsignia
                            code={user.equippedBadge.code}
                            tier={activeTier}
                            category={user.equippedBadge.category}
                            earned={true}
                            size="xs"
                            variant="solid-inverted"
                            className="-my-1 -ml-1 scale-80"
                          />
                        )}
                        <span>GELAR: {user.equippedTitle}</span>
                      </div>
                    ) : (
                      <span className="inline-block px-2 py-0.5 bg-zinc-800/80 border border-zinc-700 text-zinc-300 font-mono text-[9px] uppercase font-bold tracking-wider">
                        WARGA LITERASI AKTIF
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. The Bold & Inspiring Quote / Bio Block */}
              <div className="relative z-10 p-3.5 bg-gradient-to-r from-amber-500/15 via-zinc-900/90 to-zinc-900/60 border-l-3 border-amber-400 rounded-xs">
                <Quote className="w-5 h-5 text-amber-400/25 absolute top-2 right-2 pointer-events-none" />
                <p className="font-serif italic text-xs sm:text-[13px] text-[#f4f4f0] leading-relaxed pr-5">
                  "{isCustomBio && user.bio ? user.bio : currentQuote.quote}"
                </p>
                <div className="mt-2 flex items-center justify-between font-mono text-[9.5px]">
                  <span className="font-bold text-amber-300 uppercase tracking-wider">
                    — {isCustomBio ? `${user.name} (Bio Warga)` : currentQuote.author}
                  </span>
                  {!isCustomBio && (
                    <span className="text-zinc-500 text-[8.5px] uppercase tracking-widest font-semibold">
                      #{currentQuote.category}
                    </span>
                  )}
                </div>
              </div>

              {/* 4. 4 Metric Pillars of Citizen Achievements */}
              <div className="relative z-10 grid grid-cols-4 gap-2 pt-1 font-mono text-center">
                <div className="p-2 border border-zinc-800/90 bg-zinc-900/80 rounded-xs">
                  <span className="text-[7.5px] uppercase tracking-wider text-zinc-400 block font-semibold">
                    Tulisan
                  </span>
                  <span className="font-serif font-black text-base text-amber-300">
                    {user.stats.totalArticles}
                  </span>
                </div>
                <div className="p-2 border border-zinc-800/90 bg-zinc-900/80 rounded-xs">
                  <span className="text-[7.5px] uppercase tracking-wider text-zinc-400 block font-semibold">
                    Lencana
                  </span>
                  <span className="font-serif font-black text-base text-amber-300">
                    {user.stats.badgesCount}
                  </span>
                </div>
                <div className="p-2 border border-zinc-800/90 bg-zinc-900/80 rounded-xs">
                  <span className="text-[7.5px] uppercase tracking-wider text-zinc-400 block font-semibold">
                    Pinjaman
                  </span>
                  <span className="font-serif font-black text-base text-amber-300">
                    {user.stats.loansCount ?? 0}
                  </span>
                </div>
                <div className="p-2 border border-zinc-800/90 bg-zinc-900/80 rounded-xs">
                  <span className="text-[7.5px] uppercase tracking-wider text-zinc-400 block font-semibold">
                    Amanah
                  </span>
                  <span className="font-serif font-black text-base text-amber-300">
                    {user.stats.onTimeStreak ?? 0}x
                  </span>
                </div>
              </div>

              {/* 5. Bottom Stamp & Clean QR Marketing Hook */}
              <div className="relative z-10 flex items-center justify-between pt-2 border-t border-zinc-800/80 gap-3">
                {/* Vintage Circular Seal */}
                <div className="relative w-16 h-16 rounded-full border border-amber-500/40 flex items-center justify-center p-1 bg-amber-500/5 select-none shrink-0 shadow-xs">
                  <div className="w-full h-full rounded-full border border-dashed border-amber-400/50 flex flex-col items-center justify-center text-center p-0.5">
                    <LogoIcon className="h-2.5 w-auto text-amber-400 mb-0.5" />
                    <span className="font-serif font-black text-[7.5px] text-white tracking-wider leading-tight">
                      PERPUSJAL
                    </span>
                    <span className="font-mono text-[4.5px] uppercase tracking-wider text-amber-300/80 leading-tight">
                      TERVERIFIKASI
                    </span>
                  </div>
                </div>

                {/* Slogan & Verification text */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <span className="font-mono text-[8px] uppercase tracking-wider text-amber-400 block font-bold truncate">
                    perpusjalblora.id/warga/@{user.username}
                  </span>
                  <p className="font-serif text-[10.5px] text-zinc-300 leading-snug font-medium">
                    Membaca dan Berbahagia &bull; Ruang Merdeka Warga
                  </p>
                  <span className="font-mono text-[7.5px] text-zinc-400 uppercase block tracking-widest">
                    PINDAI QR &bull; PINJAM BUKU GRATIS
                  </span>
                </div>

                {/* Vector QR Code */}
                {qrSvg ? (
                  <div
                    className="w-16 h-16 bg-[#0b0c0e] p-1 border border-amber-500/40 rounded-xs inline-flex items-center justify-center shrink-0 shadow-xs [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-xs flex items-center justify-center text-[8px] font-mono text-zinc-500 shrink-0">
                    QR
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: Medsos Ready */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 font-mono text-xs">
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="w-full sm:flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Merender Gambar HD...</span>
                  </>
                ) : downloaded ? (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span>Gambar Terunduh!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Unduh Gambar (PNG HD)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-full sm:w-auto py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
                title="Bagikan ke WhatsApp, Instagram Story, atau medsos lainnya"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Bagikan Medsos</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full sm:w-auto py-2.5 px-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
                title="Salin tautan profil publik warga"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
