'use client';

import * as React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ArrowUpRight, ArrowUp, Heart, BookOpen, MessageCircle, MapPin, Clock, Sparkles } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/contact';

interface LiteraryQuote {
  quote: string;
  author: string;
  source: string;
}

const LITERARY_QUOTES: LiteraryQuote[] = [
  {
    quote: 'Tahu kau mengapa aku sayangi kau lebih dari siapa pun? Karena kau menulis. Suaramu takkan padam ditelan angin, akan abadi, sampai jauh, jauh di kemudian hari.',
    author: 'Pramoedya Ananta Toer',
    source: 'Anak Semua Bangsa (1980)',
  },
  {
    quote: 'Kalian boleh maju dalam pelajaran, mungkin mencapai deretan gelar, tapi tanpa mencintai sastra, kalian tinggal hanya hewan yang pandai.',
    author: 'Pramoedya Ananta Toer',
    source: 'Bumi Manusia (1980)',
  },
  {
    quote: 'Ana rupa ana rega, ana dina ana upa. Sakabehe dumadi saka pambudidaya kang jujur lan welas asih.',
    author: 'Pitutur Sedulur Sikep Samin',
    source: 'Ajaran Samin Surosentiko, Klopoduwur Blora',
  },
  {
    quote: 'Ingatlah! Bahwa dari dalam kubur, suara saya akan lebih keras daripada dari atas bumi.',
    author: 'Tan Malaka',
    source: 'Dari Pendjara ke Pendjara (1948)',
  },
  {
    quote: 'Buku yang hanya disimpan di dalam lemari kaca adalah buku yang kesepian. Buku harus berkelana dari tangan ke tangan, menumbuhkan pikiran baru.',
    author: 'Catatan Lapak Perdana',
    source: 'Arsip Kolektif Perpusjal Blora (2017)',
  },
  {
    quote: 'Bila orang berani berpikir, dia harus berani mempertanggungjawabkan pikirannya dalam kata dan laku nyata.',
    author: 'Mochtar Lubis',
    source: 'Manusia Indonesia (1977)',
  },
];

export function Footer() {
  const [quoteIdx, setQuoteIdx] = React.useState(0);

  // Pick deterministic quote per day or random on mount
  React.useEffect(() => {
    const today = new Date();
    const dayIndex = (today.getFullYear() + today.getMonth() + today.getDate()) % LITERARY_QUOTES.length;
    setQuoteIdx(dayIndex);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentQuote = LITERARY_QUOTES[quoteIdx];
  const donateBookWaUrl = getWhatsAppUrl('Halo relawan Perpusjal Blora, saya bermaksud menyumbangkan buku fisik untuk lapak sirkulasi warga.');

  return (
    <footer className="mt-auto border-t-2 border-foreground bg-surface text-foreground transition-colors print:hidden pb-24 md:pb-8">
      {/* 1. TOP EDITORIAL TICKER / QUOTE OF THE DAY */}
      <div className="border-b border-border-hairline bg-surface-muted/30 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5 max-w-3xl">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted border border-border-hairline px-1.5 py-0.5 shrink-0 bg-surface">
              KUTIPAN HARI INI
            </span>
            <p className="font-serif italic text-foreground/85 text-xs sm:text-sm leading-relaxed">
              &ldquo;{currentQuote.quote}&rdquo; &mdash;{' '}
              <strong className="font-sans font-semibold text-foreground not-italic text-xs">
                {currentQuote.author}
              </strong>{' '}
              <span className="text-muted text-[11px]">({currentQuote.source})</span>
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted hover:text-foreground border border-border-hairline hover:border-foreground px-2.5 py-1 transition-colors cursor-pointer touch-tactile"
            title="Kembali ke atas halaman"
          >
            <span>Ke Atas</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. MAIN EDITORIAL BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Col 1: Logo & Manifesto Statement (Left, 5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-block group" aria-label="Beranda Perpusjal Blora">
                <Logo className="h-6 sm:h-7 w-auto text-foreground group-hover:opacity-80 transition-opacity" />
              </Link>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted border-l border-border-hairline pl-3">
                Sirkulasi Bebas &bull; 2026
              </span>
            </div>

            <p className="font-serif text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-md">
              Gerakan literasi akar rumput di atas selembar terpal Alun-Alun Blora. Bebas baca di tempat, bebas pinjam tanpa syarat fotokopi KTP, tanpa jaminan uang, dan tanpa denda sepeser pun.
            </p>

            {/* Schedule & Location Card */}
            <div className="p-3.5 border border-border-hairline bg-surface-muted/40 font-mono text-[10px] sm:text-[11px] space-y-1.5 max-w-md">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <MapPin className="w-3.5 h-3.5 text-foreground shrink-0" />
                <span>CFD Alun-Alun Blora: Setiap Minggu (06.00–09.30 WIB)</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Clock className="w-3.5 h-3.5 text-muted shrink-0" />
                <span>Basecamp Omah Talang Bocor / Jl. Pemuda (16.00–21.00 WIB)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigasi Indeks (Center, 4 cols) */}
          <div className="md:col-span-4 space-y-3 font-mono">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted block border-b border-border-hairline pb-1.5">
              INDEX PUSTAKA &amp; ARSIP
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <Link href="/buku" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Katalog Buku
              </Link>
              <Link href="/cara-meminjam" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Cara Pinjam (Nol Denda)
              </Link>
              <Link href="/artikel" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Artikel &amp; Warta
              </Link>
              <Link href="/tentang" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Tentang Kolektif
              </Link>
              <Link href="/kegiatan" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Agenda Lapak CFD
              </Link>
              <Link href="/surat-pembaca" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Surat Pembaca
              </Link>
              <Link href="/cari" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Pencarian Universal
              </Link>
              <Link href="/kontributor" className="text-foreground/80 hover:text-foreground hover:underline transition-colors">
                Jejaring Pegiat
              </Link>
            </div>
          </div>

          {/* Col 3: Partisipasi & Donasi Buku (Right, 3 cols) */}
          <div className="md:col-span-3 space-y-3 font-mono">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted block border-b border-border-hairline pb-1.5">
              RUANG PARTISIPASI
            </span>
            <div className="space-y-3">
              <a
                href={donateBookWaUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-between px-3 py-2 border border-foreground bg-foreground text-background font-bold uppercase tracking-wider text-[11px] hover:bg-background hover:text-foreground transition-colors cursor-pointer touch-tactile"
              >
                <span>Donasi Buku Fisik</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/dashboard/tulisan/tulis"
                className="w-full inline-flex items-center justify-between px-3 py-2 border border-border-hairline bg-surface text-foreground font-bold uppercase tracking-wider text-[11px] hover:border-foreground transition-colors cursor-pointer touch-tactile"
              >
                <span>+ Kirim Tulisan Warga</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <p className="font-serif text-[11px] text-muted leading-relaxed">
                Punya buku tak terpakai atau naskah resensi sastra Blora? Seluruh sumbangsih dirawat terbuka oleh meja relawan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. COMPACT BOTTOM STRIP */}
      <div className="border-t border-border-hairline bg-surface-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between font-mono text-[9px] sm:text-[10px] text-muted uppercase tracking-wider gap-2">
          <div className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} PERPUSTAKAAN JALANAN BLORA &bull; SWADAYA MURNI RAKYAT
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
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
