'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Mail, Info } from 'lucide-react';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const { isAuthenticated, refreshUser } = useAuth();

  const [tokenInput, setTokenInput] = React.useState(tokenFromUrl || '');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState<string | null>(null);

  // Auto-redirect timer state
  const [redirectCountdown, setRedirectCountdown] = React.useState<number | null>(null);

  // Resend state
  const [resendEmail, setResendEmail] = React.useState('');
  const [showEmailPrompt, setShowEmailPrompt] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [resendNotice, setResendNotice] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Cooldown countdown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Success auto-redirect countdown
  React.useEffect(() => {
    if (status !== 'success') return;
    setRedirectCountdown(3);
  }, [status]);

  React.useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      router.push('/dashboard');
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, router]);

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
          body: JSON.stringify({ token: tokenToVerify.trim() }),
        });

        if (res.error) {
          setStatus('error');
          setMessage(res.error.message || 'Token verifikasi tidak valid atau telah kedaluwarsa.');
          return;
        }

        setStatus('success');
        setMessage(res.data?.message || 'Email berhasil diverifikasi! Akun pembacamu kini aktif.');
        // Refresh session context seamlessly
        await refreshUser().catch(() => {});
      } catch {
        setStatus('error');
        setMessage('Gagal menghubungi server perpusjal. Periksa koneksi internetmu.');
      }
    },
    [refreshUser]
  );

  const hasCalledRef = React.useRef(false);

  // Auto-submit when token exists in URL
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

  const handleResend = async (emailOverride?: string) => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setResendNotice(null);

    const emailToSend = emailOverride || resendEmail.trim();

    try {
      const res = await apiClient<{ message: string }>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify(emailToSend ? { email: emailToSend } : {}),
      });

      if (res.error) {
        setResendNotice({
          text: res.error.message || 'Gagal mengirim ulang email aktivasi.',
          type: 'error',
        });
      } else {
        setResendNotice({
          text: res.data?.message || 'Tautan aktivasi baru telah dikirimkan ke kotak masukmu.',
          type: 'success',
        });
        setResendCooldown(60);
        setShowEmailPrompt(false);
      }
    } catch {
      setResendNotice({
        text: 'Tidak dapat terhubung ke server perpusjal.',
        type: 'error',
      });
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

      {/* Loading state with CustomLoader */}
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

          {redirectCountdown !== null && (
            <p className="font-mono text-xs text-muted">
              Mengalihkan ke dasbor dalam{' '}
              <strong className="text-foreground">{redirectCountdown} detik</strong>...
            </p>
          )}

          <div className="pt-4 border-t border-border-hairline flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button variant="solid" size="lg" className="w-full font-mono tracking-wider">
                Buka Dasbor
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" size="lg" className="w-full font-mono tracking-wider">
                Lanjut ke Beranda
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
              autoFocus={!tokenFromUrl}
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

          {/* Resend Verification Action Box */}
          <div className="pt-4 border-t border-border-hairline text-center space-y-3 font-mono text-xs">
            {/* Panduan Folder Spam */}
            <div className="p-3 border border-border-hairline bg-surface-muted/50 text-left space-y-1 font-sans text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest font-bold text-foreground">
                <Info className="w-3 h-3 text-foreground shrink-0" />
                <span>TIDAK MENEMUKAN EMAIL DI INBOX?</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                Mohon periksa folder <strong>Spam</strong> atau tab <strong>Promosi</strong> pada akun emailmu. Tandai sebagai <em>“Bukan Spam”</em> agar tautan dapat diklik dengan aman.
              </p>
            </div>

            {resendNotice && (
              <div
                className={`p-3 border text-xs font-sans text-left ${
                  resendNotice.type === 'success'
                    ? 'border-foreground bg-surface text-foreground font-semibold'
                    : 'border-red-600 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200'
                }`}
              >
                {resendNotice.text}
              </div>
            )}

            {isAuthenticated ? (
              <div>
                <p className="text-muted font-sans text-xs mb-2">Belum menerima email aktivasi?</p>
                <button
                  type="button"
                  onClick={() => handleResend()}
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
              <div className="space-y-3 font-sans">
                <p className="text-xs text-muted">Belum menerima email aktivasi?</p>

                {showEmailPrompt ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (resendEmail.trim()) handleResend(resendEmail.trim());
                    }}
                    className="space-y-3 text-left p-4 border border-border-hairline bg-surface"
                  >
                    <Input
                      label="Masukkan Alamat Email Pendaftaran"
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="nama@domain.com"
                      required
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="solid"
                        size="md"
                        className="flex-1 font-mono tracking-wider"
                        disabled={resendCooldown > 0 || isResending || !resendEmail.trim()}
                        isLoading={isResending}
                      >
                        {resendCooldown > 0
                          ? `Tunggu (${resendCooldown}s)`
                          : 'Kirim Tautan Baru'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => setShowEmailPrompt(false)}
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setShowEmailPrompt(true)}
                      disabled={resendCooldown > 0 || isResending}
                      className="font-mono text-xs uppercase tracking-wider font-bold text-foreground hover:underline inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>
                        {resendCooldown > 0
                          ? `Kirim Ulang (${resendCooldown}s)`
                          : 'Kirim Ulang Email Aktivasi'}
                      </span>
                    </button>
                    <span className="text-muted hidden sm:inline">&bull;</span>
                    <Link
                      href="/masuk"
                      className="font-mono text-xs uppercase tracking-wider font-semibold text-muted hover:text-foreground underline underline-offset-4 transition-colors"
                    >
                      Masuk ke Akun
                    </Link>
                  </div>
                )}
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
