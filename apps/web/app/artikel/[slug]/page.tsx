'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RichTextRenderer } from '@/components/articles/rich-text-renderer';
import { AuthorCard } from '@/components/articles/author-card';
import { ArticleCard } from '@/components/articles/article-card';
import { CommentsSection } from '@/components/comments/comments-section';
import { CustomLoader } from '@/components/ui/custom-loader';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { apiClient } from '@/lib/api';
import { ArticleDetail, ArticleSummary, ArticleStatus } from '@perpusjal/types';
import { ArrowLeft, Share2, Check, MessageSquare, Eye, Clock, Calendar } from 'lucide-react';

function ArticleDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const previewToken = searchParams.get('preview') || undefined;

  const [article, setArticle] = React.useState<ArticleDetail | null>(null);
  const [related, setRelated] = React.useState<ArticleSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    async function loadArticle() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);

      const previewQuery = previewToken ? `?preview=${previewToken}` : '';
      const [articleRes, relatedRes] = await Promise.all([
        apiClient<ArticleDetail>(`/articles/${slug}${previewQuery}`),
        apiClient<ArticleSummary[]>(`/articles/${slug}/related`),
      ]);

      if (articleRes.error) {
        setError(articleRes.error.message || 'Artikel tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      if (articleRes.data) {
        setArticle(articleRes.data);
        if (relatedRes.data) {
          setRelated(relatedRes.data);
        }
        setIsLoading(false);

        // Record view ping after 5 seconds of active reading
        const timer = setTimeout(() => {
          apiClient(`/articles/${articleRes.data!.id}/view`, {
            method: 'POST',
            body: JSON.stringify({
              secondsSpent: 15,
              scrollDepth: 50,
            }),
          }).catch(() => {});
        }, 5000);

        return () => clearTimeout(timer);
      }

      setIsLoading(false);
    }

    loadArticle();
  }, [slug, previewToken]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined' && article) {
      const text = encodeURIComponent(`"${article.title}" — Baca di Perpusjal Blora: ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const handleShareX = () => {
    if (typeof window !== 'undefined' && article) {
      const text = encodeURIComponent(`"${article.title}" via @perpusjalblora`);
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-12">
          <CustomLoader size="lg" label="MEMBUKA LEMBARAN NASKAH..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-20 text-center space-y-6">
          <div className="border-2 border-foreground p-12 bg-surface space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              KODE // 404
            </span>
            <h1 className="font-serif text-3xl font-normal">Naskah Tidak Ditemukan</h1>
            <p className="font-sans text-sm text-muted max-w-md mx-auto">
              {error || 'Naskah yang kamu cari tidak tersedia, telah diarsipkan, atau tautan tidak valid.'}
            </p>
            <div className="pt-4">
              <Link
                href="/artikel"
                className="font-mono text-xs uppercase tracking-wider text-foreground underline underline-offset-4"
              >
                &larr; Kembali ke Arsip Warta
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Dalam Kurasi';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScrollProgress />
      <Header />

      <main className="flex-1 w-full pb-16">
        {/* Core Reading Column */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
          {/* Top Breadcrumbs & Edition Stamp */}
          <div className="flex items-center justify-between border-b border-border-hairline pb-4 text-[11px] font-mono uppercase tracking-wider text-muted">
            <Link
              href="/artikel"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Warta</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">[{article.category?.name || 'UMUM'}]</span>
              <span className="text-border">//</span>
              <BrandStamp edition="EDISI III" year="2026" className="py-0 px-2 text-[8px]" />
            </div>
          </div>

          {/* Article Masthead */}
          <header className="space-y-6">
            {(article.preview || article.status !== ArticleStatus.PUBLISHED) && (
              <div className="p-3.5 border-2 border-foreground bg-surface font-mono text-xs uppercase tracking-wider font-semibold flex flex-wrap items-center justify-between gap-2 shadow-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Mode Pratinjau Naskah &bull; Status: {article.status || article.preview?.status}
                </span>
                <span className="text-[10px] text-muted font-normal lowercase">
                  (Draf sedang dalam antrean kurasi)
                </span>
              </div>
            )}

            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal leading-[1.2] sm:leading-[1.22] tracking-tight text-foreground">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="font-serif italic text-lg sm:text-xl text-muted font-normal leading-relaxed pt-1">
                  {article.subtitle}
                </p>
              )}
            </div>

            {/* Byline & Read Metrics */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 border-y border-border-hairline font-mono text-[11px] uppercase tracking-wider text-muted">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 border border-foreground/30 bg-surface-muted flex items-center justify-center font-mono text-[10px] font-bold text-foreground overflow-hidden">
                  {article.author?.avatarUrl ? (
                    <img
                      src={article.author.avatarUrl}
                      alt={article.author.name}
                      className="w-full h-full object-cover grayscale"
                    />
                  ) : (
                    <span>{article.author?.name?.charAt(0) || 'R'}</span>
                  )}
                </div>
                <span className="text-foreground font-semibold">
                  Oleh {article.author?.name || 'Redaksi'}
                </span>
                <span className="text-muted/60">&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-muted" />
                  {formattedDate}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted" />
                  {article.readingTime} Menit Baca
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-muted" />
                  {article.viewCount} Kali Dibaca
                </span>
              </div>
            </div>
          </header>

          {/* Cover Image Frame */}
          {article.coverImage && (
            <figure className="space-y-2 border border-border-hairline bg-surface p-1.5 sm:p-2">
              <div className="aspect-[16/9] sm:aspect-[21/10] overflow-hidden bg-surface-muted relative">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover grayscale contrast-[1.08] hover:contrast-100 transition-all duration-500"
                />
              </div>
              {article.coverCredit && (
                <figcaption className="font-mono text-[10px] uppercase tracking-wider text-muted text-right pr-1 pt-1">
                  Foto: {article.coverCredit}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Body Content */}
          <article className="pt-2">
            <RichTextRenderer
              content={article.content || article.plainText}
              withDropCap={true}
            />
          </article>

          {/* Tags & Minimalist Share Bar (Unified Editorial Footer) */}
          <div className="pt-8 border-t border-border-hairline space-y-5">
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider">
                <span className="text-muted text-[11px]">Topik:</span>
                {article.tags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/artikel?tag=${t.slug}`}
                    className="px-2.5 py-1 border border-border hover:border-foreground transition-colors text-muted hover:text-foreground text-[11px]"
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Minimalist Share Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 px-4 bg-surface border border-border-hairline font-mono text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <Share2 className="w-3.5 h-3.5 text-muted" />
                <span>Bagikan Naskah</span>
                <span className="text-[10px] text-muted font-normal lowercase tracking-normal hidden sm:inline">
                  &mdash; sebarkan wacana merdeka
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="h-8 px-3 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-colors text-[11px]"
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleShareX}
                  className="h-8 px-3 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-colors text-[11px]"
                >
                  X (Twitter)
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="h-8 px-3 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-1.5 text-[11px]"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : null}
                  <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Author Colophon */}
          <AuthorCard author={article.author} />

          {/* Community Discussion / Comments */}
          <CommentsSection articleId={article.id} initialCount={article.commentCount} />
        </div>

        {/* Related Articles Section (Expands gracefully for balanced 3-card layout) */}
        {related.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-16 pt-12 border-t-2 border-foreground space-y-6">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted border-b border-border-hairline pb-2">
              <span className="font-bold text-foreground">BACAAN TERKAIT DALAM KATEGORI INI</span>
              <span>// {related.length.toString().padStart(2, '0')} PILIHAN</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <ArticleCard key={rel.id} article={rel} showImage={false} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ArticleDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <CustomLoader size="md" label="MEMUAT ARTIKEL..." />
        </div>
      }
    >
      <ArticleDetailContent />
    </React.Suspense>
  );
}
