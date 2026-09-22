'use client';

import * as React from 'react';
import Link from 'next/link';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Logo } from '@/components/logo';
import { apiClient } from '@/lib/api';
import { ArrowLeft, Printer } from 'lucide-react';

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

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <CustomLoader size="md" label="MEMBUAT KARTU TANDA ANGGOTA..." />
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

  const memberCode = `PJL-${user.id.slice(-6).toUpperCase()}`;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Dasbor Utama</span>
        </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 border border-foreground font-mono text-xs uppercase tracking-wider font-semibold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kartu</span>
          </button>
        </div>

        {/* Digital Member Card Showcase */}
        <div className="flex justify-center py-6">
          <div className="w-full max-w-md bg-surface border-4 border-double border-foreground p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden font-sans">
            {/* Top Masthead */}
            <div className="flex items-start justify-between border-b-2 border-foreground pb-4">
              <div>
                <Logo className="h-6 w-auto text-foreground" />
                <span className="block font-mono text-[9px] uppercase tracking-widest text-muted mt-1">
                  PERPUSTAKAAN JALANAN BLORA
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border border-foreground font-bold">
                  {user.trustLevel}
                </span>
                <span className="block font-mono text-[9px] text-muted mt-1 uppercase">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Member Details */}
            <div className="space-y-4">
              <div>
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest block">
                  NAMA ANGGOTA
                </span>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                  {user.name}
                </h2>
                <p className="font-mono text-xs text-muted">@{user.username}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs pt-2 border-t border-border-hairline">
                <div>
                  <span className="text-[10px] text-muted uppercase block">NO. ANGGOTA:</span>
                  <strong className="text-foreground text-sm tracking-wider">{memberCode}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase block">STATUS PINJAM:</span>
                  <strong className="text-foreground text-sm">AKTIF</strong>
                </div>
              </div>
            </div>

            {/* Stylized Barcode Block */}
            <div className="p-3 bg-surface-muted border border-border-hairline text-center space-y-2">
              <div className="flex justify-center items-center gap-1 h-8 px-4">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full bg-foreground ${
                      i % 3 === 0 ? 'w-1' : i % 5 === 0 ? 'w-1.5' : 'w-0.5'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-muted tracking-widest uppercase block">
                * {memberCode} *
              </span>
            </div>

            {/* Footer Pledge */}
            <div className="text-center font-serif italic text-[11px] text-muted border-t border-border-hairline pt-3">
              &ldquo;Membaca adalah melawan kebodohan, meminjam adalah merawat amanah.&rdquo;
            </div>
          </div>
        </div>
    </div>
  );
}
