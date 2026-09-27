'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CustomLoader } from '@/components/ui/custom-loader';
import { EditorialEditor } from '@/components/editor/editorial-editor';
import { ArticleCoverUploader } from '@/components/articles/article-cover-uploader';
import { TagPicker } from '@/components/articles/tag-picker';
import { SeoAnalysisPanel } from '@/components/articles/seo-analysis-panel';
import { apiClient } from '@/lib/api';
import { ArticleCategory, ArticleDetail, ArticleTag } from '@perpusjal/types';
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
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardEditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params?.id as string;

  const [article, setArticle] = React.useState<ArticleDetail | null>(null);
  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [coverImage, setCoverImage] = React.useState('');
  const [coverCredit, setCoverCredit] = React.useState('');
  const [tagIds, setTagIds] = React.useState<string[]>([]);
  const [contentJson, setContentJson] = React.useState<any>(null);
  const [plainText, setPlainText] = React.useState('');

  const [categories, setCategories] = React.useState<ArticleCategory[]>([]);
  const [tags, setTags] = React.useState<ArticleTag[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [autosaveState, setAutosaveState] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [metaAccordionOpen, setMetaAccordionOpen] = React.useState(false);

  const isSavingRef = React.useRef(false);
  const titleTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    async function loadData() {
      if (!articleId) return;
      setIsLoading(true);
      const [catRes, tagRes, artRes] = await Promise.all([
        apiClient<ArticleCategory[]>('/articles/categories'),
        apiClient<ArticleTag[]>('/articles/tags'),
        apiClient<ArticleDetail>(`/articles/${articleId}`),
      ]);

      if (catRes.data) setCategories(catRes.data);
      if (tagRes.data) setTags(tagRes.data);
      if (artRes.data) {
        const art = artRes.data;
        setArticle(art);
        setTitle(art.title);
        setSubtitle(art.subtitle || '');
        setCategoryId(art.category?.id || '');
        setCoverImage(art.coverImage || '');
        setCoverCredit(art.coverCredit || '');
        setTagIds((art.tags || []).map((t) => t.id));
        setContentJson(art.content);
        setPlainText(art.plainText || '');
      } else {
        setErrorMessage(artRes.error?.message || 'Gagal memuat data naskah.');
      }
      setIsLoading(false);
    }
    loadData();
  }, [articleId]);

  const doSave = React.useCallback(async () => {
    if (!title.trim() || isSavingRef.current) return false;
    isSavingRef.current = true;
    setAutosaveState('saving');
    try {
      await apiClient(`/articles/${articleId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          categoryId,
          coverImage: coverImage.trim() || undefined,
          coverCredit: coverCredit.trim() || undefined,
          content: contentJson,
          tagIds: tagIds.length > 0 ? tagIds : undefined,
        }),
      });
      setAutosaveState('saved');
      setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      setTimeout(() => setAutosaveState('idle'), 3000);
      return true;
    } catch {
      setAutosaveState('idle');
      return false;
    } finally {
      isSavingRef.current = false;
    }
  }, [articleId, title, subtitle, categoryId, coverImage, coverCredit, tagIds, contentJson]);

  const handleUpdate = async (andSubmit = false) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Judul naskah tidak boleh kosong.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (andSubmit) {
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
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient<{ id: string }>(`/articles/${articleId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          categoryId,
          coverImage: coverImage.trim() || undefined,
          coverCredit: coverCredit.trim() || undefined,
          content: contentJson,
          tagIds: tagIds.length > 0 ? tagIds : undefined,
        }),
      });

      if (res.error) {
        setErrorMessage(res.error.message || 'Gagal memperbarui naskah.');
        return;
      }

      if (andSubmit) {
        const submitRes = await apiClient(`/articles/${articleId}/submit`, { method: 'POST' });
        if (submitRes.error) {
          setErrorMessage(submitRes.error.message || 'Gagal mengajukan naskah ke redaksi.');
          return;
        }
        setSuccessMessage('Naskah berhasil diajukan ke meja kurator redaksi.');
        setTimeout(() => router.push('/dashboard/tulisan'), 1400);
      } else {
        setAutosaveState('saved');
        setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        setSuccessMessage('Perubahan berhasil disimpan.');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setErrorMessage('Gagal menghubungi server. Periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const tagNames = tags.filter((t) => tagIds.includes(t.id)).map((t) => t.name);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-12">
        <CustomLoader size="md" label="MEMBUKA LEMBAR SUNTONGAN NASKAH..." />
      </div>
    );
  }

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
                <span className="hidden xs:inline">Menyimpan...</span>
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
                [ EDITING ]
              </span>
            )}
          </div>
        </div>

        {/* Right: Word count, Preview & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {wordCount > 0 && (
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider hidden md:inline-block mr-1">
              {wordCount} Kata
            </span>
          )}

          {article?.previewToken && (
            <a
              href={`/artikel/${article.slug}?preview=${article.previewToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-2.5 sm:px-3 border border-border text-muted hover:text-foreground hover:border-foreground font-mono text-[10px] sm:text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
              title="Buka pratinjau publik"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pratinjau</span>
            </a>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleUpdate(false)}
            isLoading={isSubmitting}
            className="h-8 px-3 font-mono text-[10px] sm:text-[11px]"
          >
            <Save className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Simpan</span>
          </Button>

          <Button
            type="button"
            variant="solid"
            size="sm"
            onClick={() => handleUpdate(true)}
            isLoading={isSubmitting}
            className="h-8 px-3.5 font-mono text-[10px] sm:text-[11px] font-semibold"
          >
            <Send className="w-3.5 h-3.5 sm:mr-1.5" />
            <span>Ajukan</span>
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
              <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-foreground bg-surface-muted/60 px-2.5 py-0.5 border border-border-hairline">
                {selectedCategory?.name || 'PILIH RUBRIK'}
              </span>
              <span className="text-muted/40 font-mono text-[10px] hidden xs:inline">•</span>
              <span className="font-mono text-[10px] tracking-wider uppercase text-muted hidden xs:inline">
                Menyunting Naskah
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold block">
                    Kategori Tulisan
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border text-sm font-sans focus:outline-none focus:border-foreground cursor-pointer rounded-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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
          {article && (
            <EditorialEditor
              initialContent={article.content}
              onChange={(json, text) => {
                setContentJson(json);
                setPlainText(text);
              }}
              onAutosave={() => doSave()}
              placeholder="Lanjutkan penulisan naskah Anda di sini..."
            />
          )}
        </div>

        {/* ── Section D: Live SEO & Readability Analysis ── */}
        <SeoAnalysisPanel
          title={title}
          plainText={plainText}
          tags={tagNames}
          coverImage={coverImage}
        />

        {/* ── Section E: Bottom Action Bar ── */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="font-mono text-[11px] text-muted uppercase tracking-wider">
            {wordCount > 0 ? (
              <span>
                {wordCount} kata ditulis
                {wordCount < 100 && (
                  <span className="text-amber-600 dark:text-amber-400 ml-2">
                    (Butuh min. 100 kata untuk ajukan)
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
              onClick={() => handleUpdate(false)}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none min-h-[44px] px-5 font-mono text-xs"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </Button>

            <Button
              type="button"
              variant="solid"
              size="md"
              onClick={() => handleUpdate(true)}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none min-h-[44px] px-6 font-mono text-xs font-semibold"
            >
              <Send className="w-4 h-4 mr-2" />
              Ajukan ke Redaksi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
