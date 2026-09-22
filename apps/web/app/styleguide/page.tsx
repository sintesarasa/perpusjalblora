'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/ui/status-pill';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

import { Logo, LogoIcon } from '@/components/logo';
import { CustomLoader } from '@/components/ui/custom-loader';
import { BrandStamp } from '@/components/ui/brand-stamp';

export default function StyleguidePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-12 w-full">
        {/* Masthead Styleguide Header */}
        <div className="mb-12 pb-4 border-b-2 border-foreground">
          <div className="font-mono text-[10px] uppercase tracking-ultra text-muted mb-2">
            [ INTERNAL SISTEM // DOKUMEN DESAIN v2.0 ]
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-black uppercase tracking-tight">
            STARK MONOCHROME EDITORIAL
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-muted mt-2 max-w-2xl">
            Pedoman komponen antarmuka, spesimen tipografi, logo resmi, dan token visual untuk
            Perpustakaan Jalanan Blora.
          </p>
        </div>

        {/* 0. IDENTITAS LOGO & CUSTOM LOADER */}
        <section className="mb-16 pb-12 border-b border-border-hairline space-y-8">
          <div className="font-mono text-xs uppercase tracking-widest font-bold border-b border-foreground pb-2">
            00 // IDENTITAS RESMI &amp; CUSTOM LOADER
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Logo Wordmark */}
            <div className="border border-border-hairline p-6 bg-surface space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted block">
                [ LOGO RESMI // WORDMARK + EMBLEM ]
              </span>
              <div className="py-4">
                <Logo className="h-10 w-auto text-foreground" />
              </div>
              <p className="font-mono text-xs text-muted">
                Tipografi miring konstruktivis jalanan dengan tanda kurasi ganda.
              </p>
            </div>

            {/* Logo Emblem & Brand Stamp */}
            <div className="border border-border-hairline p-6 bg-surface space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted block">
                [ EMBLEM &amp; CAP RESMI ]
              </span>
              <div className="py-2 flex items-center gap-4">
                <LogoIcon className="h-8 w-auto text-foreground" />
                <BrandStamp edition="VOL. III" year="2026" />
              </div>
              <p className="font-mono text-xs text-muted">
                Glif ganda paralelogram sebagai identitas stempel buku &amp; ikon ringkas.
              </p>
            </div>

            {/* Custom Kinetic Loader */}
            <div className="border border-border-hairline p-6 bg-surface space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted block">
                [ KINETIC LOADER RESMI ]
              </span>
              <div className="py-2 border border-border-subtle bg-surface-muted/30">
                <CustomLoader size="md" label="MEMBUKA LEMBARAN..." />
              </div>
              <p className="font-mono text-xs text-muted">
                Animasi scanning pulsa berbasis motif geometris logo resmi.
              </p>
            </div>
          </div>
        </section>

        {/* 1. TIPOGRAFI */}
        <section className="mb-16 pb-12 border-b border-border-hairline space-y-8">
          <div className="font-mono text-xs uppercase tracking-widest font-bold border-b border-foreground pb-2">
            01 // SKALA TIPOGRAFI
          </div>

          <div className="space-y-8">
            <div className="border-b border-border-hairline pb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-2">
                [ DISPLAY HERO // PLAYFAIR DISPLAY SERIF 72PX ]
              </span>
              <div className="font-serif text-4xl sm:text-7xl font-black uppercase tracking-tight leading-none">
                Membaca dan Berbahagia.
              </div>
            </div>

            <div className="border-b border-border-hairline pb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-2">
                [ HEADING 1 // JUDUL ARTIKEL 38PX ]
              </span>
              <div className="font-serif text-3xl sm:text-4xl font-bold leading-tight max-w-3xl">
                Menemukan Kembali Suara Akar Rumput di Pinggiran Rel Kereta Hutan Jati Blora
              </div>
            </div>

            <div className="border-b border-border-hairline pb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-2">
                [ BODY EDITORIAL DENGAN DROP CAP // LORA SERIF 18PX ]
              </span>
              <p className="drop-cap font-serif text-base sm:text-lg leading-relaxed max-w-2xl text-foreground/90">
                Buku yang diletakkan di atas meja kaca ber-AC terasa begitu jauh bagi seorang petani atau
                pedagang pasar. Namun ketika buku-buku itu dihamparkan di trotoar di atas selembar terpal
                biru, batas-batas kasta sosial itu seketika lebur.
              </p>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-2">
                [ METADATA MIKRO &amp; TABULAR // TABULAR MONO 11PX TRACKING ULTRA ]
              </span>
              <div className="font-mono text-xs uppercase tracking-widest text-muted">
                INVENTARIS: PJ-2026-0001 · STATUS: TERSEDIA · JATUH TEMPO: 7 HARI KERJA
              </div>
            </div>
          </div>
        </section>

        {/* 2. TOMBOL STARK MONOCHROME */}
        <section className="mb-16 pb-12 border-b border-border-hairline space-y-6">
          <div className="font-mono text-xs uppercase tracking-widest font-bold border-b border-foreground pb-2">
            02 // TOMBOL &amp; INTERAKSI
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="solid" size="md">
              SOLID BUTTON
            </Button>
            <Button variant="outline" size="md">
              OUTLINE BUTTON
            </Button>
            <Button variant="ghost" size="md">
              GHOST BUTTON
            </Button>
            <Button variant="danger" size="md">
              DANGER ACTION
            </Button>
            <Button variant="solid" size="md" isLoading>
              MEMUAT
            </Button>
            <Button variant="solid" size="md" disabled>
              NONAKTIF
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center pt-4">
            <Button variant="solid" size="sm">
              SMALL (SM)
            </Button>
            <Button variant="solid" size="md">
              MEDIUM (MD)
            </Button>
            <Button variant="solid" size="lg">
              LARGE (LG)
            </Button>
          </div>
        </section>

        {/* 3. LENCANA & INDIKATOR STATUS */}
        <section className="mb-16 pb-12 border-b border-border-hairline space-y-6">
          <div className="font-mono text-xs uppercase tracking-widest font-bold border-b border-foreground pb-2">
            03 // LENCANA &amp; INDIKATOR STATUS
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="font-mono text-[11px] text-muted mr-3">Varian Badge:</span>
              <Badge variant="solid">[ UTAMA ]</Badge>
              <Badge variant="outline">[ SASTRA ]</Badge>
              <Badge variant="subtle">[ KAJIAN SOSIAL ]</Badge>
            </div>

            <div className="flex flex-wrap gap-3 items-center pt-2">
              <span className="font-mono text-[11px] text-muted mr-3">Status Buku &amp; Sirkulasi:</span>
              <StatusPill status="available" count={3} />
              <StatusPill status="borrowed" />
              <StatusPill status="reference" />
              <StatusPill status="review" />
              <StatusPill status="published" />
              <StatusPill status="draft" />
              <StatusPill status="overdue" />
            </div>
          </div>
        </section>

        {/* 4. KARTU ARSIP & BUKU */}
        <section className="mb-16 pb-12 border-b border-border-hairline space-y-6">
          <div className="font-mono text-xs uppercase tracking-widest font-bold border-b border-foreground pb-2">
            04 // KARTU BUKU &amp; ARSIP (GRID HAILINE)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline">[ PJ-2026-0001 ]</Badge>
                  <StatusPill status="available" count={2} />
                </div>
                <CardTitle>Bumi Manusia</CardTitle>
                <CardDescription>Pramoedya Ananta Toer // Terbit 1980</CardDescription>
              </CardHeader>
              <CardContent>
                Roman sejarah tentang pergerakan nasional awal abad ke-20 di Surabaya dan Wonokromo,
                mempertemukan Minke dengan pergulatan martabat manusia di hadapan hukum kolonial.
              </CardContent>
              <CardFooter>
                <span className="text-muted">RAK A-01 // BASECAMP</span>
                <span className="font-bold underline cursor-pointer hover:text-muted">
                  PINJAM BUKU →
                </span>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="solid">[ ARTIKEL WARGA ]</Badge>
                  <span className="font-mono text-[10px] text-muted">5 MENIT BACA</span>
                </div>
                <CardTitle>Literasi dan Ruang Publik yang Memudar</CardTitle>
                <CardDescription>Dimas Wicaksono // 22 September 2026</CardDescription>
              </CardHeader>
              <CardContent>
                Sebuah tinjauan kritis atas menyempitnya ruang-ruang bertukar pikiran gratis bagi pemuda
                dan pelajar di kota-kota kecil Nusantara.
              </CardContent>
              <CardFooter>
                <span className="text-muted">KATEGORI: SOSIAL</span>
                <span className="font-bold underline cursor-pointer hover:text-muted">
                  BACA SELENGKAPNYA →
                </span>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 5. EMPTY STATE FOLIO */}
        <section className="mb-16 space-y-6">
          <div className="font-mono text-xs uppercase tracking-widest font-bold border-b border-foreground pb-2">
            05 // EMPTY STATE FOLIO
          </div>

          <EmptyState
            title="Belum Ada Naskah di Arsip Ini"
            description="Lembaran pertama menanti goresan penamu. Kirimkan resensi, esai, atau opini seputar kegiatan literasi Blora."
            actionLabel="KIRIM TULISAN SEKARANG"
            onAction={() => alert('Mengarah ke formulir tulis naskah')}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
