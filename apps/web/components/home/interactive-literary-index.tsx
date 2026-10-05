'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BookItem } from '@perpusjal/types';
import { ArrowRight, BookOpen, Quote, Sparkles } from 'lucide-react';
import { DigitalStampEffect } from '@/components/circulation/digital-stamp-effect';

export interface IndexCanonItem {
  id: string;
  code: string;
  slug: string;
  title: string;
  author: string;
  year: number;
  category: string;
  canonTag: 'PRAMOEDYA' | 'FILSAFAT' | 'SAMIN' | 'PEDAGOGI';
  quote: string;
  shelfLocation: string;
  isAvailable: boolean;
}

const SAMPLE_CANONS: IndexCanonItem[] = [
  {
    id: 'c-01',
    code: 'PJ-2026-0001',
    slug: 'bumi-manusia',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    year: 1980,
    category: 'Sastra & Roman',
    canonTag: 'PRAMOEDYA',
    quote: '“Seorang terpelajar harus sudah berbuat adil sejak dalam pikiran, apalagi dalam perbuatan.”',
    shelfLocation: 'RAK-SAS-01',
    isAvailable: true,
  },
  {
    id: 'c-02',
    code: 'PJ-2026-0045',
    slug: 'gadis-pantai',
    title: 'Gadis Pantai',
    author: 'Pramoedya Ananta Toer',
    year: 1982,
    category: 'Sastra & Roman',
    canonTag: 'PRAMOEDYA',
    quote: '“Kisah pilu penindasan feodalisme Jawa terhadap perempuan bersahaja dari kampung nelayan.”',
    shelfLocation: 'RAK-SAS-02',
    isAvailable: true,
  },
  {
    id: 'c-03',
    code: 'PJ-2026-0024',
    slug: 'madilog',
    title: 'Madilog',
    author: 'Tan Malaka',
    year: 1943,
    category: 'Sosial & Filsafat',
    canonTag: 'FILSAFAT',
    quote: '“Materialisme, Dialektika, dan Logika sebagai pedoman berpikir merdeka dari belenggu tahayul.”',
    shelfLocation: 'RAK-FIL-03',
    isAvailable: true,
  },
  {
    id: 'c-04',
    code: 'PJ-2026-0188',
    slug: 'samin-surosentiko',
    title: 'Samin Surosentiko & Gerakan Petani',
    author: 'Kajian Sejarah Budaya Blora',
    year: 2015,
    category: 'Sejarah & Samin',
    canonTag: 'SAMIN',
    quote: '“Ono rupa ono rega. Perlawanan tanpa kekerasan Sedulur Sikep menjaga martabat tanah leluhur.”',
    shelfLocation: 'RAK-SEJ-02',
    isAvailable: true,
  },
  {
    id: 'c-05',
    code: 'PJ-2026-0112',
    slug: 'pendidikan-kaum-tertindas',
    title: 'Pendidikan Kaum Tertindas',
    author: 'Paulo Freire',
    year: 1968,
    category: 'Pedagogi Kritis',
    canonTag: 'PEDAGOGI',
    quote: '“Pendidikan yang membebaskan: Mengubah manusia dari obyek penindasan menjadi subyek perubahan.”',
    shelfLocation: 'RAK-PED-01',
    isAvailable: false,
  },
  {
    id: 'c-06',
    code: 'PJ-2026-0089',
    slug: 'laut-bercerita',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    year: 2017,
    category: 'Sastra & Roman',
    canonTag: 'PRAMOEDYA',
    quote: '“Kisah kehilangan, persahabatan, dan penegakan keadilan bagi korban penghilangan paksa masa reformasi.”',
    shelfLocation: 'RAK-SAS-03',
    isAvailable: true,
  },
  {
    id: 'c-07',
    code: 'PJ-2026-0165',
    slug: 'cerita-rakyat-nusantara',
    title: 'Cerita Rakyat & Fabel Jawa',
    author: 'Koleksi Dongeng Rakyat',
    year: 2019,
    category: 'Buku Anak & Fabel',
    canonTag: 'PEDAGOGI',
    quote: '“Menumbuhkan imajinasi dan nalar kritis anak-anak Blora sedini mungkin di hamparan terpal.”',
    shelfLocation: 'RAK-ANK-02',
    isAvailable: true,
  },
];

type CanonFilter = 'SEMUA' | 'PRAMOEDYA' | 'FILSAFAT' | 'SAMIN' | 'PEDAGOGI';

