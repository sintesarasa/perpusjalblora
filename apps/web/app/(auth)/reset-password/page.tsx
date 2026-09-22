'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('Token reset password tidak ditemukan. Periksa tautan emailmu.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Kata sandi minimal 8 karakter.');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
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
          token,
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
      setErrorMessage('Gagal menghubungi server. Periksa koneksi internetmu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 border border-foreground p-8 bg-surface">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-foreground shrink-0" />
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              PEMBARUAN BERHASIL
            </span>
            <h2 className="font-serif text-2xl font-normal">Kata Sandi Diperbarui</h2>
          </div>
        </div>

        <p className="text-sm font-sans text-foreground/85 leading-relaxed">
          Kata sandi barumu telah aktif dan seluruh sesi perangkat lain telah dicabut demi keamanan. Silakan masuk kembali.
        </p>

        <div className="pt-4 border-t border-border-hairline">
          <Link href="/masuk">
            <Button variant="solid" size="md" className="w-full">
              Masuk dengan Sandi Baru
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
        <p className="text-sm text-muted font-sans pt-1">
          Buat kombinasi kata sandi baru yang kuat dan aman untuk akun pembacamu.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 border-2 border-foreground bg-surface text-foreground space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-foreground" />
            <span>Pembaruan Gagal</span>
          </div>
          <p className="text-xs font-sans text-foreground/80 pl-6">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
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

        <Input
          label="Kata Sandi Baru"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter (huruf & angka)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="text-muted hover:text-foreground transition-colors p-1"
              aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

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
            className="w-full"
            isLoading={isLoading}
          >
            Simpan Kata Sandi Baru
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
        <div className="p-8 text-center font-mono text-xs uppercase tracking-widest text-muted">
          MEMUAT FORMULIR...
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
