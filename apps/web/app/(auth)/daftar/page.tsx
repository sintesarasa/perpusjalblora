'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [successData, setSuccessData] = React.useState<{
    email: string;
    message: string;
    devVerificationToken?: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear specific field error
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Basic Client validation
    const errors: Record<string, string> = {};
    if (formData.name.length < 2) errors.name = 'Nama minimal 2 karakter.';
    if (!/^[a-z0-9_]{3,20}$/.test(formData.username)) {
      errors.username = 'Username 3-20 karakter, huruf kecil, angka, underscore.';
    }
    if (formData.password.length < 8) {
      errors.password = 'Kata sandi minimal 8 karakter.';
    } else if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      errors.password = 'Kata sandi harus mengandung kombinasi huruf dan angka.';
    }
    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'Konfirmasi kata sandi tidak cocok.';
    }
    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Kamu perlu menyetujui ketentuan komunitas.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient<{
        id: string;
        email: string;
        message: string;
        devVerificationToken?: string;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.error) {
        if (res.error.details && Array.isArray(res.error.details)) {
          const detailErrors: Record<string, string> = {};
          res.error.details.forEach((d: { field: string; message: string }) => {
            detailErrors[d.field] = d.message;
          });
          setFieldErrors(detailErrors);
        }
        setErrorMessage(res.error.message || 'Pendaftaran gagal. Periksa kembali isian formulir.');
        return;
      }

      if (res.data) {
        setSuccessData({
          email: res.data.email,
          message: res.data.message,
          devVerificationToken: res.data.devVerificationToken,
        });
      }
    } catch {
      setErrorMessage('Gagal menghubungi server. Periksa koneksi internetmu.');
    } finally {
      setIsLoading(false);
    }
  };

  // If registered successfully, show verification prompt
  if (successData) {
    return (
      <div className="space-y-6 border border-foreground p-8 bg-surface">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-foreground shrink-0" />
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              REGISTRI // BERHASIL
            </span>
            <h2 className="font-serif text-2xl font-normal">Periksa Kotak Masukmu</h2>
          </div>
        </div>

        <p className="text-sm font-sans text-foreground/85 leading-relaxed">
          Tautan verifikasi telah dikirimkan ke alamat{' '}
          <strong className="font-mono font-bold text-foreground">{successData.email}</strong>.
          Silakan buka tautan tersebut dalam waktu 24 jam untuk mengaktifkan akun dan mulai meminjam buku.
        </p>

        {successData.devVerificationToken && (
          <div className="p-4 bg-background border border-border-hairline space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted block">
              [PINTASAN PENGEMBANGAN]
            </span>
            <Link
              href={`/verifikasi?token=${successData.devVerificationToken}`}
              className="font-mono text-xs text-foreground underline underline-offset-4 break-all block"
            >
              Klik di sini untuk verifikasi instan
            </Link>
          </div>
        )}

        <div className="pt-4 border-t border-border-hairline flex flex-col sm:flex-row gap-3">
          <Link href="/masuk" className="w-full">
            <Button variant="solid" size="md" className="w-full">
              Lanjut ke Halaman Masuk
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
          <span>PENDAFTARAN</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
          Daftar sebagai Pembaca
        </h1>
        <p className="text-sm text-muted font-sans pt-1">
          Bergabung dengan kolektif literasi mandiri Perpustakaan Jalanan Blora.
        </p>
      </div>

      {/* Global Error */}
      {errorMessage && (
        <div className="p-4 border-2 border-foreground bg-surface text-foreground space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-foreground" />
            <span>Pendaftaran Ditolak</span>
          </div>
          <p className="text-xs font-sans text-foreground/80 pl-6">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Lengkap"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="cth. Pramoedya Ananta"
          value={formData.name}
          onChange={handleChange}
          error={fieldErrors.name}
          required
          disabled={isLoading}
        />

        <Input
          label="Username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="huruf_kecil_tanpa_spasi"
          value={formData.username}
          onChange={handleChange}
          error={fieldErrors.username}
          hint="Huruf kecil, angka, & _"
          required
          disabled={isLoading}
        />

        <Input
          label="Alamat Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@domain.com"
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email}
          required
          disabled={isLoading}
        />

        <Input
          label="Kata Sandi"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Minimal 8 karakter (huruf & angka)"
          value={formData.password}
          onChange={handleChange}
          error={fieldErrors.password}
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
          label="Konfirmasi Kata Sandi"
          name="passwordConfirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Ulangi kata sandi"
          value={formData.passwordConfirm}
          onChange={handleChange}
          error={fieldErrors.passwordConfirm}
          required
          disabled={isLoading}
        />

        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 rounded-none border border-foreground bg-transparent text-foreground accent-foreground cursor-pointer focus:ring-0 shrink-0"
            />
            <span className="font-sans text-xs text-muted leading-snug">
              Saya setuju dengan{' '}
              <Link href="/ketentuan" className="underline text-foreground underline-offset-2">
                Ketentuan Layanan
              </Link>{' '}
              dan berikrar merawat buku-buku yang dipinjam dengan penuh tanggung jawab.
            </span>
          </label>
          {fieldErrors.agreeTerms && (
            <p className="font-mono text-[10px] text-foreground tracking-tight pt-1">
              &bull; {fieldErrors.agreeTerms}
            </p>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            variant="solid"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Daftarkan Akun
          </Button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="pt-4 border-t border-border-hairline text-center">
        <p className="text-xs text-muted font-sans">
          Sudah memiliki akun pembaca?{' '}
          <Link
            href="/masuk"
            className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground underline underline-offset-4 hover:opacity-75 transition-opacity"
          >
            Masuk ke Akun
          </Link>
        </p>
      </div>
    </div>
  );
}
