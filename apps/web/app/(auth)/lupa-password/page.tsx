'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Alamat email wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (res.error) {
        setErrorMessage(res.error.message || 'Gagal memproses permintaan.');
        return;
      }

      setIsSuccess(true);
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
          <span>PEMULIHAN</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
          Lupa Kata Sandi?
        </h1>
        <p className="text-sm text-muted font-sans pt-1">
          Masukkan alamat email yang terdaftar untuk menerima tautan pemulihan kata sandi.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 border-2 border-foreground bg-surface text-foreground space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-foreground" />
            <span>Permintaan Gagal</span>
          </div>
          <p className="text-xs font-sans text-foreground/80 pl-6">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Success View */}
      {isSuccess ? (
        <div className="space-y-6 border border-foreground p-8 bg-surface">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-foreground shrink-0" />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                INSTRUKSI DIKIRIMKAN
              </span>
              <h2 className="font-serif text-2xl font-normal">Periksa Email Masuk</h2>
            </div>
          </div>

          <p className="text-sm font-sans text-foreground/85 leading-relaxed">
            Jika alamat <strong className="font-mono font-bold text-foreground">{email}</strong> terdaftar di sistem kami, tautan pengaturan ulang kata sandi telah dikirimkan. Tautan hanya berlaku selama 1 jam.
          </p>

          <div className="pt-4 border-t border-border-hairline">
            <Link href="/masuk">
              <Button variant="outline" size="md" className="w-full">
                Kembali ke Halaman Masuk
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Alamat Email Terdaftar"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="nama@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              Kirim Tautan Pemulihan
            </Button>
          </div>
        </form>
      )}

      {/* Back to login link */}
      <div className="pt-4 border-t border-border-hairline text-center">
        <Link
          href="/masuk"
          className="font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>
      </div>
    </div>
  );
}
