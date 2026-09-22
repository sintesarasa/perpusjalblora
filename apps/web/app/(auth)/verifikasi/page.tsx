'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenFromUrl = searchParams.get('token');

  const [tokenInput, setTokenInput] = React.useState(tokenFromUrl || '');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState<string | null>(null);

  const performVerification = React.useCallback(async (tokenToVerify: string) => {
    if (!tokenToVerify) return;

    setStatus('loading');
    setMessage(null);

    try {
      const res = await apiClient<{
        user: { name: string; username: string };
        message: string;
      }>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token: tokenToVerify }),
      });

      if (res.error) {
        setStatus('error');
        setMessage(res.error.message || 'Token verifikasi tidak valid atau telah kedaluwarsa.');
        return;
      }

      setStatus('success');
      setMessage(res.data?.message || 'Email berhasil diverifikasi! Akunmu kini aktif.');
    } catch {
      setStatus('error');
      setMessage('Gagal menghubungi server. Periksa koneksi internetmu.');
    }
  }, []);

  React.useEffect(() => {
    if (tokenFromUrl) {
      performVerification(tokenFromUrl);
    }
  }, [tokenFromUrl, performVerification]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      performVerification(tokenInput.trim());
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span>REGISTRI</span>
          <span>//</span>
          <span>VERIFIKASI EMAIL</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
          Aktivasi Akun Pembaca
        </h1>
        <p className="text-sm text-muted font-sans pt-1">
          Tahap verifikasi diperlukan untuk memastikan integritas peminjaman buku jalanan.
        </p>
      </div>

      {/* Loading state */}
      {status === 'loading' && (
        <div className="border border-border p-10 flex flex-col items-center justify-center text-center space-y-6 bg-surface">
          <CustomLoader size="lg" label="MEMVALIDASI TOKEN..." />
          <p className="font-sans text-xs text-muted max-w-xs">
            Menghubungkan ke arsip registri untuk mengaktifkan status keanggotaanmu...
          </p>
        </div>
      )}

      {/* Success State */}
      {status === 'success' && (
        <div className="border-2 border-foreground p-8 bg-surface space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-foreground shrink-0" />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                STATUS // TERVERIFIKASI
              </span>
              <h2 className="font-serif text-2xl font-normal">Selamat Datang di Perpusjal</h2>
            </div>
          </div>

          <p className="text-sm font-sans text-foreground/85 leading-relaxed">
            {message || 'Email berhasil diverifikasi! Akunmu kini aktif dengan kuota pinjam 2 buku aktif.'}
          </p>

          <div className="pt-4 border-t border-border-hairline flex flex-col sm:flex-row gap-3">
            <Link href="/" className="w-full">
              <Button variant="solid" size="lg" className="w-full inline-flex items-center gap-2">
                <span>Jelajahi Katalog Buku</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Error or Manual Input State */}
      {status !== 'loading' && status !== 'success' && (
        <div className="space-y-6">
          {status === 'error' && (
            <div className="p-4 border-2 border-foreground bg-surface text-foreground space-y-1">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-foreground" />
                <span>Verifikasi Gagal</span>
              </div>
              <p className="text-xs font-sans text-foreground/80 pl-6">
                {message}
              </p>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <Input
              label="Kode / Token Verifikasi"
              name="token"
              type="text"
              placeholder="Tempel token yang kamu terima dari email"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              required
            />

            <Button type="submit" variant="solid" size="lg" className="w-full">
              Verifikasi Sekarang
            </Button>
          </form>

          <div className="pt-4 border-t border-border-hairline text-center space-y-2">
            <p className="text-xs text-muted font-sans">
              Belum menerima email verifikasi?
            </p>
            <Link
              href="/masuk"
              className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground underline underline-offset-4 hover:opacity-75 transition-opacity inline-block"
            >
              Masuk untuk Kirim Ulang
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 text-center">
          <CustomLoader size="md" label="MEMUAT..." />
        </div>
      }
    >
      <VerifyEmailContent />
    </React.Suspense>
  );
}
