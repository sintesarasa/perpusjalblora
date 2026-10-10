import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://perpusjalblora.org';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/buku',
          '/buku/*',
          '/artikel',
          '/artikel/*',
          '/kegiatan',
          '/kegiatan/*',
          '/cara-meminjam',
          '/tentang',
          '/cari',
          '/surat-pembaca',
          '/surat-pembaca/*',
          '/kontributor',
          '/warga/*',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/dashboard',
          '/dashboard/*',
          '/tulis',
          '/tulis/*',
          '/api',
          '/api/*',
          '/verifikasi',
          '/reset-password',
          '/lupa-password',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/uploads/*', '/icon.svg', '/logo-perpus.svg', '/opengraph-image'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
