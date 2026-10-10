'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();

  // Extract redirect target and sanitize against Open Redirect attacks
  const rawRedirect = searchParams.get('redirect') || searchParams.get('returnUrl') || '';
  const safeRedirect =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/dashboard';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // Guest Guard: If already authenticated, redirect away seamlessly
  React.useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.replace(safeRedirect);
    }
  }, [authLoading, isAuthenticated, user, router, safeRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Format alamat email tidak valid.';
    }
    if (!password) {
      errors.password = 'Kata sandi wajib diisi.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(Object.values(errors)[0] || 'Mohon lengkapi alamat email dan kata sandi.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient<{
        user: any;
        sessionToken: string;
        expiresAt: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          rememberMe,
        }),
      });

      if (res.error) {
        if (res.error.code === 'TOO_MANY_LOGIN_ATTEMPTS' || res.error.code === 'ACCOUNT_LOCKED') {
          setErrorMessage(
            res.error.message ||
              'Percobaan masuk dibatasi demi keamanan. Silakan tunggu beberapa saat.'
          );
        } else {
          setErrorMessage(res.error.message || 'Email atau kata sandi tidak cocok.');
        }
        return;
      }

      // Refresh global auth state and smoothly navigate
      await refreshUser();
      router.replace(safeRedirect);
      router.refresh();
    } catch {
      setErrorMessage('Tidak dapat terhubung ke server perpusjal. Periksa koneksi internetmu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-surface-muted" />
        <div className="h-10 w-3/4 bg-surface-muted" />
        <div className="h-4 w-1/2 bg-surface-muted" />
        <div className="h-48 w-full bg-surface-muted/30 border border-border-hairline mt-8" />
      </div>
    );
  }

  return (
    <RevealOnScroll variant="cinematic" delayMs={50}>
      <div className="space-y-8">
        {/* Editorial Heading */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            <span>REGISTRI</span>
            <span>//</span>
            <span>AUTENTIKASI</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
            Masuk ke Ruang Baca
          </h1>
          <p className="text-xs sm:text-sm text-muted font-sans pt-0.5 leading-relaxed">
            Akses sirkulasi peminjaman buku jalanan, ruang publikasi naskah warga, dan riwayat kurasi.
          </p>
        </div>

        {/* Redirect Notice Banner (if user came from an internal protected link) */}
        {rawRedirect && (
          <div className="p-3 border border-foreground/30 bg-surface-muted/50 text-foreground flex items-center gap-2.5 font-mono text-xs">
            <Info className="w-4 h-4 text-foreground shrink-0" />
            <span>Silakan masuk terlebih dahulu untuk melanjutkan ke halaman yang dituju.</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 border-2 border-foreground bg-surface text-foreground space-y-1 animate-in fade-in-50 duration-150"
          >
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-foreground shrink-0" />
              <span>Autentikasi Gagal</span>
            </div>
            <p className="text-xs font-sans text-foreground/85 pl-6">{errorMessage}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email Field */}
          <div className="space-y-1">
            <Input
              label="Alamat Email"
              type="email"
              name="email"
              autoComplete="email"
              autoFocus
              placeholder="nama@domain.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                }
              }}
              required
              disabled={isLoading}
              className={fieldErrors.email ? 'border-foreground ring-1 ring-foreground' : ''}
            />
            {fieldErrors.email && (
              <p className="font-mono text-[11px] text-foreground font-semibold pl-1">
                &bull; {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <Input
              label="Kata Sandi"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }
              }}
              required
              disabled={isLoading}
              className={fieldErrors.password ? 'border-foreground ring-1 ring-foreground' : ''}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-muted hover:text-foreground transition-colors p-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            {fieldErrors.password && (
              <p className="font-mono text-[11px] text-foreground font-semibold pl-1">
                &bull; {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-none border-2 border-foreground bg-transparent text-foreground accent-foreground cursor-pointer focus:ring-0"
              />
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted hover:text-foreground transition-colors">
                Ingat Saya (30 Hari)
              </span>
            </label>

            <Link
              href="/lupa-password"
              className="font-mono text-[11px] uppercase tracking-wider text-muted hover:text-foreground underline underline-offset-4 transition-colors"
            >
              Lupa Sandi?
            </Link>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="solid"
              size="lg"
              className="w-full flex items-center justify-center gap-2 cursor-pointer font-mono tracking-wider"
              isLoading={isLoading}
            >
              <span>Masuk ke Ruang Baca</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </form>

        {/* Switch to Register */}
        <div className="pt-4 border-t border-border-hairline text-center">
          <p className="text-xs text-muted font-sans">
            Belum memiliki akun pembaca?{' '}
            <Link
              href={rawRedirect ? `/daftar?redirect=${encodeURIComponent(rawRedirect)}` : '/daftar'}
              className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground underline underline-offset-4 hover:opacity-75 transition-opacity"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </RevealOnScroll>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-4 animate-pulse p-4">
          <div className="h-6 w-32 bg-surface-muted" />
          <div className="h-10 w-3/4 bg-surface-muted" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
