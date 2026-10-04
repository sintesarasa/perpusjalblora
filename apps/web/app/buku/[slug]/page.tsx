import * as React from 'react';
import type { Metadata } from 'next';
import { apiClient } from '@/lib/api';
import { BookDetail } from '@perpusjal/types';
import { BookDetailClient } from './book-detail-client';
import { CustomLoader } from '@/components/ui/custom-loader';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await apiClient<BookDetail>(`/books/${slug}`);
    const book = res.data;

    if (!book) {
      return {
        title: 'Buku Tidak Ditemukan',
        description: 'Buku yang Anda cari tidak tersedia di katalog Perpustakaan Jalanan Blora.',
      };
    }

    const title = `${book.title} — ${book.author}`;
    const description =
      book.description ||
      `Katalog koleksi pustaka "${book.title}" karya ${book.author} di Perpustakaan Jalanan Blora. Pinjam gratis tanpa denda.`;
    const images = book.coverImage ? [book.coverImage] : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'book',
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images,
      },
    };
  } catch {
    return {
      title: 'Katalog Buku',
    };
  }
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <CustomLoader size="md" label="MEMUAT KATALOG BUKU..." />
        </div>
      }
    >
      <BookDetailClient slug={slug} />
    </React.Suspense>
  );
}
