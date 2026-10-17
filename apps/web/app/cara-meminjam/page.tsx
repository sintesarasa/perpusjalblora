'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import {
  BookOpen,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Coffee,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Compass,
  FileText,
  Printer,
  Copy,
  Check,
  ChevronDown,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  CalendarPlus,
  Radio,
} from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/contact';
import { cn } from '@/lib/utils';

interface StepItem {
  id: string;
  stepNum: string;
  title: string;
  tagline: string;
  badge: string;
  illustrationType: 'katalog' | 'lokasi' | 'slip' | 'lapak' | 'baca';
  instructions: string[];
  fieldNote: string;
  systemHint?: string;
}

const STEPS_DATA: StepItem[] = [
  {
    id: 'step-1',
    stepNum: '01',
    title: 'Pilih Judul di Katalog Web',
    tagline: 'Telusuri koleksi buku yang beredar di Blora',
    badge: 'TAHAP PENELUSURAN',
    illustrationType: 'katalog',
    instructions: [
      'Buka rubrik katalog buku digital Perpusjal Blora.',
      'Cari judul, nama penulis (Toer, Tan Malaka, Pram, dll), atau genre pilihan.',
      'Perhatikan label ketersediaan: [TERSEDIA] atau [SEDANG DIPINJAM].',
    ],
    fieldNote:
      'Catatan terpal: Kalau buku incaranmu sedang dipinjam orang lain, klik tombol "Gabung Antrean" agar sistem otomatis memberi jatah saat buku diserahkan kembali.',
    systemHint: 'GET /api/books?tersedia=true',
  },
  {
    id: 'step-2',
    stepNum: '02',
    title: 'Tentukan Titik Temu & Ambil',
    tagline: 'Pilih pos lapak terpal yang paling dekat dengan rute harianmu',
    badge: 'PENENTUAN RUTE',
    illustrationType: 'lokasi',
    instructions: [
      'Klik tombol "AJUKAN PINJAM BUKU" pada halaman rincian buku.',
      'Pilih lokasi pengambilan: CFD Alun-Alun, Taman Tirtonadi, atau Basecamp Jl. Pemuda.',
      'Tuliskan nomor WhatsApp aktifmu agar relawan lapak dapat mengabari kesiapan buku.',
    ],
    fieldNote:
      'Tidak ada biaya tebusan, meterai, ataupun uang jaminan. Cukup komitmen sebagai sesama warga pecinta buku.',
    systemHint: 'POST /api/loans/request { pickupPoint }',
  },
  {
    id: 'step-3',
    stepNum: '03',
    title: 'Simpan Slip & Kode Transaksi',
    tagline: 'Kupon 6-digit tanda sah peminjaman di buku besar kolektif',
    badge: 'VERIFIKASI MEJA',
    illustrationType: 'slip',
    instructions: [
      'Kamu akan menerima Kode Pengambilan unik 6 digit (contoh: #PJL-8492).',
      'Kode ini juga otomatis muncul di Dasbor Akun & dikonfirmasi relawan via WhatsApp.',
      'Cukup simpan tangkapan layar ponselmu atau catat kodenya di secarik kertas.',
    ],
    fieldNote:
      'Kode ini berfungsi seperti stempel perpustakaan jadul, memastikan buku tidak tertukar dengan kawan pembaca lainnya.',
    systemHint: 'REF_CODE: #PJL-849201 // STATUS: RESERVED',
  },
  {
    id: 'step-4',
    stepNum: '04',
    title: 'Ambil di Lapak & Sapa Relawan',
    tagline: 'Rasakan kehangatan ruang publik tanpa sekat birokrasi',
    badge: 'SERAH TERIMA TROTOAR',
    illustrationType: 'lapak',
    instructions: [
      'Datang ke lapak terpal yang kamu pilih sesuai jadwal buka relawan.',
      'Tunjukkan kode transaksi atau sebut namamu pada kawan relawan yang berjaga.',
      'Buku diserahkan langsung. Kamu boleh langsung pulang, atau duduk membaca di terpal sambil ngobrol santai.',
    ],
    fieldNote:
      'Bawa botol minum sendiri jika ingin berlama-lama membaca di lapak Alun-Alun atau Tirtonadi!',
    systemHint: 'CIRCULATION_DESK: READY_FOR_PICKUP',
  },
  {
    id: 'step-5',
    stepNum: '05',
    title: 'Baca 7 Hari & Pulangkan Riang',
    tagline: 'Perjanjian kehormatan warga: rawat fisik buku, kembalikan tepat waktu',
    badge: 'SIRKULASI AMANAH',
    illustrationType: 'baca',
    instructions: [
      'Masa baca standar adalah 7 hari kalender di rumahmu.',
      'Belum selesai membaca? Kamu bisa ajukan perpanjangan +7 hari lewat web atau chat relawan.',
      'Saat tuntas, pulangkan ke lapak mingguan mana pun atau drop box di Basecamp.',
    ],
    fieldNote:
      'NOL RUPIAH DENDA. Jika terlambat, jangan kabur atau malu! Kami tidak pernah mendenda uang sepeser pun. Cukup jujur kabari kawan relawan.',
    systemHint: 'LOAN_POLICY: ZERO_MONETARY_FINES',
  },
];

