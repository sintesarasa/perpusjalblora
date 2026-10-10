'use client';

import * as React from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

const forgotPasswordClientSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Alamat email wajib diisi.')
    .email('Format alamat email tidak valid.')
    .max(120, 'Alamat email terlalu panjang.'),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldError(null);

    const validation = forgotPasswordClientSchema.safeParse({ email });
    if (!validation.success) {
      setFieldError(validation.error.errors[0]?.message || 'Periksa kembali alamat email.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          email: validation.data.email.toLowerCase(),
        }),
      });

      if (res.error) {
        setErrorMessage(res.error.message || 'Gagal memproses permintaan.');
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage('Tidak dapat terhubung ke server perpusjal. Periksa koneksi internetmu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
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
        <p className="text-xs sm:text-sm text-muted font-sans pt-0.5 leading-relaxed">
          Masukkan alamat email yang terdaftar untuk menerima instruksi pemulihan kata sandi.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 border-2 border-foreground bg-surface text-foreground space-y-1 animate-in fade-in-50 duration-150"
        >
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-foreground shrink-0" />
            <span>Permintaan Ditolak</span>
          </div>
          <p className="text-xs font-sans text-foreground/85 pl-6">{errorMessage}</p>
        </div>
      )}

      {/* Success View */}
      {isSuccess ? (
        <div className="space-y-6 border-2 border-foreground p-8 bg-surface animate-in fade-in-50 duration-150">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-foreground shrink-0" />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                INSTRUKSI DIKIRIMKAN
              </span>
              <h2 className="font-serif text-2xl font-normal">Periksa Kotak Masukmu</h2>
            </div>
          </div>

          <p className="text-sm font-sans text-foreground/85 leading-relaxed">
            Jika alamat <strong className="font-mono font-bold text-foreground">{email}</strong> terdaftar di sistem kami, tautan pengaturan ulang kata sandi telah dikirimkan ke kotak masukmu. Tautan hanya berlaku selama 1 jam demi alasan keamanan.
          </p>

          <div className="pt-4 border-t border-border-hairline">
            <Link href="/masuk">
              <Button variant="solid" size="md" className="w-full font-mono tracking-wider">
                Kembali ke Halaman Masuk
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Alamat Email Terdaftar"
            type="email"
            name="email"
            autoComplete="email"
            autoFocus
            placeholder="nama@domain.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldError) setFieldError(null);
            }}
            error={fieldError || undefined}
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
              <span>Kirim Tautan Pemulihan</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
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
