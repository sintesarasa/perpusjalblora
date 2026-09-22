'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { RichTextRenderer } from '@/components/articles/rich-text-renderer';
import { CustomLoader } from '@/components/ui/custom-loader';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { apiClient } from '@/lib/api';

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  updatedAt: string;
}

export default function CMSPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [page, setPage] = React.useState<PageData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadPage() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);

      const res = await apiClient<PageData>(`/pages/${slug}`);

      if (res.error) {
        setError(res.error.message || 'Halaman tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      if (res.data) {
        setPage(res.data);
      }
      setIsLoading(false);
    }

    loadPage();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-12">
          <CustomLoader size="lg" label="MEMBUKA HALAMAN ARSIP..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-20 text-center space-y-6">
          <div className="border-2 border-foreground p-12 bg-surface space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              DOKUMEN TIDAK DITEMUKAN
            </span>
            <h1 className="font-serif text-3xl font-normal">Halaman Tidak Ditemukan</h1>
            <p className="font-sans text-sm text-muted max-w-md mx-auto">
              Halaman yang kamu cari belum dipublikasikan atau alamat tautan keliru.
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="font-mono text-xs uppercase tracking-wider text-foreground underline underline-offset-4"
              >
                &larr; Kembali ke Beranda
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(page.updatedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 space-y-8">
        <div className="border-b border-foreground pb-6 space-y-4">
          <div className="flex items-center justify-between font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted">
            <span>DOKUMENTASI KOLEKTIF PERPUSJAL</span>
            <BrandStamp edition="RESMI" year="2026" className="py-0 px-2 text-[8px]" />
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight">
            {page.title}
          </h1>

          <div className="font-mono text-[10px] uppercase tracking-wider text-muted pt-2 border-t border-border-hairline">
            Terakhir diperbarui: {formattedDate}
          </div>
        </div>

        <article className="max-w-prose py-4">
          <RichTextRenderer content={page.content} withDropCap={false} />
        </article>
      </main>

      <Footer />
    </div>
  );
}
