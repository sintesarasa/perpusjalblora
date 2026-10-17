'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArticleSummary, LandingFeaturedArticleItem, LandingPublicConfigResponse } from '@perpusjal/types';
import { ArrowRight, Feather, Quote, Sparkles, Clock, ArrowUpRight, BookOpen } from 'lucide-react';
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
      'Pasar Pon bukan sekadar tempat bertukarnya rupiah dengan hasil bumi. Ia adalah denyut nadi sosial Blora di mana tradisi tawar-menawar masih menyimpan laku saling menghargai dan welas asih antarwarga.',
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
      'Trotoar adalah tolok ukur kesetaraan peradaban sebuah kota. Melalui lapak buku trotoar, kita belajar menuntut ruang publik yang aman, terbuka, dan adil bagi seluruh lapisan warga.',
    readingTime: 5,
    publishedAt: '2026-10-08T14:20:00Z',
    isFeatured: false,
  },
  {
    id: 'art-04',
    slug: 'sajak-debu-trotoar-secangkir-kopi-hitam',
    title: 'Sajak Debu Trotoar & Secangkir Kopi Pahit',
    authorName: 'Larasati Dewi',
    authorUsername: 'laraspuisi',
    categoryName: 'Puisi Trotoar',
    categorySlug: 'puisi',
    rubrikKey: 'puisi',
    excerpt:
      'Di atas terpal ini kita mengeja kata / huruf-huruf bangun dari lelapnya sampul tua / angin Alun-Alun membisikkan pesan sunyi: bahwa membaca adalah laku berbahagia yang tak akan pernah bisa dirampas.',
    readingTime: 2,
    publishedAt: '2026-09-28T20:10:00Z',
    isFeatured: false,
  },
  {
    id: 'art-05',
    slug: 'menjaga-nyawa-hutan-jati-menatap-krisis-air',
    title: 'Menjaga Nyawa Hutan Jati: Menatap Ancaman Krisis Air Musim Kemarau',
    authorName: 'Agus Rimba',
    authorUsername: 'agus_sikep',
    categoryName: 'Lingkungan',
    categorySlug: 'lingkungan',
    rubrikKey: 'lingkungan',
    excerpt:
      'Merawat tegakan pohon jati dan menjaga mata air desa bukan sekadar urusan formalitas dinas, melainkan ikhtiar mutlak menjaga napas kehidupan anak cucu kita di tanah Blora.',
    readingTime: 4,
    publishedAt: '2026-10-05T11:00:00Z',
    isFeatured: false,
  },
];

function mapToItem(art: LandingFeaturedArticleItem | ArticleSummary): IndexArticleItem {
  const catSlug = ('categorySlug' in art ? art.categorySlug : art.category?.slug || '').toLowerCase();
  let rubrikKey = 'suara-lapak';
  if (catSlug.includes('pojok')) rubrikKey = 'pojok-blora';
  else if (catSlug.includes('opini')) rubrikKey = 'opini-warga';
  else if (catSlug.includes('lingkungan')) rubrikKey = 'lingkungan';
  else if (catSlug.includes('sejarah')) rubrikKey = 'sejarah';
  else if (catSlug.includes('puisi')) rubrikKey = 'puisi';
  else if (catSlug.includes('refleksi')) rubrikKey = 'refleksi-diri';

  const authorName = 'authorName' in art ? art.authorName : art.author?.name || 'Warga Blora';
  const authorUsername = 'authorUsername' in art ? art.authorUsername : art.author?.username || 'warga';
  const categoryName = 'categoryName' in art ? art.categoryName : art.category?.name || 'Suara Lapak';
  const categorySlug = 'categorySlug' in art ? art.categorySlug : art.category?.slug || rubrikKey;

  return {
    id: art.id,
    slug: art.slug,
    title: art.title,
    authorName,
    authorUsername,
    categoryName,
    categorySlug,
    rubrikKey,
    excerpt: art.excerpt || 'Catatan pemikiran dan dialektika warga di ruang publik Perpusjal Blora.',
    readingTime: art.readingTime || 3,
    publishedAt: art.publishedAt || new Date().toISOString(),
    isFeatured: art.isFeatured || false,
  };
}

export interface InteractiveLiteraryIndexProps {
  className?: string;
  featuredData?: LandingPublicConfigResponse['featuredArticlesData'];
}

