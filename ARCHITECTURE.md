# ARCHITECTURE — Perpusjal v3

**Status:** Baseline · **Versi:** 1.0 · **Tanggal:** 22 September 2026
**Acuan:** `PRD.md` v3.0 §24
**Pembaca sasaran:** developer (saat ini 1 orang), calon kontributor, dan siapa pun yang mengambil alih proyek ini kelak.

> Dokumen ini menjawab **bagaimana** sistem dibangun. Untuk **apa** dan **mengapa**, baca `PRD.md`.

---

## Daftar Isi

1. [Prinsip Arsitektur](#1-prinsip-arsitektur)
2. [Gambaran Sistem](#2-gambaran-sistem)
3. [Struktur Repositori](#3-struktur-repositori)
4. [Arsitektur Backend (Express)](#4-arsitektur-backend-express)
5. [Arsitektur Frontend (Next.js)](#5-arsitektur-frontend-nextjs)
6. [Autentikasi & Otorisasi](#6-autentikasi--otorisasi)
7. [Siklus Hidup Request](#7-siklus-hidup-request)
8. [Transaksi & Konkurensi](#8-transaksi--konkurensi)
9. [Background Jobs & Cron](#9-background-jobs--cron)
10. [Media & Upload](#10-media--upload)
11. [Email](#11-email)
12. [Caching & Revalidasi](#12-caching--revalidasi)
13. [Penanganan Error & Logging](#13-penanganan-error--logging)
14. [Konfigurasi & Environment](#14-konfigurasi--environment)
15. [Testing](#15-testing)
16. [Deployment & CI/CD](#16-deployment--cicd)
17. [Observability](#17-observability)
18. [Backup & Disaster Recovery](#18-backup--disaster-recovery)
19. [Performa & Skalabilitas](#19-performa--skalabilitas)
20. [Rencana Evolusi](#20-rencana-evolusi)

---

## 1. Prinsip Arsitektur

| # | Prinsip | Konsekuensi praktis |
|---|---|---|
| 1 | **Logika bisnis tidak boleh terikat framework** | Aturan peminjaman hidup di `service`, bukan di controller Express atau Server Action Next.js. Pindah framework = ganti lapisan tipis saja |
| 2 | **Server adalah satu-satunya sumber kebenaran** | Role, status, harga waktu, kelayakan pinjam — semuanya dihitung server. Klien hanya menampilkan |
| 3 | **Boring technology** | Solo developer tidak punya anggaran waktu untuk teknologi eksperimental. PostgreSQL, REST, cookie session |
| 4 | **Optimalkan untuk dibaca ulang 6 bulan lagi** | Nama eksplisit, sedikit abstraksi, komentar pada keputusan yang tidak jelas |
| 5 | **Gagal dengan berisik di server, gagal dengan lembut di klien** | Error masuk Sentry lengkap; pengguna melihat pesan manusiawi |
| 6 | **Satu perintah untuk menjalankan semuanya** | `pnpm dev` menyalakan web + api + db lokal |
| 7 | **Setiap keputusan menyimpang dicatat** | Tambahkan ADR di `PRD.md` §24.4 atau `docs/adr/` |

---

## 2. Gambaran Sistem

### 2.1 Diagram Konteks

```mermaid
flowchart TB
    subgraph Klien
        BR["🌐 Browser Desktop"]
        MO["📱 Browser Mobile"]
    end

    subgraph Vercel["Vercel — apps/web"]
        NX["Next.js App Router<br/>Server Components · Route Handlers"]
    end

    subgraph Railway["Railway — apps/api"]
        EX["Express REST API<br/>Zod · Prisma"]
        CJ["Cron Runner"]
        PG[("PostgreSQL 16")]
    end

    subgraph Eksternal
        CD["Cloudinary"]
        RS["Resend"]
        SE["Sentry"]
    end

    BR --> NX
    MO --> NX
    NX -->|"fetch server-side<br/>+ internal token"| EX
    BR -.->|"signed upload langsung"| CD
    EX --> PG
    CJ --> PG
    CJ --> RS
    EX --> RS
    EX --> SE
    NX --> SE
    NX --> CD
```

### 2.2 Tanggung Jawab Tiap Bagian

| Komponen | Tanggung jawab | Bukan tanggung jawabnya |
|---|---|---|
| **apps/web** | Rendering, routing publik, SEO, sesi pengguna, form, pengalaman UI | Aturan bisnis, akses database langsung |
| **apps/api** | Aturan bisnis, validasi, otorisasi, akses database, pengiriman email, cron | Rendering HTML, SEO |
| **packages/types** | Skema Zod & tipe bersama antara web dan api | Logika |
| **PostgreSQL** | Sumber kebenaran data | — |
| **Cloudinary** | Penyimpanan, transformasi, dan CDN gambar | Autorisasi bisnis |
| **Resend** | Pengiriman email transaksional | Penjadwalan (itu tugas cron) |

### 2.3 Mengapa Dua Aplikasi?

Lihat **ADR-003** di PRD. Ringkasnya: API terpisah memudahkan pemakaian ulang di masa depan dan memisahkan cron dari frontend, **tetapi** ini risiko jadwal terbesar bagi solo developer.

**Exit ramp (penting):** jika di akhir Sprint 2 waktu yang habis untuk urusan infrastruktur melebihi 30%, pindahkan API ke Route Handlers Next.js. Karena seluruh logika ada di `service` + `repository` yang tidak mengenal Express, pemindahan hanya berarti menulis ulang lapisan `controller` menjadi Route Handler. Jangan menunda keputusan ini lewat Sprint 3.

---

## 3. Struktur Repositori

Monorepo dengan **pnpm workspaces** + **Turborepo**.

```text
perpusjal/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx                  # Home
│   │   │   │   ├── artikel/
│   │   │   │   ├── buku/
│   │   │   │   ├── kegiatan/
│   │   │   │   ├── surat-pembaca/
│   │   │   │   ├── kontributor/
│   │   │   │   ├── u/[username]/
│   │   │   │   ├── cari/
│   │   │   │   └── [slug]/                   # halaman CMS
│   │   │   ├── (auth)/
│   │   │   │   ├── masuk/ daftar/ lupa-password/ reset-password/ verifikasi/
│   │   │   ├── dashboard/
│   │   │   ├── kurator/
│   │   │   ├── admin/
│   │   │   ├── api/
│   │   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   │   ├── revalidate/route.ts       # webhook dari API
│   │   │   │   └── og/route.tsx              # OG image dinamis
│   │   │   ├── sitemap.ts robots.ts rss.xml/route.ts
│   │   │   ├── layout.tsx error.tsx not-found.tsx
│   │   ├── components/
│   │   │   ├── ui/                           # shadcn primitives
│   │   │   ├── article/ book/ loan/ event/ comment/
│   │   │   ├── editor/                       # TipTap
│   │   │   └── layout/                       # header, footer, nav
│   │   ├── lib/
│   │   │   ├── api-client.ts                 # pemanggil API terpusat
│   │   │   ├── auth.ts                       # konfigurasi Auth.js
│   │   │   ├── session.ts                    # helper getSession/requireRole
│   │   │   └── format.ts                     # tanggal, angka, slug
│   │   ├── hooks/
│   │   ├── styles/globals.css
│   │   └── middleware.ts                     # proteksi route
│   │
│   └── api/
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/       article/     book/        loan/
│       │   │   ├── comment/    event/       letter/      badge/
│       │   │   ├── category/   notification/ page/       media/
│       │   │   ├── search/     user/        admin/       health/
│       │   │   └── <modul>/
│       │   │       ├── <modul>.controller.ts
│       │   │       ├── <modul>.service.ts
│       │   │       ├── <modul>.repository.ts
│       │   │       ├── <modul>.schema.ts
│       │   │       ├── <modul>.routes.ts
│       │   │       └── <modul>.service.test.ts
│       │   ├── middleware/
│       │   │   ├── authenticate.ts requireRole.ts rateLimit.ts
│       │   │   ├── validate.ts errorHandler.ts requestId.ts
│       │   ├── jobs/
│       │   │   ├── index.ts loans.job.ts articles.job.ts
│       │   │   ├── events.job.ts badges.job.ts cleanup.job.ts
│       │   ├── lib/
│       │   │   ├── prisma.ts mailer.ts cloudinary.ts
│       │   │   ├── logger.ts errors.ts settings.ts
│       │   ├── emails/                       # template React Email
│       │   ├── app.ts
│       │   └── index.ts
│       └── tests/
│
├── packages/
│   ├── types/            # skema Zod + tipe bersama (sumber kebenaran validasi)
│   ├── config/           # eslint, tsconfig, tailwind preset
│   └── utils/            # slugify, readingTime, date (WIB)
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│   ├── PRD.md ARCHITECTURE.md DATABASE-ERD.md DESIGN-SYSTEM.md
│   ├── API-SPEC.md SPRINT-PLAN.md CONTENT-GUIDELINES.md RUNBOOK.md
│   └── adr/
│
├── .github/workflows/ci.yml
├── docker-compose.yml         # PostgreSQL lokal
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 3.1 Aturan Penamaan

| Hal | Konvensi | Contoh |
|---|---|---|
| Folder & file | `kebab-case` | `book-card.tsx` |
| Komponen React | `PascalCase` | `BookCard` |
| Fungsi & variabel | `camelCase` | `calculateDueDate` |
| Konstanta | `SCREAMING_SNAKE` | `MAX_ACTIVE_LOANS` |
| Tipe & interface | `PascalCase`, tanpa prefiks `I` | `LoanEligibility` |
| Route publik | Bahasa Indonesia | `/buku`, `/kegiatan` |
| Field database & API | `camelCase` Inggris | `availableCopies` |
| Enum value | `SCREAMING_SNAKE` Inggris | `PENDING_REVIEW` |

> **Catatan penting:** URL memakai bahasa Indonesia (untuk pengguna), sementara kode dan data memakai bahasa Inggris (untuk developer). Jangan mencampur.

---

## 4. Arsitektur Backend (Express)

### 4.1 Lapisan

```mermaid
flowchart LR
    RT["routes"] --> CT["controller<br/>HTTP in/out"]
    CT --> SV["service<br/>aturan bisnis"]
    SV --> RP["repository<br/>Prisma"]
    RP --> DB[("PostgreSQL")]
    SV -.-> MA["mailer"]
    SV -.-> NO["notification service"]
```

**Aturan keras:**

1. `controller` **tidak boleh** memanggil Prisma.
2. `service` **tidak boleh** mengenal objek `Request`/`Response`.
3. `repository` **tidak boleh** memuat aturan bisnis (tanpa `if` kelayakan).
4. Service boleh memanggil service lain; repository tidak boleh memanggil repository lain.

Inilah yang membuat aturan seperti "tidak boleh pinjam kalau ada tunggakan" bisa diuji tanpa menyalakan server dan tanpa menyentuh HTTP.

### 4.2 Anatomi Sebuah Modul

```ts
// loan.controller.ts — tipis, hanya menerjemahkan HTTP
export const createLoan = asyncHandler(async (req, res) => {
  const input = createLoanSchema.parse(req.body);
  const loan = await loanService.requestLoan(req.user!.id, input);
  res.status(201).json({ data: loan });
});
```

```ts
// loan.service.ts — di sinilah seluruh aturan hidup
export async function requestLoan(userId: string, input: CreateLoanInput) {
  const eligibility = await checkBorrowEligibility(userId, input.bookId);
  if (!eligibility.allowed) {
    throw new BusinessError(eligibility.code, eligibility.message);
  }
  return prisma.$transaction(async (tx) => {
    const book = await loanRepository.lockBook(tx, input.bookId);   // FOR UPDATE
    if (book.availableCopies < 1) throw new BusinessError("BOOK_UNAVAILABLE", "…");
    await loanRepository.decrementAvailable(tx, book.id);
    const loan = await loanRepository.create(tx, { userId, ...input });
    await notificationService.notifyAdmins("NEW_LOAN_REQUEST", loan);
    return loan;
  });
}
```

```ts
// loan.repository.ts — hanya kueri
export function lockBook(tx: Tx, bookId: string) {
  return tx.$queryRaw`SELECT * FROM "Book" WHERE id = ${bookId} FOR UPDATE`;
}
```

### 4.3 Urutan Middleware

```text
requestId
  → helmet (security headers)
  → cors (origin allowlist)
  → express.json({ limit: '1mb' })
  → pinoHttp (logging)
  → rateLimit global
  → authenticate        (mengisi req.user bila ada sesi, tidak menolak)
  → [router]
      → rateLimit khusus endpoint
      → requireAuth / requireRole
      → validate(schema)
      → controller
  → notFoundHandler
  → errorHandler        (harus paling akhir)
```

### 4.4 Kelas Error

```ts
class AppError extends Error { constructor(public status: number, public code: string, message: string, public details?: unknown) }
class ValidationError extends AppError   // 400  VALIDATION_ERROR
class UnauthorizedError extends AppError // 401  UNAUTHORIZED
class ForbiddenError extends AppError    // 403  FORBIDDEN
class NotFoundError extends AppError     // 404  NOT_FOUND
class ConflictError extends AppError     // 409  CONFLICT
class BusinessError extends AppError     // 422  <kode bisnis>
class RateLimitError extends AppError    // 429  RATE_LIMITED
```

`errorHandler` menerjemahkan seluruhnya menjadi format respons tunggal (lihat `API-SPEC.md` §2.4), mencatat ke Sentry bila status ≥ 500, dan **tidak pernah** membocorkan stack trace ke klien.

---

## 5. Arsitektur Frontend (Next.js)

### 5.1 Server Component sebagai Default

`"use client"` hanya dipakai ketika komponen benar-benar butuh: state lokal, event handler, browser API, atau library klien (TipTap).

| Bagian | Jenis | Alasan |
|---|---|---|
| Daftar & detail artikel | Server | SEO, data statis |
| Katalog buku (server-rendered) | Server | Filter lewat URL, bukan state |
| Tombol pinjam | Client | Butuh interaksi & optimistic state |
| Editor TipTap | Client + `next/dynamic` | Berat, hanya di dashboard |
| Thread komentar | Client | Interaktif, dimuat lazily |
| Dashboard admin | Campuran | Tabel server, aksi client |

### 5.2 Pola Pengambilan Data

```mermaid
flowchart TD
    A["Server Component"] -->|"apiClient.get() + token internal"| B["Express API"]
    C["Client Component"] -->|"mutasi"| D["Route Handler / Server Action"]
    D --> B
    B --> E[("DB")]
```

**Aturan:** browser **tidak pernah** memanggil `apps/api` secara langsung. Seluruh panggilan melewati Next.js, yang menambahkan kredensial sesi dan token layanan internal. Ini menghilangkan kebutuhan CORS permisif dan mencegah token bocor ke klien.

### 5.3 `lib/api-client.ts`

Satu pintu untuk semua panggilan API:

```ts
export async function apiFetch<T>(path: string, init?: ApiInit): Promise<T> {
  const res = await fetch(`${process.env.API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": process.env.INTERNAL_API_TOKEN!,
      ...(init?.userId ? { "X-User-Id": init.userId } : {}),
      ...init?.headers,
    },
    next: init?.revalidate !== undefined ? { revalidate: init.revalidate } : undefined,
  });
  if (!res.ok) throw await toApiError(res);
  return res.json();
}
```

Keuntungan: retry, timeout, logging, dan penanganan error terpusat di satu tempat.

### 5.4 Struktur Route Group

- `(public)` — layout dengan header/footer publik, metadata SEO penuh.
- `(auth)` — layout minimal terpusat, `noindex`.
- `dashboard` / `kurator` / `admin` — layout dengan sidebar, `noindex`, dijaga `middleware.ts` **dan** pemeriksaan di setiap Server Component.

> Middleware saja tidak cukup sebagai otorisasi. Middleware adalah kenyamanan navigasi; otorisasi sesungguhnya ada di API.

### 5.5 Penanganan State Klien

| Kebutuhan | Solusi |
|---|---|
| Filter, paginasi, tab | **URL search params** (bisa di-bookmark & di-share) |
| Form | React Hook Form + Zod resolver dari `packages/types` |
| Draft editor | State lokal + autosave ke API |
| UI global (drawer, tema, toast) | Zustand (kecil) + next-themes |
| Data server | Fetch di Server Component; hindari client cache kecuali untuk komentar & notifikasi |

---

## 6. Autentikasi & Otorisasi

### 6.1 Alur Sesi

```mermaid
sequenceDiagram
    actor U as Pengguna
    participant W as Next.js (Auth.js)
    participant A as Express API
    participant D as PostgreSQL

    U->>W: POST /masuk (email, password)
    W->>A: POST /auth/login
    A->>D: cari user, verifikasi bcrypt
    D-->>A: user valid
    A->>D: buat Session (tokenHash, expiresAt)
    A-->>W: { user, sessionToken }
    W-->>U: Set-Cookie httpOnly secure sameSite=lax
    Note over U,W: Request berikutnya
    U->>W: GET /dashboard (cookie terkirim)
    W->>W: getSession() → verifikasi & ambil user
    W->>A: GET /me/loans (X-Internal-Token + X-User-Id)
    A->>A: authenticate → requireRole
    A->>D: kueri terbatas pada userId
    A-->>W: data
```

### 6.2 Kepercayaan Antar-Layanan

- Express **tidak** mempercayai `X-User-Id` begitu saja. Header itu hanya diterima jika `X-Internal-Token` cocok dengan rahasia bersama, dan permintaan berasal dari origin yang diizinkan.
- Untuk endpoint yang dipanggil langsung oleh klien (jika suatu saat ada), Express memverifikasi cookie sesi sendiri terhadap tabel `Session`.
- Token sesi disimpan **ter-hash** (SHA-256) di database. Kebocoran dump database tidak langsung memberi akses sesi.

### 6.3 Implementasi RBAC

```ts
// middleware/requireRole.ts
const RANK: Record<Role, number> = { USER: 1, KURATOR: 2, ADMIN: 3 };

export const requireRole = (min: Role) => (req, _res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  if (RANK[req.user.role] < RANK[min]) return next(new ForbiddenError());
  next();
};
```

Untuk kepemilikan sumber daya (mis. mengedit artikel sendiri), pemeriksaan dilakukan di **service**, bukan middleware, karena butuh data:

```ts
assertCanEditArticle(user, article);  // melempar ForbiddenError / NotFoundError
```

**Aturan kebocoran informasi:** untuk sumber daya privat milik orang lain, kembalikan **404**, bukan 403 — agar keberadaannya tidak terkonfirmasi (lihat PRD FR-RBAC-03).

### 6.4 Peta Kontrol Akses (implementasi)

| Endpoint | Middleware | Pemeriksaan tambahan di service |
|---|---|---|
| `POST /articles` | `requireAuth` | `requireVerifiedEmail` |
| `PATCH /articles/:id` | `requireAuth` | pemilik **dan** status ∈ {DRAFT, REVISION} |
| `POST /articles/:id/approve` | `requireRole(KURATOR)` | bukan penulis sendiri (BR-CUR-01) |
| `POST /loans` | `requireAuth` | `checkBorrowEligibility` (BR-LOAN-01…12) |
| `POST /loans/:id/approve` | `requireRole(ADMIN)` | status = PENDING |
| `PATCH /admin/users/:id/role` | `requireRole(ADMIN)` | bukan menurunkan admin terakhir (BR-ADM-02) |

---

## 7. Siklus Hidup Request

Contoh: pengguna membuka `/buku/bumi-manusia`.

```mermaid
sequenceDiagram
    participant B as Browser
    participant V as Vercel Edge
    participant S as Server Component
    participant A as Express
    participant D as PostgreSQL

    B->>V: GET /buku/bumi-manusia
    V->>V: cek cache ISR (60s)
    alt cache hangat
        V-->>B: HTML dari cache
    else cache dingin / basi
        V->>S: render
        S->>A: GET /books/bumi-manusia (revalidate 60)
        A->>D: SELECT book + copies + kategori
        D-->>A: baris
        A-->>S: JSON
        S-->>V: HTML + RSC payload
        V-->>B: HTML
    end
    B->>V: (klien) GET /buku/bumi-manusia/availability
    V->>A: proxy, no-store
    A-->>B: ketersediaan real-time untuk tombol pinjam
```

Pola ini dipakai di seluruh halaman detail: **badan halaman boleh basi sedikit, tetapi angka ketersediaan dan tombol aksi selalu segar.**

---

## 8. Transaksi & Konkurensi

### 8.1 Masalah Inti

Dua pengguna menekan "Pinjam" pada buku dengan sisa satu eksemplar dalam selang milidetik. Tanpa penanganan, `availableCopies` bisa menjadi −1 dan dua orang datang ke lapak untuk buku yang sama.

### 8.2 Solusi

```ts
await prisma.$transaction(async (tx) => {
  // 1. Kunci baris buku — pemohon kedua menunggu di sini
  const [book] = await tx.$queryRaw<Book[]>`
    SELECT * FROM "Book" WHERE id = ${bookId} FOR UPDATE`;

  // 2. Periksa setelah kunci didapat, bukan sebelumnya
  if (book.availableCopies < 1) throw new BusinessError("BOOK_UNAVAILABLE", "…");

  // 3. Mutasi
  await tx.book.update({ where: { id: bookId }, data: { availableCopies: { decrement: 1 } } });
  const loan = await tx.loan.create({ data: { ... } });

  return loan;
}, { isolationLevel: "ReadCommitted", timeout: 8000 });
```

**Pertahanan berlapis:**

| Lapis | Mekanisme |
|---|---|
| 1 | `SELECT … FOR UPDATE` pada `Book` (DI-02) |
| 2 | Check constraint `availableCopies >= 0` (DI-03) |
| 3 | Partial unique index: satu pinjaman aktif per (user, book) (DI-04) |
| 4 | Job rekonsiliasi harian membandingkan hitungan dengan `BookCopy` nyata (DI-09) |

### 8.3 Daftar Operasi yang Wajib Transaksional

| Operasi | Yang berubah bersama |
|---|---|
| Ajukan pinjam | `Loan` dibuat + `Book.availableCopies--` |
| Tolak / batal / kedaluwarsa | `Loan.status` + `Book.availableCopies++` |
| Serah terima | `Loan` → BORROWED + `BookCopy` → BORROWED + `dueDate` |
| Pengembalian | `Loan` → RETURNED + `BookCopy` → AVAILABLE/DAMAGED/LOST + `Book.availableCopies++` (kecuali rusak/hilang) + `Book.borrowCount++` |
| Daftar event | `EventRegistration` + hitung kuota + kemungkinan `Event.status` → FULL |
| Batal event | Registrasi → CANCELLED + promosi antrean pertama |
| Terbitkan artikel | `Article.status` + `publishedAt` + `ArticleRevision` + pemicu badge |

---

## 9. Background Jobs & Cron

### 9.1 Penjadwalan

`node-cron` di dalam proses API. Untuk skala Perpusjal ini cukup dan tidak menambah layanan.

```ts
// jobs/index.ts
cron.schedule("0 7 * * *", runDailyJobs,       { timezone: "Asia/Jakarta" });
cron.schedule("*/10 * * * *", publishScheduled,{ timezone: "Asia/Jakarta" });
cron.schedule("0 3 * * *", runNightlyCleanup,  { timezone: "Asia/Jakarta" });
```

### 9.2 Daftar Job

| Job | Jadwal | Isi | Referensi PRD |
|---|---|---|---|
| `markOverdueLoans` | 07:00 harian | `BORROWED` lewat `dueDate` → `OVERDUE` | §6.11 J1 |
| `sendDueReminders` | 07:00 harian | H-2 dan H-0 | J2 |
| `sendOverdueReminders` | 07:00 harian | H+1, H+3, H+7 | J3 |
| `applyBorrowSuspension` | 07:00 harian | Terlambat ≥14 hari → suspend 30 hari | J4, BR-LOAN-07 |
| `expireApprovedLoans` | 07:00 harian | Lewat `pickupDeadline` → `EXPIRED`, lepas hold | J5 |
| `publishScheduledArticles` | tiap 10 menit | `SCHEDULED` → `PUBLISHED` + revalidasi | J6, AC-ART-04 |
| `archiveStaleRevisions` | 07:00 harian | `REVISION` diam >30 hari → `ARCHIVED` | J7 |
| `deleteUnverifiedAccounts` | 03:00 harian | Belum verifikasi >7 hari | J8 |
| `completePastEvents` | 07:00 harian | Lewat `endAt` → `COMPLETED` | J9 |
| `sendEventReminders` | 07:00 harian | H-1 | J10 |
| `evaluateBadges` | 07:00 harian | Jaring pengaman evaluasi badge | J11 |
| `reconcileBookCounts` | 03:00 harian | Bandingkan `availableCopies` vs `BookCopy` | DI-09 |
| `expireWaitlistPriority` | tiap jam | Lewat 48 jam → giliran berikutnya | §13.5 |
| `pruneNotifications` | mingguan | Hapus notifikasi >90 hari | FR-NOT-07 |
| `sendCuratorDigest` | 08:00 harian | Ringkasan antrean bila >3 kejadian | FR-NOT-04 |

### 9.3 Aturan Job

**FR-CRON-01 (idempoten).** Setiap job harus aman dijalankan dua kali. Pola yang dipakai: tandai record setelah diproses, bukan menghitung dari waktu saja.

```ts
// Salah: mengirim ulang setiap kali job berjalan
const due = await prisma.loan.findMany({ where: { dueDate: today } });

// Benar: hanya yang belum pernah dikirimi
const due = await prisma.loan.findMany({
  where: { dueDate: today, status: "BORROWED", remindersSent: { none: { type: "DUE_TODAY" } } },
});
```

**Pencatatan.** Setiap eksekusi menulis satu baris: nama job, mulai, durasi, jumlah diproses, jumlah error. Kegagalan satu record tidak boleh menghentikan job — kumpulkan error lalu laporkan.

**Zona waktu.** Seluruh perbandingan tanggal jatuh tempo memakai batas hari **WIB**, sementara penyimpanan tetap UTC (DI-07). Gunakan helper tunggal di `packages/utils/date.ts`; dilarang menghitung tanggal secara ad-hoc.

---

## 10. Media & Upload

### 10.1 Alur Signed Upload

```mermaid
sequenceDiagram
    actor U as Pengguna
    participant W as Next.js
    participant A as Express
    participant C as Cloudinary

    U->>W: pilih gambar
    W->>A: POST /media/signature { folder, type }
    A->>A: cek auth, kuota, tipe yang diizinkan
    A-->>W: { signature, timestamp, apiKey, folder }
    W-->>U: mulai unggah
    U->>C: POST langsung (multipart) + signature
    C-->>U: { publicId, url, width, height }
    U->>W: kirim metadata
    W->>A: POST /media { publicId, url, ... }
    A->>A: simpan baris Media
```

Server tidak pernah meneruskan berkas gambar — hemat bandwidth, memori, dan waktu respons.

### 10.2 Aturan

| Jenis | Ukuran maks | Rasio | Transformasi |
|---|---|---|---|
| Cover artikel | 2 MB | 16:9 | `f_auto,q_auto,w_1200` |
| Gambar dalam artikel | 2 MB | bebas | `f_auto,q_auto,w_1000` |
| Sampul buku | 2 MB | 2:3 | `f_auto,q_auto,w_600` |
| Avatar | 1 MB | 1:1 | 3 ukuran: 40/96/256 |
| Cover event | 2 MB | 16:9 | `f_auto,q_auto,w_1200` |

- Format diterima: `jpg`, `png`, `webp`. Validasi MIME di server, bukan hanya ekstensi.
- Folder Cloudinary: `perpusjal/{env}/{tipe}/{tahun}/`.
- Gambar yatim (tidak terpakai 30 hari) dibersihkan job mingguan setelah konfirmasi admin.
- Permintaan alt text ditampilkan saat menyisipkan gambar (A11Y-03).

---

## 11. Email

### 11.1 Arsitektur

```text
service → notificationService.send(type, user, payload)
              ├── simpan baris Notification (in-app)   [selalu]
              └── jika preferensi mengizinkan → enqueue email
                        └── mailer.send(template, props)  [async, tidak memblokir]
```

**FR-NOT-06:** kegagalan email tidak boleh menggagalkan transaksi bisnis. Approve pinjaman tetap sukses walau Resend sedang mati; kegagalan dicatat dan dicoba ulang maks 3 kali dengan backoff.

### 11.2 Template

Ditulis dengan **React Email** di `apps/api/src/emails/`, satu layout bersama:

```text
BaseLayout
 ├── LoanApproved      ├── LoanDueSoon      ├── LoanOverdue
 ├── LoanExpired       ├── ArticleApproved  ├── ArticleRevision
 ├── ArticleRejected   ├── EventRegistered  ├── EventReminder
 ├── EventCancelled    ├── VerifyEmail      ├── ResetPassword
 └── CuratorDigest
```

Setiap template wajib punya versi teks polos dan tautan berhenti berlangganan untuk notifikasi opsional (FR-NOT-05).

### 11.3 Deliverability

- Domain pengirim terverifikasi dengan **SPF, DKIM, DMARC** sebelum rilis.
- Alamat pengirim: `Perpusjal <halo@perpusjal.or.id>`, balasan ke alamat yang benar-benar dibaca pengurus.
- Hindari kata pemicu spam dan tautan pemendek.
- Uji kirim ke Gmail, Yahoo, dan Outlook sebelum Rilis 1.

---

## 12. Caching & Revalidasi

### 12.1 Strategi per Jenis Data

| Data | Strategi | Nilai |
|---|---|---|
| Home | ISR | 300 detik |
| Daftar artikel | ISR | 300 detik |
| Detail artikel | ISR + on-demand | 60 detik |
| Halaman CMS | ISR | 3600 detik |
| Katalog buku | SSR | tanpa cache (filter dinamis) |
| Detail buku | ISR | 60 detik |
| Ketersediaan buku | Tanpa cache | `no-store` |
| Dashboard & data pribadi | Tanpa cache | `private, no-store` |
| Statistik home | Cache di API | 1 jam |

### 12.2 Revalidasi On-Demand

Saat artikel terbit, diubah, atau diarsipkan, API memanggil webhook Next.js:

```ts
await fetch(`${WEB_URL}/api/revalidate`, {
  method: "POST",
  headers: { "X-Revalidate-Token": REVALIDATE_SECRET },
  body: JSON.stringify({ paths: ["/", "/artikel", `/artikel/${slug}`], tags: ["articles"] }),
});
```

Peristiwa yang memicu revalidasi: artikel terbit/ubah/arsip · buku dipublikasikan/diubah · event terbit/dibatalkan · halaman CMS diperbarui · surat pembaca terbit.

**Catatan:** ketersediaan buku sengaja **tidak** memicu revalidasi halaman, karena akan menyebabkan invalidasi beruntun. Angka ketersediaan diambil klien secara terpisah.

---

## 13. Penanganan Error & Logging

### 13.1 Logging

**Pino** dengan output JSON terstruktur.

```ts
logger.info({ requestId, userId, route, durationMs }, "request selesai");
logger.error({ requestId, err, loanId }, "gagal menyetujui pinjaman");
```

| Level | Dipakai untuk |
|---|---|
| `error` | Kegagalan yang butuh perhatian manusia |
| `warn` | Anomali yang tertangani (email gagal, rate limit tercapai) |
| `info` | Peristiwa bisnis (pinjaman disetujui, artikel terbit) |
| `debug` | Hanya di pengembangan |

**Dilarang masuk log:** password, token sesi, isi email lengkap, nomor telepon. Gunakan redaksi field di konfigurasi Pino.

### 13.2 Correlation ID

Setiap request mendapat `X-Request-Id` (dibuat jika belum ada) yang diteruskan dari Next.js ke Express dan muncul di seluruh log serta di Sentry, sehingga satu keluhan pengguna bisa dilacak lintas layanan.

### 13.3 Kontrak Error di Frontend

```ts
try {
  await apiClient.post("/loans", input);
} catch (e) {
  if (e instanceof ApiError && e.code === "HAS_OVERDUE") {
    toast.error("Ada buku yang belum kamu kembalikan…");   // microcopy PRD §33.2
  } else {
    toast.error("Ada yang salah di sisi kami. Coba lagi sebentar lagi.");
  }
}
```

Frontend memetakan **kode** error, bukan teks pesan.

---

## 14. Konfigurasi & Environment

### 14.1 Variabel Lingkungan

**`apps/api/.env`**

```bash
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/perpusjal
WEB_URL=http://localhost:3000
INTERNAL_API_TOKEN=            # rahasia bersama dengan web
SESSION_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
EMAIL_FROM="Perpusjal <halo@perpusjal.or.id>"
SENTRY_DSN=
CRON_SECRET=
REVALIDATE_SECRET=             # rahasia bersama dengan web
LOG_LEVEL=info
TZ=Asia/Jakarta
```

**`apps/web/.env.local`**

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Perpusjal
API_URL=http://localhost:4000
INTERNAL_API_TOKEN=
REVALIDATE_SECRET=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_SENTRY_DSN=
```

**Aturan:** `.env.example` wajib diperbarui pada PR yang menambah variabel. Variabel `NEXT_PUBLIC_*` terlihat publik — jangan taruh rahasia di sana.

### 14.2 Konfigurasi Runtime (tabel `Setting`)

Nilai yang mungkin diubah pengurus tanpa deploy ulang:

| Key | Default | Keterangan |
|---|---|---|
| `loan.maxActive` | 2 | Batas pinjaman aktif |
| `loan.durationDays` | 7 | Durasi pinjam |
| `loan.maxExtension` | 1 | Jumlah perpanjangan |
| `loan.pickupDeadlineDays` | 3 | Batas ambil |
| `loan.suspensionDays` | 30 | Lama suspensi |
| `comment.rateLimitPerWindow` | 5 | Per 10 menit |
| `comment.blockedWords` | `[]` | Daftar kata |
| `review.slaDays` | 7 | SLA kurasi |
| `lapak.schedule` | `[]` | Jadwal & titik lapak |
| `feature.waitlist` | `false` | Saklar fitur |

Dibaca lewat `lib/settings.ts` dengan cache dalam memori 60 detik dan nilai default yang aman bila baris tidak ada.

---

## 15. Testing

### 15.1 Piramida (realistis untuk solo dev)

```text
        ╱ E2E ╲          ~8 skenario kritis (Playwright)
      ╱ Integrasi ╲      ~25 (API + DB nyata via testcontainer)
    ╱     Unit      ╲    ~80 (aturan bisnis murni)
```

**Prioritas jelas:** uji aturan yang jika salah menyebabkan kerugian nyata (buku hilang, akses bocor). Jangan menguji getter.

### 15.2 Yang Wajib Diuji

| Area | Jenis | Contoh |
|---|---|---|
| Kelayakan pinjam | Unit | Tunggakan, batas 2 buku, duplikat, suspensi |
| Transisi status artikel | Unit | Tabel transisi PRD §8.5 ditegakkan |
| Trust level komentar | Unit | TL0 → PENDING, TL2 → PUBLISHED |
| Perhitungan tanggal | Unit | Jatuh tempo WIB, perpanjangan |
| Konkurensi pinjam | Integrasi | Dua permintaan paralel, satu gagal (T1) |
| Otorisasi | Integrasi | Setiap endpoint diuji untuk 4 peran |
| Alur pinjam end-to-end | E2E | Ajukan → setujui → ambil → kembalikan |
| Alur kurasi | E2E | Draft → submit → revisi → terbit |

### 15.3 Skenario E2E Wajib Lulus

Sama dengan PRD §31.3 (T1–T10). Jalankan sebelum tiap rilis.

### 15.4 Data Uji

`prisma/seed.ts` menyediakan mode `--scenario=dev` berisi: 1 admin, 1 kurator, 3 user (satu punya tunggakan, satu tersuspensi), 20 buku dengan variasi ketersediaan, 15 artikel dengan seluruh status, 3 event, dan komentar di berbagai trust level.

---

## 16. Deployment & CI/CD

### 16.1 Lingkungan

| Lingkungan | Web | API | Database |
|---|---|---|---|
| Lokal | `localhost:3000` | `localhost:4000` | Docker PostgreSQL |
| Staging | Preview Vercel | Railway (service staging) | Railway (DB staging) |
| Produksi | Vercel | Railway | Railway |

### 16.2 Pipeline

```mermaid
flowchart LR
    A["push / PR"] --> B["CI: lint + typecheck + test"]
    B --> C{"branch?"}
    C -->|"feature"| D["Preview Vercel + API staging"]
    C -->|"main"| E["Migrasi Prisma"]
    E --> F["Deploy API (Railway)"]
    F --> G["Deploy Web (Vercel)"]
    G --> H["Smoke test /health + halaman utama"]
    H -->|gagal| I["Rollback ke deploy sebelumnya"]
```

### 16.3 Aturan Migrasi

1. Migrasi dijalankan **sebelum** deploy aplikasi.
2. Migrasi wajib **backward compatible** dengan versi aplikasi yang masih berjalan (hindari downtime).
3. Kolom dihapus dalam dua tahap: berhenti dipakai → deploy → hapus pada rilis berikutnya.
4. Setiap migrasi diuji di staging dengan salinan data produksi.
5. Sebelum migrasi produksi: **ambil backup manual**.

### 16.4 Checklist Rilis

Lihat `SPRINT-PLAN.md` §7 dan PRD §31.2.

---

## 17. Observability

| Aspek | Alat | Ambang peringatan |
|---|---|---|
| Error aplikasi | Sentry | Error baru, atau >10 kejadian/jam |
| Uptime | UptimeRobot → `/health` | 2 kegagalan berturut-turut |
| Performa web | Vercel Analytics | LCP p75 > 2,5 detik |
| Query lambat | `log_min_duration_statement = 500ms` | Query > 1 detik |
| Cron | Tabel `JobRun` + ringkasan harian | Job gagal atau tidak berjalan |
| Bisnis | Dashboard admin | Pengajuan pinjam menunggu >24 jam |

**Endpoint `/health`** mengembalikan status aplikasi, koneksi database, dan waktu eksekusi cron terakhir:

```json
{ "status": "ok", "db": "ok", "lastCronRun": "2026-09-22T00:00:04Z", "version": "3.1.0" }
```

---

## 18. Backup & Disaster Recovery

| Aspek | Ketentuan |
|---|---|
| Backup otomatis | Harian oleh Railway, retensi 14 hari |
| Backup manual | Sebelum setiap migrasi besar, disimpan di luar Railway |
| **Uji restore** | **Wajib dilakukan minimal sekali sebelum Rilis 1**, lalu setiap 6 bulan |
| RPO (kehilangan data maksimum) | 24 jam |
| RTO (waktu pemulihan maksimum) | 4 jam |
| Media (Cloudinary) | Punya penyimpanan sendiri; ekspor daftar `publicId` bulanan |
| Kredensial | Disimpan di pengelola kata sandi komunitas, minimal 2 orang punya akses (R-14) |

**Prosedur pemulihan** ada di `RUNBOOK.md` §7.

---

## 19. Performa & Skalabilitas

### 19.1 Beban yang Diantisipasi

| Metrik | Tahun 1 | Batas nyaman arsitektur ini |
|---|---|---|
| Pengguna terdaftar | 800 | ~50.000 |
| Artikel | 150 | ~50.000 |
| Buku / eksemplar | 600 / 900 | ~100.000 |
| Kunjungan bulanan | 8.000 | ~500.000 |
| Peminjaman bulanan | 50 | ~10.000 |

Kesimpulan: **satu instance API dan satu instance PostgreSQL berukuran kecil sudah lebih dari cukup**, bahkan dengan margin besar. Optimasi prematur adalah risiko jadwal, bukan keuntungan.

### 19.2 Aturan Anti-Regresi

1. Tidak ada kueri tanpa `take`/`limit` pada data yang bisa tumbuh.
2. Tidak ada N+1 — gunakan `include`/`select` Prisma secara sadar.
3. Setiap kolom yang dipakai untuk filter atau urut wajib punya indeks (lihat `DATABASE-ERD.md`).
4. Editor dan pustaka berat dimuat dinamis.
5. Setiap PR yang menyentuh halaman publik menyertakan skor Lighthouse.

---

## 20. Rencana Evolusi

| Pemicu | Tindakan |
|---|---|
| Waktu infrastruktur >30% di Sprint 2 | Gabungkan API ke Next.js Route Handlers (ADR-003) |
| Artikel + buku > 10.000 | Evaluasi Meilisearch (ADR-004) |
| Butuh aplikasi mobile | API sudah siap; tambahkan autentikasi berbasis token |
| Relawan pengurus buku > 3 orang | Tambahkan peran `PUSTAKAWAN` (PRD §4.4) |
| Cabang perpustakaan bertambah | Pertimbangkan multi-tenant — perubahan besar, rancang ulang |
| Trafik > 500k/bulan | Tambahkan read replica dan cache Redis |

---

## Lampiran A — Perintah Pengembangan

```bash
pnpm install                 # pasang seluruh workspace
docker compose up -d         # nyalakan PostgreSQL lokal
pnpm db:migrate              # jalankan migrasi
pnpm db:seed                 # isi data contoh
pnpm dev                     # jalankan web + api bersamaan
pnpm test                    # unit + integrasi
pnpm test:e2e                # Playwright
pnpm lint && pnpm typecheck  # wajib lulus sebelum commit
pnpm db:studio               # Prisma Studio
```

## Lampiran B — Kesepakatan Git

| Hal | Aturan |
|---|---|
| Branch | `main` (produksi) · `feat/*` · `fix/*` · `chore/*` |
| Commit | Conventional Commits: `feat(loan): tambah kode pengambilan` |
| PR | Meski solo, tetap lewat PR agar CI berjalan dan riwayat terbaca |
| Merge | Squash merge |
| Tag | `v3.1.0` pada setiap rilis, dengan catatan rilis |
