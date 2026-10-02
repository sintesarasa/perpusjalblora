'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BrandStamp } from '@/components/ui/brand-stamp';
import {
  BookOpen,
  Users,
  Compass,
  Heart,
  Sparkles,
  ArrowRight,
  Smile,
  ShieldCheck,
  MapPin,
  Coffee,
  Sun,
  Flame,
  TreePine,
  Printer,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Clock,
  Feather,
  Palette,
  Tent,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  year: string;
  badge: string;
  title: string;
  summary: string;
  fieldNotes: string;
  highlights: string[];
}

const TIMELINE_DATA: TimelineEvent[] = [
  {
    year: '2017',
    badge: 'BENIH TROTOAR',
    title: 'Awal Mula di Sudut Lapangan & Trotoar Kota',
    summary:
      'Sekelompok anak muda di Blora mulai menggelar buku milik pribadi beralaskan terpal sederhana di trotoar Alun-Alun dan Lapangan Kridosono. Kala itu masih mengusung semboyan jalanan: "Membaca adalah Melawan".',
    fieldNotes:
      'Arsip Awal: Dimulai hanya dengan belasan buku sastra, zine fotokopian, dan termos teh hangat untuk pembaca yang mampir.',
    highlights: [
      'Gelar terpal swadaya pertama kali di CFD Alun-Alun',
      'Koleksi buku murni sumbangan pribadi kawan-kawan relawan',
      'Forum obrolan santai pasca-sekolah dan kampus',
    ],
  },
  {
    year: '2019',
    badge: 'SAYAP SELATAN',
    title: 'Lahirnya Perpusjal Dope (Doplang) di Pelosok Hutan',
    summary:
      'Gerakan merambah ke wilayah selatan Kabupaten Blora. Kawan-kawan muda di Doplang menginisiasi Perpusjal Dope, mendekatkan buku kepada anak-anak pedesaan dan komunitas pinggir hutan jati.',
    fieldNotes:
      'Eksplorasi Alam: Mengadakan kemah literasi tahunan "Nginep Alas" di mata air Sendang Salak Desa Tanggel.',
    highlights: [
      'Terhubung aktif dalam Forum Taman Bacaan Masyarakat (TBM)',
      'Program literasi lingkungan: Kemah Alas & Sendang Salak',
      'Pelatihan kerajinan ramah lingkungan batik ecoprint daun jati',
    ],
  },
  {
    year: '2021',
    badge: 'METAMORFOSIS',
    title: 'Dari "Melawan" Menjadi "Membaca dan Berbahagia"',
    summary:
      'Menyadari kata "melawan" sempat menimbulkan kesan kaku dan berjarak bagi warga awam serta para orang tua, Perpusjal secara resmi bertransformasi mengusung semboyan baru: "Membaca dan Berbahagia".',
    fieldNotes:
      'Pendekatan Kultural: Membaca dirayakan sebagai festival kebahagiaan warga—lesehan, menggambar, tertawa bersama tanpa sekat politis.',
    highlights: [
      'Perubahan semboyan resmi agar lebih ramah bagi semua kalangan warga',
      'Penyediaan pojok gambar & mewarnai khusus anak-anak',
      'Membuka ruang kolaborasi hangat dengan perpustakaan keliling daerah',
    ],
  },
  {
    year: '2024',
    badge: 'RUMAH KREATIF',
    title: 'Markas Omah Talang Bocor & Seni Kriya Warga',
    summary:
      'Ruang kreasi diperluas di markas Omah Talang Bocor (dekat Stadion Kridosono). Literasi tidak lagi hanya membaca huruf, melainkan mengasah keterampilan hidup nyata melalui seni cetak cukil kayu, sablon, dan daur ulang.',
    fieldNotes:
      'Praksis Merdeka: Remaja dan warga diajak mandiri membuat zine karya sendiri dan mencetak sablon kaos dengan teknik cukil kayu murah meriah.',
    highlights: [
      'Workshop sablon mandiri dan cukil kayu (woodcut printmaking)',
      'Pertunjukan Barongan dan apresiasi musik puisi di ruang terbuka',
      'Pemberdayaan ibu-ibu desa melalui pengolahan limbah plastik',
    ],
  },
  {
    year: '2026',
    badge: 'ARSIP TERBUKA',
    title: 'Digitalisasi Katalog & Wadah Suara Seluruh Warga',
    summary:
      'Peluncuran platform web mandiri Perpusjal Blora: katalog digital terbuka, antrean waitlist otomatis, penerbitan surat pembaca, serta mimbar bebas bagi warga untuk menulis esai dan resensi buku secara cuma-cuma.',
    fieldNotes:
      'Teknologi Kerakyatan: Sistem sirkulasi online tanpa biaya server mahal, dirancang monokrom, ringan di ponsel hemat kuota, dan bebas pelacak iklan.',
    highlights: [
      'Peminjaman buku online terhubung titik sirkulasi lapak',
      'Ruang publikasi tulisan warga tanpa kurasi birokratis yang kaku',
      'Integrasi tiket sirkulasi digital dan WhatsApp koordinasi relawan',
    ],
  },
];

