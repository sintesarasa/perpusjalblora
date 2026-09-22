import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

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

export const metadata: Metadata = {
  title: 'PERPUSJAL BLORA — Perpustakaan Jalanan Blora',
  description:
    'Ruang literasi independen akar rumput, katalog buku fisik, peminjaman swadaya, dan publikasi tulisan warga Blora. Membaca dan Berbahagia.',
  keywords: ['Perpustakaan Jalanan', 'Blora', 'Literasi', 'Pinjam Buku', 'Komunitas'],
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
