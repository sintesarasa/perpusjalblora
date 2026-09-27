'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EditorialEditor } from '@/components/editor/editorial-editor';
import { Button } from '@/components/ui/button';
import { ArticleCoverUploader } from '@/components/articles/article-cover-uploader';
import { TagPicker } from '@/components/articles/tag-picker';
import { apiClient } from '@/lib/api';
import { ArticleCategory, ArticleTag } from '@perpusjal/types';
import {
  ArrowLeft,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';

export default function WriteArticlePage() {
  const router = useRouter();

  // Article meta state
  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [coverImage, setCoverImage] = React.useState('');
  const [coverCredit, setCoverCredit] = React.useState('');
  const [tagIds, setTagIds] = React.useState<string[]>([]);
  const [contentJson, setContentJson] = React.useState<any>(null);
  const [plainText, setPlainText] = React.useState('');
  const [agreeOriginality, setAgreeOriginality] = React.useState(false);

  // Data
  const [categories, setCategories] = React.useState<ArticleCategory[]>([]);
  const [tags, setTags] = React.useState<ArticleTag[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [autosaveState, setAutosaveState] = React.useState<'idle' | 'saving' | 'saved'>('idle');

  // Autosave: track saved draft ID to redirect to /tulis/[id] after first save
  const [savedDraftId, setSavedDraftId] = React.useState<string | null>(null);
  const autosaveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = React.useRef(false);

  // Load categories + tags
  React.useEffect(() => {
    async function loadMeta() {
      const [catRes, tagRes] = await Promise.all([
        apiClient<ArticleCategory[]>('/articles/categories'),
        apiClient<ArticleTag[]>('/articles/tags'),
      ]);
      if (catRes.data) {
        setCategories(catRes.data);
        if (catRes.data.length > 0) setCategoryId(catRes.data[0].id);
      }
      if (tagRes.data) setTags(tagRes.data);
    }
    loadMeta();
  }, []);

  // Autosave debounce: trigger 30s after content changes, only if title exists
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
          // PATCH existing draft
          await apiClient(`/articles/${savedDraftId}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          });
          setAutosaveState('saved');
        } else {
          // POST new draft
          const res = await apiClient<{ id: string; slug: string }>('/articles', {
            method: 'POST',
            body: JSON.stringify(body),
          });
          if (res.data) {
            setSavedDraftId(res.data.id);
            setAutosaveState('saved');
            // Redirect to edit page for continued autosave
            setTimeout(() => router.push(`/tulis/${res.data!.id}`), 800);
          }
        }
      } catch {
        setAutosaveState('idle');
      } finally {
        isSavingRef.current = false;
      }
    }, 30000); // 30s debounce
  }, [title, subtitle, categoryId, coverImage, coverCredit, tagIds, contentJson, savedDraftId, router]);

  // Trigger autosave when key fields change (after title is set)
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
      setErrorMessage('Judul naskah wajib diisi.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Pilih kategori tulisan terlebih dahulu.');
      return;
    }
    if (!isDraft) {
      if (!coverImage.trim()) {
        setErrorMessage('Gambar sampul wajib diisi sebelum mengirimkan naskah ke redaksi.');
        return;
      }
      if (plainText.split(/\s+/).filter(Boolean).length < 100) {
        setErrorMessage('Naskah minimal 100 kata sebelum dapat diajukan ke redaksi.');
        return;
      }
      if (!agreeOriginality) {
        setErrorMessage('Kamu wajib mencentang ikrar orisinalitas karya.');
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

      const res = await apiClient<{ id: string; slug: string }>('/articles', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (res.error) {
        setErrorMessage(res.error.message || 'Gagal menyimpan naskah.');
        return;
      }
      if (res.data) {
        if (isDraft) {
          setSuccessMessage('Draf naskah berhasil disimpan.');
          setTimeout(() => router.push('/dashboard/tulisan'), 1200);
        } else {
          setSuccessMessage('Naskah berhasil diajukan ke meja redaksi untuk dikurasi.');
          setTimeout(() => router.push('/dashboard/tulisan'), 1500);
        }
      }
    } catch {
      setErrorMessage('Gagal menghubungi server. Periksa koneksi internetmu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* ── Navigation & Action Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-hairline pb-4">
          <Link
            href="/dashboard/tulisan"
            className="font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Tulisan Saya</span>
          </Link>

          {/* Autosave indicator */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            {autosaveState === 'saving' && (
              <span className="font-mono text-[10px] text-muted animate-pulse uppercase">
                <Clock className="w-3 h-3 inline-block mr-1" />Menyimpan...
              </span>
            )}
            {autosaveState === 'saved' && (
              <span className="font-mono text-[10px] text-emerald-600 uppercase">
                <CheckCircle2 className="w-3 h-3 inline-block mr-1" />Tersimpan otomatis
              </span>
            )}
            {wordCount > 0 && (
              <span className="font-mono text-[10px] text-muted uppercase hidden sm:inline">
                <FileText className="w-3 h-3 inline-block mr-1" />{wordCount} Kata
              </span>
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSave(true)}
                isLoading={isSubmitting}
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Simpan </span>Draf
              </Button>
              <Button
                type="button"
                variant="solid"
                size="sm"
                onClick={() => handleSave(false)}
                isLoading={isSubmitting}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Kirim ke </span>Redaksi
              </Button>
            </div>
          </div>
        </div>

        {/* ── Status Alerts ── */}
        {errorMessage && (
          <div className="p-4 border-2 border-foreground bg-surface flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider">Perhatian</p>
              <p className="text-sm sm:text-xs font-sans text-foreground/80 mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-muted hover:text-foreground text-base font-bold shrink-0"
            >&times;</button>
          </div>
        )}
        {successMessage && (
          <div className="p-4 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-700 shrink-0" />
            <p className="text-sm sm:text-xs font-sans text-emerald-800 dark:text-emerald-300">{successMessage}</p>
          </div>
        )}

        {/* ── Judul & Subjudul ── */}
        <section className="space-y-4">
          <input
            type="text"
            placeholder="Tulis Judul Naskah di Sini..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-serif text-2xl sm:text-5xl font-normal leading-tight tracking-tight text-foreground placeholder:text-muted/40 focus:outline-none border-b border-border hover:border-foreground/60 transition-colors pb-3 text-sm sm:text-base"
            style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}
          />
          <input
            type="text"
            placeholder="Tambahkan subjudul atau ringkasan (opsional)..."
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full bg-transparent font-serif italic text-base sm:text-xl text-foreground placeholder:text-muted/40 focus:outline-none border-b border-border-hairline hover:border-foreground/40 transition-colors pb-2"
          />
        </section>

        {/* ── Metadata Panel (Category + Tags) ── */}
        <section className="p-4 border border-border bg-surface-muted/30 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold block">
                Kategori Naskah
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 sm:h-10 px-3 bg-surface border border-border text-sm sm:text-xs font-sans focus:outline-none focus:border-foreground rounded-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold block">
                Tag (Maks. 5)
              </label>
              <TagPicker
                tags={tags}
                selectedIds={tagIds}
                onChange={setTagIds}
              />
            </div>
          </div>
        </section>

        {/* ── Cover Image ── */}
        <section>
          <ArticleCoverUploader
            value={coverImage}
            onChange={setCoverImage}
            credit={coverCredit}
            onCreditChange={setCoverCredit}
          />
        </section>

        {/* ── Prose Editor ── */}
        <section className="space-y-2">
          <EditorialEditor
            onChange={(json, text) => {
              setContentJson(json);
              setPlainText(text);
            }}
            placeholder="Tuliskan isi naskah esai, resensi buku, atau warta liputanmu di sini..."
          />
        </section>

        {/* ── Originality Ikrar ── */}
        <div className="p-4 border border-border bg-surface">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeOriginality}
              onChange={(e) => setAgreeOriginality(e.target.checked)}
              className="mt-0.5 w-5 h-5 sm:w-4 sm:h-4 rounded-none border border-foreground bg-transparent text-foreground accent-foreground cursor-pointer focus:ring-0 shrink-0"
            />
            <span className="font-sans text-sm sm:text-xs text-muted leading-relaxed">
              Saya menyatakan bahwa naskah ini adalah karya orisinal saya sendiri, bukan hasil
              plagiarisme atau saduran tanpa izin, serta tidak mengandung ujaran kebencian.
            </span>
          </label>
        </div>

        {/* ── Word Count & Bottom Actions ── */}
        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border-hairline">
          <div className="font-mono text-[10px] text-muted uppercase">
            {wordCount > 0 && (
              <span>
                {wordCount} kata
                {wordCount < 100 && (
                  <span className="text-amber-600 ml-1.5">
                    (min. 100 untuk kirim ke redaksi)
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => handleSave(true)}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Simpan Draf
            </Button>
            <Button
              type="button"
              variant="solid"
              size="md"
              onClick={() => handleSave(false)}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Kirim ke Meja Redaksi &rarr;
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
