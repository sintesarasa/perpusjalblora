'use client';

import * as React from 'react';
import { User, Shield, KeyRound, Download, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardProfileSettingsPage() {
  const [profile, setProfile] = React.useState({
    name: '',
    username: '',
    email: '',
    bio: '',
    instagramUrl: '',
    websiteUrl: '',
    isProfilePublic: true,
    showBadges: true,
  });

  const [passwordState, setPasswordState] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = React.useState(true);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch current user
  React.useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/v1/auth/me', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          const u = json.data?.user;
          if (u) {
            setProfile({
              name: u.name || '',
              username: u.username || '',
              email: u.email || '',
              bio: u.bio || '',
              instagramUrl: u.instagramUrl || '',
              websiteUrl: u.websiteUrl || '',
              isProfilePublic: u.isProfilePublic ?? true,
              showBadges: u.showBadges ?? true,
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/users/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          instagramUrl: profile.instagramUrl,
          websiteUrl: profile.websiteUrl,
          isProfilePublic: profile.isProfilePublic,
          showBadges: profile.showBadges,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Gagal menyimpan profil');
      }

      setMessage({ text: 'Perubahan profil dan privasi berhasil disimpan.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setMessage({ text: 'Konfirmasi kata sandi baru tidak cocok.', type: 'error' });
      return;
    }

    if (passwordState.newPassword.length < 8) {
      setMessage({ text: 'Kata sandi baru minimal 8 karakter.', type: 'error' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/v1/users/me/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordState.currentPassword,
          newPassword: passwordState.newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Gagal mengubah kata sandi');
      }

      setMessage({ text: 'Kata sandi berhasil diperbarui.', type: 'success' });
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleExportData = () => {
    window.location.href = '/api/v1/users/me/export';
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-muted">
        Memuat preferensi akun...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* 1. EDITORIAL HEADER */}
      <section className="border-b border-border-hairline bg-surface-muted/30 py-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted mb-2">
            <User className="w-3.5 h-3.5" />
            <span>PENGATURAN IDENTITAS & PRIVASI</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Profil & Akun
          </h1>
          <p className="font-serif text-sm text-muted mt-1">
            Kelola visibilitas publik, keamanan kredensial, dan hak kearsipan datamu.
          </p>
        </div>
      </section>

      {/* 2. MAIN FORM AREA */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 pt-8 space-y-10">
        {message && (
          <div
            className={`p-4 border font-mono text-xs flex items-center gap-3 ${
              message.type === 'success'
                ? 'border-foreground bg-surface text-foreground'
                : 'border-red-600 bg-red-50 text-red-900'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-foreground" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* SECTION 1: PROFIL & PRIVASI */}
        <section className="border border-border-hairline bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-2 border-b border-border-hairline pb-3 mb-6">
            <User className="w-4 h-4 text-foreground" />
            <h2 className="font-serif text-xl font-bold text-foreground">
              Informasi Publik & Privasi
            </h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5">
                  Nama Lengkap / Pena
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border-hairline bg-background text-foreground font-serif text-sm focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5">
                  Nama Pengguna (Username)
                </label>
                <input
                  type="text"
                  disabled
                  value={`@${profile.username}`}
                  className="w-full px-3 py-2 border border-border-hairline bg-surface-muted/50 text-muted font-mono text-xs cursor-not-allowed"
                />
                <span className="font-mono text-[10px] text-muted block mt-1">
                  Username bersifat permanen untuk catatan kearsipan.
                </span>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5">
                Bio Singkat (Maks. 200 Karakter)
              </label>
              <textarea
                maxLength={200}
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tuliskan latar belakang, minat baca, atau catatan ringkas tentang dirimu..."
                className="w-full px-3 py-2 border border-border-hairline bg-background text-foreground font-serif text-sm focus:outline-none focus:border-foreground"
              />
              <span className="font-mono text-[10px] text-muted block mt-1">
                {profile.bio.length} / 200 karakter
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5">
                  Tautan Instagram (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/username"
                  value={profile.instagramUrl}
                  onChange={(e) => setProfile({ ...profile, instagramUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-border-hairline bg-background text-foreground font-serif text-sm focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5">
                  Tautan Situs Web / Blog (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://tulisanmu.com"
                  value={profile.websiteUrl}
                  onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-border-hairline bg-background text-foreground font-serif text-sm focus:outline-none focus:border-foreground"
                />
              </div>
            </div>

            {/* PRIVACY TOGGLES (PRD §18.2) */}
            <div className="pt-4 border-t border-border-hairline space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                Pengaturan Privasi (PRD §18.2)
              </h3>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.isProfilePublic}
                  onChange={(e) => setProfile({ ...profile, isProfilePublic: e.target.checked })}
                  className="mt-1 accent-foreground"
                />
                <div>
                  <span className="font-serif text-sm font-bold text-foreground block">
                    Profil Terbuka untuk Publik
                  </span>
                  <span className="font-serif text-xs text-muted leading-relaxed block mt-0.5">
                    Jika dimatikan, halaman /u/{profile.username} hanya akan menampilkan nama dan daftar artikel yang sudah terbit (atribusi karya tidak dapat disembunyikan per BR-PROF-01).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.showBadges}
                  onChange={(e) => setProfile({ ...profile, showBadges: e.target.checked })}
                  className="mt-1 accent-foreground"
                />
                <div>
                  <span className="font-serif text-sm font-bold text-foreground block">
                    Pajang Lencana Prestasi di Profil
                  </span>
                  <span className="font-serif text-xs text-muted leading-relaxed block mt-0.5">
                    Menampilkan penghargaan kontribusi yang telah kamu capai pada profil publik.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 border border-foreground bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 2: GANTI KATA SANDI */}
        <section className="border border-border-hairline bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-2 border-b border-border-hairline pb-3 mb-6">
            <KeyRound className="w-4 h-4 text-foreground" />
            <h2 className="font-serif text-xl font-bold text-foreground">
              Keamanan Kata Sandi
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5">
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                required
                value={passwordState.currentPassword}
                onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-border-hairline bg-background text-foreground font-mono text-xs focus:outline-none focus:border-foreground"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5">
                Kata Sandi Baru (Min. 8 Karakter)
              </label>
              <input
                type="password"
                required
                value={passwordState.newPassword}
                onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-border-hairline bg-background text-foreground font-mono text-xs focus:outline-none focus:border-foreground"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                value={passwordState.confirmPassword}
                onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-border-hairline bg-background text-foreground font-mono text-xs focus:outline-none focus:border-foreground"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2 border border-foreground bg-surface text-foreground font-mono text-xs uppercase tracking-wider font-bold hover:bg-foreground hover:text-background disabled:opacity-50 transition-colors"
              >
                {savingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 3: HAK AKSES DATA & EKSPOR (FR-PROF-02) */}
        <section className="border border-border-hairline bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-2 border-b border-border-hairline pb-3 mb-4">
            <Download className="w-4 h-4 text-foreground" />
            <h2 className="font-serif text-xl font-bold text-foreground">
              Portabilitas Data (FR-PROF-02)
            </h2>
          </div>

          <p className="font-serif text-sm text-muted leading-relaxed mb-6">
            Selaras dengan prinsip transparansi literasi dan kedaulatan data warga, kamu berhak mengunduh seluruh data yang tersimpan di sistem Perpusjal (profil, tulisan, riwayat pinjaman, komentar, dan lencana) dalam format terbuka JSON kapan saja.
          </p>

          <button
            onClick={handleExportData}
            type="button"
            className="px-5 py-2.5 border border-foreground bg-surface text-foreground font-mono text-xs uppercase tracking-wider font-semibold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Unduh Berkas Data Saya (JSON)
          </button>
        </section>
      </main>
    </div>
  );
}
