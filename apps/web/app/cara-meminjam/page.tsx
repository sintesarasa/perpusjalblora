import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import {
  BookOpen,
  Search,
  MapPin,
  Ticket,
  Clock,
  HeartHandshake,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Coffee,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Panduan Cara Meminjam Buku — Perpustakaan Jalanan Blora',
  description:
    'Langkah mudah meminjam buku gratis di Perpustakaan Jalanan Blora. Tanpa biaya, tanpa jaminan uang, dan tanpa birokrasi rumit.',
};

export default function CaraMeminjamPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground/15 flex flex-col justify-between">
      <Header />

      <main className="flex-1">
        {/* ── 1. Hero Header Banner ── */}
        <section className="border-b border-border bg-surface-muted/30 pt-14 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-8 relative overflow-hidden">
          <div className="max-w-5xl mx-auto space-y-5 text-center relative z-10">
            {/* Kicker Pill */}
            <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest px-3 py-1 border border-border bg-background text-foreground font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PANDUAN LITERASI WARGA // 100% GRATIS TANPA BIAYA</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-foreground leading-[1.15]">
              Cara Mudah Meminjam Buku
            </h1>

            {/* Subtitle */}
            <p className="font-serif italic text-base sm:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Membaca buku bagus tidak harus mahal dan tidak perlu ribet. Ikuti 5 langkah sederhana berikut untuk membaca koleksi Perpustakaan Jalanan Blora.
            </p>

            {/* Quick Guarantees Strip */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-muted uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-foreground font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Tanpa Biaya Pendaftaran
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-foreground font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Tanpa Jaminan Uang
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-foreground font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Tanpa Denda Keterlambatan
              </span>
            </div>
          </div>
        </section>

        {/* ── 2. Langkah-Langkah Meminjam (Dengan Ilustrasi Visual Kreatif) ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20 space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Alur Peminjaman Buku
            </h2>
            <p className="font-sans text-xs sm:text-sm text-muted">
              Bisa diajukan langsung melalui website ini, atau langsung datang ke lapak terpal mingguan kami.
            </p>
          </div>

          <div className="space-y-12">
            {/* ── Langkah 1 ── */}
            <div className="border border-border bg-surface p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center hover:border-foreground transition-colors group">
              {/* Kolom Kiri: Ilustrasi Vektor SVG */}
              <div className="md:col-span-5 flex items-center justify-center bg-surface-muted/60 p-6 border border-border-hairline aspect-4/3 relative overflow-hidden">
                <svg
                  viewBox="0 0 240 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full max-h-48 text-foreground"
                >
                  {/* Rak / Meja Buku */}
                  <rect x="20" y="145" width="200" height="6" fill="currentColor" opacity="0.2" />
                  <rect x="30" y="70" width="26" height="75" rx="2" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.08" />
                  <line x1="38" y1="85" x2="48" y2="85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="38" y1="95" x2="48" y2="95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

                  <rect x="62" y="55" width="30" height="90" rx="2" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.15" />
                  <line x1="72" y1="75" x2="82" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="72" y1="85" x2="82" y2="85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

                  {/* Buku Terpilih Terbuka */}
                  <path
                    d="M102 95C118 88 135 90 148 95V145C135 140 118 138 102 145V95Z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="currentColor"
                    fillOpacity="0.05"
                  />
                  <path
                    d="M148 95C161 90 178 88 194 95V145C178 138 161 140 148 145V95Z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="currentColor"
                    fillOpacity="0.05"
                  />
                  <line x1="148" y1="95" x2="148" y2="145" stroke="currentColor" strokeWidth="2.5" />

                  {/* Kaca Pembesar (Search) */}
                  <circle cx="155" cy="58" r="26" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.05" />
                  <line x1="174" y1="77" x2="198" y2="101" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  {/* Kilau Kaca */}
                  <path d="M145 42C152 40 162 44 167 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <div className="absolute top-3 left-3 font-mono text-[10px] font-bold px-2 py-0.5 bg-foreground text-background">
                  LANGKAH 01
                </div>
              </div>

              {/* Kolom Kanan: Panduan Deskripsi */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-wider">
                  <Search className="w-3.5 h-3.5 text-foreground" />
                  <span>Cari &amp; Pilih</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Jelajahi Katalog Buku
                </h3>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Buka halaman <strong>Katalog Buku</strong> di website ini. Kamu bisa mencari buku berdasarkan judul,
                  nama penulis, atau memilih rubrik seperti Sastra, Sejarah, Pemikiran, Buku Anak, Novel, hingga Zine independen.
                </p>
                <div className="p-3 bg-surface-muted border-l-2 border-foreground font-sans text-xs text-foreground/90 space-y-1">
                  <p className="font-semibold text-[11px] font-mono uppercase text-muted">Tips Cepat:</p>
                  <p>
                    Perhatikan label <strong>[TERSEDIA]</strong> pada buku. Jika buku sedang dipinjam orang lain, kamu bisa
                    memilih opsi <strong>&ldquo;Gabung Antrean / Waitlist&rdquo;</strong> untuk diprioritaskan saat buku kembali.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Langkah 2 ── */}
            <div className="border border-border bg-surface p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center hover:border-foreground transition-colors group">
              {/* Kolom Kiri: Ilustrasi Vektor SVG */}
              <div className="md:col-span-5 flex items-center justify-center bg-surface-muted/60 p-6 border border-border-hairline aspect-4/3 relative overflow-hidden">
                <svg
                  viewBox="0 0 240 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full max-h-48 text-foreground"
                >
                  {/* Smartphone / Layar Formulir */}
                  <rect x="40" y="25" width="80" height="135" rx="8" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.05" />
                  <line x1="68" y1="36" x2="92" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <rect x="48" y="50" width="64" height="12" rx="2" fill="currentColor" fillOpacity="0.15" />
                  <rect x="48" y="68" width="64" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  {/* Tombol Ajukan */}
                  <rect x="48" y="100" width="64" height="16" rx="2" fill="currentColor" />
                  <text x="80" y="112" fill="white" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">AJUKAN</text>

                  {/* Garis Panah Koneksi */}
                  <path d="M125 80C140 80 145 70 155 70" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />

                  {/* Pin Lokasi Peta (Map Marker) */}
                  <path
                    d="M175 35C161.2 35 150 46.2 150 60C150 78.5 175 105 175 105C175 105 200 78.5 200 60C200 46.2 188.8 35 175 35Z"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="currentColor"
                    fillOpacity="0.15"
                  />
                  <circle cx="175" cy="58" r="8" fill="currentColor" />

                  {/* Bayangan Pin di Tanah */}
                  <ellipse cx="175" cy="118" rx="20" ry="5" fill="currentColor" fillOpacity="0.15" />
                  <text x="175" y="140" fill="currentColor" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">Alun-Alun / Basecamp</text>
                </svg>
                <div className="absolute top-3 left-3 font-mono text-[10px] font-bold px-2 py-0.5 bg-foreground text-background">
                  LANGKAH 02
                </div>
              </div>

              {/* Kolom Kanan: Panduan Deskripsi */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-foreground" />
                  <span>Pilih Lokasi Pengambilan</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Klik &ldquo;Ajukan Pinjam&rdquo; &amp; Tentukan Lokasi Ambil
                </h3>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Pada halaman buku, klik tombol hitam <strong>AJUKAN PINJAM BUKU</strong>. Kamu tinggal memilih titik pengambilan
                  yang paling dekat dengan aktivitasmu:
                </p>
                <ul className="font-sans text-xs text-foreground/90 space-y-2 pt-1">
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-muted font-bold">[1]</span>
                    <span><strong>Basecamp Perpusjal</strong> (Jl. Pemuda No. 12, Blora — setiap hari kerja).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-muted font-bold">[2]</span>
                    <span><strong>Lapak CFD Alun-Alun Blora</strong> (Minggu pagi, pukul 06.00 – 09.30 WIB).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-muted font-bold">[3]</span>
                    <span><strong>Lapak Sore Taman Tirtonadi</strong> (Sabtu sore, pukul 15.30 – 18.00 WIB).</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* ── Langkah 3 ── */}
            <div className="border border-border bg-surface p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center hover:border-foreground transition-colors group">
              {/* Kolom Kiri: Ilustrasi Vektor SVG */}
              <div className="md:col-span-5 flex items-center justify-center bg-surface-muted/60 p-6 border border-border-hairline aspect-4/3 relative overflow-hidden">
                <svg
                  viewBox="0 0 240 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full max-h-48 text-foreground"
                >
                  {/* Tiket Pinjaman Digital */}
                  <rect x="45" y="30" width="150" height="110" rx="4" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.05" />
                  {/* Lekukan Tiket Kiri & Kanan */}
                  <circle cx="45" cy="85" r="8" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="2" />
                  <circle cx="195" cy="85" r="8" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="2" />
                  <line x1="55" y1="85" x2="185" y2="85" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Header Tiket */}
                  <text x="120" y="52" fill="currentColor" fontSize="8" fontFamily="monospace" textAnchor="middle" letterSpacing="2">TIKET PINJAMAN PERPUSJAL</text>
                  <text x="120" y="68" fill="currentColor" fontSize="10" fontFamily="serif" textAnchor="middle" fontWeight="bold">KODE PENGAMBILAN</text>

                  {/* Kode Angka 6 Digit */}
                  <rect x="65" y="98" width="110" height="28" rx="2" fill="currentColor" />
                  <text x="120" y="117" fill="white" fontSize="16" fontFamily="monospace" textAnchor="middle" fontWeight="bold" letterSpacing="4">#849201</text>

                  {/* Icon WhatsApp Kecil */}
                  <circle cx="178" cy="46" r="6" fill="#10B981" />
                  <path d="M176 46L177.5 47.5L180.5 44.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="absolute top-3 left-3 font-mono text-[10px] font-bold px-2 py-0.5 bg-foreground text-background">
                  LANGKAH 03
                </div>
              </div>

              {/* Kolom Kanan: Panduan Deskripsi */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-wider">
                  <Ticket className="w-3.5 h-3.5 text-foreground" />
                  <span>Dapatkan Kode Transaksi</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Simpan Kode Pengambilan (6 Digit)
                </h3>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Setelah pengajuan dikirim, kamu akan langsung mendapatkan <strong>Kode Pengambilan 6 Digit</strong> (contoh: <code>#849201</code>).
                  Kode ini juga tercatat otomatis di halaman <Link href="/dashboard/pinjaman" className="text-foreground underline font-medium">Dasbor Pinjaman</Link> akunmu.
                </p>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Relawan kami akan menyiapkan buku dan mengirimkan konfirmasi sapaan hangat melalui WhatsApp untuk memastikan waktu pengambilan yang nyaman.
                </p>
              </div>
            </div>

            {/* ── Langkah 4 ── */}
            <div className="border border-border bg-surface p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center hover:border-foreground transition-colors group">
              {/* Kolom Kiri: Ilustrasi Vektor SVG */}
              <div className="md:col-span-5 flex items-center justify-center bg-surface-muted/60 p-6 border border-border-hairline aspect-4/3 relative overflow-hidden">
                <svg
                  viewBox="0 0 240 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full max-h-48 text-foreground"
                >
                  {/* Terpal Terbuka */}
                  <polygon points="30,150 210,150 185,120 55,120" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
                  <line x1="55" y1="120" x2="30" y2="150" stroke="currentColor" strokeWidth="2" />
                  <line x1="185" y1="120" x2="210" y2="150" stroke="currentColor" strokeWidth="2" />

                  {/* Buku-buku di Terpal */}
                  <rect x="70" y="130" width="22" height="14" rx="1" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="98" y="132" width="22" height="12" rx="1" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="145" y="128" width="24" height="15" rx="1" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />

                  {/* Dua Tangan Berjabatan / Serah Terima Buku */}
                  {/* Tangan Kiri (Relawan) */}
                  <path d="M40 75C60 75 75 80 90 85L110 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  {/* Tangan Kanan (Peminjam) */}
                  <path d="M200 75C180 75 165 80 150 85L130 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  {/* Buku di Tengah Serah Terima */}
                  <rect x="105" y="60" width="30" height="42" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="2" />
                  <line x1="112" y1="72" x2="128" y2="72" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="112" y1="80" x2="124" y2="80" stroke="white" strokeWidth="2" strokeLinecap="round" />

                  {/* Senyum Kehangatan / Bintang Persahabatan */}
                  <path d="M120 35L122 40L127 42L122 44L120 49L118 44L113 42L118 40L120 35Z" fill="currentColor" />
                </svg>
                <div className="absolute top-3 left-3 font-mono text-[10px] font-bold px-2 py-0.5 bg-foreground text-background">
                  LANGKAH 04
                </div>
              </div>

              {/* Kolom Kanan: Panduan Deskripsi */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-wider">
                  <HeartHandshake className="w-3.5 h-3.5 text-foreground" />
                  <span>Serah Terima di Lapak</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Temui Relawan di Lapak Terpal &amp; Ambil Bukumu
                </h3>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Datanglah ke titik lapak yang sudah kamu pilih. Cukup sebutkan <strong>Kode Pengambilan</strong> atau namamu kepada relawan yang berjaga di atas terpal.
                </p>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Buku langsung diserahkan tanpa syarat berbelit. Kamu juga bisa duduk santai di terpal kami sambil menikmati suasana kota,
                  membaca buku lainnya, atau sekadar bercengkerama bersama pembaca lain.
                </p>
              </div>
            </div>

            {/* ── Langkah 5 ── */}
            <div className="border border-border bg-surface p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center hover:border-foreground transition-colors group">
              {/* Kolom Kiri: Ilustrasi Vektor SVG */}
              <div className="md:col-span-5 flex items-center justify-center bg-surface-muted/60 p-6 border border-border-hairline aspect-4/3 relative overflow-hidden">
                <svg
                  viewBox="0 0 240 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full max-h-48 text-foreground"
                >
                  {/* Kalender 7 Hari */}
                  <rect x="40" y="35" width="85" height="95" rx="4" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.05" />
                  <rect x="40" y="35" width="85" height="24" rx="4" fill="currentColor" />
                  <text x="82" y="51" fill="white" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">MASA PINJAM</text>
                  <text x="82" y="98" fill="currentColor" fontSize="32" fontFamily="serif" textAnchor="middle" fontWeight="bold">7</text>
                  <text x="82" y="116" fill="currentColor" fontSize="10" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">HARI</text>

                  {/* Cangkir Kopi Santai */}
                  <path d="M150 90H185V125C185 133 178 140 170 140H165C157 140 150 133 150 125V90Z" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.08" />
                  {/* Gagang Cangkir */}
                  <path d="M185 98C193 98 198 103 198 111C198 119 193 124 185 124" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Tatakan */}
                  <line x1="142" y1="145" x2="193" y2="145" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Asap Hangat */}
                  <path d="M160 78C162 72 158 68 160 62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M172 78C174 72 170 68 172 62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

                  {/* Badge Nol Denda */}
                  <circle cx="195" cy="50" r="18" fill="currentColor" />
                  <text x="195" y="47" fill="white" fontSize="7" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">BEBAS</text>
                  <text x="195" y="57" fill="white" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">DENDA</text>
                </svg>
                <div className="absolute top-3 left-3 font-mono text-[10px] font-bold px-2 py-0.5 bg-foreground text-background">
                  LANGKAH 05
                </div>
              </div>

              {/* Kolom Kanan: Panduan Deskripsi */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-foreground" />
                  <span>Masa Baca &amp; Pengembalian</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Baca Santai 7 Hari &amp; Kembalikan dengan Senyuman
                </h3>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Buku berlaku selama <strong>7 hari</strong>. Kamu bebas membacanya di rumah sambil ngopi santai.
                  Jika belum selesai, kamu bisa mengajukan perpanjangan waktu <strong>+7 hari</strong> via dasbor atau konfirmasi ke relawan via WhatsApp.
                </p>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Saat selesai, kembalikan ke lapak terdekat. <strong>Tidak ada denda uang sepeser pun.</strong> Kami percaya sepenuhnya pada kejujuran dan rasa tanggung jawab warga Blora.
                </p>
              </div>
            </div>
          </div>

          {/* ── 3. Titik Lokasi Lapak Pengambilan ── */}
          <div className="space-y-6 pt-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
                <MapPin className="w-3.5 h-3.5 text-foreground" />
                <span>TITIK PENGAMBILAN BUKU</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Di Mana Saja Kamu Bisa Bertemu Kami?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lokasi 1 */}
              <div className="p-6 border border-border bg-surface space-y-3">
                <div className="w-8 h-8 border border-border bg-surface-muted flex items-center justify-center font-mono text-xs font-bold text-foreground">
                  A
                </div>
                <h4 className="font-serif text-lg font-bold text-foreground">
                  Basecamp Perpusjal
                </h4>
                <p className="font-mono text-xs text-muted">
                  Jl. Pemuda No. 12, Kota Blora
                </p>
                <p className="font-sans text-xs text-muted leading-relaxed pt-2 border-t border-border-hairline">
                  Buka setiap hari kerja (Senin &ndash; Jumat, 09.00 &ndash; 16.30 WIB). Cocok untuk kamu yang ingin ambil atau kembalikan buku di jam fleksibel.
                </p>
              </div>

              {/* Lokasi 2 */}
              <div className="p-6 border-2 border-foreground bg-background space-y-3 shadow-xs">
                <div className="w-8 h-8 border border-foreground bg-foreground text-background flex items-center justify-center font-mono text-xs font-bold">
                  B
                </div>
                <h4 className="font-serif text-lg font-bold text-foreground">
                  Lapak CFD Alun-Alun
                </h4>
                <p className="font-mono text-xs text-foreground font-semibold">
                  Alun-Alun Blora (Sisi Timur / Depan Pendopo)
                </p>
                <p className="font-sans text-xs text-foreground/85 leading-relaxed pt-2 border-t border-border-hairline">
                  Digelar setiap hari Minggu pagi (06.00 &ndash; 09.30 WIB). Ramai warga yang berolahraga, anak-anak menggambar, dan lesehan santai.
                </p>
              </div>

              {/* Lokasi 3 */}
              <div className="p-6 border border-border bg-surface space-y-3">
                <div className="w-8 h-8 border border-border bg-surface-muted flex items-center justify-center font-mono text-xs font-bold text-foreground">
                  C
                </div>
                <h4 className="font-serif text-lg font-bold text-foreground">
                  Lapak Sore Tirtonadi
                </h4>
                <p className="font-mono text-xs text-muted">
                  Kawasan Rekreasi Taman Tirtonadi Blora
                </p>
                <p className="font-sans text-xs text-muted leading-relaxed pt-2 border-t border-border-hairline">
                  Digelar setiap Sabtu sore (15.30 &ndash; 18.00 WIB). Suasana teduh di bawah rindang pohon, asyik untuk membaca sambil menunggu senja.
                </p>
              </div>
            </div>
          </div>

          {/* ── 4. Aturan Sederhana (Kebaikan Bersama) ── */}
          <div className="p-6 sm:p-8 border border-border bg-surface-muted/30 space-y-4">
            <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-foreground" />
              <span>Etika Meminjam: Titipan Kasih Sayang Antarwarga</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-background border border-border-hairline space-y-1">
                <p className="font-mono text-xs font-bold uppercase text-foreground">1. Sayangi Buku</p>
                <p className="font-sans text-xs text-muted leading-relaxed">
                  Jauhkan dari air dan tumpahan makanan. Gunakan pembatas buku, hindari melipat ujung halaman.
                </p>
              </div>

              <div className="p-4 bg-background border border-border-hairline space-y-1">
                <p className="font-mono text-xs font-bold uppercase text-foreground">2. Tepat Waktu</p>
                <p className="font-sans text-xs text-muted leading-relaxed">
                  Kembalikan buku dalam 7 hari agar teman-teman pembaca lain bisa bergiliran menikmati buku tersebut.
                </p>
              </div>

              <div className="p-4 bg-background border border-border-hairline space-y-1">
                <p className="font-mono text-xs font-bold uppercase text-foreground">3. Maksimal 2 Buku</p>
                <p className="font-sans text-xs text-muted leading-relaxed">
                  Setiap peminjam diperbolehkan meminjam hingga 2 judul buku sekaligus demi pemerataan koleksi.
                </p>
              </div>

              <div className="p-4 bg-background border border-border-hairline space-y-1">
                <p className="font-mono text-xs font-bold uppercase text-foreground">4. Kabari Relawan</p>
                <p className="font-sans text-xs text-muted leading-relaxed">
                  Jika ada kendala belum sempat mengembalikan, cukup balas chat WhatsApp relawan. Tidak akan dimarahi!
                </p>
              </div>
            </div>
          </div>

          {/* ── 5. FAQ (Tanya Jawab Singkat) ── */}
          <div className="space-y-6 pt-4">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
                <HelpCircle className="w-3.5 h-3.5 text-foreground" />
                <span>TANYA JAWAB</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>

            <div className="space-y-3 max-w-3xl mx-auto">
              <div className="p-4 sm:p-5 border border-border bg-surface space-y-2">
                <h4 className="font-serif text-base sm:text-lg font-bold text-foreground">
                  Apakah saya wajib memiliki KTP atau kartu anggota?
                </h4>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Tidak wajib! Kamu tidak perlu fotokopi KTP ataupun membayar biaya kartu anggota. Cukup daftarkan akun di website ini atau berikan nomor WhatsApp aktif agar relawan bisa saling menyapa dan berkoordinasi.
                </p>
              </div>

              <div className="p-4 sm:p-5 border border-border bg-surface space-y-2">
                <h4 className="font-serif text-base sm:text-lg font-bold text-foreground">
                  Bagaimana jika buku yang ingin saya baca sedang dipinjam orang lain?
                </h4>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Kamu bisa mengklik tombol <strong>&ldquo;Gabung Antrean (Waitlist)&rdquo;</strong> pada halaman detail buku tersebut. Begitu peminjam sebelumnya mengembalikan buku, sistem kami akan langsung mengirimkan kabar prioritas untukmu.
                </p>
              </div>

              <div className="p-4 sm:p-5 border border-border bg-surface space-y-2">
                <h4 className="font-serif text-base sm:text-lg font-bold text-foreground">
                  Bagaimana jika saya terlambat mengembalikan buku?
                </h4>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Di Perpustakaan Jalanan Blora, <strong>tidak ada denda uang sepeser pun</strong>. Cukup komunikasikan dengan relawan kami via WhatsApp, lalu kembalikan saat lapak berikutnya dibuka. Kejujuran dan kepedulianmu adalah jaminan terbaik bagi kami.
                </p>
              </div>

              <div className="p-4 sm:p-5 border border-border bg-surface space-y-2">
                <h4 className="font-serif text-base sm:text-lg font-bold text-foreground">
                  Apakah saya boleh langsung meminjam di tempat tanpa lewat website?
                </h4>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Tentu saja sangat boleh! Silakan langsung mampir ke lapak terpal kami di Alun-Alun saat Car Free Day atau taman kota. Relawan kami akan dengan senang hati membantu mencatatkan peminjamanmu di meja lapak.
                </p>
              </div>
            </div>
          </div>

          {/* ── 6. Call to Action Box ── */}
          <div className="p-8 sm:p-12 border-2 border-foreground bg-surface text-center space-y-6">
            <div className="w-12 h-12 border border-foreground bg-foreground text-background flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Siap Menemukan Bacaan Pertamamu?
              </h3>
              <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                Ratusan judul buku sastra, sejarah, sains, novel, dan buku cerita anak sedang menunggumu di rak katalog kami.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/buku"
                className="h-10 px-6 bg-foreground text-background font-mono text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:opacity-90 transition-opacity font-semibold"
              >
                <span>Jelajahi Katalog Buku</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/pinjaman"
                className="h-10 px-5 border border-foreground bg-background text-foreground font-mono text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:bg-surface-muted transition-colors font-semibold"
              >
                <span>Pantau Dasbor Pinjaman</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
