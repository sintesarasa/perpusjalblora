'use client';

import * as React from 'react';
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
  Save, Send, AlertCircle, CheckCircle2, Clock, FileText,
  Eye, ChevronDown, ChevronUp,
} from 'lucide-react';

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
  const [metaOpen, setMetaOpen] = React.useState(true);
  const isSavingRef = React.useRef(false);

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
    } catch { setAutosaveState('idle'); return false; }
    finally { isSavingRef.current = false; }
  }, [articleId, title, subtitle, categoryId, coverImage, coverCredit, tagIds, contentJson]);

  const handleUpdate = async (andSubmit = false) => {
    setErrorMessage(null); setSuccessMessage(null);
    if (!title.trim()) { setErrorMessage('Judul naskah wajib diisi.'); return; }
    if (andSubmit) {
      if (!coverImage.trim()) { setErrorMessage('Gambar sampul wajib ada sebelum mengirim ke redaksi.'); return; }
      if (wordCount < 100) { setErrorMessage('Naskah minimal 100 kata sebelum bisa diajukan.'); return; }
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
      if (res.error) { setErrorMessage(res.error.message || 'Gagal memperbarui naskah.'); return; }
      if (andSubmit) {
        const submitRes = await apiClient(`/articles/${articleId}/submit`, { method: 'POST' });
        if (submitRes.error) { setErrorMessage(submitRes.error.message || 'Gagal mengajukan naskah.'); return; }
        setSuccessMessage('Naskah berhasil diajukan ke meja redaksi.');
        setTimeout(() => router.push('/dashboard/tulisan'), 1400);
      } else {
        setAutosaveState('saved');
        setTimeout(() => setAutosaveState('idle'), 3000);
      }
    } catch { setErrorMessage('Gagal menghubungi server. Periksa koneksimu.'); }
    finally { setIsSubmitting(false); }
  };

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const tagNames = tags.filter((t) => tagIds.includes(t.id)).map((t) => t.name);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <CustomLoader size="md" label="MEMUAT NASKAH PENULIS..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky Page Header ── */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border-hairline">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted leading-none">Sunting Naskah</p>
              {title && (
                <p className="font-serif text-sm text-foreground leading-snug mt-0.5 truncate max-w-[160px] sm:max-w-xs">{title}</p>
              )}
            </div>
            {autosaveState === 'saving' && (
              <span className="font-mono text-[10px] text-muted animate-pulse uppercase shrink-0 hidden sm:block">
                <Clock className="w-3 h-3 inline-block mr-0.5" />Menyimpan...
              </span>
            )}
            {autosaveState === 'saved' && (
              <span className="font-mono text-[10px] text-emerald-600 uppercase shrink-0 hidden sm:flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" />Tersimpan
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {wordCount > 0 && (
              <span className="font-mono text-[10px] text-muted uppercase hidden md:block">
                <FileText className="w-3 h-3 inline-block mr-0.5" />{wordCount} Kata
              </span>
            )}
            {article?.previewToken && (
              <a
                href={`/artikel/${article.slug}?preview=${article.previewToken}`}
                target="_blank" rel="noopener noreferrer"
                className="h-9 sm:h-8 px-2.5 border border-border-hairline text-muted hover:text-foreground hover:border-foreground font-mono text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pratinjau</span>
              </a>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => handleUpdate(false)} isLoading={isSubmitting}>
              <Save className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Simpan</span>
            </Button>
            <Button type="button" variant="solid" size="sm" onClick={() => handleUpdate(true)} isLoading={isSubmitting}>
              <Send className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Ajukan</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">

          {errorMessage && (
            <div className="p-3.5 border-2 border-foreground bg-surface flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-mono text-[10px] font-bold uppercase">Perhatian</p>
                <p className="text-sm sm:text-xs font-sans mt-0.5">{errorMessage}</p>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-muted hover:text-foreground text-lg font-bold">&times;</button>
            </div>
          )}
          {successMessage && (
            <div className="p-3.5 border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <p className="text-sm sm:text-xs font-sans text-emerald-800 dark:text-emerald-300">{successMessage}</p>
            </div>
          )}

          {/* ── Title ── */}
          <textarea
            rows={2}
            placeholder="Tulis Judul Naskah..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-serif font-normal leading-tight tracking-tight text-foreground placeholder:text-muted/40 focus:outline-none resize-none border-b border-border hover:border-foreground/60 transition-colors pb-2"
            style={{ fontSize: 'clamp(1.4rem, 4vw, 2.5rem)' }}
          />
          <input
            type="text"
            placeholder="Subjudul esai (opsional)..."
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full bg-transparent font-serif italic text-base sm:text-lg text-foreground placeholder:text-muted/40 focus:outline-none border-b border-border-hairline hover:border-foreground/40 transition-colors pb-2"
          />

          {/* ── Collapsible Metadata Panel ── */}
          <div className="border border-border rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setMetaOpen(!metaOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-surface-muted/30 hover:bg-surface-muted/50 transition-colors"
            >
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                Metadata Naskah — Kategori, Tag, Sampul
              </span>
              {metaOpen ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>
            {metaOpen && (
              <div className="p-4 space-y-4 border-t border-border-hairline">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold block">Kategori</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-11 sm:h-10 px-3 bg-surface border border-border-hairline text-sm sm:text-xs font-sans focus:outline-none focus:border-foreground cursor-pointer rounded-none"
                    >
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold block">Tag (Maks. 5)</label>
                    <TagPicker tags={tags} selectedIds={tagIds} onChange={setTagIds} />
                  </div>
                </div>
                <ArticleCoverUploader value={coverImage} onChange={setCoverImage} credit={coverCredit} onCreditChange={setCoverCredit} />
              </div>
            )}
          </div>

          {/* ── Editor ── */}
          {article && (
            <EditorialEditor
              initialContent={article.content}
              onChange={(json, text) => { setContentJson(json); setPlainText(text); }}
              onAutosave={() => doSave()}
              placeholder="Tuangkan gagasan, esai, resensi buku, atau warta liputanmu di sini..."
            />
          )}

          {/* ── SEO Panel ── */}
          <SeoAnalysisPanel title={title} plainText={plainText} tags={tagNames} coverImage={coverImage} />

          {/* ── Bottom Actions ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 pb-8 border-t border-border-hairline">
            <p className="font-mono text-[10px] text-muted uppercase">
              {wordCount > 0 && (
                <>{wordCount} kata{wordCount < 100 && <span className="text-amber-600 ml-1.5">(min. 100 untuk kirim ke redaksi)</span>}</>
              )}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="md" onClick={() => handleUpdate(false)} isLoading={isSubmitting} className="flex-1 sm:flex-none">
                Simpan Perubahan
              </Button>
              <Button type="button" variant="solid" size="md" onClick={() => handleUpdate(true)} isLoading={isSubmitting} className="flex-1 sm:flex-none">
                Ajukan ke Redaksi &rarr;
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
