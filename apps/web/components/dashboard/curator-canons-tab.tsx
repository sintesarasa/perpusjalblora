'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookItem } from '@perpusjal/types';
import { apiClient } from '@/lib/api';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  Star,
  Edit3,
  ExternalLink,
  Check,
  X,
  Quote,
  ArrowRight,
  RefreshCw,
  Eye,
  Tag,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomLoader } from '@/components/ui/custom-loader';
import { DigitalStampEffect } from '@/components/circulation/digital-stamp-effect';

export const CANON_TAGS = [
  { key: 'PRAMOEDYA', label: 'PRAMOEDYA', desc: 'Sastra & Roman Perlawanan' },
  { key: 'FILSAFAT', label: 'FILSAFAT', desc: 'Sosial & Nalar Kritis (Madilog, dsb)' },
  { key: 'SAMIN', label: 'SAMIN BLORA', desc: 'Sejarah, Sedulur Sikep, Agraria' },
  { key: 'PEDAGOGI', label: 'PEDAGOGI', desc: 'Pendidikan Kritis & Fabel Rakyat' },
] as const;

export function parseCuratorCanonNote(raw?: string | null): { tag: string; quote: string } {
  if (!raw) return { tag: 'PRAMOEDYA', quote: '' };
  const match = raw.match(/^\[TAG:([A-Z0-9_\-]+)\]\s*(.*)$/s);
  if (match) {
    return {
      tag: match[1],
      quote: match[2].trim(),
    };
  }
  return { tag: 'PRAMOEDYA', quote: raw.trim() };
}

export function formatCuratorCanonNote(tag: string, quote: string): string {
  const cleanTag = tag.toUpperCase().trim() || 'PRAMOEDYA';
  return `[TAG:${cleanTag}] ${quote.trim()}`;
}