export function InteractiveLiteraryIndex({ className }: { className?: string }) {
  const [activeFilter, setActiveFilter] = React.useState<CanonFilter>('SEMUA');
  const [selectedItem, setSelectedItem] = React.useState<IndexCanonItem>(SAMPLE_CANONS[0]);

  const filteredItems = React.useMemo(() => {
    if (activeFilter === 'SEMUA') return SAMPLE_CANONS;
    return SAMPLE_CANONS.filter((item) => item.canonTag === activeFilter);
  }, [activeFilter]);

  return (
    <div className={cn('border-2 border-foreground bg-surface p-6 sm:p-8 space-y-6 rounded-none', className)}>
      {/* Masthead Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-foreground pb-4 gap-4">
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-foreground" />
            <span>[ INDEKS SASTRA // PILIHAN KURATOR LAPAK ]</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
            KATALOG TEMATIK &amp; KANON BACAAN
          </h3>
          <p className="font-serif italic text-xs sm:text-sm text-muted">
            Jejak pemikiran yang membentuk karakter perlawanan kultural dan kecintaan literasi warga Blora.
          </p>
        </div>

        {/* Canon Filters */}
        <div className="flex flex-wrap gap-1 font-mono text-[10px] uppercase tracking-wider shrink-0">
          {(
            [
              { key: 'SEMUA', label: 'SEMUA (7)' },
              { key: 'PRAMOEDYA', label: 'PRAMOEDYA' },
              { key: 'FILSAFAT', label: 'FILSAFAT' },
              { key: 'SAMIN', label: 'SAMIN BLORA' },
              { key: 'PEDAGOGI', label: 'PEDAGOGI' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                'px-2.5 py-1 border transition-colors cursor-pointer rounded-none font-bold',
                activeFilter === filter.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-surface text-muted border-border-hairline hover:text-foreground hover:border-foreground'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split: Table Index (Left) & Live Excerpt Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive List / Table */}
        <div className="lg:col-span-7 border border-border-hairline divide-y divide-border-hairline bg-background">
          {filteredItems.map((item, idx) => {
            const isSelected = selectedItem.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  'p-3.5 sm:p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors',
                  isSelected ? 'bg-surface-muted/70 font-semibold' : 'hover:bg-surface-muted/30'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-muted text-[10px] shrink-0">
                    {`${idx + 1}`.padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="font-serif text-sm text-foreground truncate">
                      {item.title}
                    </div>
                    <div className="font-mono text-[10px] text-muted truncate">
                      {item.author} &bull; {item.year}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[9px] uppercase border border-border-hairline px-1.5 py-0.5 hidden sm:inline">
                    {item.shelfLocation}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border',
                      item.isAvailable
                        ? 'border-foreground text-foreground'
                        : 'border-border-hairline text-muted bg-surface-muted'
                    )}
                  >
                    {item.isAvailable ? '● TERSEDIA' : '○ DIPINJAM'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Canon Excerpt Dossier */}
        <div className="lg:col-span-5 p-6 border-2 border-foreground bg-background space-y-4 font-mono select-none">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2.5 text-[10px] uppercase text-muted tracking-widest">
            <span>BERKAS INDEKS // {selectedItem.code}</span>
            <span className="font-bold text-foreground">{selectedItem.category}</span>
          </div>

          <div className="space-y-1">
            <h4 className="font-serif text-2xl font-black uppercase text-foreground leading-tight">
              {selectedItem.title}
            </h4>
            <p className="font-serif italic text-xs text-muted">
              Karya {selectedItem.author} (Terbit {selectedItem.year})
            </p>
          </div>

          {/* Quotation Pull-Box */}
          <div className="p-4 bg-surface border-l-4 border-foreground space-y-2">
            <Quote className="w-4 h-4 text-muted" />
            <p className="font-serif italic text-sm text-foreground/90 leading-relaxed">
              {selectedItem.quote}
            </p>
            <div className="text-right text-[9px] uppercase text-muted">
              — Catatan Kurasi Perpusjal Blora
            </div>
          </div>

          {/* Stamp & Borrow Call to Action */}
          <div className="pt-2 flex items-center justify-between gap-4 border-t border-border-hairline">
            <DigitalStampEffect
              variant={selectedItem.isAvailable ? 'TERSEDIA' : 'DIPINJAM'}
              size="sm"
            />

            <Link
              href={`/buku/${selectedItem.slug}`}
              className="px-4 py-2 bg-foreground text-background font-mono text-[10.5px] uppercase font-bold tracking-wider hover:bg-background hover:text-foreground border border-foreground transition-all inline-flex items-center gap-1.5"
            >
              <span>BUKA BERKAS BUKU</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
