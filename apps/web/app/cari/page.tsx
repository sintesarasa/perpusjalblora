'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { SearchResultsData, SearchArticleItem, SearchBookItem } from '@perpusjal/types';
import {
  Search,
  BookOpen,
  FileText,
  Clock,
  User,
  ArrowRight,
  X,
  CornerDownRight,
  SlidersHorizontal,
} from 'lucide-react';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get('q') || '';
  const initialType = (searchParams.get('type') as 'all' | 'artikel' | 'buku') || 'all';

  const [query, setQuery] = React.useState(initialQ);
  const [activeType, setActiveType] = React.useState<'all' | 'artikel' | 'buku'>(initialType);
  const [results, setResults] = React.useState<SearchResultsData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Pressing '/' anywhere focuses search input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const executeSearch = React.useCallback(
    async (q: string, type: 'all' | 'artikel' | 'buku') => {
      const trimmed = q.trim();
      if (!trimmed || trimmed.length < 2) {
        setResults(null);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      const params = new URLSearchParams({
        q: trimmed,
        type,
        perPage: '20',
      });

      const res = await apiClient<{ data: SearchResultsData }>(`/search?${params.toString()}`);

      setLoading(false);

      if (res.data) {
        setResults(res.data.data);
      }
    },
    []
  );

  // Auto-search if initial query parameter exists
  React.useEffect(() => {
    if (initialQ && initialQ.length >= 2) {
      executeSearch(initialQ, initialType);
    }
  }, [initialQ, initialType, executeSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    router.replace(`/cari?q=${encodeURIComponent(trimmed)}&type=${activeType}`);
    executeSearch(trimmed, activeType);
  };

  const handleTypeChange = (newType: 'all' | 'artikel' | 'buku') => {
    setActiveType(newType);
    if (query.trim()) {
      router.replace(`/cari?q=${encodeURIComponent(query.trim())}&type=${newType}`);
      executeSearch(query.trim(), newType);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setResults(null);
    setHasSearched(false);
    router.replace('/cari');
    inputRef.current?.focus();
  };

  const totalArticles = results?.articles.total || 0;
  const totalBooks = results?.books.total || 0;
  const grandTotal = totalArticles + totalBooks;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Page Title & Gazette Header */}
        <div className="border-b-2 border-foreground pb-4 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-muted uppercase tracking-widest">
            <span>KATALOG PENCARIAN TERPADU</span>
            <span>// PUSTAKA & ARSIP WARTA</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Penelusuran Arsip
          </h1>
          <p className="font-sans text-sm text-muted max-w-2xl">
            Cari esai, warta kegiatan, liputan komunitas, serta katalog buku fisik Perpustakaan Jalanan Blora.
          </p>
        </div>

        {/* Stark Editorial Search Bar */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-stretch border-2 border-foreground bg-surface">
            <div className="flex items-center px-4 text-foreground">
              <Search className="w-5 h-5" />
            </div>

            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik judul, pengarang, topik bacaan, atau tagar... (Tekan / untuk fokus)"
              className="flex-1 py-3.5 sm:py-4 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted/60 focus:outline-none rounded-none"
            />

            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="px-3 text-muted hover:text-foreground flex items-center transition-colors"
                aria-label="Hapus kata kunci"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="px-6 sm:px-8 bg-foreground text-background font-mono text-xs sm:text-sm uppercase tracking-widest font-bold hover:bg-foreground/90 transition-colors flex items-center gap-2 rounded-none"
            >
              <span>CARI</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          </div>

          {/* Filter Type Tabs */}
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider overflow-x-auto pb-1">
            <span className="text-muted flex items-center gap-1 mr-2 text-[11px]">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Kategori:
            </span>

            <button
              type="button"
              onClick={() => handleTypeChange('all')}
              className={`px-3 py-1.5 border transition-colors ${
                activeType === 'all'
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
              }`}
            >
              Semua Koleksi {results && `(${grandTotal})`}
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('artikel')}
              className={`px-3 py-1.5 border transition-colors flex items-center gap-1.5 ${
                activeType === 'artikel'
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Artikel Warta {results && `(${totalArticles})`}
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('buku')}
              className={`px-3 py-1.5 border transition-colors flex items-center gap-1.5 ${
                activeType === 'buku'
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Buku Fisik {results && `(${totalBooks})`}
            </button>
          </div>
        </form>

        {/* Results Area */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <CustomLoader size="lg" label="MENELUSURI ARSIP & KATALOG..." />
          </div>
        ) : !hasSearched ? (
          /* Initial Empty State / Suggestions */
          <div className="border border-border-hairline bg-surface p-8 sm:p-12 text-center space-y-4">
            <div className="w-12 h-12 border-2 border-foreground mx-auto flex items-center justify-center font-mono font-bold">
              /
            </div>
            <h2 className="font-serif text-xl font-normal text-foreground">
              Mulai Penelusuran Pengetahuan
            </h2>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              Gunakan bilah pencarian di atas untuk menjelajahi warta komunitas, esai kritis, resensi,
              serta inventaris perpustakaan Blora.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-2 font-mono text-xs text-muted">
              <span className="uppercase text-[10px] self-center mr-1">Saran Topik:</span>
              {['Literasi', 'Sejarah Blora', 'Pramoedya', 'Filsafat', 'Buku Anak', 'Zine'].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      executeSearch(tag, activeType);
                    }}
                    className="px-2.5 py-1 border border-border-hairline hover:border-foreground text-foreground transition-colors"
                  >
                    #{tag}
                  </button>
                )
              )}
            </div>
          </div>
        ) : grandTotal === 0 ? (
          /* No Results Found State */
          <div className="border-2 border-foreground bg-surface p-8 sm:p-12 text-center space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              STATUS // HASIL NIHIL
            </span>
            <h2 className="font-serif text-2xl font-normal text-foreground">
              Tidak Ada Hasil Ditemukan
            </h2>
            <p className="font-sans text-sm text-muted max-w-md mx-auto">
              Tidak ada arsip artikel ataupun koleksi buku yang cocok dengan kata kunci{' '}
              <strong className="text-foreground">&ldquo;{query}&rdquo;</strong>.
            </p>
            <p className="font-mono text-xs text-muted">
              Coba gunakan istilah yang lebih umum, periksa kemungkinan salah ketik, atau cari nama penulis.
            </p>
          </div>
        ) : (
          /* Results Content */
          <div className="space-y-12">
            {/* Stats bar */}
            <div className="font-mono text-xs text-muted uppercase tracking-wider border-b border-border-hairline pb-2 flex items-center justify-between">
              <span>
                Ditemukan <strong className="text-foreground">{grandTotal}</strong> hasil untuk &ldquo;{query}&rdquo;
              </span>
              <span>
                {totalArticles} ARTIKEL // {totalBooks} BUKU
              </span>
            </div>

            {/* Articles Results Section */}
            {(activeType === 'all' || activeType === 'artikel') && totalArticles > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-foreground" />
                    <h2 className="font-mono text-sm uppercase tracking-widest font-bold text-foreground">
                      ARTIKEL & OPINI WARTA ({totalArticles})
                    </h2>
                  </div>
                </div>

                <div className="divide-y divide-border-hairline border-t border-b border-border-hairline">
                  {results?.articles.items.map((art) => (
                    <article key={art.id} className="py-5 sm:py-6 group hover:bg-surface-muted/30 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 mb-2 font-mono text-xs text-muted">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 border border-border-hairline font-bold uppercase text-[10px] text-foreground">
                            {art.category.name}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {art.author.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          {art.readingTime && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {art.readingTime} mnt
                            </span>
                          )}
                          {art.publishedAt && (
                            <span>
                              {new Date(art.publishedAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link href={`/artikel/${art.slug}`} className="block group">
                        <h3 className="font-serif text-xl sm:text-2xl font-bold group-hover:underline underline-offset-4 text-foreground">
                          {art.title}
                        </h3>
                        {art.subtitle && (
                          <p className="font-serif italic text-sm text-foreground/80 mt-1">
                            {art.subtitle}
                          </p>
                        )}
                        {art.excerpt && (
                          <p className="font-sans text-sm text-muted line-clamp-2 mt-2 leading-relaxed">
                            {art.excerpt}
                          </p>
                        )}
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Books Results Section */}
            {(activeType === 'all' || activeType === 'buku') && totalBooks > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-foreground" />
                    <h2 className="font-mono text-sm uppercase tracking-widest font-bold text-foreground">
                      KATALOG BUKU PERPUSTAKAAN ({totalBooks})
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results?.books.items.map((book) => (
                    <div
                      key={book.id}
                      className="border border-border-hairline bg-surface p-4 flex gap-4 hover:border-foreground transition-colors group"
                    >
                      {/* Monogram / Book Cover placeholder */}
                      <div className="w-20 h-28 bg-surface-muted border border-border-hairline shrink-0 flex flex-col items-center justify-center p-2 text-center">
                        <BookOpen className="w-6 h-6 text-muted mb-1" />
                        <span className="font-mono text-[9px] uppercase tracking-tighter text-muted">
                          PERPUSJAL
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted uppercase">
                            <span>{book.category?.name || 'UMUM'}</span>
                            {book.isbn && <span>ISBN: {book.isbn}</span>}
                          </div>
                          <h3 className="font-serif text-base font-bold text-foreground mt-1 group-hover:underline underline-offset-2">
                            {book.title}
                          </h3>
                          <p className="font-sans text-xs text-muted mt-0.5">
                            Karya: <strong className="text-foreground">{book.author}</strong>
                          </p>
                          {book.synopsis && (
                            <p className="font-sans text-xs text-muted line-clamp-2 mt-1.5 leading-relaxed">
                              {book.synopsis}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 mt-2 border-t border-border-hairline flex items-center justify-between text-xs font-mono">
                          <span className="text-[10px] uppercase text-muted">KOLEKSI FISIK</span>
                          <span className="font-bold text-foreground group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            DETAIL &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <CustomLoader size="md" label="MEMBUKA HALAMAN PENCARIAN..." />
        </div>
      }
    >
      <SearchPageContent />
    </React.Suspense>
  );
}
