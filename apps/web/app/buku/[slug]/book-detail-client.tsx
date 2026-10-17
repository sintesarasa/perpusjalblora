'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CustomLoader } from '@/components/ui/custom-loader';
import { EditorialPageSkeleton } from '@/components/ui/editorial-skeleton';
import { LibraryCheckoutSlip } from '@/components/circulation/library-checkout-slip';
import { DigitalStampEffect } from '@/components/circulation/digital-stamp-effect';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { apiClient } from '@/lib/api';
import { BookDetail, BookAvailabilityResponse, LoanItem, WaitlistItem, BookReviewItem } from '@perpusjal/types';
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
  Users,
  Star,
  MessageSquare,
  Sparkles,
  Quote,
} from 'lucide-react';

export function BookDetailClient({ slug: initialSlug }: { slug?: string } = {}) {
  const params = useParams();
  const router = useRouter();
  const slug = initialSlug || (params?.slug as string);

  const [book, setBook] = React.useState<BookDetail | null>(null);
  const [availability, setAvailability] = React.useState<BookAvailabilityResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Borrow Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [pickupPoint, setPickupPoint] = React.useState('BASECAMP');
  const [pickupDatePlan, setPickupDatePlan] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [note, setNote] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [modalError, setModalError] = React.useState<string | null>(null);
  const [loanSuccess, setLoanSuccess] = React.useState<LoanItem | null>(null);

  React.useEffect(() => {
    async function checkUserPhone() {
      try {
        const res = await apiClient<{ data?: any; phoneNumber?: string }>('/auth/me');
        const userData = (res.data as any)?.data || res.data;
        if (userData?.phoneNumber) {
          setPhoneNumber(userData.phoneNumber);
        }
      } catch {
        // guest or error
      }
    }
    checkUserPhone();
  }, []);

  // Waitlist State
  const [waitlistLoading, setWaitlistLoading] = React.useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = React.useState<WaitlistItem | null>(null);
  const [waitlistError, setWaitlistError] = React.useState<string | null>(null);

  const handleJoinWaitlist = async () => {
    if (!book) return;
    setWaitlistLoading(true);
    setWaitlistError(null);
    setWaitlistSuccess(null);

    const res = await apiClient<{ data: WaitlistItem; message: string }>('/waitlist', {
      method: 'POST',
      body: JSON.stringify({ bookId: book.id }),
    });

    setWaitlistLoading(false);

    if (res.error) {
      setWaitlistError(res.error.message);
      return;
    }

    if (res.data?.data) {
      setWaitlistSuccess(res.data.data);
    }
  };

  // Reviews state
  const [reviews, setReviews] = React.useState<BookReviewItem[]>([]);
  const [reviewStats, setReviewStats] = React.useState<{ averageRating: number; totalReviews: number }>({
    averageRating: 0,
    totalReviews: 0,
  });
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewContent, setReviewContent] = React.useState('');
  const [reviewSubmitting, setReviewSubmitting] = React.useState(false);
  const [reviewSuccess, setReviewSuccess] = React.useState<string | null>(null);
  const [reviewError, setReviewError] = React.useState<string | null>(null);

  const fetchReviews = React.useCallback(async () => {
    const res = await apiClient<{
      data: { items: BookReviewItem[]; averageRating: number; totalReviews: number };
    }>(`/books/${slug}/reviews`);
    if (res.data?.data) {
      setReviews(res.data.data.items || []);
      setReviewStats({
        averageRating: res.data.data.averageRating || 0,
        totalReviews: res.data.data.totalReviews || 0,
      });
    }
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;
    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);

    const res = await apiClient<{ data: BookReviewItem; message: string }>(`/books/${slug}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        rating: reviewRating,
        content: reviewContent.trim(),
      }),
    });

    setReviewSubmitting(false);

    if (res.error) {
      setReviewError(res.error.message);
      return;
    }

    setReviewSuccess('Resensimu berhasil disimpan! Terima kasih telah berbagi kesan baca.');
    setReviewContent('');
    fetchReviews();
  };

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
    fetchReviews();
  }, [slug, fetchReviews]);

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
        phoneNumber: phoneNumber.trim() || undefined,
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
        <main className="flex-1">
          <EditorialPageSkeleton title="MEMBUKA BERKAS PUSTAKA // ARSIP LAPAK BLORA" />
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
              {error || 'Buku yang kamu cari tidak tersedia dalam katalog atau telah diarsipkan.'}
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
            <RevealOnScroll variant="cinematic" delayMs={50}>
              <div className="border-2 border-foreground bg-surface p-2">
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
            </RevealOnScroll>

            {/* Availability Box */}
            <RevealOnScroll variant="stamp" delayMs={80}>
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

                      {/* Waitlist Status / Action */}
                      {waitlistSuccess ? (
                        <div className="p-3 bg-surface border-2 border-foreground space-y-2 text-center">
                          <div className="font-mono text-xs font-bold text-foreground flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-foreground" />
                            <span>TERDAFTAR DALAM ANTREAN</span>
                          </div>
                          <p className="font-sans text-[11px] text-muted">
                            Nomor Urut Antreanmu:{' '}
                            <strong className="font-mono text-sm text-foreground">
                              #{waitlistSuccess.position}
                            </strong>
                          </p>
                          <p className="font-sans text-[10px] text-muted">
                            Kurator akan mengalokasikan buku untukmu begitu eksemplar dikembalikan ke lapak.
                          </p>
                          <div className="pt-1">
                            <Link
                              href="/dashboard/pinjaman"
                              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-foreground underline underline-offset-2 hover:opacity-80"
                            >
                              <span>Pantau di Dasbor Pinjaman</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {waitlistError && (
                            <div className="p-2.5 bg-surface border border-destructive text-destructive font-sans text-[11px]">
                              {waitlistError}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handleJoinWaitlist}
                            disabled={waitlistLoading}
                            className="w-full py-2.5 border-2 border-foreground bg-surface hover:bg-foreground hover:text-background font-mono text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 text-foreground disabled:opacity-50"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{waitlistLoading ? 'MENDAFTAR...' : 'DAFTAR ANTREAN PEMBACA'}</span>
                          </button>
                          <p className="text-[10px] font-sans text-muted text-center leading-tight">
                            Dapatkan prioritas hak pinjam berikutnya saat pembaca lain mengembalikan buku ini.
                          </p>
                        </div>
                      )}
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
            </RevealOnScroll>
          </div>

          {/* RIGHT: Bibliographic Details & Description (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <RevealOnScroll variant="cinematic" delayMs={80}>
              <div className="space-y-8">
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

                {/* Donator Dedication Banner */}
                {book.donatedBy && (
                  <div className="p-4 border-2 border-foreground bg-surface font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 border border-foreground bg-surface-muted">
                        <HeartHandshake className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-muted tracking-widest block font-bold">
                          KOLEKSI SUMBANGAN WARGA // DONATUR BUKU
                        </span>
                        <span className="font-serif font-bold text-base text-foreground">
                          Disumbangkan oleh {book.donatedBy}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted uppercase tracking-wider font-semibold border border-border-hairline px-2.5 py-1 bg-surface-muted self-start sm:self-auto">
                      Perpustakaan Jalanan Blora
                    </span>
                  </div>
                )}

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
            </div>
          </RevealOnScroll>

            {/* Curator Note / Catatan Kurator Lapak */}
            {book.curatorNote && (
              <RevealOnScroll variant="cinematic" delayMs={90}>
                <div className="p-4 sm:p-5 border-2 border-foreground bg-surface-muted/40 font-mono text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-2 text-[10px] uppercase tracking-widest text-muted">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-foreground" />
                      [ CATATAN KURATOR LAPAK // REKOMENDASI RELAWAN ]
                    </span>
                    <span className="hidden sm:inline">PERPUSJAL BLORA</span>
                  </div>
                  <blockquote className="font-serif italic text-sm sm:text-base text-foreground leading-relaxed pt-1">
                    &ldquo;{book.curatorNote}&rdquo;
                  </blockquote>
                </div>
              </RevealOnScroll>
            )}

            {/* Synopsis / Description */}
            <RevealOnScroll variant="cinematic" delayMs={100}>
              <div className="space-y-4">
                <h2 className="font-mono text-sm uppercase tracking-widest font-bold text-foreground border-b border-border-hairline pb-2">
                  SINOPSIS & RINGKASAN BUKU
                </h2>
                <div className="font-sans text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line space-y-4">
                  {book.description || 'Belum ada sinopsis tercatat untuk naskah ini.'}
                </div>
              </div>
            </RevealOnScroll>

            {/* Eksemplar Status Table */}
            {book.copies && book.copies.length > 0 && (
              <RevealOnScroll variant="cinematic" delayMs={130}>
                <div className="space-y-3 pt-4 border-t border-border-hairline">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-muted" />
                    <span>INVENTARIS EKSEMPLAR FISIK LAPAK ({book.copies.length})</span>
                  </h3>
                  <span className="font-mono text-[10px] text-muted">
                    Sinkron dengan label stiker QR buku fisik
                  </span>
                </div>

                {/* Desktop/Tablet Table (hidden on mobile <sm) */}
                <div className="hidden sm:block border border-border-hairline bg-surface overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-surface-muted border-b border-border-hairline text-muted uppercase text-[10px]">
                      <tr>
                        <th className="p-3 font-bold">Kode Inventaris</th>
                        <th className="p-3 font-bold">Kondisi Fisik</th>
                        <th className="p-3 font-bold">Status Sirkulasi</th>
                        <th className="p-3 font-bold">Catatan Lapak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-hairline">
                      {book.copies.map((copy) => (
                        <tr key={copy.id} className="hover:bg-surface-muted/30">
                          <td className="p-3 font-bold text-foreground tracking-wider">
                            <span className="px-2 py-0.5 bg-surface-muted border border-border-hairline">
                              {copy.inventoryCode}
                            </span>
                          </td>
                          <td className="p-3 text-muted">
                            <span className="px-1.5 py-0.5 border border-border-hairline text-[10px] uppercase font-semibold">
                              {copy.condition}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] uppercase font-bold inline-flex items-center gap-1.5 ${
                                copy.status === 'AVAILABLE'
                                  ? 'bg-surface text-foreground border border-foreground'
                                  : copy.status === 'BORROWED'
                                  ? 'bg-surface-muted text-muted border border-border-hairline'
                                  : 'bg-foreground text-background border border-foreground'
                              }`}
                            >
                              <span>{copy.status === 'AVAILABLE' ? '●' : copy.status === 'BORROWED' ? '○' : '▲'}</span>
                              <span>
                                {copy.status === 'AVAILABLE'
                                  ? 'TERSEDIA DI LAPAK'
                                  : copy.status === 'BORROWED'
                                  ? 'SEDANG DIPINJAM'
                                  : copy.status}
                              </span>
                            </span>
                          </td>
                          <td className="p-3 text-muted italic font-sans text-xs">{copy.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Viewport Table Swap: Stacked Cards (visible on mobile <sm) */}
                <div className="block sm:hidden space-y-2.5">
                  {book.copies.map((copy) => (
                    <div
                      key={copy.id}
                      className="p-3 border border-border-hairline bg-surface space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 bg-surface-muted border border-border-hairline font-bold text-foreground tracking-wider">
                          {copy.inventoryCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold inline-flex items-center gap-1 ${
                            copy.status === 'AVAILABLE'
                              ? 'bg-surface text-foreground border border-foreground'
                              : copy.status === 'BORROWED'
                              ? 'bg-surface-muted text-muted border border-border-hairline'
                              : 'bg-foreground text-background border border-foreground'
                          }`}
                        >
                          <span>{copy.status === 'AVAILABLE' ? '●' : copy.status === 'BORROWED' ? '○' : '▲'}</span>
                          <span>
                            {copy.status === 'AVAILABLE'
                              ? 'TERSEDIA'
                              : copy.status === 'BORROWED'
                              ? 'DIPINJAM'
                              : copy.status}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-border-hairline">
                        <span>Kondisi: <strong className="text-foreground uppercase">{copy.condition}</strong></span>
                        {copy.note && <span className="italic font-sans text-xs">{copy.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          )}

          {/* VINTAGE LIBRARY CHECKOUT SLIP & DIGITAL INK STAMP */}
          <RevealOnScroll variant="stamp" delayMs={100}>
            <div className="space-y-4 pt-6 border-t-2 border-foreground">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 bg-foreground inline-block" />
                    <span>KARTU KENDALI SIRKULASI FISIK (DUE DATE SLIP)</span>
                  </h3>
                  <p className="font-mono text-[10px] text-muted mt-0.5">
                    Visual slip peminjaman klasik yang tertempel pada sampul dalam buku. Klik cap stempel untuk animasi stempel fisik.
                  </p>
                </div>
                <div className="shrink-0">
                  <DigitalStampEffect
                    variant={book.availableCopies > 0 ? 'TERSEDIA' : 'DIPINJAM'}
                    size="sm"
                  />
                </div>
              </div>

              <LibraryCheckoutSlip
                bookCode={book.copies?.[0]?.inventoryCode || `PJ-2026-${book.id.slice(-4).toUpperCase()}`}
                bookTitle={book.title}
                bookAuthor={book.author}
                shelfLocation={book.shelfLocation || 'RAK-CFD-01 (TERPAL ALUN-ALUN)'}
                activeLoan={
                  book.availableCopies <= 0
                    ? {
                        borrowDate: 'Sirkulasi Aktif',
                        dueDate: 'Lapak CFD Mendatang',
                        borrowerName: 'Sedang Dibaca Warga',
                        status: 'DIPINJAM',
                      }
                    : null
                }
              />
            </div>
          </RevealOnScroll>
        </div>
      </div>

        {/* REVIEWS & RESENSI PEMBACA SECTION */}
        <RevealOnScroll variant="cinematic" delayMs={100}>
          <section id="resensi" className="border-t-2 border-foreground pt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-hairline pb-3 gap-2">
              <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-muted">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-foreground" />
                  RESENSI & KESAN PEMBACA ({reviewStats.totalReviews})
                </span>
                <span>// OPINI WARGA</span>
              </div>

              {reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <div className="flex items-center text-foreground">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(reviewStats.averageRating)
                            ? 'fill-foreground text-foreground'
                            : 'text-border-hairline'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-foreground">{reviewStats.averageRating} / 5.0</span>
                  <span className="text-muted">({reviewStats.totalReviews} ulasan)</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT: Write Review Form (5 cols) */}
              <div className="lg:col-span-5 p-5 border-2 border-foreground bg-surface space-y-4 font-mono text-xs">
                <div className="border-b border-border-hairline pb-2">
                  <h3 className="font-serif font-bold text-base text-foreground font-sans">
                    Tuliskan Resensi Bacaan
                  </h3>
                  <p className="font-sans text-[11px] text-muted mt-0.5">
                    Bagikan catatan pinggir, kutipan, atau refleksi buku ini kepada sesama warga Blora.
                  </p>
                </div>

                {reviewSuccess && (
                  <div className="p-3 bg-surface-muted border border-foreground font-sans text-xs text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                    <span>{reviewSuccess}</span>
                  </div>
                )}

                {reviewError && (
                  <div className="p-3 bg-surface-muted border border-destructive font-sans text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase text-muted font-bold mb-1.5">
                      Penilaian Bintang
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                          title={`${star} Bintang`}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating
                                ? 'fill-foreground text-foreground'
                                : 'text-border-hairline hover:text-foreground'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-bold text-foreground text-xs">{reviewRating} dari 5</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-muted font-bold mb-1.5">
                      Catatan Resensi / Refleksi Baca
                    </label>
                    <textarea
                      rows={4}
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Bagikan apa yang menarik, kutipan favorit, atau mengapa warga lain wajib membaca buku ini..."
                      className="w-full p-2.5 bg-surface-muted border border-border-hairline rounded-none text-xs font-sans text-foreground focus:outline-none focus:border-foreground resize-none"
                      maxLength={1000}
                      required
                    />
                    <div className="flex justify-between text-[10px] text-muted pt-1">
                      <span>Minimal 5 karakter</span>
                      <span>{reviewContent.length}/1000</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting || !reviewContent.trim()}
                    className="w-full py-2.5 bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{reviewSubmitting ? 'Menyimpan...' : 'KIRIM RESENSI'}</span>
                  </button>
                </form>
              </div>

              {/* RIGHT: Reviews List (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {reviews.length === 0 ? (
                  <div className="p-8 text-center border border-border-hairline bg-surface-muted/30 font-mono text-xs space-y-2">
                    <p className="text-muted italic">Belum ada resensi untuk buku ini.</p>
                    <p className="font-sans text-[11px] text-muted">
                      Jadilah pembaca pertama yang membagikan kesan membaca!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 font-sans">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 border border-border-hairline bg-surface hover:border-foreground transition-colors space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 border border-foreground bg-surface-muted flex items-center justify-center font-mono text-xs font-bold uppercase shrink-0">
                              {rev.user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-foreground font-mono">
                                  {rev.user.name}
                                </span>
                                {rev.isVerifiedBorrower && (
                                  <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-foreground text-background font-bold inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    Peminjam Terverifikasi
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-muted font-mono">@{rev.user.username}</span>
                            </div>
                          </div>

                          {/* Stars */}
                          <div className="flex items-center text-foreground shrink-0">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating ? 'fill-foreground text-foreground' : 'text-border-hairline'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line pl-9">
                          {rev.content}
                        </p>

                        <div className="pl-9 text-[10px] font-mono text-muted">
                          {new Date(rev.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* Similar Books Section */}
        {book.similarBooks && book.similarBooks.length > 0 && (
          <RevealOnScroll variant="cinematic" delayMs={120}>
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
          </RevealOnScroll>
        )}
      </main>

      {/* Borrow Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg max-h-[92dvh] bg-surface border-2 border-foreground flex flex-col font-sans rounded-none overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-hairline p-4 sm:p-5 shrink-0">
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
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-foreground transition-colors"
                aria-label="Tutup Formulir"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable for Mobile Keyboard Safety) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loanSuccess ? (
                <div className="space-y-4 text-center py-2">
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
                      Pengurus akan meninjau pengajuanmu. Setelah disetujui, kode pengambilan 6 digit akan muncul di dasbor pinjamanmu.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/dashboard/pinjaman"
                      className="flex-1 min-h-[44px] flex items-center justify-center py-2.5 px-4 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold text-center hover:bg-foreground/90 transition-colors"
                    >
                      Buka Dasbor Pinjaman
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setModalOpen(false);
                        setLoanSuccess(null);
                      }}
                      className="min-h-[44px] px-5 py-2.5 border border-border-hairline font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground flex items-center justify-center"
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

                  <div className="space-y-1.5">
                    <label className="block font-mono text-xs uppercase text-foreground">
                      Pilih Titik Pengambilan Buku:
                    </label>
                    <select
                      value={pickupPoint}
                      onChange={(e) => setPickupPoint(e.target.value)}
                      className="w-full min-h-[44px] p-2.5 bg-surface-muted border border-border-hairline rounded-none text-xs text-foreground focus:outline-none focus:border-foreground focus-visible:ring-1 focus-visible:ring-foreground font-mono"
                    >
                      <option value="BASECAMP">Basecamp Perpusjal (Jl. Pemuda No. 12, Blora)</option>
                      <option value="ALUN_ALUN">Lapak CFD Alun-Alun Blora (Minggu Pagi 06:00 - 09:30)</option>
                      <option value="TAMAN_TIRTONADI">Lapak Sore Taman Tirtonadi (Sabtu Sore 15:30 - 18:00)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-xs uppercase text-foreground">
                      Rencana Tanggal Pengambilan (Opsional):
                    </label>
                    <input
                      type="date"
                      value={pickupDatePlan}
                      onChange={(e) => setPickupDatePlan(e.target.value)}
                      className="w-full min-h-[44px] p-2.5 bg-surface-muted border border-border-hairline rounded-none text-xs text-foreground focus:outline-none focus:border-foreground focus-visible:ring-1 focus-visible:ring-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-xs uppercase text-foreground">
                      Nomor WhatsApp / HP:
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      maxLength={20}
                      className="w-full min-h-[44px] p-2.5 bg-surface-muted border border-border-hairline rounded-none text-xs text-foreground focus:outline-none focus:border-foreground focus-visible:ring-1 focus-visible:ring-foreground font-mono"
                    />
                    <span className="font-mono text-[10px] text-muted block">
                      Diperlukan relawan untuk koordinasi saat buku disiapkan di meja lapak.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-xs uppercase text-foreground">
                      Catatan untuk Pengurus (Opsional):
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Contoh: Saya ambil saat istirahat siang sekolah..."
                      maxLength={300}
                      className="w-full min-h-[44px] p-2.5 bg-surface-muted border border-border-hairline rounded-none text-xs text-foreground focus:outline-none focus:border-foreground focus-visible:ring-1 focus-visible:ring-foreground"
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
                      className="min-h-[44px] px-5 py-2.5 border border-border-hairline text-muted hover:text-foreground uppercase tracking-wider flex items-center justify-center"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="min-h-[44px] px-6 py-2.5 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Mengirim...' : 'Kirim Pengajuan'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <RevealOnScroll variant="fade" delayMs={60}>
        <Footer />
      </RevealOnScroll>
    </div>
  );
}