export default function AboutPage() {
  const [selectedYear, setSelectedYear] = React.useState<number>(0);
  const [activeWing, setActiveWing] = React.useState<'KOTA' | 'DOPE'>('KOTA');
  const yearScrollRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background flex flex-col justify-between editorial-grain">
      {/* ── JSON-LD Structured Data for Google Search SEO (AboutPage & NGO Organization) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'AboutPage',
                '@id': 'https://perpusjalblora.id/tentang#webpage',
                url: 'https://perpusjalblora.id/tentang',
                name: 'Tentang Perpustakaan Jalanan Blora — Sejarah, Nilai & Ekosistem Gerakan',
                description:
                  'Historiografi, falsafah ngurip-urip, dan jejaring Perpustakaan Jalanan Blora. Ruang baca rakyat di trotoar, taman kota, hingga pelosok hutan jati Blora.',
                inLanguage: 'id-ID',
                isPartOf: {
                  '@type': 'WebSite',
                  '@id': 'https://perpusjalblora.id/#website',
                  url: 'https://perpusjalblora.id',
                  name: 'Perpustakaan Jalanan Blora',
                },
                about: {
                  '@id': 'https://perpusjalblora.id/#organization',
                },
              },
              {
                '@type': 'NGO',
                '@id': 'https://perpusjalblora.id/#organization',
                name: 'Perpustakaan Jalanan Blora',
                alternateName: ['Perpusjal Blora', 'Perpusjal Dope'],
                url: 'https://perpusjalblora.id',
                logo: 'https://perpusjalblora.id/logo.png',
                foundingDate: '2017',
                foundingLocation: {
                  '@type': 'Place',
                  name: 'Kabupaten Blora, Jawa Tengah, Indonesia',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Jl. Pemuda No. 12',
                    addressLocality: 'Blora',
                    addressRegion: 'Jawa Tengah',
                    postalCode: '58219',
                    addressCountry: 'ID',
                  },
                },
                description:
                  'Inisiatif akar rumput literasi swadaya di Kabupaten Blora. Menggelar buku gratis di trotoar Alun-Alun, taman kota, dan desa tepian hutan dengan prinsip tanpa uang jaminan dan tanpa denda.',
                slogan: 'Membaca dan Berbahagia',
                knowsAbout: [
                  'Literasi Kerakyatan',
                  'Perpustakaan Jalanan',
                  'Pramoedya Ananta Toer',
                  'Soesilo Toer',
                  'Perpustakaan PATABA',
                  'Batik Ecoprint Daun Jati',
                  'Sablon Cukil Kayu',
                ],
                sameAs: [
                  'https://instagram.com/perpusjal.dope',
                ],
              },
            ],
          }),
        }}
      />

      <div className="no-print">
        <Header />
      </div>

      <main className="flex-1 pb-16 sm:pb-24">
        {/* ========================================================= */}
        {/* 1. EDITORIAL MASTHEAD BANNER                              */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 pb-8 sm:pb-12">
          {/* Top Colophon Gazette Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3 mb-6 sm:mb-8 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <BrandStamp edition="KRONIK GERAKAN" year="2026" />
              <span className="hidden sm:inline">[ ARSIP HISTORIOGRAFI &amp; MANIFESTO AKAR RUMPUT ]</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
              <span>BERKEMBANG SEJAK 2017</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                title="Cetak Profil & Manifesto"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>CETAK ARSIP</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground font-mono text-[9px] sm:text-[10px] tracking-wider uppercase font-bold bg-foreground text-background">
                <span>DARI TROTOAR HINGGA TEPIAN ALAS JATI BLORA</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-foreground leading-[1.02] sm:leading-[0.95] break-words">
                MEMBACA DAN <br />
                <span className="italic font-normal lowercase font-serif">merawat bahagia bersama.</span>
              </h1>

              <p className="font-serif text-base sm:text-lg lg:text-xl text-foreground/90 max-w-2xl leading-relaxed pt-1 sm:pt-2">
                Sebuah ikhtiar swadaya warga Blora untuk mengembalikan buku ke pangkuan rakyat:
                digelar hangat di atas selembar terpal, bebas birokrasi, tanpa uang jaminan,
                dan menghidupkan percakapan merdeka di ruang-ruang terbuka.
              </p>
            </div>

            {/* Right Summary Factsheet Card */}
            <div className="lg:col-span-4 border-2 border-foreground bg-surface p-4 sm:p-6 font-mono text-xs space-y-3 sm:space-y-4 shadow-[4px_4px_0px_0px_currentColor]">
              <div className="flex items-center justify-between border-b border-foreground pb-2">
                <span className="font-bold tracking-wider">[ KARTU IDENTITAS ]</span>
                <span className="text-[10px] bg-foreground text-background px-1.5 py-0.5 font-bold">SWADAYA</span>
              </div>
              <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90">
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-bold shrink-0">🏛</span>
                  <span><strong>Warisan Kota:</strong> Jejak sastra Pramoedya Ananta Toer &amp; PATABA.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-bold shrink-0">🏕</span>
                  <span><strong>Basis Lapak:</strong> Alun-Alun, Taman Tirtonadi, dan Sendang Salak.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground font-bold shrink-0">🤝</span>
                  <span><strong>Prinsip Kerja:</strong> <em>Ngurip-urip</em> (gotong royong saling menghidupkan).</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-border-hairline text-[10px] text-muted uppercase tracking-wider flex justify-between">
                <span>FORMAT: LAPAK TERPAL</span>
                <span>BIAYA: 100% GRATIS</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. NARASI AWAL & INSPIRASI KELUARGA TOER                 */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Left Main Essay (8 cols) */}
            <div className="lg:col-span-8 space-y-6 font-serif text-base sm:text-lg text-foreground/90 leading-[1.8] sm:leading-[1.85]">
              <div className="border-b border-border-hairline pb-2 mb-4 font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                <Feather className="w-3.5 h-3.5 text-foreground shrink-0" />
                <span>AKAR SEJARAH &amp; KELAHIRAN GERAKAN</span>
              </div>

              <p className="first-letter:float-left first-letter:text-5xl sm:first-letter:text-6xl first-letter:leading-none first-letter:font-serif first-letter:pr-3.5 first-letter:pt-1 first-letter:font-bold first-letter:text-foreground">
                Kabupaten Blora di Jawa Tengah menempati posisi tersendiri dalam sejarah sastra Indonesia.
                Tanah jati ini melahirkan maestro sastra dunia <strong>Pramoedya Ananta Toer</strong>,
                serta adiknya, <strong>Mbah Soesilo Toer</strong>, pemegang gelar doktor ekonomi dari Uni Soviet
                yang memilih pulang ke Blora, memulung barang bekas, dan mendirikan <strong>Perpustakaan PATABA</strong> yang legendaris.
              </p>

              <p>
                Namun di tengah kebanggaan sejarah tersebut, kenyataan sehari-hari memperlihatkan celah besar.
                Masih banyak anak-anak muda, pelajar di pelosok, dan warga biasa yang kesulitan mengakses buku berkualitas.
                Bagi sebagian masyarakat di kampung dan pinggiran rel, mendatangi gedung perpustakaan besar sering kali terasa segan,
                berjarak, atau terbebani tata tertib yang kaku.
              </p>

              <p>
                Dari kesadaran itulah, <strong>Perpustakaan Jalanan Blora (Perpusjal)</strong> lahir. Kami tidak menunggu warga
                datang ke gedung; kami yang memanggul buku mendatangi tempat warga berkerumun. Cukup membentangkan selembar terpal
                di trotoar Alun-Alun, di bawah rimbun pohon trembesi taman, atau di tepian embung desa, siapa pun boleh duduk,
                membaca, berdiskusi, dan meminjam buku tanpa pungutan biaya satu rupiah pun.
              </p>
            </div>

            {/* Right Pull Quote & Column (4 cols) */}
            <div className="lg:col-span-4 border-t-2 lg:border-t-0 lg:border-l-2 border-foreground pt-6 lg:pt-0 lg:pl-8 space-y-6">
              <div className="font-mono text-[10px] uppercase tracking-ultra text-muted">
                [ WEJANGAN PATABA ]
              </div>

              <blockquote className="font-serif italic text-xl sm:text-2xl text-foreground leading-snug">
                &ldquo;Membaca bukan cuma soal mengeja huruf di atas kertas, tapi jalan melatih rasa dan pikiran agar kita menjadi manusia yang berdaulat dan merdeka.&rdquo;
              </blockquote>

              <cite className="block font-mono text-[11px] uppercase tracking-wider text-muted not-italic border-t border-border-hairline pt-2">
                — Terinspirasi dari keteladanan Mbah Soesilo Toer (Perpustakaan PATABA Blora)
              </cite>

              {/* Slogan Evolution Mini Box */}
              <div className="p-4 border-2 border-foreground bg-surface font-mono text-xs space-y-3 shadow-xs">
                <div className="text-[10px] uppercase tracking-wider text-muted font-bold pb-1 border-b border-border-hairline">
                  PERJALANAN SEMBOYAN KITA
                </div>
                <div className="space-y-2">
                  <div className="p-2 border border-border-hairline bg-surface-muted text-muted line-through text-[11px]">
                    2017: &ldquo;Membaca adalah Melawan&rdquo;
                  </div>
                  <div className="p-2.5 border-2 border-foreground bg-background font-bold text-foreground text-[11px]">
                    KINI: &ldquo;Membaca dan Berbahagia&rdquo;
                  </div>
                </div>
                <p className="text-[10px] text-muted leading-relaxed font-sans">
                  Semboyan diubah agar membaca terasa akrab, bersahabat bagi anak-anak, dan tidak ditakuti sebagai gerakan politik yang tegang.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. TIMELINE INTERAKTIF JEJAK LANGKAH (2017 - 2026)        */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="border-b-2 border-foreground pb-4 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-foreground shrink-0" />
                <span>KRONOLOGI GERAKAN LITERASI</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1">
                Jejak Terpal dari Tahun ke Tahun
              </h2>
            </div>
            <p className="font-mono text-xs text-muted max-w-sm">
              Klik tahun di bawah untuk membuka catatan penting di balik perjalanan komunitas kami di Blora.
            </p>
          </div>

          {/* Year Buttons — Responsive Snap Strip */}
          <div className="relative pb-6">
            <div
              ref={yearScrollRef}
              className="flex sm:grid sm:grid-cols-5 gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scroll-smooth snap-x snap-mandatory scrollbar-none"
              tabIndex={0}
              aria-label="Pilih tahun kilas balik gerakan"
            >
              {TIMELINE_DATA.map((t, idx) => {
                const isSelected = selectedYear === idx;
                return (
                  <button
                    key={t.year}
                    type="button"
                    onClick={() => setSelectedYear(idx)}
                    className={cn(
                      'p-3 text-left border-2 transition-all font-mono shrink-0 snap-center min-w-[150px] sm:min-w-0 select-none min-h-[56px] focus:outline-none focus:ring-2 focus:ring-foreground',
                      isSelected
                        ? 'border-foreground bg-foreground text-background shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                        : 'border-border-hairline bg-surface hover:border-foreground text-foreground'
                    )}
                  >
                    <div className="text-[10px] uppercase tracking-wider opacity-80 flex items-center justify-between">
                      <span>TAHUN</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-background sm:hidden" />}
                    </div>
                    <div className="font-bold text-lg tracking-tight mt-0.5 font-serif">{t.year}</div>
                  </button>
                );
              })}
            </div>
            <div className="sm:hidden text-center text-[10px] font-mono text-muted pt-1">
              <span>← Geser linimasa tahun →</span>
            </div>
          </div>

          {/* Active Year Detail Box: Gazette Editorial Style */}
          <div className="border-2 border-foreground bg-surface p-5 sm:p-8 lg:p-10 relative shadow-[4px_4px_0px_0px_currentColor] sm:shadow-[6px_6px_0px_0px_currentColor]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
              {/* Left Column: Visual Ledger Banner */}
              <div className="lg:col-span-5 bg-surface-muted border-2 border-foreground p-5 sm:p-6 relative flex flex-col justify-between min-h-[220px] select-none font-mono">
                <div className="flex items-center justify-between border-b border-foreground/30 pb-2">
                  <span className="text-[9px] uppercase px-2 py-0.5 bg-foreground text-background font-bold tracking-wider">
                    {TIMELINE_DATA[selectedYear].badge}
                  </span>
                  <span className="text-xl font-black font-serif text-foreground">
                    {TIMELINE_DATA[selectedYear].year}
                  </span>
                </div>

                <div className="py-6 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-muted">CATATAN LAPANGAN:</div>
                  <p className="font-serif italic text-sm text-foreground/90 leading-relaxed">
                    &ldquo;{TIMELINE_DATA[selectedYear].fieldNotes}&rdquo;
                  </p>
                </div>

                <div className="border-t border-foreground/30 pt-2 flex items-center justify-between text-[9px] text-muted">
                  <span>DOKUMEN HISTORIS</span>
                  <span className="font-bold text-foreground">ARSIP_PERPUSJAL</span>
                </div>
              </div>

              {/* Right Column: Title & Highlights */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted mb-1">
                    PERISTIWA TAHUN {TIMELINE_DATA[selectedYear].year}
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {TIMELINE_DATA[selectedYear].title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-foreground/80 leading-relaxed mt-2">
                    {TIMELINE_DATA[selectedYear].summary}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="space-y-2 pt-2 border-t border-border-hairline">
                  <div className="font-mono text-[10px] uppercase font-bold text-muted">
                    POIN TONGGAK PERKEMBANGAN:
                  </div>
                  <ul className="space-y-1.5 font-sans text-xs text-foreground/90">
                    {TIMELINE_DATA[selectedYear].highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-foreground shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. TIGA PILAR NILAI: BUKAN SEKADAR MEMBACA                 */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="border-b-2 border-foreground pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-foreground shrink-0" />
                <span>FALSAFAH &amp; NILAI DASAR</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1">
                Tiga Pilar yang Menghidupkan Terpal
              </h2>
            </div>
            <p className="font-mono text-xs text-muted max-w-sm">
              Perpusjal bukan sekadar tempat menukar buku, melainkan arena pertemuan kebudayaan rakyat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pilar 1 */}
            <div className="border-2 border-foreground bg-surface p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_currentColor] relative">
              <div className="space-y-4">
                <div className="w-10 h-10 border-2 border-foreground bg-foreground text-background flex items-center justify-center font-mono text-sm font-black">
                  01
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Cukup Selembar Terpal
                  </h3>
                  <p className="font-mono text-xs text-muted mt-1 uppercase tracking-wider">
                    Akses Gratis Tanpa Sekat
                  </p>
                </div>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Kami tidak memiliki gedung ber-AC atau resepsionis formal. Lapak digelar di trotoar, rumput taman,
                  atau pinggir lapangan. Siapa pun boleh duduk beralaskan sandal, tanpa harus merasa minder atau canggung.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border-hairline font-mono text-[10px] text-muted uppercase flex justify-between">
                <span>SEKAT SOSIAL: NOL</span>
                <span>SIFAT: TERBUKA</span>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="border-2 border-foreground bg-surface p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_currentColor] relative">
              <div className="space-y-4">
                <div className="w-10 h-10 border-2 border-foreground bg-surface-muted text-foreground flex items-center justify-center font-mono text-sm font-black">
                  02
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Jiwa &ldquo;Ngurip-Urip&rdquo;
                  </h3>
                  <p className="font-mono text-xs text-muted mt-1 uppercase tracking-wider">
                    Solidaritas Saling Menghidupkan
                  </p>
                </div>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Tidak ada bos, dewan direksi, ataupun bayaran. Semua kawan bergerak atas rasa cinta sukarela
                  untuk saling menghidupkan minat baca. Menjaga buku, merapikan terpal, dan menyeduh kopi dilakukan gotong royong.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border-hairline font-mono text-[10px] text-muted uppercase flex justify-between">
                <span>PENGELOLAAN: SWADAYA</span>
                <span>MOTIF: SUKARELA</span>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="border-2 border-foreground bg-surface p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_currentColor] relative">
              <div className="space-y-4">
                <div className="w-10 h-10 border-2 border-foreground bg-surface-muted text-foreground flex items-center justify-center font-mono text-sm font-black">
                  03
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Praktik Keterampilan Nyata
                  </h3>
                  <p className="font-mono text-xs text-muted mt-1 uppercase tracking-wider">
                    Literasi Tangan &amp; Seni Kriya
                  </p>
                </div>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Literasi diperluas menjadi daya hidup: kami berlatih teknik sablon cukil kayu murah,
                  batik ecoprint daun jati bersama warga desa, pengolahan daur ulang plastik, hingga panggung sastra rakyat.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-border-hairline font-mono text-[10px] text-muted uppercase flex justify-between">
                <span>KETERAMPILAN: NYATA</span>
                <span>EKSPRESI: BEBAS</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. DUA SAYAP WILAYAH: KOTA VS. DESA HUTAN                */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="border-b-2 border-foreground pb-4 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                <TreePine className="w-3.5 h-3.5 text-foreground shrink-0" />
                <span>BENTANG WILAYAH KOLEKTIF</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1">
                Dua Sayap Gerakan di Tanah Blora
              </h2>
            </div>
            {/* Wing Switcher Toggle */}
            <div className="flex border-2 border-foreground font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveWing('KOTA')}
                className={cn(
                  'px-4 py-2 font-bold transition-colors',
                  activeWing === 'KOTA'
                    ? 'bg-foreground text-background'
                    : 'bg-surface text-foreground hover:bg-surface-muted'
                )}
              >
                [01] SAYAP KOTA (BLORA)
              </button>
              <button
                type="button"
                onClick={() => setActiveWing('DOPE')}
                className={cn(
                  'px-4 py-2 font-bold border-l-2 border-foreground transition-colors',
                  activeWing === 'DOPE'
                    ? 'bg-foreground text-background'
                    : 'bg-surface text-foreground hover:bg-surface-muted'
                )}
              >
                [02] SAYAP SELATAN (DOPLANG)
              </button>
            </div>
          </div>

          {/* Active Wing Content Card */}
          <div className="border-2 border-foreground bg-surface p-6 sm:p-10 shadow-[6px_6px_0px_0px_currentColor] relative">
            {activeWing === 'KOTA' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-block px-2.5 py-0.5 border border-foreground bg-foreground text-background font-mono text-[10px] font-bold uppercase tracking-wider">
                    PERPUSJAL BLORA // BASIS KOTA
                  </div>
                  <h3 className="font-serif text-3xl font-black text-foreground">
                    Menyapa Warga Trotoar, Kridosono &amp; Omah Talang Bocor
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    Bergerak di jantung kota Blora, lapak kota memadukan kehangatan membaca di Car Free Day Alun-Alun,
                    diskusi film independen di tepian Embung Rowo, dan bengkel kriya mandiri di <strong>Omah Talang Bocor</strong> (dekat Stadion Kridosono).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 font-mono text-xs">
                    <div className="p-3 border border-border-hairline bg-surface-muted/50 space-y-1">
                      <div className="text-[10px] text-muted uppercase font-bold">TITIK KUMPUL RUTIN:</div>
                      <div className="font-bold text-foreground">Alun-Alun CFD &amp; Tirtonadi</div>
                      <div className="text-[10px] text-muted">Setiap Minggu Pagi &amp; Sabtu Sore</div>
                    </div>
                    <div className="p-3 border border-border-hairline bg-surface-muted/50 space-y-1">
                      <div className="text-[10px] text-muted uppercase font-bold">KEGIATAN UTAMA:</div>
                      <div className="font-bold text-foreground">Cukil Kayu &amp; Diskusi Terbuka</div>
                      <div className="text-[10px] text-muted">Sablon kaos, puisi &amp; barongan</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-surface-muted border-2 border-foreground p-6 font-mono text-xs space-y-3">
                  <div className="text-[10px] uppercase font-bold text-muted border-b border-border-hairline pb-1">
                    KARAKTER SAYAP KOTA:
                  </div>
                  <ul className="space-y-2 text-[11px] text-foreground/90 font-sans">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-foreground font-bold">[•]</span>
                      <span>Menjangkau pelajar sekolah menengah, mahasiswa, dan keluarga muda perkotaan.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-foreground font-bold">[•]</span>
                      <span>Panggung terbuka bagi seniman jalanan, pemusik akustik, dan pegiat seni Barongan.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-foreground font-bold">[•]</span>
                      <span>Pusat gudang sirkulasi dan katalogisasi arsip buku kolektif Perpusjal.</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-block px-2.5 py-0.5 border border-foreground bg-foreground text-background font-mono text-[10px] font-bold uppercase tracking-wider">
                    PERPUSJAL DOPE // BASIS ALAS SELATAN
                  </div>
                  <h3 className="font-serif text-3xl font-black text-foreground">
                    Kemah Literasi &amp; Ruang Belajar Pinggir Hutan
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    Digerakkan kawan-kawan di Kecamatan Jati / Doplang, terhubung di Forum TBM (Instagram: <code>@perpusjal.dope</code>).
                    Fokus mendekatkan buku cerita dan edukasi kepada anak-anak pedesaan yang jauh dari toko buku kota.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 font-mono text-xs">
                    <div className="p-3 border border-border-hairline bg-surface-muted/50 space-y-1">
                      <div className="text-[10px] text-muted uppercase font-bold">AGENDA TAHUNAN:</div>
                      <div className="font-bold text-foreground">Kemah Alas Sendang Salak</div>
                      <div className="text-[10px] text-muted">Mata air Sendang Salak Desa Tanggel</div>
                    </div>
                    <div className="p-3 border border-border-hairline bg-surface-muted/50 space-y-1">
                      <div className="text-[10px] text-muted uppercase font-bold">PEMBERDAYAAN:</div>
                      <div className="font-bold text-foreground">Batik Ecoprint Daun Jati</div>
                      <div className="text-[10px] text-muted">Bersama ibu-ibu PKK &amp; pemuda desa</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-surface-muted border-2 border-foreground p-6 font-mono text-xs space-y-3">
                  <div className="text-[10px] uppercase font-bold text-muted border-b border-border-hairline pb-1">
                    KARAKTER SAYAP SELATAN:
                  </div>
                  <ul className="space-y-2 text-[11px] text-foreground/90 font-sans">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-foreground font-bold">[•]</span>
                      <span>Menjangkau anak-anak pelosok desa tepi hutan yang minim akses perpustakaan.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-foreground font-bold">[•]</span>
                      <span>Mengajarkan kesadaran ekologis dan pelestarian mata air alami Sendang Salak.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-foreground font-bold">[•]</span>
                      <span>Kolaborasi erat dengan ibu-ibu desa dan pegiat kriya dedaunan hutan.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. TABEL SIMBIOSIS: DPK PERPUSDA VS PERPUSJAL TERPAL     */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="border-b-2 border-foreground pb-4 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                <Coffee className="w-3.5 h-3.5 text-foreground shrink-0" />
                <span>SIMBIOSIS SALING MELENGKAPI</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1">
                Bergandengan Tangan Demi Warga Blora
              </h2>
            </div>
            <p className="font-mono text-xs text-muted max-w-sm">
              Perpusjal tidak pernah berniat menyaingi perpustakaan pemerintah; kami hadir mengisi ruang-ruang santai di luar gedung formal.
            </p>
          </div>

          <div className="border-2 border-foreground overflow-x-auto bg-surface shadow-[4px_4px_0px_0px_currentColor]">
            <table className="w-full text-left font-sans text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-foreground bg-surface-muted font-mono text-[11px] uppercase tracking-wider text-foreground">
                  <th className="p-3.5 sm:p-4 font-bold">ASPEK PELAYANAN</th>
                  <th className="p-3.5 sm:p-4 font-bold border-l-2 border-foreground">PERPUSDA KABUPATEN (DPK)</th>
                  <th className="p-3.5 sm:p-4 font-bold border-l-2 border-foreground bg-foreground text-background">
                    PERPUSJAL (LAPAK TERPAL)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                <tr>
                  <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Ruang Baca</td>
                  <td className="p-3.5 sm:p-4 text-foreground/80 border-l-2 border-foreground">
                    Gedung megah 4 lantai ber-AC &amp; mobil layanan keliling resmi CFD
                  </td>
                  <td className="p-3.5 sm:p-4 text-foreground font-semibold border-l-2 border-foreground bg-surface-muted/40">
                    Lesehan di trotoar, taman kota, angkringan, hingga mata air hutan
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Suasana Interaksi</td>
                  <td className="p-3.5 sm:p-4 text-foreground/80 border-l-2 border-foreground">
                    Formal, tenang, hening, dan teratur dengan tata tertib gedung
                  </td>
                  <td className="p-3.5 sm:p-4 text-foreground font-semibold border-l-2 border-foreground bg-surface-muted/40">
                    Hangat, santai, boleh sambil ngopi, bercanda, dan menggambar bebas
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Sumber Koleksi</td>
                  <td className="p-3.5 sm:p-4 text-foreground/80 border-l-2 border-foreground">
                    Pengadaan resmi APBD pemerintah daerah Kabupaten Blora
                  </td>
                  <td className="p-3.5 sm:p-4 text-foreground font-semibold border-l-2 border-foreground bg-surface-muted/40">
                    Sumbangan sukarela kawan-kawan relawan dan titipan berkah dari warga
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Kegiatan Belajar</td>
                  <td className="p-3.5 sm:p-4 text-foreground/80 border-l-2 border-foreground">
                    Kunjungan sekolah terstruktur, arsip daerah, pojok baca digital
                  </td>
                  <td className="p-3.5 sm:p-4 text-foreground font-semibold border-l-2 border-foreground bg-surface-muted/40">
                    Sablon cukil kayu, batik ecoprint daun jati, kemah alas, daur ulang sampah
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Tujuan Luhur</td>
                  <td colSpan={2} className="p-3.5 sm:p-4 text-center font-serif italic text-foreground font-bold border-l-2 border-foreground bg-surface-muted">
                    &ldquo;Sama-sama berjuang agar masyarakat Blora gemar membaca, berpengetahuan luas, dan merdeka berekspresi.&rdquo;
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 7. KOTAK AJAKAN TERLIBAT: DARI KITA UNTUK KITA            */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <div className="border-4 border-foreground bg-surface p-6 sm:p-12 lg:p-14 space-y-8 shadow-[6px_6px_0px_0px_currentColor]">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <div className="inline-block border border-foreground px-3 py-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-bold bg-surface-muted">
                PINTU TERPAL TERBUKA LEBAR
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground">
                Bagaimana Kamu Bisa Terlibat?
              </h2>
              <p className="font-serif italic text-sm sm:text-base text-muted leading-relaxed">
                Gerakan ini tidak punya pemilik tunggal. Kamu bisa mengambil peran sekecil apa pun untuk merawat nyala literasi di Blora.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              {/* Opsi 1 */}
              <div className="p-5 border-2 border-foreground bg-surface-muted/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    [ PERAN 01 // BACA &amp; KUNJUNGI ]
                  </div>
                  <div className="font-serif font-bold text-base text-foreground">
                    Mampir Duduk di Terpal
                  </div>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Cara paling membahagiakan mendukung kami adalah dengan datang, memilih buku, lalu membacanya santai di lapak CFD atau taman sore.
                  </p>
                </div>
                <Link
                  href="/cara-meminjam"
                  className="font-bold text-foreground underline inline-flex items-center gap-1 hover:opacity-80 pt-2"
                >
                  <span>Baca Panduan Pinjam</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Opsi 2 */}
              <div className="p-5 border-2 border-foreground bg-background space-y-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    [ PERAN 02 // DONASI BUKU ]
                  </div>
                  <div className="font-serif font-bold text-base text-foreground">
                    Sumbang Bacaan Bermutu
                  </div>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Punya buku sastra, novel, sejarah, atau buku cerita anak yang sudah selesai dibaca? Titipkan ke lapak kami agar bisa berputar ke tangan ratusan pembaca lain.
                  </p>
                </div>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Relawan%20Perpusjal%20Blora%2C%20saya%20ingin%20menitipkan%20donasi%20buku..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-foreground underline inline-flex items-center gap-1 hover:opacity-80 pt-2"
                >
                  <span>Hubungi Relawan Donasi</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Opsi 3 */}
              <div className="p-5 border-2 border-foreground bg-surface-muted/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    [ PERAN 03 // SUARA WARGA ]
                  </div>
                  <div className="font-serif font-bold text-base text-foreground">
                    Tulis Esai &amp; Resensi
                  </div>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Punya opini tentang kondisi Blora, cerita masa kecil, puisi, atau ulasan buku yang baru kamu tuntas baca? Kirimkan tulisanmu ke website ini.
                  </p>
                </div>
                <Link
                  href="/dashboard/tulisan/tulis"
                  className="font-bold text-foreground underline inline-flex items-center gap-1 hover:opacity-80 pt-2"
                >
                  <span>Mulai Tulis Artikel</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-foreground flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <span className="text-muted text-center sm:text-left">
                SEKRETARIAT &amp; BASECAMP BERSAMA: JL. PEMUDA NO. 12, BLORA
              </span>
              <Link
                href="/buku"
                className="min-h-[44px] px-6 py-2.5 bg-foreground text-background uppercase tracking-wider font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <BookOpen className="w-4 h-4" />
                <span>Telusuri Katalog Buku Terpal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