export function InteractiveLiteraryIndex({ className, featuredData }: InteractiveLiteraryIndexProps) {
  const [articles, setArticles] = React.useState<IndexArticleItem[]>(SAMPLE_ARTICLES);

  // Load published articles dynamically from backend API as fallback / complement
  React.useEffect(() => {
    async function fetchPublishedArticles() {
      try {
        const res = await apiClient<{ data: ArticleSummary[] }>('/articles?status=PUBLISHED&perPage=10&sort=terbaru');
        if (res.data?.data && res.data.data.length > 0) {
          const apiArticles: IndexArticleItem[] = res.data.data.map(mapToItem);

          // Sort so featured articles come first
          apiArticles.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

          // Ensure we have at least 4 items by complementing with sample data
          const combined = [...apiArticles];
          SAMPLE_ARTICLES.forEach((sample) => {
            if (combined.length < 4 && !combined.some((item) => item.slug === sample.slug)) {
              combined.push(sample);
            }
          });

          setArticles(combined);
        }
      } catch {
        // Fallback to SAMPLE_ARTICLES
      }
    }
    fetchPublishedArticles();
  }, []);

  // Priority: If featuredData from admin settings is present, honor curated slots
  const curatedLead = featuredData?.headlineArticle ? mapToItem(featuredData.headlineArticle) : null;
  const curatedSides = featuredData?.sideArticles && featuredData.sideArticles.length > 0
    ? featuredData.sideArticles.map(mapToItem)
    : null;

  const leadArticle = curatedLead || articles[0] || SAMPLE_ARTICLES[0];

  // For side articles: use curatedSides if available, complement if fewer than 3
  let sideArticles: IndexArticleItem[] = [];
  if (curatedSides && curatedSides.length > 0) {
    sideArticles = [...curatedSides];
    for (const art of articles) {
      if (sideArticles.length >= 3) break;
      if (art.id !== leadArticle.id && !sideArticles.some((s) => s.id === art.id)) {
        sideArticles.push(art);
      }
    }
  } else {
    sideArticles = articles.filter((a) => a.id !== leadArticle.id).slice(0, 3);
  }

  // Ensure at least 3 side articles using SAMPLE_ARTICLES fallback
  if (sideArticles.length < 3) {
    for (const sample of SAMPLE_ARTICLES) {
      if (sideArticles.length >= 3) break;
      if (sample.id !== leadArticle.id && !sideArticles.some((s) => s.slug === sample.slug)) {
        sideArticles.push(sample);
      }
    }
  }

  return (
    <div className={cn('space-y-8 sm:space-y-10', className)}>
      {/* 1. Full-Width Masthead Header (Zero Database Filter Clutter) */}
      <div className="border-b-2 border-foreground pb-6 sm:pb-8 space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted">
            [ MIMBAR WARGA // SUARA DARI TROTOAR ]
          </div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted hidden sm:inline-block">
            TAJUK REDAKSI &bull; PERS WARGA TANPA SENSOR
          </div>
        </div>

        <h2 className="font-serif text-[28px] sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground leading-[1.12] max-w-4xl">
          Gagasan, Catatan Lapak, &amp; Suara Warga
        </h2>

        <p className="font-serif text-sm sm:text-base md:text-lg text-foreground/85 max-w-3xl leading-relaxed">
          Di hamparan terpal ini, setiap warga punya hak bersuara. Kami mengurasi pemikiran jujur, kritik sosial, dan sajak jalanan yang lahir dari denyut keseharian masyarakat Blora.
        </p>
      </div>

      {/* 2. Front-Page Broadsheet Headline Spread (7 cols Lead Story + 5 cols Side Dispatches) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Left Column: Tajuk Utama (Lead Story - 7 cols) */}
        <div className="lg:col-span-7 border-2 border-foreground bg-surface p-6 sm:p-8 flex flex-col justify-between space-y-6 rounded-none relative">
          <div className="space-y-5">
            {/* Top Tag & Reading Time */}
            <div className="flex items-center justify-between border-b border-border-hairline pb-3 font-mono text-[11px] uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-foreground text-background font-bold text-[9px] uppercase tracking-widest rounded-none">
                  TAJUK UTAMA
                </span>
                <span className="font-bold text-foreground">
                  // {leadArticle.categoryName.toUpperCase()}
                </span>
              </div>
              <span className="text-muted inline-flex items-center gap-1 text-[10px]">
                <Clock className="w-3 h-3 text-muted" />
                {leadArticle.readingTime} MENIT BACA
              </span>
            </div>

            {/* Headline Title */}
            <Link href={`/artikel/${leadArticle.slug}`} className="block group">
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-foreground leading-[1.18] tracking-tight group-hover:underline">
                {leadArticle.title}
              </h3>
            </Link>

            {/* Author Persona Strip */}
            <div className="flex items-center gap-3 pt-1 border-t border-border-hairline pt-3 font-mono">
              <div className="w-10 h-10 rounded-none border-2 border-foreground bg-background flex items-center justify-center font-serif font-black text-lg text-foreground shrink-0">
                {leadArticle.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-serif font-bold text-base text-foreground truncate">
                  {leadArticle.authorName}
                </div>
                <div className="text-[11px] text-muted truncate">
                  @{leadArticle.authorUsername} &bull; Kontributor Terpal
                </div>
              </div>
            </div>

            {/* Opening Excerpt Quote Pull-Box */}
            <div className="p-5 sm:p-6 bg-background border-l-4 border-foreground space-y-2.5">
              <Quote className="w-5 h-5 text-foreground/40 shrink-0" />
              <blockquote className="font-serif italic text-base sm:text-lg text-foreground/90 leading-relaxed">
                &ldquo;{leadArticle.excerpt}&rdquo;
              </blockquote>
              <div className="text-right font-mono text-[9.5px] uppercase tracking-wider text-muted pt-1">
                — Cuplikan Terbitan Rubrik {leadArticle.categoryName}
              </div>
            </div>
          </div>

          {/* Read Full Button */}
          <div className="pt-4 border-t border-border-hairline">
            <Link
              href={`/artikel/${leadArticle.slug}`}
              className="w-full sm:w-auto h-12 px-6 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-all inline-flex items-center justify-center gap-2 border-2 border-foreground active:scale-[0.99]"
            >
              <span>BACA TAJUK LENGKAP</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: 3 Catatan Warga Pilihan (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b-2 border-foreground pb-2.5 font-mono text-xs uppercase tracking-wider text-muted font-bold">
            <span>[ CATATAN PINGGIR // 3 GAGASAN TERPILIH ]</span>
            <span>KORAN TERPAL</span>
          </div>

          <div className="border-2 border-foreground bg-background divide-y-2 divide-border-hairline flex-1 flex flex-col justify-between">
            {sideArticles.map((item, idx) => (
              <Link
                key={item.id}
                href={`/artikel/${item.slug}`}
                className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2 group hover:bg-surface transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[9.5px] font-mono pb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-muted">
                        {`${idx + 1}`.padStart(2, '0')}
                      </span>
                      <span className="px-1.5 py-0.5 bg-surface-muted border border-border-hairline text-foreground uppercase font-bold tracking-wider rounded-none">
                        {item.categoryName}
                      </span>
                    </div>
                    <span className="text-muted">{item.readingTime} MNT</span>
                  </div>

                  <h4 className="font-serif text-base sm:text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:underline mt-1">
                    {item.title}
                  </h4>

                  <p className="font-serif italic text-xs text-foreground/75 line-clamp-2 mt-1.5 leading-relaxed">
                    &ldquo;{item.excerpt}&rdquo;
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between font-mono text-[10.5px] text-muted border-t border-border-hairline/60">
                  <span className="truncate">Oleh {item.authorName}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-foreground group-hover:translate-x-0.5 transition-transform">
                    <span>BACA</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Banner: Manifesto Warga Menulis & Bridge to Full Archive */}
      <div className="border-2 border-foreground bg-surface p-5 sm:p-7 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 font-mono">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-[10px] uppercase font-bold tracking-widest text-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-foreground" />
            <span>MIMBAR BEBAS // RUANG WARGA BERBICARA</span>
          </div>
          <h4 className="font-serif text-lg sm:text-xl font-bold text-foreground leading-snug">
            Punya cerita dari jalanan, kritik tata ruang, atau sajak untuk Blora?
          </h4>
          <p className="font-serif text-xs sm:text-sm text-foreground/80 leading-relaxed">
            Naskahmu tidak akan disensor oleh birokrasi. Kirimkan tulisanmu agar dapat dibaca luas oleh ribuan warga di atas terpal digital ini.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 text-xs font-bold uppercase tracking-wider">
          <Link
            href="/tulis"
            className="h-11 px-5 bg-foreground text-background hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-2 border-2 border-foreground"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>KIRIM TULISANMU</span>
          </Link>

          <Link
            href="/artikel"
            className="h-11 px-5 border-2 border-foreground bg-background hover:bg-surface text-foreground transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>JELAJAHI SEMUA ARSIP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
