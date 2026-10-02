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
  HelpCircle,
  ChevronDown,
  Quote,
  BookMarked,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  year: string;
  badge: string;
  title: string;
  summary: string;
  fieldNotes: string;
  visualIcon: 'terpal' | 'hutan' | 'senyum' | 'kriya' | 'web';
  quote: string;
  quoteAuthor: string;
}

const TIMELINE_DATA: TimelineEvent[] = [
  {
    year: '2017',
    badge: 'BENIH TROTOAR',
    title: 'Awal Mula di Sudut Lapangan & Trotoar Kota',
    summary:
      'Sekelompok anak muda di Blora mulai menggelar belasan buku pribadi beralaskan terpal sederhana di trotoar Alun-Alun dan Lapangan Kridosono. Kala itu masih mengusung semboyan jalanan: "Membaca adalah Melawan".',
    fieldNotes: 'Dimulai dari 15 judul novel bekas, zine fotokopian, dan satu termos teh melati hangat.',
    visualIcon: 'terpal',
    quote: 'Buku yang hanya disimpan di lemari kaca adalah buku yang kesepian.',
    quoteAuthor: 'Catatan Lapak Perdana 2017',
  },
  {
    year: '2019',
    badge: 'SAYAP SELATAN',
    title: 'Lahirnya Perpusjal Dope di Pelosok Hutan Jati',
    summary:
      'Gerakan merambah ke wilayah selatan Blora (Kecamatan Jati/Doplang). Mendekatkan buku dongeng dan pengetahuan kepada anak-anak pedesaan yang berjarak puluhan kilometer dari perpustakaan kota.',
    fieldNotes: 'Sendang Salak Tanggel menjadi saksi kemah literasi tahunan pertama di bawah rimbun hutan jati.',
    visualIcon: 'hutan',
    quote: 'Anak-anak desa tidak kekurangan rasa ingin tahu; mereka hanya kekurangan akses.',
    quoteAuthor: 'Relawan Perpusjal Dope',
  },
  {
    year: '2021',
    badge: 'METAMORFOSIS',
    title: 'Dari "Melawan" Menjadi "Membaca dan Berbahagia"',
    summary:
      'Menyadari kata "melawan" sempat menimbulkan kesan kaku dan berjarak bagi warga awam serta para orang tua, Perpusjal secara resmi bertransformasi merayakan kegembiraan: "Membaca dan Berbahagia".',
    fieldNotes: 'Terpal dipenuhi anak-anak yang mewarnai, ibu-ibu yang mengobrol, dan remaja yang berdiskusi santai.',
    visualIcon: 'senyum',
    quote: 'Membaca itu rekreasi batin, bukan beban kewajiban yang menegangkan.',
    quoteAuthor: 'Musyawarah Relawan 2021',
  },
  {
    year: '2024',
    badge: 'BENGKEL KRIYA',
    title: 'Markas Omah Talang Bocor & Keterampilan Nyata',
    summary:
      'Ruang kreasi diperluas di markas Omah Talang Bocor dekat Stadion Kridosono. Literasi berkembang menjadi kecakapan hidup: workshop sablon cukil kayu mandiri, batik ecoprint daun jati, dan daur ulang.',
    fieldNotes: 'Belasan remaja Blora mencetak zine dan kaos komunitas mereka sendiri memakai papan cukil kayu.',
    visualIcon: 'kriya',
    quote: 'Tangan yang membolak-balik buku adalah tangan yang mampu berkarya nyata.',
    quoteAuthor: 'Kolektif Talang Bocor',
  },
  {
    year: '2026',
    badge: 'ARSIP RAKYAT',
    title: 'Katalog Terbuka & Wadah Karya Tulis Warga',
    summary:
      'Peluncuran platform web digital mandiri: pencarian katalog buku terbuka, reservasi antrean otomatis, serta ruang redaksi bebas bagi warga Blora untuk menerbitkan resensi buku, esai opini, dan puisi.',
    fieldNotes: 'Teknologi kerakyatan yang ringan kuota, tanpa iklan komersial, dan dirawat gotong royong.',
    visualIcon: 'web',
    quote: 'Setiap warga Blora berhak membaca, dan setiap warga berhak menyuarakan pikirannya.',
    quoteAuthor: 'Platform Web Perpusjal 2026',
  },
];

