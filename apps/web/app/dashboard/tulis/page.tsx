'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EditorialEditor } from '@/components/editor/editorial-editor';
import { ArticleCoverUploader } from '@/components/articles/article-cover-uploader';
import { TagPicker } from '@/components/articles/tag-picker';
import { SeoAnalysisPanel } from '@/components/articles/seo-analysis-panel';
import { apiClient } from '@/lib/api';
import { ArticleCategory, ArticleTag } from '@perpusjal/types';
import {
  Save, Send, AlertCircle, CheckCircle2, Clock, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';

export default function DashboardWritePage() {
  const router = useRouter();

  // Core state
  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [coverImage, setCoverImage] = React.useState('');
  const [coverCredit, setCoverCredit] = React.useState('');
  const [tagIds, setTagIds] = React.useState<string[]>([]);
  const [contentJson, setContentJson] = React.useState<any>(null);
  const [plainText, setPlainText] = React.useState('');
  const [agreeOriginality, setAgreeOriginality] = React.useState(false);

  // Metadata
  const [categories, setCategories] = React.useState<ArticleCategory[]>([]);
  const [tags, setTags] = React.useState<ArticleTag[]>([]);

  // UI
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [autosaveState, setAutosaveState] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const [metaOpen, setMetaOpen] = React.useState(true); // metadata panel open/close
  const [savedDraftId, setSavedDraftId] = React.useState<string | null>(null);
  const autosaveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = React.useRef(false);

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

  // Autosave 30s debounce
  const scheduleAutosave = React.useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(async () => {
      if (!title.trim() || isSavingRef.current) return;
      isSavingRef.current = true;
      setAutosaveState('saving');
      try {
        const body: any = { title: title.trim(), subtitle: subtitle.trim() || undefined, categoryId, coverImage: coverImage.trim() || undefined, coverCredit: coverCredit.trim() || undefined, content: contentJson, tagIds: tagIds.length > 0 ? tagIds : undefined, isDraft: true };
        if (savedDraftId) {
          await apiClient(`/articles/${savedDraftId}`, { method: 'PATCH', body: JSON.stringify(body) });
          setAutosaveState('saved');
        } else {
          const res = await apiClient<{ id: string }>('/articles', { method: 'POST', body: JSON.stringify(body) });
          if (res.data) {
            setSavedDraftId(res.data.id);
            setAutosaveState('saved');
            setTimeout(() => router.replace(`/dashboard/tulis/${res.data!.id}`), 800);
          }
        }
      } catch { setAutosaveState('idle'); }
      finally { isSavingRef.current = false; }
    }, 30000);
  }, [title, subtitle, categoryId, coverImage, coverCredit, tagIds, contentJson, savedDraftId, router]);

  React.useEffect(() => {
    if (title.trim()) scheduleAutosave();
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
  }, [title, subtitle, categoryId, coverImage, contentJson, scheduleAutosave]);

  const handleSave = async (isDraft: boolean) => {
    setErrorMessage(null); setSuccessMessage(null);
    if (!title.trim()) { setErrorMessage('Judul naskah wajib diisi.'); return; }
    if (!isDraft) {
      if (!coverImage.trim()) { setErrorMessage('Gambar sampul wajib ada sebelum mengirim ke redaksi.'); return; }
      if (wordCount < 100) { setErrorMessage('Naskah minimal 100 kata sebelum bisa diajukan ke redaksi.'); return; }
      if (!agreeOriginality) { setErrorMessage('Centang ikrar orisinalitas karya terlebih dahulu.'); return; }
    }
    setIsSubmitting(true);
    try {
      const body: any = { title: title.trim(), subtitle: subtitle.trim() || undefined, categoryId, coverImage: coverImage.trim() || undefined, coverCredit: coverCredit.trim() || undefined, content: contentJson, tagIds: tagIds.length > 0 ? tagIds : undefined, isDraft };
      const endpoint = savedDraftId ? `/articles/${savedDraftId}` : '/articles';
      const method = savedDraftId ? 'PATCH' : 'POST';
      const res = await apiClient<{ id: string }>(endpoint, { method, body: JSON.stringify(body) });
      if (res.error) { setErrorMessage(res.error.message || 'Gagal menyimpan naskah.'); return; }
      if (res.data && !savedDraftId) setSavedDraftId(res.data.id);
      if (!isDraft && res.data) {
        const artId = res.data.id || savedDraftId;
        if (artId) {
          await apiClient(`/articles/${artId}/submit`, { method: 'POST' });
        }
      }
      setSuccessMessage(isDraft ? 'Draf berhasil disimpan.' : 'Naskah berhasil diajukan ke meja redaksi.');
      setTimeout(() => router.push('/dashboard/tulisan'), 1400);
    } catch { setErrorMessage('Gagal menghubungi server. Periksa koneksimu.'); }
    finally { setIsSubmitting(false); }
  };

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const tagNames = tags.filter((t) => tagIds.includes(t.id)).map((t) => t.name);

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky Page Header (inside dashboard) ── */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border-hairline">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
          {/* Left: page label + autosave */}
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted leading-none">Tulis Naskah Baru</p>
              {title && (
                <p className="font-serif text-sm text-foreground leading-snug mt-0.5 truncate max-w-[200px] sm:max-w-xs">
                  {title}
                </p>
              )}
            </div>
            {autosaveState === 'saving' && (
              <span className="font-mono text-[10px] text-muted animate-pulse uppercase shrink-0 hidden sm:block">
                <Clock className="w-3 h-3 inline-block mr-0.5" />Menyimpan...
              </span>
            )}
            {autosaveState === 'saved' && (
              <span className="font-mono text-[10px] text-emerald-600 uppercase shrink-0 hidden sm:block">
                <CheckCircle2 className="w-3 h-3 inline-block mr-0.5" />Tersimpan
              </span>
            )}
          </div>

          {/* Right: word count + action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {wordCount > 0 && (
              <span className="font-mono text-[10px] text-muted uppercase hidden md:block">
                <FileText className="w-3 h-3 inline-block mr-0.5" />{wordCount} Kata
              </span>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => handleSave(true)} isLoading={isSubmitting}>
              <Save className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Simpan </span>Draf
            </Button>
            <Button type="button" variant="solid" size="sm" onClick={() => handleSave(false)} isLoading={isSubmitting}>
              <Send className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Kirim ke </span>Redaksi
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">

          {/* ── Alerts ── */}
          {errorMessage && (
            <div className="p-3.5 border-2 border-foreground bg-surface flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider">Perhatian</p>
                <p className="text-sm sm:text-xs font-sans mt-0.5">{errorMessage}</p>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-muted hover:text-foreground text-lg font-bold shrink-0">&times;</button>
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
            placeholder="Tulis Judul Naskah di Sini..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-serif font-normal leading-tight tracking-tight text-foreground placeholder:text-muted/40 focus:outline-none resize-none border-b border-border hover:border-foreground/60 transition-colors pb-2"
            style={{ fontSize: 'clamp(1.4rem, 4vw, 2.5rem)' }}
          />

          <input
            type="text"
            placeholder="Tambahkan subjudul atau ringkasan singkat (opsional)..."
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
                {/* Category + Tags in one responsive row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold block">
                      Kategori Naskah
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-11 sm:h-10 px-3 bg-surface border border-border-hairline text-sm sm:text-xs font-sans focus:outline-none focus:border-foreground cursor-pointer rounded-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold block">
                      Tag (Maks. 5)
                    </label>
                    <TagPicker tags={tags} selectedIds={tagIds} onChange={setTagIds} />
                  </div>
                </div>

                {/* Cover Image */}
                <ArticleCoverUploader
                  value={coverImage}
                  onChange={setCoverImage}
                  credit={coverCredit}
                  onCreditChange={setCoverCredit}
                />
              </div>
            )}
          </div>

          {/* ── Editor ── */}
          <EditorialEditor
            onChange={(json, text) => { setContentJson(json); setPlainText(text); }}
            placeholder={placeholder_text}
          />

          {/* ── SEO Panel ── */}
          <SeoAnalysisPanel
            title={title}
            plainText={plainText}
            tags={tagNames}
            coverImage={coverImage}
          />

          {/* ── Originality Pledge ── */}
          <div className="p-4 border border-border bg-surface">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeOriginality}
                onChange={(e) => setAgreeOriginality(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded-none border border-foreground bg-transparent accent-foreground cursor-pointer focus:ring-0 shrink-0"
              />
              <span className="font-sans text-sm sm:text-xs text-muted leading-relaxed">
                Saya menyatakan bahwa naskah ini adalah karya orisinal saya sendiri, bukan hasil plagiarisme
                atau saduran tanpa izin, serta tidak mengandung ujaran kebencian.
              </span>
            </label>
          </div>

          {/* ── Bottom Actions ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 pb-8 border-t border-border-hairline">
            <p className="font-mono text-[10px] text-muted uppercase">
              {wordCount > 0 && (
                <>
                  {wordCount} kata{wordCount < 100 && (
                    <span className="text-amber-600 ml-1.5">(min. 100 untuk kirim ke redaksi)</span>
                  )}
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="md" onClick={() => handleSave(true)} isLoading={isSubmitting} className="flex-1 sm:flex-none">
                Simpan Draf
              </Button>
              <Button type="button" variant="solid" size="md" onClick={() => handleSave(false)} isLoading={isSubmitting} className="flex-1 sm:flex-none">
                Kirim ke Redaksi &rarr;
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const placeholder_text = 'Tuangkan gagasan, esai, resensi buku, atau warta liputanmu di sini. Gunakan toolbar di atas untuk memformat teks, sisipkan gambar, atau tambahkan tautan...';
