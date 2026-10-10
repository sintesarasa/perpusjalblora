import * as React from 'react';
import type { Metadata } from 'next';
import { apiClient } from '@/lib/api';
import { ArticleDetail } from '@perpusjal/types';
import { ArticleDetailClient } from './article-detail-client';
import { CustomLoader } from '@/components/ui/custom-loader';
import { JsonLd } from '@/components/seo/json-ld';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://perpusjalblora.org';

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
        description: 'Naskah atau tulisan warga yang kamu cari tidak tersedia di arsip Perpustakaan Jalanan Blora.',
      };
    }

    const title = `${article.title} — Suara Warga Perpusjal Blora`;
    const cleanExcerpt = article.excerpt
      ? article.excerpt.replace(/\s+/g, ' ').trim()
      : article.subtitle
      ? article.subtitle.replace(/\s+/g, ' ').trim()
      : `Baca tulisan "${article.title}" karya ${article.author?.name || 'Warga'} di Perpustakaan Jalanan Blora. Ruang literasi independen dan warta rakyat.`;

    const description = cleanExcerpt.slice(0, 160);

    const images = article.coverImage
      ? [
          {
            url: article.coverImage,
            width: 1200,
            height: 630,
            alt: `Sampul naskah ${article.title}`,
          },
        ]
      : undefined;

    return {
      title,
      description,
      alternates: {
        canonical: `/artikel/${slug}`,
      },
      openGraph: {
        title,
        description,
        type: 'article',
        url: `${appUrl}/artikel/${slug}`,
        siteName: 'Perpustakaan Jalanan Blora',
        locale: 'id_ID',
        publishedTime: article.publishedAt || undefined,
        modifiedTime: (article as { updatedAt?: string }).updatedAt || article.publishedAt || undefined,
        section: article.category?.name || 'Warta Warga',
        tags: article.tags?.map((t) => t.name),
        authors: article.author?.name ? [article.author.name] : undefined,
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: article.coverImage ? [article.coverImage] : undefined,
      },
    };
  } catch {
    return {
      title: 'Warta & Esai Warga',
      description: 'Ruang publikasi esai sastra, catatan refleksi lapak, dan warta warga Perpustakaan Jalanan Blora.',
    };
  }
}

export default async function ArticleDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;

  let article: ArticleDetail | null = null;
  try {
    const previewQuery = preview ? `?preview=${preview}` : '';
    const res = await apiClient<ArticleDetail>(`/articles/${slug}${previewQuery}`);
    article = res.data || null;
  } catch {
    // Graceful fallback
  }

  const articleStructuredData = article
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': ['Article', 'BlogPosting'],
            '@id': `${appUrl}/artikel/${slug}#article`,
            headline: article.title,
            description: article.excerpt || article.subtitle || undefined,
            image: article.coverImage || undefined,
            datePublished: article.publishedAt || undefined,
            dateModified: (article as { updatedAt?: string }).updatedAt || article.publishedAt || undefined,
            inLanguage: 'id-ID',
            articleSection: article.category?.name || 'Warta Warga',
            keywords: article.tags?.map((t) => t.name).join(', ') || undefined,
            author: {
              '@type': 'Person',
              name: article.author?.name || 'Warga Blora',
              url: article.author?.username
                ? `${appUrl}/warga/${article.author.username}`
                : undefined,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Perpustakaan Jalanan Blora',
              url: appUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${appUrl}/logo-perpus.svg`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${appUrl}/artikel/${slug}`,
            },
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${appUrl}/artikel/${slug}#breadcrumb`,
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
                name: 'Warta Warga',
                item: `${appUrl}/artikel`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: article.title,
                item: `${appUrl}/artikel/${slug}`,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {articleStructuredData && <JsonLd data={articleStructuredData} />}
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <CustomLoader size="md" label="MEMUAT LEMBARAN NASKAH..." />
          </div>
        }
      >
        <ArticleDetailClient slug={slug} previewToken={preview} />
      </React.Suspense>
    </>
  );
}
