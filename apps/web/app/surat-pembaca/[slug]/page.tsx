'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomLoader } from '@/components/ui/custom-loader';
import { CommentsSection } from '@/components/comments/comments-section';
import { apiClient } from '@/lib/api';
import { LetterDetail } from '@perpusjal/types';
import { ArrowLeft, User, Calendar, MessageSquare, Info } from 'lucide-react';

export default function LetterDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [letter, setLetter] = React.useState<LetterDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadLetter = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await apiClient<{ data: LetterDetail }>(`/letters/${slug}`);

    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data) {
      setLetter(res.data.data);
    }
  }, [slug]);

  React.useEffect(() => {
    loadLetter();
  }, [loadLetter]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-12">
          <CustomLoader size="lg" label="MEMBUKA LEMBAR SURAT WARGA..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-20 text-center space-y-6">
          <div className="border-2 border-foreground p-12 bg-surface space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              KODE // 404
            </span>
            <h1 className="font-serif text-3xl font-normal text-foreground">Surat Tidak Ditemukan</h1>
            <p className="font-sans text-sm text-muted max-w-md mx-auto">
              {error || 'Surat pembaca yang Anda cari tidak tersedia dalam arsip atau telah ditarik.'}
            </p>
            <div className="pt-4">
              <Link
                href="/surat-pembaca"
                className="font-mono text-xs uppercase tracking-wider text-foreground underline underline-offset-4"
              >
                &larr; Kembali ke Kolom Surat Pembaca
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Navigation */}
        <div>
          <Link
            href="/surat-pembaca"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kolom Surat Pembaca</span>
          </Link>
        </div>

        {/* Article Sheet */}
        <article className="space-y-8">
          <header className="border-b-2 border-foreground pb-6 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
              <span>FORUM OPINI WARGA</span>
              <span>// SURAT RESMI</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
              {letter.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 font-mono text-xs text-muted border-t border-border-hairline">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-foreground" />
                  Oleh: {letter.displayName}
                </span>
                {letter.isAnonymous && (
                  <span className="px-2 py-0.5 border border-border-hairline text-[10px] uppercase">
                    Anonim
                  </span>
                )}
              </div>

              {letter.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Diterbitkan pada{' '}
                    {new Date(letter.publishedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Letter Body */}
          <div className="font-serif text-base sm:text-lg leading-relaxed text-foreground whitespace-pre-line space-y-6">
            {letter.content}
          </div>

          {/* Editorial Disclaimer */}
          <div className="p-4 bg-surface-muted border-l-2 border-foreground flex items-start gap-3 text-xs font-sans text-muted leading-relaxed">
            <Info className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
            <p>
              Surat pembaca ini mencerminkan opini pribadi penulisnya dan telah melalui penyelarasan
              bahasa oleh kurator redaksi Perpusjal Blora tanpa mengubah substansi asli pikiran penulis.
            </p>
          </div>
        </article>

        {/* Community Discussion / Comments */}
        <CommentsSection letterId={letter.id} initialCount={letter.commentCount} />
      </main>

      <Footer />
    </div>
  );
}
