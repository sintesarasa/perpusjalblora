import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/ui/status-pill';
import { BrandStamp } from '@/components/ui/brand-stamp';
import { ArrowRight, BookOpen, Feather, ArrowUpRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* 1. FRONT-PAGE HERO / LEAD EDITORIAL                       */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between border-b border-border-hairline pb-3 mb-8 text-[11px] font-mono uppercase tracking-widest text-muted">
            <div className="flex items-center gap-3">
              <BrandStamp edition="VOL. III" year="2026" />
              <span className="hidden sm:inline">[ MANIFESTO UTAMA // 01 ]</span>
            </div>
            <div>BLORA, JAWA TENGAH</div>
            <div className="hidden sm:block">RUANG BACA RAKYAT</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Left Big Lead (8 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <h2 className="display-headline font-serif font-black uppercase text-foreground mb-6">
                  MEMBACA DAN <br />
                  <span className="italic font-normal">BERBAHAGIA.</span>
                </h2>

                <p className="drop-cap font-serif text-lg sm:text-xl text-foreground/90 leading-relaxed max-w-2xl mb-8">
                  Kami mengembalikan buku ke tempat ia seharusnya bermula: di tengah kerumunan warga, di
                  bawah teduh pohon trembesi alun-alun, dan di ruang-ruang terbuka tempat percakapan
                  merdeka dirawat. Tanpa denda uang, tanpa syarat birokrasi, dan tanpa sekat kelas sosial.
                </p>
              </div>

              <div className="pt-6 border-t border-border-hairline flex flex-wrap gap-4 items-center">
                <Link href="/buku">
                  <Button size="lg" variant="solid">
                    TELUSURI KATALOG KOLEKSI
                  </Button>
                </Link>
                <Link href="/artikel">
                  <Button size="lg" variant="outline">
                    BACA ARSIP TULISAN WARGA
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side Editorial Callout (4 cols) */}
            <div className="lg:col-span-4 border-t-2 lg:border-t-0 lg:border-l-2 border-foreground pt-8 lg:pt-0 lg:pl-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-[10px] font-mono uppercase tracking-ultra text-muted">
                  [ CATATAN PINGGIR ]
                </div>
                <blockquote className="font-serif italic text-xl sm:text-2xl text-foreground leading-snug">
                  "Buku tidak bernilai jika hanya berdebu di lemari kaca. Ia hidup saat disentuh jemari
                  dan diperdebatkan di lapak trotoar."
                </blockquote>
                <cite className="block font-mono text-[11px] uppercase tracking-wider text-muted not-italic">
                  — Dewan Kolektif Perpusjal
                </cite>
              </div>

              {/* Street Ledger Mini Box */}
              <div className="border border-foreground p-5 bg-surface font-mono">
                <div className="text-[10px] uppercase tracking-widest text-muted pb-1 mb-2 border-b border-border-hairline">
                  SESI BERIKUTNYA
                </div>
                <div className="text-xs font-bold text-foreground">MINGGU PAGI — CFD BLORA</div>
                <div className="text-[11px] text-muted">Pukul 06.00 – 09.00 WIB</div>
                <div className="text-[11px] text-foreground/80 mt-2">
                  Depan Pendopo Kabupaten Blora. Ambil buku yang kamu pesan atau kembalikan pinjamanmu.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. THREE-COLUMN BROADSHEET ARTICLES DISPATCH             */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto">
          <div className="px-4 sm:px-8 py-3 border-b border-border-hairline flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-muted">
            <span>[ SEKSI II // ARSIP TULISAN &amp; ESAI ]</span>
            <Link href="/artikel" className="hover:text-foreground underline">
              LIHAT SEMUA TULISAN →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-foreground">
            {/* Article 1 */}
            <article className="p-6 sm:p-8 flex flex-col justify-between group hover:bg-surface transition-colors">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-widest mb-3">
                  <span>[ 01 // SASTRA ]</span>
                  <span>5 MIN BACA</span>
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground group-hover:underline mb-3 leading-tight">
                  <Link href="/artikel/menemukan-kembali-suara-akar-rumput">
                    Menemukan Kembali Suara Akar Rumput di Pinggiran Rel Kereta Blora
                  </Link>
                </h3>
                <p className="font-serif text-sm text-foreground/80 leading-relaxed mb-6">
                  Bagaimana lembaran buku yang dihamparkan di trotoar menjadi jembatan dialog
                  antar-warga yang selama ini tercerabut dari gemerlap perbincangan kota.
                </p>
              </div>
              <div className="pt-4 border-t border-border-hairline flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted">
                <span>PRAMONO WIBOWO</span>
                <span className="group-hover:translate-x-1 transition-transform">BACA →</span>
              </div>
            </article>

            {/* Article 2 */}
            <article className="p-6 sm:p-8 flex flex-col justify-between group hover:bg-surface transition-colors">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-widest mb-3">
                  <span>[ 02 // SEJARAH ]</span>
                  <span>4 MIN BACA</span>
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground group-hover:underline mb-3 leading-tight">
                  <Link href="/artikel/merawat-ingatan-samin-lewat-arsip-warga">
                    Merawat Ajaran Kejujuran Samin Melalui Arsip Mandiri Warga
                  </Link>
                </h3>
                <p className="font-serif text-sm text-foreground/80 leading-relaxed mb-6">
                  Ajaran perlawanan tanpa kekerasan dan kedaulatan tanah adat yang masih terus bernapas
                  dalam laku hidup sehari-hari masyarakat pedesaan Blora.
                </p>
              </div>
              <div className="pt-4 border-t border-border-hairline flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted">
                <span>SITI LESTARI</span>
                <span className="group-hover:translate-x-1 transition-transform">BACA →</span>
              </div>
            </article>

            {/* Article 3 */}
            <article className="p-6 sm:p-8 flex flex-col justify-between group hover:bg-surface transition-colors">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-widest mb-3">
                  <span>[ 03 // OPINI ]</span>
                  <span>3 MIN BACA</span>
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground group-hover:underline mb-3 leading-tight">
                  <Link href="/artikel/tanpa-denda-sebagai-etos-kepercayaan">
                    Tiada Denda Rupiah: Kepercayaan Tertinggi Terhadap Pembaca
                  </Link>
                </h3>
                <p className="font-serif text-sm text-foreground/80 leading-relaxed mb-6">
                  Mengapa sanksi finansial justru melukai hak membaca rakyat, dan bagaimana etos amanah
                  mampu menjaga ratusan koleksi tetap berputar sehat.
                </p>
              </div>
              <div className="pt-4 border-t border-border-hairline flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted">
                <span>BAYU PRASETYO</span>
                <span className="group-hover:translate-x-1 transition-transform">BACA →</span>
              </div>
            </article>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. FOLIO PUSTAKA / BOOK COLLECTION INDEX                  */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground max-w-7xl mx-auto py-12 px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b-2 border-foreground gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-ultra text-muted">
                [ SEKSI III // ETALASE KOLEKSI ]
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-black uppercase tracking-tight">
                BUKU DI RAK &amp; LAPAK
              </h2>
            </div>
            <Link
              href="/buku"
              className="font-mono text-xs uppercase tracking-widest underline hover:text-muted"
            >
              [ BUKA SELURUH 200+ KOLEKSI BUKU → ]
            </Link>
          </div>

          {/* Book jacket grid with pure stark framing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                code: 'PJ-2026-0001',
                title: 'Bumi Manusia',
                author: 'Pramoedya Ananta Toer',
                category: 'Sastra',
                status: 'available' as const,
                year: '1980',
              },
              {
                code: 'PJ-2026-0024',
                title: 'Madilog',
                author: 'Tan Malaka',
                category: 'Sosial',
                status: 'available' as const,
                year: '1943',
              },
              {
                code: 'PJ-2026-0089',
                title: 'Orang-Orang di Tikungan Jalan',
                author: 'Pramoedya Ananta Toer',
                category: 'Sejarah',
                status: 'borrowed' as const,
                year: '1954',
              },
              {
                code: 'PJ-2026-0112',
                title: 'Pendidikan Kaum Tertindas',
                author: 'Paulo Freire',
                category: 'Pendidikan',
                status: 'available' as const,
                year: '1968',
              },
            ].map((book, idx) => (
              <div
                key={idx}
                className="border border-foreground bg-surface p-5 flex flex-col justify-between group hover:border-2 transition-all relative"
              >
                <div>
                  {/* Top Metadata Strip */}
                  <div className="flex items-center justify-between text-[10px] font-mono pb-2 mb-3 border-b border-border-hairline">
                    <span className="text-muted">{book.code}</span>
                    <StatusPill status={book.status} />
                  </div>

                  {/* Minimalist Book Frame Mockup */}
                  <div className="border border-border-hairline bg-surface-muted h-48 mb-4 p-4 flex flex-col justify-between text-left group-hover:bg-foreground group-hover:text-background transition-colors">
                    <div className="font-mono text-[9px] uppercase tracking-ultra opacity-60">
                      [ {book.category} // {book.year} ]
                    </div>
                    <div>
                      <div className="font-serif text-lg font-bold uppercase leading-tight line-clamp-2">
                        {book.title}
                      </div>
                      <div className="font-mono text-[11px] mt-1 opacity-80">{book.author}</div>
                    </div>
                  </div>

                  <h4 className="font-serif text-xl font-bold text-foreground mb-1 leading-snug group-hover:underline">
                    <Link href={`/buku/${book.code}`}>{book.title}</Link>
                  </h4>
                  <p className="font-mono text-xs text-muted">{book.author}</p>
                </div>

                <div className="pt-4 mt-6 border-t border-border-hairline flex items-center justify-between text-xs font-mono">
                  <span className="text-muted uppercase text-[10px]">{book.category}</span>
                  <Link
                    href={`/buku/${book.code}`}
                    className="font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
                  >
                    <span>PINJAM</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. STATISTIK & REKAM JEJAK SWADAYA                       */}
        {/* ========================================================= */}
        <section className="border-b-2 border-foreground bg-surface py-12 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-hairline">
            <div className="py-4 md:py-0 md:pr-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                [ 01 // KOLEKSI TERDATA ]
              </div>
              <div className="font-serif text-5xl font-black text-foreground mt-2">240+</div>
              <p className="font-serif italic text-xs text-muted mt-2">
                Buku fisik tersusun di rak basecamp &amp; siap digelar di lapak.
              </p>
            </div>

            <div className="py-4 md:py-0 md:px-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                [ 02 // SISTEM DENDA ]
              </div>
              <div className="font-serif text-5xl font-black text-foreground mt-2">0,-</div>
              <p className="font-serif italic text-xs text-muted mt-2">
                Nol rupiah denda uang. Hubungan dibangun atas dasar amanah.
              </p>
            </div>

            <div className="py-4 md:py-0 md:px-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                [ 03 // TULISAN TERBIT ]
              </div>
              <div className="font-serif text-5xl font-black text-foreground mt-2">48+</div>
              <p className="font-serif italic text-xs text-muted mt-2">
                Karya esai, resensi, dan opini kiriman warga yang terkurasi.
              </p>
            </div>

            <div className="py-4 md:py-0 md:pl-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                [ 04 // TITIK LAPAK ]
              </div>
              <div className="font-serif text-5xl font-black text-foreground mt-2">2 Titik</div>
              <p className="font-serif italic text-xs text-muted mt-2">
                Alun-Alun Blora (CFD Mingguan) dan Sekretariat Basecamp Baca.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. CALL TO ACTION PENULIS WARGA                           */}
        {/* ========================================================= */}
        <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="font-mono text-[10px] uppercase tracking-ultra text-muted">
              [ RUANG MENULIS WARGA // TERBUKA ]
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground leading-tight">
              KIRIMKAN TULISANMU KE MEJA REDAKSI KAMI.
            </h2>
            <p className="font-serif text-base sm:text-lg text-foreground/80 leading-relaxed">
              Punya resensi buku, catatan pengalaman, atau gagasan sosial tentang Blora? Kirimkan
              karyamu untuk dikurasi oleh relawan kami dan terbit di bawah namamu sendiri.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link href="/dashboard/tulisan/baru">
                <Button size="lg" variant="solid">
                  TULIS ARTIKEL PANJANG
                </Button>
              </Link>
              <Link href="/surat-pembaca">
                <Button size="lg" variant="outline">
                  KIRIM SURAT PEMBACA SINGKAT
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
