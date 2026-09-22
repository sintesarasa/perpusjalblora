import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
        <div className="font-mono text-sm uppercase tracking-widest text-neutral-500 mb-2">
          [ KESALAHAN 404 ]
        </div>
        <h1 className="font-serif text-5xl sm:text-6xl font-black uppercase tracking-tight mb-4">
          HALAMAN TIDAK DITEMUKAN.
        </h1>
        <p className="font-serif text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-md">
          Halaman ini tidak ada. Mungkin pindah, mungkin tautan salah ketik, atau buku yang kamu cari
          sedang dipindahkan ke rak lain.
        </p>
        <Link href="/">
          <Button size="lg" variant="solid">
            KEMBALI KE BERANDA
          </Button>
        </Link>
      </main>

      <Footer />
    </div>
  );
}
