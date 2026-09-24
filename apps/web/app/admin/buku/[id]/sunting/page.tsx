'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Language, BookDetail } from '@perpusjal/types';
import { BookCoverUploader } from '@/components/admin/book-cover-uploader';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { CustomLoader } from '@/components/ui/custom-loader';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function AdminEditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params?.id as string;

  // Categories list
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Form states
  const [title, setTitle] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [isbn, setIsbn] = React.useState('');
  const [publisher, setPublisher] = React.useState('');
  const [publicationYear, setPublicationYear] = React.useState<string>('');
  const [pages, setPages] = React.useState<string>('');
  const [language, setLanguage] = React.useState<Language>(Language.ID);
  const [shelfLocation, setShelfLocation] = React.useState('');
  const [donatedBy, setDonatedBy] = React.useState('');
  const [isBorrowable, setIsBorrowable] = React.useState(true);
  const [description, setDescription] = React.useState('');
  const [coverImage, setCoverImage] = React.useState('');

  // Submission state
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Load existing book & categories
  React.useEffect(() => {
    async function loadData() {
      if (!bookId) return;
      setLoading(true);
      try {
        const [catRes, bookRes] = await Promise.all([
          apiClient<CategoryItem[]>('/articles/categories'),
          apiClient<BookDetail>(`/books/${bookId}`),
        ]);

        const catList: CategoryItem[] = Array.isArray(catRes.data)
          ? catRes.data
          : Array.isArray((catRes.data as any)?.data)
          ? (catRes.data as any).data
          : [];
        setCategories(catList);

        const b: BookDetail | null = (bookRes.data as any)?.data || (bookRes.data as any) || null;
        if (b && (b as any).id) {
          setTitle(b.title || '');
          setAuthor(b.author || '');
          setCategoryId(b.category?.id || (catList.length > 0 ? catList[0].id : ''));
          setIsbn(b.isbn || '');
          setPublisher(b.publisher || '');
          setPublicationYear(b.publicationYear ? b.publicationYear.toString() : '');
          setPages(b.pages ? b.pages.toString() : '');
          setLanguage(b.language || Language.ID);
          setShelfLocation(b.shelfLocation || '');
          setDonatedBy(b.donatedBy || '');
          setIsBorrowable(b.isBorrowable ?? true);
          setDescription(b.description || '');
          setCoverImage(b.coverImage || '');
        } else if (bookRes.error) {
          setError(bookRes.error.message);
        }
      } catch {
        setError('Gagal memuat data buku.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !categoryId) {
      setError('Judul, nama penulis, dan kategori buku wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      author: author.trim(),
      categoryId,
      isbn: isbn.trim() || null,
      publisher: publisher.trim() || null,
      publicationYear: publicationYear ? parseInt(publicationYear, 10) : null,
      pages: pages ? parseInt(pages, 10) : null,
      language,
      shelfLocation: shelfLocation.trim() || null,
      donatedBy: donatedBy.trim() || null,
      isBorrowable,
      description: description.trim() || null,
      coverImage: coverImage.trim() || null,
    };

    try {
      const res = await apiClient<{ data: any; message: string }>(`/books/${bookId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (res.error) {
        setError(res.error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/buku');
        }, 1200);
      }
    } catch {
      setError('Terjadi kendala saat memperbarui data buku.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CustomLoader size="md" label="MEMUAT DATA BUKU..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      {/* 1. TOP EDITORIAL BANNER */}
      <section className="border-b border-border-hairline bg-surface-muted/30 py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-3">
          <Link
            href="/dashboard/buku"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Kelola Pustaka</span>
          </Link>

          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
            <BookOpen className="w-4 h-4 text-foreground" />
            <span>SUNTING DATA PUSTAKA</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Sunting Data Koleksi Buku
          </h1>
          <p className="font-serif text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
            Perbarui data bibliografi, penataan rak lapak, atau deskripsi buku.
          </p>
        </div>
      </section>

      {/* 2. MAIN FORM */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {error && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-50 text-red-800 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="font-bold">&times;</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 border-2 border-foreground bg-foreground text-background font-mono text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Perubahan berhasil disimpan! Mengalihkan ke inventaris katalog...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* INPUT FIELDS (8 COLS) */}
            <div className="lg:col-span-8 space-y-8">
              {/* SEKSI A: INFORMASI UTAMA */}
              <div className="p-6 border border-border-hairline bg-surface space-y-5">
                <div className="border-b border-border-hairline pb-3">
                  <h2 className="font-serif text-base font-bold text-foreground uppercase tracking-wider">
                    A. Informasi Utama Buku
                  </h2>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                      Judul Buku *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                        Nama Penulis / Pengarang *
                      </label>
                      <input
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                        Kategori Pustaka *
                      </label>
                      <select
                        required
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={loading || categories.length === 0}
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none disabled:opacity-60"
                      >
                        {categories.length === 0 ? (
                          <option value="" disabled>
                            Memuat kategori...
                          </option>
                        ) : (
                          <>
                            <option value="" disabled>
                              -- Pilih Kategori Pustaka --
                            </option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                        Bahasa Pengantar
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                      >
                        <option value={Language.ID}>Bahasa Indonesia (ID)</option>
                        <option value={Language.JV}>Basa Jawa (JV)</option>
                        <option value={Language.EN}>English (EN)</option>
                        <option value={Language.OTHER}>Lainnya (OTHER)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                        Jumlah Halaman
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={pages}
                        onChange={(e) => setPages(e.target.value)}
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEKSI B: DETAIL PENERBITAN */}
              <div className="p-6 border border-border-hairline bg-surface space-y-5">
                <div className="border-b border-border-hairline pb-3">
                  <h2 className="font-serif text-base font-bold text-foreground uppercase tracking-wider">
                    B. Detail Bibliografi & Penerbitan
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                      Nomor ISBN
                    </label>
                    <input
                      type="text"
                      maxLength={13}
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                      Penerbit
                    </label>
                    <input
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                      Tahun Terbit
                    </label>
                    <input
                      type="number"
                      min="1800"
                      max="2100"
                      value={publicationYear}
                      onChange={(e) => setPublicationYear(e.target.value)}
                      className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SEKSI C: INVENTARIS & LAPAK */}
              <div className="p-6 border border-border-hairline bg-surface space-y-5">
                <div className="border-b border-border-hairline pb-3">
                  <h2 className="font-serif text-base font-bold text-foreground uppercase tracking-wider">
                    C. Inventaris Lapak Fisik & Sirkulasi
                  </h2>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                        Lokasi Rak / Dus Lapak
                      </label>
                      <input
                        type="text"
                        value={shelfLocation}
                        onChange={(e) => setShelfLocation(e.target.value)}
                        placeholder="Contoh: Dus Alun-Alun A, Rak Basecamp 02"
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                        Donatur / Sumber Koleksi
                      </label>
                      <input
                        type="text"
                        value={donatedBy}
                        onChange={(e) => setDonatedBy(e.target.value)}
                        placeholder="Contoh: Donasi Warga CFD, Anonim"
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-hairline">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isBorrowable}
                        onChange={(e) => setIsBorrowable(e.target.checked)}
                        className="w-4 h-4 accent-foreground"
                      />
                      <span className="font-bold text-foreground">
                        Buku Boleh Dipinjam Pulang (Sirkulasi Terbuka)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SEKSI D: SINOPSIS */}
              <div className="p-6 border border-border-hairline bg-surface space-y-4">
                <div className="border-b border-border-hairline pb-3">
                  <h2 className="font-serif text-base font-bold text-foreground uppercase tracking-wider">
                    D. Sinopsis & Catatan Kuratorial
                  </h2>
                </div>

                <div className="font-mono text-xs">
                  <textarea
                    rows={6}
                    maxLength={2000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none leading-relaxed"
                  />
                  <div className="flex justify-end text-[10px] text-muted mt-1">
                    <span>{description.length} / 2000 Karakter</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PREVIEW & ACTIONS (4 COLS) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
              <div className="p-6 border-2 border-foreground bg-surface space-y-4">
                <div className="border-b border-border-hairline pb-2">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    VISUAL SAMPUL
                  </div>
                  <h3 className="font-serif text-base font-bold text-foreground">
                    Pratinjau Sampul
                  </h3>
                </div>

                <BookCoverUploader
                  value={coverImage}
                  onChange={setCoverImage}
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="p-4 border border-border-hairline bg-surface space-y-3 font-mono text-xs">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}</span>
                </button>

                <Link
                  href="/dashboard/buku"
                  className="w-full py-2.5 border border-border-hairline text-center block text-muted hover:text-foreground hover:bg-surface-muted transition-colors uppercase tracking-wider font-semibold"
                >
                  Batal
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
