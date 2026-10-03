'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const { user, isAuthenticated, refreshUser } = useAuth();

  const [tokenInput, setTokenInput] = React.useState(tokenFromUrl || '');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState<string | null>(null);

  // Resend state
  const [isResending, setIsResending] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [resendNotice, setResendNotice] = React.useState<string | null>(null);

  // Cooldown countdown
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const performVerification = React.useCallback(
    async (tokenToVerify: string) => {
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
        // Refresh session context seamlessly
        await refreshUser();
      } catch {
        setStatus('error');
        setMessage('Gagal menghubungi server perpusjal. Periksa koneksi internetmu.');
      }
    },
    [refreshUser]
  );

  const hasCalledRef = React.useRef(false);

  React.useEffect(() => {
    if (tokenFromUrl && !hasCalledRef.current) {
      hasCalledRef.current = true;
      performVerification(tokenFromUrl);
    }
  }, [tokenFromUrl, performVerification]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      performVerification(tokenInput.trim());
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setResendNotice(null);

    try {
      const res = await apiClient<{ message: string }>('/auth/resend-verification', {
        method: 'POST',
      });

      if (res.error) {
        setResendNotice(res.error.message || 'Gagal mengirim ulang email verifikasi.');
      } else {
        setResendNotice('Tautan aktivasi baru telah dikirimkan ke kotak masuk emailmu.');
        setResendCooldown(60);
      }
    } catch {
      setResendNotice('Tidak dapat terhubung ke server.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Editorial Heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span>REGISTRI</span>
          <span>//</span>
          <span>AKTIVASI AKUN</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
          Aktivasi Akun Pembaca
        </h1>
        <p className="text-xs sm:text-sm text-muted font-sans pt-0.5 leading-relaxed">
          Tahap verifikasi diperlukan untuk memastikan integritas peminjaman buku jalanan bebas denda.
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
        <div className="border-2 border-foreground p-8 bg-surface space-y-6 animate-in fade-in-50 duration-150">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-foreground shrink-0" />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                STATUS // TERAKTIVASI
              </span>
              <h2 className="font-serif text-2xl font-normal text-foreground">
                Selamat Datang di Perpusjal
              </h2>
            </div>
          </div>

          <p className="text-sm font-sans text-foreground/85 leading-relaxed">
            {message || 'Email berhasil diverifikasi! Akunmu kini aktif dengan kuota peminjaman 2 buku.'}
          </p>

          <div className="pt-4 border-t border-border-hairline flex flex-col sm:flex-row gap-3">
            <Link href="/buku" className="flex-1">
              <Button variant="solid" size="lg" className="w-full inline-flex items-center justify-center gap-2 font-mono tracking-wider">
                <span>Jelajahi Katalog Buku</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" size="lg" className="w-full font-mono tracking-wider">
                Buka Dasbor
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Error or Manual Input State */}
      {status !== 'loading' && status !== 'success' && (
        <div className="space-y-6">
          {status === 'error' && (
            <div
              role="alert"
              className="p-4 border-2 border-foreground bg-surface text-foreground space-y-1 animate-in fade-in-50 duration-150"
            >
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-foreground shrink-0" />
                <span>Verifikasi Belum Berhasil</span>
              </div>
              <p className="text-xs font-sans text-foreground/85 pl-6">{message}</p>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4" noValidate>
            <Input
              label="Kode / Token Aktivasi"
              name="token"
              type="text"
              autoFocus
              placeholder="Tempel token yang kamu terima dari email"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="solid"
              size="lg"
              className="w-full flex items-center justify-center gap-2 cursor-pointer font-mono tracking-wider"
            >
              <span>Verifikasi Akun Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Resend Verification Action */}
          <div className="pt-4 border-t border-border-hairline text-center space-y-3 font-mono text-xs">
            {resendNotice && (
              <p className="font-sans text-xs text-foreground bg-surface-muted p-2 border border-border-hairline">
                {resendNotice}
              </p>
            )}

            {isAuthenticated ? (
              <div>
                <p className="text-muted font-sans text-xs mb-2">Belum menerima email aktivasi?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  className="font-bold uppercase tracking-wider text-foreground hover:underline inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0
                      ? `Kirim Ulang (${resendCooldown}s)`
                      : 'Kirim Ulang Email Aktivasi'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 font-sans">
                <p className="text-xs text-muted">Belum menerima email aktivasi?</p>
                <Link
                  href="/masuk"
                  className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground underline underline-offset-4 hover:opacity-75 transition-opacity inline-block"
                >
                  Masuk untuk Meminta Kirim Ulang
                </Link>
              </div>
            )}
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
          <CustomLoader size="md" label="MEMUAT AKTIVASI..." />
        </div>
      }
    >
      <VerifyEmailContent />
    </React.Suspense>
  );
}