interface ArtifactItem {
  id: string;
  name: string;
  symbol: string;
  origin: string;
  tagline: string;
  story: string;
}

const ARTIFACTS_DATA: ArtifactItem[] = [
  {
    id: 'art-1',
    name: 'Terpal Biru Trotoar',
    symbol: '🏕',
    origin: 'Alun-Alun & Taman Tirtonadi',
    tagline: 'Simbol Kesetaraan Tanpa Sekat Kelas',
    story:
      'Di atas terpal, tidak ada kursi kehormatan bagi pejabat dan tidak ada lantai rendah bagi rakyat biasa. Siapa pun yang melepas alas kaki dan duduk bersila memiliki derajat yang persis sama untuk membaca buku yang sama.',
  },
  {
    id: 'art-2',
    name: 'Papan Cukil Kayu & Rol Tinta',
    symbol: '🎨',
    origin: 'Omah Talang Bocor Kridosono',
    tagline: 'Kemandirian Berekspresi & Seni Rakyat',
    story:
      'Memakai cukil kayu (woodcut printmaking) murah meriah, anak-anak muda Blora belajar mencetak desain poster, pembatas buku, dan kaos zine mereka sendiri tanpa perlu modal mesin percetakan mahal.',
  },
  {
    id: 'art-3',
    name: 'Kain Ecoprint Daun Jati',
    symbol: '🍃',
    origin: 'Sendang Salak Desa Tanggel (Doplang)',
    tagline: 'Harmoni Alam Hutan Jati & Pemberdayaan Warga',
    story:
      'Diinisiasi bersama ibu-ibu desa hutan jati di Blora Selatan. Mengetuk getah daun jati segar ke atas kain mori menghasilkan motif alam yang bernilai seni tinggi sekaligus melatih kemandirian ekonomi keluarga.',
  },
  {
    id: 'art-4',
    name: 'Termos Kopi & Kaleng Gotong Royong',
    symbol: '☕',
    origin: 'Lapak Mingguan Perpusjal',
    tagline: 'Bukti Nyata Swadaya Tanpa Sponsor Korporat',
    story:
      'Teh hangat diseduh dari rumah relawan, kopi disumbang pengunjung terpal, dan koin sukarela di kaleng bekas dipakai membeli plastik pembungkus buku. Lapak ini hidup dari cinta warga, bukan proposal komersial.',
  },
];

interface GrassrootsFAQ {
  id: string;
  q: string;
  a: string;
}

const GRASSROOTS_FAQS: GrassrootsFAQ[] = [
  {
    id: 'faq-1',
    q: 'Siapa saja yang boleh menjadi relawan di Perpustakaan Jalanan Blora?',
    a: 'Siapa saja! Kamu tidak harus mahasiswa sastra atau kutu buku. Pelajar SMA, pekerja harian, fotografer, guru, hingga pemuda desa boleh bergabung. Tugasnya sederhana dan menyenangkan: membantu menggelar terpal, menata buku, menyapa pembaca cilik, atau mendokumentasikan kegiatan lapak.',
  },
  {
    id: 'faq-2',
    q: 'Bagaimana cara menyumbangkan buku fisik yang saya miliki?',
    a: 'Kamu bisa langsung membawa buku ke lapak terpal saat Car Free Day Alun-Alun (Minggu pagi) atau Taman Tirtonadi (Sabtu sore). Kami menerima novel, komik anak, sastra, sejarah, sains populer, buku cerita bergambar, hingga zine independen. Buku yang masih layak baca akan langsung kami beri stempel dan dimasukkan ke dalam katalog sirkulasi warga.',
  },
  {
    id: 'faq-3',
    q: 'Apakah kegiatan lapak terpal tetap buka jika cuaca mendung atau hujan?',
    a: 'Jika gerimis rintik atau hujan deras saat Car Free Day, buku fisik kami amankan ke tempat teduh (seperti teras pendopo atau koridor toko terdekat). Jika hujan reda, lapak kembali digelar. Kami selalu mengabarkan status lapak secara langsung lewat media sosial dan grup WhatsApp warga.',
  },
  {
    id: 'faq-4',
    q: 'Bagaimana cara warga menerbitkan tulisan, puisi, atau esai di website ini?',
    a: 'Cukup buat akun gratis di website ini, lalu masuk ke menu "Tulis". Kamu bisa mengetik esai, resensi buku yang baru kamu baca, atau cerita budaya seputar Blora. Tulisanmu akan dipublikasikan di rubrik Arsip Tulisan Warga agar dapat dibaca oleh masyarakat luas.',
  },
];

