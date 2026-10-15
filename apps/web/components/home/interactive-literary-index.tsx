'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArticleSummary } from '@perpusjal/types';
import { ArrowRight, Feather, Quote, Sparkles, Clock, ArrowUpRight } from 'lucide-react';
import { apiClient } from '@/lib/api';

export interface IndexArticleItem {
  id: string;
  slug: string;
  title: string;
  authorName: string;
  authorUsername: string;
  categoryName: string;
  categorySlug: string;
  rubrikKey: string;
  excerpt: string;
  readingTime: number;
  publishedAt: string;
  isFeatured?: boolean;
}

export const RUBRIK_FILTERS = [
  { key: 'SEMUA', label: 'SEMUA' },
  { key: 'suara-lapak', label: 'SUARA LAPAK' },
  { key: 'pojok-blora', label: 'POJOK BLORA' },
  { key: 'opini-warga', label: 'OPINI WARGA' },
  { key: 'lingkungan', label: 'LINGKUNGAN' },
  { key: 'sejarah', label: 'SEJARAH' },
  { key: 'puisi', label: 'PUISI' },
  { key: 'refleksi-diri', label: 'REFLEKSI DIRI' },
] as const;

export const SAMPLE_ARTICLES: IndexArticleItem[] = [
  {
    id: 'art-01',
    slug: 'secangkir-kopi-terpal-biru-alun-alun-blora',
    title: 'Secangkir Kopi, Terpal Biru, dan Obrolan Hangat di Alun-Alun Blora',
    authorName: 'Wawan Prasetyo',
    authorUsername: 'wawan_lapak',
    categoryName: 'Suara Lapak',
    categorySlug: 'suara-lapak',
    rubrikKey: 'suara-lapak',
    excerpt:
      'Di bawah rindang pohon beringin Alun-Alun, selembar terpal biru digelar setiap Minggu pagi. Tak ada sekat antara pedagang keliling, guru, siswa sekolah, dan mahasiswa. Buku menjadi jembatan paling bersahaja untuk saling menyapa dan bertukar cerita hidup.',
    readingTime: 3,
    publishedAt: '2026-10-12T07:30:00Z',
    isFeatured: true,
  },
  {
    id: 'art-02',
    slug: 'menyusuri-riwayat-pasar-pon-keringat-bakul',
    title: 'Menyusuri Riwayat Pasar Pon: Keringat Bakul dan Guyub Rukun yang Bertahan',
    authorName: 'Siti Rahayu',
    authorUsername: 'sitiblora',
    categoryName: 'Pojok Blora',
    categorySlug: 'pojok-blora',
    rubrikKey: 'pojok-blora',
    excerpt:
      'Pasar Pon bukan sekadar tempat bertukarnya rupiah dengan hasil bumi. Ia adalah denyut nadi sosial Blora di mana tradisi tawar-menawar masih menyimpan laku saling menghargai, welas asih, dan kabar dari pelosok desa yang tak tercatat di koran kota.',
    readingTime: 4,
    publishedAt: '2026-10-10T09:15:00Z',
    isFeatured: true,
  },
  {
    id: 'art-03',
    slug: 'ruang-publik-ramah-pejalan-kaki-menagih-hak-trotoar',
    title: 'Ruang Publik Ramah Pejalan Kaki: Menagih Hak Trotoar yang Bermartabat',
    authorName: 'Budi Santoso',
    authorUsername: 'budisantoso',
    categoryName: 'Opini Warga',
    categorySlug: 'opini-warga',
    rubrikKey: 'opini-warga',
    excerpt:
      'Trotoar adalah tolok ukur kesetaraan peradaban sebuah kota. Ketika hak pejalan kaki terdesak kendaraan, kota kehilangan ruang humanisnya. Melalui lapak buku trotoar, kita belajar menuntut ruang publik yang aman, terbuka, dan adil bagi seluruh lapisan warga.',
    readingTime: 5,
    publishedAt: '2026-10-08T14:20:00Z',
    isFeatured: false,
  },
  {
    id: 'art-04',
    slug: 'menjaga-nyawa-hutan-jati-menatap-krisis-air',
    title: 'Menjaga Nyawa Hutan Jati: Menatap Ancaman Krisis Air Musim Kemarau',
    authorName: 'Agus Rimba',
    authorUsername: 'agus_sikep',
    categoryName: 'Lingkungan',
    categorySlug: 'lingkungan',
    rubrikKey: 'lingkungan',
    excerpt:
      'Blora tersohor dengan kayu jatinya yang kokoh, namun di balik itu, krisis air bersih terus mengintai setiap musim kemarau. Merawat tegakan pohon jati dan menjaga mata air desa bukan sekadar urusan dinas kehutanan, melainkan ikhtiar mutlak menjaga napas anak cucu kita.',
    readingTime: 4,
    publishedAt: '2026-10-05T11:00:00Z',
    isFeatured: false,
  },
  {
    id: 'art-05',
    slug: 'jejak-langkah-pramoedya-di-blora-menolak-lupa',
    title: 'Jejak Langkah Pramoedya di Blora: Menolak Lupa pada Tanah Kelahiran',
    authorName: 'Pramono Wibowo',
    authorUsername: 'pramono',
    categoryName: 'Sejarah',
    categorySlug: 'sejarah',
    rubrikKey: 'sejarah',
    excerpt:
      'Dari rumah masa kecilnya di Jetis Blora, Pramoedya menyerap denyut derita, ketidakadilan feodal, dan martabat rakyat jelata. Membaca kembali lembaran karyanya di atas terpal jalanan adalah cara terbaik kita merawat ingatan sejarah dan keberanian berpikir jujur.',
    readingTime: 6,
    publishedAt: '2026-10-02T16:45:00Z',
    isFeatured: true,
  },
  {
    id: 'art-06',
    slug: 'sajak-debu-trotoar-secangkir-kopi-hitam',
    title: 'Sajak Debu Trotoar & Secangkir Kopi Pahit',
    authorName: 'Larasati Dewi',
    authorUsername: 'laraspuisi',
    categoryName: 'Puisi',
    categorySlug: 'puisi',
    rubrikKey: 'puisi',
    excerpt:
      'Di atas terpal ini kita mengeja kata / huruf-huruf bangun dari lelapnya sampul tua / angin Alun-Alun membisikkan pesan sunyi: bahwa membaca adalah laku berbahagia yang tak akan pernah bisa dirampas oleh siapa pun.',
    readingTime: 2,
    publishedAt: '2026-09-28T20:10:00Z',
    isFeatured: false,
  },
  {
    id: 'art-07',
    slug: 'belajar-adil-sejak-dalam-pikiran-catatan-refleksi',
    title: 'Belajar Adil Sejak dalam Pikiran: Catatan Mengurai Prasangka',
    authorName: 'Ahmad Fauzi',
    authorUsername: 'fauzi_refleksi',
    categoryName: 'Refleksi Diri',
    categorySlug: 'refleksi-diri',
    rubrikKey: 'refleksi-diri',
    excerpt:
      'Berbuat adil dalam tindakan bermula dari kejujuran mengakui prasangka di dalam kepala. Di ruang hening membaca buku, ego kita runtuh pelan-pelan, digantikan oleh kesadaran bahwa kebenaran tidak pernah menjadi milik satu orang semata.',
    readingTime: 4,
    publishedAt: '2026-09-25T13:00:00Z',
    isFeatured: false,
  },
];