interface FAQItem {
  id: string;
  q: string;
  a: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: 'faq-1',
    q: 'Apakah saya harus punya KTP Blora atau kartu anggota resmi?',
    a: 'Sama sekali tidak! Siapa pun yang sedang tinggal, belajar, atau singgah di Blora boleh meminjam. Kami tidak menahan KTP fisik atau meminta fotokopi kartu identitas. Cukup daftarkan akun web atau berikan nomor WA aktif saat meminjam.',
  },
  {
    id: 'faq-2',
    q: 'Bagaimana kalau buku yang ingin saya baca sedang dipinjam orang lain?',
    a: 'Di halaman buku, klik tombol "Gabung Antrean / Waitlist". Sistem web kami akan mencatat antreanmu secara transparan. Ketika buku tersebut dikembalikan ke lapak, kamu akan menjadi orang pertama yang dihubungi oleh relawan.',
  },
  {
    id: 'faq-3',
    q: 'Apakah ada sanksi denda finansial jika terlambat mengembalikan?',
    a: 'Nol rupiah. Kami menolak konsep denda finansial dalam literasi warga. Yang kami minta hanyalah tanggung jawab moral dan komunikasi terbuka. Jika masa pinjam 7 hari hampir habis dan kamu belum selesai, minta perpanjangan waktu (+7 hari) via web atau chat relawan kami.',
  },
  {
    id: 'faq-4',
    q: 'Bolehkah saya langsung datang ke terpal tanpa memesan lewat web?',
    a: 'Sangat boleh! Website ini adalah alat bantu katalog bagi yang ingin memastikan stok dari rumah. Jika kamu sedang lewat di Car Free Day Alun-Alun atau Taman Tirtonadi, langsung saja pilih buku yang digelar di atas terpal. Relawan kami akan dengan senang hati mencatatkannya langsung di tempat.',
  },
  {
    id: 'faq-5',
    q: 'Berapa jumlah maksimal buku yang boleh dipinjam sekaligus?',
    a: 'Maksimal 2 (dua) buku per orang dalam satu waktu. Pembatasan ini bertujuan agar koleksi buku dapat berputar adil dan merata kepada seluruh warga pembaca di Blora.',
  },
];

