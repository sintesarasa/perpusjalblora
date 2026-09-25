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
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Top Breadcrumbs & Back */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-4 text-[11px] font-mono uppercase tracking-wider text-muted">
          <Link
            href="/artikel"
            className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Warta</span>
          </Link>

          <div className="flex items-center gap-2">
            <span>[{article.category?.name || 'UMUM'}]</span>
            <span>//</span>
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
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.12] tracking-tight text-foreground">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="font-serif italic text-xl sm:text-2xl text-muted font-normal leading-relaxed">
                {article.subtitle}
              </p>
            )}
          </div>

          {/* Byline & Read Metrics */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-b border-border-hairline py-3 font-mono text-[11px] uppercase tracking-wider text-muted">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-semibold">
                Oleh {article.author?.name || 'Redaksi'}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readingTime} Menit Baca
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.viewCount} Kali Dibaca
              </span>
            </div>
          </div>
        </header>

        {/* Cover Image Frame */}
        {article.coverImage && (
          <figure className="space-y-2 border border-foreground p-2 bg-surface">
            <div className="aspect-[16/9] overflow-hidden bg-surface-muted relative">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover grayscale contrast-110"
              />
            </div>
            {article.coverCredit && (
              <figcaption className="font-mono text-[10px] uppercase tracking-wider text-muted text-right pr-1 pt-1">
                Foto: {article.coverCredit}
              </figcaption>
            )}
          </figure>
        )}

        {/* Article Body Content (68ch Editorial Prose) */}
        <article className="max-w-prose mx-auto py-4">
          <RichTextRenderer
            content={article.content || article.plainText}
            withDropCap={true}
          />
        </article>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="max-w-prose mx-auto pt-6 border-t border-border-hairline flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider">
            <span className="text-muted">Topik Terkait:</span>
            {article.tags.map((t) => (
              <Link
                key={t.id}
                href={`/artikel?tag=${t.slug}`}
                className="px-2.5 py-1 border border-border hover:border-foreground transition-colors text-muted hover:text-foreground"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        {/* Share Section */}
        <div className="max-w-prose mx-auto p-6 border border-foreground bg-surface space-y-4">
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider">
            <span className="font-bold flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Bagikan Tulisan Ini
            </span>
            <span className="text-[10px] text-muted">Sebarkan wacana merdeka</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs uppercase tracking-wider">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="h-9 px-4 border border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              WhatsApp
            </button>
            <button
              type="button"
              onClick={handleShareX}
              className="h-9 px-4 border border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              X (Twitter)
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="h-9 px-4 border border-foreground hover:bg-foreground hover:text-background transition-colors inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-foreground" /> : null}
              <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
            </button>
          </div>
        </div>

        {/* Author Colophon */}
        <div className="max-w-prose mx-auto">
          <AuthorCard author={article.author} />
        </div>

        {/* Community Discussion / Comments */}
        <div className="max-w-prose mx-auto">
          <CommentsSection articleId={article.id} initialCount={article.commentCount} />
        </div>

        {/* Related Articles Section */}
        {related.length > 0 && (
          <section className="pt-12 border-t-2 border-foreground space-y-6">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted border-b border-border-hairline pb-2">
              <span className="font-bold text-foreground">BACAAN TERKAIT DALAM KATEGORI INI</span>
              <span>// 03 PILIHAN</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <ArticleCard key={rel.id} article={rel} showImage={false} />
              ))}
            </div>
          </section>
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
