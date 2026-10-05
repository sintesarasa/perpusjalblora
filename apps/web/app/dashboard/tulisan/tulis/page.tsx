'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EditorialEditor } from '@/components/editor/editorial-editor';
import { ArticleCoverUploader } from '@/components/articles/article-cover-uploader';
import { TagPicker } from '@/components/articles/tag-picker';
import { SeoAnalysisPanel } from '@/components/articles/seo-analysis-panel';
import {
  CategoryPickerModal,
  OFFICIAL_CATEGORY_GUIDES,
} from '@/components/articles/category-picker-modal';
import { apiClient } from '@/lib/api';
import { ArticleCategory, ArticleTag } from '@perpusjal/types';
import {
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  SlidersHorizontal,
  ChevronDown,
  BookOpen,
  Image as ImageIcon,
  Tag as TagIcon,
  X,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FALLBACK_ARTICLE_CATEGORIES: ArticleCategory[] = [
  { id: 'suara-lapak', name: 'Suara Lapak', slug: 'suara-lapak' },
  { id: 'pojok-blora', name: 'Pojok Blora', slug: 'pojok-blora' },
  { id: 'opini-warga', name: 'Opini Warga', slug: 'opini-warga' },
  { id: 'lingkungan', name: 'Lingkungan', slug: 'lingkungan' },
  { id: 'sejarah', name: 'Sejarah', slug: 'sejarah' },
  { id: 'puisi', name: 'Puisi', slug: 'puisi' },
  { id: 'refleksi-diri', name: 'Refleksi Diri', slug: 'refleksi-diri' },
];

interface NewArticleDraftBackup {
  title: string;
  subtitle: string;
  categoryId: string;
  coverImage: string;
  coverCredit: string;
  tagIds: string[];
  contentJson: any;
  plainText: string;
  agreeOriginality: boolean;
  updatedAt: string;
}

export default function DashboardWriteArticlePage() {
  const router = useRouter();

  // Core state
  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('suara-lapak');
  const [coverImage, setCoverImage] = React.useState('');
  const [coverCredit, setCoverCredit] = React.useState('');
  const [tagIds, setTagIds] = React.useState<string[]>([]);
  const [contentJson, setContentJson] = React.useState<any>(null);
  const [plainText, setPlainText] = React.useState('');
  const [agreeOriginality, setAgreeOriginality] = React.useState(false);

  // Metadata
  const [categories, setCategories] = React.useState<ArticleCategory[]>(FALLBACK_ARTICLE_CATEGORIES);
  const [tags, setTags] = React.useState<ArticleTag[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [autosaveState, setAutosaveState] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [savedDraftId, setSavedDraftId] = React.useState<string | null>(null);

  // Ergonomic writing drawers and modals
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = React.useState(false);

  // Unsaved changes & local storage backup state
  const [isDirty, setIsDirty] = React.useState(false);
  const [hasLocalBackup, setHasLocalBackup] = React.useState(false);
  const [localBackupTime, setLocalBackupTime] = React.useState<string | null>(null);
  const [localBackupData, setLocalBackupData] = React.useState<NewArticleDraftBackup | null>(null);

  const isSavingRef = React.useRef(false);
  const titleTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    async function loadMeta() {
      const [catRes, tagRes] = await Promise.all([
        apiClient<ArticleCategory[]>('/articles/categories'),
        apiClient<ArticleTag[]>('/articles/tags'),
      ]);
      if (catRes.data && catRes.data.length > 0) {
        setCategories(catRes.data);
        setCategoryId(catRes.data[0].id);
      }
      if (tagRes.data) setTags(tagRes.data);

      // Check if there is an offline local backup for new draft
      try {
        const rawBackup = localStorage.getItem('perpusjal_new_draft');
        if (rawBackup) {
          const parsed: NewArticleDraftBackup = JSON.parse(rawBackup);
          if (parsed.title || parsed.plainText) {
            setHasLocalBackup(true);
            setLocalBackupTime(
              new Date(parsed.updatedAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })
            );
            setLocalBackupData(parsed);
          }
        }
      } catch (e) {
        console.warn('Gagal membaca draf lokal baru:', e);
      }
    }
    loadMeta();
  }, []);

  // Auto-resize title textarea on title change
  React.useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
    }
  }, [title]);

  // Warn user before leaving page if there are unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Close slide-over drawer on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen]);

  // Helper to persist silent local backup
  const persistLocalBackup = React.useCallback(
    (overrides?: Partial<NewArticleDraftBackup>) => {
      try {
        const draft: NewArticleDraftBackup = {
          title,
          subtitle,
          categoryId,
          coverImage,
          coverCredit,
          tagIds,
          contentJson,
          plainText,
          agreeOriginality,
          updatedAt: new Date().toISOString(),
          ...overrides,
        };
        localStorage.setItem('perpusjal_new_draft', JSON.stringify(draft));
        setIsDirty(true);
      } catch (e) {
        console.warn('Gagal menyimpan draf lokal:', e);
      }
    },
    [title, subtitle, categoryId, coverImage, coverCredit, tagIds, contentJson, plainText, agreeOriginality]
  );

  const restoreLocalBackup = () => {
    if (!localBackupData) return;
    if (localBackupData.title !== undefined) setTitle(localBackupData.title);
    if (localBackupData.subtitle !== undefined) setSubtitle(localBackupData.subtitle);
    if (localBackupData.categoryId !== undefined) setCategoryId(localBackupData.categoryId);
    if (localBackupData.coverImage !== undefined) setCoverImage(localBackupData.coverImage);
    if (localBackupData.coverCredit !== undefined) setCoverCredit(localBackupData.coverCredit);
    if (localBackupData.tagIds !== undefined) setTagIds(localBackupData.tagIds);
    if (localBackupData.contentJson !== undefined) setContentJson(localBackupData.contentJson);
    if (localBackupData.plainText !== undefined) setPlainText(localBackupData.plainText);
    if (localBackupData.agreeOriginality !== undefined) setAgreeOriginality(localBackupData.agreeOriginality);

    setHasLocalBackup(false);
    setLocalBackupData(null);
    setIsDirty(true);
    setSuccessMessage('Draf offline lokal berhasil dipulihkan ke lembar kerja.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const discardLocalBackup = () => {
    try {
      localStorage.removeItem('perpusjal_new_draft');
    } catch {}
    setHasLocalBackup(false);
    setLocalBackupData(null);
  };

  const handleSave = async (isDraft: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Judul naskah wajib diisi sebelum menyimpan.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!isDraft) {
      if (!coverImage.trim()) {
        setErrorMessage('Gambar sampul wajib diunggah sebelum mengajukan naskah ke redaksi.');
        setIsSettingsOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (wordCount < 100) {
        setErrorMessage('Naskah minimal 100 kata sebelum dapat diajukan ke meja redaksi.');
        return;
      }
      if (!agreeOriginality) {
        setErrorMessage('Buka Pengaturan Naskah dan centang Ikrar Orisinalitas Karya terlebih dahulu.');
        setIsSettingsOpen(true);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const body: any = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        categoryId,
        coverImage: coverImage.trim() || undefined,
        coverCredit: coverCredit.trim() || undefined,
        content: contentJson,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        isDraft,
      };

      const endpoint = savedDraftId ? `/articles/${savedDraftId}` : '/articles';
      const method = savedDraftId ? 'PATCH' : 'POST';
      const res = await apiClient<{ id: string }>(endpoint, { method, body: JSON.stringify(body) });

      if (res.error) {
        setErrorMessage(res.error.message || 'Gagal menyimpan naskah.');
        return;
      }

      setIsDirty(false);
      try {
        localStorage.removeItem('perpusjal_new_draft');
      } catch {}

      const activeId = res.data?.id || savedDraftId;
      if (res.data && !savedDraftId) setSavedDraftId(res.data.id);

      if (!isDraft && activeId) {
        await apiClient(`/articles/${activeId}/submit`, { method: 'POST' });
      }

      setSuccessMessage(
        isDraft ? 'Draf naskah tersimpan rapi.' : 'Naskah berhasil diajukan ke kurator redaksi Perpusjal.'
      );
      setTimeout(() => router.push('/dashboard/tulisan'), 1400);
    } catch {
      setErrorMessage('Gagal menghubungi server. Periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const tagNames = tags.filter((t) => tagIds.includes(t.id)).map((t) => t.name);
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedCategoryGuide = selectedCategory ? OFFICIAL_CATEGORY_GUIDES[selectedCategory.slug] : null;

  // Metadata completeness helper
  const hasCover = Boolean(coverImage.trim());

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground/15">
      {/* ── 1. Top Action Bar (h-12 = 48px, sticky beneath Dashboard Navbar at top-14) ── */}
      <div className="sticky top-14 z-30 h-12 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-3 sm:px-6 transition-all">
        {/* Left: Back button & status pill */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/dashboard/tulisan"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted hover:text-foreground transition-colors py-1 pr-2.5 sm:pr-3 border-r border-border shrink-0"
            title="Kembali ke Ruang Tulisan"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Naskah Saya</span>
            <span className="sm:hidden">Kembali</span>
          </Link>

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider shrink-0">
            {autosaveState === 'saving' ? (
              <span className="text-foreground animate-pulse flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted" />
                <span className="hidden xs:inline">Menyimpan draf...</span>
                <span className="xs:hidden">Simpan...</span>
              </span>
            ) : autosaveState === 'saved' || lastSavedAt ? (
              <span className="text-foreground flex items-center gap-1 font-mono text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-foreground" />
                <span className="hidden sm:inline">Tersimpan {lastSavedAt}</span>
                <span className="sm:hidden">Tersimpan</span>
              </span>
            ) : isDirty ? (
              <span className="text-foreground border border-foreground px-1.5 py-0.5 rounded-none flex items-center gap-1 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 bg-foreground rounded-none animate-pulse" />
                <span className="hidden xs:inline">[ ▫ DRAF BARU BELUM DISIMPAN ]</span>
                <span className="xs:hidden">[ ▫ DRAF ]</span>
              </span>
            ) : (
              <span className="text-muted border border-border-hairline px-1.5 py-0.5 rounded-none font-mono text-[10px]">
                [ ▫ DRAF BARU ]
              </span>
            )}
          </div>
        </div>

        {/* Right: Word count, Settings Drawer Trigger & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {wordCount > 0 && (
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider hidden lg:inline-block mr-1">
              {wordCount} Kata
            </span>
          )}

          {/* Slide-over Settings Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={cn(
              'h-8 px-2.5 sm:px-3 border font-mono text-[10px] sm:text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors relative rounded-none',
              isSettingsOpen
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted hover:text-foreground hover:border-foreground bg-surface-muted/20'
            )}
            title="Buka Pengaturan Naskah (Sampul, Kategori, Tag, SEO, Ikrar)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pengaturan</span>
            {!hasCover && (
              <span
                className="w-1.5 h-1.5 rounded-none bg-foreground shrink-0"
                title="Gambar sampul belum diunggah"
              />
            )}
          </button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSave(true)}
            isLoading={isSubmitting}
            className="h-8 px-2.5 sm:px-3 font-mono text-[10px] sm:text-[11px]"
          >
            <Save className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Simpan </span>Draf
          </Button>

          <Button
            type="button"
            variant="solid"
            size="sm"
            onClick={() => handleSave(false)}
            isLoading={isSubmitting}
            className="h-8 px-3 sm:px-3.5 font-mono text-[10px] sm:text-[11px] font-semibold"
          >
            <Send className="w-3.5 h-3.5 sm:mr-1.5" />
            <span>Kirim</span>
            <span className="hidden md:inline">&nbsp;ke Redaksi</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Pure Editorial Stationery Canvas ── */}
      {/* Optimal line length ~720px (max-w-[740px]) & eye-level bottom cushion (pb-[45vh]) */}
      <main className="max-w-[740px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-[45vh] space-y-6 sm:space-y-8">
        {/* Offline Local Recovery Banner */}
        {hasLocalBackup && (
          <div className="p-3.5 sm:p-4 border-2 border-foreground bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                  Draf Belum Tersimpan Ditemukan
                </p>
                <p className="text-xs sm:text-sm font-sans text-foreground mt-0.5">
                  Ditemukan naskah baru ({localBackupTime}) dari sesi menulis kamu sebelumnya.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <Button
                type="button"
                variant="solid"
                size="sm"
                onClick={restoreLocalBackup}
                className="h-7 px-3 font-mono text-[10px] uppercase font-bold"
              >
                Pulihkan Naskah
              </Button>
              <button
                type="button"
                onClick={discardLocalBackup}
                className="h-7 px-2.5 font-mono text-[10px] uppercase text-muted hover:text-foreground transition-colors"
              >
                Abaikan
              </button>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3.5 sm:p-4 border-2 border-foreground bg-surface flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 text-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                Perhatian Pengiriman
              </p>
              <p className="text-sm font-sans mt-0.5 text-foreground">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-muted hover:text-foreground text-lg leading-none p-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="p-3.5 sm:p-4 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <p className="text-sm font-sans text-emerald-900 dark:text-emerald-200 font-medium">
              {successMessage}
            </p>
          </div>
        )}

        {/* ── Section A: Editorial Headline & Lede Flow ── */}
        <header className="space-y-4 sm:space-y-5">
          {/* Minimal Folio Pill & Rubrik Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(true)}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase font-bold text-foreground bg-surface-muted/60 hover:bg-surface-muted px-2.5 py-1 border border-border hover:border-foreground transition-colors group cursor-pointer"
                title="Klik untuk panduan lengkap & memilih rubrik"
              >
                <span className="w-1.5 h-1.5 bg-foreground rounded-none inline-block group-hover:scale-125 transition-transform" />
                <span>
                  {selectedCategory
                    ? `${selectedCategoryGuide?.number || '•'} // ${selectedCategory.name}`
                    : 'PILIH RUBRIK'}
                </span>
                <ChevronDown className="w-3 h-3 text-muted group-hover:text-foreground ml-0.5" />
              </button>

              <span className="text-muted/40 font-mono text-[10px] hidden xs:inline">•</span>
              <span className="font-mono text-[10px] tracking-wider uppercase text-muted hidden xs:inline">
                Ruang Penulis Warga
              </span>
            </div>

            {/* Character counter & quality hint */}
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted">
              <span>{title.trim().length}/70 Kar</span>
              {title.trim().length >= 40 && title.trim().length <= 70 && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">[Panjang Ideal]</span>
              )}
              {title.trim().length > 70 && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">[Cukup Panjang]</span>
              )}
            </div>
          </div>

          {/* Main Title (Auto-resizing & Distinct Editorial Serif Headline) */}
          <div>
            <textarea
              ref={titleTextareaRef}
              rows={1}
              placeholder="Tuliskan Gagasan atau Judul Utama Naskah Anda..."
              value={title}
              onChange={(e) => {
                const val = e.target.value;
                setTitle(val);
                persistLocalBackup({ title: val });
              }}
              className="w-full bg-transparent font-serif font-normal leading-[1.2] tracking-[-0.02em] text-foreground placeholder:text-muted/25 focus:outline-none resize-none border-b-2 border-border/70 focus:border-foreground transition-all duration-150 pb-2 overflow-hidden"
              style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3rem)' }}
            />
          </div>

          {/* Subtitle / Deck (Journalistic Lede) */}
          <div>
            <input
              type="text"
              placeholder="Subjudul atau kalimat pengantar untuk memikat pembaca (opsional)..."
              value={subtitle}
              onChange={(e) => {
                const val = e.target.value;
                setSubtitle(val);
                persistLocalBackup({ subtitle: val });
              }}
              className="w-full bg-transparent font-serif italic text-base sm:text-lg text-foreground/80 placeholder:text-muted/30 focus:outline-none border-b border-border-hairline focus:border-foreground transition-colors pb-1.5"
            />
          </div>

          {/* Byline & Reading Time Strip */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted pt-0.5">
            <span className="text-foreground">Oleh Penulis Warga</span>
            <span>•</span>
            <span>{wordCount} Kata</span>
            <span>•</span>
            <span>~{Math.max(1, Math.ceil(wordCount / 200))} Mnt Baca</span>
            {!hasCover && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>+ Tambah Sampul</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* ── Section B: Seamless Paper Editorial Editor Canvas ── */}
        <div className="pt-2">
          <EditorialEditor
            onChange={(json, text) => {
              setContentJson(json);
              setPlainText(text);
              persistLocalBackup({ contentJson: json, plainText: text });
            }}
            placeholder="Mulai menuangkan gagasan, esai, ulasan kritis, atau kisah sastra Anda di sini..."
          />
        </div>

        {/* ── Section C: Bottom Editorial Action Strip ── */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="font-mono text-[11px] text-muted uppercase tracking-wider flex items-center gap-2">
            <span>{wordCount} kata</span>
            {wordCount < 100 ? (
              <span className="text-amber-600 dark:text-amber-400">
                (Minimal 100 kata untuk kirim)
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">
                [Memenuhi syarat kata]
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSave(true)}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none h-9 px-4 font-mono text-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Simpan Draf
            </Button>

            <Button
              type="button"
              variant="solid"
              size="sm"
              onClick={() => handleSave(false)}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none h-9 px-5 font-mono text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Kirim ke Redaksi
            </Button>
          </div>
        </div>
      </main>

      {/* ── 3. Slide-Over Right Settings Drawer ── */}
      {/* Backdrop */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-xs z-50 transition-opacity duration-200"
          onClick={() => setIsSettingsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer Panel */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-background border-l-2 border-foreground flex flex-col transition-transform duration-300 ease-in-out',
          isSettingsOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label="Pengaturan Naskah"
      >
        {/* Drawer Header */}
        <div className="h-14 px-5 sm:px-6 border-b border-border flex items-center justify-between shrink-0 bg-surface-muted/30">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
            <h3 className="font-serif font-bold text-base text-foreground">Pengaturan Naskah</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="w-8 h-8 rounded-none border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-foreground transition-colors cursor-pointer"
            title="Tutup Pengaturan (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Rubrik Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold block">
                Rubrik Naskah
              </label>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(true)}
                className="font-mono text-[10px] uppercase text-muted hover:text-foreground underline cursor-pointer"
              >
                Panduan Rubrik ↗
              </button>
            </div>

            <div
              onClick={() => setCategoryModalOpen(true)}
              className="p-3 border border-border bg-surface hover:border-foreground transition-colors cursor-pointer group flex items-start justify-between gap-3 select-none"
              title="Klik untuk membuka panduan & memilih rubrik"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 border bg-foreground text-background border-foreground">
                    {selectedCategoryGuide?.number || '•'}
                  </span>
                  <span className="font-serif text-sm font-bold text-foreground">
                    {selectedCategory?.name || 'Belum Dipilih'}
                  </span>
                </div>
                <p className="font-serif italic text-xs text-muted mt-1 truncate">
                  &ldquo;{selectedCategoryGuide?.tagline || selectedCategory?.description || 'Pilih rubrik yang sesuai'}&rdquo;
                </p>
              </div>
              <span className="h-7 px-2.5 bg-surface-muted border border-border font-mono text-[10px] uppercase tracking-wider text-foreground inline-flex items-center shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors">
                Ganti
              </span>
            </div>

            {selectedCategoryGuide?.avoidFor && (
              <p className="font-sans text-[11px] text-amber-700 dark:text-amber-300 leading-tight flex items-start gap-1">
                <span>⚠</span>
                <span><strong>Catatan Redaksi:</strong> Hindari {selectedCategoryGuide.avoidFor.toLowerCase()}</span>
              </p>
            )}
          </div>

          {/* Cover Image & Credit Section */}
          <div className="space-y-2 pt-2 border-t border-border-hairline">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold block">
                Gambar Sampul & Kredit
              </label>
              <span className="font-mono text-[10px] uppercase text-amber-600 dark:text-amber-400">
                {!hasCover ? '*Wajib untuk Kirim' : '✓ Siap'}
              </span>
            </div>
            <ArticleCoverUploader
              value={coverImage}
              onChange={(url) => {
                setCoverImage(url);
                persistLocalBackup({ coverImage: url });
              }}
              credit={coverCredit}
              onCreditChange={(credit) => {
                setCoverCredit(credit);
                persistLocalBackup({ coverCredit: credit });
              }}
            />
          </div>

          {/* Tag Picker Section */}
          <div className="space-y-2 pt-2 border-t border-border-hairline">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold block">
              Tag Kata Kunci (Maksimal 5)
            </label>
            <TagPicker
              tags={tags}
              selectedIds={tagIds}
              onChange={(ids) => {
                setTagIds(ids);
                persistLocalBackup({ tagIds: ids });
              }}
            />
          </div>

          {/* Live SEO & Readability Analysis Panel */}
          <div className="pt-2 border-t border-border-hairline">
            <div className="flex items-center gap-1.5 mb-2 font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
              <Sparkles className="w-3.5 h-3.5 text-foreground" />
              <span>Analisis SEO & Keterbacaan</span>
            </div>
            <SeoAnalysisPanel
              title={title}
              plainText={plainText}
              tags={tagNames}
              coverImage={coverImage}
            />
          </div>

          {/* Originality Pledge */}
          <div className="pt-2 border-t border-border-hairline space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
              <span>Ikrar Orisinalitas</span>
            </div>
            <label className="p-3 border border-border bg-surface flex items-start gap-2.5 cursor-pointer select-none hover:border-foreground transition-colors">
              <input
                type="checkbox"
                checked={agreeOriginality}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAgreeOriginality(checked);
                  persistLocalBackup({ agreeOriginality: checked });
                }}
                className="mt-0.5 w-4 h-4 rounded-none border border-foreground bg-transparent accent-foreground cursor-pointer shrink-0"
              />
              <span className="font-sans text-xs text-foreground/85 leading-relaxed">
                Saya menyatakan bahwa naskah ini adalah karya orisinal saya sendiri, bebas plagiarisme, dan mematuhi etika kepenulisan Perpusjal Blora.
              </span>
            </label>
          </div>
        </div>

        {/* Drawer Footer with Quick Save */}
        <div className="p-4 border-t border-border bg-surface-muted/20 flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] text-muted uppercase">
            {isDirty ? 'Ada draf belum disimpan' : 'Belum ada perubahan'}
          </span>
          <Button
            type="button"
            variant="solid"
            size="sm"
            onClick={() => handleSave(true)}
            isLoading={isSubmitting}
            className="h-8 px-4 font-mono text-[11px]"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Simpan Draf
          </Button>
        </div>
      </aside>

      {/* ── 4. Category Picker Guided Modal ── */}
      <CategoryPickerModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        selectedId={categoryId}
        onSelect={(cat) => {
          setCategoryId(cat.id);
          persistLocalBackup({ categoryId: cat.id });
        }}
        currentTitle={title}
        currentWordCount={wordCount}
      />
    </div>
  );
}
