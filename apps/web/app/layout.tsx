import * as React from 'react';
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationsProvider } from '@/contexts/notifications-context';
import { NotificationToast } from '@/components/notifications/notification-toast';
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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://perpusjalblora.org';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'PERPUSJAL BLORA — Perpustakaan Jalanan Blora',
    template: '%s | PERPUSJAL BLORA',
  },
  description:
    'Ruang literasi independen akar rumput, katalog buku fisik, peminjaman swadaya, dan publikasi tulisan warga Blora. Membaca dan Berbahagia.',
  keywords: ['Perpustakaan Jalanan', 'Blora', 'Literasi', 'Pinjam Buku', 'Komunitas', 'Koleksi Buku'],
  authors: [{ name: 'Perpustakaan Jalanan Blora' }],
  openGraph: {
    title: 'PERPUSJAL BLORA — Perpustakaan Jalanan Blora',
    description:
      'Ruang literasi independen akar rumput, katalog buku fisik, peminjaman swadaya, dan publikasi tulisan warga Blora. Membaca dan Berbahagia.',
    url: appUrl,
    siteName: 'Perpustakaan Jalanan Blora',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PERPUSJAL BLORA — Perpustakaan Jalanan Blora',
    description:
      'Ruang literasi independen akar rumput, katalog buku fisik, peminjaman swadaya, dan publikasi tulisan warga Blora. Membaca dan Berbahagia.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
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
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
