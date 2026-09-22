import * as React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { BrandStamp } from '@/components/ui/brand-stamp';

export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-foreground bg-surface text-foreground transition-colors">
      {/* 1. TOP COLOPHON TITLE STRIP */}
      <div className="border-b border-border-hairline px-4 sm:px-8 py-3 text-[10px] font-mono uppercase tracking-ultra text-muted max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <span>[ KOLOFON &amp; ARSIP DISTRIBUSI // PERPUSTAKAAN JALANAN BLORA ]</span>
        </div>
        <div>SWADAYA • AKAR RUMPUT • TERBUKA UNTUK PUBLIK</div>
      </div>

      {/* 2. MAIN EDITORIAL INFORMATION GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 border-b border-border-hairline">
        {/* Left: Statement of Independence */}
        <div className="lg:col-span-5 space-y-5">
          <Link href="/" className="inline-block">
            <Logo className="h-8 w-auto text-foreground" />
          </Link>
          <div className="font-serif text-2xl font-bold tracking-tight uppercase">
            MEMBACA DAN BERBAHAGIA.
          </div>
          <p className="font-serif text-sm sm:text-base text-foreground/80 leading-relaxed max-w-md">
            Ruang literasi independen di Kabupaten Blora. Kami meminjamkan buku tanpa denda rupiah,
            menggelar lapak baca di jalanan umum, dan menyediakan wadah bagi setiap warga untuk
            menulis esai, resensi, dan opini kritis.
          </p>
          <div className="pt-2">
            <BrandStamp edition="EDISI KOLEKTIF" year="2026" />
          </div>
        </div>

        {/* Center: Jadwal & Koordinat Lapak (Tabular Ledger Format) */}
        <div className="lg:col-span-4 space-y-3 font-mono">
          <div className="text-xs uppercase tracking-widest font-bold pb-1 border-b border-foreground">
            JADWAL SERAH TERIMA &amp; LAPAK
          </div>
          <div className="text-xs space-y-4 text-foreground/90">
            <div className="border-l-2 border-foreground pl-3 py-0.5">
              <span className="font-bold block uppercase tracking-wider">MINGGU PAGI — CAR FREE DAY</span>
              <span className="text-muted block text-[11px]">06.00 – 09.00 WIB</span>
              <span className="block text-foreground/80">Alun-Alun Blora (Depan Pendopo)</span>
            </div>
            <div className="border-l-2 border-foreground pl-3 py-0.5">
              <span className="font-bold block uppercase tracking-wider">BASECAMP BACA &amp; KOLEKSI</span>
              <span className="text-muted block text-[11px]">Setiap Hari, 16.00 – 21.00 WIB</span>
              <span className="block text-foreground/80">Sekretariat Perpusjal Blora</span>
            </div>
          </div>
        </div>

        {/* Right: Directory Index */}
        <div className="lg:col-span-3 space-y-3 font-mono">
          <div className="text-xs uppercase tracking-widest font-bold pb-1 border-b border-foreground">
            DIREKTORI HALAMAN
          </div>
          <ul className="text-xs space-y-2 uppercase tracking-wider">
            <li>
              <Link href="/artikel" className="hover:underline">
                [ 01 ] Arsip Tulisan
              </Link>
            </li>
            <li>
              <Link href="/buku" className="hover:underline">
                [ 02 ] Katalog Buku Fisik
              </Link>
            </li>
            <li>
              <Link href="/kegiatan" className="hover:underline">
                [ 03 ] Agenda Kegiatan
              </Link>
            </li>
            <li>
              <Link href="/cara-meminjam" className="hover:underline">
                [ 04 ] Panduan Peminjaman
              </Link>
            </li>
            <li>
              <Link href="/surat-pembaca" className="hover:underline">
                [ 05 ] Surat Pembaca
              </Link>
            </li>
            <li>
              <Link href="/tentang" className="hover:underline">
                [ 06 ] Profil &amp; Sejarah
              </Link>
            </li>
            <li>
              <Link href="/kebijakan-privasi" className="hover:underline">
                [ 07 ] Kebijakan Privasi
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. BOTTOM TICKER FOOTNOTE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono tracking-widest text-muted uppercase gap-3">
        <div>© {new Date().getFullYear()} PERPUSTAKAAN JALANAN BLORA — GERAKAN LITERASI SWADAYA</div>
        <div className="flex items-center space-x-6">
          <Link href="/styleguide" className="hover:text-foreground underline">
            [ STYLEGUIDE ARSIP ]
          </Link>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            INSTAGRAM: @PERPUSJAL_BLORA
          </a>
        </div>
      </div>
    </footer>
  );
}
