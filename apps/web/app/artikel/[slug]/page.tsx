import * as React from 'react';
import type { Metadata } from 'next';
import { apiClient } from '@/lib/api';
import { ArticleDetail } from '@perpusjal/types';
import { ArticleDetailClient } from './article-detail-client';
import { CustomLoader } from '@/components/ui/custom-loader';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const previewQuery = preview ? `?preview=${preview}` : '';

  try {
    const res = await apiClient<ArticleDetail>(`/articles/${slug}${previewQuery}`);
    const article = res.data;

    if (!article) {
      return {
        title: 'Naskah Tidak Ditemukan',
        description: 'Naskah yang Anda cari tidak tersedia di Perpustakaan Jalanan Blora.',
      };
    }

    const title = article.title;
    const description =
      article.excerpt ||
      article.subtitle ||
      `Baca catatan "${article.title}" oleh ${article.author?.name || 'Warga'} di Perpustakaan Jalanan Blora.`;
    const images = article.coverImage ? [article.coverImage] : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: article.publishedAt || undefined,
        authors: article.author?.name ? [article.author.name] : undefined,
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
      title: 'Warta & Esai',
    };
  }
}

export default async function ArticleDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;

  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <CustomLoader size="md" label="MEMUAT LEMBARAN NASKAH..." />
        </div>
      }
    >
      <ArticleDetailClient slug={slug} previewToken={preview} />
    </React.Suspense>
  );
}
