import * as React from 'react';
import type { Metadata } from 'next';
import { apiClient } from '@/lib/api';
import { LetterDetail } from '@perpusjal/types';
import { LetterDetailClient } from './letter-detail-client';
import { CustomLoader } from '@/components/ui/custom-loader';
import { JsonLd } from '@/components/seo/json-ld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://perpusjalblora.org';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await apiClient<{ data: LetterDetail }>(`/letters/${slug}`);
    const letter = res.data?.data;

    if (!letter) {
      return {
        title: 'Surat Pembaca Tidak Ditemukan',
        description: 'Surat pembaca warga yang kamu cari tidak tersedia dalam arsip Perpustakaan Jalanan Blora.',
      };
    }

    const title = `${letter.title} — Surat Pembaca Perpusjal Blora`;
    const cleanContent = letter.content.replace(/\s+/g, ' ').trim();
    const description = `"${cleanContent.slice(0, 110)}..." — Oleh ${letter.displayName} di Mimbar Warga Perpustakaan Jalanan Blora.`.slice(0, 160);

    return {
      title,
      description,
      alternates: {
        canonical: `/surat-pembaca/${slug}`,
      },
      openGraph: {
        title,
        description,
        type: 'article',
        url: `${appUrl}/surat-pembaca/${slug}`,
        siteName: 'Perpustakaan Jalanan Blora',
        locale: 'id_ID',
        publishedTime: letter.publishedAt || undefined,
        authors: [letter.displayName],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return {
      title: 'Mimbar & Surat Pembaca Warga',
      description: 'Kolom suara, surat kritik, tanggapan bernas, dan refleksi warga untuk Perpustakaan Jalanan Blora.',
    };
  }
}

export default async function LetterDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let letter: LetterDetail | null = null;

  try {
    const res = await apiClient<{ data: LetterDetail }>(`/letters/${slug}`);
    letter = res.data?.data || null;
  } catch {
    // Fallback during build
  }

  const letterStructuredData = letter
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'OpinionNewsArticle',
            '@id': `${appUrl}/surat-pembaca/${slug}#letter`,
            headline: letter.title,
            datePublished: letter.publishedAt || undefined,
            author: {
              '@type': 'Person',
              name: letter.displayName,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Perpustakaan Jalanan Blora',
              url: appUrl,
            },
            articleBody: letter.content,
            inLanguage: 'id-ID',
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${appUrl}/surat-pembaca/${slug}#breadcrumb`,
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
                name: 'Surat Pembaca',
                item: `${appUrl}/surat-pembaca`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: letter.title,
                item: `${appUrl}/surat-pembaca/${slug}`,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {letterStructuredData && <JsonLd data={letterStructuredData} />}
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <CustomLoader size="md" label="MEMBUKA LEMBAR SURAT WARGA..." />
          </div>
        }
      >
        <LetterDetailClient slug={slug} />
      </React.Suspense>
    </>
  );
}
