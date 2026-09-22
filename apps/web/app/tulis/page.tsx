'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EditorialEditor } from '@/components/editor/editorial-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { ArticleCategory } from '@perpusjal/types';
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle2, Eye } from 'lucide-react';

export default function WriteArticlePage() {
  const router = useRouter();

  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [coverImage, setCoverImage] = React.useState('');
  const [coverCredit, setCoverCredit] = React.useState('');
  const [contentJson, setContentJson] = React.useState<any>(null);
  const [plainText, setPlainText] = React.useState('');
  const [agreeOriginality, setAgreeOriginality] = React.useState(false);

  const [categories, setCategories] = React.useState<ArticleCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Load categories
  React.useEffect(() => {
    async function loadCategories() {
      const res = await apiClient<ArticleCategory[]>('/articles/categories');
      if (res.data) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      }
    }
    loadCategories();
  }, []);

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
      const res = await apiClient<{ id: string; slug: string }>('/articles', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          categoryId,
          coverImage: coverImage.trim() || undefined,
          coverCredit: coverCredit.trim() || undefined,
          content: contentJson,
          isDraft,
        }),
      });

      if (res.error) {
        setErrorMessage(res.error.message || 'Gagal menyimpan naskah.');
        setIsSubmitting(false);
        return;
      }

      if (res.data) {
        if (isDraft) {
          setSuccessMessage('Draf naskah berhasil disimpan.');
          setTimeout(() => {
            router.push('/dashboard/tulisan');
          }, 1200);
        } else {
          setSuccessMessage('Naskah berhasil diajukan ke meja redaksi untuk dikurasi.');
          setTimeout(() => {
            router.push('/dashboard/tulisan');
          }, 1500);
        }
      }
    } catch {
      setErrorMessage('Gagal menghubungi server. Periksa koneksi internetmu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigation & Action Bar */}
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
              onClick={() => handleSave(true)}
              isLoading={isSubmitting}
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
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Kirim ke Redaksi
            </Button>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-4 border-2 border-foreground bg-surface space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-foreground" />
              <span>Gagal Menyimpan</span>
            </div>
            <p className="text-xs font-sans text-foreground/80 pl-6">
              {errorMessage}
            </p>
          </div>
        )}

        {successMessage && (
          <div className="p-4 border-2 border-foreground bg-surface space-y-1">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-foreground" />
              <span>Berhasil Disimpan</span>
            </div>
            <p className="text-xs font-sans text-foreground/80 pl-6">
              {successMessage}
            </p>
          </div>
        )}

        {/* Article Meta Fields */}
        <section className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Tulis Judul Naskah di Sini..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent font-serif text-3xl sm:text-5xl font-normal leading-tight tracking-tight text-foreground placeholder:text-muted/40 focus:outline-none border-b border-border hover:border-foreground/60 transition-colors pb-3"
            />
          </div>

          {/* Subtitle Input */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Tambahkan subjudul atau ringkasan esai (opsional)..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-transparent font-serif italic text-lg sm:text-xl text-foreground placeholder:text-muted/40 focus:outline-none border-b border-border-hairline hover:border-foreground/40 transition-colors pb-2"
            />
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-border bg-surface-muted/30">
            {/* Category Selector */}
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

            {/* Cover Image URL */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                URL Gambar Sampul (Unsplash / Cloudinary)
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

        {/* Prose Editor */}
        <section className="space-y-2">
          <EditorialEditor
            onChange={(json, text) => {
              setContentJson(json);
              setPlainText(text);
            }}
            placeholder="Tuliskan isi naskah esai, resensi buku, atau warta liputanmu di sini..."
          />
        </section>

        {/* Originality Confirmation */}
        <div className="p-4 border border-border bg-surface space-y-3">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeOriginality}
              onChange={(e) => setAgreeOriginality(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded-none border border-foreground bg-transparent text-foreground accent-foreground cursor-pointer focus:ring-0 shrink-0"
            />
            <span className="font-sans text-xs text-muted leading-relaxed">
              Saya menyatakan bahwa naskah ini adalah karya orisinal saya sendiri, bukan hasil plagiarisme atau saduran tanpa izin, serta tidak mengandung ujaran kebencian.
            </span>
          </label>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-hairline">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => handleSave(true)}
            isLoading={isSubmitting}
          >
            Simpan Draf
          </Button>
          <Button
            type="button"
            variant="solid"
            size="md"
            onClick={() => handleSave(false)}
            isLoading={isSubmitting}
          >
            Kirim Naskah ke Meja Redaksi &rarr;
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
