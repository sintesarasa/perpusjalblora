'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { BookItem, Role } from '@perpusjal/types';
import { AdminBookCopiesModal } from '@/components/admin/admin-book-copies-modal';
import { AdminAddBookModal } from '@/components/admin/admin-add-book-modal';
import { AdminEditBookModal } from '@/components/admin/admin-edit-book-modal';
import { DeleteBookConfirmModal } from '@/components/admin/delete-book-confirm-modal';
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
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ShieldAlert,
  Tag,
} from 'lucide-react';
import { usePrintQueue } from '@/lib/print-queue-context';
import { StickerPrintQueueDrawer } from '@/components/admin/sticker-print-queue-drawer';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export default function DashboardBookManagementPage() {
  const router = useRouter();

  // Role Gate state
  const [currentUser, setCurrentUser] = React.useState<{ id: string; role: Role } | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  // Books data & filters state
  const [books, setBooks] = React.useState<BookItem[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [availabilityFilter, setAvailabilityFilter] = React.useState<string>('all');
  const [publishFilter, setPublishFilter] = React.useState<string>('all'); // 'all' | 'published' | 'draft'

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pagination, setPagination] = React.useState<PaginationMeta>({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 1,
  });

  // Action status states
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [togglingBookId, setTogglingBookId] = React.useState<string | null>(null);

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isQueueOpen, setIsQueueOpen] = React.useState(false);
  const [editModalBookId, setEditModalBookId] = React.useState<string | null>(null);
  const [copiesModalBook, setCopiesModalBook] = React.useState<BookItem | null>(null);

  const { totalCount, addMultipleToQueue } = usePrintQueue();

  // Custom Delete Modal State
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // 1. Verify Role Access (Kurator, Petugas, Admin)
  React.useEffect(() => {
    async function checkRole() {
      try {
        const res = await apiClient<any>('/auth/me');
        const user = res.data?.user || (res.data?.id ? res.data : null);
        if (user) {
          setCurrentUser(user);
        }
      } catch {
        // Failed
      } finally {
        setAuthLoading(false);
      }
    }
    checkRole();
  }, []);

  // 2. Debounce Search Input (350ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. Fetch Books with Curatorial Draft Support & Pagination
  const fetchBooks = React.useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
      if (selectedCategory) params.set('kategori', selectedCategory);
      if (availabilityFilter === 'available') params.set('tersedia', 'true');

      // Curators should be able to view drafts
      params.set('includeDraft', 'true');
      params.set('page', currentPage.toString());
      params.set('perPage', '20');

      const [booksRes, catRes] = await Promise.all([
        apiClient<{ data: BookItem[]; meta: PaginationMeta }>(`/books?${params.toString()}`),
        apiClient<CategoryItem[]>('/articles/categories'),
      ]);

      let rawData: BookItem[] = [];
      if (Array.isArray(booksRes.data)) {
        rawData = booksRes.data;
      } else if (Array.isArray((booksRes.data as any)?.data)) {
        rawData = (booksRes.data as any).data;
      }

      // Filter client-side if draft filter is chosen
      if (publishFilter === 'published') {
        rawData = rawData.filter((b) => b.isPublished !== false);
      } else if (publishFilter === 'draft') {
        rawData = rawData.filter((b) => b.isPublished === false);
      }

      setBooks(rawData);

      if (booksRes.data && (booksRes.data as any).meta) {
        setPagination((booksRes.data as any).meta);
      }

      const catList: CategoryItem[] = Array.isArray(catRes.data)
        ? catRes.data
        : Array.isArray((catRes.data as any)?.data)
        ? (catRes.data as any).data
        : [];
      setCategories(catList);
    } catch {
      setActionError('Gagal memuat katalog buku.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, availabilityFilter, publishFilter, currentPage]);

  React.useEffect(() => {
    if (!authLoading) {
      fetchBooks();
    }
  }, [fetchBooks, authLoading]);

  // 4. Quick Publish / Unpublish Toggle
  const handleTogglePublish = async (book: BookItem) => {
    setTogglingBookId(book.id);
    setActionError(null);
    setActionMessage(null);
    try {
      const res = await apiClient<{ data: { isPublished: boolean }; message: string }>(
        `/books/${book.id}/publish`,
        { method: 'PATCH' }
      );

      if (res.error) {
        setActionError(res.error.message);
      } else {
        setActionMessage(res.data?.message || 'Status publikasi buku berhasil diperbarui.');
        fetchBooks();
      }
    } catch {
      setActionError('Terjadi kendala saat mengubah status publikasi.');
    } finally {
      setTogglingBookId(null);
    }
  };

  // 5. Custom Modal Confirm Deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setActionError(null);

    try {
      const res = await apiClient<{ message: string }>(`/books/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (res.error) {
        setActionError(res.error.message);
      } else {
        setActionMessage(res.data?.message || `Buku "${deleteTarget.title}" berhasil diarsipkan dari katalog.`);
        setDeleteTarget(null);
        fetchBooks();
      }
    } catch {
      setActionError('Terjadi kendala saat menghapus buku.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Role Access Gate Validation
  const isAuthorized =
    currentUser &&
    [Role.KURATOR, Role.ADMIN].includes(currentUser.role);

  if (authLoading) {
    return (
      <div className="py-24 flex justify-center">
        <CustomLoader size="md" label="MEMERIKSA HAK AKSES KURATOR..." />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 border-2 border-foreground bg-surface font-mono text-xs space-y-4">
        <div className="flex items-center gap-2 text-red-600 font-bold tracking-wider">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>AKSES MEJA KURASI DIBATASI</span>
        </div>
        <p className="font-serif text-sm text-foreground leading-relaxed">
          Halaman manajemen katalog buku dan inventaris eksemplar fisik lapak ini hanya dapat diakses oleh kurator pustaka, pengurus, atau admin Perpustakaan Jalanan Blora.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-foreground text-background font-bold uppercase tracking-wider hover:opacity-90"
          >
            Kembali ke Ikhtisar Personal
          </button>
        </div>
      </div>
    );
  }

  // Stats calculation
  const totalBooks = pagination.total || books.length;
  const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
  const availableCopies = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
  const borrowedCopies = totalCopies - availableCopies;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl">
      {/* 1. EDITORIAL MASTHEAD */}
      <div className="border-b border-border-hairline pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            <BookOpen className="w-3.5 h-3.5" />
            <span>MEJA KURASI // MANAJEMEN KOLEKSI PUSTAKA</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Kelola Koleksi Buku
          </h1>
          <p className="font-serif text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
            Katalogisasi pustaka, pendataan donasi buku baru, dan pelacakan eksemplar fisik lapak Perpustakaan Jalanan Blora.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsQueueOpen(true)}
            className="px-4 py-2.5 border border-foreground bg-surface hover:bg-surface-muted text-foreground font-mono text-xs uppercase tracking-widest font-bold inline-flex items-center gap-2 shadow-sm transition-colors relative"
            title="Buka antrean cetak stiker punggung buku A4"
          >
            <Tag className="w-4 h-4" />
            <span>Antrean Stiker</span>
            {totalCount > 0 && (
              <span className="px-1.5 py-0.2 bg-foreground text-background text-[10px] font-bold">
                {totalCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Koleksi Buku</span>
          </button>
        </div>
      </div>

      {/* 2. STATS 4-GRID METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border border-border-hairline bg-surface p-4 divide-y sm:divide-y-0 sm:divide-x divide-border-hairline font-mono">
        <div className="pr-4">
          <span className="text-[10px] text-muted uppercase tracking-wider block">Total Terkatalog</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
            {totalBooks} <span className="text-xs text-muted font-normal">Judul</span>
          </div>
        </div>

        <div className="pt-3 sm:pt-0 sm:pl-4 pr-4">
          <span className="text-[10px] text-muted uppercase tracking-wider block">Total Eksemplar Halaman</span>
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

      {/* 3. ALERTS & NOTIFICATIONS */}
      {actionMessage && (
        <div className="p-3 bg-surface border-2 border-foreground font-mono text-xs text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="font-bold text-base">&times;</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-red-50 border-2 border-red-500 font-mono text-xs text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="font-bold text-base">&times;</button>
        </div>
      )}

      {/* 4. TOOLBAR PENCARIAN & FILTER */}
      <div className="p-4 border border-border-hairline bg-surface flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        {/* Search Input with Debounce */}
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
          {/* Status Publikasi Filter */}
          <select
            value={publishFilter}
            onChange={(e) => {
              setPublishFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
          >
            <option value="all">Semua Status (Publik & Draft)</option>
            <option value="published">Hanya Terbit</option>
            <option value="draft">Hanya Draft</option>
          </select>

          {/* Kategori Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
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

          {/* Ketersediaan Filter */}
          <select
            value={availabilityFilter}
            onChange={(e) => {
              setAvailabilityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
          >
            <option value="all">Semua Ketersediaan</option>
            <option value="available">Hanya yang Tersedia</option>
          </select>

          <button
            type="button"
            onClick={fetchBooks}
            className="p-2 border border-border-hairline hover:border-foreground text-muted hover:text-foreground transition-colors"
            title="Segarkan data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. BOOKS TABLE */}
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
            + Tambah Koleksi Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-border-hairline bg-surface divide-y divide-border-hairline">
            {books.map((book) => {
              const available = book.availableCopies || 0;
              const total = book.totalCopies || 0;
              const isDraft = book.isPublished === false;
              const isToggling = togglingBookId === book.id;

              return (
                <div
                  key={book.id}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted/20 transition-colors ${
                    isDraft ? 'bg-amber-500/[0.03]' : ''
                  }`}
                >
                  {/* Left: Thumbnail & Book Details */}
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-14 h-20 bg-surface-muted border border-border-hairline shrink-0 flex items-center justify-center overflow-hidden relative">
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
                      {isDraft && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-mono text-[9px] text-white font-bold uppercase">
                          Draft
                        </div>
                      )}
                    </div>

                    {/* Book Metadata */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap font-mono text-[10px]">
                        {/* Status Terbit / Draft Badge */}
                        {isDraft ? (
                          <span className="px-1.5 py-0.5 border border-amber-600 bg-amber-50 text-amber-900 font-bold uppercase">
                            DRAFT // TIDAK TAMPIL PUBLIK
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 border border-emerald-600 bg-emerald-50 text-emerald-900 font-bold uppercase">
                            TERBIT // PUBLIK
                          </span>
                        )}

                        <span className="px-1.5 py-0.5 border border-border-hairline bg-surface-muted uppercase text-muted">
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
                  <div className="flex items-center gap-2 self-end md:self-center font-mono text-xs shrink-0 flex-wrap sm:flex-nowrap">
                    {/* Toggle Status Terbit / Draft */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(book)}
                      disabled={isToggling}
                      className={`px-2.5 py-1.5 border text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                        isDraft
                          ? 'border-amber-600 bg-amber-50 text-amber-900 hover:bg-amber-100'
                          : 'border-border-hairline hover:border-foreground text-muted hover:text-foreground'
                      }`}
                      title={isDraft ? 'Klik untuk terbitkan buku ke publik' : 'Klik untuk jadikan draft'}
                    >
                      {isDraft ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-amber-700" />
                          <span>Terbitkan</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Draft-kan</span>
                        </>
                      )}
                    </button>

                    {/* Kelola Eksemplar Fisik */}
                    <button
                      type="button"
                      onClick={() => setCopiesModalBook(book)}
                      className="px-3 py-1.5 border border-foreground bg-surface hover:bg-surface-muted text-foreground font-semibold inline-flex items-center gap-1.5 transition-colors"
                      title="Kelola nomor dan kondisi eksemplar fisik"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Eksemplar ({total})</span>
                    </button>

                    {/* Tombol Cepat Tambah ke Antrean Stiker */}
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await apiClient<{ data: any[] }>(`/books/${book.id}/copies`);
                          const raw = res.data;
                          const copies: any[] = Array.isArray(raw)
                            ? raw
                            : Array.isArray((raw as any)?.data)
                            ? (raw as any).data
                            : [];
                          if (copies.length === 0) {
                            setActionError(`Buku "${book.title}" belum memiliki eksemplar fisik untuk dicetak.`);
                            return;
                          }
                          addMultipleToQueue(
                            copies.map((c: any, idx: number) => ({
                              bookId: book.id,
                              bookTitle: book.title,
                              bookSlug: book.slug,
                              author: book.author,
                              categoryName: book.category?.name,
                              categorySlug: book.category?.slug,
                              shelfLocation: book.shelfLocation,
                              inventoryCode: c.inventoryCode,
                              copyNumber: idx + 1,
                              count: 1,
                            }))
                          );
                          setActionMessage(`${copies.length} stiker untuk "${book.title}" berhasil dimasukkan ke antrean cetak!`);
                          setIsQueueOpen(true);
                        } catch {
                          setActionError('Gagal mengambil data eksemplar untuk stiker.');
                        }
                      }}
                      className="p-1.5 border border-border-hairline hover:border-foreground text-muted hover:text-foreground transition-colors"
                      title="Masukkan semua stiker buku ini ke antrean cetak A4"
                    >
                      <Tag className="w-4 h-4" />
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

                    {/* Hapus / Arsipkan Buku (Buka Gazette Confirm Modal) */}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: book.id, title: book.title })}
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

          {/* 6. EDITORIAL STARK MONOCHROME PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="p-3 border border-border-hairline bg-surface flex items-center justify-between font-mono text-xs">
              <div className="text-muted text-[11px]">
                Menampilkan{' '}
                <span className="text-foreground font-bold">
                  {(currentPage - 1) * pagination.perPage + 1} -{' '}
                  {Math.min(currentPage * pagination.perPage, pagination.total)}
                </span>{' '}
                dari <span className="text-foreground font-bold">{pagination.total}</span> pustaka
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-border-hairline text-foreground hover:border-foreground disabled:opacity-30 disabled:hover:border-border-hairline transition-colors inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline uppercase">Sebelumnya</span>
                </button>

                <span className="px-3 py-1.5 border border-foreground bg-foreground text-background font-bold">
                  {currentPage} / {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="px-3 py-1.5 border border-border-hairline text-foreground hover:border-foreground disabled:opacity-30 disabled:hover:border-border-hairline transition-colors inline-flex items-center gap-1"
                >
                  <span className="hidden sm:inline uppercase">Selanjutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. COPIES MANAGEMENT MODAL */}
      {copiesModalBook && (
        <AdminBookCopiesModal
          bookId={copiesModalBook.id}
          bookTitle={copiesModalBook.title}
          bookSlug={copiesModalBook.slug}
          author={copiesModalBook.author}
          categoryName={copiesModalBook.category?.name}
          categorySlug={copiesModalBook.category?.slug}
          shelfLocation={copiesModalBook.shelfLocation}
          isOpen={!!copiesModalBook}
          onClose={() => setCopiesModalBook(null)}
          onCopiesUpdated={fetchBooks}
        />
      )}

      {/* 8. STICKER PRINT QUEUE DRAWER */}
      <StickerPrintQueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
      />

      {/* 8. ADD BOOK POP-UP MODAL */}
      <AdminAddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchBooks}
      />

      {/* 9. EDIT BOOK POP-UP MODAL */}
      <AdminEditBookModal
        bookId={editModalBookId}
        isOpen={!!editModalBookId}
        onClose={() => setEditModalBookId(null)}
        onSuccess={fetchBooks}
      />

      {/* 10. CUSTOM GAZETTE DELETE CONFIRM MODAL */}
      <DeleteBookConfirmModal
        isOpen={!!deleteTarget}
        bookTitle={deleteTarget?.title || ''}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
