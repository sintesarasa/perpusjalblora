'use client';

import * as React from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Logo } from '@/components/logo';
import { UserAvatar } from '@/components/ui/user-avatar';
import { apiClient } from '@/lib/api';
import { Printer, Copy, Check, QrCode as QrCodeIcon, Radio } from 'lucide-react';
import { PetaNavigasi } from '@/components/layout/peta-navigasi';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  trustLevel: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export default function MemberCardPage() {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [qrSvg, setQrSvg] = React.useState<string>('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const res = await apiClient<any>('/auth/me');
      setLoading(false);
      const userData = res.data?.user || (res.data?.id ? res.data : null);
      if (userData) {
        setUser(userData);
      }
    }
    loadUser();
  }, []);

  const memberCode = user ? `PJL-${user.id.slice(-6).toUpperCase()}` : '';

  const memberSince = React.useMemo(() => {
    if (!user?.createdAt) return null;
    try {
      const d = new Date(user.createdAt);
      return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    } catch {
      return null;
    }
  }, [user?.createdAt]);

  React.useEffect(() => {
    if (!memberCode) return;

    // Generate crisp vector SVG QR Code
    QRCode.toString(memberCode, {
      type: 'svg',
      margin: 0,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => {
        console.error('Failed to generate member QR Code:', err);
      });
  }, [memberCode]);

  const handleCopyCode = () => {
    if (!memberCode) return;
    navigator.clipboard.writeText(memberCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <CustomLoader size="md" label="MEMBUAT KARTU TANDA ANGGOTA DIGITAL..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto w-full px-4 py-20 text-center space-y-4 font-sans">
        <p className="text-muted text-sm">Silakan masuk untuk melihat Kartu Tanda Anggotamu.</p>
        <Link
          href="/masuk"
          className="px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold inline-block"
        >
          Masuk Akun
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-border-hairline pb-4">
        <PetaNavigasi
          items={[
            { label: 'PERPUSJAL', href: '/' },
            { label: 'DASBOR', href: '/dashboard' },
            { label: 'KARTU ANGGOTA DIGITAL' },
          ]}
        />

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3.5 py-2 border border-border-hairline bg-surface font-mono text-xs uppercase tracking-wider hover:border-foreground transition-colors inline-flex items-center gap-1.5"
            title="Salin Kode Anggota"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-foreground" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
            <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-foreground text-background border border-foreground font-mono text-xs uppercase tracking-wider font-semibold hover:bg-foreground/90 transition-colors inline-flex items-center gap-2 shadow-sm"
            title="Cetak kartu dengan ukuran standar kartu ATM (85.6 × 54 mm)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kartu (Ukuran ATM)</span>
          </button>
        </div>
      </div>

      {/* Helper Banner for circulation desk */}
      <div className="p-4 border border-foreground/30 bg-surface font-mono text-xs space-y-1.5 no-print">
        <div className="flex items-center gap-2 font-bold text-foreground uppercase tracking-wider">
          <QrCodeIcon className="w-4 h-4 shrink-0" />
          <span>Kartu Sirkulasi Peminjaman (KTA Lapak Baca) &bull; Format Standar ATM</span>
        </div>
        <p className="font-sans text-xs text-muted leading-relaxed">
          Kartu digital ini berdimensi rasio standar kartu fisik ATM (ISO/IEC 7810 ID-1: 85.6 &times; 54 mm). Tunjukkan QR Code pada kartu ini kepada relawan/kurator di lapak baca fisik saat serah-terima buku, atau cetak langsung ke kertas tebal/kartu PVC untuk kartu fisik pribadimu.
        </p>
      </div>

      {/* Digital Member Card Showcase: Always Black (Light & Dark Mode) with standard ATM proportions */}
      <div className="flex justify-center py-6">
        <div
          id="digital-member-card"
          className="relative w-full max-w-[480px] aspect-[85.6/54] rounded-2xl bg-gradient-to-br from-zinc-900 via-[#0a0a0c] to-black text-white p-5 sm:p-6 border border-zinc-800 shadow-2xl overflow-hidden select-none flex flex-col justify-between box-border"
        >
          {/* Subtle metallic hairline sheen overlays */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden no-print">
            {/* Top-right metallic glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/[0.03] blur-2xl" />
            {/* Bottom-left subtle glow */}
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/[0.02] blur-2xl" />
            {/* Inner micro-hairline border */}
            <div className="absolute inset-1.5 rounded-[12px] border border-white/[0.06] pointer-events-none" />
          </div>

          {/* 1. Header (Compact, balanced, no empty gaps) */}
          <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Logo className="h-5 sm:h-6 w-auto text-white shrink-0" />
              <div className="hidden min-[380px]:block w-px h-4 bg-white/20 shrink-0" />
              <span className="hidden min-[380px]:block font-mono text-[8.5px] uppercase font-bold tracking-[0.2em] text-zinc-300 truncate">
                PERPUSJAL BLORA
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800/90 border border-zinc-700/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[8px] sm:text-[8.5px] font-bold text-zinc-200 tracking-wider uppercase">
                  ANGGOTA AKTIF
                </span>
              </div>
              <span title="Contactless / RFID ready" className="inline-flex items-center">
                <Radio className="w-3.5 h-3.5 text-zinc-400 rotate-90 shrink-0" />
              </span>
            </div>
          </div>

          {/* 2. Middle Body: Chip + Member Persona + Large Crisp QR Code */}
          <div className="relative z-10 grid grid-cols-[1fr_auto] items-center gap-4 py-1">
            {/* Left Column: Smart Chip & Member Identity (Full Name fully readable without truncation) */}
            <div className="space-y-3 min-w-0 pr-1">
              {/* Metallic Smart-Card Chip motif */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-6 sm:w-9 sm:h-7 rounded-[4px] border border-amber-400/50 bg-gradient-to-br from-amber-300/30 via-amber-400/40 to-amber-700/40 p-1 relative shadow-inner shrink-0"
                  aria-hidden="true"
                >
                  <div className="w-full h-full border border-amber-300/40 rounded-[2px] grid grid-cols-2 grid-rows-2 gap-0.5">
                    <div className="border-r border-b border-amber-300/40" />
                    <div className="border-b border-amber-300/40" />
                    <div className="border-r border-amber-300/40" />
                    <div />
                  </div>
                </div>
                <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-400 font-semibold">
                  KTA LAPAK BACA
                </span>
              </div>

              {/* Member Details */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="shrink-0">
                  <UserAvatar
                    src={user.avatarUrl}
                    name={user.name}
                    username={user.username}
                    size="sm"
                    linkToProfile={false}
                    className="border border-zinc-700 rounded-lg shadow-sm"
                  />
                </div>
                <div className="min-w-0 space-y-0.5">
                  {/* Full Name: break-words, never cut off with truncate */}
                  <h2 className="font-serif font-black text-sm sm:text-base text-white tracking-tight leading-snug break-words">
                    {user.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-1.5 font-mono text-[9.5px] sm:text-[10px] text-zinc-400">
                    <span className="text-zinc-300 font-medium">@{user.username}</span>
                    <span>&bull;</span>
                    <span className="text-zinc-400 uppercase text-[9px]">LVL {user.trustLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Contrast Laser QR Code for outdoor night scanning */}
            <div className="flex flex-col items-center shrink-0">
              <div className="qr-code-box p-1.5 sm:p-2 bg-white rounded-xl border border-zinc-700 shadow-xl">
                {qrSvg ? (
                  <div
                    className="w-24 h-24 sm:w-28 sm:h-28 min-[440px]:w-32 min-[440px]:h-32 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 min-[440px]:w-32 min-[440px]:h-32 bg-zinc-100 flex items-center justify-center text-zinc-400 font-mono text-[9px]">
                    ...
                  </div>
                )}
              </div>
              <span className="font-mono text-[9.5px] sm:text-[10.5px] font-bold text-zinc-300 tracking-wider mt-1.5 block">
                {memberCode}
              </span>
            </div>
          </div>

          {/* 3. Footer Bar: Circulation Number & Authentic Mark */}
          <div className="relative z-10 flex items-center justify-between gap-2 border-t border-white/10 pt-2 text-[8px] sm:text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider">
            <span className="font-semibold text-zinc-300">
              SIRKULASI LAPAK BACA
            </span>
            <span className="text-zinc-500">
              {memberSince ? `WARGA SEJAK ${memberSince.toUpperCase()}` : 'PERPUSTAKAAN JALANAN'}
            </span>
          </div>
        </div>
      </div>

      {/* Print CSS: Standard ATM Card Physical Dimensions (ISO/IEC 7810 ID-1: 85.60 × 53.98 mm) */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          #digital-member-card,
          #digital-member-card * {
            visibility: visible;
          }
          #digital-member-card {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 85.6mm !important;
            height: 53.98mm !important;
            border-radius: 3.18mm !important;
            box-sizing: border-box !important;
            background: #09090b !important;
            color: #ffffff !important;
            border: 1px solid #27272a !important;
            box-shadow: none !important;
            padding: 4mm 5mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #digital-member-card .qr-code-box {
            width: 25mm !important;
            height: 25mm !important;
            padding: 1.2mm !important;
            border-radius: 2mm !important;
          }
          #digital-member-card .qr-code-box > div {
            width: 100% !important;
            height: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
