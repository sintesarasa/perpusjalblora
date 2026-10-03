'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = React.useState(tokenFromUrl);
  const [password, setPassword] = React.useState('');
  const [passwordConfirm, setPasswordConfirm] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  // Live password requirements
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isConfirmMatch = passwordConfirm.length > 0 && password === passwordConfirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token.trim()) {
      setErrorMessage('Token pemulihan kata sandi tidak ditemukan. Periksa tautan emailmu.');
      return;
    }

    if (!hasMinLength) {
      setErrorMessage('Kata sandi minimal 8 karakter.');
      return;
    }

    if (!hasLetter || !hasNumber) {
      setErrorMessage('Kata sandi harus mengandung kombinasi huruf dan angka.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: token.trim(),
          password,
          passwordConfirm,
        }),
      });

      if (res.error) {
        setErrorMessage(res.error.message || 'Token tidak valid atau sudah kedaluwarsa.');
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage('Tidak dapat terhubung ke server perpusjal. Periksa koneksi internetmu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 border-2 border-foreground p-8 bg-surface animate-in fade-in-50 duration-150">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-foreground shrink-0" />
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              PEMBARUAN BERHASIL
            </span>
            <h2 className="font-serif text-2xl font-normal text-foreground">
              Kata Sandi Diperbarui
            </h2>
          </div>
        </div>

        <p className="text-sm font-sans text-foreground/85 leading-relaxed">
          Kata sandi barumu telah aktif dan seluruh sesi perangkat sebelumnya telah dicabut demi
          keamanan. Silakan masuk kembali dengan kata sandi barumu.
        </p>

        <div className="pt-4 border-t border-border-hairline">
          <Link href="/masuk">
            <Button variant="solid" size="md" className="w-full font-mono tracking-wider">
              Masuk dengan Sandi Baru
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Editorial Heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span>REGISTRI</span>
          <span>//</span>
          <span>KATA SANDI BARU</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
          Atur Ulang Kata Sandi
        </h1>
        <p className="text-xs sm:text-sm text-muted font-sans pt-0.5 leading-relaxed">
          Buat kombinasi kata sandi baru yang kuat dan aman untuk akun pembacamu.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 border-2 border-foreground bg-surface text-foreground space-y-1 animate-in fade-in-50 duration-150"
        >
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-foreground shrink-0" />
            <span>Pembaruan Ditolak</span>
          </div>
          <p className="text-xs font-sans text-foreground/85 pl-6">{errorMessage}</p>
        </div>
      )}

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {!tokenFromUrl && (
          <Input
            label="Token Pemulihan"
            name="token"
            type="text"
            placeholder="Salin token dari email"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            disabled={isLoading}
          />
        )}

        <div className="space-y-1.5">
          <Input
            label="Kata Sandi Baru"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="new-password"
            autoFocus
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted hover:text-foreground transition-colors p-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {password.length > 0 && (
            <div className="p-2.5 bg-surface-muted/50 border border-border-hairline font-mono text-[11px] grid grid-cols-2 gap-1.5 mt-1.5">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-foreground font-bold' : 'text-muted'}`}>
                {hasMinLength ? <Check className="w-3 h-3 text-foreground" /> : <X className="w-3 h-3 text-muted/60" />}
                <span>Min. 8 karakter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLetter ? 'text-foreground font-bold' : 'text-muted'}`}>
                {hasLetter ? <Check className="w-3 h-3 text-foreground" /> : <X className="w-3 h-3 text-muted/60" />}
                <span>Ada huruf (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-foreground font-bold' : 'text-muted'}`}>
                {hasNumber ? <Check className="w-3 h-3 text-foreground" /> : <X className="w-3 h-3 text-muted/60" />}
                <span>Ada angka (0-9)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${isConfirmMatch ? 'text-foreground font-bold' : 'text-muted'}`}>
                {isConfirmMatch ? <Check className="w-3 h-3 text-foreground" /> : <X className="w-3 h-3 text-muted/60" />}
                <span>Sandi cocok</span>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Konfirmasi Kata Sandi Baru"
          type={showPassword ? 'text' : 'password'}
          name="passwordConfirm"
          autoComplete="new-password"
          placeholder="Ulangi kata sandi baru"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
          disabled={isLoading}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="solid"
            size="lg"
            className="w-full flex items-center justify-center gap-2 cursor-pointer font-mono tracking-wider"
            isLoading={isLoading}
          >
            <span>Simpan Kata Sandi Baru</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </form>

      <div className="pt-4 border-t border-border-hairline text-center">
        <Link
          href="/masuk"
          className="font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Batal dan Kembali ke Masuk
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-4 animate-pulse p-4">
          <div className="h-6 w-32 bg-surface-muted" />
          <div className="h-10 w-3/4 bg-surface-muted" />
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
