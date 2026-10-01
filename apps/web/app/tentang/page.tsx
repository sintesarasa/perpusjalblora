import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import {
  BookOpen,
  Users,
  Compass,
  Heart,
  Palette,
  TreePine,
  Sparkles,
  ArrowRight,
  Flame,
  Layers,
  MapPin,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Tentang Gerakan — Perpustakaan Jalanan Blora',
  description:
    'Rekonfigurasi ruang publik, transformasi praksis literasi, dan etos kerelawanan akar rumput di tanah kelahiran para begawan sastra Blora.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground/15 flex flex-col justify-between">
      <Header />

      <main className="flex-1">
        {/* ── 1. Hero Manifesto Banner ── */}
        <section className="border-b border-border bg-surface-muted/30 pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-8 relative overflow-hidden">
          {/* Subtle background newspaper watermark */}
          <div className="absolute -right-12 -bottom-16 opacity-[0.03] select-none pointer-events-none font-serif text-[180px] sm:text-[260px] font-black leading-none text-foreground tracking-tighter">
            BLORA
          </div>

          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            {/* Editorial Folio Tag */}
            <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest px-3 py-1 border border-border bg-background text-foreground font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
              <span>MANIFESTO &amp; HISTORIOGRAFI GERAKAN</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-foreground leading-[1.12]">
              Di Atas Terpal Sederhana, Aksara Menemukan Rumahnya.
            </h1>

            {/* Subtitle / Deck */}
            <p className="font-serif italic text-lg sm:text-2xl text-foreground/80 leading-relaxed max-w-3xl">
              Rekonfigurasi ruang publik, pembebasan akses pengetahuan periferi, dan etos
              kolektif <span className="font-semibold not-italic text-foreground">&ldquo;Ngurip-urip&rdquo;</span> di tanah kelahiran para begawan sastra.
            </p>

            {/* Quick Metadata Pill Strip */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-hairline font-mono text-xs text-muted uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-foreground" />
                <span>Berakar Sejak 2017</span>
              </div>
              <span>&bull;</span>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-foreground" />
                <span>Kolektif Cair Non-Hierarkis</span>
              </div>
              <span>&bull;</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-foreground" />
                <span>Trotoar Kota &amp; Tepian Hutan Jati</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Intisari & Latar Belakang Historis ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-20 space-y-16">
          {/* Paragraph Flow */}
          <div className="space-y-6 font-serif text-base sm:text-lg text-foreground/90 leading-[1.8] sm:leading-[1.85]">
            <p className="first-letter:float-left first-letter:text-5xl sm:first-letter:text-6xl first-letter:leading-none first-letter:font-serif first-letter:pr-3.5 first-letter:pt-1 first-letter:font-bold first-letter:text-foreground">
              Kabupaten Blora di Jawa Tengah menempati posisi istimewa dalam peta kesusastraan
              dan kebudayaan nusantara. Daerah ini mewarisi sedimentasi literasi historis yang mendalam,
              terutama melalui riwayat keluarga Toer—Pramoedya Ananta Toer dan Dr. Soesilo Toer—beserta
              institusi kultural independen legendaris seperti Perpustakaan PATABA.
            </p>
            <p>
              Namun, di balik narasi besar sejarah tersebut, masyarakat di wilayah periferi menghadapi tantangan
              nyata berupa keterbatasan akses bacaan bermutu dan kekakuan formal layanan perpustakaan gedung.
              Menjawab defisit akses tersebut, inisiatif akar rumput <strong>Perpustakaan Jalanan Blora (Perpusjal)</strong> hadir
              sebagai respons organik: merekonfigurasi ruang publik terbuka menjadi arena interaksi sosial yang
              emansipatoris, setara, dan membebaskan.
            </p>
          </div>

          {/* Historic Quote Callout */}
          <div className="p-6 sm:p-8 border-2 border-foreground bg-surface-muted/20 relative">
            <div className="w-1.5 h-full bg-foreground absolute top-0 left-0" />
            <blockquote className="font-serif italic text-lg sm:text-2xl text-foreground leading-relaxed pl-2 sm:pl-4">
              &ldquo;Membaca bukan sekadar melahap aksara di atas kertas, melainkan jalan pulang bagi nurani yang merdeka.&rdquo;
            </blockquote>
            <div className="mt-4 pl-2 sm:pl-4 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
              <span>— Preseden Kultural Soesilo Toer &amp; Perpustakaan PATABA</span>
              <span className="hidden sm:inline">Ruang Terbuka Blora</span>
            </div>
          </div>

          {/* ── 3. Transformasi Paradigma: Dari "Melawan" ke "Berbahagia" ── */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <Sparkles className="w-3.5 h-3.5 text-foreground" />
              <span>EVOLUSI DISKURSUS &amp; SLOGAN</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-foreground">
              Rekonstruksi Wacana: Dari Konfrontasi Menuju Kegembiraan Inklusif
            </h2>
            <p className="font-serif text-base sm:text-lg text-foreground/85 leading-relaxed">
              Pada masa perintisannya sekitar tahun 2017, Perpusjal Blora mengadopsi diktum khas gerakan literasi
              jalanan berbasis subkultur punk: <em className="text-foreground font-semibold">&ldquo;Membaca adalah Melawan&rdquo;</em>.
              Meskipun memuat kritik tajam terhadap hegemoni pengetahuan, dalam sosiokultural Blora yang majemuk dan paternalistik,
              diksi perlawanan sempat memicu jarak sosial dan kecurigaan administratif.
            </p>

            {/* Side-by-side Evolution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 border border-border bg-surface space-y-3">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted px-2 py-0.5 border border-border">
                  <Flame className="w-3 h-3 text-muted" />
                  <span>Fase Perintisan (2017)</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  &ldquo;Membaca adalah Melawan&rdquo;
                </h3>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Menekankan agitasi kontra-hegemonik dan kritik sosial tajam. Namun, terminologi ini kerap menimbulkan
                  sekat psikologis bagi masyarakat awam, aparatur lingkungan, dan keluarga pedesaan.
                </p>
              </div>

              <div className="p-6 border-2 border-foreground bg-background space-y-3 shadow-xs">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground font-bold px-2 py-0.5 border border-foreground bg-foreground text-background">
                  <Smile className="w-3 h-3 text-background" />
                  <span>Reorientasi Paradigma (Kini)</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  &ldquo;Membaca dan Berbahagia&rdquo;
                </h3>
                <p className="font-sans text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  Membaca direposisi bukan sebagai beban moral atau agitasi berat, melainkan sebagai rekreasi intelektual
                  yang menggembirakan. Terbukti mencairkan relasi sosial, mengundang anak-anak, remaja, hingga orang tua tanpa sekat.
                </p>
              </div>
            </div>
          </div>

          {/* ── 4. Tiga Pilar Praksis Organik ("Ngurip-urip") ── */}
          <div className="space-y-8 pt-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <Layers className="w-3.5 h-3.5 text-foreground" />
              <span>PRINSIP DASAR OPERASIONAL</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-foreground">
              Tiga Pilar Praksis Perpustakaan Jalanan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pilar 1 */}
              <div className="p-6 border border-border bg-surface flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="w-9 h-9 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground bg-surface-muted">
                    01
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Spasialitas Aspal &amp; Terpal
                  </h3>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Menolak ketergantungan pada gedung semen dan jam dinas kaku. Lapak digelar di Alun-alun, Lapangan
                    Kridosono, Embung Rowo, hingga warung angkringan. Warga cukup melangkah dan membaca tanpa perlu kartu anggota.
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted/70">
                  // Akses Bebas Hambatan
                </span>
              </div>

              {/* Pilar 2 */}
              <div className="p-6 border border-border bg-surface flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="w-9 h-9 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground bg-surface-muted">
                    02
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Kolektif &ldquo;Ngurip-urip&rdquo;
                  </h3>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Digerakkan tanpa struktur hierarki atau posisi ketua formal. Bertumpu pada kearifan lokal Jawa
                    <em> ngurip-urip</em> (menghidupkan bersama secara sukarela) yang merangkul siapa saja untuk berdaya.
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted/70">
                  // Desentralisasi Kerelawanan
                </span>
              </div>

              {/* Pilar 3 */}
              <div className="p-6 border border-border bg-surface flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="w-9 h-9 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground bg-surface-muted">
                    03
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Literasi Terapan &amp; Life Skills
                  </h3>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Literasi dimaknai melampaui teks: kecakapan bertahan hidup nyata. Meliputi lokakarya sablon cukil kayu,
                    seni kolase limbah plastik, ecoprint daun jati desa, hingga mewarnai anak.
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted/70">
                  // Praksis Keterampilan Nyata
                </span>
              </div>
            </div>
          </div>

          {/* ── 5. Dua Sayap Ekosistem: Urban Kota vs Rimba Selatan ── */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <Compass className="w-3.5 h-3.5 text-foreground" />
              <span>TOPOGRAFI &amp; JEJARING GERAKAN</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-foreground">
              Dua Sayap Geografis: Urban Kota &amp; Tepian Alas
            </h2>
            <p className="font-serif text-base sm:text-lg text-foreground/85 leading-relaxed">
              Gerakan literasi jalanan Blora tidak monolitik. Ekosistem ini tumbuh mekar melalui dua kutub wilayah
              yang saling melengkapi dan mengakar kuat pada karakter ruang hidup warganya:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Sayap 1: Urban Kota */}
              <div className="p-6 sm:p-7 border border-border bg-surface space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-foreground bg-foreground text-background">
                      SAYAP PERKOTAAN
                    </span>
                    <span className="font-mono text-xs text-muted">Alun-alun &amp; Kridosono</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                    Perpusjal Blora (Kota)
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    Dipelopori oleh <strong>Adistya Wahyu Putra</strong> bersama kolektif pemuda perkotaan.
                    Berakar di ruang publik Alun-alun, Embung Rowo, dan simpul seni independen <strong>Omah Talang Bocor</strong>.
                  </p>
                  <ul className="font-sans text-xs text-muted space-y-1.5 pt-2 border-t border-border-hairline">
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Mimbar Bebas Kebangsaan &amp; Diskusi Dokumenter Kritis</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Sirkulasi Zine Alternatif &amp; Pelatihan Grafis Cukil Kayu</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Pentas Kesenian Rakyat Barongan di Forum <em>Nyambong Roso</em></span>
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-border-hairline font-mono text-[11px] text-muted flex items-center justify-between">
                  <span>Karakter: Urban Kritis</span>
                  <span>Swadaya Kolektif</span>
                </div>
              </div>

              {/* Sayap 2: Selatan / Doplang */}
              <div className="p-6 sm:p-7 border border-border bg-surface space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-border bg-surface-muted text-foreground">
                      SAYAP RIMBA SELATAN
                    </span>
                    <span className="font-mono text-xs text-muted">Doplang &amp; Randublatung</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                    Perpusjal Dope (Doplang)
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    Digerakkan oleh <strong>Nanang Sadega</strong> (Nanang Apr Prasetyo) di kawasan perdesaan dan tepian hutan Blora selatan.
                    Terhubung resmi di jejaring Forum TBM (@perpusjal.dope).
                  </p>
                  <ul className="font-sans text-xs text-muted space-y-1.5 pt-2 border-t border-border-hairline">
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Festival Tahunan <strong>Nginep Alas</strong> di Sendang Salak Trembes</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Pemberdayaan Batik Ecoprint Daun Jati bersama PKK Desa Tanggel</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Inkubasi Ekonomi Sirkular &amp; Advokasi Wilayah Pelosok Hutan</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-border-hairline font-mono text-[11px] text-muted flex items-center justify-between">
                  <span>Karakter: Ekologi &amp; Desa</span>
                  <span>TBM Berdaya</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 6. Komparasi Dialektis: Jalur Institusional vs Taktis ── */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
              <span>DIALEKTIKA EKOSISTEM LITERASI</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-foreground">
              Harmoni Komplementer: Institusi &amp; Akar Rumput
            </h2>
            <p className="font-serif text-base sm:text-lg text-foreground/85 leading-relaxed">
              Perpustakaan formal (DPK Kabupaten Blora) dengan gedung megah empat lantai dan armada <em>Buku Menjemput Pembaca</em> di arena Car Free Day,
              bersanding harmonis dengan lapak terpal Perpusjal. Keduanya tidak saling menegasikan, melainkan mengisi ceruk-ceruk sosial yang berbeda:
            </p>

            {/* Comparison Table */}
            <div className="border border-border overflow-x-auto bg-surface">
              <table className="w-full text-left font-sans text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60 font-mono text-[11px] uppercase tracking-wider text-foreground">
                    <th className="p-3.5 sm:p-4 font-bold">Dimensi</th>
                    <th className="p-3.5 sm:p-4 font-bold border-l border-border">Jalur Formal (DPK Blora)</th>
                    <th className="p-3.5 sm:p-4 font-bold border-l border-border bg-foreground/5">Jalur Akar Rumput (Perpusjal &amp; Dope)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline">
                  <tr>
                    <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Landasan Etos</td>
                    <td className="p-3.5 sm:p-4 text-foreground/80 border-l border-border">Programatis birokrasi negara (&ldquo;Buku Menjemput Pembaca&rdquo;)</td>
                    <td className="p-3.5 sm:p-4 text-foreground font-medium border-l border-border bg-foreground/5">Otonomi kesukarelaan kultural (<em>Ngurip-urip</em>)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Sumber Daya</td>
                    <td className="p-3.5 sm:p-4 text-foreground/80 border-l border-border">APBD &amp; Pengadaan Terstruktur</td>
                    <td className="p-3.5 sm:p-4 text-foreground font-medium border-l border-border bg-foreground/5">Donasi publik, koleksi pribadi, iuran swadaya</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Arena Spasial</td>
                    <td className="p-3.5 sm:p-4 text-foreground/80 border-l border-border">Gedung 4 lantai &amp; Stan Resmi CFD</td>
                    <td className="p-3.5 sm:p-4 text-foreground font-medium border-l border-border bg-foreground/5">Lapak terpal trotoar, angkringan, hingga tepi hutan jati</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Ragam Aktivitas</td>
                    <td className="p-3.5 sm:p-4 text-foreground/80 border-l border-border">Pojok baca ramah anak, permainan edukatif formal</td>
                    <td className="p-3.5 sm:p-4 text-foreground font-medium border-l border-border bg-foreground/5">Sablon cukil kayu, ecoprint daun jati, kolase sampah, mimbar bebas</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Jangkauan Warga</td>
                    <td className="p-3.5 sm:p-4 text-foreground/80 border-l border-border">Keluarga perkotaan &amp; pelajar sekolah</td>
                    <td className="p-3.5 sm:p-4 text-foreground font-medium border-l border-border bg-foreground/5">Remaja tongkrongan, pegiat seni, warga rentan, dan komunitas desa</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 7. Epilog & Ajakan Keterlibatan (Call to Action) ── */}
          <div className="p-8 sm:p-12 border-2 border-foreground bg-surface text-center space-y-6">
            <div className="w-12 h-12 border border-foreground bg-foreground text-background flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Ruang Ini Milik Kita Bersama
              </h3>
              <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                Di Perpusjal Blora, siapa pun boleh datang untuk membaca di atas terpal, mendonasikan buku bacaan,
                ataupun menuangkan gagasan orisinal melalui tulisan di platform digital ini.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/buku"
                className="h-10 px-5 bg-foreground text-background font-mono text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:opacity-90 transition-opacity font-semibold"
              >
                <span>Jelajahi Katalog Buku</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/tulisan/tulis"
                className="h-10 px-5 border border-foreground bg-background text-foreground font-mono text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:bg-surface-muted transition-colors font-semibold"
              >
                <span>Mulai Menulis Naskah</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
