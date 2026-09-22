# API SPECIFICATION — Perpusjal v3

**Status:** Baseline · **Versi:** 1.0 · **Tanggal:** 22 September 2026
**Acuan:** `PRD.md` v3.0 §23 · `ARCHITECTURE.md` §4, §6
**Base URL:** `https://api.perpusjal.or.id/api/v1` (produksi) · `http://localhost:4000/api/v1` (lokal)

---

## Daftar Isi

1. [Konvensi Umum](#1-konvensi-umum)
2. [Autentikasi & Otorisasi](#2-autentikasi--otorisasi)
3. [Kode Error](#3-kode-error)
4. [Auth](#4-auth)
5. [Users & Profil](#5-users--profil)
6. [Articles](#6-articles)
7. [Curation](#7-curation)
8. [Categories & Tags](#8-categories--tags)
9. [Comments & Moderation](#9-comments--moderation)
10. [Books & Copies](#10-books--copies)
11. [Loans](#11-loans)
12. [Waitlist](#12-waitlist)
13. [Events](#13-events)
14. [Reader Letters](#14-reader-letters)
15. [Notifications](#15-notifications)
16. [Badges](#16-badges)
17. [Pages & Media](#17-pages--media)
18. [Search](#18-search)
19. [Admin & System](#19-admin--system)
20. [Webhook & Internal](#20-webhook--internal)

---

## 1. Konvensi Umum

### 1.1 Format

| Aspek | Ketentuan |
|---|---|
| Content type | `application/json; charset=utf-8` |
| Penamaan field | `camelCase` |
| Tanggal | ISO 8601 UTC: `2026-09-22T07:30:00.000Z` |
| ID | `cuid`, string |
| Bahasa pesan | Indonesia (untuk ditampilkan langsung ke pengguna) |
| Versi | Di path: `/api/v1` |

### 1.2 Amplop Respons

**Objek tunggal**

```json
{ "data": { "id": "clx…", "title": "…" } }
```

**Daftar dengan paginasi**

```json
{
  "data": [ ... ],
  "meta": { "page": 1, "perPage": 12, "total": 132, "totalPages": 11 }
}
```

**Tanpa isi:** `204 No Content`.

### 1.3 Parameter Daftar Standar

| Parameter | Tipe | Default | Keterangan |
|---|---|---|---|
| `page` | int | 1 | |
| `perPage` | int | 12 | Maksimum 50 |
| `sort` | string | bervariasi | Lihat tiap endpoint |
| `q` | string | — | Kata kunci, minimum 2 karakter |

### 1.4 Kode Status

| Kode | Arti |
|---|---|
| `200` | Berhasil |
| `201` | Berhasil dibuat |
| `204` | Berhasil, tanpa isi |
| `400` | Payload tidak valid (skema/format) |
| `401` | Belum login atau sesi tidak valid |
| `403` | Login tetapi tidak berwenang |
| `404` | Tidak ditemukan (juga dipakai untuk menyembunyikan resource privat) |
| `409` | Konflik state (mis. slug sudah ada, status tidak sesuai) |
| `422` | Aturan bisnis dilanggar |
| `429` | Rate limit terlampaui |
| `500` | Galat server |

> **Perbedaan 400 vs 422:** `400` berarti bentuk datanya salah (email bukan email). `422` berarti bentuknya benar tetapi aturan bisnis menolak (sudah punya dua pinjaman aktif).

### 1.5 Rate Limit

| Kelompok | Batas | Header respons |
|---|---|---|
| Global | 100 req/menit/IP | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| `POST /auth/login` | 10/15 menit/IP | |
| `POST /auth/register` | 5/jam/IP | |
| `POST /auth/forgot-password` | 3/jam/IP | |
| `POST /comments` | 5/10 menit/user | |
| `POST /loans` | 10/jam/user | |
| `GET /search` | 30/menit/IP | |
| `POST /media/signature` | 30/jam/user | |

### 1.6 Idempotensi

Endpoint mutasi bersifat idempoten terhadap pengiriman ganda (FR-API-04). Contoh: memanggil `POST /loans/:id/approve` dua kali menghasilkan `200` dengan data yang sama, bukan dua kode pengambilan berbeda.

---

## 2. Autentikasi & Otorisasi

### 2.1 Mekanisme

Klien browser tidak memanggil API ini secara langsung. Seluruh panggilan melewati Next.js yang menambahkan:

```http
X-Internal-Token: <rahasia bersama>
X-User-Id: <id pengguna dari sesi terverifikasi>
X-Request-Id: <uuid>
```

API menolak `X-User-Id` jika `X-Internal-Token` tidak cocok. Untuk pemanggilan langsung (mis. dari alat uji), gunakan cookie sesi `perpusjal_session`.

### 2.2 Tingkat Akses

| Simbol | Arti |
|---|---|
| `P` | Publik, tanpa autentikasi |
| `U` | Perlu login (role USER ke atas) |
| `U+` | Perlu login **dan** email terverifikasi |
| `K` | KURATOR ke atas |
| `A` | ADMIN |
| `S` | Internal/sistem (cron, webhook) |

### 2.3 Aturan Kebocoran

Untuk resource privat milik orang lain, API mengembalikan `404`, bukan `403` (FR-RBAC-03). `403` hanya dipakai ketika keberadaan resource memang publik tetapi aksinya tidak diizinkan.

### 2.4 Format Error

```json
{
  "error": {
    "code": "MAX_ACTIVE_LOANS",
    "message": "Kamu sudah meminjam 2 buku. Kembalikan salah satunya dulu ya.",
    "details": [{ "field": "bookId", "message": "Batas pinjam aktif: 2" }],
    "requestId": "8f3e1c2a-…"
  }
}
```

Frontend mencocokkan `code`, bukan `message`.

---

## 3. Kode Error

### 3.1 Umum

| Kode | Status | Keterangan |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Skema tidak terpenuhi |
| `UNAUTHORIZED` | 401 | Belum login |
| `SESSION_EXPIRED` | 401 | Sesi kedaluwarsa |
| `FORBIDDEN` | 403 | Tidak berwenang |
| `NOT_FOUND` | 404 | |
| `CONFLICT` | 409 | |
| `RATE_LIMITED` | 429 | |
| `INTERNAL_ERROR` | 500 | |

### 3.2 Auth

| Kode | Status | Keterangan |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Pesan generik (BR-AUTH-03) |
| `EMAIL_TAKEN` | 409 | |
| `USERNAME_TAKEN` | 409 | |
| `ACCOUNT_LOCKED` | 429 | 5 kegagalan dalam 15 menit |
| `ACCOUNT_SUSPENDED` | 403 | |
| `EMAIL_NOT_VERIFIED` | 422 | |
| `TOKEN_INVALID` | 400 | |
| `TOKEN_EXPIRED` | 410 | |
| `TOKEN_USED` | 410 | |
| `WEAK_PASSWORD` | 400 | |

### 3.3 Artikel & Kurasi

| Kode | Status | Keterangan |
|---|---|---|
| `INVALID_STATUS_TRANSITION` | 409 | Transisi di luar tabel PRD §8.5 |
| `ARTICLE_LOCKED` | 409 | Sedang ditinjau kurator lain |
| `SUBMIT_REQUIREMENTS_UNMET` | 422 | Checklist submit belum lengkap |
| `MAX_PENDING_SUBMISSIONS` | 422 | Sudah 3 artikel menunggu (BR-SUB-02) |
| `CANNOT_REVIEW_OWN_ARTICLE` | 403 | BR-CUR-01 |
| `NOTE_REQUIRED` | 400 | Catatan revisi/penolakan wajib |
| `MAX_FEATURED_REACHED` | 422 | Maksimum 3 unggulan |

### 3.4 Komentar

| Kode | Status | Keterangan |
|---|---|---|
| `COMMENTS_DISABLED` | 422 | `allowComments = false` |
| `COMMENT_TOO_LONG` | 400 | >1500 karakter |
| `EDIT_WINDOW_EXPIRED` | 422 | Lewat 15 menit |
| `COMMENT_RATE_LIMITED` | 429 | |
| `ALREADY_REPORTED` | 409 | |
| `COMMENTING_RESTRICTED` | 403 | Trust level `RESTRICTED` |

### 3.5 Peminjaman

| Kode | Status | Keterangan |
|---|---|---|
| `EMAIL_NOT_VERIFIED` | 422 | |
| `HAS_OVERDUE` | 422 | BR-LOAN-06 |
| `MAX_ACTIVE_LOANS` | 422 | BR-LOAN-01 |
| `DUPLICATE_REQUEST` | 422 | BR-LOAN-10 |
| `BORROW_SUSPENDED` | 422 | BR-LOAN-07/08 |
| `BOOK_UNAVAILABLE` | 422 | Tidak ada eksemplar tersedia |
| `BOOK_NOT_BORROWABLE` | 422 | Koleksi baca di tempat |
| `PICKUP_CODE_INVALID` | 404 | |
| `PICKUP_EXPIRED` | 422 | Lewat batas ambil |
| `EXTENSION_NOT_ALLOWED` | 422 | BR-LOAN-04 |
| `LOAN_NOT_CANCELLABLE` | 422 | Status sudah lewat `APPROVED` |
| `COPY_NOT_AVAILABLE` | 409 | Eksemplar yang dipilih tidak siap |
| `WAITLIST_FULL` | 422 | Maks 5 antrean |
| `ALREADY_IN_WAITLIST` | 409 | |

### 3.6 Event

| Kode | Status | Keterangan |
|---|---|---|
| `EVENT_FULL` | 422 | Kuota habis, tawarkan daftar tunggu |
| `REGISTRATION_CLOSED` | 422 | |
| `ALREADY_REGISTERED` | 409 | |
| `CANCEL_WINDOW_PASSED` | 422 | Lewat H-1 (FR-EVT-02) |
| `EVENT_CANCELLED` | 422 | |
| `INVALID_ATTENDANCE_CODE` | 404 | |

---

## 4. Auth

### `POST /auth/register` · `P`

```jsonc
// Request
{
  "name": "Rina Ayu",
  "username": "rinaayu",
  "email": "rina@example.com",
  "password": "bacabuku2026",
  "agreeTerms": true
}

// 201
{
  "data": {
    "id": "clx…",
    "email": "rina@example.com",
    "status": "PENDING_VERIFICATION",
    "message": "Akun dibuat. Cek emailmu untuk verifikasi."
  }
}
```

Efek samping: membuat `VerificationToken` (berlaku 24 jam) dan mengirim email verifikasi.

### `POST /auth/login` · `P`

```jsonc
// Request
{ "email": "rina@example.com", "password": "…", "rememberMe": true }

// 200
{
  "data": {
    "user": { "id": "clx…", "name": "Rina Ayu", "username": "rinaayu", "role": "USER",
              "status": "ACTIVE", "emailVerified": true, "avatarUrl": null },
    "sessionToken": "…",
    "expiresAt": "2026-10-22T07:30:00.000Z"
  }
}
```

Kegagalan selalu `INVALID_CREDENTIALS`, apa pun penyebabnya (email tidak ada atau password salah).

### `POST /auth/logout` · `U`
Menghapus sesi saat ini. → `204`

### `POST /auth/verify-email` · `P`
Body `{ "token": "…" }` → `200` dengan user aktif, sesi dibuat otomatis.

### `POST /auth/resend-verification` · `U`
Maks 3 per jam (BR-AUTH-02). → `204`

### `POST /auth/forgot-password` · `P`
Body `{ "email": "…" }`. **Selalu** `200` dengan pesan sama, terlepas email terdaftar atau tidak.

### `POST /auth/reset-password` · `P`
Body `{ "token": "…", "password": "…" }`. Mencabut seluruh sesi lain (BR-AUTH-04). → `200`

### `GET /auth/me` · `U`

```jsonc
{
  "data": {
    "id": "clx…", "name": "Rina Ayu", "username": "rinaayu", "role": "USER",
    "status": "ACTIVE", "trustLevel": "TL1", "emailVerified": true,
    "avatarUrl": "https://…",
    "unreadNotifications": 3,
    "borrowing": {
      "activeLoans": 1, "maxActive": 2, "hasOverdue": false,
      "suspendedUntil": null, "canBorrow": true
    }
  }
}
```

Objek `borrowing` sengaja disertakan agar frontend dapat menonaktifkan tombol pinjam tanpa panggilan tambahan — tetapi keputusan sesungguhnya tetap di server.

### `GET /auth/sessions` · `U` · `DELETE /auth/sessions/:id` · `U`
Daftar sesi aktif (perangkat, IP kasar, terakhir aktif) dan pencabutannya (FR-AUTH-05).

---

## 5. Users & Profil

### `GET /users/:username` · `P`

```jsonc
{
  "data": {
    "name": "Dimas Prakoso", "username": "dimasp",
    "avatarUrl": "https://…", "bio": "Menulis esai tentang desa dan buku.",
    "joinedAt": "2026-03-11T00:00:00.000Z",
    "isProfilePublic": true,
    "stats": { "articlesPublished": 7 },
    "badges": [{ "code": "KONTRIBUTOR", "name": "Kontributor", "iconName": "pen-line", "earnedAt": "…" }],
    "links": { "instagram": "…", "website": null }
  }
}
```

Jika `isProfilePublic = false`, hanya `name`, `username`, dan daftar artikel terbit yang dikembalikan (BR-PROF-01).

### `GET /users/:username/articles` · `P`
Artikel terbit milik pengguna, terpaginasi.

### `PATCH /me` · `U`
Field yang boleh: `name`, `bio`, `avatarUrl`, `instagramUrl`, `websiteUrl`, `isProfilePublic`, `showBadges`, `username` (dibatasi 30 hari, FR-AUTH-03).

### `GET /me/export` · `U`
Mengembalikan JSON berisi profil, artikel, komentar, riwayat pinjam, pendaftaran event (FR-PROF-02).

### `POST /me/deactivate` · `U`
Ditolak `422 HAS_ACTIVE_LOANS` bila masih ada pinjaman aktif (BR-AUTH-06).

### `GET /contributors` · `P`
Daftar kontributor diurutkan jumlah artikel terbit.

---

## 6. Articles

### `GET /articles` · `P`

| Query | Keterangan |
|---|---|
| `page`, `perPage` | Default 12 |
| `kategori` | Slug kategori |
| `tag` | Slug tag |
| `q` | Kata kunci |
| `featured` | `true` untuk hanya unggulan |
| `sort` | `terbaru` (default) · `populer` · `terlama` |

```jsonc
{
  "data": [{
    "id": "clx…", "title": "Lapak Baca di Alun-Alun", "slug": "lapak-baca-di-alun-alun",
    "excerpt": "Setiap Minggu pagi…", "coverImage": "https://…",
    "publishedAt": "2026-09-14T02:00:00.000Z", "readingTime": 5, "viewCount": 312,
    "author": { "name": "Dimas Prakoso", "username": "dimasp", "avatarUrl": "…" },
    "category": { "name": "Sosial", "slug": "sosial", "color": "#7B2D26" }
  }],
  "meta": { "page": 1, "perPage": 12, "total": 48, "totalPages": 4 }
}
```

Hanya mengembalikan `status = PUBLISHED` dan `deletedAt = null`.

### `GET /articles/:slug` · `P`

Mengembalikan artikel lengkap termasuk `content` (JSON TipTap), tag, dan data penulis.

- Status selain `PUBLISHED` → `404`, **kecuali** pemanggil adalah penulisnya, kurator, atau admin — dalam hal itu dikembalikan beserta `"preview": { "status": "PENDING_REVIEW" }` (FR-ART-04).
- Query `?preview=<token>` memberi akses ke draft lewat tautan rahasia berumur 7 hari (FR-ART-05).

### `GET /articles/:slug/related` · `P`
3 artikel: kategori sama, terbaru, tidak termasuk dirinya.

### `POST /articles/:id/view` · `P`

```jsonc
// Request
{ "secondsSpent": 47, "scrollDepth": 72, "anonId": "a1b2c3…" }
// 204
```

Dihitung maksimal sekali per pengunjung per artikel per 24 jam, tidak dihitung untuk penulis sendiri (FR-ART-06).

### `GET /me/articles` · `U`
Seluruh artikel milik sendiri, semua status. Query `status` opsional.

### `POST /articles` · `U+`

```jsonc
// Request — membuat draft
{ "title": "Judul sementara", "content": { "type": "doc", "content": [] } }
// 201 → status DRAFT
```

### `PATCH /articles/:id` · `U+`
Hanya pemilik, dan hanya saat status `DRAFT` atau `REVISION`. Status lain → `409 INVALID_STATUS_TRANSITION`.
Field yang diabaikan bila dikirim: `status`, `authorId`, `publishedAt`, `isFeatured`, `viewCount` (FR-API-02).

### `DELETE /articles/:id` · `U+` / `A`
Pemilik hanya boleh menghapus `DRAFT` (hard delete). Admin dapat menghapus apa pun (soft delete, BR-ADM-01).

### `POST /articles/:id/submit` · `U+`

```jsonc
// Request
{ "originalityConfirmed": true }

// 422 bila checklist belum lengkap
{
  "error": {
    "code": "SUBMIT_REQUIREMENTS_UNMET",
    "message": "Tulisanmu belum siap dikirim.",
    "details": [
      { "field": "coverImage", "message": "Cover belum diunggah" },
      { "field": "content", "message": "Isi minimal 300 kata (saat ini 184)" }
    ]
  }
}
```

### `POST /articles/:id/withdraw` · `U+`
`PENDING_REVIEW` → `DRAFT`. Ditolak `409 ARTICLE_LOCKED` bila kurator sudah mengunci review (BR-WRITE-01).

### `GET /articles/:id/revisions` · pemilik / `K`
Riwayat revisi, terbaru dulu.

---

## 7. Curation

### `GET /curation/queue` · `K`

| Query | Nilai |
|---|---|
| `status` | `PENDING_REVIEW` (default) · `REVISION` · `APPROVED` · `PUBLISHED` · `REJECTED` |
| `sort` | `terlama` (default — antrean adil) |

```jsonc
{
  "data": [{
    "id": "clx…", "title": "…", "wordCount": 842,
    "submittedAt": "2026-09-15T04:12:00.000Z", "queueAgeDays": 7, "slaStatus": "BREACHED",
    "author": { "name": "…", "username": "…", "publishedCount": 2, "approvalRate": 0.67 },
    "category": { "name": "Sastra", "slug": "sastra" },
    "lockedBy": null
  }],
  "meta": { "page": 1, "perPage": 20, "total": 6, "totalPages": 1 }
}
```

Artikel milik kurator yang memanggil **tidak** muncul (BR-CUR-01). `slaStatus`: `OK` (<3 hari) · `WARNING` (3–7) · `BREACHED` (>7).

### `POST /articles/:id/review/lock` · `K`
Mengunci 30 menit. Bila sudah dikunci orang lain → `409 ARTICLE_LOCKED` dengan `{ lockedBy: { name, since } }` (AC-CUR-03).

### `DELETE /articles/:id/review/lock` · `K`
Melepas kunci lebih awal.

### `POST /articles/:id/approve` · `K`

```jsonc
// Request
{ "publishNow": true, "scheduledAt": null, "note": "Tulisan bagus, terima kasih." }
// atau
{ "publishNow": false, "scheduledAt": "2026-09-25T01:00:00.000Z" }
```

Hasil: `PUBLISHED` atau `SCHEDULED`. Membuat `ArticleRevision`, memicu notifikasi, evaluasi badge, dan revalidasi halaman.

### `POST /articles/:id/request-revision` · `K`
Body `{ "note": "…" }` — minimum 20 karakter, wajib (BR-CUR-02). → `REVISION`

### `POST /articles/:id/reject` · `K`

```jsonc
{ "reason": "OFF_TOPIC", "note": "Isinya lebih cocok untuk media lain karena…" }
```

`reason` ∈ `PLAGIARISM` `HATE_SPEECH` `PROMOTIONAL` `OFF_TOPIC` `LOW_QUALITY` `OTHER`. `note` wajib.

### `POST /articles/:id/feature` · `K` · `DELETE /articles/:id/feature` · `K`
Maksimum 3 aktif → `422 MAX_FEATURED_REACHED` beserta daftar yang sedang aktif (AC-ART-06).

### `POST /articles/:id/publish` · `A` · `/unpublish` · `A` · `/archive` · `A`
Jalur admin langsung tanpa antrean kurasi.

---

## 8. Categories & Tags

### `GET /categories` · `P`
Query `type` ∈ `ARTICLE` `BOOK` `BOTH`. Mengembalikan pohon kategori beserta `articleCount` dan `bookCount`.

### `POST /categories` · `K` · `PATCH /categories/:id` · `K` · `DELETE /categories/:id` · `K`
Penghapusan ditolak `409` bila masih dipakai; tawarkan pemindahan ke kategori lain.

### `GET /tags` · `P` · `POST /tags` · `K`

---

## 9. Comments & Moderation

### `GET /comments` · `P`

| Query | Keterangan |
|---|---|
| `articleId` atau `letterId` | Salah satu wajib |
| `page`, `perPage` | Default 10 |

Mengembalikan komentar `PUBLISHED` beserta balasannya (kedalaman 1). Bila pemanggil login, komentar `PENDING` miliknya sendiri juga disertakan dengan `"pendingModeration": true` (AC-CMT-02).

```jsonc
{
  "data": [{
    "id": "clx…", "content": "Terima kasih, tulisannya membantu.",
    "createdAt": "…", "editedAt": null, "pendingModeration": false,
    "author": { "name": "Rina Ayu", "username": "rinaayu", "avatarUrl": "…" },
    "canEdit": false, "canDelete": false,
    "replies": [ … ]
  }],
  "meta": { "page": 1, "perPage": 10, "total": 23, "totalPages": 3 }
}
```

### `POST /comments` · `U+`

```jsonc
// Request
{ "articleId": "clx…", "parentId": null, "content": "…" }

// 201 — TL1/TL2 lolos filter
{ "data": { "id": "…", "status": "PUBLISHED" } }

// 201 — TL0 atau terfilter
{
  "data": {
    "id": "…", "status": "PENDING",
    "message": "Komentarmu terkirim dan sedang ditinjau. Biasanya tidak lama."
  }
}
```

Pemeriksaan berurutan: trust level → rate limit → panjang → kata terlarang → jumlah tautan.

### `PATCH /comments/:id` · `U`
Hanya pemilik, ≤15 menit sejak dibuat → `422 EDIT_WINDOW_EXPIRED`.

### `DELETE /comments/:id` · `U` / `K`
Pemilik: soft delete menjadi `DELETED_BY_USER`, balasan tetap ada dengan placeholder (AC-CMT-04). Kurator: `HIDDEN` + menyembunyikan balasan (FR-CMT-08).

### `POST /comments/:id/report` · `U`
Body `{ "reason": "SPAM", "note": "…" }`. Satu laporan per pengguna per komentar. Akumulasi melewati ambang → auto `HIDDEN` (FR-CMT-03).

### `GET /moderation/comments` · `K`
Query `tab` ∈ `pending` (default) `reported` `hidden` `all`. Setiap baris menyertakan konteks artikel, trust level penulis, dan alasan masuk antrean.

### `POST /comments/:id/approve` · `K` · `POST /comments/:id/hide` · `K`

### `POST /moderation/comments/bulk` · `K`

```jsonc
{ "ids": ["…", "…"], "action": "approve" }   // approve | hide | spam
```

### `PATCH /admin/users/:id/trust-level` · `K`
Body `{ "trustLevel": "RESTRICTED", "reason": "…" }` (FR-CMT-07).

---

## 10. Books & Copies

### `GET /books` · `P`

| Query | Keterangan |
|---|---|
| `q` | Judul, penulis, ISBN |
| `kategori` | Slug |
| `tersedia` | `true` hanya yang ada eksemplar |
| `bahasa` | `ID` `EN` `JV` `AR` `OTHER` |
| `tahunMin`, `tahunMax` | |
| `sort` | `terbaru` (default) · `judul` · `populer` |
| `perPage` | Default 24 |

```jsonc
{
  "data": [{
    "id": "clx…", "title": "Bumi Manusia", "slug": "bumi-manusia",
    "author": "Pramoedya Ananta Toer", "coverImage": "https://…",
    "category": { "name": "Sastra", "slug": "sastra" },
    "availableCopies": 2, "totalCopies": 3, "isBorrowable": true,
    "availability": "AVAILABLE"
  }],
  "meta": { "page": 1, "perPage": 24, "total": 213, "totalPages": 9 }
}
```

`availability`: `AVAILABLE` · `LAST_ONE` · `BORROWED` · `READ_ONLY`.

### `GET /books/:slug` · `P`
Detail lengkap + `similarBooks` (4, kategori sama) + `estimatedReturnDate` bila semua eksemplar terpinjam.

### `GET /books/:slug/availability` · `P`
Respons ringan tanpa cache, dipanggil klien sebelum menampilkan tombol pinjam (FR-LIB-02):

```jsonc
{
  "data": {
    "availableCopies": 0, "availability": "BORROWED",
    "estimatedReturnDate": "2026-09-28",
    "userEligibility": {
      "canBorrow": false, "reason": "BOOK_UNAVAILABLE",
      "message": "Sedang dipinjam semua.", "canJoinWaitlist": true
    }
  }
}
```

### `POST /books` · `A` · `PATCH /books/:id` · `A`

```jsonc
{
  "title": "Bumi Manusia", "author": "Pramoedya Ananta Toer",
  "isbn": "9789799731234", "publisher": "Hasta Mitra", "publicationYear": 1980,
  "categoryId": "clx…", "description": "…", "coverImage": "https://…",
  "language": "ID", "pages": 535, "shelfLocation": "Rak A-3",
  "donatedBy": "Keluarga Pak Santoso",
  "isPublished": true, "isBorrowable": true,
  "initialCopies": 3
}
```

`initialCopies` hanya pada pembuatan: membuat N `BookCopy` dengan `inventoryCode` otomatis berformat `PJ-{tahun}-{urut}`.

### `DELETE /books/:id` · `A`
Bila ada riwayat pinjaman → `409` dengan saran mengarsipkan (AC-LIB-01).

### `GET /books/:id/copies` · `A` · `POST /books/:id/copies` · `A` · `PATCH /copies/:id` · `A` · `DELETE /copies/:id` · `A`
Eksemplar yang sedang `BORROWED` tidak dapat dihapus.

### `POST /books/import` · `A` (P2)
Unggah CSV. Mengembalikan pratinjau baris valid/invalid sebelum dikonfirmasi (Q-05).

---

## 11. Loans

### `POST /loans` · `U+`

```jsonc
// Request
{
  "bookId": "clx…",
  "pickupPoint": "BASECAMP",
  "pickupDatePlan": "2026-09-24",
  "note": "Saya ambil sore hari setelah sekolah"
}

// 201
{
  "data": {
    "id": "clm…", "loanCode": "PJM-2026-0451", "status": "PENDING",
    "requestedAt": "2026-09-21T10:12:00.000Z",
    "book": { "title": "Bumi Manusia", "coverImage": "…" },
    "message": "Pengajuan terkirim. Tunggu persetujuan pengurus, ya."
  }
}
```

**Urutan pemeriksaan (menentukan pesan mana yang muncul):**

1. `EMAIL_NOT_VERIFIED`
2. `HAS_OVERDUE`
3. `BORROW_SUSPENDED` (beserta `suspendedUntil`)
4. `MAX_ACTIVE_LOANS`
5. `DUPLICATE_REQUEST`
6. `BOOK_NOT_BORROWABLE`
7. `BOOK_UNAVAILABLE` (diperiksa **setelah** penguncian baris, DI-02)

Seluruhnya dalam satu transaksi bersama pengurangan `availableCopies` (DI-01).

### `GET /me/loans` · `U`
Query `status` ∈ `aktif` (PENDING/APPROVED/BORROWED/OVERDUE) · `riwayat` · nilai enum spesifik.

```jsonc
{
  "data": [{
    "id": "clm…", "loanCode": "PJM-2026-0451", "status": "APPROVED",
    "book": { "title": "Bumi Manusia", "slug": "…", "coverImage": "…" },
    "pickupCode": "482913",
    "pickupPoint": "Basecamp Perpusjal",
    "pickupDeadline": "2026-09-24T16:59:59.000Z",
    "dueDate": null, "extensionCount": 0,
    "canCancel": true, "canExtend": false,
    "nextAction": "Ambil bukunya sebelum Kamis, 24 Sep"
  }]
}
```

`pickupCode` hanya dikembalikan kepada peminjam yang bersangkutan dan admin.

### `POST /loans/:id/cancel` · `U`
Berlaku saat `PENDING` atau `APPROVED` (BR-LOAN-11). Mengembalikan `availableCopies`.

### `POST /loans/:id/extend` · `U`

```jsonc
// 200
{ "data": { "dueDate": "2026-10-05T16:59:59.000Z", "extensionCount": 1 } }

// 422
{ "error": { "code": "EXTENSION_NOT_ALLOWED",
  "message": "Perpanjangan hanya dapat dilakukan satu kali.",
  "details": [{ "field": "extensionCount", "message": "Sudah diperpanjang pada 28 Sep" }] } }
```

Syarat BR-LOAN-04: belum pernah diperpanjang, tidak `OVERDUE`, tidak ada antrean, diajukan maksimal H-1.

### `GET /loans` · `A`

| Query | Keterangan |
|---|---|
| `status` | Nilai enum |
| `q` | Nama/username peminjam, judul buku, kode pinjam |
| `overdueOnly` | `true` |
| `sort` | `terbaru` · `jatuhTempo` |

Respons menyertakan data kontak peminjam — endpoint ini **hanya** untuk admin (AC-LOAN-07).

### `POST /loans/:id/approve` · `A`

```jsonc
// 200
{
  "data": {
    "id": "clm…", "status": "APPROVED",
    "pickupCode": "482913",
    "pickupDeadline": "2026-09-24T16:59:59.000Z",
    "approvedAt": "…", "approvedBy": { "name": "Bayu" }
  }
}
```

`pickupDeadline` = maksimum antara (sekarang + `loan.pickupDeadlineDays`) dan akhir jadwal lapak berikutnya (BR-LOAN-05).

### `POST /loans/:id/reject` · `A`
Body `{ "reason": "…" }` wajib. Mengembalikan `availableCopies`.

### `POST /loans/pickup` · `A`

```jsonc
// Request — dari Mode Lapak
{ "pickupCode": "482913", "bookCopyId": "clc…" }

// 200
{
  "data": {
    "id": "clm…", "status": "BORROWED",
    "borrowedAt": "2026-09-23T08:15:00.000Z",
    "dueDate": "2026-09-30T16:59:59.000Z",
    "bookCopy": { "inventoryCode": "PJ-2026-0173" },
    "borrower": { "name": "Rina Ayu" }
  }
}
```

Bila `bookCopyId` tidak dikirim, sistem memilih eksemplar `AVAILABLE` pertama secara otomatis.

### `POST /loans/:id/return` · `A`

```jsonc
// Request
{ "condition": "BAIK", "note": null }
```

| `condition` | Efek |
|---|---|
| `BAIK` | `RETURNED`, copy `AVAILABLE`, `availableCopies++`, `borrowCount++`, blokir dicabut, `onTimeStreak++` bila tepat waktu |
| `RUSAK` | `RETURNED`, copy `DAMAGED`, `availableCopies` **tidak** bertambah, catatan wajib |
| `HILANG` | `RETURNED_LOST`, copy `LOST`, `totalCopies--`, catatan wajib, tindak lanjut offline |

### `GET /loans/pickup-board` · `A`
Papan Mode Lapak: "Siap diambil hari ini" + "Jatuh tempo hari ini" + "Terlambat" (FR-LOAN-05).

### `GET /loans/lookup?code=482913` · `A`
Pencarian cepat satu transaksi berdasarkan kode. Dioptimalkan untuk dipakai di lapangan.

---

## 12. Waitlist

Fitur P1; aktif bila `Setting.feature.waitlist = true`.

### `POST /books/:id/waitlist` · `U+`
Maks 5 antrean per judul, satu posisi per pengguna. → `201 { position: 2 }`

### `DELETE /books/:id/waitlist` · `U`
Keluar antrean; posisi di bawahnya dinaikkan dalam transaksi.

### `GET /me/waitlist` · `U`
Daftar antrean beserta posisi dan `priorityUntil` bila giliran sudah tiba.

---

## 13. Events

### `GET /events` · `P`
Query `status` (`mendatang` default · `selesai`), `type`, `page`.

### `GET /events/:slug` · `P`
`meetingUrl` hanya disertakan bila pemanggil terdaftar (AC-EVT-04). Menyertakan `myRegistration` bila login.

### `POST /events` · `K` · `PATCH /events/:id` · `K` · `DELETE /events/:id` · `A`
Kurator hanya dapat mengubah event yang diselenggarakannya sendiri.

### `POST /events/:id/register` · `U+`

```jsonc
// 201
{ "data": { "status": "REGISTERED", "attendanceCode": "K3F8TQ",
            "calendarUrl": "/api/v1/events/clx…/calendar.ics" } }

// 422 kuota penuh
{ "error": { "code": "EVENT_FULL", "message": "Kuota sudah penuh.",
             "details": [{ "field": "waitlist", "message": "Kamu bisa masuk daftar tunggu" }] } }
```

### `POST /events/:id/waitlist` · `U+`
Masuk daftar tunggu ketika penuh.

### `POST /events/:id/cancel-registration` · `U`
Hanya sampai H-1 (FR-EVT-02). Membebaskan kuota dan mempromosikan antrean pertama (AC-EVT-02).

### `GET /events/:id/registrations` · `K`
Daftar peserta untuk panitia, dengan filter status.

### `POST /events/:id/checkin` · `K`
Body `{ "attendanceCode": "K3F8TQ" }` atau `{ "userId": "…" }` → `ATTENDED`.

### `POST /events/:id/complete` · `K`
Body `{ "summary": "…", "gallery": ["url", …] }` — dokumentasi pascakegiatan (FR-EVT-05).

### `GET /events/:id/calendar.ics` · `P`
Berkas kalender.

---

## 14. Reader Letters

### `GET /letters` · `P` · `GET /letters/:slug` · `P`
Hanya `PUBLISHED`, kronologis.

### `POST /letters` · `U+`

```jsonc
{ "title": "Tentang membaca di desa kami", "content": "…", "isAnonymous": true }
```

Panjang 100–2000 kata. Maks 2 kiriman `PENDING` per pengguna. `displayName` menjadi "Warga Blora" bila anonim, identitas asli tetap tersimpan.

### `GET /me/letters` · `U`

### `GET /moderation/letters` · `K`
Antrean moderasi.

### `POST /letters/:id/approve` · `K`
Body opsional `{ "editedContent": "…" }` untuk penyuntingan ringan; teks asli disimpan di `originalContent` (FR-SP-02).

### `POST /letters/:id/reject` · `K`
Body `{ "reason": "…" }` wajib.

---

## 15. Notifications

### `GET /notifications` · `U`
Query `unreadOnly`, `page`. Notifikasi sejenis dalam 1 jam digabung (FR-NOT-03).

```jsonc
{
  "data": [{
    "id": "cln…", "type": "LOAN_APPROVED",
    "title": "Pengajuanmu disetujui",
    "body": "Ambil \"Bumi Manusia\" dengan kode 482913 sebelum 24 Sep.",
    "actionUrl": "/dashboard/pinjaman/clm…",
    "isRead": false, "createdAt": "…"
  }],
  "meta": { "unreadCount": 3, "page": 1, "perPage": 20, "total": 41, "totalPages": 3 }
}
```

### `PATCH /notifications/:id/read` · `U` · `POST /notifications/read-all` · `U`

### `GET /me/notification-preferences` · `U` · `PATCH /me/notification-preferences` · `U`

```jsonc
{ "preferences": [{ "type": "COMMENT_ON_MY_ARTICLE", "inApp": true, "email": false }] }
```

Tipe yang ditandai tidak dapat dimatikan di PRD §16.1 akan ditolak `422`.

### `GET /unsubscribe?token=` · `P`
Berhenti berlangganan satu tipe notifikasi lewat tautan email (FR-NOT-05).

---

## 16. Badges

### `GET /badges` · `P`
Seluruh badge aktif beserta deskripsi kriteria.

### `GET /me/badges` · `U`

```jsonc
{
  "data": [{
    "code": "BOOK_EXPLORER", "name": "Book Explorer",
    "description": "Meminjam 5 buku", "iconName": "compass",
    "earned": false, "progress": 3, "target": 5
  }]
}
```

### `POST /badges` · `A` · `PATCH /badges/:id` · `A`
Admin dapat menambah badge dengan `criteriaType` dari daftar yang didukung, tanpa deploy (FR-BDG-05).

### `POST /admin/users/:id/badges` · `A`
Pemberian manual (mis. `DONATUR_BUKU`).

---

## 17. Pages & Media

### `GET /pages/:slug` · `P` · `GET /pages` · `P`
Hanya `isPublished = true` untuk publik.

### `POST /pages` · `A` · `PATCH /pages/:slug` · `A`
Halaman `isSystem = true` tidak dapat dihapus, hanya di-unpublish (FR-CMS-02).

### `POST /media/signature` · `U+`

```jsonc
// Request
{ "type": "ARTICLE_COVER" }

// 200
{
  "data": {
    "signature": "…", "timestamp": 1758500000,
    "apiKey": "…", "cloudName": "perpusjal",
    "folder": "perpusjal/prod/article-cover/2026",
    "maxBytes": 2097152,
    "allowedFormats": ["jpg", "png", "webp"]
  }
}
```

### `POST /media` · `U+`
Mencatat metadata setelah unggahan ke Cloudinary selesai.

### `GET /media` · `A` · `DELETE /media/:id` · `A`

---

## 18. Search

### `GET /search` · `P`

| Query | Keterangan |
|---|---|
| `q` | Wajib, minimum 2 karakter |
| `type` | `all` (default) · `artikel` · `buku` · `kegiatan` · `orang` |
| `kategori` | Slug |
| `page`, `perPage` | |

```jsonc
{
  "data": {
    "articles": { "items": [ … ], "total": 12 },
    "books":    { "items": [ … ], "total": 4 },
    "events":   { "items": [ … ], "total": 0 },
    "users":    { "items": [ … ], "total": 1 }
  },
  "meta": { "query": "pramoedya", "totalAll": 17, "durationMs": 38 }
}
```

Hasil menyertakan potongan teks dengan penanda kecocokan. Entitas non-publik tidak pernah muncul (FR-SRC-06). Kata kunci dicatat anonim di `SearchQueryLog` (FR-SRC-07).

### `GET /search/suggest` · `P`
Saran instan: 3 artikel + 3 buku. Debounce di klien 300 ms (FR-SRC-02).

### `POST /book-requests` · `U`
Usulan buku dari hasil pencarian kosong (FR-SRC-05).

---

## 19. Admin & System

### `GET /admin/stats` · `K` / `A`

```jsonc
{
  "data": {
    "users":    { "total": 184, "newThisWeek": 12 },
    "articles": { "published": 43, "pendingReview": 3, "draft": 17 },
    "books":    { "titles": 213, "copies": 287, "available": 241 },
    "loans":    { "pending": 4, "active": 39, "overdue": 6, "readyToday": 5 },
    "comments": { "pendingModeration": 2, "reported": 1 },
    "events":   { "upcoming": 2 },
    "charts": {
      "signupsPerWeek": [{ "week": "2026-W30", "count": 8 }],
      "loansPerWeek":   [{ "week": "2026-W30", "count": 11 }]
    }
  }
}
```

Kurator hanya menerima bagian `articles` dan `comments`.

### `GET /admin/activity` · `A`
15 peristiwa terbaru lintas modul (FR-DASH-02).

### `GET /admin/users` · `A`
Query `role`, `status`, `q`, `hasActiveLoans`.

### `PATCH /admin/users/:id/role` · `A`
Ditolak `422` bila menurunkan admin terakhir (BR-ADM-02). Dicatat di audit log.

### `PATCH /admin/users/:id/status` · `A`
Body `{ "status": "SUSPENDED", "reason": "…" }`.

### `POST /admin/users/:id/lift-borrow-suspension` · `A`

### `GET /admin/audit-logs` · `A`
Query `entityType`, `entityId`, `actorId`, `from`, `to`. Append-only, tidak ada endpoint hapus (FR-AUD-01).

### `GET /admin/settings` · `A` · `PATCH /admin/settings` · `A`

```jsonc
{ "loan.durationDays": 10, "loan.maxActive": 3 }
```

Setiap perubahan dicatat di audit log.

### `GET /admin/jobs` · `A`
Riwayat eksekusi cron dari tabel `JobRun`.

### `POST /admin/jobs/:name/run` · `A`
Menjalankan job secara manual (berguna saat pemulihan).

### `GET /health` · `P`

```jsonc
{ "status": "ok", "db": "ok", "lastCronRun": "2026-09-22T00:00:04.000Z", "version": "3.1.0", "uptimeSeconds": 84213 }
```

---

## 20. Webhook & Internal

### `POST /internal/cron/:jobName` · `S`
Header `X-Cron-Secret` wajib (SEC-19). Dipakai bila penjadwalan dipindah ke layanan cron eksternal.

### `POST {WEB_URL}/api/revalidate` · dipanggil API → Next.js

```jsonc
// Header: X-Revalidate-Token
{ "paths": ["/", "/artikel", "/artikel/lapak-baca-di-alun-alun"], "tags": ["articles"] }
```

Dipicu oleh: artikel terbit/ubah/arsip · buku dipublikasikan/diubah · event terbit/dibatalkan · halaman CMS diperbarui · surat pembaca terbit.

---

## Lampiran A — Ringkasan Seluruh Endpoint

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/auth/register` | P |
| POST | `/auth/login` | P |
| POST | `/auth/logout` | U |
| POST | `/auth/verify-email` | P |
| POST | `/auth/resend-verification` | U |
| POST | `/auth/forgot-password` | P |
| POST | `/auth/reset-password` | P |
| GET | `/auth/me` | U |
| GET/DELETE | `/auth/sessions` | U |
| GET | `/users/:username` | P |
| GET | `/users/:username/articles` | P |
| GET | `/contributors` | P |
| PATCH | `/me` | U |
| GET | `/me/export` | U |
| POST | `/me/deactivate` | U |
| GET | `/articles` | P |
| GET | `/articles/:slug` | P |
| GET | `/articles/:slug/related` | P |
| POST | `/articles/:id/view` | P |
| GET | `/me/articles` | U |
| POST | `/articles` | U+ |
| PATCH/DELETE | `/articles/:id` | U+ |
| POST | `/articles/:id/submit` | U+ |
| POST | `/articles/:id/withdraw` | U+ |
| GET | `/articles/:id/revisions` | U+/K |
| GET | `/curation/queue` | K |
| POST/DELETE | `/articles/:id/review/lock` | K |
| POST | `/articles/:id/approve` | K |
| POST | `/articles/:id/request-revision` | K |
| POST | `/articles/:id/reject` | K |
| POST/DELETE | `/articles/:id/feature` | K |
| POST | `/articles/:id/publish\|unpublish\|archive` | A |
| GET/POST/PATCH/DELETE | `/categories` | P/K |
| GET/POST | `/tags` | P/K |
| GET/POST | `/comments` | P/U+ |
| PATCH/DELETE | `/comments/:id` | U/K |
| POST | `/comments/:id/report` | U |
| GET | `/moderation/comments` | K |
| POST | `/comments/:id/approve\|hide` | K |
| POST | `/moderation/comments/bulk` | K |
| GET | `/books` | P |
| GET | `/books/:slug` | P |
| GET | `/books/:slug/availability` | P |
| POST/PATCH/DELETE | `/books` | A |
| GET/POST | `/books/:id/copies` | A |
| PATCH/DELETE | `/copies/:id` | A |
| POST | `/books/import` | A |
| POST | `/loans` | U+ |
| GET | `/me/loans` | U |
| POST | `/loans/:id/cancel` | U |
| POST | `/loans/:id/extend` | U |
| GET | `/loans` | A |
| POST | `/loans/:id/approve\|reject` | A |
| POST | `/loans/pickup` | A |
| POST | `/loans/:id/return` | A |
| GET | `/loans/pickup-board` | A |
| GET | `/loans/lookup` | A |
| POST/DELETE | `/books/:id/waitlist` | U+ |
| GET | `/me/waitlist` | U |
| GET | `/events` · `/events/:slug` | P |
| POST/PATCH | `/events` | K |
| DELETE | `/events/:id` | A |
| POST | `/events/:id/register` | U+ |
| POST | `/events/:id/waitlist` | U+ |
| POST | `/events/:id/cancel-registration` | U |
| GET | `/events/:id/registrations` | K |
| POST | `/events/:id/checkin` | K |
| POST | `/events/:id/complete` | K |
| GET | `/events/:id/calendar.ics` | P |
| GET | `/letters` · `/letters/:slug` | P |
| POST | `/letters` | U+ |
| GET | `/me/letters` | U |
| GET | `/moderation/letters` | K |
| POST | `/letters/:id/approve\|reject` | K |
| GET | `/notifications` | U |
| PATCH | `/notifications/:id/read` | U |
| POST | `/notifications/read-all` | U |
| GET/PATCH | `/me/notification-preferences` | U |
| GET | `/unsubscribe` | P |
| GET | `/badges` · `/me/badges` | P/U |
| POST/PATCH | `/badges` | A |
| POST | `/admin/users/:id/badges` | A |
| GET | `/pages` · `/pages/:slug` | P |
| POST/PATCH | `/pages` | A |
| POST | `/media/signature` · `/media` | U+ |
| GET/DELETE | `/media` | A |
| GET | `/search` · `/search/suggest` | P |
| POST | `/book-requests` | U |
| GET | `/admin/stats` | K/A |
| GET | `/admin/activity` | A |
| GET | `/admin/users` | A |
| PATCH | `/admin/users/:id/role\|status\|trust-level` | A/K |
| POST | `/admin/users/:id/lift-borrow-suspension` | A |
| GET | `/admin/audit-logs` | A |
| GET/PATCH | `/admin/settings` | A |
| GET/POST | `/admin/jobs` | A |
| GET | `/health` | P |
| POST | `/internal/cron/:jobName` | S |

## Lampiran B — Aturan Implementasi

| ID | Aturan |
|---|---|
| `FR-API-01` | Seluruh input divalidasi Zod di server; skema dibagikan lewat `packages/types` |
| `FR-API-02` | Skema bersifat strict — field tak dikenal ditolak, terutama `role`, `status`, `authorId` |
| `FR-API-03` | Rate limit sesuai §1.5 |
| `FR-API-04` | Mutasi idempoten terhadap pengiriman ganda |
| `FR-API-05` | Respons publik memakai `s-maxage`; respons pribadi memakai `Cache-Control: private, no-store` |
| `SEC-14` | Error tidak pernah membocorkan stack trace, kueri, atau struktur internal |
| `SEC-18` | Data pribadi tidak pernah muncul di endpoint publik |
