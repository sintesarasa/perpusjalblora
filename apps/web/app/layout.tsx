import * as React from 'react';
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationsProvider } from '@/contexts/notifications-context';
import { NotificationToast } from '@/components/notifications/notification-toast';
import { ToastContainer } from '@/components/ui/toast';
import { PageProgressBar } from '@/components/ui/page-progress-bar';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

import { JsonLd } from '@/components/seo/json-ld';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://perpusjalblora.org';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'PERPUSJAL — Perpustakaan Jalanan Blora | Membaca dan Berbahagia',
    template: '%s | Perpustakaan Jalanan Blora',
  },
  description:
    'Perpustakaan jalanan dan ruang baca rakyat di Alun-Alun Blora. Pinjam buku fisik gratis tanpa jaminan uang, tanpa denda. Baca dan terbitkan tulisan warga.',
  keywords: [
    'Perpustakaan Jalanan Blora',
    'Perpusjal Blora',
    'pinjam buku di Blora',
    'perpustakaan umum Blora',
    'komunitas literasi Blora',
    'lapak baca Alun-Alun Blora',
    'buku Pramoedya Ananta Toer Blora',
    'Sedulur Sikep Samin Blora',
    'katalog buku fisik Blora',
    'tulisan warga Blora',
    'ruang baca merdeka',
    'baca buku gratis Blora',
  ],
  authors: [{ name: 'Perpustakaan Jalanan Blora', url: appUrl }],
  creator: 'Perpustakaan Jalanan Blora',
  publisher: 'Perpustakaan Jalanan Blora',
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PERPUSJAL — Perpustakaan Jalanan Blora | Membaca dan Berbahagia',
    description:
      'Perpustakaan jalanan dan ruang baca rakyat di Alun-Alun Blora. Pinjam buku fisik gratis tanpa jaminan uang, tanpa denda. Baca dan terbitkan tulisan warga.',
    url: appUrl,
    siteName: 'Perpustakaan Jalanan Blora',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PERPUSJAL — Perpustakaan Jalanan Blora | Membaca dan Berbahagia',
    description:
      'Perpustakaan jalanan dan ruang baca rakyat di Alun-Alun Blora. Pinjam buku fisik gratis tanpa jaminan uang, tanpa denda. Baca dan terbitkan tulisan warga.',
    creator: '@perpusjal_blora',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  other: {
    'geo.region': 'ID-JT',
    'geo.placename': 'Blora',
    'geo.position': '-6.9697;111.4178',
    ICBM: '-6.9697, 111.4178',
  },
};

const globalStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Library', 'LocalBusiness'],
      '@id': `${appUrl}/#organization`,
      name: 'Perpustakaan Jalanan Blora',
      alternateName: ['Perpusjal Blora', 'Perpusjal'],
      url: appUrl,
      logo: `${appUrl}/logo-perpus.svg`,
      description:
        'Ruang baca rakyat dan perpustakaan jalanan swadaya di Alun-Alun Blora. Peminjaman buku fisik gratis tanpa jaminan uang dan tanpa denda.',
      slogan: 'Membaca dan Berbahagia',
      priceRange: 'Free',
      isAccessibleForFree: true,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Alun-Alun Blora, Jl. Pemuda',
        addressLocality: 'Blora',
        addressRegion: 'Jawa Tengah',
        postalCode: '58219',
        addressCountry: 'ID',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -6.9697,
        longitude: 111.4178,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday'],
          opens: '06:00',
          closes: '09:30',
          description: 'Lapak Terpal Car Free Day (CFD) Alun-Alun Blora',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '16:00',
          closes: '21:00',
          description: 'Basecamp Kolektif Jl. Pemuda Blora',
        },
      ],
      sameAs: [
        'https://instagram.com/perpusjal_blora',
        'https://github.com/perpusjalblora',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${appUrl}/#website`,
      url: appUrl,
      name: 'Perpustakaan Jalanan Blora',
      alternateName: 'Perpusjal Blora',
      description: 'Katalog buku fisik dan ruang publikasi warta warga Blora.',
      inLanguage: 'id-ID',
      publisher: {
        '@id': `${appUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${appUrl}/cari?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <JsonLd data={globalStructuredData} />
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased min-h-screen flex flex-col editorial-paper-bg selection:bg-foreground selection:text-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NotificationsProvider>
              <React.Suspense fallback={null}>
                <PageProgressBar />
              </React.Suspense>
              {children}
              <NotificationToast />
              <ToastContainer />
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
