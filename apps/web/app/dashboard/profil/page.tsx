'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  KeyRound,
  Download,
  Save,
  CheckCircle,
  AlertCircle,
  Camera,
  Trash2,
  Loader2,
  Sparkles,
  ExternalLink,
  Award,
  FileText,
  BookOpen,
  Calendar,
  Check,
  Zap,
  X,
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserHonorBadge } from '@/components/gamification/user-honor-badge';
import { compressProfileImage, formatBytes, CompressionResult } from '@/lib/image-compression';
import { CircleCropModal } from '@/components/ui/circle-crop-modal';
import { getTierInfo, inferTierFromTitle } from '@/lib/badge-tier-styles';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardProfileSettingsPage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = React.useState({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    bio: '',
    avatarUrl: null as string | null,
    instagramUrl: '',
    websiteUrl: '',
    isProfilePublic: true,
    showBadges: true,
    equippedTitle: null as string | null,
    role: 'WARGA',
    trustLevel: 'TL0',
    createdAt: '',
  });

  const [passwordState, setPasswordState] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Gamification & Dossier Stats
  const [availableTitles, setAvailableTitles] = React.useState<string[]>([]);
  const [userStats, setUserStats] = React.useState({
    totalArticles: 0,
    badgesCount: 0,
    loansCount: 0,
    booksDonated: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [compressingAvatar, setCompressingAvatar] = React.useState(false);
  const [compressionInfo, setCompressionInfo] = React.useState<{
    original: string;
    compressed: string;
    savings: number;
    format: string;
  } | null>(null);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [cropModalOpen, setCropModalOpen] = React.useState(false);
  const [selectedFileForCrop, setSelectedFileForCrop] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Success Pop-up Modal & Floating Toast States
  const [successModalOpen, setSuccessModalOpen] = React.useState(false);
  const [toastNotification, setToastNotification] = React.useState<{
    title: string;
    description: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showToast = React.useCallback(
    (title: string, description: string, type: 'success' | 'error' | 'info' = 'success') => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      setToastNotification({ title, description, type });
      toastTimeoutRef.current = setTimeout(() => {
        setToastNotification(null);
      }, 5000);
    },
    []
  );

  const dismissToast = React.useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastNotification(null);
  }, []);

  // Close success modal on ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (successModalOpen) setSuccessModalOpen(false);
        if (toastNotification) dismissToast();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [successModalOpen, toastNotification, dismissToast]);

  // Fetch current user and badges progress
  React.useEffect(() => {
    async function loadData() {
      try {
        const [meRes, badgesRes] = await Promise.all([
          apiClient<any>('/auth/me'),
          apiClient<any>('/badges/my-progress').catch(() => ({ data: null })),
        ]);

        if (meRes.data) {
          const u = meRes.data.user || meRes.data;
          setProfile({
            name: u.name || '',
            username: u.username || '',
            email: u.email || '',
            phoneNumber: u.phoneNumber || '',
            bio: u.bio || '',
            avatarUrl: u.avatarUrl || null,
            instagramUrl: u.instagramUrl || '',
            websiteUrl: u.websiteUrl || '',
            isProfilePublic: u.isProfilePublic ?? true,
            showBadges: u.showBadges ?? true,
            equippedTitle: u.equippedTitle || badgesRes.data?.equippedTitle || null,
            role: u.role || 'WARGA',
            trustLevel: u.trustLevel || 'TL0',
            createdAt: u.createdAt || '',
          });
        }

        if (badgesRes.data) {
          setAvailableTitles(badgesRes.data.availableTitles || []);
          if (badgesRes.data.stats) {
            setUserStats({
              totalArticles: badgesRes.data.stats.articlesPublished || 0,
              badgesCount: badgesRes.data.earnedCount || 0,
              loansCount: badgesRes.data.stats.loansReturned || 0,
              booksDonated: badgesRes.data.stats.booksDonated || 0,
            });
          }
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate Profile Completion Percentage
  const profileCompletion = React.useMemo(() => {
    let score = 0;
    if (profile.name.trim()) score += 20;
    if (profile.avatarUrl) score += 25;
    if (profile.bio.trim()) score += 25;
    if (profile.phoneNumber.trim()) score += 15;
    if (profile.instagramUrl.trim() || profile.websiteUrl.trim()) score += 15;
    return Math.min(100, score);
  }, [profile]);

  // 1. File Selection triggers interactive Circle Crop Modal
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    if (rawFile.size > 10 * 1024 * 1024) {
      setMessage({ text: 'Ukuran berkas asal melebihi batas 10MB.', type: 'error' });
      return;
    }

    setSelectedFileForCrop(rawFile);
    setCropModalOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 2. Crop & Compression Complete Callback from CircleCropModal
  const handleCropComplete = async (compressed: CompressionResult) => {
    setUploadingAvatar(true);
    setMessage(null);
    setCompressionInfo({
      original: formatBytes(compressed.originalSize),
      compressed: formatBytes(compressed.compressedSize),
      savings: compressed.savingsPercent,
      format: compressed.format,
    });

    try {
      const formData = new FormData();
      formData.append('file', compressed.file);
      formData.append('folder', 'avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal mengunggah foto profil.');
      }

      setProfile((prev) => ({ ...prev, avatarUrl: json.url }));
      setMessage({
        text: `Foto profil lingkaran berhasil dipotong, dioptimasi (${formatBytes(compressed.compressedSize)}), dan diunggah. Klik "Simpan Perubahan" untuk menyimpan ke profil.`,
        type: 'success',
      });
    } catch (err: any) {
      setMessage({ text: err.message || 'Gagal mengunggah foto profil.', type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setProfile((prev) => ({ ...prev, avatarUrl: null }));
    setCompressionInfo(null);
    setMessage({
      text: 'Foto profil dicopot. Klik "Simpan Perubahan" untuk mengonfirmasi inisial monogram.',
      type: 'success',
    });
  };

  // Submit Profile Changes
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage(null);

    try {
      // 1. Save profile fields
      const res = await fetch('/api/v1/users/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
          phoneNumber: profile.phoneNumber,
          instagramUrl: profile.instagramUrl,
          websiteUrl: profile.websiteUrl,
          isProfilePublic: profile.isProfilePublic,
          showBadges: profile.showBadges,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Gagal menyimpan profil.');
      }

      // 2. Save equipped title if available
      try {
        await fetch('/api/v1/badges/equip-title', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title: profile.equippedTitle }),
        });
      } catch {
        // Non-blocking if gamification is optional
      }

      // 3. Refresh global auth context to immediately sync navbar, sidebar avatar & name
      try {
        await refreshUser();
      } catch {
        // Non-blocking
      }

      const successMsg = 'Perubahan profil, gelar kehormatan, dan preferensi berhasil disimpan.';
      setMessage({ text: successMsg, type: 'success' });

      // Open Success Pop-up Modal & trigger floating toast
      setSuccessModalOpen(true);
      showToast(
        'Pengaturan Profil Disimpan',
        'Identitas publik, foto profil, dan preferensi akun Anda telah disinkronkan ke seluruh sistem.',
        'success'
      );
    } catch (err: any) {
      const errMsg = err.message || 'Gagal menyimpan profil.';
      setMessage({ text: errMsg, type: 'error' });
      showToast('Gagal Menyimpan Profil', errMsg, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      const errMsg = 'Konfirmasi kata sandi baru tidak cocok.';
      setMessage({ text: errMsg, type: 'error' });
      showToast('Validasi Gagal', errMsg, 'error');
      return;
    }

    if (passwordState.newPassword.length < 8) {
      const errMsg = 'Kata sandi baru minimal 8 karakter.';
      setMessage({ text: errMsg, type: 'error' });
      showToast('Validasi Gagal', errMsg, 'error');
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
        throw new Error(json.error?.message || 'Gagal mengubah kata sandi.');
      }

      setMessage({ text: 'Kata sandi akun Anda berhasil diperbarui.', type: 'success' });
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Kata Sandi Diperbarui', 'Kata sandi akun Anda telah berhasil diperbarui.', 'success');
    } catch (err: any) {
      const errMsg = err.message || 'Gagal mengubah kata sandi.';
      setMessage({ text: errMsg, type: 'error' });
      showToast('Gagal Mengubah Sandi', errMsg, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleExportData = () => {
    window.location.href = '/api/v1/users/me/export';
  };

  const activeTier = profile.equippedTitle ? inferTierFromTitle(profile.equippedTitle) : 1;
  const tierInfo = getTierInfo(activeTier);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-muted">
        Memuat preferensi akun dan identitas warga...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ── 1. EDITORIAL HEADER ── */}
      <section className="border-b border-border-hairline bg-surface-muted/30 py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <User className="w-3.5 h-3.5" />
              <span>PENGATURAN IDENTITAS</span>
              <span>//</span>
              <span>KONTRIBUTOR WARGA</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Profil & Identitas Publik
            </h1>
            <p className="font-sans text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
              Atur bagaimana namamu, foto profil, dan reputasi literasimu tampil di hadapan pembaca publik Blora.
            </p>
          </div>

          <Link
            href={`/warga/${profile.username}`}
            target="_blank"
            className="px-3.5 py-2 border-2 border-foreground bg-surface hover:bg-surface-muted font-mono text-xs font-bold uppercase tracking-wider text-foreground inline-flex items-center gap-1.5 transition-colors shadow-xs shrink-0 self-start md:self-auto"
          >
            <span>Buka Profil Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── 2. CITIZEN REPUTATION DOSSIER (HEADER SNAPSHOT) ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-6">
        <div className="border-2 border-foreground bg-surface p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              src={profile.avatarUrl}
              name={profile.name}
              username={profile.username}
              size="lg"
              shape="circle"
              className="border-2 border-foreground shrink-0 shadow-xs"
            />
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-serif font-bold text-lg text-foreground truncate">
                  {profile.name || 'Warga Perpusjal'}
                </span>
                <span className="font-mono text-xs text-muted">@{profile.username}</span>
                <span className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.2 bg-foreground text-background border border-foreground">
                  {profile.role}
                </span>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 border border-border-hairline text-muted">
                  {profile.trustLevel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {profile.equippedTitle ? (
                  <span
                    className={cn(
                      'font-mono text-[9.5px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider shadow-xs',
                      tierInfo.honorBadgeClass
                    )}
                  >
                    Gelar: "{profile.equippedTitle}"
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-muted italic">
                    Belum ada gelar kehormatan aktif
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-border-hairline pt-4 lg:pt-0 lg:pl-6">
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted uppercase block">Karya Terbit</span>
              <span className="font-serif text-lg font-bold text-foreground">
                {userStats.totalArticles}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted uppercase block">Lencana</span>
              <span className="font-serif text-lg font-bold text-foreground">
                {userStats.badgesCount}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted uppercase block">Pinjaman</span>
              <span className="font-serif text-lg font-bold text-foreground">
                {userStats.loansCount}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted uppercase block">Hibah Buku</span>
              <span className="font-serif text-lg font-bold text-foreground">
                {userStats.booksDonated}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MAIN WORKSPACE AREA ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 space-y-10">
        {message && (
          <div
            className={cn(
              'p-4 border font-mono text-xs flex items-center gap-3 transition-all',
              message.type === 'success'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200'
            )}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* ── 3.1 PROFILE COMPLETION METER ── */}
        <section className="border border-border-hairline bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between font-mono text-xs mb-2">
            <span className="uppercase font-bold tracking-wider text-foreground flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Kelengkapan Identitas Akun
            </span>
            <span className="font-bold text-foreground">{profileCompletion}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-surface-muted border border-border-hairline mb-3">
            <div
              className="h-full bg-foreground transition-all duration-500 ease-out"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted">
            <span className={cn('flex items-center gap-1', profile.avatarUrl ? 'text-foreground font-bold' : '')}>
              <Check className={cn('w-3 h-3', profile.avatarUrl ? 'text-emerald-500' : 'text-muted/40')} />
              Foto Profil
            </span>
            <span>&bull;</span>
            <span className={cn('flex items-center gap-1', profile.bio.trim() ? 'text-foreground font-bold' : '')}>
              <Check className={cn('w-3 h-3', profile.bio.trim() ? 'text-emerald-500' : 'text-muted/40')} />
              Bio Literasi
            </span>
            <span>&bull;</span>
            <span className={cn('flex items-center gap-1', profile.phoneNumber.trim() ? 'text-foreground font-bold' : '')}>
              <Check className={cn('w-3 h-3', profile.phoneNumber.trim() ? 'text-emerald-500' : 'text-muted/40')} />
              No. Kontak
            </span>
            <span>&bull;</span>
            <span className={cn('flex items-center gap-1', (profile.instagramUrl || profile.websiteUrl) ? 'text-foreground font-bold' : '')}>
              <Check className={cn('w-3 h-3', (profile.instagramUrl || profile.websiteUrl) ? 'text-emerald-500' : 'text-muted/40')} />
              Tautan Eksternal
            </span>
          </div>
        </section>

        {/* ── 3.2 EDITORIAL FORM & LIVE PREVIEWS (TWO COLUMNS) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLS: EDIT FORM */}
          <div className="lg:col-span-2 space-y-8">
            <section className="border border-border-hairline bg-surface p-6 sm:p-7 space-y-6">
              <div className="flex items-center gap-2 border-b border-border-hairline pb-3">
                <User className="w-4 h-4 text-foreground" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Informasi Profil & Gelar
                </h2>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* ── SMART AVATAR UPLOADER WITH IMAGE COMPRESSION ── */}
                <div className="pb-6 border-b border-border-hairline space-y-3">
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted font-bold">
                    Foto Profil & Identitas Visual
                  </label>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="relative group shrink-0">
                      <UserAvatar
                        src={profile.avatarUrl}
                        name={profile.name}
                        username={profile.username}
                        size="xl"
                        shape="circle"
                        className="border-2 border-foreground shadow-sm"
                      />
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-background/85 rounded-full flex flex-col items-center justify-center text-center p-1">
                          <Loader2 className="w-6 h-6 animate-spin text-foreground mb-1" />
                          <span className="font-mono text-[9px] uppercase font-bold text-foreground">
                            Mengunggah...
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          onChange={handleAvatarFileSelect}
                          className="hidden"
                        />

                        <button
                          type="button"
                          disabled={uploadingAvatar}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 border-2 border-foreground bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {uploadingAvatar ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Camera className="w-3.5 h-3.5" />
                          )}
                          <span>{profile.avatarUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
                        </button>

                        {profile.avatarUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="px-3.5 py-2 border border-border-hairline bg-surface hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-300 font-mono text-xs text-muted transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            title="Hapus foto profil dan gunakan inisial monogram"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>

                      {/* Compression Savings Notice */}
                      {compressionInfo && (
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Dioptimasi: {compressionInfo.original} &rarr;{' '}
                            <strong>{compressionInfo.compressed}</strong> ({compressionInfo.format},{' '}
                            Hemat {compressionInfo.savings}%)
                          </span>
                        </div>
                      )}

                      <p className="font-sans text-xs text-muted leading-relaxed">
                        Foto otomatis dikompresi di bawah <strong>100 KB</strong> (WebP 400x400 px) secara instan di peramban Anda untuk menghemat bandwidth CDN dan koneksi seluler.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── EQUIPPED TITLE SELECTOR ── */}
                <div className="pb-6 border-b border-border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-mono text-xs uppercase tracking-wider text-muted font-bold">
                      Gelar Kehormatan Aktif (Gamifikasi)
                    </label>
                    <Link
                      href="/dashboard/badge"
                      className="font-mono text-[10px] text-muted hover:text-foreground underline"
                    >
                      Buka Lebih Banyak Gelar &rarr;
                    </Link>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <select
                      value={profile.equippedTitle || ''}
                      onChange={(e) =>
                        setProfile({ ...profile, equippedTitle: e.target.value || null })
                      }
                      className="w-full sm:w-72 px-3 py-2 border border-border-hairline bg-background text-foreground font-mono text-xs focus:outline-none focus:border-foreground"
                    >
                      <option value="">-- Tanpa Gelar Tersemat --</option>
                      {availableTitles.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    {profile.equippedTitle && (
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'font-mono text-[10px] px-3 py-1 rounded-full border font-bold uppercase tracking-wider shadow-xs',
                            tierInfo.honorBadgeClass
                          )}
                        >
                          {profile.equippedTitle}
                        </span>
                        <span className="font-mono text-[10px] text-muted">
                          (Tier {activeTier} &bull; {tierInfo.name})
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-muted block">
                    Gelar ini akan terpampang di samping namamu pada artikel, kolofon, dan komentar.
                  </span>
                </div>

                {/* Names & Credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">
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
                    <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">
                      Alamat Email Akun
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full px-3 py-2 border border-border-hairline bg-surface-muted/50 text-muted font-mono text-xs cursor-not-allowed"
                    />
                    <span className="font-mono text-[10px] text-muted block mt-1">
                      Email terverifikasi untuk warta &amp; sirkulasi.
                    </span>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">
                      Nomor WhatsApp / HP
                    </label>
                    <input
                      type="tel"
                      placeholder="08123456789"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-border-hairline bg-background text-foreground font-mono text-xs focus:outline-none focus:border-foreground"
                    />
                    <span className="font-mono text-[10px] text-muted block mt-1">
                      Untuk koordinasi lapak &amp; pengingat pinjaman buku.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">
                    Bio Singkat (Maks. 200 Karakter)
                  </label>
                  <textarea
                    maxLength={200}
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tuliskan latar belakang, keresahan sastra, atau catatan ringkas tentang dirimu..."
                    className="w-full px-3 py-2 border border-border-hairline bg-background text-foreground font-serif text-sm focus:outline-none focus:border-foreground leading-relaxed"
                  />
                  <span className="font-mono text-[10px] text-muted block mt-1">
                    {profile.bio.length} / 200 karakter
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">
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
                    <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">
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

                {/* PRIVACY TOGGLES */}
                <div className="pt-4 border-t border-border-hairline space-y-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                    Pengaturan Privasi &amp; Keterbukaan Publik
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
                        Jika dimatikan, halaman /warga/{profile.username} hanya akan menampilkan nama dan daftar artikel yang sudah terbit demi kearsipan karya warga.
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
                        Pajang Lencana Prestasi di Halaman Profil
                      </span>
                      <span className="font-serif text-xs text-muted leading-relaxed block mt-0.5">
                        Menampilkan etalase lencana dan stempel pencapaian kontribusi literasi.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 border-2 border-foreground bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:bg-foreground/90 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </section>

            {/* SECTION: GANTI KATA SANDI */}
            <section className="border border-border-hairline bg-surface p-6 sm:p-7">
              <div className="flex items-center gap-2 border-b border-border-hairline pb-3 mb-6">
                <KeyRound className="w-4 h-4 text-foreground" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Keamanan Kata Sandi
                </h2>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">
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
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">
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
                  <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">
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
                    className="px-5 py-2 border border-foreground bg-surface text-foreground font-mono text-xs uppercase tracking-wider font-bold hover:bg-foreground hover:text-background disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {savingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
                  </button>
                </div>
              </form>
            </section>

            {/* SECTION: HAK AKSES DATA & EKSPOR */}
            <section className="border border-border-hairline bg-surface p-6 sm:p-7">
              <div className="flex items-center gap-2 border-b border-border-hairline pb-3 mb-4">
                <Download className="w-4 h-4 text-foreground" />
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Portabilitas Data Warga
                </h2>
              </div>

              <p className="font-serif text-sm text-muted leading-relaxed mb-6">
                Selaras dengan prinsip transparansi literasi dan kedaulatan data warga, Anda berhak mengunduh seluruh arsip data yang tersimpan di sistem Perpusjal (profil, tulisan, riwayat pinjaman, komentar, dan lencana) dalam format terbuka JSON kapan saja.
              </p>

              <button
                onClick={handleExportData}
                type="button"
                className="px-5 py-2.5 border border-foreground bg-surface text-foreground font-mono text-xs uppercase tracking-wider font-semibold hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Unduh Berkas Arsip Data Saya (JSON)
              </button>
            </section>
          </div>

          {/* RIGHT 1 COL: LIVE REAL-TIME PREVIEW PANEL */}
          <div className="space-y-6">
            <div className="sticky top-6 space-y-6">
              <div className="border-2 border-foreground bg-surface p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] space-y-5">
                <div className="border-b-2 border-foreground pb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Pratinjau Nyata Publik
                  </span>
                  <span className="font-mono text-[9px] uppercase text-muted">
                    REAL-TIME
                  </span>
                </div>

                {/* Preview 1: In Article Byline */}
                <div className="space-y-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted block font-bold">
                    1. Pada Byline Artikel
                  </span>
                  <div className="p-3 border border-border-hairline bg-surface-muted/40 space-y-2">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={profile.avatarUrl}
                        name={profile.name}
                        username={profile.username}
                        size="sm"
                        shape="circle"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-serif font-bold text-xs text-foreground truncate">
                            {profile.name || 'Nama Penulis'}
                          </span>
                          {profile.equippedTitle && (
                            <span
                              className={cn(
                                'font-mono text-[8.5px] px-2 py-0.2 rounded-full border font-bold uppercase tracking-wider',
                                tierInfo.honorBadgeClass
                              )}
                            >
                              {profile.equippedTitle}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[9px] text-muted">
                          3 Oktober 2026 &bull; 4 Menit Baca
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview 2: In Discussion / Comments */}
                <div className="space-y-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted block font-bold">
                    2. Pada Kolom Komentar Warga
                  </span>
                  <div className="p-3 border border-border-hairline bg-surface-muted/40">
                    <div className="flex items-start gap-2.5">
                      <UserAvatar
                        src={profile.avatarUrl}
                        name={profile.name}
                        username={profile.username}
                        size="xs"
                        shape="circle"
                        className="mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="font-serif font-bold text-xs text-foreground">
                            {profile.name || 'Nama Warga'}
                          </span>
                          <span className="font-mono text-[10px] text-muted">
                            @{profile.username}
                          </span>
                          {profile.equippedTitle && (
                            <span
                              className={cn(
                                'font-mono text-[8px] px-1.5 py-0.2 rounded-full border font-bold uppercase tracking-wider',
                                tierInfo.honorBadgeClass
                              )}
                            >
                              {profile.equippedTitle}
                            </span>
                          )}
                          <span className="font-mono text-[9px] text-muted">
                            &bull; Baru saja
                          </span>
                        </div>
                        <p className="font-sans text-[11px] text-foreground/80 leading-snug">
                          {profile.bio ? `"${profile.bio.slice(0, 75)}..."` : 'Dialektika literasi jalanan adalah ruang perjumpaan merdeka bagi siapa saja.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview 3: Bio Card */}
                <div className="pt-2 border-t border-border-hairline space-y-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted block font-bold">
                    3. Bio Singkat
                  </span>
                  <p className="font-serif italic text-xs text-muted leading-relaxed">
                    {profile.bio || 'Belum menuliskan bio profil.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── 4. CIRCLE CROP INTERACTIVE MODAL ── */}
      <CircleCropModal
        isOpen={cropModalOpen}
        imageFile={selectedFileForCrop}
        onClose={() => {
          setCropModalOpen(false);
          setSelectedFileForCrop(null);
        }}
        onCropComplete={handleCropComplete}
      />

      {/* ── 5. SUCCESS CONFIRMATION POP-UP MODAL ── */}
      {successModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSuccessModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-surface border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.9)] animate-in zoom-in-95 duration-150 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Editorial Top Ribbon / Header */}
            <div className="flex items-center justify-between border-b-2 border-foreground bg-foreground text-background px-4 py-2">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest">
                <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>PEMBARUAN BERHASIL &bull; PERPUSJAL</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessModalOpen(false)}
                aria-label="Tutup popup"
                className="text-background hover:opacity-75 transition-opacity p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Celebration Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 id="success-modal-title" className="font-serif text-lg font-bold text-foreground leading-tight">
                    Pengaturan Profil Disimpan!
                  </h3>
                  <p className="font-sans text-xs text-muted leading-relaxed mt-1">
                    Data identitas, foto profil, dan preferensi akun Anda telah berhasil diperbarui ke seluruh sistem.
                  </p>
                </div>
              </div>

              {/* Updated Persona Preview Card */}
              <div className="border border-border-hairline bg-surface-muted/30 p-3.5 space-y-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={profile.avatarUrl}
                    name={profile.name}
                    username={profile.username}
                    size="md"
                    shape="circle"
                    className="ring-2 ring-emerald-500/40 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-serif font-bold text-sm text-foreground truncate">
                        {profile.name || 'Nama Warga'}
                      </span>
                      {profile.equippedTitle && (
                        <span
                          className={cn(
                            'font-mono text-[8.5px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider',
                            tierInfo.honorBadgeClass
                          )}
                        >
                          {profile.equippedTitle}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-muted block">
                      @{profile.username}
                    </span>
                  </div>
                </div>

                {profile.bio && (
                  <p className="font-serif italic text-xs text-foreground/80 leading-relaxed border-t border-border-hairline pt-2 line-clamp-2">
                    "{profile.bio}"
                  </p>
                )}

                {/* Configuration Summary Pills */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-hairline font-mono text-[10px]">
                  <div className="flex items-center gap-1.5 text-muted">
                    <span className={cn('w-1.5 h-1.5 rounded-full', profile.isProfilePublic ? 'bg-emerald-500' : 'bg-amber-500')} />
                    <span>Visibilitas: <strong className="text-foreground">{profile.isProfilePublic ? 'Publik' : 'Privat'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted">
                    <span className={cn('w-1.5 h-1.5 rounded-full', profile.showBadges ? 'bg-emerald-500' : 'bg-muted')} />
                    <span>Lencana: <strong className="text-foreground">{profile.showBadges ? 'Aktif' : 'Nonaktif'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSuccessModalOpen(false)}
                  className="w-full sm:w-auto flex-1 font-mono text-xs uppercase tracking-wider py-2.5 px-4 border border-foreground bg-transparent text-foreground hover:bg-surface-muted transition-colors font-bold text-center cursor-pointer"
                >
                  Tutup &amp; Lanjutkan
                </button>
                <Link
                  href={`/warga/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-wider py-2.5 px-4 bg-foreground text-background hover:bg-foreground/90 transition-colors font-bold shadow-xs text-center cursor-pointer"
                >
                  <span>Lihat Profil Publik</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. FLOATING SYSTEM TOAST NOTIFICATION ── */}
      {toastNotification && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] bg-surface border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] animate-in slide-in-from-bottom-5 fade-in duration-200"
        >
          {/* Header Ribbon */}
          <div
            className={cn(
              'flex items-center justify-between px-3 py-1.5 border-b border-foreground font-mono text-[10px] font-bold uppercase tracking-widest',
              toastNotification.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-foreground text-background'
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-block w-2 h-2 rounded-full animate-pulse',
                  toastNotification.type === 'error' ? 'bg-white' : 'bg-emerald-400'
                )}
              />
              <span>
                {toastNotification.type === 'error' ? 'PERINGATAN SISTEM' : 'PEMBERITAHUAN SISTEM'}
              </span>
            </div>
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Tutup pemberitahuan"
              className="text-inherit hover:opacity-75 transition-opacity p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 flex items-start gap-3">
            {toastNotification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="font-serif text-sm font-bold text-foreground leading-snug">
                {toastNotification.title}
              </h4>
              <p className="font-sans text-xs text-foreground/80 leading-relaxed">
                {toastNotification.description}
              </p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
