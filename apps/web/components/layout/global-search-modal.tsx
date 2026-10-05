'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { SearchResultsData, SearchBookItem, SearchArticleItem } from '@perpusjal/types';
import {
  Search,
  BookOpen,
  FileText,
  Calendar,
  Compass,
  ArrowRight,
  X,
  Clock,
  MapPin,
  CornerDownLeft,
  Sparkles,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [query, setQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'all' | 'buku' | 'artikel'>('all');
  const [results, setResults] = React.useState<SearchResultsData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Focus input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(null);
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle global keyboard shortcut: Cmd+K / Ctrl+K and '/' to open, Esc to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent, but if needed:
          // trigger parent open
        }
      }

      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced live search
  React.useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: trimmed,
          type: activeTab,
          perPage: '6',
        });
        const res = await apiClient<any>(`/search?${params.toString()}`);
        if (res.data) {
          const payload = res.data.articles ? res.data : res.data.data;
          if (payload) {
            setResults(payload as SearchResultsData);
            setSelectedIndex(0);
          }
        }
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  if (!isOpen) return null;

  const booksList = results?.books.items || [];
  const articlesList = results?.articles.items || [];
  const hasResults = booksList.length > 0 || articlesList.length > 0;
  const isQuerying = query.trim().length >= 2;

  // Flattened items for keyboard Arrow Up / Down navigation
  const flatItems: Array<{ type: 'book' | 'article'; slug: string }> = [
    ...booksList.map((b) => ({ type: 'book' as const, slug: `/buku/${b.slug}` })),
    ...articlesList.map((a) => ({ type: 'article' as const, slug: `/artikel/${a.slug}` })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % flatItems.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems.length > 0 && flatItems[selectedIndex]) {
        onClose();
        router.push(flatItems[selectedIndex].slug);
      } else if (query.trim()) {
        onClose();
        router.push(`/cari?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian Global Perpustakaan Jalanan Blora"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-2xl bg-surface border-2 border-foreground rounded-none overflow-hidden font-mono animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Top Header & Search Bar */}
        <div className="p-3 sm:p-4 border-b-2 border-foreground bg-background flex items-center gap-3">
          <Search className="w-5 h-5 text-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari buku, artikel, penulis, topik, atau arsip... (Esc untuk tutup)"
            className="w-full bg-transparent text-sm sm:text-base font-sans text-foreground placeholder:text-muted focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
              title="Bersihkan kata kunci"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 border border-border-hairline hover:border-foreground text-[10px] uppercase font-bold text-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Filter Tabs Strip */}
        <div className="px-4 py-2 bg-surface-muted/60 border-b border-border-hairline flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-2.5 py-1 border transition-colors cursor-pointer',
                activeTab === 'all'
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-surface text-muted border-border hover:border-foreground hover:text-foreground'
              )}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('buku')}
              className={cn(
                'px-2.5 py-1 border transition-colors cursor-pointer',
                activeTab === 'buku'
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-surface text-muted border-border hover:border-foreground hover:text-foreground'
              )}
            >
              Buku {results ? `(${results.books.total})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('artikel')}
              className={cn(
                'px-2.5 py-1 border transition-colors cursor-pointer',
                activeTab === 'artikel'
                  ? 'bg-foreground text-background border-foreground font-bold'
                  : 'bg-surface text-muted border-border hover:border-foreground hover:text-foreground'
              )}
            >
              Artikel {results ? `(${results.articles.total})` : ''}
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-1.5 text-muted text-[10px] uppercase animate-pulse">
              <span className="w-2 h-2 bg-foreground inline-block" />
              <span>Mencari arsip...</span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* STATE 1: Empty Query - Pintas Navigasi & Kata Kunci Populer */}
          {!isQuerying && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-widest block mb-2 font-bold">
                  PINTAS DIREKTORI PUBLIK:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelect('/buku')}
                    className="p-2.5 border border-border-hairline bg-surface hover:border-foreground hover:bg-surface-muted transition-colors flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-foreground" />
                      <div>
                        <span className="font-bold text-foreground block">Katalog Koleksi Buku</span>
                        <span className="text-[10px] text-muted font-sans">Semua naskah terpal bebas pinjam</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelect('/artikel')}
                    className="p-2.5 border border-border-hairline bg-surface hover:border-foreground hover:bg-surface-muted transition-colors flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-foreground" />
                      <div>
                        <span className="font-bold text-foreground block">Artikel &amp; Tulisan Warga</span>
                        <span className="text-[10px] text-muted font-sans">Esai sosial, kritik, &amp; warta lapak</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelect('/kegiatan')}
                    className="p-2.5 border border-border-hairline bg-surface hover:border-foreground hover:bg-surface-muted transition-colors flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-foreground" />
                      <div>
                        <span className="font-bold text-foreground block">Agenda &amp; Lapak Terpal</span>
                        <span className="text-[10px] text-muted font-sans">Jadwal Minggu CFD Alun-Alun Blora</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelect('/cara-meminjam')}
                    className="p-2.5 border border-border-hairline bg-surface hover:border-foreground hover:bg-surface-muted transition-colors flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-foreground" />
                      <div>
                        <span className="font-bold text-foreground block">Cara Meminjam Buku</span>
                        <span className="text-[10px] text-muted font-sans">Pedoman nol denda tanpa uang jaminan</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>

              {/* Rekomendasi Kata Kunci */}
              <div className="pt-2 border-t border-border-hairline">
                <span className="text-[10px] text-muted uppercase tracking-widest block mb-2 font-bold">
                  KATA KUNCI POPULER BLORA:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['Pramoedya', 'Sedulur Sikep', 'Samin Surosentiko', 'Hutan Jati', 'Sastra', 'Pedagogi', 'Zine'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="px-2.5 py-1 border border-border-hairline bg-surface-muted/50 hover:border-foreground text-foreground text-[11px] transition-colors cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Has Results */}
          {isQuerying && hasResults && (
            <div className="space-y-5">
              {/* BUKU SECTION */}
              {booksList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-1 text-[10px] uppercase font-bold tracking-wider text-muted">
                    <span className="flex items-center gap-1 text-foreground">
                      <BookOpen className="w-3.5 h-3.5" />
                      KOLEKSI BUKU ({results?.books.total})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelect(`/buku?q=${encodeURIComponent(query)}`)}
                      className="hover:underline hover:text-foreground"
                    >
                      Buka di Katalog &rarr;
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {booksList.map((book, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <div
                          key={book.id}
                          onClick={() => handleSelect(`/buku/${book.slug}`)}
                          className={cn(
                            'p-2.5 border transition-all flex items-center justify-between gap-3 cursor-pointer',
                            isSelected
                              ? 'border-foreground bg-surface-muted'
                              : 'border-border-hairline bg-surface hover:border-foreground hover:bg-surface-muted/50'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-12 bg-background border border-border-hairline shrink-0 flex items-center justify-center overflow-hidden">
                              {book.coverImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-muted" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-serif font-bold text-xs sm:text-sm text-foreground truncate uppercase">
                                {book.title}
                              </h4>
                              <p className="font-mono text-[10px] text-muted truncate">
                                Karya: <strong className="text-foreground">{book.author}</strong>
                                {book.category ? ` • [${book.category.name}]` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border border-foreground bg-foreground text-background font-bold hidden sm:inline-block">
                              BACA
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-muted" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ARTIKEL SECTION */}
              {articlesList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-1 text-[10px] uppercase font-bold tracking-wider text-muted">
                    <span className="flex items-center gap-1 text-foreground">
                      <FileText className="w-3.5 h-3.5" />
                      ARTIKEL &amp; TULISAN ({results?.articles.total})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelect(`/artikel?q=${encodeURIComponent(query)}`)}
                      className="hover:underline hover:text-foreground"
                    >
                      Buka di Indeks &rarr;
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {articlesList.map((article, idx) => {
                      const itemFlatIndex = booksList.length + idx;
                      const isSelected = selectedIndex === itemFlatIndex;
                      return (
                        <div
                          key={article.id}
                          onClick={() => handleSelect(`/artikel/${article.slug}`)}
                          className={cn(
                            'p-2.5 border transition-all flex items-center justify-between gap-3 cursor-pointer',
                            isSelected
                              ? 'border-foreground bg-surface-muted'
                              : 'border-border-hairline bg-surface hover:border-foreground hover:bg-surface-muted/50'
                          )}
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                              <span className="px-1.5 py-0.2 bg-foreground text-background font-bold uppercase text-[9px]">
                                {article.category.name}
                              </span>
                              <span>Penulis: {article.author.name}</span>
                              {article.readingTime && <span>• {article.readingTime} mnt baca</span>}
                            </div>
                            <h4 className="font-serif font-bold text-xs sm:text-sm text-foreground truncate">
                              {article.title}
                            </h4>
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE 3: No Results */}
          {isQuerying && !loading && !hasResults && (
            <div className="p-8 text-center border border-dashed border-border-hairline bg-surface-muted/30 space-y-2">
              <p className="text-xs text-muted uppercase tracking-widest">[ HASIL NIHIL ]</p>
              <h3 className="font-serif text-base text-foreground font-bold">
                Tidak ada koleksi atau artikel yang cocok dengan &ldquo;{query}&rdquo;
              </h3>
              <p className="font-serif text-xs text-muted max-w-md mx-auto">
                Coba gunakan kata kunci yang lebih umum, periksa ejaan judul, atau usulkan judul buku kepada relawan lapak.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelect(`/cari?q=${encodeURIComponent(query)}`)}
                  className="px-3 py-1.5 border border-foreground bg-foreground text-background font-mono text-xs uppercase font-bold"
                >
                  Cari di Halaman Lengkap
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-3 bg-surface-muted border-t border-border-hairline flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted">
          <div className="hidden sm:flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 border border-border-hairline bg-surface font-mono">↑↓</kbd>
              <span>Pilih</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 border border-border-hairline bg-surface font-mono">↵</kbd>
              <span>Buka</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 border border-border-hairline bg-surface font-mono">Esc</kbd>
              <span>Tutup</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleSelect(`/cari?q=${encodeURIComponent(query)}`)}
            className="ml-auto font-bold uppercase tracking-wider text-foreground hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Seluruh Hasil Pencarian</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
