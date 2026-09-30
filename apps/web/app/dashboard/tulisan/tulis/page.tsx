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
  ChevronUp,
  Image as ImageIcon,
  Tag as TagIcon,
  BookOpen,
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
  const [metaAccordionOpen, setMetaAccordionOpen] = React.useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = React.useState(false);
  const [savedDraftId, setSavedDraftId] = React.useState<string | null>(null);

  const autosaveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
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
    }
    loadMeta();
  }, []);

  // Autosave 30s debounce
  const scheduleAutosave = React.useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(async () => {
      if (!title.trim() || isSavingRef.current) return;
      isSavingRef.current = true;
      setAutosaveState('saving');
      try {
        const body: any = {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          categoryId,
          coverImage: coverImage.trim() || undefined,
          coverCredit: coverCredit.trim() || undefined,
          content: contentJson,
          tagIds: tagIds.length > 0 ? tagIds : undefined,
          isDraft: true,
        };
        if (savedDraftId) {
          await apiClient(`/articles/${savedDraftId}`, { method: 'PATCH', body: JSON.stringify(body) });
          setAutosaveState('saved');
          setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        } else {
          const res = await apiClient<{ id: string }>('/articles', { method: 'POST', body: JSON.stringify(body) });
          if (res.data) {
            setSavedDraftId(res.data.id);
            setAutosaveState('saved');
            setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
            setTimeout(() => router.replace(`/dashboard/tulisan/tulis/${res.data!.id}`), 800);
          }
        }
      } catch {
        setAutosaveState('idle');
      } finally {
        isSavingRef.current = false;
      }
    }, 30000);
  }, [title, subtitle, categoryId, coverImage, coverCredit, tagIds, contentJson, savedDraftId, router]);

  React.useEffect(() => {
    if (title.trim()) scheduleAutosave();
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [title, subtitle, categoryId, coverImage, contentJson, scheduleAutosave]);

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
        setMetaAccordionOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (wordCount < 100) {
        setErrorMessage('Naskah minimal 100 kata sebelum dapat diajukan ke meja redaksi.');
        return;
      }
      if (!agreeOriginality) {
        setErrorMessage('Centang ikrar orisinalitas karya di bagian bawah terlebih dahulu.');
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

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ── 1. Top Action Bar (Sleek Utility Bar, h-11 = 44px, sticky beneath Dashboard Navbar at top-14) ── */}
      <div className="sticky top-14 z-30 h-11 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-3 sm:px-6 transition-all">
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
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span className="hidden sm:inline">Tersimpan {lastSavedAt}</span>
                <span className="sm:hidden">Tersimpan</span>
              </span>
            ) : (
              <span className="text-muted border border-border-hairline px-1.5 py-0.5 rounded-xs">
                [ DRAF BARU ]
              </span>
            )}
          </div>
        </div>

        {/* Right: Word count & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {wordCount > 0 && (
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider hidden md:inline-block mr-1">
              {wordCount} Kata
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSave(true)}
            isLoading={isSubmitting}
            className="h-8 px-3 font-mono text-[10px] sm:text-[11px]"
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
            className="h-8 px-3.5 font-mono text-[10px] sm:text-[11px] font-semibold"
          >
            <Send className="w-3.5 h-3.5 sm:mr-1.5" />
            <span>Kirim</span>
            <span className="hidden sm:inline">&nbsp;ke Redaksi</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Main Writing Canvas Area ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 lg:pt-20 space-y-8 sm:space-y-10">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 border-2 border-foreground bg-surface flex items-start gap-3 shadow-xs">
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

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <p className="text-sm font-sans text-emerald-900 dark:text-emerald-200 font-medium">
              {successMessage}
            </p>
          </div>
        )}

        {/* ── Section A: Editorial Headline & Lede Area ── */}
        <div className="space-y-6">
          {/* Folio / Section Marker & Headline Character Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-hairline pb-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(true)}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase font-bold text-foreground bg-surface-muted/60 hover:bg-surface-muted px-2.5 py-1 border border-border hover:border-foreground transition-colors group cursor-pointer"
                title="Klik untuk panduan lengkap & memilih rubrik"
              >
                <span className="w-1.5 h-1.5 bg-foreground rounded-full inline-block group-hover:scale-125 transition-transform" />
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

          {/* Main Title Textarea (Auto-resizing & Distinct Headline Typography) */}
          <div className="space-y-2">
            <textarea
              ref={titleTextareaRef}
              rows={1}
              placeholder="Tuliskan Gagasan atau Judul Utama Naskah Anda..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              className="w-full bg-transparent font-serif font-normal leading-[1.2] tracking-[-0.02em] text-foreground placeholder:text-muted/25 focus:outline-none resize-none border-b-2 border-border focus:border-foreground transition-all duration-150 pb-3 overflow-hidden"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 3.25rem)' }}
            />
          </div>

          {/* Subtitle / Deck (Journalistic Lede) */}
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted block">
              // SUBJUDUL ATAU INTISARI PENGANTAR (DECK)
            </label>
            <input
              type="text"
              placeholder="Satu atau dua kalimat pengantar untuk menarik minat pembaca..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-transparent font-serif italic text-base sm:text-xl text-foreground/80 placeholder:text-muted/30 focus:outline-none border-b border-border-hairline focus:border-foreground transition-colors pb-2"
            />
          </div>

          {/* Byline & Estimate Strip */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted pt-1">
            <span className="text-foreground">Oleh Penulis Warga</span>
            <span>•</span>
            <span>{wordCount} Kata</span>
            <span>•</span>
            <span>~{Math.max(1, Math.ceil(wordCount / 200))} Mnt Baca</span>
          </div>
        </div>

        {/* ── Section B: Collapsible Metadata Strip (Category, Tags, Cover) ── */}
        <div className="border border-border bg-surface rounded-xs overflow-hidden transition-all">
          {/* Header strip */}
          <button
            type="button"
            onClick={() => setMetaAccordionOpen(!metaAccordionOpen)}
            className="w-full px-4 py-3 bg-surface-muted/30 hover:bg-surface-muted/60 flex items-center justify-between gap-3 text-left transition-colors"
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted" />
                Kelengkapan Naskah
              </span>

              {/* Status pills */}
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 border border-border text-muted bg-background hidden sm:inline-flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-muted" />
                {selectedCategory?.name || 'Kategori'}
              </span>

              <span className="font-mono text-[10px] uppercase px-2 py-0.5 border border-border text-muted bg-background hidden sm:inline-flex items-center gap-1">
                <TagIcon className="w-3 h-3 text-muted" />
                {tagIds.length > 0 ? `${tagIds.length} Tag` : 'Belum Ada Tag'}
              </span>

              <span
                className={cn(
                  'font-mono text-[10px] uppercase px-2 py-0.5 border flex items-center gap-1',
                  coverImage
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20'
                    : 'border-border text-muted bg-background'
                )}
              >
                <ImageIcon className="w-3 h-3" />
                {coverImage ? 'Sampul Siap' : 'Sampul Belum'}
              </span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted shrink-0">
              <span className="hidden sm:inline">{metaAccordionOpen ? 'Tutup' : 'Atur'}</span>
              {metaAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {/* Expanded Drawer */}
          {metaAccordionOpen && (
            <div className="p-4 sm:p-6 space-y-6 border-t border-border-hairline bg-surface">
              {/* Category & Tags in a responsive 2-col grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold block">
                      Rubrik Tulisan
                    </label>
                    <button
                      type="button"
                      onClick={() => setCategoryModalOpen(true)}
                      className="font-mono text-[10px] uppercase text-muted hover:text-foreground underline cursor-pointer"
                    >
                      Buka Panduan ↗
                    </button>
                  </div>

                  <div
                    onClick={() => setCategoryModalOpen(true)}
                    className="p-3 border border-border bg-background hover:border-foreground transition-colors cursor-pointer group flex items-start justify-between gap-3 select-none"
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

                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold block">
                    Tag Kata Kunci (Maksimal 5)
                  </label>
                  <TagPicker tags={tags} selectedIds={tagIds} onChange={setTagIds} />
                </div>
              </div>

              {/* Cover Image Uploader */}
              <div className="pt-2 border-t border-border-hairline">
                <ArticleCoverUploader
                  value={coverImage}
                  onChange={setCoverImage}
                  credit={coverCredit}
                  onCreditChange={setCoverCredit}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Section C: Editorial Editor (Canvas) ── */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted block">
            // LEMBAR KERJA PENULIS
          </label>
          <EditorialEditor
            onChange={(json, text) => {
              setContentJson(json);
              setPlainText(text);
            }}
            placeholder="Mulai menuangkan gagasan, esai, ulasan kritis, atau kisah sastra Anda di sini..."
          />
        </div>

        {/* ── Section D: Live SEO & Readability Analysis ── */}
        <SeoAnalysisPanel
          title={title}
          plainText={plainText}
          tags={tagNames}
          coverImage={coverImage}
        />

        {/* ── Section E: Originality Pledge ── */}
        <div className="p-4 sm:p-5 border border-border bg-surface rounded-xs">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeOriginality}
              onChange={(e) => setAgreeOriginality(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded-none border border-foreground bg-transparent accent-foreground cursor-pointer shrink-0"
            />
            <span className="font-sans text-sm text-foreground/90 leading-relaxed">
              Saya menyatakan bahwa naskah ini adalah karya orisinal saya sendiri, bebas dari tindakan
              plagiarisme atau pelanggaran hak cipta, serta siap mematuhi panduan kurasi Perpusjal Blora.
            </span>
          </label>
        </div>

        {/* ── Section F: Bottom Action Bar ── */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="font-mono text-[11px] text-muted uppercase tracking-wider">
            {wordCount > 0 ? (
              <span>
                {wordCount} kata ditulis
                {wordCount < 100 && (
                  <span className="text-amber-600 dark:text-amber-400 ml-2">
                    (Butuh min. 100 kata untuk kirim)
                  </span>
                )}
              </span>
            ) : (
              <span>Belum ada kata terketik</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => handleSave(true)}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none min-h-[44px] px-5 font-mono text-xs"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Draf
            </Button>

            <Button
              type="button"
              variant="solid"
              size="md"
              onClick={() => handleSave(false)}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none min-h-[44px] px-6 font-mono text-xs font-semibold"
            >
              <Send className="w-4 h-4 mr-2" />
              Kirim ke Redaksi
            </Button>
          </div>
        </div>
      </div>

      {/* ── Category Picker Guided Modal ── */}
      <CategoryPickerModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        selectedId={categoryId}
        onSelect={(cat) => setCategoryId(cat.id)}
        currentTitle={title}
        currentWordCount={wordCount}
      />
    </div>
  );
}
