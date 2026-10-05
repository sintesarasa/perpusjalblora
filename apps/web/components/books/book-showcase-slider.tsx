'use client';

import * as React from 'react';
import Link from 'next/link';
import { BookItem, BookAvailabilityStatus } from '@perpusjal/types';
import {
  Flame,
  Star,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowRight,
  BookOpen,
  MapPin,
  Clock,
  AlertCircle,
  Pause,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ShowcaseMode = 'popular' | 'curator' | 'fresh';

interface BookShowcaseSliderProps {
  books: BookItem[];
  onPeekBook: (book: BookItem) => void;
  autoPlayIntervalMs?: number;
}

export function BookShowcaseSlider({
  books,
  onPeekBook,
  autoPlayIntervalMs = 5000,
}: BookShowcaseSliderProps) {
  const [activeMode, setActiveMode] = React.useState<ShowcaseMode>('popular');
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(true);

  // Group books according to the mode
  const showcaseBooks = React.useMemo(() => {
    if (books.length === 0) return [];

    if (activeMode === 'popular') {
      return [...books].sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0)).slice(0, 6);
    }

    if (activeMode === 'curator') {
      const featured = books.filter((b) => b.isFeatured);
      return (featured.length > 0 ? featured : books).slice(0, 6);
    }

    if (activeMode === 'fresh') {
      return [...books].slice(0, 6);
    }

    return books.slice(0, 6);
  }, [books, activeMode]);

  // Reset index when mode changes
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [activeMode]);

  // Handlers for slide navigation
  const handleNext = React.useCallback(() => {
    if (showcaseBooks.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % showcaseBooks.length);
  }, [showcaseBooks.length]);

  const handlePrev = React.useCallback(() => {
    if (showcaseBooks.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + showcaseBooks.length) % showcaseBooks.length);
  }, [showcaseBooks.length]);

  const handleSelectIndex = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Reliable Automatic Slide Timer
  React.useEffect(() => {
    if (!isPlaying || isHovered || showcaseBooks.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayIntervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, showcaseBooks.length, autoPlayIntervalMs, handleNext]);

  if (showcaseBooks.length === 0) return null;

  const currentBook = showcaseBooks[currentIndex] || showcaseBooks[0];

  const getStatusBadge = (availability: BookAvailabilityStatus, isBorrowable: boolean) => {
    if (!isBorrowable) {
      return (
        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border border-foreground/60 text-foreground bg-background font-semibold">
          BACA DI TEMPAT
        </span>
      );
    }
    switch (availability) {
      case 'AVAILABLE':
        return (
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 bg-foreground text-background font-bold inline-flex items-center gap-1 rounded-none">
            [ ● TERSEDIA DI RAK ]
          </span>
        );
      case 'LAST_ONE':
        return (
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border-2 border-foreground bg-background text-foreground font-bold inline-flex items-center gap-1 rounded-none">
            [ ◐ SISA 1 EKSEMPLAR ]
          </span>
        );
      case 'BORROWED':
        return (
          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border border-border-hairline text-muted bg-surface-muted inline-flex items-center gap-1 rounded-none">
            [ ○ SEDANG BERKELANA ]
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section
      aria-label="Etalase Sorotan Terpal"
      className="space-y-4"
    >
      {/* Top Section Header & Collection Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-foreground gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-foreground inline-block" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
            ETALASE SOROTAN TERPAL
          </span>
          <span className="text-border-hairline hidden sm:inline">//</span>
          <span className="font-mono text-[10px] uppercase text-muted hidden sm:inline">
            RUBRIK BUKU LAPAK MINGGU INI
          </span>
        </div>

        {/* 3 Showcase Tabs */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider select-none">
          <button
            type="button"
            onClick={() => setActiveMode('popular')}
            className={cn(
              'px-3 py-1.5 border transition-all inline-flex items-center gap-1.5 cursor-pointer',
              activeMode === 'popular'
                ? 'bg-foreground text-background border-foreground font-bold'
                : 'bg-surface text-muted border-border hover:border-foreground hover:text-foreground'
            )}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Paling Berkelana</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('curator')}
            className={cn(
              'px-3 py-1.5 border transition-all inline-flex items-center gap-1.5 cursor-pointer',
              activeMode === 'curator'
                ? 'bg-foreground text-background border-foreground font-bold'
                : 'bg-surface text-muted border-border hover:border-foreground hover:text-foreground'
            )}
          >
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Pilihan Kurator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('fresh')}
            className={cn(
              'px-3 py-1.5 border transition-all inline-flex items-center gap-1.5 cursor-pointer',
              activeMode === 'fresh'
                ? 'bg-foreground text-background border-foreground font-bold'
                : 'bg-surface text-muted border-border hover:border-foreground hover:text-foreground'
            )}
          >
            <Package className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Baru Masuk</span>
            <span className="sm:hidden">Anyar</span>
          </button>
        </div>
      </div>

      {/* Main Showcase Slide Box with Smooth Crossfade Animation */}
      <div
        className="border-2 border-foreground bg-surface p-6 sm:p-8 relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated Countdown Progress Bar at Top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-border-hairline overflow-hidden z-20 pointer-events-none">
          <div
            key={`progress-${currentIndex}-${activeMode}-${isPlaying}-${isHovered}`}
            className={cn(
              "h-full bg-foreground",
              isPlaying && !isHovered ? "animate-slider-progress" : "w-0"
            )}
            style={{
              animationDuration: `${autoPlayIntervalMs}ms`,
            }}
          />
        </div>

        <div
          key={`${activeMode}-${currentBook.id}`}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center animate-editorial-slide"
        >
          {/* Left Column: Physical Book Artwork with 3D Spine */}
          <div className="md:col-span-4 lg:col-span-3 flex justify-center">
            <div className="w-48 sm:w-56 aspect-[3/4] relative group/cover select-none">
              {/* Book Spine 3D Accent */}
              <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/35 via-black/15 to-transparent z-20 pointer-events-none rounded-none" />
              <div className="absolute -inset-1 bg-foreground/10 translate-x-1.5 translate-y-1.5 -z-10 border border-foreground/20" />

              <div className="w-full h-full border-2 border-foreground bg-background overflow-hidden relative">
                {currentBook.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentBook.coverImage}
                    alt={currentBook.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/cover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full p-4 flex flex-col justify-between border-2 border-foreground/30 bg-[#f4f4ee] dark:bg-[#141414] text-foreground select-none">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted">
                      PERPUSJAL // {currentBook.category.name}
                    </span>
                    <div className="space-y-1 text-center my-auto">
                      <BookOpen className="w-6 h-6 text-foreground/40 mx-auto" />
                      <h4 className="font-serif font-black text-sm text-foreground uppercase line-clamp-3">
                        {currentBook.title}
                      </h4>
                      <p className="font-mono text-[10px] text-muted line-clamp-1 italic">
                        {currentBook.author}
                      </p>
                    </div>
                    <span className="text-[8px] font-mono text-muted text-center tracking-wider">
                      ARSIP BLORA
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Highlight & Pull Quote */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            {/* Tag / Rank Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-foreground text-background font-mono text-[9px] uppercase font-bold tracking-widest">
                  {activeMode === 'popular'
                    ? `FAVORIT LAPAK // KELANA ${currentBook.borrowCount || 1}X`
                    : activeMode === 'curator'
                    ? 'REKOMENDASI RELAWAN KURATOR'
                    : 'KOLEKSI ANYAR MINGGU INI'}
                </span>
                <span className="font-mono text-[10px] uppercase text-muted font-bold">
                  [{currentBook.category.name}]
                </span>
              </div>

              <div>{getStatusBadge(currentBook.availability, currentBook.isBorrowable)}</div>
            </div>

            {/* Title & Author */}
            <div className="space-y-1">
              <Link href={`/buku/${currentBook.slug}`} className="block group">
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-foreground tracking-tight leading-tight group-hover:underline underline-offset-4">
                  {currentBook.title}
                </h3>
              </Link>
              <p className="font-mono text-xs sm:text-sm text-muted">
                Karya Sastrawan/Penulis:{' '}
                <strong className="text-foreground">{currentBook.author}</strong>
                {currentBook.publicationYear ? ` • Tahun ${currentBook.publicationYear}` : ''}
              </p>
            </div>

            {/* Pull Quote or Synopsis */}
            <div className="p-4 border-l-4 border-foreground bg-surface-muted/40 font-serif text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
              {currentBook.curatorNote ? (
                <span>&ldquo;{currentBook.curatorNote}&rdquo;</span>
              ) : currentBook.description ? (
                <span className="line-clamp-3">&ldquo;{currentBook.description}&rdquo;</span>
              ) : (
                <span>
                  &ldquo;Buku penting yang menjadi bahan perbincangan hangat di atas terpal Alun-Alun Blora saat Minggu pagi.&rdquo;
                </span>
              )}
            </div>

            {/* Shelf Location & Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border-hairline font-mono text-xs">
              <div className="flex items-center gap-3 text-muted text-[11px]">
                {currentBook.shelfLocation && (
                  <span className="flex items-center gap-1 text-foreground">
                    <MapPin className="w-3.5 h-3.5 text-muted" />
                    <span>Kotak/Rak: {currentBook.shelfLocation}</span>
                  </span>
                )}
                {currentBook.isbn && (
                  <span className="hidden sm:inline">ISBN: {currentBook.isbn}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPeekBook(currentBook)}
                  className="px-3.5 py-1.5 border border-border bg-background hover:bg-surface-muted hover:border-foreground text-foreground text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Intip Sinopsis</span>
                </button>

                <Link
                  href={`/buku/${currentBook.slug}`}
                  className="px-4 py-1.5 bg-foreground text-background font-bold text-[11px] uppercase tracking-wider hover:opacity-85 transition-opacity inline-flex items-center gap-1"
                >
                  <span>Pinjam Buku</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Footer */}
        <div className="mt-6 pt-4 border-t border-border-hairline flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {showcaseBooks.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectIndex(i)}
                className={cn(
                  'h-1.5 transition-all cursor-pointer',
                  currentIndex === i ? 'w-6 bg-foreground' : 'w-2 bg-border-hairline hover:bg-muted'
                )}
                aria-label={`Pindah ke slide ${i + 1}`}
              />
            ))}
            <span className="text-[10px] text-muted ml-2">
              {String(currentIndex + 1).padStart(2, '0')} / {String(showcaseBooks.length).padStart(2, '0')}
            </span>
          </div>

          {/* Controls: Play/Pause and Next/Prev */}
          <div className="flex items-center gap-2">
            {isHovered && isPlaying && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted hidden sm:inline px-1.5 py-0.5 border border-border-hairline bg-surface-muted">
                Kursor Aktif (Jeda)
              </span>
            )}
            {!isPlaying && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted hidden sm:inline px-1.5 py-0.5 border border-border-hairline bg-surface-muted">
                Dijeda
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="p-1.5 border border-border bg-background hover:border-foreground text-muted hover:text-foreground transition-colors cursor-pointer text-[10px]"
              title={isPlaying ? 'Jeda Slider Otomatis' : 'Putar Slider Otomatis'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 border border-foreground bg-background hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                aria-label="Buku sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 border border-foreground bg-background hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                aria-label="Buku berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
