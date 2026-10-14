'use client';

import * as React from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Logo } from '@/components/logo';
import { UserAvatar } from '@/components/ui/user-avatar';
import { apiClient } from '@/lib/api';
import { Printer, Copy, Check, QrCode as QrCodeIcon, ShieldCheck, Download } from 'lucide-react';
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
  const [downloading, setDownloading] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

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
      return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    } catch {
      return null;
    }
  }, [user?.createdAt]);

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

  const handleDownloadPng = async () => {
    if (!cardRef.current || !user || downloading) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `kartu-anggota-${user.username || 'perpusjal'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Gagal mengunduh kartu anggota sebagai gambar:', err);
    } finally {
      setDownloading(false);
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

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
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
            onClick={handleDownloadPng}
            disabled={downloading}
            className="px-3.5 py-2 border border-foreground bg-surface font-mono text-xs uppercase tracking-wider font-semibold hover:bg-surface-muted transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            title="Simpan kartu sebagai gambar untuk digunakan saat offline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Mengunduh...' : 'Unduh Gambar (PNG)'}</span>
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
      <div className="p-4 border border-foreground bg-surface font-mono text-xs space-y-1.5 no-print">
        <div className="flex items-center gap-2 font-bold text-foreground uppercase tracking-wider">
          <QrCodeIcon className="w-4 h-4 shrink-0" />
          <span>Kartu Sirkulasi Peminjaman (KTA Lapak Baca) &bull; Dokumen Privat</span>
        </div>
        <p className="font-sans text-xs text-muted leading-relaxed">
          Tunjukkan QR Code pada kartu ini secara langsung kepada relawan/kurator di lapak baca fisik saat melakukan serah-terima atau pengembalian buku. <strong>Jaga kerahasiaan kartu ini dan jangan dibagikan secara publik untuk melindungi kuota peminjaman akunmu.</strong> Anda juga dapat mengunduh gambar kartu untuk disimpan di galeri ponsel saat sinyal minim di ruang publik terbuka.
        </p>
      </div>

      {/* Digital Member Card Showcase */}
      <div className="flex justify-center py-4">
        <div
          ref={cardRef}
          id="digital-member-card"
          className="relative w-full max-w-md bg-surface text-foreground p-6 sm:p-7 border-2 border-foreground select-none space-y-5 box-border rounded-none"
        >
          {/* Background decorative wrapper (clean hairline corner brackets, no obstructing watermark) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-none no-print">
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-foreground/30" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-foreground/30" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-foreground/30" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-foreground/30" />
          </div>

          {/* 1. Top Ribbon / Masthead */}
          <div className="relative z-10 border-b border-border pb-2.5 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Logo className="h-7 sm:h-8 w-auto text-foreground shrink-0" />

              <div className="text-right shrink-0">
                <span className="font-mono text-[7.5px] uppercase font-bold tracking-widest text-muted block mb-0.5">
                  NO. SIRKULASI
                </span>
                <span className="font-mono text-[11px] font-bold text-foreground tracking-wider px-2.5 py-0.5 bg-surface-muted border border-border inline-block rounded-none">
                  {memberCode}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border-hairline">
              <span className="font-mono text-[8.5px] uppercase font-bold tracking-[0.2em] text-foreground">
                KARTU SIRKULASI LAPAK BACA
              </span>
              <span className="font-serif italic text-xs text-foreground/80">
                Membaca dan Berbahagia.
              </span>
            </div>
          </div>

          {/* 2. Member Persona Details with Profile Avatar */}
          <div className="relative z-10 flex items-start sm:items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="shrink-0">
                <UserAvatar
                  src={user.avatarUrl}
                  name={user.name}
                  username={user.username}
                  size="lg"
                  linkToProfile={false}
                  className="border-2 border-foreground"
                />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="font-mono text-[8.5px] uppercase tracking-widest text-muted block font-semibold">
                  PEMEGANG KARTU
                </span>
                <h2 className="font-serif font-black text-xl sm:text-2xl text-foreground tracking-tight leading-tight truncate">
                  {user.name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-muted">
                  <span className="text-foreground font-semibold">@{user.username}</span>
                  {memberSince && (
                    <>
                      <span>&bull;</span>
                      <span className="text-[10px]">Warga sejak {memberSince}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-foreground bg-foreground text-background text-[9.5px] font-mono font-bold uppercase tracking-wider rounded-none">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AKTIF</span>
              </span>
              <span className="block font-mono text-[8.5px] text-muted uppercase tracking-wider">
                AMANAH &bull; LVL {user.trustLevel}
              </span>
            </div>
          </div>

          {/* 3. Authentic Large Vector QR Code (Scanner-Ready for Lapak Baca) */}
          <div className="relative z-10 p-5 bg-surface-muted border-2 border-foreground rounded-none text-center space-y-3.5">
            <div className="flex justify-center items-center">
              {qrSvg ? (
                <div className="relative p-2 bg-surface">
                  {/* Viewfinder corner brackets */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-foreground" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-foreground" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-foreground" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-foreground" />

                  <div
                    className="w-48 h-48 sm:w-56 sm:h-56 bg-white p-3 border border-border inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                </div>
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-surface-muted flex items-center justify-center text-muted font-mono text-xs border border-dashed border-border rounded-none">
                  Membuat QR...
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="font-mono text-sm sm:text-base font-bold text-foreground tracking-widest uppercase block">
                [ {memberCode} ]
              </span>
              <span className="font-mono text-[10px] text-foreground uppercase tracking-widest block font-bold">
                PINDAI UNTUK PINJAM & KEMBALIKAN BUKU
              </span>
            </div>
          </div>

          {/* 4. Footer Slogan & Circulation Mark */}
          <div className="relative z-10 text-center space-y-1.5 pt-2 border-t border-border-hairline">
            <p className="font-serif italic text-xs text-foreground/80 leading-relaxed">
              &ldquo;Membaca adalah melawan kebodohan, meminjam adalah merawat amanah.&rdquo;
            </p>
            <span className="font-mono text-[8px] text-muted uppercase tracking-[0.18em] block">
              DOKUMEN SIRKULASI OTENTIK &bull; PERPUSTAKAAN JALANAN BLORA
            </span>
          </div>
        </div>
      </div>

      {/* Print CSS Injection: Ink-Saving Crisp Stark Monochrome Paper Card */}
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
            background: #ffffff !important;
            color: #000000 !important;
            border: 2px solid #000000 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
