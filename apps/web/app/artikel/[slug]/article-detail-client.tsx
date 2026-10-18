'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RichTextRenderer } from '@/components/articles/rich-text-renderer';
import { AuthorCard } from '@/components/articles/author-card';
import { RelatedArticles } from '@/components/articles/related-articles';
import { ArticleReaderToolbar, TextScale } from '@/components/articles/article-reader-toolbar';
import { CommentsSection } from '@/components/comments/comments-section';
import { UserHonorBadge } from '@/components/gamification/user-honor-badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { CustomLoader } from '@/components/ui/custom-loader';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { apiClient } from '@/lib/api';
import { ArticleDetail, ArticleSummary, ArticleStatus } from '@perpusjal/types';
import {
  ArrowLeft,
  Share2,
  Check,
  Eye,
  Clock,
  Calendar,
  Link2,
  Quote,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ArticleDetailClient({
  slug: initialSlug,
  previewToken: initialPreviewToken,
}: {
  slug?: string;
  previewToken?: string;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = initialSlug || (params?.slug as string);
  const previewToken = initialPreviewToken || searchParams.get('preview') || undefined;

  const [article, setArticle] = React.useState<ArticleDetail | null>(null);
  const [related, setRelated] = React.useState<ArticleSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [quoteCopied, setQuoteCopied] = React.useState(false);

  // Reader Controls
  const [textScale, setTextScale] = React.useState<TextScale>('base');
  const [isZenMode, setIsZenMode] = React.useState(false);

  const commentsRef = React.useRef<HTMLDivElement>(null);
  const [showMobileReaderPill, setShowMobileReaderPill] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowMobileReaderPill(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle ESC key for Zen mode
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

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

  const activePullQuote = article?.pullQuote || (article?.excerpt && article.excerpt.length > 25 ? article.excerpt : null);

  const handleCopyQuote = () => {
    if (typeof window !== 'undefined' && activePullQuote) {
      navigator.clipboard.writeText(`“${activePullQuote}” — ${article?.author?.name || 'Redaksi Perpusjal'}\n\nSumber: ${window.location.href}`);
      setQuoteCopied(true);
      setTimeout(() => setQuoteCopied(false), 2000);
    }
  };

  const handleShareQuoteWhatsApp = () => {
    if (typeof window !== 'undefined' && activePullQuote) {
      const text = encodeURIComponent(`“${activePullQuote}”\n\n— ${article?.author?.name || 'Redaksi Perpusjal Blora'}\n\nBaca catatan selengkapnya di Perpusjal Blora:\n${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined' && article) {
      const text = encodeURIComponent(`"${article.title}" — Baca catatan di Perpusjal Blora: ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const handleShareFacebook = () => {
    if (typeof window !== 'undefined' && article) {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }
  };

  const handleShareX = () => {
    if (typeof window !== 'undefined' && article) {
      const text = encodeURIComponent(`"${article.title}" via @perpusjalblora`);
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  };

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Text scaling class mapping for the article body
  const textScaleClasses: Record<TextScale, string> = {
    sm: 'text-[16px] leading-[1.8]',
    base: 'text-[18px] sm:text-[19px] leading-[1.85] sm:leading-[1.9]',
    lg: 'text-[20px] sm:text-[21px] leading-[1.9] sm:leading-[1.95]',
    xl: 'text-[22px] sm:text-[24px] leading-[1.95] sm:leading-[2.05]',
  };

  const nextScale: Record<TextScale, TextScale> = {
    sm: 'base',
    base: 'lg',
    lg: 'xl',
    xl: 'sm',
  };

  const scaleLabel: Record<TextScale, string> = {
    sm: '16px',
    base: '18px',
    lg: '20px',
    xl: '22px',
  };

  return (
    <div className={cn('flex flex-col min-h-screen bg-background transition-colors', isZenMode && 'editorial-paper-bg')}>
      {/* Universal Scroll reading progress: pinned at top of viewport with subtle track */}
      <ScrollProgress className="fixed top-0 left-0 right-0 h-[3px] bg-foreground/15 z-50 pointer-events-none" />

      {/* Hide standard header in Zen reading mode */}
      {!isZenMode && <Header />}

      {/* Floating Zen Mode Notice */}
      {isZenMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 bg-foreground/90 text-background font-mono text-[10px] uppercase tracking-widest backdrop-blur border border-foreground flex items-center gap-2 print:hidden">
          <span>MODE FOKUS MEMBACA AKTIF</span>
          <span className="opacity-70">&bull; TEKAN ESC UNTUK KELUAR</span>
        </div>
      )}

      <main className="flex-1 w-full pb-28 sm:pb-20">
        {/* Core Reading Column */}
        <div
          className={cn(
            'mx-auto px-4 sm:px-6 md:px-8 transition-all duration-300',
            isZenMode ? 'max-w-2xl py-12 sm:py-20' : 'max-w-3xl py-8 sm:py-12 space-y-8 sm:space-y-10'
          )}
        >
          {/* Top Breadcrumbs & Edition Stamp (hidden in zen) */}
          {!isZenMode && (
            <div className="flex items-center justify-between border-b border-border-hairline pb-4 text-[11px] font-mono uppercase tracking-wider text-muted">
              <Link
                href="/artikel"
                className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Warta</span>
              </Link>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">[{article.category?.name || 'WARTA & ESAI'}]</span>
                <span className="text-border">//</span>
                <BrandStamp edition="EDISI III" year="2026" className="py-0 px-2 text-[8px]" />
              </div>
            </div>
          )}

          {/* Article Masthead */}
          <RevealOnScroll variant="cinematic" delayMs={50}>
            <header className="space-y-6 pt-2">
              {(article.preview || article.status !== ArticleStatus.PUBLISHED) && (
                <div className="p-3.5 border-2 border-foreground bg-surface font-mono text-xs uppercase tracking-wider font-semibold flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-none bg-foreground animate-pulse" />
                    Mode Pratinjau Naskah &bull; Status: {article.status || article.preview?.status}
                  </span>
                  <span className="text-[10px] text-muted font-normal lowercase">
                    (Draf sedang dalam antrean kurasi)
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                  <span>{article.category?.name || 'WARTA'}</span>
                  <span>•</span>
                  <span>{formattedDate}</span>
                  {article.isFeatured && (
                    <>
                      <span>•</span>
                      <span className="text-foreground font-bold">★ PILIHAN REDAKSI</span>
                    </>
                  )}
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.18] sm:leading-[1.2] tracking-tight text-foreground">
                  {article.title}
                </h1>

                {article.subtitle && (
                  <p className="font-serif italic text-lg sm:text-xl text-muted font-normal leading-relaxed pt-1">
                    {article.subtitle}
                  </p>
                )}
              </div>

              {/* Byline & Read Metrics (Editorial 2-Tier Layout) */}
              <div className="py-4 border-y border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <UserAvatar
                    src={article.author?.avatarUrl}
                    name={article.author?.name}
                    username={article.author?.username}
                    size="md"
                    linkToProfile
                  />

                  <div className="space-y-1 min-w-0">
                    {/* Baris 1: Nama Penulis & Gelar Kehormatan */}
                    <div className="flex flex-wrap items-center gap-2">
                      {article.author?.username ? (
                        <Link
                          href={`/u/${article.author.username}`}
                          className="font-serif font-bold text-base sm:text-lg text-foreground hover:underline tracking-tight"
                        >
                          {article.author.name}
                        </Link>
                      ) : (
                        <span className="font-serif font-bold text-base sm:text-lg text-foreground">
                          {article.author?.name || 'Redaksi Perpusjal'}
                        </span>
                      )}

                      {article.author && (
                        <UserHonorBadge
                          equippedTitle={article.author.equippedTitle}
                          equippedBadge={article.author.equippedBadge}
                          earnedBadgesCount={article.author.earnedBadgesCount}
                          badges={article.author.badges}
                          username={article.author.username}
                          size="sm"
                        />
                      )}
                    </div>

                    {/* Baris 2: Waktu Terbit & Metrik Baca */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 font-mono text-[11px] text-muted uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-muted" />
                        {formattedDate}
                      </span>
                      <span className="text-muted/40">•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-muted" />
                        {article.readingTime} Menit Baca
                      </span>
                      <span className="text-muted/40">•</span>
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3 h-3 text-muted" />
                        {article.viewCount} Dibaca
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </header>
          </RevealOnScroll>

          {/* Cover Image Frame */}
          {article.coverImage && (
            <RevealOnScroll variant="cinematic" delayMs={80}>
              <figure className="space-y-2 border border-border-hairline bg-surface p-1.5 sm:p-2">
                <div className="aspect-[16/9] sm:aspect-[21/10] overflow-hidden bg-surface-muted relative">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                </div>
                {article.coverCredit && (
                  <figcaption className="font-mono text-[10px] uppercase tracking-wider text-muted text-right pr-1 pt-1">
                    Kredit Foto: {article.coverCredit}
                  </figcaption>
                )}
              </figure>
            </RevealOnScroll>
          )}

          {/* Reader Interactive Toolbar (Positioned gracefully below cover image) */}
          <ArticleReaderToolbar
            title={article.title}
            slug={article.slug}
            readingTime={article.readingTime}
            commentCount={article.commentCount}
            textScale={textScale}
            onTextScaleChange={setTextScale}
            isZenMode={isZenMode}
            onToggleZenMode={() => setIsZenMode((prev) => !prev)}
            onScrollToComments={scrollToComments}
          />

          {/* Editorial Pull-Quote Block (Curated pull-quote or excerpt spotlight) */}
          {activePullQuote && (
            <RevealOnScroll variant="cinematic" delayMs={60}>
              <div className="my-6 p-5 sm:p-7 bg-surface border-l-4 border-foreground border-y border-r border-border-hairline shadow-xs space-y-4">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted border-b border-border-hairline pb-2.5">
                  <span className="flex items-center gap-1.5 font-bold text-foreground">
                    <Quote className="w-3.5 h-3.5 text-foreground rotate-180" />
                    KUTIPAN UTAMA // PULL-QUOTE
                  </span>
                  <span>PERPUSJAL BLORA</span>
                </div>
                <blockquote className="font-serif italic text-lg sm:text-2xl text-foreground font-normal leading-relaxed">
                  &ldquo;{activePullQuote}&rdquo;
                </blockquote>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <span className="font-mono text-muted text-[11px]">
                    — {article.author?.name || 'Redaksi Perpusjal Blora'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyQuote}
                      className="h-8 px-3 border border-border-hairline hover:border-foreground bg-surface hover:bg-foreground hover:text-background transition-colors font-mono text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1.5 active:scale-95 touch-tactile cursor-pointer"
                    >
                      {quoteCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Quote className="w-3 h-3" />}
                      <span>{quoteCopied ? 'Tersalin!' : 'Salin Kutipan'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareQuoteWhatsApp}
                      className="h-8 px-3 border border-border-hairline hover:border-foreground bg-surface hover:bg-foreground hover:text-background transition-colors font-mono text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1.5 active:scale-95 touch-tactile cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Ke WA</span>
                    </button>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          )}

          {/* Article Body Content with dynamic text scale & centered reading column */}
          <article className={cn('pt-4 font-serif text-foreground/90 antialiased', textScaleClasses[textScale])}>
            <RichTextRenderer
              content={article.content || article.plainText}
              withDropCap={false}
            />
          </article>

          {/* Tags & Unified Editorial Footer (hidden in Zen mode) */}
          {!isZenMode && (
            <div className="pt-8 border-t border-border-hairline space-y-6">
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider">
                  <span className="text-muted text-[11px]">Topik Terkait:</span>
                  {article.tags.map((t) => (
                    <Link
                      key={t.slug || t.name}
                      href={`/artikel?tag=${t.slug}`}
                      className="px-2.5 py-1 border border-border hover:border-foreground transition-colors text-muted hover:text-foreground text-[11px]"
                    >
                      #{t.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Opsi A: Kolofon Sirkulasi Gagasan (The Broadside Dispatch Slip) */}
              <RevealOnScroll variant="stamp" delayMs={80}>
                <div className="border-2 border-foreground bg-surface p-5 sm:p-7 space-y-4 font-mono select-none rounded-none">
                  <div className="flex flex-wrap items-center justify-between pb-3 border-b border-border-hairline gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-foreground rounded-none" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                        SIRKULASI GAGASAN // EDARAN WARGA
                      </span>
                    </div>
                    <span className="text-[9.5px] uppercase tracking-wider text-muted">
                      [ LEMBAR DISPATCH RESMI ]
                    </span>
                  </div>

                  <p className="font-serif italic text-sm sm:text-base text-foreground/85 leading-relaxed">
                    &ldquo;Jika catatan ini memantik nalar, menyentuh batin, atau membuka sudut pandang baru, siarkan ke lingkaran kawan dan lingkar baca terdekat.&rdquo;
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="h-10 px-4 border border-foreground bg-background hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2 font-mono text-xs uppercase font-bold tracking-wider rounded-none cursor-pointer flex-1 sm:flex-initial"
                    >
                      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.25-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.59.21-1.09.15-1.19-.07-.1-.23-.17-.48-.29" />
                      </svg>
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareFacebook}
                      className="h-10 px-4 border border-foreground bg-background hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2 font-mono text-xs uppercase font-bold tracking-wider rounded-none cursor-pointer flex-1 sm:flex-initial"
                    >
                      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>Facebook</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleShareX}
                      className="h-10 px-4 border border-foreground bg-background hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2 font-mono text-xs uppercase font-bold tracking-wider rounded-none cursor-pointer flex-1 sm:flex-initial"
                    >
                      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span>Bagikan di 𝕏</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={cn(
                        'h-10 px-4 border transition-colors flex items-center justify-center gap-2 font-mono text-xs uppercase font-bold tracking-wider rounded-none cursor-pointer flex-1 sm:flex-initial',
                        copied
                          ? 'bg-foreground text-background border-foreground font-bold'
                          : 'border-foreground bg-background hover:bg-foreground hover:text-background'
                      )}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Tautan Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Salin Tautan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          )}

          {/* Cross-Linking Buku: Buku di Perpusjal yang Berkaitan dengan Naskah Ini */}
          {!isZenMode && article.relatedBooks && article.relatedBooks.length > 0 && (
            <RevealOnScroll variant="cinematic" delayMs={90}>
              <section className="pt-8 sm:pt-10 border-t-2 border-foreground space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border-hairline pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-muted font-mono text-[10px] uppercase tracking-widest font-bold">
                      <BookOpen className="w-3.5 h-3.5 text-foreground" />
                      <span>PUSTAKA TERKAIT DI LAPAK TERPAL</span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mt-1">
                      Buku yang Berkaitan dengan Naskah Ini
                    </h3>
                    <p className="font-sans text-xs text-muted mt-0.5">
                      Koleksi buku fisik yang dibawa ke lapak Perpusjal Blora untuk mendalami gagasan ini secara menyeluruh.
                    </p>
                  </div>
                  <Link
                    href="/buku"
                    className="font-mono text-xs uppercase tracking-wider text-foreground hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Katalog Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Horizontal snap-scroll on mobile, neat grid on sm+ */}
                <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {article.relatedBooks.map((book) => (
                    <div
                      key={book.id}
                      className="min-w-[250px] sm:min-w-0 border border-border-hairline bg-surface p-3.5 sm:p-4 flex flex-col justify-between space-y-3 snap-start transition-all hover:border-foreground group rounded-none"
                    >
                      <div className="flex gap-3">
                        {/* Book Spine / Cover Mockup */}
                        <div className="w-16 h-22 shrink-0 bg-surface-muted border border-border-hairline overflow-hidden shadow-xs relative group-hover:shadow-sm transition-shadow">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted/10 text-[9px] font-mono text-muted text-center p-1">
                              Sampul Buku
                            </div>
                          )}
                          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="inline-block px-1.5 py-0.5 bg-foreground/5 border border-border-hairline font-mono text-[9px] uppercase text-muted truncate max-w-full">
                            {book.category?.name || 'Koleksi Lapak'}
                          </span>
                          <Link href={`/buku/${book.slug}`}>
                            <h4 className="font-serif font-bold text-sm text-foreground group-hover:underline line-clamp-2 leading-snug">
                              {book.title}
                            </h4>
                          </Link>
                          <p className="font-serif italic text-xs text-muted truncate">
                            {book.author}
                          </p>
                          {book.curatorNote && (
                            <p className="font-serif italic text-[11px] text-foreground/80 line-clamp-2 border-l border-foreground/40 pl-1.5 pt-0.5 mt-1">
                              &ldquo;{book.curatorNote}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border-hairline flex items-center justify-between font-mono text-[10px]">
                        <span className={cn(
                          'px-2 py-0.5 font-bold uppercase tracking-wider',
                          book.isBorrowable && book.availableCopies > 0
                            ? 'bg-foreground text-background'
                            : 'border border-border-hairline text-muted'
                        )}>
                          {book.isBorrowable && book.availableCopies > 0
                            ? '● Siap Pinjam'
                            : !book.isBorrowable
                            ? '○ Di Tempat'
                            : '× Dipinjam'}
                        </span>

                        <Link
                          href={`/buku/${book.slug}`}
                          className="min-h-[34px] px-2.5 py-1 text-foreground border border-border-hairline hover:border-foreground bg-surface hover:bg-foreground hover:text-background inline-flex items-center gap-1 font-semibold touch-tactile active:scale-95 transition-all rounded-none uppercase text-[9.5px]"
                        >
                          <span>Pinjam Buku</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </RevealOnScroll>
          )}

          {/* Author Colophon (hidden in Zen mode) */}
          {!isZenMode && (
            <RevealOnScroll variant="cinematic" delayMs={100}>
              <AuthorCard author={article.author} />
            </RevealOnScroll>
          )}

          {/* Community Discussion / Comments (hidden in Zen mode) */}
          {!isZenMode && (
            <div ref={commentsRef} className="pt-6">
              <RevealOnScroll variant="cinematic" delayMs={120}>
                <CommentsSection
                  articleId={article.id}
                  authorId={article.author.id}
                  initialCount={article.commentCount}
                />
              </RevealOnScroll>
            </div>
          )}
        </div>

        {/* Related Articles Section (hidden in Zen mode) */}
        {!isZenMode && (
          <RevealOnScroll variant="cinematic" delayMs={100}>
            <RelatedArticles articles={related} category={article.category} />
          </RevealOnScroll>
        )}
      </main>

      {/* Mobile Floating Reader Controls (Sticky thumb-accessible mini-pill) */}
      {!isZenMode && showMobileReaderPill && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 sm:hidden bg-background/95 backdrop-blur-md border-2 border-foreground px-3 py-1.5 flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            type="button"
            onClick={() => setTextScale(nextScale[textScale])}
            className="px-2 py-1 border border-border-hairline bg-surface text-foreground font-mono text-[10px] font-bold uppercase active:scale-95 touch-tactile flex items-center gap-1 cursor-pointer"
            title="Ubah ukuran huruf"
          >
            <span>Aa</span>
            <span className="text-[9px] text-muted">{scaleLabel[textScale]}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsZenMode(true)}
            className="px-2 py-1 border border-border-hairline bg-surface text-foreground font-mono text-[10px] font-bold uppercase active:scale-95 touch-tactile cursor-pointer"
            title="Mode fokus membaca"
          >
            Fokus
          </button>

          <button
            type="button"
            onClick={scrollToComments}
            className="px-2 py-1 border border-border-hairline bg-surface text-foreground font-mono text-[10px] font-bold uppercase active:scale-95 touch-tactile flex items-center gap-1 cursor-pointer"
            title="Lihat komentar warga"
          >
            <span>Respon</span>
            {article.commentCount > 0 && <span className="text-muted">({article.commentCount})</span>}
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="p-1 border border-foreground bg-foreground text-background font-mono text-[10px] font-bold uppercase active:scale-95 touch-tactile flex items-center justify-center min-w-[28px] cursor-pointer"
            title="Bagikan naskah ke WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!isZenMode && (
        <RevealOnScroll variant="fade" delayMs={60}>
          <Footer />
        </RevealOnScroll>
      )}
    </div>
  );
}