export default function CaraMeminjamPage() {
  const [activeTab, setActiveTab] = React.useState<number>(0);
  const [ticketSampleCode, setTicketSampleCode] = React.useState<string>('PJL-849201');
  const [copied, setCopied] = React.useState<boolean>(false);
  const [openFaq, setOpenFaq] = React.useState<string | null>('faq-1');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // ── Loan Date Calculator State ──
  const [pickupDate, setPickupDate] = React.useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Calculate timelines
  const timelineDates = React.useMemo(() => {
    const d = new Date(pickupDate || Date.now());
    if (isNaN(d.getTime())) return null;

    const reminderDate = new Date(d);
    reminderDate.setDate(d.getDate() + 5);

    const dueDate = new Date(d);
    dueDate.setDate(d.getDate() + 7);

    const extendedDate = new Date(d);
    extendedDate.setDate(d.getDate() + 14);

    const formatDate = (date: Date) =>
      date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

    return {
      pickupFormatted: formatDate(d),
      reminderFormatted: formatDate(reminderDate),
      dueFormatted: formatDate(dueDate),
      extendedFormatted: formatDate(extendedDate),
      dueRaw: dueDate,
    };
  }, [pickupDate]);

  // Google Calendar URL Generator
  const googleCalendarUrl = React.useMemo(() => {
    if (!timelineDates?.dueRaw) return '#';
    const due = timelineDates.dueRaw;
    const startStr = due.toISOString().replace(/-|:|\.\d\d\d/g, '').split('T')[0] + 'T090000Z';
    const endStr = due.toISOString().replace(/-|:|\.\d\d\d/g, '').split('T')[0] + 'T100000Z';
    const title = encodeURIComponent('Kembalikan Buku / Perpanjang Pinjaman Perpusjal Blora');
    const details = encodeURIComponent(
      'Hari ini adalah jatuh tempo pengembalian buku di Perpustakaan Jalanan Blora (7 hari). Jika belum selesai, silakan perpanjang via web atau WA relawan.'
    );
    const location = encodeURIComponent('Alun-Alun Blora / Taman Tirtonadi / Basecamp Jl. Pemuda');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  }, [timelineDates]);

  // Real-time Day of Week Checker for Live Lapak Status
  const currentLapakStatus = React.useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();

    if (day === 0 && hour >= 6 && hour < 10) {
      return {
        active: true,
        text: 'LAPAK SEDANG DIGELAR SEKARANG DI ALUN-ALUN BLORA (06.00 – 09.30 WIB)',
        location: 'ALUN_ALUN',
      };
    }
    if (day === 6 && hour >= 15 && hour < 18) {
      return {
        active: true,
        text: 'LAPAK SENJA SEDANG BUKA DI TAMAN TIRTONADI (15.30 – 17.45 WIB)',
        location: 'TAMAN_TIRTONADI',
      };
    }
    return {
      active: false,
      text: 'Lapak terdekat berikutnya: Minggu pagi di Car Free Day Alun-Alun Blora',
      location: 'NEXT_SUNDAY',
    };
  }, []);

  // Auto-scroll active tab horizontally on small screens only on user interaction (never hijack window scroll on mount)
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.children[activeTab] as HTMLElement;
      if (activeEl) {
        const container = scrollContainerRef.current;
        const targetLeft =
          activeEl.offsetLeft - (container.clientWidth - activeEl.clientWidth) / 2;
        container.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: 'smooth',
        });
      }
    }
  }, [activeTab]);

  const handleCopyCode = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(ticketSampleCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
      {/* ── JSON-LD Structured Data for Google Search SEO (HowTo & FAQPage) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'Cara Meminjam Buku di Perpustakaan Jalanan Blora',
            description:
              'Panduan lengkap meminjam buku gratis tanpa jaminan uang dan tanpa denda di Perpustakaan Jalanan Blora.',
            step: STEPS_DATA.map((s, idx) => ({
              '@type': 'HowToStep',
              position: idx + 1,
              name: s.title,
              text: s.instructions.join(' '),
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_LIST.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.a,
              },
            })),
          }),
        }}
      />

      <Header />

      <main className="flex-1 pb-16 sm:pb-24">
        {/* ========================================================= */}
        {/* 1. EDITORIAL BROADSHEET MASTHEAD                          */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-8 sm:pb-12">
          {/* Top Vintage Gazette Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-border-hairline pb-3 mb-6 sm:mb-8 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <BrandStamp edition="EDISI PANDUAN" year="2026" />
              <span className="hidden sm:inline">[ LEMBAR PETUNJUK WARGA // DOKUMEN PUBLIK ]</span>
            </div>
            
            {/* Live Indicator Pill */}
            <div className="flex items-center gap-2 px-2.5 py-0.5 border border-foreground/40 bg-surface">
              <span
                className={cn(
                  'w-2 h-2',
                  currentLapakStatus.active
                    ? 'bg-foreground animate-pulse'
                    : 'bg-muted'
                )}
              />
              <span className="text-[10px] font-bold text-foreground truncate max-w-[240px] sm:max-w-none">
                {currentLapakStatus.text}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                title="Cetak Selebaran Panduan"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>CETAK SELEBARAN</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-8">
              <RevealOnScroll variant="cinematic" delayMs={100}>
                <div className="space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-foreground font-mono text-[9px] sm:text-[10px] tracking-wider uppercase font-bold bg-foreground text-background">
                    <span>MANUAL PEMINJAMAN PERPUSTAKAAN JALANAN</span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-foreground leading-[1.02] sm:leading-[0.95] break-words">
                    CARA MEMINJAM <br />
                    <span className="italic font-normal lowercase font-serif">&amp; membaca bebas.</span>
                  </h1>

                  <p className="font-serif text-base sm:text-lg lg:text-xl text-foreground/90 max-w-2xl leading-relaxed pt-1 sm:pt-2">
                    Di Perpustakaan Jalanan Blora, buku bukan benda museum yang dikurung dalam lemari kaca.
                    Siapa saja boleh meminjam, membawa pulang, dan membaca santai—tanpa kartu anggota formal,
                    tanpa setoran uang, dan tanpa denda sepeser pun.
                  </p>
                </div>
              </RevealOnScroll>
            </div>

            {/* Right Quick Summary Card */}
            <div className="lg:col-span-4">
              <RevealOnScroll variant="stamp" delayMs={150}>
                <div className="border-2 border-foreground bg-surface p-4 sm:p-6 font-mono text-xs space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between border-b border-foreground pb-2">
                    <span className="font-bold tracking-wider">[ MAKLUMAT RESMI ]</span>
                    <span className="text-[10px] bg-foreground text-background px-1.5 py-0.5 font-bold">GRATIS 100%</span>
                  </div>
                  <ul className="space-y-2 text-[11px] leading-relaxed text-foreground/90">
                    <li className="flex items-start gap-2">
                      <span className="text-foreground font-bold shrink-0">✔</span>
                      <span><strong>Nol Biaya Pendaftaran:</strong> Tak perlu beli map atau formulir.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-foreground font-bold shrink-0">✔</span>
                      <span><strong>Nol Uang Jaminan:</strong> Modal utamanya adalah rasa saling percaya.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-foreground font-bold shrink-0">✔</span>
                      <span><strong>Nol Denda Moneter:</strong> Terlambat baca? Cukup kabari relawan kami.</span>
                    </li>
                  </ul>
                  <div className="pt-2 border-t border-border-hairline text-[10px] text-muted uppercase tracking-wider flex justify-between">
                    <span>DURASI: 7 HARI</span>
                    <span>MAKS: 2 BUKU</span>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. THE EDITORIAL ROUTE: 5 INTERACTIVE / VISUAL STEPS       */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <RevealOnScroll variant="cinematic" delayMs={50}>
            <div className="border-b-2 border-foreground pb-4 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-foreground shrink-0" />
                  <span>TRAJEKTORI SIRKULASI</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1">
                  Lima Langkah Dari Trotoar ke Meja Belajarmu
                </h2>
              </div>
              <p className="font-mono text-xs text-muted max-w-sm">
                Alur peminjaman dirancang seringkas mungkin agar siapa pun dari anak sekolah hingga lansia dapat meminjam tanpa kebingungan.
              </p>
            </div>
          </RevealOnScroll>

          {/* Quick Step Switcher Tabs — Fully responsive: horizontal snap strip on mobile, neat grid on sm+ */}
          <RevealOnScroll variant="cinematic" delayMs={100}>
            <div className="relative pb-6">
              <div
                ref={scrollContainerRef}
                className="flex sm:grid sm:grid-cols-5 gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scroll-smooth snap-x snap-mandatory scrollbar-none"
                tabIndex={0}
                aria-label="Pilih langkah peminjaman buku"
              >
                {STEPS_DATA.map((st, index) => {
                  const isSelected = activeTab === index;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setActiveTab(index)}
                      className={cn(
                        'p-3 text-left border-2 transition-all font-mono shrink-0 snap-center min-w-[170px] sm:min-w-0 select-none min-h-[56px] focus:outline-none focus:ring-2 focus:ring-foreground',
                        isSelected
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border-hairline bg-surface hover:border-foreground text-foreground'
                      )}
                      aria-selected={isSelected}
                    >
                      <div className="text-[10px] uppercase tracking-wider opacity-80 flex items-center justify-between">
                        <span>LANGKAH {st.stepNum}</span>
                        {isSelected && <span className="w-1.5 h-1.5 bg-background sm:hidden" />}
                      </div>
                      <div className="font-bold text-xs truncate mt-0.5">{st.title}</div>
                    </button>
                  );
                })}
              </div>
              <div className="sm:hidden text-center text-[10px] font-mono text-muted pt-1 flex items-center justify-center gap-1">
                <span>← Geser untuk langkah lainnya →</span>
              </div>
            </div>
          </RevealOnScroll>

          {/* Active Step Feature Box: Authentic Gazette & Stamp Style */}
          <RevealOnScroll variant="stamp" delayMs={100}>
            <div className="border-2 border-foreground bg-surface p-4 sm:p-8 lg:p-10 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
              {/* Left Column: Authentic Architectural / Gazette Visual Blueprint */}
              <div className="lg:col-span-5 bg-surface-muted border-2 border-foreground p-4 sm:p-6 relative flex flex-col justify-between min-h-[220px] sm:min-h-[300px] select-none">
                {/* Vintage Perforated Stamp Corners */}
                <div className="absolute top-2 left-2 font-mono text-[9px] uppercase px-1.5 py-0.5 bg-foreground text-background font-bold tracking-wider max-w-[180px] sm:max-w-none truncate">
                  DOKUMEN // {STEPS_DATA[activeTab].badge}
                </div>
                <div className="absolute top-2 right-2 font-mono text-2xl font-black text-foreground/20">
                  #{STEPS_DATA[activeTab].stepNum}
                </div>

                {/* Dynamic Architectural Vector Diagram based on Step */}
                <div className="my-auto py-5 sm:py-6 flex flex-col items-center justify-center w-full">
                  {activeTab === 0 && (
                    <div className="w-full max-w-[280px] space-y-2.5 sm:space-y-3 font-mono text-xs">
                      {/* Terminal-like Catalog Search Box */}
                      <div className="border-2 border-foreground bg-background p-2.5 sm:p-3">
                        <div className="flex items-center gap-1.5 pb-2 border-b border-border-hairline text-[9px] sm:text-[10px] text-muted">
                          <span className="w-2 h-2 border border-foreground bg-foreground" />
                          <span className="w-2 h-2 border border-foreground" />
                          <span className="w-2 h-2 border border-foreground" />
                          <span className="ml-auto truncate">KATALOG_PERPUSJAL</span>
                        </div>
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <span className="font-bold text-foreground text-[11px] truncate">🔍 Pramoedya Ananta Toer</span>
                          <span className="text-[9px] bg-foreground text-background px-1 shrink-0">CARI</span>
                        </div>
                      </div>

                      {/* Mock Book Strip Result */}
                      <div className="border border-foreground bg-surface p-2 sm:p-2.5 flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-11 sm:w-9 sm:h-12 bg-foreground text-background font-serif font-black text-[8px] sm:text-[9px] flex items-center justify-center text-center p-1 leading-none shrink-0">
                          BUMI MANUSIA
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold truncate">Bumi Manusia</div>
                          <div className="text-[9px] text-muted truncate">Pramoedya A. Toer</div>
                          <div className="mt-1 inline-block text-[8px] sm:text-[9px] border border-foreground px-1 font-bold">
                            [STATUS: TERSEDIA]
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 1 && (
                    <div className="w-full max-w-[280px] space-y-2 font-mono text-xs">
                      <div className="text-[10px] uppercase font-bold text-muted border-b border-border-hairline pb-1">
                        PILIH TITIK DISTRIBUSI LAPAK:
                      </div>
                      <div className="p-2 sm:p-2.5 border-2 border-foreground bg-background space-y-0.5 sm:space-y-1">
                        <div className="flex items-center justify-between font-bold text-[10px] sm:text-[11px]">
                          <span className="truncate">[A] CFD ALUN-ALUN BLORA</span>
                          <span className="text-[8px] sm:text-[9px] bg-foreground text-background px-1 shrink-0">TERPILIH</span>
                        </div>
                        <div className="text-[9px] text-muted">Minggu Pagi // 06.00 - 09.30 WIB</div>
                      </div>

                      <div className="p-2 border border-border-hairline bg-surface/50 opacity-70">
                        <div className="text-[10px] sm:text-[11px] font-semibold truncate">[B] BASECAMP JL. PEMUDA</div>
                        <div className="text-[9px] text-muted">Senin - Jumat // Jam Kerja</div>
                      </div>

                      <div className="p-2 border border-border-hairline bg-surface/50 opacity-70">
                        <div className="text-[10px] sm:text-[11px] font-semibold truncate">[C] LAPAK TAMAN TIRTONADI</div>
                        <div className="text-[9px] text-muted">Sabtu Sore // 15.30 - 17.30 WIB</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 2 && (
                    <div className="w-full max-w-[280px]">
                      {/* Vintage Library Punch Card / Ticket Slip */}
                      <div className="border-2 border-foreground bg-background p-3 sm:p-4 relative font-mono">
                        {/* Perforations */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-surface-muted border-r-2 border-foreground" />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-surface-muted border-l-2 border-foreground" />

                        <div className="text-center border-b-2 border-dashed border-foreground pb-1.5 sm:pb-2">
                          <div className="text-[8px] uppercase tracking-widest text-muted">BUKTI RESERVASI BUKU</div>
                          <div className="font-serif font-black text-xs sm:text-sm text-foreground">PERPUSJAL BLORA</div>
                        </div>

                        <div className="py-2.5 sm:py-3 text-center space-y-1">
                          <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-muted">KODE PENGAMBILAN (6 DIGIT)</div>
                          <div className="text-xl sm:text-2xl font-black tracking-widest text-foreground bg-surface-muted py-1 border border-foreground/30">
                            #849-201
                          </div>
                          <div className="text-[8px] sm:text-[9px] text-muted pt-0.5">Tunjukkan kode ini ke relawan lapak</div>
                        </div>

                        <div className="border-t border-border-hairline pt-1.5 sm:pt-2 flex items-center justify-between text-[8px] sm:text-[9px] text-muted">
                          <span>VALID: 48 JAM</span>
                          <span>NOTIF WA: OK</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 3 && (
                    <div className="w-full max-w-[280px] font-mono text-xs space-y-2.5 sm:space-y-3">
                      <div className="border-2 border-foreground bg-background p-2.5 sm:p-3 relative">
                        <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-muted font-bold">MEJA SIRKULASI LAPAK TERPAL</div>
                        <div className="font-serif text-xs sm:text-sm font-bold text-foreground mt-0.5">
                          Serah Terima di Ruang Terbuka
                        </div>
                        <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-2 text-center text-[10px]">
                          <div className="p-1.5 sm:p-2 border border-foreground bg-surface-muted">
                            <span className="block font-bold">Relawan</span>
                            <span className="text-[9px] text-muted">Cek Kode Slip</span>
                          </div>
                          <div className="p-1.5 sm:p-2 border border-foreground bg-foreground text-background">
                            <span className="block font-bold">Peminjam</span>
                            <span className="text-[9px] opacity-80">Bawa Buku</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center font-serif italic text-[11px] sm:text-xs text-foreground/80">
                        &ldquo;Duduklah sejenak di atas terpal, seduh teh atau kopi, lalu kenalan dengan pembaca lain.&rdquo;
                      </div>
                    </div>
                  )}

                  {activeTab === 4 && (
                    <div className="w-full max-w-[280px] font-mono text-xs space-y-2 sm:space-y-2.5">
                      <div className="border-2 border-foreground bg-background p-3 sm:p-4 text-center space-y-1.5 sm:space-y-2">
                        <div className="inline-block px-2 py-0.5 bg-foreground text-background text-[9px] sm:text-[10px] font-bold">
                          JANJI AMANAH WARGA
                        </div>
                        <div className="font-serif font-black text-2xl sm:text-3xl text-foreground">7 HARI BACA</div>
                        <p className="text-[9px] sm:text-[10px] text-muted leading-tight">
                          Buku dirawat dengan cinta. Tanpa robekan, tanpa coretan, dan bebas dari basah air.
                        </p>
                        <div className="pt-2 border-t border-dashed border-foreground/40 flex items-center justify-center gap-1.5 text-xs font-bold text-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>0 RUPIAH DENDA</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Gazette Sub-strip */}
                <div className="border-t border-foreground/40 pt-2 flex items-center justify-between font-mono text-[9px] text-muted">
                  <span className="truncate max-w-[180px]">REF: {STEPS_DATA[activeTab].systemHint}</span>
                  <span className="font-bold text-foreground shrink-0">PERPUSJAL_OS</span>
                </div>
              </div>

              {/* Right Column: Step Instructions & Deep Context */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted mb-2">
                    <span className="px-2 py-0.5 border border-foreground bg-surface text-foreground">
                      TAHAPAN KE-{STEPS_DATA[activeTab].stepNum}
                    </span>
                    <span>&bull;</span>
                    <span>{STEPS_DATA[activeTab].badge}</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
                    {STEPS_DATA[activeTab].title}
                  </h3>
                  <p className="font-serif italic text-sm sm:text-base lg:text-lg text-foreground/80 mt-1">
                    {STEPS_DATA[activeTab].tagline}
                  </p>
                </div>

                {/* Tactical Checklist */}
                <div className="space-y-2.5 sm:space-y-3 font-sans">
                  {STEPS_DATA[activeTab].instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-surface-muted/60 border-l-2 border-foreground">
                      <span className="font-mono text-xs font-bold text-foreground pt-0.5 shrink-0">
                        [{i + 1}]
                      </span>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
                        {inst}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Ground Note / Human Touch */}
                <div className="p-3 sm:p-4 border border-foreground/30 bg-background font-mono text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-foreground">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Catatan Lapak Akar Rumput:</span>
                  </div>
                  <p className="text-[11px] text-muted font-sans leading-relaxed">
                    {STEPS_DATA[activeTab].fieldNote}
                  </p>
                </div>

                {/* Step Action / Navigation Buttons — Fully mobile-friendly touch targets */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    disabled={activeTab === 0}
                    onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
                    className="min-h-[44px] px-4 py-2 border border-border bg-surface font-mono text-xs uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none hover:border-foreground transition-colors order-2 sm:order-1 text-center font-semibold"
                  >
                    ← Langkah Sebelumnya
                  </button>

                  <div className="font-mono text-xs text-muted text-center order-1 sm:order-2">
                    {activeTab + 1} dari {STEPS_DATA.length}
                  </div>

                  {activeTab < STEPS_DATA.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab((prev) => Math.min(STEPS_DATA.length - 1, prev + 1))}
                      className="min-h-[44px] px-5 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 transition-opacity order-3 text-center"
                    >
                      Langkah Berikutnya →
                    </button>
                  ) : (
                    <Link
                      href="/buku"
                      className="min-h-[44px] px-5 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity order-3 text-center"
                    >
                      <span>Mulai Cari Buku Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ========================================================= */}
        {/* 3. SIMULATOR TENGGAT PINJAM & KALENDER (FITUR BARU)       */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <RevealOnScroll variant="stamp">
            <div className="border-2 border-foreground bg-surface p-5 sm:p-8 lg:p-10">
              <div className="border-b-2 border-foreground pb-4 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div>
                  <div className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-foreground shrink-0" />
                    <span>KALKULATOR SIKLUS PINJAM</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                    Hitung Jadwal &amp; Tenggat Baca Bukumu
                  </h2>
                </div>
                <p className="font-mono text-xs text-muted max-w-sm">
                  Pilih tanggal rencanamu mengambil buku untuk melihat estimasi tanggal jatuh tempo dan notifikasi santai kami.
                </p>
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Form: Select Date */}
              <div className="lg:col-span-4 space-y-4 font-mono">
                <div className="p-4 bg-surface-muted border border-border-hairline space-y-3">
                  <label htmlFor="pickup-date-input" className="block text-xs uppercase tracking-wider font-bold text-foreground">
                    TANGGAL RENCANA AMBIL:
                  </label>
                  <input
                    id="pickup-date-input"
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-foreground bg-background text-foreground font-mono text-xs focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPickupDate(new Date().toISOString().split('T')[0])}
                      className="px-2.5 py-1 text-[10px] uppercase font-bold border border-foreground bg-background hover:bg-surface-muted"
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const nextSunday = new Date(now);
                        nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
                        setPickupDate(nextSunday.toISOString().split('T')[0]);
                      }}
                      className="px-2.5 py-1 text-[10px] uppercase font-bold border border-foreground bg-background hover:bg-surface-muted"
                    >
                      CFD Minggu Besok
                    </button>
                  </div>
                </div>

                {timelineDates && (
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] w-full px-4 py-2.5 bg-foreground text-background text-xs uppercase font-bold tracking-wider inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>Pasang Pengingat di Google Calendar</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                  </a>
                )}
              </div>

              {/* Right Output: 4-Point Cycle Timeline */}
              {timelineDates && (
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                  {/* Point 1 */}
                  <div className="p-4 border border-border-hairline bg-surface-muted/40 space-y-1 relative">
                    <span className="text-[9px] uppercase tracking-wider text-muted font-bold block">
                      HARI 0 // AMBIL
                    </span>
                    <div className="font-bold text-foreground text-sm">
                      {timelineDates.pickupFormatted}
                    </div>
                    <p className="text-[10px] text-muted font-sans pt-1">
                      Serah terima buku di lapak pilihanmu.
                    </p>
                  </div>

                  {/* Point 2 */}
                  <div className="p-4 border border-border-hairline bg-surface-muted/40 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-muted font-bold block">
                      HARI KE-5 // SAPAAN
                    </span>
                    <div className="font-bold text-foreground text-sm">
                      {timelineDates.reminderFormatted}
                    </div>
                    <p className="text-[10px] text-muted font-sans pt-1">
                      Relawan menyapa santai via WhatsApp: sudah tuntas atau butuh tambah waktu?
                    </p>
                  </div>

                  {/* Point 3 */}
                  <div className="p-4 border-2 border-foreground bg-background space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-foreground font-black block">
                      HARI KE-7 // TENGGAT
                    </span>
                    <div className="font-bold text-foreground text-sm underline">
                      {timelineDates.dueFormatted}
                    </div>
                    <p className="text-[10px] text-foreground/80 font-sans pt-1">
                      Batas pengembalian normal. Kembalikan ke lapak terdekat.
                    </p>
                  </div>

                  {/* Point 4 */}
                  <div className="p-4 border border-border-hairline bg-surface-muted/40 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-muted font-bold block">
                      HARI KE-14 // MAKSIMAL
                    </span>
                    <div className="font-bold text-foreground text-sm">
                      {timelineDates.extendedFormatted}
                    </div>
                    <p className="text-[10px] text-muted font-sans pt-1">
                      Batas akhir jika kamu memanfaatkan perpanjangan +7 hari.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </RevealOnScroll>
      </section>

        {/* ========================================================= */}
        {/* 4. SIMULATOR TIKET PINJAMAN DIGITAL (INTERAKTIF & KREATIF) */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <RevealOnScroll variant="cinematic" delayMs={50}>
            <div className="border-2 border-foreground bg-surface-muted/40 p-4 sm:p-8 lg:p-10 relative">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest px-2.5 py-1 border border-foreground bg-foreground text-background font-semibold">
                    <Sparkles className="w-3 h-3" />
                    <span>SIMULASI INTERAKTIF</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    Seperti Apa Bentuk Tiket Pengambilanmu Nanti?
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-muted max-w-xl mx-auto">
                    Begitu kamu menekan tombol pinjam di katalog, kartu tanda bukti seperti di bawah ini langsung terbit di akunmu.
                  </p>
                </div>

                {/* The Physical-Style Digital Borrow Card */}
                <div className="max-w-md mx-auto bg-surface border-4 border-double border-foreground p-4 sm:p-8 space-y-4 sm:space-y-5 relative font-mono">
                  {/* Vintage Ticket Header */}
                  <div className="flex items-start justify-between border-b-2 border-foreground pb-3 sm:pb-4">
                    <div>
                      <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-foreground">
                        PERPUSJAL BLORA
                      </div>
                      <div className="font-serif text-base sm:text-lg font-black text-foreground">
                        SLIP SIRKULASI BUKU
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] sm:text-[9px] uppercase px-1.5 sm:px-2 py-0.5 bg-foreground text-background font-bold">
                        RESERVED
                      </span>
                      <span className="block text-[8px] text-muted mt-1">NO. DOK #2026-X</span>
                    </div>
                  </div>

                  {/* Mocked Loan Content */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[9px] text-muted uppercase tracking-wider block">BUKU YANG DIPINJAM:</span>
                      <strong className="font-serif text-sm sm:text-base font-bold block text-foreground">
                        Catatan Pinggir Jilid 1
                      </strong>
                      <span className="text-[10px] text-muted">Penulis: Goenawan Mohamad</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-hairline text-[10px] sm:text-[11px]">
                      <div>
                        <span className="text-[9px] text-muted uppercase block">LOKASI AMBIL:</span>
                        <strong className="text-foreground">Lapak CFD Alun-Alun</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted uppercase block">MASA BACA:</span>
                        <strong className="text-foreground">7 Hari (+7 Hari Opsional)</strong>
                      </div>
                    </div>

                    {/* Big Code Box */}
                    <div className="p-3 bg-surface-muted border-2 border-foreground text-center space-y-1 my-3">
                      <span className="text-[9px] text-muted uppercase tracking-widest block font-bold">
                        KODE PENGAMBILAN RESMI
                      </span>
                      <div className="text-xl sm:text-3xl font-black tracking-widest text-foreground font-mono">
                        #{ticketSampleCode}
                      </div>
                      <span className="text-[8px] text-muted block">
                        Tunjukkan kode ini kepada relawan di atas terpal
                      </span>
                    </div>
                  </div>

                  {/* Action Strip */}
                  <div className="pt-3 border-t-2 border-dashed border-foreground/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 border border-foreground bg-background hover:bg-surface-muted transition-colors text-[10px] uppercase font-bold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-foreground" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                      <span>{copied ? 'Kode Tersalin!' : 'Salin Contoh'}</span>
                    </button>

                    <div className="text-[9px] text-muted uppercase tracking-wider text-right">
                      <span>STATUS: SIAP DIVERIFIKASI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ========================================================= */}
        {/* 5. TIGA TITIK LAPAK PERTEMUAN RESMI DI TANAH BLORA       */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <RevealOnScroll variant="cinematic" delayMs={50}>
            <div className="border-b-2 border-foreground pb-4 mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-foreground shrink-0" />
                  <span>POSKO KOLEKTIF</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1">
                  Peta Titik &amp; Jadwal Lapak Terpal
                </h2>
              </div>
              <p className="font-mono text-xs text-muted max-w-sm">
                Kami tidak menyewa ruko megah. Kami hadir di tempat warga berkumpul dan beraktivitas sehari-hari.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lokasi 1: Alun-Alun CFD */}
            <RevealOnScroll variant="cinematic" delayMs={50}>
              <div className="border-2 border-foreground bg-surface p-5 sm:p-6 flex flex-col justify-between relative group h-full">
                <div className="absolute top-3 right-3 font-mono text-[9px] bg-foreground text-background px-2 py-0.5 font-bold uppercase">
                  TERPOPULER
                </div>
                <div className="space-y-4">
                  <div className="w-10 h-10 border-2 border-foreground bg-foreground text-background flex items-center justify-center font-mono text-sm font-black">
                    01
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                      Lapak CFD Alun-Alun Blora
                    </h3>
                    <p className="font-mono text-xs text-foreground font-semibold mt-1">
                      Sisi Timur Alun-Alun (Depan Gerbang Pendopo)
                    </p>
                  </div>
                  <div className="p-3 bg-surface-muted border border-border-hairline font-mono text-xs space-y-1">
                    <div className="text-[10px] text-muted uppercase font-bold">WAKTU BUKA:</div>
                    <div className="font-bold text-foreground">Setiap Hari Minggu Pagi</div>
                    <div className="text-[11px] text-muted">Pukul 06.00 – 09.30 WIB</div>
                  </div>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Titik lapak paling ramai. Sambil jalan pagi, senam, atau bersepeda, warga bisa mampir menggelar buku bersama keluarga dan anak-anak.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border-hairline font-mono text-[10px] flex items-center justify-between">
                  <span className="text-muted uppercase">SUASANA: RAMAI</span>
                  <a
                    href="https://maps.google.com/?q=Alun-Alun+Blora"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-foreground hover:underline inline-flex items-center gap-1"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </RevealOnScroll>

            {/* Lokasi 2: Taman Tirtonadi */}
            <RevealOnScroll variant="cinematic" delayMs={100}>
              <div className="border-2 border-foreground bg-surface p-5 sm:p-6 flex flex-col justify-between relative group h-full">
                <div className="space-y-4">
                  <div className="w-10 h-10 border-2 border-foreground bg-surface-muted text-foreground flex items-center justify-center font-mono text-sm font-black">
                    02
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                      Lapak Senja Taman Tirtonadi
                    </h3>
                    <p className="font-mono text-xs text-muted mt-1">
                      Bawah Rindang Pohon Kawasan Tirtonadi Blora
                    </p>
                  </div>
                  <div className="p-3 bg-surface-muted border border-border-hairline font-mono text-xs space-y-1">
                    <div className="text-[10px] text-muted uppercase font-bold">WAKTU BUKA:</div>
                    <div className="font-bold text-foreground">Setiap Hari Sabtu Sore</div>
                    <div className="text-[11px] text-muted">Pukul 15.30 – 17.45 WIB</div>
                  </div>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Cocok untuk yang menyukai ketenangan. Lapak terpal digelar saat hawa mulai sejuk, pas untuk membaca sambil menunggu waktu magrib tiba.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border-hairline font-mono text-[10px] flex items-center justify-between">
                  <span className="text-muted uppercase">SUASANA: ADEM</span>
                  <a
                    href="https://maps.google.com/?q=Taman+Tirtonadi+Blora"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-foreground hover:underline inline-flex items-center gap-1"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </RevealOnScroll>

            {/* Lokasi 3: Basecamp Jl. Pemuda */}
            <RevealOnScroll variant="cinematic" delayMs={150}>
              <div className="border-2 border-foreground bg-surface p-5 sm:p-6 flex flex-col justify-between relative group h-full">
                <div className="space-y-4">
                  <div className="w-10 h-10 border-2 border-foreground bg-surface-muted text-foreground flex items-center justify-center font-mono text-sm font-black">
                    03
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                      Basecamp Perpusjal Kota
                    </h3>
                    <p className="font-mono text-xs text-muted mt-1">
                      Jl. Pemuda No. 12, Blora
                    </p>
                  </div>
                  <div className="p-3 bg-surface-muted border border-border-hairline font-mono text-xs space-y-1">
                    <div className="text-[10px] text-muted uppercase font-bold">WAKTU BUKA:</div>
                    <div className="font-bold text-foreground">Senin – Jumat (Hari Kerja)</div>
                    <div className="text-[11px] text-muted">09.00 – 16.30 WIB (Konfirmasi WA)</div>
                  </div>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Pusat gudang arsip dan sirkulasi mingguan. Pilihan fleksibel bagi pekerja atau pelajar yang tidak sempat mampir saat akhir pekan.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border-hairline font-mono text-[10px] flex items-center justify-between">
                  <span className="text-muted uppercase">DROP BOX: ADA</span>
                  <a
                    href="https://maps.google.com/?q=Jl.+Pemuda+Blora"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-foreground hover:underline inline-flex items-center gap-1"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. GENTLEMEN'S AGREEMENT: KONTRAK KEHORMATAN KITA        */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <RevealOnScroll variant="stamp">
            <div className="border-2 border-foreground bg-surface p-5 sm:p-8 lg:p-10 font-mono text-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-foreground pb-4 mb-6 gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted block">
                    KESEPAKATAN MORAL &amp; ETIKA
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-black text-foreground">
                    Pakta Kejujuran Peminjam Buku
                  </h3>
                </div>
                <div className="text-[10px] bg-surface-muted border border-foreground px-2.5 py-1 uppercase tracking-wider font-bold self-start md:self-auto">
                  BERLAKU UNTUK SEMUA WARGA
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-4 border border-border-hairline bg-surface-muted/30 space-y-2">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    [ 01 // FISIK BUKU ]
                  </div>
                  <div className="font-serif font-bold text-base text-foreground">
                    Jaga Seperti Milik Sendiri
                  </div>
                  <p className="text-[11px] text-muted font-sans leading-relaxed">
                    Gunakan pembatas kertas. Jangan melipat sudut halaman (dog-ear), dan jauhkan buku dari cangkir kopi atau tetesan hujan.
                  </p>
                </div>

                <div className="p-4 border border-border-hairline bg-surface-muted/30 space-y-2">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    [ 02 // TEPAT WAKTU ]
                  </div>
                  <div className="font-serif font-bold text-base text-foreground">
                    Gilirkan Kepada Kawan Lain
                  </div>
                  <p className="text-[11px] text-muted font-sans leading-relaxed">
                    Buku yang terlalu lama disimpan di kamar tidak bisa dibaca warga lain. Batas 7 hari adalah ritme sehat perputaran pengetahuan warga.
                  </p>
                </div>

                <div className="p-4 border border-border-hairline bg-surface-muted/30 space-y-2">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    [ 03 // KUOTA WAJAR ]
                  </div>
                  <div className="font-serif font-bold text-base text-foreground">
                    Maksimal 2 Buku
                  </div>
                  <p className="text-[11px] text-muted font-sans leading-relaxed">
                    Demi pemerataan, setiap peminjam dibatasi membawa 2 buku sekaligus. Selesaikan dulu bacaanmu sebelum meminjam judul berikutnya.
                  </p>
                </div>

                <div className="p-4 border border-border-hairline bg-surface-muted/30 space-y-2">
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    [ 04 // KOMUNIKASI ]
                  </div>
                  <div className="font-serif font-bold text-base text-foreground">
                    Jangan Ragu Menyapa
                  </div>
                  <p className="text-[11px] text-muted font-sans leading-relaxed">
                    Jika sedang sakit atau ada halangan mendesak, cukup kirim pesan singkat WhatsApp kepada relawan. Kamu tidak akan pernah dihakimi.
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ========================================================= */}
        {/* 7. TANYA JAWAB PRAKTIS & AKORDEON (FAQ INTERAKTIF)        */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
          <RevealOnScroll variant="cinematic" delayMs={50}>
            <div className="border-b-2 border-foreground pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-foreground shrink-0" />
                  <span>TANYA JAWAB LAPAK</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mt-1">
                  Kerap Ditanyakan oleh Pembaca Pemula
                </h2>
              </div>
              <p className="font-mono text-xs text-muted">
                Klik pertanyaan untuk membuka rincian jawaban.
              </p>
            </div>
          </RevealOnScroll>

          <div className="space-y-3 max-w-4xl">
            {FAQ_LIST.map((faq, idx) => {
              const isOpen = openFaq === faq.id;
              return (
                <RevealOnScroll key={faq.id} variant="cinematic" delayMs={idx * 40}>
                  <div className="border-2 border-foreground bg-surface overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 sm:p-5 text-left font-mono flex items-center justify-between gap-4 hover:bg-surface-muted/40 transition-colors focus:outline-none"
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

          {/* Quick Volunteer Help Strip */}
          <RevealOnScroll variant="stamp" delayMs={100}>
            <div className="mt-8 p-5 sm:p-6 border-2 border-foreground bg-surface-muted/60 max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-mono text-[10px] uppercase font-bold text-muted flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-foreground" />
                  <span>BANTUAN KOORDINATOR LAPAK</span>
                </div>
                <div className="font-serif text-lg font-bold text-foreground">
                  Punya pertanyaan khusus atau ingin menitipkan buku?
                </div>
                <p className="font-sans text-xs text-muted">
                  Relawan kami siap menjawab pesanmu dengan senang hati tanpa formalitas rumit.
                </p>
              </div>

              <a
                href={getWhatsAppUrl('Halo Relawan Perpusjal Blora, saya membaca panduan cara meminjam dan ingin bertanya...')}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-wider font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0 w-full sm:w-auto justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Sapa Relawan via WhatsApp</span>
              </a>
            </div>
          </RevealOnScroll>
        </section>

        {/* ========================================================= */}
        {/* 8. BROADSHEET CALL TO ACTION                              */}
        {/* ========================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <RevealOnScroll variant="stamp">
            <div className="border-4 border-foreground bg-foreground text-background p-6 sm:p-12 lg:p-14 text-center space-y-5 sm:space-y-6 relative overflow-hidden">
              {/* Subtle retro background watermark */}
              <div className="absolute right-2 -bottom-8 opacity-10 select-none pointer-events-none font-serif text-[90px] sm:text-[140px] font-black uppercase tracking-tighter">
                BACA
              </div>

              <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4 relative z-10">
                <div className="inline-block border border-background/40 px-3 py-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest">
                  LANGKAH PERTAMA // JELAJAHI BUKU
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight">
                  Koleksi Buku Menunggumu di Atas Terpal.
                </h2>

                <p className="font-serif italic text-sm sm:text-base lg:text-lg text-background/80 leading-relaxed">
                  Dari novel sastra, filsafat, sejarah Blora, hingga komik anak-anak. Semua gratis, milik bersama seluruh warga.
                </p>

                <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 font-mono text-xs">
                  <Link
                    href="/buku"
                    className="min-h-[44px] px-6 py-3 bg-background text-foreground uppercase tracking-wider font-bold inline-flex items-center justify-center gap-2 hover:bg-surface-muted transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>BUKA KATALOG BUKU SEKARANG</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/dashboard/pinjaman"
                    className="min-h-[44px] px-6 py-3 border border-background text-background uppercase tracking-wider font-semibold hover:bg-background/10 transition-colors inline-flex items-center justify-center"
                  >
                    <span>CEK STATUS PINJAMAN SAYA</span>
                  </Link>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>
      </main>

      <div className="print:hidden">
        <RevealOnScroll variant="fade" delayMs={60}>
          <Footer />
        </RevealOnScroll>
      </div>
    </div>
  );
}
