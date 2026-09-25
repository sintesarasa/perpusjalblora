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
      <div className="p-4 border border-border-hairline bg-surface font-mono text-xs space-y-1.5 no-print">
        <div className="flex items-center gap-2 font-bold text-foreground uppercase tracking-wider">
          <QrCodeIcon className="w-4 h-4 text-foreground" />
          <span>Integrasi Meja Sirkulasi Lapak</span>
        </div>
        <p className="font-sans text-xs text-muted">
          Tunjukkan QR Code pada kartu ini kepada kurator/relawan di lapak baca untuk mempercepat proses verifikasi peminjaman dan serah-terima buku fisik.
        </p>
      </div>

      {/* Digital Member Card Showcase */}
      <div className="flex justify-center py-4">
        <div
          id="digital-member-card"
          className="w-full max-w-md bg-surface border-4 border-double border-foreground p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden font-sans print:shadow-none print:border-2 print:border-black print:p-6 print:m-0 print:max-w-none print:w-[360px]"
        >
          {/* Top Masthead */}
          <div className="flex items-start justify-between border-b-2 border-foreground pb-4 print:border-black">
            <div>
              <Logo className="h-6 w-auto text-foreground print:text-black" />
              <span className="block font-mono text-[9px] uppercase tracking-widest text-muted print:text-gray-600 mt-1">
                PERPUSTAKAAN JALANAN BLORA
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border border-foreground print:border-black font-bold">
                {user.trustLevel}
              </span>
              <span className="block font-mono text-[9px] text-muted print:text-gray-600 mt-1 uppercase">
                {user.role}
              </span>
            </div>
          </div>

          {/* Member Details */}
          <div className="space-y-4">
            <div>
              <span className="font-mono text-[10px] text-muted print:text-gray-600 uppercase tracking-widest block">
                NAMA ANGGOTA
              </span>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground print:text-black">
                {user.name}
              </h2>
              <p className="font-mono text-xs text-muted print:text-gray-600">@{user.username}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs pt-2 border-t border-border-hairline print:border-gray-300">
              <div>
                <span className="text-[10px] text-muted print:text-gray-600 uppercase block">NO. ANGGOTA:</span>
                <strong className="text-foreground print:text-black text-sm tracking-wider">{memberCode}</strong>
              </div>
              <div>
                <span className="text-[10px] text-muted print:text-gray-600 uppercase block">STATUS PINJAM:</span>
                <strong className="text-foreground print:text-black text-sm flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-foreground print:text-black" />
                  AKTIF
                </strong>
              </div>
            </div>
          </div>

          {/* Authentic Vector QR Code Block */}
          <div className="p-4 bg-surface-muted print:bg-white border border-border-hairline print:border-gray-400 text-center space-y-3">
            <div className="flex justify-center items-center">
              {qrSvg ? (
                <div
                  className="w-36 h-36 bg-white p-2 border border-black/10 inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain shadow-xs"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="w-36 h-36 bg-surface flex items-center justify-center text-muted font-mono text-xs border border-dashed border-border-hairline">
                  Membuat QR...
                </div>
              )}
            </div>

            <div className="space-y-0.5">
              <span className="font-mono text-xs font-bold text-foreground print:text-black tracking-widest uppercase block">
                * {memberCode} *
              </span>
              <span className="font-mono text-[9px] text-muted print:text-gray-600 uppercase tracking-wider block">
                SCAN UNTUK SIRKULASI LAPAK
              </span>
            </div>
          </div>

          {/* Footer Pledge */}
          <div className="text-center font-serif italic text-[11px] text-muted print:text-gray-600 border-t border-border-hairline print:border-gray-300 pt-3">
            &ldquo;Membaca adalah melawan kebodohan, meminjam adalah merawat amanah.&rdquo;
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
          }
        }
      `}</style>
    </div>
  );
}
