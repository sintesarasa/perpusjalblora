'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Language } from '@perpusjal/types';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Layers,
  MapPin,
  Heart,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function AdminAddBookPage() {
  const router = useRouter();

  // Categories list
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);

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
  const [initialCopies, setInitialCopies] = React.useState<number>(1);
  const [isBorrowable, setIsBorrowable] = React.useState(true);
  const [isPublished, setIsPublished] = React.useState(true);
  const [description, setDescription] = React.useState('');
  const [coverImage, setCoverImage] = React.useState('');

  // Submission state
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Load categories
  React.useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiClient<{ data: CategoryItem[] }>('/articles/categories');
        if (res.data?.data) {
          setCategories(res.data.data);
          if (res.data.data.length > 0) {
            setCategoryId(res.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

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
      initialCopies: Math.max(0, Math.min(20, initialCopies || 1)),
      isBorrowable,
      isPublished,
      description: description.trim() || null,
      coverImage: coverImage.trim() || null,
    };

    try {
      const res = await apiClient<{ data: any; message: string }>('/books', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.error) {
        setError(res.error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/buku');
        }, 1200);
      }
    } catch {
      setError('Terjadi kendala saat menyimpan buku ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      {/* 1. TOP EDITORIAL BANNER */}
      <section className="border-b border-border-hairline bg-surface-muted/30 py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-3">
          <Link
            href="/admin/buku"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Kelola Pustaka</span>
          </Link>

          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
            <BookOpen className="w-4 h-4 text-foreground" />
            <span>KATALOGISASI & INVENTARIS BUKU LAPAK</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Tambah Koleksi Buku Baru
          </h1>
          <p className="font-serif text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
            Daftarkan pustaka baru ke dalam katalog perpustakaan. Sistem akan otomatis menerbitkan kode inventaris fisik lapak untuk setiap eksemplar yang didaftarkan.
          </p>
        </div>
      </section>

      {/* 2. MAIN FORM CONTAINER */}
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
            <span>Buku berhasil didaftarkan! Mengalihkan ke inventaris katalog...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT / CENTER: INPUT FIELDS (8 COLS) */}
            <div className="lg:col-span-8 space-y-8">
              {/* SEKSI A: INFORMASI UTAMA BUKU */}
              <div className="p-6 border border-border-hairline bg-surface space-y-5">
                <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                  <h2 className="font-serif text-base font-bold text-foreground uppercase tracking-wider">
                    A. Informasi Utama Buku
                  </h2>
                  <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                    * Wajib Diisi
                  </span>
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
                      placeholder="Contoh: Bumi Manusia"
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
                        placeholder="Contoh: Pramoedya Ananta Toer"
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
                        disabled={loadingCategories}
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
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
                        placeholder="Contoh: 535"
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEKSI B: DETAIL PENERBITAN & IDENTIFIKASI */}
              <div className="p-6 border border-border-hairline bg-surface space-y-5">
                <div className="border-b border-border-hairline pb-3">
                  <h2 className="font-serif text-base font-bold text-foreground uppercase tracking-wider">
                    B. Detail Bibliografi & Penerbitan
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                      Nomor ISBN (Opsional)
                    </label>
                    <input
                      type="text"
                      maxLength={13}
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="978xxxxxxx"
                      className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                      Penerbit (Opsional)
                    </label>
                    <input
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="Contoh: Hasta Mitra"
                      className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                      Tahun Terbit (Opsional)
                    </label>
                    <input
                      type="number"
                      min="1800"
                      max="2100"
                      value={publicationYear}
                      onChange={(e) => setPublicationYear(e.target.value)}
                      placeholder="Contoh: 1980"
                      className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SEKSI C: INVENTARIS & LAPAK FISIK BLORA */}
              <div className="p-6 border border-border-hairline bg-surface space-y-5">
                <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                  <h2 className="font-serif text-base font-bold text-foreground uppercase tracking-wider">
                    C. Inventaris Lapak Fisik & Sirkulasi
                  </h2>
                  <span className="font-mono text-[10px] text-muted uppercase">
                    Manajemen Sirkulasi
                  </span>
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
                      <span className="text-[10px] text-muted mt-1 block">
                        Memudahkan relawan menemukan buku saat lapak digelar.
                      </span>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-hairline">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-foreground mb-1.5">
                        Jumlah Eksemplar Fisik Awal
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={initialCopies}
                        onChange={(e) => setInitialCopies(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-sm focus:border-foreground focus:outline-none"
                      />
                      <span className="text-[10px] text-muted mt-1 block">
                        Backend otomatis mencetak kode unik: PJ-{new Date().getFullYear()}-XXXX
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isBorrowable}
                          onChange={(e) => setIsBorrowable(e.target.checked)}
                          className="w-4 h-4 accent-foreground"
                        />
                        <span className="font-bold text-foreground">
                          Buku Boleh Dipinjam Pulang
                        </span>
                      </label>
                      <span className="text-[10px] text-muted block pl-6">
                        Jika dimatikan, buku hanya dapat dibaca di tempat saat lapak buka.
                      </span>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isPublished}
                          onChange={(e) => setIsPublished(e.target.checked)}
                          className="w-4 h-4 accent-foreground"
                        />
                        <span className="font-bold text-foreground">
                          Langsung Publikasikan ke Katalog Publik
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEKSI D: SINOPSIS & DESKRIPSI */}
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
                    placeholder="Tuliskan ulasan singkat, sinopsis belakang buku, atau catatan mengapa buku ini menarik untuk dibaca warga..."
                    className="w-full p-3 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none leading-relaxed"
                  />
                  <div className="flex justify-end text-[10px] text-muted mt-1">
                    <span>{description.length} / 2000 Karakter</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: COVER IMAGE & LIVE PREVIEW (4 COLS) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
              <div className="p-6 border-2 border-foreground bg-surface space-y-4">
                <div className="border-b border-border-hairline pb-2">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    VISUAL SAMPUL
                  </div>
                  <h3 className="font-serif text-base font-bold text-foreground">
                    Pratinjau Sampul Buku
                  </h3>
                </div>

                <div className="font-mono text-xs space-y-2">
                  <label className="block text-[10px] uppercase text-muted font-bold">
                    URL Gambar Sampul (HTTPS)
                  </label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                  />
                  <span className="text-[10px] text-muted block">
                    Masukkan URL gambar sampul beresolusi jelas.
                  </span>
                </div>

                {/* Cover Live Preview Card */}
                <div className="border border-dashed border-border-hairline bg-surface-muted/30 p-4 flex flex-col items-center justify-center text-center min-h-[260px]">
                  {coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImage}
                      alt={title || 'Pratinjau Sampul'}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-36 h-52 object-cover border border-foreground shadow-md"
                    />
                  ) : (
                    <div className="space-y-2 text-muted">
                      <ImageIcon className="w-10 h-10 mx-auto stroke-1" />
                      <p className="font-mono text-[11px]">
                        Belum ada tautan sampul.<br />
                        Katalog akan memakai sampul tipografi standar.
                      </p>
                    </div>
                  )}
                </div>

                {/* Mini Meta Preview */}
                <div className="p-3 bg-surface-muted border border-border-hairline font-mono text-xs space-y-1">
                  <div className="font-bold font-serif text-sm text-foreground truncate">
                    {title || 'Judul Buku Belum Diisi'}
                  </div>
                  <div className="text-[11px] text-muted truncate">
                    {author ? `Karya ${author}` : 'Penulis belum diisi'}
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[10px]">
                    <span className="px-1.5 py-0.5 bg-foreground text-background font-bold">
                      {initialCopies} EKSEMPLAR
                    </span>
                    <span className="text-muted">
                      {isBorrowable ? 'BISA DIPINJAM' : 'BACA DI TEMPAT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="p-4 border border-border-hairline bg-surface space-y-3 font-mono text-xs">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Mendaftarkan Pustaka...' : 'Simpan & Terbitkan'}</span>
                </button>

                <Link
                  href="/admin/buku"
                  className="w-full py-2.5 border border-border-hairline text-center block text-muted hover:text-foreground hover:bg-surface-muted transition-colors uppercase tracking-wider font-semibold"
                >
                  Batal & Kembali
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
