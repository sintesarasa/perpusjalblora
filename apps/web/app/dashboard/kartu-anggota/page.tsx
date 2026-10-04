'use client';

import * as React from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Logo } from '@/components/logo';
import { apiClient } from '@/lib/api';
import { ArrowLeft, Printer, Copy, Check, QrCode as QrCodeIcon, ShieldCheck } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  trustLevel: string;
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

  React.useEffect(() => {
    if (!memberCode) return;

    // Generate crisp vector SVG QR Code
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
        <p className="text-muted text-sm">Silakan masuk untuk melihat Kartu Tanda Anggota Anda.</p>
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
      <div className="flex items-center justify-between no-print">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Dasbor Utama</span>
        </Link>

        <div className="flex items-center gap-2">
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
            className="px-4 py-2 bg-foreground text-background border border-foreground font-mono text-xs uppercase tracking-wider font-semibold hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kartu</span>
          </button>
        </div>
      </div>

      {/* Helper Banner for circulation desk */}
      <div className="p-4 border-2 border-amber-500/40 bg-amber-500/5 font-mono text-xs space-y-1.5 no-print">
        <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
          <QrCodeIcon className="w-4 h-4 shrink-0" />
          <span>Kartu Sirkulasi Peminjaman (KTA Lapak Baca) &bull; Dokumen Privat</span>
        </div>
        <p className="font-sans text-xs text-muted leading-relaxed">
          Tunjukkan QR Code pada kartu ini secara langsung kepada relawan/kurator di lapak baca fisik saat melakukan serah-terima atau pengembalian buku. <strong>Jaga kerahasiaan kartu ini dan jangan dibagikan secara publik untuk melindungi kuota peminjaman akun Anda.</strong>
        </p>
      </div>

      {/* Digital Member Card Showcase */}
      <div className="flex justify-center py-4">
        <div
          id="digital-member-card"
          className="relative w-full max-w-md bg-[#090a0c] text-[#f4f4f0] p-6 sm:p-7 border-2 border-amber-500/70 shadow-[0_15px_40px_rgba(0,0,0,0.9)] select-none space-y-5 box-border"
          style={{
            backgroundImage:
              'radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 40%), radial-gradient(circle at 0% 100%, rgba(245, 158, 11, 0.05) 0%, transparent 35%)',
          }}
        >
          {/* Background decorative wrapper (strictly clipped to inner container) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-none no-print">
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

          {/* 1. Top Ribbon / Masthead */}
          <div className="relative z-10 border-b border-amber-500/30 pb-2.5 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Logo className="h-7 sm:h-8 w-auto text-amber-400 shrink-0" />

              <div className="text-right shrink-0">
                <span className="font-mono text-[7.5px] uppercase font-bold tracking-widest text-zinc-400 block mb-0.5">
                  NO. SIRKULASI
                </span>
                <span className="font-mono text-[11px] font-bold text-amber-300 tracking-wider px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-xs inline-block">
                  {memberCode}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-zinc-800/70">
              <span className="font-mono text-[8.5px] uppercase font-bold tracking-[0.2em] text-amber-400">
                KARTU SIRKULASI LAPAK BACA
              </span>
              <span className="font-serif italic text-xs text-zinc-200">
                Membaca dan Berbahagia.
              </span>
            </div>
          </div>

          {/* 2. Member Persona Details */}
          <div className="relative z-10 flex items-center justify-between gap-4 py-1">
            <div className="space-y-0.5 min-w-0">
              <span className="font-mono text-[8.5px] uppercase tracking-widest text-zinc-400 block font-semibold">
                PEMEGANG KARTU
              </span>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-white tracking-tight leading-tight truncate">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                <span className="text-amber-300 font-semibold">@{user.username}</span>
                <span>&bull;</span>
                <span className="uppercase text-zinc-300">{user.role}</span>
              </div>
            </div>

            <div className="text-right shrink-0 space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-amber-400/60 bg-amber-500/15 text-amber-300 text-[9.5px] font-mono font-bold uppercase tracking-wider rounded-xs shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>AKTIF</span>
              </span>
              <span className="block font-mono text-[8.5px] text-zinc-400 uppercase tracking-wider">
                AMANAH &bull; LVL {user.trustLevel}
              </span>
            </div>
          </div>

          {/* 3. Authentic Large Vector QR Code (Scanner-Ready for Lapak Baca) */}
          <div className="relative z-10 p-5 bg-gradient-to-b from-zinc-900/90 to-[#0b0c0e] border-2 border-amber-500/50 rounded-xs text-center space-y-3.5 shadow-inner">
            <div className="flex justify-center items-center">
              {qrSvg ? (
                <div
                  className="w-48 h-48 sm:w-56 sm:h-56 bg-white p-3.5 border-2 border-amber-400/80 rounded-xs inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-zinc-900 flex items-center justify-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-700">
                  Membuat QR...
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="font-mono text-sm sm:text-base font-black text-amber-300 tracking-widest uppercase block">
                * {memberCode} *
              </span>
              <span className="font-mono text-[10px] text-zinc-200 uppercase tracking-widest block font-bold">
                PINDAI UNTUK PINJAM & KEMBALIKAN BUKU
              </span>
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider block">
                VALIDASI SIRKULASI LAPAK BACA TROTOAR PERPUSJAL BLORA
              </span>
            </div>
          </div>

          {/* 4. Footer Slogan & Privacy Notice */}
          <div className="relative z-10 text-center space-y-1 pt-1 border-t border-zinc-800/80">
            <p className="font-serif italic text-xs text-zinc-300 leading-relaxed">
              &ldquo;Membaca adalah melawan kebodohan, meminjam adalah merawat amanah.&rdquo;
            </p>
            <span className="font-mono text-[7.5px] text-amber-400/80 uppercase tracking-widest block font-bold">
              DOKUMEN SIRKULASI PRIVAT &bull; PERPUSTAKAAN JALANAN BLORA
            </span>
          </div>
        </div>
      </div>

      {/* Print CSS Injection */}
      <style jsx global>{`
        @media print {
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
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            margin: 0 !important;
            page-break-inside: avoid;
            background: #090a0c !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
