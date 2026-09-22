'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomLoader } from '@/components/ui/custom-loader';
import { apiClient } from '@/lib/api';
import { BookDetail, BookAvailabilityResponse, LoanItem } from '@perpusjal/types';
import {
  BookOpen,
  ArrowLeft,
  MapPin,
  Calendar,
  Layers,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  X,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [book, setBook] = React.useState<BookDetail | null>(null);
  const [availability, setAvailability] = React.useState<BookAvailabilityResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Borrow Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [pickupPoint, setPickupPoint] = React.useState('BASECAMP');
  const [pickupDatePlan, setPickupDatePlan] = React.useState('');
  const [note, setNote] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);
  const [loanSuccess, setLoanSuccess] = React.useState<LoanItem | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const [bookRes, availRes] = await Promise.all([
      apiClient<{ data: BookDetail }>(`/books/${slug}`),
      apiClient<{ data: BookAvailabilityResponse }>(`/books/${slug}/availability`),
    ]);

    setLoading(false);

    if (bookRes.error) {
      setError(bookRes.error.message);
      return;
    }

    if (bookRes.data) {
      setBook(bookRes.data.data);
    }
    if (availRes.data) {
      setAvailability(availRes.data.data);
    }
  }, [slug]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    setSubmitting(true);
    setModalError(null);

    const pickupLabels: Record<string, string> = {
      BASECAMP: 'Basecamp Perpusjal (Jl. Pemuda 12)',
      ALUN_ALUN: 'Lapak CFD Alun-Alun Blora (Minggu)',
      TAMAN_TIRTONADI: 'Lapak Sore Taman Tirtonadi (Sabtu)',
    };

    const res = await apiClient<{ data: LoanItem; message: string }>('/loans', {
      method: 'POST',
      body: JSON.stringify({
        bookId: book.id,
        pickupPoint: pickupLabels[pickupPoint] || pickupPoint,
        pickupDatePlan: pickupDatePlan || undefined,
        note: note.trim() || undefined,
      }),
    });

    setSubmitting(false);

    if (res.error) {
      setModalError(res.error.message);
      return;
    }

    if (res.data) {
      setLoanSuccess(res.data.data);
      // Reload availability
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-12">
          <CustomLoader size="lg" label="MEMBUKA BERKAS PUSTAKA..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-20 text-center space-y-6">
          <div className="border-2 border-foreground p-12 bg-surface space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              KODE // 404
            </span>
            <h1 className="font-serif text-3xl font-normal text-foreground">Buku Tidak Ditemukan</h1>
            <p className="font-sans text-sm text-muted max-w-md mx-auto">
              {error || 'Buku yang Anda cari tidak tersedia dalam katalog atau telah diarsipkan.'}
            </p>
            <div className="pt-4">
              <Link
                href="/buku"
                className="font-mono text-xs uppercase tracking-wider text-foreground underline underline-offset-4"
              >
                &larr; Kembali ke Katalog Pustaka
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const eligibility = availability?.userEligibility;
  const canBorrow = eligibility?.canBorrow ?? (book.availableCopies > 0 && book.isBorrowable);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Back navigation */}
        <div>
          <Link
            href="/buku"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Katalog Pustaka</span>
          </Link>
        </div>

        {/* Main Dossier Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Cover & Quick Availability (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border-2 border-foreground bg-surface p-2 shadow-sm">
              <div className="relative aspect-[3/4] bg-surface-muted border border-border-hairline overflow-hidden">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full p-8 flex flex-col justify-between border-4 border-double border-border-hairline bg-[#f4f4f0] dark:bg-[#141414] text-center">
                    <span className="font-mono text-xs uppercase tracking-widest text-muted">
                      PERPUSJAL BLORA
                    </span>
                    <div className="space-y-3">
                      <BookOpen className="w-12 h-12 text-foreground/40 mx-auto" />
                      <h2 className="font-serif font-bold text-xl text-foreground line-clamp-3">
                        {book.title}
                      </h2>
                      <p className="font-sans text-sm italic text-muted">{book.author}</p>
                    </div>
                    <span className="font-mono text-[10px] text-muted tracking-wider">
                      ARSIP LITERASI
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Box */}
            <div className="p-5 border border-foreground bg-surface space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                <span className="text-muted uppercase">STATUS DI LAPAK:</span>
                <span className="font-bold text-foreground">
                  {book.availableCopies} DARI {book.totalCopies} TERSEDIA
                </span>
              </div>

              {book.isBorrowable ? (
                book.availableCopies > 0 ? (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-surface-muted border-l-2 border-foreground text-[11px] font-sans text-muted">
                      Buku tersedia untuk dipinjam secara langsung atau diambil pada lapak terjadwal.
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="w-full py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      AJUKAN PINJAM BUKU
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-surface-muted border border-border-hairline text-[11px] font-sans text-muted space-y-1">
                      <p className="font-bold text-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Semua eksemplar sedang dipinjam.
                      </p>
                      {availability?.estimatedReturnDate && (
                        <p>
                          Estimasi kembali terdekat:{' '}
                          <strong className="text-foreground">
                            {new Date(availability.estimatedReturnDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </strong>
                        </p>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="p-3 bg-surface-muted border border-border-hairline text-center text-muted text-xs">
                  Buku ini adalah koleksi referensi dan hanya dapat dibaca di tempat / lapak.
                </div>
              )}

              {eligibility && !eligibility.canBorrow && eligibility.message && (
                <div className="p-2.5 border border-dashed border-destructive/60 bg-surface-muted text-destructive text-[11px] font-sans">
                  {eligibility.message}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Bibliographic Details & Description (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Title & Category Header */}
            <div className="border-b-2 border-foreground pb-6 space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
                <span className="px-2 py-0.5 border border-foreground text-foreground font-bold">
                  {book.category.name}
                </span>
                <span>// KODE PUSTAKA: {book.slug}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
                {book.title}
              </h1>

              <p className="font-serif italic text-lg sm:text-xl text-foreground/80">
                Karya {book.author}
              </p>
            </div>

            {/* Bibliographic Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 bg-surface border border-border-hairline font-mono text-xs">
              <div>
                <span className="block text-[10px] text-muted uppercase">Penerbit:</span>
                <span className="font-bold text-foreground">{book.publisher || '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-muted uppercase">Tahun Terbit:</span>
                <span className="font-bold text-foreground">{book.publicationYear || '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-muted uppercase">Nomor ISBN:</span>
                <span className="font-bold text-foreground">{book.isbn || '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-muted uppercase">Jumlah Halaman:</span>
                <span className="font-bold text-foreground">
                  {book.pages ? `${book.pages} hlm.` : '—'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-muted uppercase">Lokasi Rak Fisik:</span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted" />
                  {book.shelfLocation || 'Basecamp'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-muted uppercase">Donatur Koleksi:</span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3 text-muted" />
                  {book.donatedBy || 'Koleksi Komunitas'}
                </span>
              </div>
            </div>

            {/* Synopsis / Description */}
            <div className="space-y-4">
              <h2 className="font-mono text-sm uppercase tracking-widest font-bold text-foreground border-b border-border-hairline pb-2">
                SINOPSIS & RINGKASAN BUKU
              </h2>
              <div className="font-sans text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line space-y-4">
                {book.description || 'Belum ada sinopsis tercatat untuk naskah ini.'}
              </div>
            </div>

            {/* Eksemplar Status Table */}
            {book.copies && book.copies.length > 0 && (
              <div className="space-y-3 pt-4">
                <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-foreground">
                  DAFTAR EKSEMPLAR FISIK ({book.copies.length})
                </h3>
                <div className="border border-border-hairline bg-surface overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-surface-muted border-b border-border-hairline text-muted uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Kode Inventaris</th>
                        <th className="p-3">Kondisi Buku</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-hairline">
                      {book.copies.map((copy) => (
                        <tr key={copy.id} className="hover:bg-surface-muted/30">
                          <td className="p-3 font-bold text-foreground">{copy.inventoryCode}</td>
                          <td className="p-3 text-muted">{copy.condition}</td>
                          <td className="p-3">
                            <span
                              className={`px-1.5 py-0.5 text-[10px] uppercase font-bold ${
                                copy.status === 'AVAILABLE'
                                  ? 'bg-foreground text-background'
                                  : 'border border-border-hairline text-muted'
                              }`}
                            >
                              {copy.status}
                            </span>
                          </td>
                          <td className="p-3 text-muted italic">{copy.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Books Section */}
        {book.similarBooks && book.similarBooks.length > 0 && (
          <section className="border-t-2 border-foreground pt-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border-hairline pb-2 font-mono text-xs uppercase tracking-widest text-muted">
              <span className="font-bold text-foreground">
                BUKU SEJENIS DALAM KATEGORI {book.category.name}
              </span>
              <span>// REKOMENDASI PUSTAKA</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {book.similarBooks.map((sim) => (
                <Link
                  key={sim.id}
                  href={`/buku/${sim.slug}`}
                  className="p-4 border border-border-hairline bg-surface hover:border-foreground transition-colors group block"
                >
                  <span className="font-mono text-[10px] uppercase text-muted block mb-1">
                    {sim.author}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-foreground group-hover:underline line-clamp-2">
                    {sim.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-muted">
                    <span>{sim.availableCopies} ada di rak</span>
                    <span className="font-bold text-foreground group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Borrow Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface border-2 border-foreground p-6 space-y-5 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-foreground">
                <BookOpen className="w-4 h-4" />
                <span>FORMULIR PEMINJAMAN BUKU</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setLoanSuccess(null);
                }}
                className="text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loanSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 border-2 border-foreground mx-auto flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6 text-foreground" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    Pengajuan Pinjaman Terkirim!
                  </h3>
                  <p className="font-sans text-xs text-muted">
                    Kode Transaksi: <strong className="font-mono text-foreground">{loanSuccess.loanCode}</strong>
                  </p>
                </div>

                <div className="p-4 bg-surface-muted border border-border-hairline text-xs font-mono text-left space-y-2">
                  <p className="text-foreground">
                    <strong>Titik Pengambilan:</strong> {loanSuccess.pickupPoint}
                  </p>
                  <p className="text-muted leading-relaxed">
                    Pengurus akan meninjau pengajuan Anda. Setelah disetujui, kode pengambilan 6 digit akan muncul di dasbor pinjaman Anda.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <Link
                    href="/dashboard/pinjaman"
                    className="flex-1 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold text-center hover:bg-foreground/90 transition-colors"
                  >
                    Buka Dasbor Pinjaman
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setLoanSuccess(null);
                    }}
                    className="px-4 py-2.5 border border-border-hairline font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBorrowSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="font-mono text-[11px] text-muted uppercase">Buku yang Dipinjam:</span>
                  <h4 className="font-serif font-bold text-lg text-foreground">{book.title}</h4>
                  <p className="font-sans text-xs text-muted">Karya {book.author}</p>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-xs uppercase text-foreground">
                    Pilih Titik Pengambilan Buku:
                  </label>
                  <select
                    value={pickupPoint}
                    onChange={(e) => setPickupPoint(e.target.value)}
                    className="w-full p-2.5 bg-surface-muted border border-border-hairline rounded-none text-xs text-foreground focus:outline-none focus:border-foreground font-mono"
                  >
                    <option value="BASECAMP">Basecamp Perpusjal (Jl. Pemuda No. 12, Blora)</option>
                    <option value="ALUN_ALUN">Lapak CFD Alun-Alun Blora (Minggu Pagi 06:00 - 09:30)</option>
                    <option value="TAMAN_TIRTONADI">Lapak Sore Taman Tirtonadi (Sabtu Sore 15:30 - 18:00)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-xs uppercase text-foreground">
                    Rencana Tanggal Pengambilan (Opsional):
                  </label>
                  <input
                    type="date"
                    value={pickupDatePlan}
                    onChange={(e) => setPickupDatePlan(e.target.value)}
                    className="w-full p-2.5 bg-surface-muted border border-border-hairline rounded-none text-xs text-foreground focus:outline-none focus:border-foreground font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-xs uppercase text-foreground">
                    Catatan untuk Pengurus (Opsional):
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Contoh: Saya ambil saat istirahat siang sekolah..."
                    maxLength={300}
                    className="w-full p-2.5 bg-surface-muted border border-border-hairline rounded-none text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="p-3 bg-surface-muted border-l-2 border-foreground text-[11px] font-sans text-muted leading-relaxed">
                  Pinjaman buku berlaku selama <strong>7 hari</strong> tanpa biaya maupun denda uang.
                  Harap rawat buku dengan penuh kasih sayang.
                </div>

                {modalError && (
                  <div className="p-3 border border-destructive bg-surface-muted text-xs font-mono text-destructive">
                    {modalError}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
