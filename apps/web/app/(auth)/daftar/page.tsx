'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const rawRedirect = searchParams.get('redirect') || searchParams.get('returnUrl') || '';
  const safeRedirect =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/dashboard';

  // Guest Guard: If already authenticated, redirect
  React.useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.replace(safeRedirect);
    }
  }, [authLoading, isAuthenticated, user, router, safeRedirect]);

  const [formData, setFormData] = React.useState({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
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

  // Live password requirements
  const hasMinLength = formData.password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const isConfirmMatch =
    formData.passwordConfirm.length > 0 && formData.password === formData.passwordConfirm;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let finalValue: any = type === 'checkbox' ? checked : value;

    // Auto-sanitize username: force lowercase and replace spaces with underscore
    if (name === 'username' && typeof finalValue === 'string') {
      finalValue = finalValue.toLowerCase().replace(/\s+/g, '_');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Clear field error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // Clear top error message once user interacts
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const cleanName = formData.name.trim();
    const cleanUsername = formData.username.trim().toLowerCase();
    const cleanEmail = formData.email.trim().toLowerCase();

    // Client-side pre-validation
    const errors: Record<string, string> = {};
    if (cleanName.length < 2) {
      errors.name = 'Nama minimal 2 karakter.';
    }
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      errors.username = 'Username 3-20 karakter, huruf kecil, angka, dan underscore.';
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Format alamat email tidak valid.';
    }
    if (!hasMinLength) {
      errors.password = 'Kata sandi minimal 8 karakter.';
    } else if (!hasLetter || !hasNumber) {
      errors.password = 'Kata sandi harus mengandung kombinasi huruf dan angka.';
    }
    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'Konfirmasi kata sandi tidak cocok.';
    }
    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Kamu perlu mencentang persetujuan Ketentuan Komunitas.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      setErrorMessage(firstError || 'Mohon lengkapi seluruh isian formulir.');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
        body: JSON.stringify({
          name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          phoneNumber: formData.phoneNumber.trim() || undefined,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
          agreeTerms: formData.agreeTerms,
        }),
      });

      if (res.error) {
        if (res.error.details && Array.isArray(res.error.details)) {
          const detailErrors: Record<string, string> = {};
          res.error.details.forEach((d: { field: string; message: string }) => {
            detailErrors[d.field] = d.message;
          });
          setFieldErrors(detailErrors);
        }
        setErrorMessage(res.error.message || 'Pendaftaran gagal. Periksa isian formulir.');
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      if (res.data) {
        setSuccessData({
          email: res.data.email,
          message: res.data.message,
          devVerificationToken: res.data.devVerificationToken,
        });
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error('[RegisterForm] Request error:', err);
      setErrorMessage('Tidak dapat terhubung ke server perpusjal. Periksa koneksi internetmu.');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If registered successfully, show clean verification notice
  if (successData) {
    return (
      <RevealOnScroll variant="stamp" delayMs={50}>
        <div className="space-y-6 border-2 border-foreground p-8 bg-surface">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-foreground shrink-0" />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                REGISTRI // BERHASIL
              </span>
              <h2 className="font-serif text-2xl font-normal text-foreground">
                Periksa Kotak Masukmu
              </h2>
            </div>
          </div>

          <p className="text-sm font-sans text-foreground/85 leading-relaxed">
            Tautan aktivasi telah dikirimkan ke alamat{' '}
            <strong className="font-mono font-bold text-foreground">{successData.email}</strong>.
            Buka tautan tersebut dalam waktu 24 jam untuk mengaktifkan akun pembaca dan hak peminjaman
            buku.
          </p>

          {successData.devVerificationToken && (
            <div className="p-4 bg-surface-muted border border-border-hairline space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase tracking-widest text-muted font-bold block">
                [PINTASAN PENGUJIAN LOKAL]
              </span>
              <Link
                href={`/verifikasi?token=${successData.devVerificationToken}`}
                className="text-foreground underline underline-offset-4 break-all block font-bold hover:opacity-80"
              >
                &rarr; Verifikasi Akun Otomatis
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-border-hairline">
            <Link
              href={rawRedirect ? `/masuk?redirect=${encodeURIComponent(rawRedirect)}` : '/masuk'}
              className="w-full block"
            >
              <Button variant="solid" size="md" className="w-full font-mono tracking-wider">
                Lanjut ke Halaman Masuk
              </Button>
            </Link>
          </div>
        </div>
      </RevealOnScroll>
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
          <span>PENDAFTARAN</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
          Daftar sebagai Pembaca
        </h1>
        <p className="text-xs sm:text-sm text-muted font-sans pt-0.5 leading-relaxed">
          Bergabung dengan kolektif literasi mandiri Perpustakaan Jalanan Blora. Pinjam tanpa jaminan,
          tanpa denda sepeser pun.
        </p>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 border-2 border-foreground bg-surface text-foreground space-y-1 animate-in fade-in-50 duration-150"
        >
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-foreground shrink-0" />
            <span>Pendaftaran Ditolak</span>
          </div>
          <p className="text-xs font-sans text-foreground/85 pl-6">{errorMessage}</p>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Nama Lengkap */}
        <Input
          label="Nama Lengkap"
          name="name"
          type="text"
          autoComplete="name"
          autoFocus
          placeholder="cth. Pramoedya Ananta"
          value={formData.name}
          onChange={handleChange}
          error={fieldErrors.name}
          required
          disabled={isLoading}
        />

        {/* Username */}
        <Input
          label="Username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="huruf_kecil_tanpa_spasi"
          value={formData.username}
          onChange={handleChange}
          error={fieldErrors.username}
          hint="Huruf kecil, angka, dan underscore (3-20 karakter)"
          required
          disabled={isLoading}
        />

        {/* Email */}
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

        {/* Nomor WhatsApp / HP */}
        <Input
          label="Nomor WhatsApp / HP"
          name="phoneNumber"
          type="tel"
          autoComplete="tel"
          placeholder="08123456789"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={fieldErrors.phoneNumber}
          hint="Digunakan relawan untuk koordinasi serah terima lapak & pengingat jadwal"
          disabled={isLoading}
        />

        {/* Kata Sandi */}
        <div className="space-y-1.5">
          <Input
            label="Kata Sandi"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            required
            disabled={isLoading}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted hover:text-foreground transition-colors p-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {/* Live Password Requirements Checklist */}
          {formData.password.length > 0 && (
            <div className="p-2.5 bg-surface-muted/50 border border-border-hairline font-mono text-[11px] grid grid-cols-2 gap-1.5 mt-1.5">
              <div
                className={`flex items-center gap-1.5 ${hasMinLength ? 'text-foreground font-bold' : 'text-muted'}`}
              >
                {hasMinLength ? <Check className="w-3 h-3 text-foreground" /> : <X className="w-3 h-3 text-muted/60" />}
                <span>Min. 8 karakter</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${hasLetter ? 'text-foreground font-bold' : 'text-muted'}`}
              >
                {hasLetter ? <Check className="w-3 h-3 text-foreground" /> : <X className="w-3 h-3 text-muted/60" />}
                <span>Ada huruf (A-Z)</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${hasNumber ? 'text-foreground font-bold' : 'text-muted'}`}
              >
                {hasNumber ? <Check className="w-3 h-3 text-foreground" /> : <X className="w-3 h-3 text-muted/60" />}
                <span>Ada angka (0-9)</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${isConfirmMatch ? 'text-foreground font-bold' : 'text-muted'}`}
              >
                {isConfirmMatch ? <Check className="w-3 h-3 text-foreground" /> : <X className="w-3 h-3 text-muted/60" />}
                <span>Sandi cocok</span>
              </div>
            </div>
          )}
        </div>

        {/* Konfirmasi Kata Sandi */}
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

        {/* Persetujuan Komunitas */}
        <div
          className={`p-3 border transition-colors ${
            fieldErrors.agreeTerms
              ? 'border-foreground bg-surface-muted/60'
              : 'border-transparent'
          }`}
        >
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 rounded-none border-2 border-foreground bg-transparent text-foreground accent-foreground cursor-pointer focus:ring-0 shrink-0"
            />
            <span className="font-sans text-xs text-foreground/80 leading-snug">
              Saya setuju dengan{' '}
              <Link href="/ketentuan" className="underline font-bold text-foreground underline-offset-2">
                Ketentuan Komunitas
              </Link>{' '}
              dan berikrar merawat buku-buku yang dipinjam dengan penuh tanggung jawab.
            </span>
          </label>
          {fieldErrors.agreeTerms && (
            <p className="font-mono text-[11px] text-foreground font-semibold pt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-foreground inline-block shrink-0" />
              <span>{fieldErrors.agreeTerms}</span>
            </p>
          )}
        </div>

        {/* Inline Bottom Alert on Submit Error */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3 border-2 border-foreground bg-surface text-foreground space-y-1 animate-in fade-in-50 duration-150"
          >
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-foreground shrink-0" />
              <span>Pendaftaran Belum Lengkap</span>
            </div>
            <p className="text-xs font-sans text-foreground/85 pl-6">{errorMessage}</p>
          </div>
        )}

        {/* Tombol Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="solid"
            size="lg"
            className="w-full flex items-center justify-center gap-2 cursor-pointer font-mono tracking-wider"
            isLoading={isLoading}
          >
            <span>Daftarkan Akun Pembaca</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="pt-4 border-t border-border-hairline text-center">
        <p className="text-xs text-muted font-sans">
          Sudah memiliki akun pembaca?{' '}
          <Link
            href={rawRedirect ? `/masuk?redirect=${encodeURIComponent(rawRedirect)}` : '/masuk'}
            className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground underline underline-offset-4 hover:opacity-75 transition-opacity"
          >
            Masuk ke Akun
          </Link>
        </p>
      </div>
    </div>
    </RevealOnScroll>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-4 animate-pulse p-4">
          <div className="h-6 w-32 bg-surface-muted" />
          <div className="h-10 w-3/4 bg-surface-muted" />
        </div>
      }
    >
      <RegisterForm />
    </React.Suspense>
  );
}
