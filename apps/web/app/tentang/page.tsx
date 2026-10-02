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
  Smile,
  ShieldCheck,
  MapPin,
  Coffee,
  Sun,
  Flame,
} from 'lucide-react';

export const metadata = {
  title: 'Tentang Kami — Perpustakaan Jalanan Blora',
  description:
    'Mengenal gerakan Perpustakaan Jalanan Blora: membaca buku gratis di atas terpal, guyub rukun warga, dan belajar keterampilan bersama di sudut-sudut Blora.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground/15 flex flex-col justify-between">
      <Header />

      <main className="flex-1">
        {/* ── 1. Hero Section ── */}
        <section className="border-b border-border bg-surface-muted/30 pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-8 relative overflow-hidden">
          {/* Subtle watermark */}
          <div className="absolute -right-8 -bottom-14 opacity-[0.03] select-none pointer-events-none font-serif text-[160px] sm:text-[240px] font-black leading-none text-foreground tracking-tighter">
            BLORA
          </div>

          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            {/* Tag Kategori Ramah */}
            <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest px-3 py-1 border border-border bg-background text-foreground font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
              <span>MENGENAL PERPUSJAL BLORA // DARI WARGA UNTUK WARGA</span>
            </div>

            {/* Judul Utama yang Hangat */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-foreground leading-[1.15]">
              Buku Bebas untuk Semua, Digelar Hangat di Atas Terpal.
            </h1>

            {/* Subjudul Sederhana & Mengena */}
            <p className="font-serif italic text-lg sm:text-2xl text-foreground/80 leading-relaxed max-w-3xl">
              Sebuah gerakan membaca gratis, merawat semangat guyub <span className="font-semibold not-italic text-foreground">&ldquo;ngurip-urip&rdquo;</span>, dan ruang kumpul terbuka bagi siapa saja di tanah Blora.
            </p>

            {/* Strip Informasi Singkat */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-hairline font-mono text-xs text-muted uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-foreground" />
                <span>Mulai Sejak 2017</span>
              </div>
              <span>&bull;</span>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-foreground" />
                <span>Terbuka &amp; Sukarela</span>
              </div>
              <span>&bull;</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-foreground" />
                <span>Alun-Alun, Taman Kota &amp; Desa Tepi Hutan</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Cerita Awal Kami ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-20 space-y-16">
          <div className="space-y-6 font-serif text-base sm:text-lg text-foreground/90 leading-[1.8] sm:leading-[1.85]">
            <p className="first-letter:float-left first-letter:text-5xl sm:first-letter:text-6xl first-letter:leading-none first-letter:font-serif first-letter:pr-3.5 first-letter:pt-1 first-letter:font-bold first-letter:text-foreground">
              Blora dikenal luas sebagai tanah kelahiran sastrawan besar Indonesia, Pramoedya Ananta Toer
              dan adiknya, Mbah Soesilo Toer dengan Perpustakaan PATABA yang legendaris. Kota ini punya riwayat
              kecintaan pada buku yang sangat membanggakan.
            </p>
            <p>
              Namun di kehidupan sehari-hari, masih banyak anak-anak, remaja, dan warga di sekitar kita yang kesulitan
              mendapatkan bacaan yang menarik. Datang ke gedung perpustakaan besar terkadang terasa segan, kaku,
              atau rumit dengan urusan administrasi.
            </p>
            <p>
              Berangkat dari keresahan sederhana itulah, <strong>Perpustakaan Jalanan Blora (Perpusjal)</strong> lahir.
              Kami memilih membawa buku langsung ke tempat warga bersantai: di trotoar alun-alun, bawah pohon rindang taman,
              tepi lapangan, hingga warung angkringan. Cukup gelar terpal, tata bukunya, dan siapa pun boleh mampir membaca
              tanpa dipungut biaya sepeser pun dan tanpa syarat kartu anggota.
            </p>
          </div>

          {/* Kutipan Pengingat */}
          <div className="p-6 sm:p-8 border-2 border-foreground bg-surface-muted/20 relative">
            <div className="w-1.5 h-full bg-foreground absolute top-0 left-0" />
            <blockquote className="font-serif italic text-lg sm:text-2xl text-foreground leading-relaxed pl-2 sm:pl-4">
              &ldquo;Membaca bukan cuma soal mengeja huruf di buku, tapi jalan melatih rasa dan pikiran agar kita menjadi manusia yang merdeka.&rdquo;
            </blockquote>
            <div className="mt-4 pl-2 sm:pl-4 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
              <span>— Terinspirasi dari keteladanan Mbah Soesilo Toer (PATABA Blora)</span>
              <span className="hidden sm:inline">Ruang Terbuka Blora</span>
            </div>
          </div>

          {/* ── 3. Evolusi Slogan: Dari "Melawan" Menjadi "Berbahagia" ── */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <Sparkles className="w-3.5 h-3.5 text-foreground" />
              <span>PERJALANAN SEMBOYAN KAMI</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-foreground">
              Kenapa Memilih &ldquo;Membaca dan Berbahagia&rdquo;?
            </h2>
            <p className="font-serif text-base sm:text-lg text-foreground/85 leading-relaxed">
              Waktu pertama kali dirintis tahun 2017 oleh kawan-kawan muda di Blora, kami sempat memakai slogan yang sering dipakai
              di jalanan: <em>&ldquo;Membaca adalah Melawan&rdquo;</em>. Niat awalnya baik, yaitu mengajak warga melawan rasa malas dan kebodohan.
            </p>
            <p className="font-serif text-base sm:text-lg text-foreground/85 leading-relaxed">
              Namun di lapangan, kata &ldquo;melawan&rdquo; terdengar keras dan terasa berjarak bagi masyarakat awam.
              Sebagian orang tua dan warga sempat ragu untuk mampir karena mengira ini gerakan politik yang berat. Dari sanalah kami belajar,
              lalu mengubah semboyan menjadi: <strong>&ldquo;Membaca dan Berbahagia&rdquo;</strong>.
            </p>

            {/* Kartu Perbandingan yang Mudah Dipahami */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 border border-border bg-surface space-y-3">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted px-2 py-0.5 border border-border">
                  <Flame className="w-3 h-3 text-muted" />
                  <span>Awal Mula (2017)</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  &ldquo;Membaca adalah Melawan&rdquo;
                </h3>
                <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                  Penuh semangat anak muda untuk mengkritik ketimpangan. Namun bahasanya terasa kaku dan terkadang membuat
                  masyarakat sekitar ragu untuk mendekat.
                </p>
              </div>

              <div className="p-6 border-2 border-foreground bg-background space-y-3 shadow-xs">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground font-bold px-2 py-0.5 border border-foreground bg-foreground text-background">
                  <Smile className="w-3 h-3 text-background" />
                  <span>Semboyan Kami Kini</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">
                  &ldquo;Membaca dan Berbahagia&rdquo;
                </h3>
                <p className="font-sans text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  Membaca dijadikan kegiatan yang santai dan menyenangkan. Siapa saja boleh datang sambil tersenyum:
                  anak-anak yang asyik menggambar, remaja yang mengobrol, hingga orang tua yang menunggu anaknya bermain.
                </p>
              </div>
            </div>
          </div>

          {/* ── 4. Tiga Nilai Sederhana Kami ── */}
          <div className="space-y-8 pt-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <Sun className="w-3.5 h-3.5 text-foreground" />
              <span>CARA KAMI BERGERAK</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-foreground">
              Tiga Hal yang Selalu Kami Jaga
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Nilai 1 */}
              <div className="p-6 border border-border bg-surface flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="w-9 h-9 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground bg-surface-muted">
                    01
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Cukup Selembar Terpal
                  </h3>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Kami tidak punya gedung permanen. Lapak dibuka di tempat terbuka seperti Alun-Alun, Lapangan Kridosono,
                    atau Embung Rowo. Warga yang lewat tinggal duduk santai beralas terpal.
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted/70">
                  // Mudah &amp; Merakyat
                </span>
              </div>

              {/* Nilai 2 */}
              <div className="p-6 border border-border bg-surface flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="w-9 h-9 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground bg-surface-muted">
                    02
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Semangat &ldquo;Ngurip-urip&rdquo;
                  </h3>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Tidak ada bos atau struktur organisasi yang berjarak. Semua berjalan berkat gotong royong sukarela
                    <em> ngurip-urip</em> (saling menghidupkan). Siapa pun boleh ikut menjaga buku atau menyumbang bacaan.
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted/70">
                  // Gotong Royong Warga
                </span>
              </div>

              {/* Nilai 3 */}
              <div className="p-6 border border-border bg-surface flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="w-9 h-9 border border-border flex items-center justify-center font-mono text-xs font-bold text-foreground bg-surface-muted">
                    03
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Belajar Keterampilan Nyata
                  </h3>
                  <p className="font-sans text-xs text-muted leading-relaxed">
                    Bukan hanya membaca teks, lapak kami juga mengadakan belajar bersama: latihan sablon cukil kayu sederhana,
                    seni daur ulang plastik, cetak daun alami (ecoprint), hingga lomba mewarnai anak-anak.
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted/70">
                  // Praktik &amp; Kesenian
                </span>
              </div>
            </div>
          </div>

          {/* ── 5. Dua Titik Kumpul: Dari Kota Sampai Pelosok Desa ── */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <TreePine className="w-3.5 h-3.5 text-foreground" />
              <span>TEMPAT KAMI BERBAGI CERITA</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-foreground">
              Menyapa Warga Kota dan Desa Hutan
            </h2>
            <p className="font-serif text-base sm:text-lg text-foreground/85 leading-relaxed">
              Gerakan membaca ini tumbuh di dua wilayah utama Blora dengan cara dan keunikannya masing-masing:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Wilayah Kota */}
              <div className="p-6 sm:p-7 border border-border bg-surface space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-foreground bg-foreground text-background">
                      WILAYAH KOTA
                    </span>
                    <span className="font-mono text-xs text-muted">Alun-Alun &amp; Kridosono</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                    Perpusjal Blora (Kota)
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    Digerakkan oleh kawan-kawan muda di pusat kota Blora. Lapak sering menyapa warga di Alun-Alun,
                    Embung Rowo, dan rumah kreatif <strong>Omah Talang Bocor</strong> di dekat Kridosono.
                  </p>
                  <ul className="font-sans text-xs text-muted space-y-1.5 pt-2 border-t border-border-hairline">
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Panggung obrolan santai, diskusi film, dan pembacaan puisi</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Belajar seni sablon cukil kayu mandiri di atas kaos dan kertas</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Menampilkan kesenian rakyat Barongan dalam forum kebudayaan warga</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-border-hairline font-mono text-[11px] text-muted flex items-center justify-between">
                  <span>Suasana: Kreatif Perkotaan</span>
                  <span>Swadaya Warga</span>
                </div>
              </div>

              {/* Wilayah Selatan / Hutan */}
              <div className="p-6 sm:p-7 border border-border bg-surface space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-border bg-surface-muted text-foreground">
                      WILAYAH SELATAN
                    </span>
                    <span className="font-mono text-xs text-muted">Doplang &amp; Randublatung</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                    Perpusjal Dope (Doplang)
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-foreground/80 leading-relaxed">
                    Digerakkan oleh kawan-kawan di pedesaan selatan Blora. Terhubung di Forum Taman Bacaan Masyarakat
                    (Instagram: @perpusjal.dope) dengan kegiatan khas desa dan hutan.
                  </p>
                  <ul className="font-sans text-xs text-muted space-y-1.5 pt-2 border-t border-border-hairline">
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Kemah literasi tahunan <strong>Nginep Alas</strong> di mata air Sendang Salak</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Pelatihan batik ramah lingkungan (ecoprint) daun jati bersama ibu-ibu PKK Desa Tanggel</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-foreground font-bold">&bull;</span>
                      <span>Menjangkau anak-anak di pelosok desa tepian hutan yang minim buku bacaan</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-border-hairline font-mono text-[11px] text-muted flex items-center justify-between">
                  <span>Suasana: Alam &amp; Pedesaan</span>
                  <span>Komunitas Berdaya</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 6. Hubungan dengan Perpustakaan Daerah (DPK Blora) ── */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
              <Coffee className="w-3.5 h-3.5 text-foreground" />
              <span>BERGANDENGAN TANGAN</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight text-foreground">
              Saling Melengkapi untuk Warga Blora
            </h2>
            <p className="font-serif text-base sm:text-lg text-foreground/85 leading-relaxed">
              Blora kini memiliki gedung Perpustakaan Daerah (DPK) empat lantai yang megah dan ber-AC, serta layanan
              mobil keliling <em>Buku Menjemput Pembaca</em> di Car Free Day (CFD). Keberadaan lapak jalanan Perpusjal
              tidak pernah bermaksud menyaingi pemerintah, melainkan saling melengkapi:
            </p>

            {/* Tabel yang Jelas dan Mudah Dipahami */}
            <div className="border border-border overflow-x-auto bg-surface">
              <table className="w-full text-left font-sans text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60 font-mono text-[11px] uppercase tracking-wider text-foreground">
                    <th className="p-3.5 sm:p-4 font-bold">Hal</th>
                    <th className="p-3.5 sm:p-4 font-bold border-l border-border">Perpustakaan Daerah (DPK)</th>
                    <th className="p-3.5 sm:p-4 font-bold border-l border-border bg-foreground/5">Perpustakaan Jalanan (Perpusjal)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline">
                  <tr>
                    <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Tempat Membaca</td>
                    <td className="p-3.5 sm:p-4 text-foreground/80 border-l border-border">Gedung perpustakaan 4 lantai &amp; stan resmi CFD</td>
                    <td className="p-3.5 sm:p-4 text-foreground font-medium border-l border-border bg-foreground/5">Lapak terpal di trotoar, taman kota, angkringan, hingga tepi hutan</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Suasana</td>
                    <td className="p-3.5 sm:p-4 text-foreground/80 border-l border-border">Formal, tenang, rapi, dan teratur</td>
                    <td className="p-3.5 sm:p-4 text-foreground font-medium border-l border-border bg-foreground/5">Santai, hangat, boleh sambil ngopi, ngobrol, atau lesehan santai</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Sumber Buku</td>
                    <td className="p-3.5 sm:p-4 text-foreground/80 border-l border-border">Anggaran resmi pemerintah daerah (APBD)</td>
                    <td className="p-3.5 sm:p-4 text-foreground font-medium border-l border-border bg-foreground/5">Buku pribadi relawan dan sumbangan suka rela dari warga</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Kegiatan Pendukung</td>
                    <td className="p-3.5 sm:p-4 text-foreground/80 border-l border-border">Pojok baca anak, edukasi sekolah terstruktur</td>
                    <td className="p-3.5 sm:p-4 text-foreground font-medium border-l border-border bg-foreground/5">Pelatihan sablon cukil, batik ecoprint, seni daur ulang, kemah literasi</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-mono text-xs text-muted font-bold">Tujuan Bersama</td>
                    <td colSpan={2} className="p-3.5 sm:p-4 text-center font-serif italic text-foreground font-semibold border-l border-border bg-surface-muted/40">
                      Sama-sama ingin melihat warga Blora gemar membaca, cerdas, dan berdaya.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 7. Pintu Selalu Terbuka untuk Anda ── */}
          <div className="p-8 sm:p-12 border-2 border-foreground bg-surface text-center space-y-6">
            <div className="w-12 h-12 border border-foreground bg-foreground text-background flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Lapak Ini Milik Kita Bersama
              </h3>
              <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                Siapa pun kamu, pintu lapak selalu terbuka lebar. Kamu boleh mampir membaca di atas terpal,
                menyumbangkan buku yang sudah tidak terpakai, atau menuliskan cerita, puisi, dan opini warga di website ini.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/buku"
                className="h-10 px-5 bg-foreground text-background font-mono text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:opacity-90 transition-opacity font-semibold"
              >
                <span>Lihat Koleksi Buku</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/tulisan/tulis"
                className="h-10 px-5 border border-foreground bg-background text-foreground font-mono text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:bg-surface-muted transition-colors font-semibold"
              >
                <span>Tulis Cerita / Opini Warga</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
