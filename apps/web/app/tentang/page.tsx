'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
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
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  year: string;
  badge: string;
  phase: string;
  title: string;
  summary: string;
  fieldNotes: string;
  quote: string;
  quoteAuthor: string;
  atmosphere: string;
  location: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: '2017',
    badge: 'BABAK I // TITIK AWAL',
    phase: 'BENIH TROTOAR',
    title: 'Sebuah Terpal Biru di Bawah Trembesi Alun-Alun',
    summary:
      'Sekelompok anak muda di Blora mulai menggelar belasan buku pribadi beralaskan terpal sederhana di trotoar Alun-Alun dan Lapangan Kridosono. Kala itu masih mengusung semboyan jalanan: "Membaca adalah Melawan".',
    fieldNotes: 'Dimulai dari 15 judul novel bekas, zine fotokopian, dan satu termos teh melati hangat untuk siapa saja yang mampir bersila.',
    quote: 'Buku yang hanya disimpan di lemari kaca adalah buku yang kesepian.',
    quoteAuthor: 'Catatan Lapak Perdana 2017',
    atmosphere: 'Debu trotoar, aroma teh melati & gemuruh anak muda',
    location: 'Trotoar Alun-Alun & Lapangan Kridosono Blora',
  },
  {
    year: '2019',
    badge: 'BABAK II // KE SELATAN',
    phase: 'SAYAP HUTAN DOPLANG',
    title: 'Menyeberang ke Mata Air Hutan Sendang Salak',
    summary:
      'Gerakan merambah ke wilayah selatan Blora (Kecamatan Jati/Doplang). Lahir Perpusjal Dope, mendekatkan buku dongeng dan pengetahuan kepada anak-anak desa hutan yang berjarak puluhan kilometer dari perpustakaan kota.',
    fieldNotes: 'Sendang Salak Desa Tanggel menjadi saksi kemah literasi tahunan "Nginep Alas" pertama di bawah rimbun pohon jati.',
    quote: 'Anak-anak desa tidak kekurangan rasa ingin tahu; mereka hanya kekurangan akses bacaan bermutu.',
    quoteAuthor: 'Kawan Relawan Doplang',
    atmosphere: 'Gemericik mata air, hembusan daun jati & tawa anak desa',
    location: 'Mata Air Sendang Salak, Tanggel, Doplang',
  },
  {
    year: '2021',
    badge: 'BABAK III // METAMORFOSIS',
    phase: 'MERAWAT BAHAGIA',
    title: 'Dari "Melawan" Menjadi "Membaca dan Berbahagia"',
    summary:
      'Menyadari kata "melawan" sempat menimbulkan kesan kaku dan berjarak bagi warga awam serta para orang tua, Perpusjal bertransformasi merayakan kegembiraan: "Membaca dan Berbahagia". Membaca adalah pesta rakyat yang ramah bagi semua golongan.',
    fieldNotes: 'Terpal dipenuhi anak-anak yang asyik mewarnai, ibu-ibu yang bertukar cerita, dan remaja yang berdiskusi hangat tanpa sekat politis.',
    quote: 'Membaca itu rekreasi batin, bukan beban kewajiban yang menegangkan.',
    quoteAuthor: 'Musyawarah Relawan 2021',
    atmosphere: 'Crayon warna-warni, senyum warga & lesehan santai CFD',
    location: 'Car Free Day Alun-Alun & Ruang Publik Kota',
  },
  {
    year: '2024',
    badge: 'BABAK IV // KEMANDIRIAN KRIYA',
    phase: 'OMAH TALANG BOCOR',
    title: 'Bengkel Cukil Kayu & Literasi Tangan Mandiri',
    summary:
      'Ruang kreasi diperluas di markas Omah Talang Bocor dekat Stadion Kridosono. Literasi berkembang menjadi kecakapan hidup: workshop sablon cukil kayu murah, batik ecoprint daun jati bersama warga desa, dan daur ulang plastik.',
    fieldNotes: 'Belasan remaja Blora mencetak zine dan kaos komunitas mereka sendiri memakai papan cukil kayu tanpa mesin mahal.',
    quote: 'Tangan yang membolak-balik buku adalah tangan yang mampu berkarya nyata.',
    quoteAuthor: 'Kolektif Talang Bocor',
    atmosphere: 'Aroma tinta cetak, goresan pahat kayu & semangat berdikari',
    location: 'Markas Omah Talang Bocor (Kridosono)',
  },
  {
    year: '2026',
    badge: 'BABAK V // ARSIP RAKYAT',
    phase: 'DIGITALISASI TERBUKA',
    title: 'Katalog Merdeka & Wadah Suara Seluruh Warga',
    summary:
      'Peluncuran platform web digital mandiri: katalog buku sirkulasi terbuka, reservasi antrean otomatis tanpa denda sepeser pun, serta ruang redaksi bebas bagi warga Blora untuk menerbitkan resensi buku, esai opini, dan puisi.',
    fieldNotes: 'Teknologi kerakyatan yang ramah ponsel hemat kuota, tanpa pelacak iklan komersial, dan dirawat bersama.',
    quote: 'Setiap warga Blora berhak membaca, dan setiap warga berhak menyuarakan pikirannya.',
    quoteAuthor: 'Ruang Redaksi Perpusjal 2026',
    atmosphere: 'Kode terbuka, arsip digital & percakapan warga antar-generasi',
    location: 'Platform Web Perpusjal & Ruang Komunitas Terbuka',
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
  const [activeWing, setActiveWing] = React.useState<'KOTA' | 'DOPE'>('KOTA');
  const [openFaq, setOpenFaq] = React.useState<string | null>('faq-1');

  // Timeline Scroll Progress calculation (Thread Line fills down on scroll)
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const [timelineProgress, setTimelineProgress] = React.useState(0);

  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (timelineRef.current) {
            const rect = timelineRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const totalHeight = rect.height;

            // Calculate how far into the timeline section the viewport has scrolled
            const progress = Math.min(
              100,
              Math.max(0, ((windowHeight * 0.7 - rect.top) / totalHeight) * 100)
            );
            setTimelineProgress(progress);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

      <Header />

      <main className="flex-1 pb-16 sm:pb-24">
        {/* ========================================================= */}
        {/* 1. CINEMATIC BROADSHEET OPENING SCENE                     */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-10 sm:pb-16 relative overflow-hidden">
          {/* Subtle giant background typography watermark */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none font-serif text-[180px] sm:text-[280px] font-black leading-none text-foreground tracking-tighter">
            BLORA
          </div>

          {/* Top Vintage Gazette Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3 mb-8 sm:mb-12 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted gap-2 relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <BrandStamp edition="KRONIK GERAKAN" year="2026" />
              <span className="hidden sm:inline">[ MANIFESTO &amp; DOKUMEN HISTORIS // SWADAYA RAKYAT ]</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-none bg-foreground animate-pulse" />
              <span>BERJALAN SEJAK 2017</span>
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

          <RevealOnScroll variant="fade-up" delayMs={150}>
            <div className="max-w-4xl space-y-4 sm:space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground font-mono text-[9px] sm:text-[10px] tracking-wider uppercase font-bold bg-foreground text-background">
                <span>GERAKAN LITERASI AKAR RUMPUT BLORA</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-foreground leading-[1.02] sm:leading-[0.95] break-words">
                MEMBACA DAN <br />
                <span className="italic font-normal lowercase font-serif">merawat bahagia bersama.</span>
              </h1>

              <p className="font-serif text-lg sm:text-2xl text-foreground/90 leading-relaxed pt-1 sm:pt-2 max-w-3xl">
                Sebuah ikhtiar swadaya warga Blora untuk membebaskan buku dari lemari kaca:
                digelar hangat di atas selembar terpal, bebas birokrasi, tanpa uang jaminan,
                dan menghidupkan percakapan merdeka di ruang-ruang terbuka.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted uppercase tracking-wider border-t border-border-hairline">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-foreground" />
                  <span>Trotoar Alun-Alun &amp; Kridosono</span>
                </div>
                <span>&bull;</span>
                <div className="flex items-center gap-1.5">
                  <TreePine className="w-3.5 h-3.5 text-foreground" />
                  <span>Sendang Salak Alas Tanggel</span>
                </div>
                <span>&bull;</span>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-foreground" />
                  <span>100% Swadaya Tanpa Sponsor</span>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ========================================================= */}
        {/* 2. PROLOG BUDAYA: KELUARGA TOER & WARISAN PATABA          */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-b-2 border-foreground">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Left Narrative Text with Subtle Fade-up */}
            <div className="lg:col-span-7 space-y-6 font-serif text-base sm:text-lg text-foreground/90 leading-[1.8] sm:leading-[1.85]">
              <RevealOnScroll variant="fade-up" delayMs={50}>
                <div className="border-b border-border-hairline pb-2 mb-2 font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                  <Feather className="w-3.5 h-3.5 text-foreground shrink-0" />
                  <span>AKAR INSPIRASI KULTURAL</span>
                </div>

                <p className="first-letter:float-left first-letter:text-5xl sm:first-letter:text-6xl first-letter:leading-none first-letter:font-serif first-letter:pr-3.5 first-letter:pt-1 first-letter:font-bold first-letter:text-foreground">
                  Kabupaten Blora di Jawa Tengah menempati posisi tersendiri dalam sejarah kesusastraan Indonesia.
                  Tanah jati ini melahirkan sastrawan besar dunia <strong>Pramoedya Ananta Toer</strong>,
                  serta adiknya, <strong>Mbah Soesilo Toer</strong>, peraih gelar doktor ekonomi dari Moskow
                  yang memilih pulang ke Blora, memulung barang bekas, dan mendirikan <strong>Perpustakaan PATABA</strong> yang legendaris.
                </p>
              </RevealOnScroll>

              <RevealOnScroll variant="fade-up" delayMs={150}>
                <p>
                  Namun di balik kebanggaan sejarah tersebut, kenyataan sehari-hari warga pinggiran memperlihatkan
                  jurang yang nyata. Masih banyak anak-anak muda, pelajar desa pelosok, dan warga biasa yang kesulitan mendapatkan
                  bacaan bermutu. Melangkahkan kaki ke gedung perpustakaan formal sering kali terasa segan, kaku, dan berjarak.
                </p>
              </RevealOnScroll>

              <RevealOnScroll variant="fade-up" delayMs={200}>
                <p>
                  Dari keresahan itulah, <strong>Perpustakaan Jalanan Blora</strong> hadir. Kami tidak menunggu warga
                  datang; kamilah yang memanggul buku mendatangi ruang santai warga. Cukup menggelar terpal di trotoar Alun-Alun saat Car Free Day,
                  di bawah teduh trembesi taman kota, atau di dekat embung desa, siapa pun boleh duduk bersila, membaca, dan meminjam buku secara cuma-cuma.
                </p>
              </RevealOnScroll>
            </div>

            {/* Right Pull Quote Scene Card with Stamp Reveal */}
            <div className="lg:col-span-5">
              <RevealOnScroll variant="stamp" delayMs={100}>
                <div className="border-2 border-foreground bg-surface p-6 sm:p-8 space-y-6">
                  <div className="font-mono text-[10px] uppercase tracking-ultra text-muted border-b border-foreground pb-2 flex items-center justify-between">
                    <span>[ AMANAT PATABA ]</span>
                    <span className="text-foreground font-bold">KUTHO KIDUL, BLORA</span>
                  </div>

                  <div className="relative border-l-4 border-foreground pl-4 py-1">
                    <blockquote className="font-serif italic text-xl sm:text-2xl text-foreground leading-snug">
                      &ldquo;Membaca bukan cuma soal mengeja huruf di atas kertas, tapi jalan melatih rasa dan pikiran agar kita menjadi manusia yang berdaulat dan merdeka.&rdquo;
                    </blockquote>
                  </div>

                  <cite className="block font-mono text-[11px] uppercase tracking-wider text-muted not-italic border-t border-border-hairline pt-3">
                    — Mbah Soesilo Toer (Perpustakaan PATABA Blora)
                  </cite>

                  <div className="p-4 bg-surface-muted border border-border-hairline font-mono text-xs space-y-2">
                    <div className="text-[10px] uppercase font-bold text-foreground">
                      Transformasi Semboyan Kita:
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="line-through text-muted">Membaca adalah Melawan</span>
                      <span>→</span>
                      <strong className="text-foreground">Membaca dan Berbahagia</strong>
                    </div>
                    <p className="font-sans text-[11px] text-muted leading-relaxed pt-1">
                      Membaca tidak lagi dipertentangkan sebagai simbol perlawanan yang tegang, melainkan dirayakan sebagai festival kehangatan bersama warga.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. THE CINEMATIC TIMELINE RIVER (SCROLL-DRIVEN VOYAGE)     */}
        {/* ========================================================= */}
        <section ref={timelineRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 overflow-x-clip">
          <RevealOnScroll variant="fade-up">
            <div className="border-b-2 border-foreground pb-6 mb-12 sm:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                  <Clock className="w-4 h-4 text-foreground shrink-0" />
                  <span>KRONIK PERJALANAN SIRKULASI (2017 – 2026)</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mt-1">
                  Jejak Terpal dari Waktu ke Waktu
                </h2>
              </div>
              <p className="font-mono text-xs text-muted max-w-md leading-relaxed">
                Gulir ke bawah untuk menelusuri bagaimana selembar terpal trotoar di alun-alun berkembang menjadi ekosistem literasi yang menjangkau desa dan hutan jati.
              </p>
            </div>
          </RevealOnScroll>

          {/* Cinematic Vertical Timeline Track with Progressive Thread Line */}
          <div className="relative">
            {/* Background Spine Guide (Faint) */}
            <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-foreground/15" />

            {/* Active Thread Line (Fills down dynamically on scroll) */}
            <div
              className="absolute left-6 md:left-1/2 top-4 w-1 -translate-x-1/2 bg-foreground transition-all duration-150 ease-out"
              style={{ height: `${timelineProgress}%` }}
            />

            <div className="space-y-12 sm:space-y-24">
              {TIMELINE_EVENTS.map((event, idx) => {
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={event.year}
                    className={cn(
                      'relative flex flex-col md:flex-row items-center gap-8 lg:gap-16 group',
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    )}
                  >
                    {/* Spine Node Badge in Center with Stamp Effect */}
                    <div className="absolute left-6 md:left-1/2 top-0 -translate-x-1/2 z-20 flex items-center justify-center">
                      <RevealOnScroll variant="stamp" delayMs={50}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-foreground bg-background text-foreground font-mono font-black text-xs sm:text-sm flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors cursor-default">
                          {event.year.slice(-2)}
                        </div>
                      </RevealOnScroll>
                    </div>

                    {/* Left/Right Story Card with Slide-in Transition */}
                    <div className="w-full md:w-1/2 pl-14 md:pl-0">
                      <RevealOnScroll
                        variant={isEven ? 'slide-right' : 'slide-left'}
                        delayMs={100}
                      >
                        <div
                          className={cn(
                            'border-2 border-foreground bg-surface p-6 sm:p-8 relative overflow-hidden transition-all duration-300',
                            isEven ? 'md:mr-8 lg:md:mr-12' : 'md:ml-8 lg:md:ml-12'
                          )}
                        >
                          {/* Huge Background Watermark of Year */}
                          <div className="absolute -right-4 -bottom-6 font-serif font-black text-[90px] sm:text-[120px] text-foreground/5 select-none pointer-events-none leading-none">
                            {event.year}
                          </div>

                          <div className="space-y-4 relative z-10">
                            {/* Header Strip */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline pb-3 font-mono text-[10px]">
                              <span className="font-bold uppercase tracking-wider text-muted">
                                {event.badge}
                              </span>
                              <span className="px-2 py-0.5 bg-foreground text-background font-bold tracking-widest">
                                {event.phase}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
                              {event.title}
                            </h3>

                            {/* Summary */}
                            <p className="font-sans text-xs sm:text-sm text-foreground/85 leading-relaxed">
                              {event.summary}
                            </p>

                            {/* Atmospheric Location & Field Note */}
                            <div className="p-3 bg-surface-muted/60 border-l-2 border-foreground font-mono text-xs space-y-1">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-foreground">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span>{event.location}</span>
                              </div>
                              <p className="font-sans text-[11px] text-muted leading-relaxed">
                                {event.fieldNotes}
                              </p>
                            </div>

                            {/* Quote Callout */}
                            <div className="pt-2 border-t border-border-hairline">
                              <blockquote className="font-serif italic text-xs sm:text-sm text-foreground/90">
                                &ldquo;{event.quote}&rdquo;
                              </blockquote>
                              <span className="block font-mono text-[9px] uppercase tracking-wider text-muted mt-1">
                                — {event.quoteAuthor}
                              </span>
                            </div>
                          </div>
                        </div>
                      </RevealOnScroll>
                    </div>

                    {/* Opposite Side: Atmospheric Filmic Stamp Card (Desktop Only) */}
                    <div className="hidden md:flex md:w-1/2 items-center justify-center">
                      <RevealOnScroll
                        variant={isEven ? 'slide-left' : 'slide-right'}
                        delayMs={150}
                      >
                        <div
                          className={cn(
                            'p-6 border-2 border-dashed border-foreground/40 bg-surface-muted/30 font-mono text-xs max-w-sm w-full space-y-3',
                            isEven ? 'ml-8 lg:ml-12' : 'mr-8 lg:mr-12'
                          )}
                        >
                          <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-widest border-b border-border-hairline pb-2">
                            <span>SUASANA ZAMAN</span>
                            <span className="font-bold text-foreground">{event.year}</span>
                          </div>
                          <p className="font-serif italic text-sm text-foreground/90 leading-relaxed">
                            &ldquo;{event.atmosphere}&rdquo;
                          </p>
                          <div className="text-[9px] uppercase tracking-widest text-muted flex items-center justify-between pt-1">
                            <span>DOKUMEN HISTORIS</span>
                            <span className="font-bold text-foreground">PERPUSJAL_ARCHIVE</span>
                          </div>
                        </div>
                      </RevealOnScroll>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. DUA SAYAP WILAYAH: KOTA VS. DESA HUTAN                */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t-2 border-foreground">
          <RevealOnScroll variant="fade-up">
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
          </RevealOnScroll>

          {/* Active Wing Content Card with Stamp Reveal */}
          <RevealOnScroll variant="stamp" delayMs={50}>
            <div className="border-2 border-foreground bg-surface p-6 sm:p-10 relative">
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
          </RevealOnScroll>
        </section>

        {/* ========================================================= */}
        {/* 5. TABEL SIMBIOSIS: DPK PERPUSDA VS PERPUSJAL TERPAL     */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <RevealOnScroll variant="fade-up">
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
          </RevealOnScroll>

          <RevealOnScroll variant="fade-up" delayMs={100}>
            <div className="border-2 border-foreground overflow-x-auto bg-surface">
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
          </RevealOnScroll>
        </section>

        {/* ========================================================= */}
        {/* 6. TANYA JAWAB KETERLIBATAN (FAQ RELAWAN & DONASI)        */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <RevealOnScroll variant="fade-up">
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
          </RevealOnScroll>

          <div className="space-y-3 max-w-4xl">
            {GRASSROOTS_FAQS.map((faq, idx) => {
              const isOpen = openFaq === faq.id;
              return (
                <RevealOnScroll key={faq.id} variant="fade-up" delayMs={idx * 50}>
                  <div className="border-2 border-foreground bg-surface overflow-hidden transition-all">
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
                </RevealOnScroll>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 7. KOTAK AJAKAN TERLIBAT: DARI KITA UNTUK KITA            */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <RevealOnScroll variant="stamp" delayMs={50}>
            <div className="border-4 border-foreground bg-surface p-6 sm:p-12 lg:p-14 space-y-8">
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
                <div className="p-5 border-2 border-foreground bg-background space-y-3 flex flex-col justify-between">
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
          </RevealOnScroll>
        </section>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
