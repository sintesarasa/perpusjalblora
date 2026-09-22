# DESIGN SYSTEM — Perpusjal v3 (Stark Monochrome Editorial Gazette)

**Status:** Official Approved Baseline · **Versi:** 2.1 · **Tanggal:** 22 September 2026  
**Filosofi:** Gazette Sastra Independen / International Typographic Style Meets High-End Literary Press  
**Inspirasi:** *The Paris Review*, *Apartamento*, *Swiss Graphic Design*, & Warisan Sastra Blora (Pramoedya Ananta Toer)  
**Basis Teknis:** Next.js 15 (App Router) + Tailwind CSS + Lucide Icons + TypeScript  

---

## 1. Filosofi & Arah Estetika

### 1.1 Pernyataan Karakter
> **Intelektual, Bermartabat, Swadaya, Abadi.**  
> Perpustakaan Jalanan Blora (Perpusjal) bukan produk SaaS komersial, bukan aplikasi startup penuh ornamen mengkilap, dan bukan portal birokrasi kaku. Perpusjal dirancang selayaknya **gazette literasi cetak independen berkelas dunia**: kontras monokrom absolut, tipografi berskala dramatis, grid asimetris berdisiplin tinggi, dan ruang putih (*whitespace*) yang lapang serta berwibawa.

### 1.2 Pilar Pembentuk Estetika

| Elemen | Karakter Stark Monochrome | Penerapan Nyata di Kode |
|---|---|---|
| **Palet Warna** | Hitam Tinta Murni (`#0A0A0A`) di atas Kertas Cetak Buku Alami (`#F9F9F7`) | Menghadirkan sensasi fisik membaca lembaran buku bermutu tanpa polusi warna |
| **Sudut & Bentuk** | Sudut Tegak 0px (`rounded-none`) mutlak | Menolak estetika "aplikasi rounded" generik; setiap tombol, kartu, input, dan badge bergaris presisi |
| **Garis & Struktur** | Hairline Rules 1px (`#E2E2DB`) & Double Masthead Rule | Disiplin tata letak cetak koran: seksi terpisah tegas oleh batas 1px atau garis ganda masthead |
| **Tipografi** | *Playfair Display* / *Lora* masif + *Inter* jernih + *Monospace* tabular | Kontras ekstrem antara headline editorial berkarakter dan metadata mikro berspasi renggang (`tracking-[0.18em]`) |
| **Site Identity** | Motif Geometris Parallelogram Ganda dari Logo Resmi (`logo-perpus.svg`) | Digunakan konsisten pada favicon (`icon.svg`), loader kinetik (`CustomLoader`), dan stempel edisi (`BrandStamp`) |
| **Indeks & Penomoran** | Penomoran arsip berformat `[ 01 // SASTRA ]` & `[ REGISTRI // 01 ]` | Menghadirkan rasa keteraturan katalog arsip dan jurnal kuratorial |

### 1.3 Larangan Mutlak (*Design Anti-Patterns*)
- ❌ **DILARANG** menggunakan sudut membulat (`rounded-md`, `rounded-xl`, `rounded-full`). Seluruh komponen antarmuka wajib `rounded-none`.
- ❌ **DILARANG** menggunakan bayangan melayang (*drop-shadow* tebal berwarna-warni atau buram). Kedalaman dibangun lewat hairline border dan perbedaan warna permukaan.
- ❌ **DILARANG** menambahkan warna aksen sekunder (merah, biru, hijau, terakota). Seluruh hierarki ditekankan lewat **kontras hitam-putih, ketebalan font, border double, dan inverse fill**.
- ❌ **DILARANG** menggunakan navbar bertingkat (*multi-deck*) yang tebal dan memakan layar. Navbar wajib ramping (*sleek single-tier*), minimalis, dan fungsional.

---

## 2. Palet Token Warna

### 2.1 Token Sistem (Monokrom Murni)

