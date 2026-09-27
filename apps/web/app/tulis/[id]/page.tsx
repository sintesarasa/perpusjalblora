'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EditorialEditor } from '@/components/editor/editorial-editor';
import { Button } from '@/components/ui/button';
import { CustomLoader } from '@/components/ui/custom-loader';
import { ArticleCoverUploader } from '@/components/articles/article-cover-uploader';
import { TagPicker } from '@/components/articles/tag-picker';
import { apiClient } from '@/lib/api';
import { ArticleCategory, ArticleDetail, ArticleTag } from '@perpusjal/types';
import {
  ArrowLeft,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
} from 'lucide-react';

export default function EditArticlePage() {
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
  const isSavingRef = React.useRef(false);

  // Load article + categories + tags
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
        setErrorMessage(artRes.error?.message || 'Gagal memuat naskah.');
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
      setErrorMessage('Judul naskah wajib diisi.');
      return;
    }
    if (andSubmit) {
      if (!coverImage.trim()) {
        setErrorMessage('Gambar sampul wajib diisi sebelum mengirimkan naskah.');
        return;
      }
      if (plainText.split(/\s+/).filter(Boolean).length < 100) {
        setErrorMessage('Naskah minimal 100 kata sebelum dapat diajukan ke redaksi.');
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
        setSuccessMessage('Naskah berhasil diajukan ke meja redaksi.');
        setTimeout(() => router.push('/dashboard/tulisan'), 1200);
      } else {
        setAutosaveState('saved');
        setTimeout(() => setAutosaveState('idle'), 3000);
      }
    } catch {
      setErrorMessage('Gagal menghubungi server. Periksa koneksi internetmu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-12">
          <CustomLoader size="lg" label="MEMUAT NASKAH PENULIS..." />
        </main>
        <Footer />
      </div>
    );
  }

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

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap">
            {/* Autosave indicator */}
            {autosaveState === 'saving' && (
              <span className="font-mono text-[10px] text-muted animate-pulse uppercase">
                <Clock className="w-3 h-3 inline-block mr-1" />Menyimpan...
              </span>
            )}
            {autosaveState === 'saved' && (
              <span className="font-mono text-[10px] text-emerald-600 uppercase">
                <CheckCircle2 className="w-3 h-3 inline-block mr-1" />Tersimpan
              </span>
            )}
            {wordCount > 0 && (
              <span className="font-mono text-[10px] text-muted uppercase hidden sm:inline">
                <FileText className="w-3 h-3 inline-block mr-1" />{wordCount} Kata
              </span>
            )}

            {/* Preview link (if published/pending) */}
            {article?.previewToken && (
              <a
                href={`/artikel/${article.slug}?preview=${article.previewToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 border border-border-hairline text-muted hover:text-foreground hover:border-foreground font-mono text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pratinjau</span>
              </a>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleUpdate(false)}
                isLoading={isSubmitting}
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Simpan </span>Draf
              </Button>
              <Button
                type="button"
                variant="solid"
                size="sm"
                onClick={() => handleUpdate(true)}
                isLoading={isSubmitting}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Ajukan ke </span>Redaksi
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
            placeholder="Tulis Judul Naskah..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-serif font-normal leading-tight tracking-tight text-foreground placeholder:text-muted/40 focus:outline-none border-b border-border hover:border-foreground/60 transition-colors pb-3"
            style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}
          />
          <input
            type="text"
            placeholder="Subjudul esai (opsional)..."
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
          {article && (
            <EditorialEditor
              initialContent={article.content}
              onChange={(json, text) => {
                setContentJson(json);
                setPlainText(text);
              }}
              onAutosave={() => doSave()}
            />
          )}
        </section>

        {/* ── Bottom Actions ── */}
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
              onClick={() => handleUpdate(false)}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Simpan Perubahan
            </Button>
            <Button
              type="button"
              variant="solid"
              size="md"
              onClick={() => handleUpdate(true)}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Ajukan ke Redaksi &rarr;
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
