'use client';

import * as React from 'react';
import { apiClient } from '@/lib/api';
import { Language } from '@perpusjal/types';
import { BookCoverUploader } from '@/components/admin/book-cover-uploader';
import {
  X,
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface AdminAddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdminAddBookModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminAddBookModalProps) {
  // Categories
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
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  // Load categories on open
  React.useEffect(() => {
    if (!isOpen) return;

    async function loadCategories() {
      try {
        const res = await apiClient<{ data: CategoryItem[] }>('/articles/categories');
        if (res.data?.data) {
          setCategories(res.data.data);
          if (res.data.data.length > 0 && !categoryId) {
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
  }, [isOpen, categoryId]);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setIsbn('');
    setPublisher('');
    setPublicationYear('');
    setPages('');
    setShelfLocation('');
    setDonatedBy('');
    setInitialCopies(1);
    setIsBorrowable(true);
    setIsPublished(true);
    setDescription('');
    setCoverImage('');
    setError(null);
  };

  const handleSave = async (stayOpen = false) => {
    if (!title.trim() || !author.trim() || !categoryId) {
      setError('Judul buku, nama penulis, dan kategori wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessNotice(null);

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
        setSuccessNotice(`Buku "${title}" berhasil didaftarkan!`);
        onSuccess?.();

        if (stayOpen) {
          resetForm();
        } else {
          setTimeout(() => {
            onClose();
            resetForm();
          }, 600);
        }
      }
    } catch {
      setError('Terjadi kendala saat menyimpan buku.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-4xl bg-surface border-2 border-foreground shadow-2xl max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border-hairline flex items-start justify-between bg-surface-muted/30">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
              <BookOpen className="w-3.5 h-3.5" />
              <span>KATALOGISASI PUSTAKA // POP-UP FORMULIR</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mt-0.5">
              Tambah Koleksi Buku Baru
            </h2>
            <p className="font-mono text-xs text-muted mt-0.5">
              Isi metadata dan unggah sampul buku. Sistem otomatis mencetak nomor inventaris fisik.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 border border-border-hairline hover:bg-foreground hover:text-background text-foreground transition-colors shrink-0 ml-4"
            aria-label="Tutup Pop-up"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notices */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-800 font-mono text-xs flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="font-bold ml-2">&times;</button>
          </div>
        )}
        {successNotice && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 font-mono text-xs flex justify-between items-center animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button onClick={() => setSuccessNotice(null)} className="font-bold ml-2">&times;</button>
          </div>
        )}

        {/* Modal Body - 2 Columns Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Seksi A: Informasi Utama */}
              <div className="space-y-4">
                <div className="border-b border-border-hairline pb-1.5 flex justify-between items-center">
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">
                    1. Informasi Pokok Pustaka
                  </h3>
                  <span className="font-mono text-[9px] text-muted uppercase">* Wajib</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-foreground mb-1">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-foreground mb-1">
                        Penulis / Pengarang *
                      </label>
                      <input
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Contoh: Pramoedya A. Toer"
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-foreground mb-1">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-foreground mb-1">
                        Bahasa
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                      >
                        <option value={Language.ID}>Bahasa Indonesia (ID)</option>
                        <option value={Language.JV}>Basa Jawa (JV)</option>
                        <option value={Language.EN}>English (EN)</option>
                        <option value={Language.OTHER}>Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-foreground mb-1">
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

              {/* Seksi B: Inventaris Lapak Fisik */}
              <div className="space-y-4 pt-2">
                <div className="border-b border-border-hairline pb-1.5">
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">
                    2. Inventaris Lapak & Sirkulasi
                  </h3>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-foreground mb-1">
                        Lokasi Rak / Dus Lapak
                      </label>
                      <input
                        type="text"
                        value={shelfLocation}
                        onChange={(e) => setShelfLocation(e.target.value)}
                        placeholder="Contoh: Dus Alun-Alun A"
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-foreground mb-1">
                        Donatur / Sumber Buku
                      </label>
                      <input
                        type="text"
                        value={donatedBy}
                        onChange={(e) => setDonatedBy(e.target.value)}
                        placeholder="Contoh: Donasi Warga CFD"
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-sans text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-foreground mb-1">
                        Eksemplar Fisik Awal
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={initialCopies}
                        onChange={(e) => setInitialCopies(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 border border-border-hairline bg-surface text-foreground font-mono text-sm focus:border-foreground focus:outline-none"
                      />
                      <span className="text-[9px] text-muted mt-0.5 block">
                        Auto: PJ-{new Date().getFullYear()}-XXXX
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isBorrowable}
                          onChange={(e) => setIsBorrowable(e.target.checked)}
                          className="w-4 h-4 accent-foreground"
                        />
                        <span className="font-bold text-foreground text-[11px]">
                          Bisa Dipinjam Pulang
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isPublished}
                          onChange={(e) => setIsPublished(e.target.checked)}
                          className="w-4 h-4 accent-foreground"
                        />
                        <span className="font-bold text-foreground text-[11px]">
                          Terbitkan ke Katalog Publik
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seksi C: Bibliografi Tambahan */}
              <div className="space-y-4 pt-2">
                <div className="border-b border-border-hairline pb-1.5">
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">
                    3. Detail Tambahan (Opsional)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-foreground mb-1">
                      ISBN
                    </label>
                    <input
                      type="text"
                      maxLength={13}
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="978xxxxxxx"
                      className="w-full px-3 py-1.5 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-foreground mb-1">
                      Penerbit
                    </label>
                    <input
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="Penerbit..."
                      className="w-full px-3 py-1.5 border border-border-hairline bg-surface text-foreground font-sans text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-foreground mb-1">
                      Tahun Terbit
                    </label>
                    <input
                      type="number"
                      min="1800"
                      max="2100"
                      value={publicationYear}
                      onChange={(e) => setPublicationYear(e.target.value)}
                      placeholder="Tahun..."
                      className="w-full px-3 py-1.5 border border-border-hairline bg-surface text-foreground font-mono text-xs focus:border-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Uploader & Synopsis (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Cover Uploader with Compression & Progress Bar */}
              <div className="p-4 border-2 border-foreground bg-surface space-y-2">
                <BookCoverUploader
                  value={coverImage}
                  onChange={setCoverImage}
                />
              </div>

              {/* Synopsis Textarea */}
              <div className="p-4 border border-border-hairline bg-surface space-y-2">
                <div className="flex items-center justify-between border-b border-border-hairline pb-1.5">
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">
                    Sinopsis / Ulasan Singkat
                  </h3>
                  <span className="font-mono text-[9px] text-muted">
                    {description.length} / 2000
                  </span>
                </div>

                <textarea
                  rows={4}
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Catatan kurasi, ulasan singkat buku, atau alasan buku ini wajib dibaca warga..."
                  className="w-full p-2.5 border border-border-hairline bg-surface text-foreground font-sans text-xs focus:border-foreground focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-border-hairline bg-surface-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-border-hairline text-muted hover:text-foreground text-xs uppercase"
          >
            Batal
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={submitting}
              className="flex-1 sm:flex-initial px-4 py-2 border border-foreground bg-surface hover:bg-surface-muted text-foreground font-bold uppercase tracking-wider text-xs inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Simpan & Tambah Lagi</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={submitting}
              className="flex-1 sm:flex-initial px-5 py-2 bg-foreground text-background font-bold uppercase tracking-wider text-xs hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? 'Menyimpan...' : 'Simpan & Terbitkan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