```css
/* Light Mode — Natural Book Paper */
:root {
  --background: #F9F9F7;        /* Kertas cetak buku hangat */
  --foreground: #0A0A0A;        /* Tinta hitam pekat */
  --surface: #FFFFFF;           /* Permukaan kartu & panel */
  --surface-muted: #F2F2EE;     /* Latar sekunder / baris selang-seling */
  --border: #E2E2DB;            /* Garis batas hairline standar */
  --border-hairline: #ECECE6;   /* Garis pemisah ultra-tipis */
  --border-subtle: #D1D1C7;     /* Garis batas fokus / hover */
  --muted: #737373;             /* Teks sekunder & metadata */
}

/* Dark Mode — Obsidian Literary Night */
.dark {
  --background: #0A0A0A;        /* Obsidian hitam mutlak */
  --foreground: #F9F9F7;        /* Tinta kertas terang */
  --surface: #141414;           /* Permukaan panel gelap */
  --surface-muted: #1E1E1E;     /* Latar sekunder */
  --border: #2A2A2A;            /* Batas hairline gelap */
  --border-hairline: #1F1F1F;   /* Batas ultra-tipis */
  --border-subtle: #383838;     /* Batas hover gelap */
  --muted: #8A8A8A;             /* Teks sekunder mode gelap */
}
```

### 2.2 Verifikasi Rasio Kontras (WCAG 2.1 AAA)

