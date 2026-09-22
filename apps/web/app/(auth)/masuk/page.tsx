'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient<{ user: { id: string; name: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      if (res.error) {
        setErrorMessage(res.error.message || 'Email atau password tidak sesuai.');
        return;
      }

      // Successful login -> navigate to user dashboard or home
      window.location.href = '/';
    } catch {
      setErrorMessage('Gagal menghubungi server. Periksa koneksi internetmu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span>REGISTRI</span>
          <span>//</span>
          <span>MASUK</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
          Masuk ke Akun Pembaca
        </h1>
        <p className="text-sm text-muted font-sans pt-1">
          Akses peminjaman buku jalanan, ruang publikasi esai, dan riwayat kurasi.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 border-2 border-foreground bg-surface text-foreground space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-foreground" />
            <span>Verifikasi Gagal</span>
          </div>
          <p className="text-xs font-sans text-foreground/80 pl-6">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Alamat Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nama@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />

        <Input
          label="Kata Sandi"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
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

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-none border border-foreground bg-transparent text-foreground accent-foreground cursor-pointer focus:ring-0"
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

        <div className="pt-2">
          <Button
            type="submit"
            variant="solid"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Masuk ke Ruang Baca
          </Button>
        </div>
      </form>

      {/* Switch to Register */}
      <div className="pt-4 border-t border-border-hairline text-center">
        <p className="text-xs text-muted font-sans">
          Belum memiliki akun pembaca?{' '}
          <Link
            href="/daftar"
            className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground underline underline-offset-4 hover:opacity-75 transition-opacity"
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