export function CuratorCanonsTab() {
  const [featuredBooks, setFeaturedBooks] = React.useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Selected item for Live Preview
  const [selectedBook, setSelectedBook] = React.useState<BookItem | null>(null);

  // Modal / Drawer: Add Book to Canon or Edit Note
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [targetBook, setTargetBook] = React.useState<BookItem | null>(null);
  const [canonTagInput, setCanonTagInput] = React.useState<string>('PRAMOEDYA');
  const [quoteInput, setQuoteInput] = React.useState<string>('');
  const [isSaving, setIsSaving] = React.useState(false);

  // Search Catalog Modal to Pick a Book
  const [isPickModalOpen, setIsPickModalOpen] = React.useState(false);
  const [searchCatalogQuery, setSearchCatalogQuery] = React.useState('');
  const [catalogSearchResults, setCatalogSearchResults] = React.useState<BookItem[]>([]);
  const [isSearchingCatalog, setIsSearchingCatalog] = React.useState(false);

  // Fetch all featured books
  const loadFeaturedBooks = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient<{ data: BookItem[] }>('/books?featured=true&includeDraft=true&perPage=50');
      if (res.data?.data) {
        setFeaturedBooks(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedBook(res.data.data[0]);
        }
      }
    } catch {
      setErrorMsg('Gagal memuat daftar buku pilihan kurator.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadFeaturedBooks();
  }, [loadFeaturedBooks]);

  // Open Edit Modal for existing featured book
  const handleOpenEdit = (book: BookItem) => {
    setTargetBook(book);
    const parsed = parseCuratorCanonNote(book.curatorNote);
    setCanonTagInput(parsed.tag);
    setQuoteInput(parsed.quote || book.description || '');
    setIsEditModalOpen(true);
  };

  // Open Pick Modal to choose new book from library
  const handleOpenPickModal = () => {
    setIsPickModalOpen(true);
    setSearchCatalogQuery('');
    setCatalogSearchResults([]);
  };

  // Search catalog
  const handleSearchCatalog = async (q: string) => {
    setSearchCatalogQuery(q);
    if (!q.trim()) {
      setCatalogSearchResults([]);
      return;
    }
    setIsSearchingCatalog(true);
    try {
      const res = await apiClient<{ data: BookItem[] }>(`/books?q=${encodeURIComponent(q.trim())}&perPage=10`);
      if (res.data?.data) {
        setCatalogSearchResults(res.data.data);
      }
    } catch {
      // Continue
    } finally {
      setIsSearchingCatalog(false);
    }
  };

  // Select book from catalog search to add to canon
  const handleSelectBookFromCatalog = (book: BookItem) => {
    setIsPickModalOpen(false);
    setTargetBook(book);
    const parsed = parseCuratorCanonNote(book.curatorNote);
    setCanonTagInput(parsed.tag || 'PRAMOEDYA');
    setQuoteInput(parsed.quote || book.description || '');
    setIsEditModalOpen(true);
  };

  // Save / Update Canon Book
  const handleSaveCanon = async () => {
    if (!targetBook) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const payloadNote = formatCuratorCanonNote(canonTagInput, quoteInput);
      const res = await apiClient<{ data: BookItem }>(`/books/${targetBook.id}/featured`, {
        method: 'PATCH',
        body: JSON.stringify({
          isFeatured: true,
          curatorNote: payloadNote,
        }),
      });

      if (res.error) {
        setErrorMsg(res.error.message || 'Gagal menyimpan kurasi buku kanon.');
      } else {
        setIsEditModalOpen(false);
        setTargetBook(null);
        await loadFeaturedBooks();
      }
    } catch {
      setErrorMsg('Terjadi kendala jaringan saat menyimpan kurasi.');
    } finally {
      setIsSaving(false);
    }
  };

  // Remove from Canon
  const handleRemoveFromCanon = async (bookId: string) => {
    if (!confirm('Yakin ingin melepas buku ini dari Indeks Kanon Pilihan Kurator di Landing Page?')) {
      return;
    }
    setIsLoading(true);
    try {
      await apiClient(`/books/${bookId}/featured`, {
        method: 'PATCH',
        body: JSON.stringify({
          isFeatured: false,
          curatorNote: null,
        }),
      });
      await loadFeaturedBooks();
    } catch {
      setErrorMsg('Gagal melepas buku dari kanon.');
      setIsLoading(false);
    }
  };

  const parsedSelected = selectedBook ? parseCuratorCanonNote(selectedBook.curatorNote) : null;

  return (
    <div className="space-y-6">
      {/* Subheader & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-hairline pb-4 font-mono text-xs">
        <div>
          <div className="text-[10px] uppercase text-muted tracking-widest flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-foreground" />
            <span>KATALOG TEMATIK &amp; KANON BACAAN</span>
          </div>
          <p className="font-serif italic text-sm text-foreground/85 mt-0.5">
            Kelola karya-karya sastra dan pemikiran utama yang tayang pada etalase muka Perpustakaan Jalanan Blora.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadFeaturedBooks}
            disabled={isLoading}
            className="px-3 py-1.5 border border-border-hairline bg-surface hover:border-foreground transition-colors inline-flex items-center gap-1.5 rounded-none"
            title="Segarkan Data"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={handleOpenPickModal}
            className="px-3.5 py-1.5 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5 rounded-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Buku ke Kanon</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 border-2 border-foreground bg-surface-muted text-foreground font-mono text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-16 flex items-center justify-center">
          <CustomLoader size="md" label="MEMUAT BERKAS KANON SASTRA..." />
        </div>
      ) : featuredBooks.length === 0 ? (
        <div className="border-2 border-dashed border-border-hairline p-16 text-center space-y-4 bg-surface rounded-none">
          <BookOpen className="w-10 h-10 mx-auto text-muted stroke-1" />
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-foreground">Belum Ada Buku di Indeks Kanon</h3>
            <p className="font-sans text-xs text-muted max-w-md mx-auto">
              Tandai buku dari katalog perpustakaan sebagai &ldquo;Pilihan Kurator Lapak&rdquo; agar muncul pada seksi
              Indeks Sastra di Landing Page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenPickModal}
            className="px-4 py-2 bg-foreground text-background font-mono text-xs uppercase font-bold tracking-wider rounded-none inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pilih Buku Pertama</span>
          </button>
        </div>
      ) : (
        /* 2-Column Split: Table List (Left) & Live Dossier Preview (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Canon Books List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="border border-border-hairline divide-y divide-border-hairline bg-surface">
              {featuredBooks.map((book, idx) => {
                const parsed = parseCuratorCanonNote(book.curatorNote);
                const isSelected = selectedBook?.id === book.id;

                return (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className={cn(
                      'p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors',
                      isSelected ? 'bg-surface-muted border-l-4 border-l-foreground' : 'hover:bg-surface-muted/50'
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="font-mono text-muted text-xs shrink-0 pt-0.5">
                        {`${idx + 1}`.padStart(2, '0')}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-foreground text-background font-mono text-[8.5px] uppercase font-bold tracking-wider rounded-none">
                            {parsed.tag}
                          </span>
                          <span className="font-mono text-[9px] text-muted uppercase">
                            {book.shelfLocation || 'RAK-LAPAK'}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-foreground truncate">
                          {book.title}
                        </h4>
                        <p className="font-mono text-[11px] text-muted truncate">
                          {book.author} &bull; {book.publicationYear || 'Edisi Lapak'}
                        </p>
                        {parsed.quote && (
                          <p className="font-serif italic text-xs text-foreground/80 line-clamp-1 mt-1">
                            &ldquo;{parsed.quote}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(book);
                        }}
                        className="px-2.5 py-1 border border-border-hairline hover:border-foreground bg-background text-foreground transition-colors rounded-none inline-flex items-center gap-1"
                        title="Sunting Kutipan & Tag"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span className="hidden sm:inline">Sunting</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromCanon(book.id);
                        }}
                        className="px-2 py-1 border border-border-hairline hover:border-foreground bg-background text-muted hover:text-foreground transition-colors rounded-none"
                        title="Lepas dari Kanon Lapak"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Dossier Preview */}
          <div className="lg:col-span-5 space-y-3 sticky top-20">
            <div className="border border-border-hairline bg-surface-muted/30 p-3 font-mono text-[10px] uppercase text-muted tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Eye className="w-3 h-3" />
                <span>SIMULASI TAMPILAN LANDING PAGE</span>
              </span>
              <span>LIVE DOSSIER BOX</span>
            </div>

            {selectedBook && parsedSelected ? (
              <div className="p-6 border-2 border-foreground bg-background space-y-4 font-mono select-none">
                <div className="flex items-center justify-between border-b border-border-hairline pb-2.5 text-[10px] uppercase text-muted tracking-widest">
                  <span>BERKAS INDEKS // {selectedBook.shelfLocation || 'RAK-01'}</span>
                  <span className="font-bold text-foreground">
                    {selectedBook.category?.name || parsedSelected.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="inline-block px-2 py-0.5 bg-foreground text-background font-mono text-[9px] uppercase font-bold tracking-wider rounded-none mb-1">
                    KANON: {parsedSelected.tag}
                  </div>
                  <h4 className="font-serif text-2xl font-black uppercase text-foreground leading-tight">
                    {selectedBook.title}
                  </h4>
                  <p className="font-serif italic text-xs text-muted">
                    Karya {selectedBook.author} (Terbit {selectedBook.publicationYear || 'Edisi Lapak'})
                  </p>
                </div>

                {/* Quotation Pull-Box */}
                <div className="p-4 bg-surface border-l-4 border-foreground space-y-2">
                  <Quote className="w-4 h-4 text-muted" />
                  <p className="font-serif italic text-sm text-foreground/90 leading-relaxed">
                    {parsedSelected.quote || '“Belum ada kutipan kuratorial khusus.”'}
                  </p>
                  <div className="text-right text-[9px] uppercase text-muted">
                    — Catatan Kurasi Perpusjal Blora
                  </div>
                </div>

                {/* Stamp & Borrow CTA */}
                <div className="pt-2 flex items-center justify-between gap-4 border-t border-border-hairline">
                  <DigitalStampEffect
                    variant={selectedBook.availableCopies > 0 ? 'TERSEDIA' : 'DIPINJAM'}
                    size="sm"
                  />

                  <Link
                    href={`/buku/${selectedBook.slug}`}
                    target="_blank"
                    className="px-4 py-2 bg-foreground text-background font-mono text-[10.5px] uppercase font-bold tracking-wider hover:bg-background hover:text-foreground border border-foreground transition-all inline-flex items-center gap-1.5 rounded-none"
                  >
                    <span>BUKA BERKAS BUKU</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-border-hairline text-center text-muted font-mono text-xs">
                Pilih salah satu buku dari daftar untuk melihat pratinjau.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 1: PICK BOOK FROM CATALOG ── */}
      {isPickModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border-2 border-foreground max-w-xl w-full p-6 space-y-4 rounded-none max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] uppercase text-muted tracking-widest font-bold">
                  [ PILIH KOLEKSI DARI INVENTARIS ]
                </span>
                <h3 className="font-serif text-xl font-black uppercase text-foreground">
                  Pilih Buku untuk Kanon Lapak
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPickModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center border border-border-hairline hover:border-foreground transition-colors rounded-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                autoFocus
                placeholder="Ketik judul, nama penulis, atau ISBN..."
                value={searchCatalogQuery}
                onChange={(e) => handleSearchCatalog(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none rounded-none"
              />
            </div>

            {/* Search Results List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border-hairline border border-border-hairline min-h-[220px]">
              {isSearchingCatalog ? (
                <div className="p-12 text-center font-mono text-xs text-muted">
                  Mencari katalog buku...
                </div>
              ) : catalogSearchResults.length === 0 ? (
                <div className="p-12 text-center font-mono text-xs text-muted space-y-1">
                  {searchCatalogQuery ? (
                    <span>Tidak ada buku yang cocok dengan &ldquo;{searchCatalogQuery}&rdquo;</span>
                  ) : (
                    <span>Ketik kata kunci untuk mencari buku dari katalog perpustakaan</span>
                  )}
                </div>
              ) : (
                catalogSearchResults.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBookFromCatalog(b)}
                    className="p-3.5 hover:bg-surface cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-sm text-foreground truncate">
                        {b.title}
                      </div>
                      <div className="font-mono text-[10px] text-muted truncate">
                        {b.author} &bull; {b.category?.name || 'Koleksi'} &bull; Tersedia: {b.availableCopies}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 bg-foreground text-background font-mono text-[10px] uppercase font-bold shrink-0 rounded-none"
                    >
                      Pilih
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsPickModalOpen(false)}
                className="px-4 py-2 border border-border-hairline hover:border-foreground transition-colors rounded-none"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT CANON NOTE & TAG ── */}
      {isEditModalOpen && targetBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border-2 border-foreground max-w-lg w-full p-6 space-y-5 rounded-none max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] uppercase text-muted tracking-widest font-bold">
                  [ FORMULIR KURATOR KANON ]
                </span>
                <h3 className="font-serif text-xl font-black uppercase text-foreground">
                  Kurasi Buku Kanon Lapak
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center border border-border-hairline hover:border-foreground transition-colors rounded-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Book Meta */}
            <div className="p-3 bg-surface border border-border-hairline space-y-0.5">
              <span className="font-mono text-[9px] uppercase text-muted tracking-wider">Buku Terpilih:</span>
              <div className="font-serif font-bold text-base text-foreground">{targetBook.title}</div>
              <div className="font-mono text-[10px] text-muted">
                {targetBook.author} &bull; {targetBook.category?.name}
              </div>
            </div>

            {/* Canon Tag Selector */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                1. Pilih Kategori Kanon Tematik:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CANON_TAGS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setCanonTagInput(t.key)}
                    className={cn(
                      'p-2.5 border text-left transition-colors rounded-none',
                      canonTagInput === t.key
                        ? 'bg-foreground text-background border-foreground font-bold'
                        : 'bg-surface text-foreground border-border-hairline hover:border-foreground'
                    )}
                  >
                    <div className="text-[11px] font-bold">{t.label}</div>
                    <div className={cn('text-[9px] truncate', canonTagInput === t.key ? 'text-background/80' : 'text-muted')}>
                      {t.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quote / Resonant Excerpt Input */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                2. Kutipan Kuratorial / Cuplikan Resonan:
              </label>
              <p className="font-sans text-[11px] text-muted">
                Kutipan paling berkesan dari buku ini yang akan dibaca warga di kotak berkas landing page.
              </p>
              <textarea
                rows={4}
                value={quoteInput}
                onChange={(e) => setQuoteInput(e.target.value)}
                placeholder="“Tuliskan satu atau dua kalimat kutipan tajam yang mewakili jiwa buku ini...”"
                className="w-full p-3 border border-border-hairline bg-surface text-foreground font-serif italic text-sm focus:border-foreground focus:outline-none rounded-none leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-border-hairline flex items-center justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-border-hairline hover:border-foreground transition-colors rounded-none"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveCanon}
                className="px-5 py-2 bg-foreground text-background font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5 rounded-none disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tetapkan ke Kanon</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