| Kombinasi | Rasio Kontras | Status Aksesibilitas |
|---|---|---|
| `foreground` (#0A0A0A) di `background` (#F9F9F7) | **18.4:1** | ✅ Lolos AAA |
| `foreground` (#F9F9F7) di `background` (#0A0A0A) | **18.4:1** | ✅ Lolos AAA (Dark Mode) |
| `muted` (#737373) di `background` (#F9F9F7) | **4.8:1** | ✅ Lolos AA untuk teks mikro |
| `surface` (#FFFFFF) vs `border` (#E2E2DB) | Batas tegas 1px | ✅ Terbaca jelas tanpa bias warna |

### 2.3 Penanda Status Tipografis Simbolik (Tanpa Warna Pelangi)

Perpusjal tidak menggunakan warna hijau/merah/kuning sebagai penanda status. Sesuai prinsip **Stark Monochrome** dan aksesibilitas (A11Y-05), status dikomunikasikan melalui **glif simbolik, teks eksplisit, dan bingkai**:

| Kondisi / Status | Simbol Glif | Format Teks | Representasi Visual |
|---|---|---|---|
| **Koleksi Tersedia** | `●` (bullet terisi) | `[ ● TERSEDIA (3) ]` | Teks hitam di atas border hairline |
| **Sisa Satu Eksemplar** | `◐` (lingkaran separuh) | `[ ◐ SISA 1 EKSEMPLAR ]` | Border hitam tegas 2px |
| **Sedang Dipinjam** | `○` (lingkaran kosong) | `[ ○ SEDANG DIPINJAM ]` | Teks muted + border hairline |
| **Baca di Tempat** | `◓` (lingkaran atas) | `[ ◓ BACA DI TEMPAT ]` | Border putus-putus (*dashed*) |
| **Jatuh Tempo / Terlambat**| `▲` (segitiga solid) | `[ ▲ TERLAMBAT 3 HARI ]` | Kotak inverse hitam solid (`bg-foreground text-background`) |
| **Menunggu Review** | `◌` (lingkaran titik) | `[ ◌ MENUNGGU REVIEW ]` | Teks muted berbingkai |
| **Terbit / Disetujui** | `■` (persegi solid) | `[ ■ TERBIT ]` | Badge hitam tegas |

---

## 3. Identitas Visual & Geometri Logo

### 3.1 Geometri Logo Resmi (`logo-perpus.svg`)
Logo Perpusjal Blora mengusung tipografi konstruktivis dengan sudut miring khas (*slanted title*) dan lambang utama berupa **dua poligon jajar genjang condong paralel**:
```svg
<polygon points="5,20 15,20 10,80 0,80" />
<polygon points="18,20 28,20 23,80 13,80" />
```
Motif ini melambangkan:
1. Deretan buku yang berbaris miring di atas rak lapak jalanan.
2. Dinamika gerakan literasi akar rumput yang bergerak maju.

### 3.2 Komponen Identitas Inti

1. **Favicon (`apps/web/app/icon.svg`):**
   - Vektor poligon jajar genjang ganda berlatar hitam pekat (`#0A0A0A`) dengan rasio kontras tajam.
2. **Kinetic Custom Loader (`CustomLoader`):**
   - Komponen loader kinetik berbasis animasi pergeseran dan denyut dua bar poligon logo yang bergantian, disertai label teks monospace uppercase (*"MEMUAT DATA..."*).
3. **Brand Stamp (`BrandStamp`):**
   - Cap stempel penerbit editorial retro-modern yang mencantumkan nama kolektif, nomor edisi (`EDISI NO. 03` / `VOL. III`), dan tahun pendirian (`BLORA // 2026`).
4. **Reading Scroll Progress (`ScrollProgress`):**
   - Batang penunjuk progres membaca 1px di puncak layar yang bergerak halus mengikuti scroll artikel pembaca.

---

## 4. Tipografi & Hirarki Teks

### 4.1 Keluarga Huruf (Font Stack)

| Peran | Nama Font | Bobot | Karakteristik |
|---|---|---|---|
| **Display / Editorial** | *Playfair Display* / *Lora* | 400 (Regular), 600 (Semibold), Italic | Elegan, berwibawa, tajam, mengedepankan tradisi cetak sastra |
| **Antarmuka / Body** | *Inter* | 400 (Regular), 500 (Medium), 600 (Semibold) | Netral, jernih, sangat mudah dibaca pada layar digital |
| **Metadata / Arsip** | `ui-monospace, SFMono-Regular, Menlo, monospace` | 500, 600, 700 (Tabular Numbers) | Tegas, mekanis, memberikan kesan dokumentasi arsip resmi |

### 4.2 Skala & Hirarki Tipografi

| Token | Ukuran | Line-Height | Tracking | Font | Penggunaan |
|---|---|---|---|---|---|
| `display-hero` | 44px–64px | 1.05 | `-0.04em` | Serif 600 | Headline utama beranda & tajuk editorial besar |
| `h1` | 32px–40px | 1.15 | `-0.03em` | Serif 400/600 | Judul artikel, nama buku, judul form auth |
| `h2` | 24px–28px | 1.25 | `-0.02em` | Serif 600 | Sub-seksi editorial, judul bab |
| `h3` | 18px–20px | 1.35 | `0` | Sans 600 | Judul kartu, kelompok katalog |
| `body-editorial` | 18px–20px | **1.8** | `0` | Serif 400 | Isi esai, surat pembaca, review buku (maks 68ch) |
| `body-ui` | 14px–15px | 1.6 | `0` | Sans 400 | Teks antarmuka, deskripsi, form teks |
| `mono-kicker` | 10px–11px | 1.2 | `0.18em`–`0.25em` | Mono 600 | Label kategori, penanda edisi, kicker bab |
| `mono-meta` | 11px–12px | 1.4 | `0.05em` | Mono 400 | Tanggal, nomor ISBN, jam operasional lapak |

### 4.3 Ornamen Tipografi Editorial
- **Drop Cap Sastra:** Paragraf pembuka artikel utama memakai huruf pertama berukuran besar setinggi 3 baris (`float-left text-5xl font-serif pr-3 pt-1`).
- **Double Masthead Rule:** Garis horizontal ganda khas koran broadsheet (`border-t-2 border-b border-foreground h-1.5 my-6`).
- **Kutipan Blok Menjorok:** Blok kutipan memakai font *Lora Italic* dengan tanda kutip ganda berukuran besar dan garis vertikal tipis di sebelah kiri.

---

## 5. Spasi, Garis, & Struktur Grid

### 5.1 Sudut (Border Radius)
```text
SELURUH ELEMEN: rounded-none (0px)
```
Tidak ada toleransi untuk radius sudut. Semua tombol, input, modal dialog, popover, badge, dan kartu berpotongan tegak lurus 90 derajat.

### 5.2 Garis & Batas (Rules & Hairlines)
- **Hairline Border (1px):** Batas standar antar seksi, batas input form, dan kartu katalog.
- **Thick Rule (2px / 3px):** Pembatas tajuk utama atau elemen fokus aktif.
- **Dashed Hairline:** Penanda area drop-file atau koleksi khusus baca-di-tempat.

### 5.3 Skala Spasi (Grid Sistem 8pt)
```text
2px (0.5) · 4px (1) · 8px (2) · 12px (3) · 16px (4) · 24px (6) · 32px (8) · 48px (12) · 64px (16) · 96px (24)
```

---

## 6. Layout Standar

### 6.1 Navbar Ramping & Minimalis (`Header`)
- **Tinggi Kompak:** `h-14` (56px) di mobile, `h-16` (64px) di desktop (bukan navbar bertingkat tebal).
- **Struktur:**
  - Sisi Kiri: Logo resmi Perpusjal Blora (vektor responsif tema).
  - Sisi Tengah: Tautan navigasi utama bertipografi sans jernih (*Koleksi*, *Warta*, *Kegiatan*, *Tentang*).
  - Sisi Kanan: Input pencarian cepat ringkas, toggle tema monokrom, dan tombol Masuk/Profil.
  - Sisi Bawah: Garis hairline dengan indikator `ScrollProgress` terintegrasi.

### 6.2 Split-Screen Editorial (Halaman Autentikasi & Registri)
- **Pane Kiri (Editorial Desktop, 42% lebar):**
  - Latar obsidian murni (`#0A0A0A`) dengan teks kertas hangat (`#F9F9F7`).
  - Logo resmi Perpusjal (invert).
  - Kutipan sastra manifesto: *"Membaca bukan sekadar melahap aksara di atas kertas, melainkan jalan pulang bagi nurani yang merdeka."*
  - Cap stempel grafis resmi (`BrandStamp`).
  - Kolofon: *Edisi Digital Vol. III • Blora, Jawa Tengah*.
- **Pane Kanan (Formulir Presisi):**
  - Formulir tajam tanpa sudut bulat, label monospace uppercase, toggle sandi, dan banner error kontras tinggi.

### 6.3 Halaman Broadsheet Koran (Beranda & Warta)
- **Top Dateline:** Koordinat geografis Blora, volume edisi, dan penanggalan masehi/jawa.
- **Lead Article:** Kolom utama asimetris dengan Drop Cap dan ringkasan editorial.
- **Daftar Buku:** Etalase buku dalam bingkai hairline mirip etalase perpustakaan jalanan.
- **Ledger Footer:** Kolofon percetakan dan jadwal serah terima lapak Alun-Alun / Basecamp berformat tabel ledger akuntansi klasik.

---

## 7. Katalog Komponen UI

### 7.1 Komponen Primitif

| Komponen | Path Berkas | Karakteristik Utama |
|---|---|---|
| `Button` | [`apps/web/components/ui/button.tsx`](file:///Users/sintesarasa/Documents/perpusjalblora/apps/web/components/ui/button.tsx) | `rounded-none`, huruf kapital monospace, efek inverse hover tajam, loading pulse indikator. |
| `Input` | [`apps/web/components/ui/input.tsx`](file:///Users/sintesarasa/Documents/perpusjalblora/apps/web/components/ui/input.tsx) | `rounded-none`, border hairline, label monospace mikro, slot ikon kanan (lihat kata sandi), pesan error kontras. |
| `Card` | [`apps/web/components/ui/card.tsx`](file:///Users/sintesarasa/Documents/perpusjalblora/apps/web/components/ui/card.tsx) | Bingkai hairline 1px, latar belakang kertas murni, header bergaris pemisah tegas. |
| `Badge` | [`apps/web/components/ui/badge.tsx`](file:///Users/sintesarasa/Documents/perpusjalblora/apps/web/components/ui/badge.tsx) | Format tag arsip desimal: `[ 01 // SASTRA ]`, `[ UTAMA ]`, `[ ARSIP ]`. |
| `StatusPill` | [`apps/web/components/ui/status-pill.tsx`](file:///Users/sintesarasa/Documents/perpusjalblora/apps/web/components/ui/status-pill.tsx) | Glif tipografis simbolik (`●`, `○`, `◐`, `▲`) tanpa warna mencolok. |
| `EmptyState` | [`apps/web/components/ui/empty-state.tsx`](file:///Users/sintesarasa/Documents/perpusjalblora/apps/web/components/ui/empty-state.tsx) | Kotak folio sastra dengan kutipan hangat dan tombol CTA jelas. |

### 7.2 Komponen Khusus Identitas

| Komponen | Path Berkas | Fungsi |
|---|---|---|
| `Logo` & `LogoIcon` | [`apps/web/components/logo.tsx`](file:///Users/sintesarasa/Documents/perpusjalblora/apps/web/components/logo.tsx) | Logo resmi berbasis vektor SVG yang adaptif terhadap mode terang dan gelap. |
| `CustomLoader` | [`apps/web/components/ui/custom-loader.tsx`](file:///Users/sintesarasa/Documents/perpusjalblora/apps/web/components/ui/custom-loader.tsx) | Animasi kinetik dua poligon paralel jajar genjang dengan indikator label teks. |
| `BrandStamp` | [`apps/web/components/ui/brand-stamp.tsx`](file:///Users/sintesarasa/Documents/perpusjalblora/apps/web/components/ui/brand-stamp.tsx) | Cap stempel penanda edisi resmi Perpusjal Blora. |
| `ScrollProgress` | [`apps/web/components/ui/scroll-progress.tsx`](file:///Users/sintesarasa/Documents/perpusjalblora/apps/web/components/ui/scroll-progress.tsx) | Garis baca 1px di bagian atas layar pelacak kemajuan membaca. |

---

## 8. Panduan Nada & Bahasa (Editorial Tone)

1. **Sapaan Akrab & Bersahaja:** Gunakan kata **"kamu"** alih-alih "Anda" untuk mencerminkan kehangatan komunitas lapak jalanan yang egaliter.
2. **Kamus Istilah UI:**
   - *Submit / Simpan* $\rightarrow$ **Kirim / Simpan Perubahan**
   - *Login / Register* $\rightarrow$ **Masuk ke Ruang Baca / Daftarkan Diri**
   - *Catalog* $\rightarrow$ **Katalog Koleksi Jalanan**
   - *Borrow* $\rightarrow$ **Pinjam Buku**
   - *Due Date* $\rightarrow$ **Jatuh Tempo Pengembalian**
   - *Overdue* $\rightarrow$ **Terlambat Dikembalikan**
   - *Articles / Blog* $\rightarrow$ **Warta & Esai Literasi**
   - *Reader Letter* $\rightarrow$ **Surat dari Pembaca**
3. **Pesan Kegagalan:** Bersifat mendidik dan santun tanpa menyalahkan pengguna.
   - Contoh: *"Periksa kembali kata sandimu. Akun akan terkunci sementara jika gagal 5 kali berturut-turut demi menjaga keamanan data pembaca."*

---

## 9. Checklist Verifikasi Implementasi Desain

Setiap fitur atau komponen baru yang dibangun dalam Perpusjal v3 **wajib memenuhi kriteria berikut**:

- [ ] **0px Radius:** Tidak ada class `rounded-sm`, `rounded-md`, `rounded-lg`, atau sejenisnya.
- [ ] **Monokrom Murni:** Tidak ada penambahan warna aksen (merah, biru, hijau, dll). Status diwakili oleh simbol tipografis, bingkai, atau inverse.
- [ ] **Hairline Consistency:** Garis pemisah menggunakan class `border-border` atau `border-border-hairline` (1px).
- [ ] **Typographic Hierarchy:** Judul memakai font serif (*Playfair/Lora*), label mikro memakai monospace dengan letter spacing renggang (`tracking-wider` / `tracking-widest`).
- [ ] **Aksesibilitas Kontras:** Seluruh teks dan kontrol lolos uji kontras minimum WCAG 2.1 AA (4.5:1 untuk teks normal, 3:1 untuk teks besar).
- [ ] **Mode Gelap:** Tampil sempurna pada tema terang (`#F9F9F7`) dan tema gelap obsidian (`#0A0A0A`).
