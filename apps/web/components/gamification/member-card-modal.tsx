'use client';

import * as React from 'react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import {
  Sparkles,
  Download,
  Share2,
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
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
  const [igCopiedNotification, setIgCopiedNotification] = React.useState(false);

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

  // Helper to generate HD PNG File for web and native sharing
  const generateCardPngFile = async (): Promise<File | null> => {
    const node = cardRef.current;
    if (!node) return null;
    try {
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
      return new File([blob], `kartu-kehormatan-${user.username}.png`, {
        type: 'image/png',
      });
    } catch (err) {
      console.error('Failed to generate PNG card file:', err);
      return null;
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
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate standardized share text & URL
  const getShareDetails = () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/warga/${user.username}`
        : `https://perpusjalblora.id/warga/${user.username}`;
    const quoteText = isCustomBio && user.bio ? user.bio : currentQuote.quote;
    const authorText = isCustomBio ? user.name : currentQuote.author;
    const titleText = user.equippedTitle ? ` (${user.equippedTitle})` : '';

    const shareText = `Kartu Kehormatan Warga Perpustakaan Jalanan Blora: ${user.name}${titleText} (@${user.username})\n\n"${quoteText}" — ${authorText}\n\nLihat rekam jejak literasi: ${url}`;

    return { url, shareText };
  };

  // 1. Direct Share WhatsApp
  const handleShareWhatsApp = async () => {
    const { shareText } = getShareDetails();

    if (typeof navigator !== 'undefined' && navigator.canShare) {
      const file = await generateCardPngFile();
      if (file && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Kartu Kehormatan: ${user.name}`,
            text: shareText,
            files: [file],
          });
          return;
        } catch {
          // fallback to wa url
        }
      }
    }

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  // 2. Direct Share Instagram Story / Feed
  const handleShareInstagram = async () => {
    const { shareText } = getShareDetails();

    // If mobile browser supports sharing files directly (e.g. Android/iOS Instagram target)
    if (typeof navigator !== 'undefined' && navigator.canShare) {
      const file = await generateCardPngFile();
      if (file && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Kartu Kehormatan: ${user.name}`,
            text: shareText,
            files: [file],
          });
          return;
        } catch {
          // cancelled or fallback
        }
      }
    }

    // Auto-download HD image & copy caption for easy IG upload
    await handleDownloadImage();
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {}

    setIgCopiedNotification(true);
    setTimeout(() => setIgCopiedNotification(false), 5000);
  };

  // 3. Direct Share Facebook
  const handleShareFacebook = () => {
    const { url, shareText } = getShareDetails();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500');
  };

  // 4. Direct Share X (Twitter)
  const handleShareTwitter = () => {
    const { shareText } = getShareDetails();
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(tweetUrl, '_blank', 'width=600,height=500');
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

              {/* 1. Card Top Ribbon / Masthead */}
              <div className="relative z-10 border-b border-amber-500/30 pb-2.5 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Logo className="h-7 sm:h-8 w-auto text-amber-400 shrink-0" />

                  <div className="text-right shrink-0">
                    <span className="font-mono text-[7.5px] uppercase font-bold tracking-widest text-zinc-400 block mb-0.5">
                      NO. REGISTRASI
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-300 tracking-wider px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-xs inline-block">
                      {memberRegNo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-zinc-800/70">
                  <span className="font-mono text-[8.5px] uppercase font-bold tracking-[0.2em] text-amber-400">
                    KARTU KEHORMATAN WARGA
                  </span>
                  <span className="font-serif italic text-xs text-zinc-200">
                    Membaca dan Berbahagia.
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

              {/* 5. Bottom Brand & Clean QR Marketing Hook */}
              <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-zinc-800/80 gap-3">
                {/* Official Logo Perpusjal (Menggantikan stempel bulat) */}
                <div className="shrink-0 flex items-center">
                  <Logo className="h-7 sm:h-8 w-auto text-amber-400" />
                </div>

                {/* Slogan & Verification text */}
                <div className="flex-1 min-w-0 space-y-0.5 pl-1">
                  <span className="font-mono text-[8px] uppercase tracking-wider text-amber-400 block font-bold truncate">
                    perpusjalblora.id/warga/@{user.username}
                  </span>
                  <p className="font-serif text-[10px] text-zinc-300 leading-snug truncate">
                    Buku Bebas di Trotoar &bull; Suara Merdeka Warga
                  </p>
                  <span className="font-mono text-[7px] text-zinc-500 uppercase block tracking-widest">
                    PINDAI QR &bull; PINJAM BUKU GRATIS
                  </span>
                </div>

                {/* Vector QR Code */}
                {qrSvg ? (
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0b0c0e] p-1 border border-amber-500/40 rounded-xs inline-flex items-center justify-center shrink-0 shadow-xs [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-900 border border-zinc-800 rounded-xs flex items-center justify-center text-[8px] font-mono text-zinc-500 shrink-0">
                    QR
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar: High-Impact Download & Direct Social Sharing */}
            <div className="space-y-3 pt-2 font-mono">
              {/* Primary HD Download Action */}
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="w-full py-3 px-5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-black uppercase tracking-wider text-xs sm:text-sm inline-flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.25)] cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Merender Gambar Kartu HD...</span>
                  </>
                ) : downloaded ? (
                  <>
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                    <span>Gambar Kartu Berhasil Diunduh!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Unduh Gambar Kartu HD (PNG)</span>
                  </>
                )}
              </button>

              {/* Direct Social Media Sharing Buttons */}
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 block font-bold">
                  BAGIKAN LANGSUNG KE MEDIA SOSIAL:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2.5 px-3 bg-[#111b15] hover:bg-[#1a2e22] text-[#25d366] border border-[#25d366]/40 font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer rounded-xs"
                    title="Bagikan ke WhatsApp"
                  >
                    <WhatsAppIcon className="w-4 h-4 shrink-0" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Instagram Story */}
                  <button
                    type="button"
                    onClick={handleShareInstagram}
                    className="py-2.5 px-3 bg-[#1e121d] hover:bg-[#2e192c] text-[#f472b6] border border-[#e1306c]/40 font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer rounded-xs"
                    title="Bagikan ke Instagram Story"
                  >
                    <InstagramIcon className="w-4 h-4 shrink-0 text-[#e1306c]" />
                    <span>Instagram</span>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    className="py-2.5 px-3 bg-[#0d1627] hover:bg-[#14233e] text-[#60a5fa] border border-[#1877f2]/40 font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer rounded-xs"
                    title="Bagikan ke Facebook"
                  >
                    <FacebookIcon className="w-4 h-4 shrink-0 text-[#1877f2]" />
                    <span>Facebook</span>
                  </button>

                  {/* X / Twitter */}
                  <button
                    type="button"
                    onClick={handleShareTwitter}
                    className="py-2.5 px-3 bg-[#18181b] hover:bg-[#27272a] text-zinc-100 border border-zinc-700 font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer rounded-xs"
                    title="Bagikan ke X (Twitter)"
                  >
                    <TwitterXIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>X</span>
                  </button>
                </div>
              </div>

              {/* Instagram / Clipboard Notification Banner */}
              {igCopiedNotification && (
                <div className="p-2.5 bg-gradient-to-r from-pink-500/20 via-purple-500/15 to-transparent border border-pink-500/40 text-[11px] text-pink-200 flex items-center gap-2 animate-in fade-in-50 duration-200">
                  <Check className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>
                    Gambar kartu HD tersimpan & caption disalin! Buka Instagram untuk memasang di Story/Feed.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
