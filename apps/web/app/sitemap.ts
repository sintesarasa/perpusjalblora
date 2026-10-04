import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://perpusjal.org';
  const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:4000/api/v1';

  let bookRoutes: MetadataRoute.Sitemap = [];
  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const [booksRes, articlesRes] = await Promise.all([
      fetch(`${apiUrl}/books?perPage=100`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/articles?perPage=100`, { next: { revalidate: 3600 } }),
    ]);

    if (booksRes.ok) {
      const booksJson = await booksRes.json();
      const books = Array.isArray(booksJson.data) ? booksJson.data : [];
      bookRoutes = books.map((b: { slug: string; updatedAt?: string }) => ({
        url: `${baseUrl}/buku/${b.slug}`,
        lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }

    if (articlesRes.ok) {
      const articlesJson = await articlesRes.json();
      const articles = Array.isArray(articlesJson.data) ? articlesJson.data : [];
      articleRoutes = articles.map((a: { slug: string; updatedAt?: string; publishedAt?: string }) => ({
        url: `${baseUrl}/artikel/${a.slug}`,
        lastModified: a.updatedAt ? new Date(a.updatedAt) : a.publishedAt ? new Date(a.publishedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch {
    // Graceful fallback to static routes if API is not reachable during build
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/buku`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/artikel`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/kegiatan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/surat-pembaca`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/cara-meminjam`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/tentang`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  return [...staticRoutes, ...bookRoutes, ...articleRoutes];
}
