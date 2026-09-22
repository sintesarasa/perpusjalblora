'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomLoader } from '@/components/ui/custom-loader';
import { Pagination } from '@/components/ui/pagination';
import { apiClient } from '@/lib/api';
import { BookItem, Language, BookAvailabilityStatus } from '@perpusjal/types';
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Bookmark,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface BooksApiResponse {
  data: BookItem[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

function BookCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = React.useState<BookItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState({ page: 1, perPage: 24, total: 0, totalPages: 1 });

  // Filters from URL
  const q = searchParams.get('q') || '';
  const kategori = searchParams.get('kategori') || '';
  const tersedia = searchParams.get('tersedia') === 'true';
  const bahasa = (searchParams.get('bahasa') as Language) || '';
  const sort = searchParams.get('sort') || 'terbaru';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = React.useState(q);

  const fetchBooks = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (q) queryParams.set('q', q);
    if (kategori) queryParams.set('kategori', kategori);
    if (tersedia) queryParams.set('tersedia', 'true');
    if (bahasa) queryParams.set('bahasa', bahasa);
    if (sort) queryParams.set('sort', sort);
    queryParams.set('page', page.toString());
    queryParams.set('perPage', '24');

    const res = await apiClient<BooksApiResponse>(`/books?${queryParams.toString()}`);

    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data) {
      setBooks(res.data.data || []);
      setMeta(res.data.meta || { page: 1, perPage: 24, total: 0, totalPages: 1 });
    }
  }, [q, kategori, tersedia, bahasa, sort, page]);

  React.useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    // Reset to page 1 on filter changes if page wasn't explicitly changed
    if (!('page' in newParams)) {
      next.delete('page');
    }
    router.push(`/buku?${next.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() || null });
  };

  const getStatusBadge = (availability: BookAvailabilityStatus, isBorrowable: boolean) => {
    if (!isBorrowable) {
      return (
        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border-hairline text-muted">
          BACA DI TEMPAT
        </span>
      );
    }
    switch (availability) {
      case 'AVAILABLE':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-foreground bg-surface text-foreground font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-foreground" />
            TERSEDIA
          </span>
        );
      case 'LAST_ONE':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-foreground text-background font-bold inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            TERSISA 1
          </span>
        );
      case 'BORROWED':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-dashed border-muted text-muted inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            DIPINJAM
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Gazette Masthead */}
        <div className="border-b-2 border-foreground pb-4 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-muted uppercase tracking-widest">
            <span>KATALOG PUSTAKA BLORA</span>
            <span>// INVENTARIS BUKU FISIK</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Katalog Buku Komunitas
          </h1>
          <p className="font-sans text-sm text-muted max-w-2xl leading-relaxed">
            Koleksi buku cetak, zine alternatif, karya sastra, sejarah Blora, serta naskah pemikiran kritis
            yang dapat dipinjam secara gratis di lapak jalanan dan basecamp.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 bg-surface border border-border-hairline space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari judul buku, nama pengarang, atau ISBN..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-border-hairline focus:border-foreground focus:outline-none rounded-none text-sm text-foreground placeholder:text-muted/60"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 transition-colors"
            >
              Cari Pustaka
            </button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border-hairline text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted flex items-center gap-1 text-[11px] uppercase mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter:
              </span>

              {/* Tersedia Saja Toggle */}
              <button
                type="button"
                onClick={() => updateFilters({ tersedia: tersedia ? null : 'true' })}
                className={`px-3 py-1 border transition-colors ${
                  tersedia
                    ? 'bg-foreground text-background border-foreground font-bold'
                    : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                }`}
              >
                Hanya yang Tersedia
              </button>

              {/* Bahasa Selector */}
              <select
                value={bahasa}
                onChange={(e) => updateFilters({ bahasa: e.target.value || null })}
                className="px-2.5 py-1 bg-surface border border-border-hairline text-foreground focus:outline-none rounded-none text-xs"
              >
                <option value="">Semua Bahasa</option>
                <option value="ID">Bahasa Indonesia</option>
                <option value="JV">Basa Jawa</option>
                <option value="EN">English</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-muted text-[11px] uppercase">Urutan:</span>
              <select
                value={sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="px-2.5 py-1 bg-surface border border-border-hairline text-foreground focus:outline-none rounded-none text-xs font-mono uppercase"
              >
                <option value="terbaru">Terbaru Masuk</option>
                <option value="populer">Paling Sering Dipinjam</option>
                <option value="judul">Judul (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Book Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <CustomLoader size="lg" label="MEMBUKA LEMBAR KATALOG BUKU..." />
          </div>
        ) : error ? (
          <div className="p-8 border border-foreground bg-surface-muted text-center space-y-3 font-mono text-xs">
            <p className="text-foreground">{error}</p>
            <button
              onClick={fetchBooks}
              className="px-4 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider"
            >
              Coba Lagi
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="py-16 text-center border-2 border-foreground bg-surface p-8 space-y-3">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">
              [ KATALOG KOSONG ]
            </span>
            <h2 className="font-serif text-2xl font-normal text-foreground">
              Tidak Ada Buku yang Cocok
            </h2>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              Tidak ditemukan buku yang sesuai dengan kriteria penyaringan saat ini. Coba hapus kata kunci
              atau ganti kategori.
            </p>
            <button
              type="button"
              onClick={() => router.push('/buku')}
              className="mt-2 px-4 py-1.5 border border-foreground font-mono text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <article
                  key={book.id}
                  className="border border-border-hairline bg-surface hover:border-foreground transition-all duration-150 flex flex-col justify-between group"
                >
                  <div>
                    {/* Book Cover / Monogram Placeholder */}
                    <Link href={`/buku/${book.slug}`} className="block relative overflow-hidden bg-surface-muted aspect-[3/4] border-b border-border-hairline">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full p-6 flex flex-col justify-between border-4 border-double border-border-hairline/80 bg-[#f4f4f0] dark:bg-[#141414]">
                          <div className="flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-widest">
                            <span>PERPUSJAL</span>
                            <span>{book.category.name}</span>
                          </div>

                          <div className="space-y-2 text-center py-4">
                            <BookOpen className="w-8 h-8 text-foreground/40 mx-auto" />
                            <h3 className="font-serif font-bold text-base text-foreground line-clamp-3 leading-snug">
                              {book.title}
                            </h3>
                            <p className="font-sans text-xs text-muted line-clamp-1 italic">
                              {book.author}
                            </p>
                          </div>

                          <div className="text-[9px] font-mono text-muted text-center tracking-wider">
                            BLORA LITERACY
                          </div>
                        </div>
                      )}

                      {/* Top floating badge */}
                      <div className="absolute top-2.5 right-2.5">
                        {getStatusBadge(book.availability, book.isBorrowable)}
                      </div>
                    </Link>

                    {/* Metadata body */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                        <span className="uppercase text-foreground font-bold">
                          {book.category.name}
                        </span>
                        {book.shelfLocation && (
                          <span className="inline-flex items-center gap-1 text-[10px]">
                            <MapPin className="w-3 h-3 text-muted" />
                            {book.shelfLocation}
                          </span>
                        )}
                      </div>

                      <Link href={`/buku/${book.slug}`} className="block">
                        <h2 className="font-serif text-lg font-bold text-foreground leading-snug group-hover:underline underline-offset-2 line-clamp-2">
                          {book.title}
                        </h2>
                      </Link>

                      <p className="font-sans text-xs text-muted">
                        Pengarang: <strong className="text-foreground">{book.author}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 pt-3 border-t border-border-hairline flex items-center justify-between font-mono text-xs text-muted">
                    <span className="text-[11px]">
                      {book.availableCopies}/{book.totalCopies} Ada di Rak
                    </span>

                    <Link
                      href={`/buku/${book.slug}`}
                      className="font-bold text-foreground group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-[11px] uppercase tracking-wider"
                    >
                      <span>Lihat</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="pt-8 border-t border-border-hairline flex justify-center">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  createPageUrl={(p) => {
                    const next = new URLSearchParams(searchParams.toString());
                    next.set('page', p.toString());
                    return `/buku?${next.toString()}`;
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function BookCatalogPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <CustomLoader size="md" label="MEMBUKA KATALOG BUKU..." />
        </div>
      }
    >
      <BookCatalogContent />
    </React.Suspense>
  );
}
