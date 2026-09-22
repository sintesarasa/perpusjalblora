'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EditorialEditor } from '@/components/editor/editorial-editor';
import { Button } from '@/components/ui/button';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { ArticleCategory, ArticleDetail } from '@perpusjal/types';
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const [contentJson, setContentJson] = React.useState<any>(null);
  const [plainText, setPlainText] = React.useState('');
  const [agreeOriginality, setAgreeOriginality] = React.useState(false);

  const [categories, setCategories] = React.useState<ArticleCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Load categories and article data
  React.useEffect(() => {
    async function loadData() {
      if (!articleId) return;
      setIsLoading(true);

      const [catRes, artRes] = await Promise.all([
        apiClient<ArticleCategory[]>('/articles/categories'),
        apiClient<ArticleDetail>(`/articles/${articleId}`),
      ]);

      if (catRes.data) {
        setCategories(catRes.data);
      }

      if (artRes.data) {
        const art = artRes.data;
        setArticle(art);
        setTitle(art.title);
        setSubtitle(art.subtitle || '');
        setCategoryId(art.category?.id || '');
        setCoverImage(art.coverImage || '');
        setCoverCredit(art.coverCredit || '');
        setContentJson(art.content);
        setPlainText(art.plainText || '');
      } else {
        setErrorMessage(artRes.error?.message || 'Gagal memuat naskah.');
      }

      setIsLoading(false);
    }

    loadData();
  }, [articleId]);

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
      // 1. Update article content
      const res = await apiClient<{ id: string }>(`/articles/${articleId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          categoryId,
          coverImage: coverImage.trim() || undefined,
          coverCredit: coverCredit.trim() || undefined,
          content: contentJson,
        }),
      });

      if (res.error) {
        setErrorMessage(res.error.message || 'Gagal memperbarui naskah.');
        setIsSubmitting(false);
        return;
      }

      // 2. If submitting for review
      if (andSubmit) {
        const submitRes = await apiClient(`/articles/${articleId}/submit`, {
          method: 'POST',
        });
        if (submitRes.error) {
          setErrorMessage(submitRes.error.message || 'Gagal mengajukan naskah ke redaksi.');
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage('Naskah berhasil diajukan ke meja redaksi.');
        setTimeout(() => router.push('/dashboard/tulisan'), 1200);
      } else {
        setSuccessMessage('Perubahan naskah berhasil disimpan.');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setErrorMessage('Gagal menghubungi server. Periksa koneksi internetmu.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-hairline pb-4">
          <Link
            href="/dashboard/tulisan"
            className="font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Tulisan Saya</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleUpdate(false)}
              isLoading={isSubmitting}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Simpan Perubahan
            </Button>
            <Button
              type="button"
              variant="solid"
              size="sm"
              onClick={() => handleUpdate(true)}
              isLoading={isSubmitting}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Ajukan ke Redaksi
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 border-2 border-foreground bg-surface space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-foreground" />
              <span>Gagal Memperbarui</span>
            </div>
            <p className="text-xs font-sans text-foreground/80 pl-6">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-4 border-2 border-foreground bg-surface space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-foreground" />
              <span>Berhasil Disimpan</span>
            </div>
            <p className="text-xs font-sans text-foreground/80 pl-6">{successMessage}</p>
          </div>
        )}

        <section className="space-y-6">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Tulis Judul Naskah..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent font-serif text-3xl sm:text-5xl font-normal leading-tight tracking-tight text-foreground placeholder:text-muted/40 focus:outline-none border-b border-border hover:border-foreground/60 transition-colors pb-3"
            />
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Subjudul esai (opsional)..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-transparent font-serif italic text-lg sm:text-xl text-foreground placeholder:text-muted/40 focus:outline-none border-b border-border-hairline hover:border-foreground/40 transition-colors pb-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-border bg-surface-muted/30">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                Kategori Naskah
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border text-xs sm:text-sm font-sans focus:outline-none focus:border-foreground rounded-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                URL Gambar Sampul
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border text-xs sm:text-sm font-sans focus:outline-none focus:border-foreground rounded-none"
              />
            </div>
          </div>
        </section>

        <section className="space-y-2">
          {article && (
            <EditorialEditor
              initialContent={article.content}
              onChange={(json, text) => {
                setContentJson(json);
                setPlainText(text);
              }}
              onAutosave={() => handleUpdate(false)}
            />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