export default function AboutPage() {
  const [selectedYear, setSelectedYear] = React.useState<number>(0);
  const [activeArtifact, setActiveArtifact] = React.useState<number>(0);
  const [activeWing, setActiveWing] = React.useState<'KOTA' | 'DOPE'>('KOTA');
  const [openFaq, setOpenFaq] = React.useState<string | null>('faq-1');
  const yearScrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll year tab into view on mobile
  React.useEffect(() => {
    if (yearScrollRef.current) {
      const activeEl = yearScrollRef.current.children[selectedYear] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedYear]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
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
                sameAs: ['https://instagram.com/perpusjal.dope'],
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
        {/* 1. EDITORIAL BROADSHEET MASTHEAD                          */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 pb-8 sm:pb-12">
          {/* Top Colophon Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3 mb-6 sm:mb-8 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <BrandStamp edition="KRONIK GERAKAN" year="2026" />
              <span className="hidden sm:inline">[ ARSIP HISTORIOGRAFI &amp; DOKUMEN BUDAYA ]</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
              <span>BERKEMBANG DI BLORA SEJAK 2017</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                title="Cetak Arsip Panduan Zine"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>CETAK ARSIP</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-8 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground font-mono text-[9px] sm:text-[10px] tracking-wider uppercase font-bold bg-foreground text-background">
                <span>DARI TROTOAR KOTA HINGGA RIMBUN HUTAN JATI</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-foreground leading-[1.02] sm:leading-[0.95] break-words">
                MEMBACA DAN <br />
                <span className="italic font-normal lowercase font-serif">merawat bahagia bersama.</span>
              </h1>

              <p className="font-serif text-base sm:text-lg lg:text-xl text-foreground/90 max-w-2xl leading-relaxed pt-1 sm:pt-2">
                Sebuah ikhtiar swadaya warga Blora untuk membebaskan buku dari lemari kaca:
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
              <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90 font-sans">
                <li className="flex items-start gap-2">
                  <span className="font-mono text-foreground font-bold shrink-0">🏛</span>
                  <span><strong>Warisan Budaya:</strong> Meneladani semangat Pramoedya Ananta Toer &amp; PATABA.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-foreground font-bold shrink-0">🏕</span>
                  <span><strong>Format Lapak:</strong> Alun-Alun Blora, Taman Tirtonadi, dan Sendang Salak.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-mono text-foreground font-bold shrink-0">🤝</span>
                  <span><strong>Prinsip Kerja:</strong> <em>Ngurip-urip</em> (gotong royong saling menghidupkan).</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-border-hairline font-mono text-[10px] text-muted uppercase tracking-wider flex justify-between">
                <span>FORMAT: TERPAL BERSILA</span>
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
            {/* Left Main Editorial Narrative */}
            <div className="lg:col-span-8 space-y-6 font-serif text-base sm:text-lg text-foreground/90 leading-[1.8] sm:leading-[1.85]">
              <div className="border-b border-border-hairline pb-2 mb-4 font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                <Feather className="w-3.5 h-3.5 text-foreground shrink-0" />
                <span>AKAR SEJARAH &amp; KELAHIRAN GERAKAN</span>
              </div>

              <p className="first-letter:float-left first-letter:text-5xl sm:first-letter:text-6xl first-letter:leading-none first-letter:font-serif first-letter:pr-3.5 first-letter:pt-1 first-letter:font-bold first-letter:text-foreground">
                Kabupaten Blora di Jawa Tengah menempati posisi tersendiri dalam sejarah kesusastraan Indonesia.
                Tanah jati ini melahirkan maestro sastra dunia <strong>Pramoedya Ananta Toer</strong>,
                serta adiknya, <strong>Mbah Soesilo Toer</strong>, peraih gelar doktor ekonomi dari Uni Soviet
                yang memilih pulang ke Blora, memulung barang bekas, dan mendirikan <strong>Perpustakaan PATABA</strong> yang legendaris.
              </p>

              <p>
                Namun di balik harumnya sejarah sastra tersebut, kenyataan sehari-hari warga pinggiran memperlihatkan
                jurang yang nyata. Masih banyak anak-anak muda, pelajar pelosok desa, dan warga biasa yang kesulitan mendapatkan
                bacaan berkualitas. Bagi sebagian masyarakat di kampung dan tepi rel kereta, melangkahkan kaki ke gedung perpustakaan besar
                sering kali terasa segan, kaku, dan penuh formalitas administrasi.
              </p>

              <p>
                Dari kesadaran sederhana itulah, <strong>Perpustakaan Jalanan Blora (Perpusjal)</strong> lahir. Kami tidak menunggu warga
                datang; kamilah yang memanggul buku mendatangi ruang santai warga. Cukup menggelar terpal di trotoar Alun-Alun saat Car Free Day,
                di bawah teduh pohon trembesi taman kota, atau di dekat embung desa, siapa pun boleh duduk bersila, membaca, berdiskusi,
                dan meminjam buku tanpa pungutan biaya sepeser pun.
              </p>
            </div>

            {/* Right Pull Quote & Slogan Box */}
            <div className="lg:col-span-4 border-t-2 lg:border-t-0 lg:border-l-2 border-foreground pt-6 lg:pt-0 lg:pl-8 space-y-6">
              <div className="font-mono text-[10px] uppercase tracking-ultra text-muted">
                [ WEJANGAN PATABA ]
              </div>

              <div className="relative border-l-4 border-foreground pl-4 py-1">
                <blockquote className="font-serif italic text-xl sm:text-2xl text-foreground leading-snug">
                  &ldquo;Membaca bukan cuma soal mengeja huruf di atas kertas, tapi jalan melatih rasa dan pikiran agar kita menjadi manusia yang berdaulat dan merdeka.&rdquo;
                </blockquote>
              </div>

              <cite className="block font-mono text-[11px] uppercase tracking-wider text-muted not-italic border-t border-border-hairline pt-2">
                — Terinspirasi dari keteladanan Mbah Soesilo Toer (PATABA Blora)
              </cite>

              {/* Slogan Evolution Card */}
              <div className="p-4 sm:p-5 border-2 border-foreground bg-surface font-mono text-xs space-y-3 shadow-[3px_3px_0px_0px_currentColor]">
                <div className="text-[10px] uppercase tracking-wider text-muted font-bold pb-1 border-b border-border-hairline">
                  PERJALANAN SEMBOYAN GERAKAN
                </div>
                <div className="space-y-2">
                  <div className="p-2 border border-border-hairline bg-surface-muted text-muted line-through text-[11px]">
                    2017: &ldquo;Membaca adalah Melawan&rdquo;
                  </div>
                  <div className="p-2.5 border-2 border-foreground bg-background font-bold text-foreground text-[11px] flex items-center justify-between">
                    <span>KINI: &ldquo;Membaca dan Berbahagia&rdquo;</span>
                    <Smile className="w-3.5 h-3.5 shrink-0" />
                  </div>
                </div>
                <p className="text-[10px] text-muted leading-relaxed font-sans">
                  Semboyan diubah agar membaca dirayakan sebagai festival kebahagiaan warga—lesehan santai, anak-anak menggambar, dan bebas dari ketegangan politik.
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
              Klik tahun di bawah untuk membuka arsip penting dan catatan lapangan di balik perjalanan komunitas kami di Blora.
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
                      <span>FASE</span>
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
              <div className="lg:col-span-5 bg-surface-muted border-2 border-foreground p-5 sm:p-6 relative flex flex-col justify-between min-h-[240px] select-none font-mono">
                <div className="flex items-center justify-between border-b border-foreground/30 pb-2">
                  <span className="text-[9px] uppercase px-2 py-0.5 bg-foreground text-background font-bold tracking-wider">
                    {TIMELINE_DATA[selectedYear].badge}
                  </span>
                  <span className="text-2xl font-black font-serif text-foreground">
                    {TIMELINE_DATA[selectedYear].year}
                  </span>
                </div>

                <div className="py-4 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-muted flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5" />
                    <span>MUTIARA KATA LAPAK:</span>
                  </div>
                  <p className="font-serif italic text-sm text-foreground/95 leading-relaxed">
                    &ldquo;{TIMELINE_DATA[selectedYear].quote}&rdquo;
                  </p>
                  <span className="block text-[9px] text-muted text-right">— {TIMELINE_DATA[selectedYear].quoteAuthor}</span>
                </div>

                <div className="border-t border-foreground/30 pt-2 flex items-center justify-between text-[9px] text-muted">
                  <span>DOKUMEN HISTORIS</span>
                  <span className="font-bold text-foreground">ARSIP_PERPUSJAL</span>
                </div>
              </div>

              {/* Right Column: Title & Field Notes */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted mb-1">
                    PERISTIWA TAHUN {TIMELINE_DATA[selectedYear].year}
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {TIMELINE_DATA[selectedYear].title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-foreground/85 leading-relaxed mt-2">
                    {TIMELINE_DATA[selectedYear].summary}
                  </p>
                </div>

                {/* Field Notes Callout */}
                <div className="p-3 bg-surface-muted/70 border-l-2 border-foreground font-mono text-xs space-y-1">
                  <span className="text-[10px] font-bold text-foreground uppercase block">Catatan Lapangan:</span>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    {TIMELINE_DATA[selectedYear].fieldNotes}
                  </p>
                </div>

                {/* Navigation Buttons for Years */}
                <div className="flex items-center justify-between pt-2 border-t border-border-hairline font-mono text-xs">
                  <button
                    type="button"
                    disabled={selectedYear === 0}
                    onClick={() => setSelectedYear((prev) => Math.max(0, prev - 1))}
                    className="px-3 py-1.5 border border-border bg-surface text-[11px] uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none hover:border-foreground"
                  >
                    ← Tahun Sebelumnya
                  </button>
                  <span className="text-muted text-[11px]">
                    {selectedYear + 1} dari {TIMELINE_DATA.length}
                  </span>
                  <button
                    type="button"
                    disabled={selectedYear === TIMELINE_DATA.length - 1}
                    onClick={() => setSelectedYear((prev) => Math.min(TIMELINE_DATA.length - 1, prev + 1))}
                    className="px-3 py-1.5 border border-border bg-surface text-[11px] uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none hover:border-foreground"
                  >
                    Tahun Berikutnya →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. ARTEFAK FISIK LAPAK (INTERAKTIF & EDUKATIF)            */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="border-b-2 border-foreground pb-4 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-foreground shrink-0" />
                <span>ARTEFAK &amp; BENDA BERKASAH</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1">
                Empat Benda yang Menghidupkan Budaya Lapak
              </h2>
            </div>
            <p className="font-mono text-xs text-muted max-w-sm">
              Klik salah satu benda untuk membaca filosofi dan cerita unik di baliknya.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 4 Artifact Selectors */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {ARTIFACTS_DATA.map((art, idx) => {
                const isSelected = activeArtifact === idx;
                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setActiveArtifact(idx)}
                    className={cn(
                      'p-4 text-left border-2 transition-all font-mono flex items-center gap-3.5',
                      isSelected
                        ? 'border-foreground bg-foreground text-background shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                        : 'border-border-hairline bg-surface hover:border-foreground text-foreground'
                    )}
                  >
                    <span className="text-2xl shrink-0">{art.symbol}</span>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider opacity-80 truncate">{art.origin}</div>
                      <div className="font-serif font-bold text-sm sm:text-base truncate mt-0.5">{art.name}</div>
                    </div>
                    <ChevronRight className={cn('w-4 h-4 ml-auto shrink-0 transition-transform', isSelected && 'translate-x-1')} />
                  </button>
                );
              })}
            </div>

            {/* Right Detailed Showcase Card */}
            <div className="lg:col-span-7 border-2 border-foreground bg-surface p-6 sm:p-8 space-y-4 shadow-[4px_4px_0px_0px_currentColor]">
              <div className="flex items-center justify-between border-b-2 border-foreground pb-3 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{ARTIFACTS_DATA[activeArtifact].symbol}</span>
                  <div>
                    <span className="text-[10px] text-muted uppercase tracking-wider block">NAMA ARTEFAK:</span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                      {ARTIFACTS_DATA[activeArtifact].name}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-surface-muted border border-foreground px-2 py-0.5 uppercase font-bold">
                    KOLEKSI LAPAK
                  </span>
                </div>
              </div>

              <div className="inline-block font-mono text-xs uppercase font-bold text-foreground py-0.5 px-2 bg-surface-muted border border-border-hairline">
                Filosofi: {ARTIFACTS_DATA[activeArtifact].tagline}
              </div>

              <p className="font-serif text-base sm:text-lg text-foreground/90 leading-relaxed pt-1">
                {ARTIFACTS_DATA[activeArtifact].story}
              </p>

              <div className="pt-4 border-t border-border-hairline font-mono text-[11px] text-muted flex items-center justify-between">
                <span>Asal Usul: {ARTIFACTS_DATA[activeArtifact].origin}</span>
                <span className="font-bold text-foreground">RUANG_TERBUKA_BLORA</span>
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
                  'px-4 py-2 font-bold transition-colors min-h-[44px]',
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
                  'px-4 py-2 font-bold border-l-2 border-foreground transition-colors min-h-[44px]',
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
        {/* 7. TANYA JAWAB KETERLIBATAN (FAQ RELAWAN & DONASI)        */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="border-b-2 border-foreground pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-foreground shrink-0" />
                <span>PERTANYAAN CALON RELAWAN &amp; WARGA</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1">
                Tanya Jawab Seputar Gerakan
              </h2>
            </div>
            <p className="font-mono text-xs text-muted">
              Klik pertanyaan untuk melihat penjelasan lengkap.
            </p>
          </div>

          <div className="space-y-3 max-w-4xl">
            {GRASSROOTS_FAQS.map((faq, idx) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border-2 border-foreground bg-surface overflow-hidden transition-all shadow-[2px_2px_0px_0px_currentColor]"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 text-left font-mono flex items-center justify-between gap-4 hover:bg-surface-muted/40 transition-colors focus:outline-none min-h-[44px]"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="text-[10px] text-muted uppercase font-bold shrink-0 pt-0.5 sm:pt-0">
                        [Q{idx + 1}]
                      </span>
                      <span className="font-serif text-base sm:text-lg font-bold text-foreground">
                        {faq.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-foreground shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-border-hairline bg-surface-muted/20 font-sans text-xs sm:text-sm text-muted leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 8. KOTAK AJAKAN TERLIBAT: DARI KITA UNTUK KITA            */}
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
                  className="min-h-[44px] font-bold text-foreground underline inline-flex items-center gap-1 hover:opacity-80 pt-2"
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
                  className="min-h-[44px] font-bold text-foreground underline inline-flex items-center gap-1 hover:opacity-80 pt-2"
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
                  className="min-h-[44px] font-bold text-foreground underline inline-flex items-center gap-1 hover:opacity-80 pt-2"
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
                className="min-h-[44px] px-6 py-2.5 bg-foreground text-background uppercase tracking-wider font-bold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity w-full sm:w-auto text-center"
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
