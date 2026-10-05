import * as React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-foreground bg-surface text-foreground transition-colors print:hidden">
      {/* MAIN COMPACT EDITORIAL FOOTER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Col 1: Logo & Manifesto Statement (Left, 5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-block group" aria-label="Beranda Perpusjal Blora">
                <Logo className="h-6 sm:h-7 w-auto text-foreground group-hover:opacity-80 transition-opacity" />
              </Link>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted border-l border-border-hairline pl-3">
                Sirkulasi Bebas
              </span>
            </div>
            <p className="font-serif text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-sm">
              Gerakan literasi akar rumput di atas terpal Alun-Alun Blora. Bebas baca, bebas pinjam tanpa jaminan dan tanpa denda sepeser pun.
            </p>
            <div className="font-mono text-[10px] text-muted uppercase tracking-wider flex items-center gap-2 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-none bg-foreground inline-block" />
              <span>CFD Minggu (06.00–09.00) &bull; Basecamp (16.00–21.00)</span>
            </div>
          </div>

          {/* Col 2: Navigasi Indeks (Center, 4 cols) */}
          <div className="md:col-span-4 space-y-2.5 font-mono">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted block border-b border-border-hairline pb-1">
              INDEX PUSTAKA &amp; ARSIP
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <Link href="/buku" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Katalog Buku
              </Link>
              <Link href="/artikel" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Artikel &amp; Warta
              </Link>
              <Link href="/kegiatan" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Agenda Lapak
              </Link>
              <Link href="/cara-meminjam" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Cara Meminjam
              </Link>
              <Link href="/tulis" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Kirim Tulisan
              </Link>
              <Link href="/tentang" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Tentang Kami
              </Link>
            </div>
          </div>

          {/* Col 3: Aksi & Komunitas (Right, 3 cols) */}
          <div className="md:col-span-3 space-y-2.5 font-mono">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted block border-b border-border-hairline pb-1">
              RUANG PARTISIPASI
            </span>
            <div className="space-y-2 text-xs">
              <Link
                href="/tulis"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-foreground bg-foreground text-background font-bold uppercase tracking-wider text-[11px] hover:bg-background hover:text-foreground transition-colors cursor-pointer"
              >
                <span>+ Tulis Tulisan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <p className="font-serif text-[11px] text-muted leading-tight">
                Punya naskah, cerita, atau refleksi tentang Blora? Kirimkan tulisanmu untuk dikurasi terbuka.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT BOTTOM COPYRIGHT STRIP */}
      <div className="border-t border-border-hairline bg-surface-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between font-mono text-[10px] text-muted uppercase tracking-wider gap-2">
          <div>
            &copy; {new Date().getFullYear()} PERPUSTAKAAN JALANAN BLORA &bull; SWADAYA MURNI
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/perpusjal_blora"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground hover:underline transition-colors"
            >
              @perpusjal_blora
            </a>
            <span>&bull;</span>
            <Link href="/kebijakan-privasi" className="hover:text-foreground hover:underline transition-colors">
              Privasi
            </Link>
            <span>&bull;</span>
            <Link href="/styleguide" className="hover:text-foreground hover:underline transition-colors">
              Styleguide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
