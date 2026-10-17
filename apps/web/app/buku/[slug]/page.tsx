import * as React from 'react';
import type { Metadata } from 'next';
import { apiClient } from '@/lib/api';
import { BookDetail } from '@perpusjal/types';
import { BookDetailClient } from './book-detail-client';
import { CustomLoader } from '@/components/ui/custom-loader';
import { JsonLd } from '@/components/seo/json-ld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://perpusjalblora.org';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await apiClient<BookDetail>(`/books/${slug}`, {
      next: { revalidate: 60, tags: ['books', `book-${slug}`] },
    });
    const book = res.data;

    if (!book) {
      return {
        title: 'Buku Tidak Ditemukan',
        description: 'Buku yang kamu cari tidak tersedia di katalog fisik Perpustakaan Jalanan Blora.',
      };
    }

    const title = `Buku ${book.title} karya ${book.author} — Pinjam Gratis di Perpusjal Blora`;
    const availabilityText =
      book.availableCopies > 0
        ? `Tersedia ${book.availableCopies} eksemplar di rak.`
        : 'Sedang dipinjam kawan lain (antrean dibuka).';

    const rawDesc = book.description
      ? book.description.replace(/\s+/g, ' ').trim()
      : `Pustaka terpilih ${book.title} karya ${book.author}.`;

    // Compose concise 150-160 character description
    const description = `${rawDesc.slice(0, 95)}... ${availabilityText} Pinjam gratis tanpa denda di Alun-Alun Blora.`.slice(0, 160);

    const images = book.coverImage
      ? [
          {
            url: book.coverImage,
            width: 1200,
            height: 630,
            alt: `Sampul buku ${book.title} karya ${book.author}`,
          },
        ]
      : undefined;

    return {
      title,
      description,
      alternates: {
        canonical: `/buku/${slug}`,
      },
      openGraph: {
        title,
        description,
        type: 'book',
        url: `${appUrl}/buku/${slug}`,
        siteName: 'Perpustakaan Jalanan Blora',
        locale: 'id_ID',
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: book.coverImage ? [book.coverImage] : undefined,
      },
    };
  } catch {
    return {
      title: 'Katalog Koleksi Buku',
      description: 'Katalog koleksi buku fisik Perpustakaan Jalanan Blora. Pinjam gratis tanpa jaminan dan tanpa denda.',
    };
  }
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let book: BookDetail | null = null;
  try {
    const res = await apiClient<BookDetail>(`/books/${slug}`, {
      next: { revalidate: 60, tags: ['books', `book-${slug}`] },
    });
    book = res.data || null;
  } catch {
    // Fallback if API is offline or during build time
  }

  const bookStructuredData = book
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Book',
            '@id': `${appUrl}/buku/${slug}#book`,
            name: book.title,
            author: {
              '@type': 'Person',
              name: book.author,
            },
            isbn: book.isbn || undefined,
            publisher: book.publisher
              ? {
                  '@type': 'Organization',
                  name: book.publisher,
                }
              : undefined,
            datePublished: book.publicationYear ? `${book.publicationYear}` : undefined,
            bookFormat: 'https://schema.org/Paperback',
            inLanguage: book.language === 'ID' ? 'id-ID' : 'jv-ID',
            numberOfPages: book.pages || undefined,
            description: book.description || undefined,
            image: book.coverImage || undefined,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'IDR',
              availability:
                book.availableCopies > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              seller: {
                '@type': 'Library',
                name: 'Perpustakaan Jalanan Blora',
                url: appUrl,
              },
            },
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${appUrl}/buku/${slug}#breadcrumb`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Beranda',
                item: appUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Katalog Pustaka',
                item: `${appUrl}/buku`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: book.title,
                item: `${appUrl}/buku/${slug}`,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {bookStructuredData && <JsonLd data={bookStructuredData} />}
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <CustomLoader size="md" label="MEMUAT KATALOG BUKU..." />
          </div>
        }
      >
        <BookDetailClient slug={slug} />
      </React.Suspense>
    </>
  );
}