export function InteractiveLiteraryIndex({ className }: { className?: string }) {
  const [articles, setArticles] = React.useState<IndexArticleItem[]>(SAMPLE_ARTICLES);
  const [activeFilter, setActiveFilter] = React.useState<string>('SEMUA');
  const [selectedItem, setSelectedItem] = React.useState<IndexArticleItem>(SAMPLE_ARTICLES[0]);

  // Load published articles dynamically from backend API
  React.useEffect(() => {
    async function fetchPublishedArticles() {
      try {
        const res = await apiClient<{ data: ArticleSummary[] }>('/articles?status=PUBLISHED&perPage=25&sort=terbaru');
        if (res.data?.data && res.data.data.length > 0) {
          const apiArticles: IndexArticleItem[] = res.data.data.map((art) => {
            const catSlug = (art.category?.slug || '').toLowerCase();
            let rubrikKey = 'suara-lapak';
            if (catSlug.includes('pojok')) rubrikKey = 'pojok-blora';
            else if (catSlug.includes('opini')) rubrikKey = 'opini-warga';
            else if (catSlug.includes('lingkungan')) rubrikKey = 'lingkungan';
            else if (catSlug.includes('sejarah')) rubrikKey = 'sejarah';
            else if (catSlug.includes('puisi')) rubrikKey = 'puisi';
            else if (catSlug.includes('refleksi')) rubrikKey = 'refleksi-diri';

            return {
              id: art.id,
              slug: art.slug,
              title: art.title,
              authorName: art.author?.name || 'Warga Blora',
              authorUsername: art.author?.username || 'warga',
              categoryName: art.category?.name || 'Suara Lapak',
              categorySlug: art.category?.slug || rubrikKey,
              rubrikKey,
              excerpt: art.excerpt || 'Catatan pemikiran dan dialektika warga di ruang publik Perpusjal Blora.',
              readingTime: art.readingTime || 3,
              publishedAt: art.publishedAt || new Date().toISOString(),
              isFeatured: art.isFeatured || false,
            };
          });

          // Complement API articles with sample articles if certain categories have 0 items
          const combined = [...apiArticles];
          SAMPLE_ARTICLES.forEach((sample) => {
            if (!combined.some((item) => item.rubrikKey === sample.rubrikKey)) {
              combined.push(sample);
            }
          });

          setArticles(combined);
          setSelectedItem(combined[0]);
        }
      } catch {
        // Fallback to SAMPLE_ARTICLES
      }
    }
    fetchPublishedArticles();
  }, []);

  const filteredItems = React.useMemo(() => {
    if (activeFilter === 'SEMUA') return articles;
    return articles.filter((item) => item.rubrikKey === activeFilter);
  }, [articles, activeFilter]);

  React.useEffect(() => {
    if (filteredItems.length > 0 && !filteredItems.some((i) => i.id === selectedItem?.id)) {
      setSelectedItem(filteredItems[0]);
    }
  }, [filteredItems, selectedItem]);

  return (
    <div className={cn('space-y-6 sm:space-y-8', className)}>
      {/* 1. Full-Width Masthead Header */}
      <div className="border-b-2 border-foreground pb-6 sm:pb-8 space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
            [ ARSIP TULISAN // SUARA DARI TROTOAR ]
          </div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted hidden sm:inline-block">
            EDISI TERBUKA &bull; 7 RUBRIK WARGA BLORA
          </div>
        </div>

        <h2 className="font-serif text-[28px] sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground leading-[1.12] max-w-4xl">
          Warta Literasi &amp; Suara Warga
        </h2>

        <p className="font-serif text-sm sm:text-base md:text-lg text-foreground/85 max-w-3xl leading-relaxed">
          Kumpulan esai, sajak, catatan lapak, dan kritik sosial yang ditulis merdeka oleh warga di hamparan terpal Alun-Alun Blora.
        </p>

        {/* 2. Full-Width Rubrik Navigation Strip */}
        <div className="pt-3 sm:pt-4">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-2 select-none">
            {RUBRIK_FILTERS.map((filter) => {
              const count =
                filter.key === 'SEMUA'
                  ? articles.length
                  : articles.filter((a) => a.rubrikKey === filter.key).length;

              const isActive = activeFilter === filter.key;

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={cn(
                    'px-3 sm:px-4 py-2 border-2 font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all rounded-none cursor-pointer shrink-0',
                    isActive
                      ? 'bg-foreground text-background border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none'
                      : 'bg-surface text-muted border-border-hairline hover:border-foreground hover:text-foreground'
                  )}
                >
                  <span>{filter.label}</span>
                  <span className={cn('ml-1.5 text-[10px]', isActive ? 'text-background/80' : 'text-muted')}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Broadsheet Gazette Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
        {/* Left Column: Interactive Article Ledger (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between border-b border-border-hairline pb-2 font-mono text-[11px] uppercase tracking-wider text-muted font-bold">
            <span>[ DAFTAR NASKAH // INDEKS ARSIP ]</span>
            <span>MENAMPILKAN {filteredItems.length} TULISAN</span>
          </div>

          <div className="border-2 border-foreground bg-surface divide-y divide-border-hairline max-h-[500px] sm:max-h-[560px] overflow-y-auto scrollbar-thin">
            {filteredItems.map((item, idx) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    'p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer transition-all group',
                    isSelected
                      ? 'bg-surface-muted/90 border-l-4 border-l-foreground'
                      : 'hover:bg-surface-muted/40'
                  )}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="font-mono text-muted text-xs sm:text-sm shrink-0 pt-0.5 font-bold">
                      {`${idx + 1}`.padStart(2, '0')}
                    </span>

                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-foreground text-background font-mono text-[8.5px] uppercase font-bold tracking-wider rounded-none">
                          {item.categoryName}
                        </span>
                        {item.isFeatured && (
                          <span className="px-1.5 py-0.5 bg-background border border-border-hairline font-mono text-[8.5px] uppercase tracking-wider font-bold text-foreground inline-flex items-center gap-1 rounded-none">
                            <Sparkles className="w-2.5 h-2.5" />
                            SOROTAN
                          </span>
                        )}
                        <span className="font-mono text-[9.5px] text-muted uppercase inline-flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item.readingTime} MNT</span>
                        </span>
                      </div>

                      <h4 className="font-serif text-base sm:text-lg text-foreground font-bold leading-snug line-clamp-2 group-hover:underline">
                        {item.title}
                      </h4>

                      <p className="font-mono text-[11px] text-muted truncate">
                        Oleh <strong className="text-foreground/90 font-semibold">{item.authorName}</strong> (@{item.authorUsername})
                      </p>

                      {item.excerpt && (
                        <p className="font-serif italic text-xs text-foreground/75 line-clamp-1 pt-0.5">
                          &ldquo;{item.excerpt}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    <span
                      className={cn(
                        'w-7 h-7 border border-border-hairline flex items-center justify-center font-mono text-xs transition-colors rounded-none',
                        isSelected
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background text-muted group-hover:border-foreground group-hover:text-foreground'
                      )}
                    >
                      &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Clipped Editorial BroadSheet Dossier (5 cols, Sticky) */}
        {selectedItem && (
          <div className="lg:col-span-5 sticky top-24">
            <div className="border-2 border-foreground bg-background p-5 sm:p-7 space-y-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
              {/* Ledger Header */}
              <div className="flex items-center justify-between border-b-2 border-border-hairline pb-3 text-[10.5px] font-mono uppercase tracking-widest text-muted">
                <span className="font-bold text-foreground">
                  [ RUBRIK // {selectedItem.categoryName.toUpperCase()} ]
                </span>
                <span>{selectedItem.readingTime} MENIT BACA</span>
              </div>

              {/* Title & Author Info */}
              <div className="space-y-3">
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-foreground leading-tight tracking-tight">
                  {selectedItem.title}
                </h3>

                <div className="flex items-center gap-3 pt-1 border-t border-border-hairline pt-3 font-mono">
                  <div className="w-9 h-9 rounded-none border-2 border-foreground bg-surface flex items-center justify-center font-serif font-black text-base text-foreground shrink-0">
                    {selectedItem.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-serif font-bold text-sm text-foreground truncate">
                      {selectedItem.authorName}
                    </div>
                    <div className="text-[10.5px] text-muted truncate">
                      @{selectedItem.authorUsername} &bull; Kontributor Warga
                    </div>
                  </div>
                </div>
              </div>

              {/* Excerpt Pull-Quote Box */}
              <div className="p-4 sm:p-5 bg-surface border-l-4 border-foreground space-y-2.5">
                <Quote className="w-5 h-5 text-foreground/40 shrink-0" />
                <blockquote className="font-serif italic text-sm sm:text-base text-foreground/90 leading-relaxed">
                  &ldquo;{selectedItem.excerpt}&rdquo;
                </blockquote>
                <div className="text-right font-mono text-[9px] uppercase tracking-wider text-muted pt-1">
                  — Terbitan Rubrik {selectedItem.categoryName}
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-border-hairline">
                <Link
                  href={`/artikel/${selectedItem.slug}`}
                  className="w-full h-11 sm:h-12 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 border-2 border-foreground active:scale-[0.99]"
                >
                  <span>BACA TULISAN LENGKAP</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <Link
                    href="/tulis"
                    className="h-10 border-2 border-foreground bg-background hover:bg-surface font-bold uppercase tracking-wider text-foreground flex items-center justify-center gap-1.5 transition-colors text-[11px]"
                    title="Kirim naskah tulisanmu ke Perpusjal Blora"
                  >
                    <Feather className="w-3.5 h-3.5" />
                    <span>KIRIM TULISAN</span>
                  </Link>

                  <Link
                    href="/artikel"
                    className="h-10 border border-border-hairline hover:border-foreground bg-surface text-muted hover:text-foreground uppercase tracking-wider flex items-center justify-center gap-1 transition-colors text-[11px] font-bold"
                    title="Buka seluruh arsip tulisan warga"
                  >
                    <span>SEMUA ARSIP</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
