'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookItem } from '@perpusjal/types';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Search,
} from 'lucide-react';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';

export interface OpenBookstandShowcaseProps {
  books: BookItem[];
  loading?: boolean;
}

export function OpenBookstandShowcase({ books, loading = false }: OpenBookstandShowcaseProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');

  // Extract unique categories from books list
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.category?.name) set.add(b.category.name);
    });
    return Array.from(set).slice(0, 5);
  }, [books]);

  // Filter books according to selected category
  const filteredBooks = React.useMemo(() => {
    if (selectedCategory === 'ALL') return books;
    return books.filter((b) => b.category?.name === selectedCategory);
  }, [books, selectedCategory]);

  // Spotlight book: First featured book or the first book in the list
  const spotlightBook = React.useMemo(() => {
    if (filteredBooks.length === 0) return null;
    const featured = filteredBooks.find((b) => b.isFeatured);
    return featured || filteredBooks[0];
  }, [filteredBooks]);

  // The remaining books for the open shelf (up to 6 books)
  const shelfBooks = React.useMemo(() => {
    if (!spotlightBook) return [];
    return filteredBooks.filter((b) => b.id !== spotlightBook.id).slice(0, 6);
  }, [filteredBooks, spotlightBook]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buku?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/buku');
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* ========================================================================= */}
      {/* 1. SECTION MASTHEAD & GAZETTE RUBRIC INDEX                                */}
      {/* ========================================================================= */}
      <div className="border-b-2 border-foreground pb-6 sm:pb-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5 sm:space-y-3 max-w-3xl">
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
              [ SEKSI KOLEKSI // RAK &amp; TERPAL ]
            </div>
            <h2 className="font-serif text-[28px] sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground leading-[1.12]">
              Pustaka di Rak &amp; Hamparan Terpal
            </h2>
            <p className="font-serif text-sm sm:text-base md:text-lg text-foreground/85 leading-relaxed">
              Koleksi pustaka swadaya yang terbuka bebas bagi siapa saja. Siap dibaca bersila di Alun-Alun Blora
              setiap Minggu pagi atau dipinjam pulang dengan kartu warga digital.
            </p>
          </div>

          {/* Quick Search & Catalog Link */}
          <div className="w-full md:w-auto shrink-0 flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul buku... [↵]"
                className="w-full h-10 pl-8 pr-3 bg-surface border-2 border-foreground font-mono text-xs text-foreground placeholder:text-muted focus:outline-none transition-colors rounded-none"
              />
            </form>
            <Link
              href="/buku"
              className="h-10 px-4 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 rounded-none border-2 border-foreground"
            >
              <span>SEMUA BUKU</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>
        </div>

        {/* Gazette Rubric Index Bar */}
        {!loading && books.length > 0 && (
          <div className="pt-3 border-t border-border-hairline flex items-center gap-2 overflow-x-auto scrollbar-none font-mono text-xs">
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted shrink-0 mr-1">
              RUBRIK RAK:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={cn(
                'px-3 py-1 uppercase tracking-wider transition-colors shrink-0 rounded-none cursor-pointer text-[11px]',
                selectedCategory === 'ALL'
                  ? 'bg-foreground text-background font-bold'
                  : 'text-muted hover:text-foreground hover:bg-surface-muted/50'
              )}
            >
              [ SEMUA KOLEKSI ({books.length}) ]
            </button>
            {categories.map((cat) => (
              <React.Fragment key={cat}>
                <span className="text-border-hairline shrink-0">/</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-3 py-1 uppercase tracking-wider transition-colors shrink-0 rounded-none cursor-pointer text-[11px]',
                    selectedCategory === cat
                      ? 'bg-foreground text-background font-bold'
                      : 'text-muted hover:text-foreground hover:bg-surface-muted/50'
                  )}
                >
                  [ {cat} ]
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. CONTENT AREA: THE LEAD DOSSIER & OPEN LEDGER SHELF                     */}
      {/* ========================================================================= */}
      {loading ? (
        <OpenBookstandSkeleton />
      ) : filteredBooks.length === 0 ? (
        <div className="p-12 border-2 border-foreground bg-surface text-center font-mono space-y-3">
          <BookOpen className="w-8 h-8 mx-auto text-muted" />
          <h3 className="font-serif text-lg font-bold">Belum Ada Buku di Rubrik Ini</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            Buku untuk rubrik ini sedang dalam proses inventarisasi atau sedang dipinjam warga.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className="px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider mt-2 border-2 border-foreground"
          >
            Kembali ke Semua Koleksi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* ========================================================================= */}
          {/* LEFT COLUMN (5 COLS): THE LEAD DOSSIER (TAJUK PUSTAKA UTAMA)              */}
          {/* ========================================================================= */}
          {spotlightBook && (
            <div className="lg:col-span-5 flex flex-col h-full">
              <RevealOnScroll variant="cinematic" className="flex flex-col h-full flex-1 space-y-0">
                {/* Kop Tajuk Solid Hitam Pekat */}
                <div className="bg-foreground text-background font-mono text-xs font-bold px-4 py-2.5 uppercase tracking-widest flex items-center justify-between shrink-0">
                  <span>[ TAJUK PUSTAKA // SOROTAN MINGGU INI ]</span>
                  <span className="text-[10px] opacity-80">{spotlightBook.shelfLocation || 'RAK-CFD'}</span>
                </div>

                {/* Dossier Container with stark 2px border, stretches flush to bottom */}
                <div className="border-2 border-foreground border-t-0 bg-surface p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  {/* Top Segment: Archival Book Plate & Editorial Details */}
                  <div className="space-y-4">
                    {/* Archival Book Plate Container */}
                    <div className="border border-border-hairline p-3 sm:p-4 bg-background/50">
                      <div className="flex items-center justify-between text-[9px] font-mono text-muted uppercase tracking-widest pb-2 border-b border-border-hairline mb-3">
                        <span>PLAT ARSIP: {spotlightBook.shelfLocation || 'RAK-CFD'}</span>
                        <span className="font-bold text-foreground">
                          {spotlightBook.publicationYear ? `TH. ${spotlightBook.publicationYear}` : 'EDISI LENGKAP'}
                        </span>
                      </div>

                      <Link
                        href={`/buku/${spotlightBook.slug || spotlightBook.id}`}
                        className="block relative aspect-[2/3] w-full max-w-[220px] sm:max-w-[240px] mx-auto overflow-hidden border-2 border-foreground bg-surface group/spotlight transition-transform duration-200 hover:-translate-y-1"
                      >
                        {spotlightBook.coverImage ? (
                          <>
                            {/* Realistic Spine Fold Shadow */}
                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-10 pointer-events-none" />
                            <div className="absolute left-3 top-0 bottom-0 w-px bg-white/30 z-10 pointer-events-none" />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={spotlightBook.coverImage}
                              alt={spotlightBook.title}
                              className="w-full h-full object-cover group-hover/spotlight:scale-105 transition-transform duration-500"
                            />
                          </>
                        ) : (
                          <div className="w-full h-full p-4 flex flex-col justify-between bg-[#f4f4ee] dark:bg-[#151515] text-foreground select-none relative">
                            <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-foreground border-r border-white/20" />
                            <div className="pl-2 font-mono text-[8px] uppercase tracking-widest text-muted truncate">
                              PERPUSJAL BLORA &bull; {spotlightBook.category?.name || 'Pustaka'}
                            </div>
                            <div className="pl-2 space-y-1 my-auto">
                              <BookOpen className="w-7 h-7 text-foreground/40 mb-1" />
                              <h4 className="font-serif font-black text-base uppercase leading-snug line-clamp-3 text-foreground">
                                {spotlightBook.title}
                              </h4>
                              <p className="font-mono text-[10px] text-muted italic line-clamp-1">
                                {spotlightBook.author}
                              </p>
                            </div>
                            <div className="pl-2 font-mono text-[8px] text-muted uppercase tracking-widest border-t border-border-hairline pt-1">
                              LOKASI: {spotlightBook.shelfLocation || 'RAK-CFD'}
                            </div>
                          </div>
                        )}
                      </Link>
                    </div>

                    {/* Editorial Details & Critique Note */}
                    <div className="space-y-2.5">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-foreground">{spotlightBook.category?.name || 'Koleksi Lapak'}</span>
                          <span>&bull;</span>
                          <span className="truncate">KARYA {spotlightBook.author}</span>
                        </div>
                        {spotlightBook.isFeatured && (
                          <span className="px-1.5 py-0.5 bg-foreground text-background font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">
                            ★ REKOMENDASI KURATOR
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-2xl sm:text-3xl font-black text-foreground leading-tight hover:underline">
                        <Link href={`/buku/${spotlightBook.slug || spotlightBook.id}`}>
                          {spotlightBook.title}
                        </Link>
                      </h3>

                      <blockquote className="border-l-4 border-foreground pl-3.5 py-2 font-serif text-xs sm:text-sm text-foreground/90 leading-relaxed italic bg-surface-muted/40">
                        &ldquo;
                        {spotlightBook.curatorNote ||
                          spotlightBook.description ||
                          'Buku rujukan penting yang kerap menjadi pemantik diskusi hangat di hamparan terpal Minggu pagi Alun-Alun Blora.'}
                        &rdquo;
                      </blockquote>
                    </div>
                  </div>

                  {/* Bottom Segment: Pinned flush to bottom via mt-auto */}
                  <div className="pt-4 border-t border-border-hairline space-y-3 mt-4 sm:mt-6">
                    {/* Stark Monochrome Status Strip */}
                    <div className="flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted text-[10px] uppercase">STATUS SISTEM:</span>
                        <span
                          className={cn(
                            'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                            spotlightBook.availability === 'AVAILABLE'
                              ? 'bg-foreground text-background'
                              : 'border border-border-hairline text-muted'
                          )}
                        >
                          {spotlightBook.availability === 'AVAILABLE' ? '● TERSEDIA DI LAPAK' : '○ SEDANG DIPINJAM'}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted font-bold">
                        {spotlightBook.availableCopies || 1} EKSEMPLAR
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/buku/${spotlightBook.slug || spotlightBook.id}`}
                        className="flex-1 h-11 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 active:scale-95 transition-all inline-flex items-center justify-center gap-2 border-2 border-foreground touch-tactile"
                      >
                        <span>PINJAM PUSTAKA INI</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <a
                        href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                          `Halo Pegiat Perpusjal Blora, saya ingin bertanya tentang buku "${spotlightBook.title}" karya ${spotlightBook.author} yang ada di lapak.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-11 px-3 border-2 border-foreground bg-surface hover:bg-surface-muted text-foreground font-mono text-xs font-bold uppercase tracking-wider active:scale-95 transition-all inline-flex items-center justify-center shrink-0 touch-tactile"
                        title="Tanya via WhatsApp"
                      >
                        <span>WA</span>
                      </a>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          )}

          {/* ========================================================================= */}
          {/* RIGHT COLUMN (7 COLS): THE OPEN LEDGER SHELF (KATALOG HAMPARAN TERPAL)   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col h-full justify-between space-y-5">
            <div className="flex items-center justify-between pb-2.5 border-b-2 border-foreground text-[10px] font-mono uppercase tracking-widest font-bold shrink-0">
              <div className="flex items-center gap-2">
                <span>[ KATALOG HAMPARAN TERPAL // BUKU LAINNYA ]</span>
                <span className="sm:hidden text-[9px] text-muted font-normal">✦ Geser &rarr;</span>
              </div>
              <span className="text-muted">{shelfBooks.length} DARI {filteredBooks.length} TERPILIH</span>
            </div>

            {/* The Open Shelf Grid: Horizontal snap-scroll on mobile, 3 cols on tablet/desktop */}
            <div className="flex sm:grid sm:grid-cols-3 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory gap-4 sm:gap-x-6 sm:gap-y-8 pb-3 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {shelfBooks.map((book, idx) => {
                const bookSlug = book.slug || book.id;
                const isAvailable = book.availability === 'AVAILABLE';
                const shelf = book.shelfLocation || 'RAK-CFD';

                return (
                  <div
                    key={book.id || idx}
                    className="w-[165px] sm:w-auto shrink-0 snap-start flex flex-col justify-between h-full space-y-2.5 group"
                  >
                    {/* Floating Book Cover (Aspect 2/3, Crisp Flat Contrast with realistic spine) */}
                    <Link
                      href={`/buku/${bookSlug}`}
                      className="block relative aspect-[2/3] w-full overflow-hidden border border-border-hairline group-hover:border-foreground bg-surface transition-transform duration-200 group-hover:-translate-y-1 active:scale-95 touch-tactile"
                    >
                      {book.coverImage ? (
                        <>
                          {/* Realistic Spine Fold Shadow */}
                          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-10 pointer-events-none" />
                          <div className="absolute left-2.5 top-0 bottom-0 w-px bg-white/25 z-10 pointer-events-none" />

                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </>
                      ) : (
                        /* Broadsheet Fallback Jacket */
                        <div className="w-full h-full p-3 sm:p-4 flex flex-col justify-between bg-[#f4f4ee] dark:bg-[#151515] text-foreground select-none relative">
                          <div className="absolute left-0 top-0 bottom-0 w-2 bg-foreground border-r border-white/20" />
                          <div className="pl-1.5 font-mono text-[8px] uppercase tracking-widest text-muted truncate">
                            {book.category?.name || 'Pustaka'}
                          </div>
                          <div className="pl-1.5 space-y-1 my-auto">
                            <BookOpen className="w-5 h-5 text-foreground/30 mb-1" />
                            <h4 className="font-serif font-black text-xs uppercase leading-tight line-clamp-3 text-foreground">
                              {book.title}
                            </h4>
                            <p className="font-mono text-[9.5px] text-muted italic line-clamp-1">
                              {book.author}
                            </p>
                          </div>
                          <div className="pl-1.5 font-mono text-[8px] text-muted uppercase tracking-wider border-t border-border-hairline pt-1">
                            {shelf} &bull; {book.publicationYear || 2024}
                          </div>
                        </div>
                      )}
                    </Link>

                    {/* Tactile Shelf Line Beneath Book */}
                    <div className="w-full h-px bg-border-hairline group-hover:bg-foreground transition-colors" />

                    {/* Book Metadata & Title (Stark Broadsheet Typography) */}
                    <div className="space-y-1 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-wider text-muted truncate">
                          {book.category?.name || 'Pustaka Lapak'}
                        </div>

                        <h4 className="font-serif font-bold text-sm sm:text-base text-foreground leading-snug group-hover:underline line-clamp-2 transition-colors mt-0.5">
                          <Link href={`/buku/${bookSlug}`}>{book.title}</Link>
                        </h4>

                        <p className="font-mono text-[11px] text-muted truncate italic mt-0.5">
                          {book.author}
                        </p>
                      </div>

                      {/* Status & Quick Borrow Link (Pure Monochrome) */}
                      <div className="pt-2 border-t border-border-hairline/60 flex items-center justify-between font-mono text-[10px] mt-1.5">
                        <span
                          className={cn(
                            'font-bold tracking-wider uppercase text-[9px]',
                            isAvailable ? 'text-foreground' : 'text-muted line-through'
                          )}
                        >
                          {isAvailable ? '● TERSEDIA' : '○ DIPINJAM'}
                        </span>

                        <Link
                          href={`/buku/${bookSlug}`}
                          className="font-bold uppercase tracking-wider text-foreground hover:underline inline-flex items-center gap-0.5 text-[9.5px] touch-tactile active:scale-90"
                        >
                          <span>PINJAM</span>
                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CLEAN EDITORIAL FOOTER STRIP (HILANGKAN ALAMAT & JAM CFD REDUNDAN)      */}
      {/* ========================================================================= */}
      <div className="pt-6 border-t-2 border-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-muted uppercase tracking-wider text-[11px]">
          <span className="font-bold text-foreground">[ ARSIP PUSTAKA PERPUSJAL ]</span>
          <span>&bull;</span>
          <span>{books.length}+ JUDUL TERDATA SECARA SWADAYA</span>
        </div>

        <Link
          href="/buku"
          className="font-bold text-foreground hover:underline inline-flex items-center gap-1.5 uppercase tracking-widest text-xs"
        >
          <span>BUKA KATALOG LENGKAP BUKU</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Clean Broadsheet Skeleton Loader
 */
function OpenBookstandSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch animate-pulse">
      {/* Left Spotlight Skeleton */}
      <div className="lg:col-span-5 flex flex-col h-full">
        <div className="h-9 bg-foreground/10 border-2 border-foreground/30 w-full shrink-0" />
        <div className="border-2 border-foreground/30 border-t-0 p-6 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="aspect-[2/3] w-full max-w-[240px] bg-surface-muted mx-auto border border-border-hairline" />
            <div className="h-3 bg-surface-muted w-1/4" />
            <div className="h-7 bg-surface-muted w-3/4" />
            <div className="h-16 bg-surface-muted w-full border-l-4 border-foreground/30" />
          </div>
          <div className="h-10 bg-surface-muted w-full mt-4" />
        </div>
      </div>

      {/* Right Shelf Skeleton */}
      <div className="lg:col-span-7 flex flex-col h-full justify-between space-y-5">
        <div className="h-7 bg-surface-muted w-1/3 border-b-2 border-foreground/30 shrink-0" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 flex-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] w-full bg-surface-muted border border-border-hairline" />
              <div className="h-px bg-border-hairline" />
              <div className="h-2.5 bg-surface-muted w-1/3" />
              <div className="h-4 bg-surface-muted w-5/6" />
              <div className="h-3 bg-surface-muted w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
