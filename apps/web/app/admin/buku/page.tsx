'use client';

import * as React from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { BookItem, BookDetail } from '@perpusjal/types';
import { AdminBookCopiesModal } from '@/components/admin/admin-book-copies-modal';
import { AdminAddBookModal } from '@/components/admin/admin-add-book-modal';
import { AdminEditBookModal } from '@/components/admin/admin-edit-book-modal';
import { CustomLoader } from '@/components/ui/custom-loader';
import {
  BookOpen,
  Plus,
  Search,
  Layers,
  Edit3,
  Trash2,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function AdminBookListPage() {
  const [books, setBooks] = React.useState<BookItem[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [availabilityFilter, setAvailabilityFilter] = React.useState<string>('all');
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editModalBookId, setEditModalBookId] = React.useState<string | null>(null);
  const [copiesModalBook, setCopiesModalBook] = React.useState<{
    id: string;
    title: string;
    slug: string;
  } | null>(null);

  const fetchBooks = React.useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedCategory) params.set('kategori', selectedCategory);
      if (availabilityFilter === 'available') params.set('tersedia', 'true');
      params.set('perPage', '50');

      const [booksRes, catRes] = await Promise.all([
        apiClient<{ data: BookItem[]; meta: any }>(`/books?${params.toString()}`),
        apiClient<{ data: CategoryItem[] }>('/articles/categories'),
      ]);

      if (booksRes.data) {
        setBooks(booksRes.data.data || []);
      }
      if (catRes.data?.data) {
        setCategories(catRes.data.data);
      }
    } catch {
      setActionError('Gagal memuat katalog buku.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, availabilityFilter]);

  React.useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!window.confirm(`Yakin ingin mengarsipkan / menghapus buku "${title}" dari katalog?`)) {
      return;
    }

    try {
      const res = await apiClient<{ message: string }>(`/books/${bookId}`, {
        method: 'DELETE',
      });

      if (res.error) {
        setActionError(res.error.message);
      } else {
        setActionMessage(res.data?.message || 'Buku berhasil diarsipkan dari katalog.');
        fetchBooks();
      }
    } catch {
      setActionError('Terjadi kendala saat menghapus buku.');
    }
  };

  // Stats calculation
  const totalBooks = books.length;
  const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
  const availableCopies = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
  const borrowedCopies = totalCopies - availableCopies;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* 1. EDITORIAL HEADER BANNER */}
      <section className="border-b border-border-hairline bg-surface-muted/30 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <BookOpen className="w-3.5 h-3.5" />
              <span>MEJA KURASI // MANAJEMEN KOLEKSI PUSTAKA</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Kelola Koleksi Buku
            </h1>
            <p className="font-serif text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
              Katalogisasi pustaka, pendataan donasi buku baru, dan pelacakan eksemplar fisik lapak Perpustakaan Jalanan Blora.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Koleksi Buku</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS 4-GRID METRICS */}
      <section className="border-b border-border-hairline bg-surface py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border-hairline font-mono">
          <div className="pr-4">
            <span className="text-[10px] text-muted uppercase tracking-wider block">Total Judul Buku</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
              {totalBooks} <span className="text-xs text-muted font-normal">Judul</span>
            </div>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-4 pr-4">
            <span className="text-[10px] text-muted uppercase tracking-wider block">Total Eksemplar Fisik</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
              {totalCopies} <span className="text-xs text-muted font-normal">Kopi Fisik</span>
            </div>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-4 pr-4">
            <span className="text-[10px] text-muted uppercase tracking-wider block">Siap di Lapak</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-0.5 flex items-center gap-2">
              <span>{availableCopies}</span>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                Tersedia
              </span>
            </div>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-4">
            <span className="text-[10px] text-muted uppercase tracking-wider block">Sedang Dipinjam</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-0.5 flex items-center gap-2">
              <span>{borrowedCopies}</span>
              <span className="text-xs font-mono text-muted bg-surface-muted px-1.5 py-0.5 border border-border-hairline">
                Beredar
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TOOLBAR PENCARIAN & FILTER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {actionMessage && (
          <div className="p-3 bg-surface border-2 border-foreground font-mono text-xs text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="font-bold">&times;</button>
          </div>
        )}

        {actionError && (
          <div className="p-3 bg-red-50 border-2 border-red-500 font-mono text-xs text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="font-bold">&times;</button>
          </div>
        )}

        <div className="p-4 border border-border-hairline bg-surface flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, pengarang, ISBN..."
              className="w-full pl-9 pr-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
            >
              <option value="all">Semua Ketersediaan</option>
              <option value="available">Hanya yang Tersedia</option>
            </select>

            <button
              onClick={fetchBooks}
              className="p-2 border border-border-hairline hover:border-foreground text-muted hover:text-foreground transition-colors"
              title="Segarkan data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. BOOKS TABLE */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <CustomLoader size="md" label="MEMUAT KATALOG PUSTAKA..." />
          </div>
        ) : books.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border-hairline bg-surface space-y-3 font-mono">
            <p className="text-xs text-muted uppercase tracking-widest">[ KATALOG KOSONG ]</p>
            <h2 className="font-serif text-xl font-normal text-foreground">
              Tidak ada buku yang sesuai dengan kriteria pencarian.
            </h2>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-block mt-2 px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider"
            >
              + Tambah Buku Pertama Sekarang
            </button>
          </div>
        ) : (
          <div className="border border-border-hairline bg-surface divide-y divide-border-hairline">
            {books.map((book) => {
              const available = book.availableCopies || 0;
              const total = book.totalCopies || 0;

              return (
                <div
                  key={book.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/20 transition-colors"
                >
                  {/* Left: Thumbnail & Book Details */}
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-14 h-20 bg-surface-muted border border-border-hairline shrink-0 flex items-center justify-center overflow-hidden">
                      {book.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-5 h-5 text-muted" />
                      )}
                    </div>

                    {/* Book Metadata */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap font-mono text-[10px]">
                        <span className="px-1.5 py-0.2 border border-border-hairline bg-surface-muted uppercase text-muted">
                          {book.category?.name || 'Umum'}
                        </span>
                        {book.shelfLocation && (
                          <span className="flex items-center gap-1 text-muted">
                            <MapPin className="w-3 h-3" />
                            {book.shelfLocation}
                          </span>
                        )}
                        {book.isBorrowable ? (
                          <span className="text-foreground font-bold">[ BISA DIPINJAM ]</span>
                        ) : (
                          <span className="text-muted">[ BACA DI TEMPAT ]</span>
                        )}
                      </div>

                      <h3 className="font-serif font-bold text-base sm:text-lg text-foreground hover:underline truncate">
                        <Link href={`/buku/${book.slug}`} target="_blank">
                          {book.title}
                        </Link>
                      </h3>

                      <p className="font-sans text-xs text-muted truncate">
                        Penulis: <strong>{book.author}</strong>
                        {book.publicationYear ? ` • Tahun ${book.publicationYear}` : ''}
                        {book.isbn ? ` • ISBN: ${book.isbn}` : ''}
                      </p>

                      {/* Copies Inventory Status Indicator */}
                      <div className="pt-1 flex items-center gap-3 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted uppercase">Eksemplar Fisik:</span>
                          <span className="font-bold text-foreground">
                            {available} / {total} Tersedia
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center font-mono text-xs shrink-0">
                    {/* Kelola Eksemplar Fisik */}
                    <button
                      type="button"
                      onClick={() =>
                        setCopiesModalBook({
                          id: book.id,
                          title: book.title,
                          slug: book.slug,
                        })
                      }
                      className="px-3 py-1.5 border border-foreground bg-surface hover:bg-surface-muted text-foreground font-semibold inline-flex items-center gap-1.5 transition-colors"
                      title="Kelola nomor dan kondisi eksemplar fisik"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Eksemplar ({total})</span>
                    </button>

                    {/* Sunting Buku (Buka Pop-up Edit Modal) */}
                    <button
                      type="button"
                      onClick={() => setEditModalBookId(book.id)}
                      className="p-1.5 border border-border-hairline hover:border-foreground text-muted hover:text-foreground transition-colors"
                      title="Sunting data buku"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Buka Tampilan Publik */}
                    <Link
                      href={`/buku/${book.slug}`}
                      target="_blank"
                      className="p-1.5 border border-border-hairline hover:border-foreground text-muted hover:text-foreground transition-colors"
                      title="Lihat di katalog publik"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Hapus Buku */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBook(book.id, book.title)}
                      className="p-1.5 border border-border-hairline text-muted hover:text-red-700 hover:border-red-400 transition-colors"
                      title="Hapus / arsipkan buku"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. COPIES MANAGEMENT MODAL */}
      {copiesModalBook && (
        <AdminBookCopiesModal
          bookId={copiesModalBook.id}
          bookTitle={copiesModalBook.title}
          bookSlug={copiesModalBook.slug}
          isOpen={!!copiesModalBook}
          onClose={() => setCopiesModalBook(null)}
          onCopiesUpdated={fetchBooks}
        />
      )}

      {/* 6. ADD BOOK POP-UP MODAL */}
      <AdminAddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchBooks}
      />

      {/* 7. EDIT BOOK POP-UP MODAL */}
      <AdminEditBookModal
        bookId={editModalBookId}
        isOpen={!!editModalBookId}
        onClose={() => setEditModalBookId(null)}
        onSuccess={fetchBooks}
      />
    </div>
  );
}
