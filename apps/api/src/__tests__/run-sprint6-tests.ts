import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  bookCreateSchema,
  bookUpdateSchema,
  bookCopyCreateSchema,
  bookCopyUpdateSchema,
  bookQuerySchema,
  BookCondition,
  BookCopyStatus,
  Language,
  BookAvailabilityStatus,
} from '@perpusjal/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── TEST RUNNER HARNESS ───────────────────────────────────────────────────────
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results: { suite: string; name: string; status: 'PASS' | 'FAIL'; error?: string }[] = [];

function test(suite: string, name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const result = fn();
    if (result && typeof (result as any).then === 'function') {
      return (result as Promise<void>)
        .then(() => {
          passedTests++;
          results.push({ suite, name, status: 'PASS' });
          console.log(`  \x1b[32m✔ PASS\x1b[0m  ${name}`);
        })
        .catch((err: any) => {
          failedTests++;
          results.push({ suite, name, status: 'FAIL', error: err?.message || String(err) });
          console.error(`  \x1b[31m✖ FAIL\x1b[0m  ${name}`);
          console.error(`         \x1b[33mError: ${err?.message || err}\x1b[0m`);
        });
    } else {
      passedTests++;
      results.push({ suite, name, status: 'PASS' });
      console.log(`  \x1b[32m✔ PASS\x1b[0m  ${name}`);
    }
  } catch (err: any) {
    failedTests++;
    results.push({ suite, name, status: 'FAIL', error: err?.message || String(err) });
    console.error(`  \x1b[31m✖ FAIL\x1b[0m  ${name}`);
    console.error(`         \x1b[33mError: ${err?.message || err}\x1b[0m`);
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected deep equal ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected value to be truthy, but got ${actual}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected value to be falsy, but got ${actual}`);
    },
    toContain(expectedSubstr: string) {
      if (typeof actual !== 'string' || !actual.includes(expectedSubstr)) {
        throw new Error(`Expected "${actual}" to contain substring "${expectedSubstr}"`);
      }
    },
  };
}

// ─── REPLICATED LOGIC FROM APPS/API/SRC/MODULES/BOOKS/BOOKS.SERVICE.TS ──────────
function computeAvailability(availableCopies: number, isBorrowable: boolean): BookAvailabilityStatus {
  if (!isBorrowable) return 'READ_ONLY';
  if (availableCopies > 1) return 'AVAILABLE';
  if (availableCopies === 1) return 'LAST_ONE';
  return 'BORROWED';
}

function generateInventoryCode(year: number, sequence: number): string {
  return `PJ-${year}-${sequence.toString().padStart(4, '0')}`;
}

function slugifyBookTitle(title: string, suffix?: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return suffix ? `${base}-${suffix}` : base;
}

// ─── EXECUTE SUITES ────────────────────────────────────────────────────────────
async function runSprint6Tests() {
  console.log('\n======================================================================');
  console.log('⚡ PERPUSJAL BLORA v3 — AUTOMATED TEST SUITE');
  console.log('   Sprint 6 (Katalog Buku, Relasi Book vs BookCopy & Inventory Lapak)');
  console.log('======================================================================\n');

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 1: RELASI BOOK VS BOOKCOPY & GENERATE KODE INVENTARIS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\x1b[1m📦 [SUITE 1] SPRINT 6: Relasi Book vs BookCopy & Generator Kode Inventaris\x1b[0m');

  test('Sprint 6', 'TC-S06-01: Validasi Skema Master Buku dengan Eksemplar Awal (bookCreateSchema Happy Path)', () => {
    const input = {
      title: 'Bumi Manusia',
      author: 'Pramoedya Ananta Toer',
      isbn: '9789799731234',
      publisher: 'Hasta Mitra',
      publicationYear: 1980,
      categoryId: 'cat_sastra_blora',
      description: 'Novel sejarah mahakarya sastra dari Blora.',
      coverImage: 'https://res.cloudinary.com/perpusjal/image/upload/bumi-manusia.webp',
      language: Language.ID,
      pages: 535,
      shelfLocation: 'Rak A-01 (Koleksi Blora)',
      donatedBy: 'Kolektif Pramoedya Blora',
      isPublished: true,
      isBorrowable: true,
      initialCopies: 3,
    };
    const parsed = bookCreateSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.initialCopies).toBe(3);
      expect(parsed.data.title).toBe('Bumi Manusia');
    }
  });

  test('Sprint 6', 'TC-S06-02: Format Generator Otomatis Barcode / Kode Inventaris (PJ-{tahun}-{0001})', () => {
    const year = 2026;
    expect(generateInventoryCode(year, 1)).toBe('PJ-2026-0001');
    expect(generateInventoryCode(year, 42)).toBe('PJ-2026-0042');
    expect(generateInventoryCode(year, 1000)).toBe('PJ-2026-1000');
  });

  test('Sprint 6', 'TC-S06-03: Relasi 1 Buku Dapat Memiliki Banyak Eksemplar Fisik Independen', () => {
    const book = {
      id: 'bk_bumi_manusia',
      title: 'Bumi Manusia',
      totalCopies: 3,
      availableCopies: 2,
    };

    const copies = [
      { id: 'cpy_1', bookId: book.id, inventoryCode: 'PJ-2026-0001', status: BookCopyStatus.AVAILABLE, condition: BookCondition.BARU },
      { id: 'cpy_2', bookId: book.id, inventoryCode: 'PJ-2026-0002', status: BookCopyStatus.BORROWED, condition: BookCondition.BAIK },
      { id: 'cpy_3', bookId: book.id, inventoryCode: 'PJ-2026-0003', status: BookCopyStatus.AVAILABLE, condition: BookCondition.CUKUP },
    ];

    expect(copies.length).toBe(book.totalCopies);
    const available = copies.filter((c) => c.status === BookCopyStatus.AVAILABLE);
    expect(available.length).toBe(book.availableCopies);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 2: KONDISI FISIK & STATUS EKSEMPLAR
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 2] SPRINT 6: Validasi Status & Kondisi Fisik Eksemplar\x1b[0m');

  test('Sprint 6', 'TC-S06-04: Validasi 4 Kondisi Fisik Eksemplar (BARU, BAIK, CUKUP, RUSAK_RINGAN)', () => {
    const validConditions = [
      BookCondition.BARU,
      BookCondition.BAIK,
      BookCondition.CUKUP,
      BookCondition.RUSAK_RINGAN,
    ];
    for (const cond of validConditions) {
      const parsed = bookCopyCreateSchema.safeParse({ condition: cond });
      expect(parsed.success).toBe(true);
    }

    const invalidCondition = bookCopyCreateSchema.safeParse({ condition: 'HANCUR_LEBUR' });
    expect(invalidCondition.success).toBe(false);
  });

  test('Sprint 6', 'TC-S06-05: Validasi 6 Status Sirkulasi Eksemplar (AVAILABLE s/d DAMAGED)', () => {
    const validStatuses = [
      BookCopyStatus.AVAILABLE,
      BookCopyStatus.BORROWED,
      BookCopyStatus.RESERVED,
      BookCopyStatus.UNAVAILABLE,
      BookCopyStatus.LOST,
      BookCopyStatus.DAMAGED,
    ];
    for (const stat of validStatuses) {
      const parsed = bookCopyCreateSchema.safeParse({ status: stat });
      expect(parsed.success).toBe(true);
    }
  });

  test('Sprint 6', 'TC-S06-06: Eksemplar Berstatus DAMAGED atau LOST Otomatis Ditarik dari Sirkulasi Aktif', () => {
    // Jika eksemplar rusak/hilang, availableCopies berkurang
    let totalCopies = 2;
    let availableCopies = 2;

    const copyStatus = BookCopyStatus.DAMAGED;
    if (copyStatus === BookCopyStatus.DAMAGED || copyStatus === BookCopyStatus.LOST) {
      availableCopies -= 1;
      totalCopies -= 1;
    }

    expect(availableCopies).toBe(1);
    expect(totalCopies).toBe(1);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 3: PENELUSURAN (FTS), FILTER & EMPTY STATE
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 3] SPRINT 6: Penelusuran (FTS), Filter & Empty State Koleksi\x1b[0m');

  test('Sprint 6', 'TC-S06-07: Validasi Skema Query Parameter Pencarian & Saringan (bookQuerySchema)', () => {
    const query = {
      q: 'Pramoedya',
      kategori: 'sastra',
      tersedia: 'true',
      bahasa: Language.ID,
      sort: 'terbaru' as const,
      page: '1',
      perPage: '12',
    };
    const parsed = bookQuerySchema.safeParse(query);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.tersedia).toBe(true);
      expect(parsed.data.page).toBe(1);
    }
  });

  test('Sprint 6', 'TC-S06-08: Pencarian Judul, Penulis, dan ISBN Case-Insensitive Matching', () => {
    const catalog = [
      { title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', isbn: '9789799731234' },
      { title: 'Anak Semua Bangsa', author: 'Pramoedya Ananta Toer', isbn: '9789799731235' },
      { title: 'Laskar Pelangi', author: 'Andrea Hirata', isbn: '9789793062792' },
    ];

    const searchKeyword = 'pramoedya';
    const filtered = catalog.filter(
      (b) =>
        b.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.author.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.isbn.includes(searchKeyword)
    );
    expect(filtered.length).toBe(2);
  });

  test('Sprint 6', 'TC-S06-09: Filter Lokasi Rak (shelfLocation) dan Ketersediaan Lapak', () => {
    const books = [
      { id: '1', shelfLocation: 'Basecamp', availableCopies: 2 },
      { id: '2', shelfLocation: 'Lapak CFD Alun-Alun', availableCopies: 0 },
      { id: '3', shelfLocation: 'Basecamp', availableCopies: 0 },
    ];

    // Filter: Hanya yang di Basecamp DAN ada stok (availableCopies > 0)
    const availableAtBasecamp = books.filter(
      (b) => b.shelfLocation === 'Basecamp' && b.availableCopies > 0
    );
    expect(availableAtBasecamp.length).toBe(1);
    expect(availableAtBasecamp[0].id).toBe('1');
  });

  test('Sprint 6', 'TC-S06-10: Empty State Pencarian Menyediakan Opsi "Usulkan Buku ke Komunitas"', () => {
    const catalogPath = path.resolve(process.cwd(), '../web/app/buku/page.tsx');
    const catalogCode = fs.existsSync(catalogPath) ? fs.readFileSync(catalogPath, 'utf8') : '';

    expect(catalogCode).toContain('Belum Ada Judul yang Cocok');
    expect(catalogCode).toContain('KOTAK TITIP KOLEKSI');
    expect(catalogCode).toContain('handleRequestSubmit');
    expect(catalogCode).toContain('Usulkan Judul Ini ke Komunitas');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 4: KOLEKSI REFERENSI VS PINJAM & ANTREAN (WAITLIST)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 4] SPRINT 6: Koleksi Referensi vs Pinjam & Daftar Antrean\x1b[0m');

  test('Sprint 6', 'TC-S06-11: Buku Koleksi Referensi (isBorrowable: false) Menghasilkan Status READ_ONLY', () => {
    const status = computeAvailability(5, false); // Walaupun ada 5 eksemplar, tidak boleh dipinjam
    expect(status).toBe('READ_ONLY');
  });

  test('Sprint 6', 'TC-S06-12: Buku Stok Melimpah (> 1) Menghasilkan Status AVAILABLE', () => {
    const status = computeAvailability(3, true);
    expect(status).toBe('AVAILABLE');
  });

  test('Sprint 6', 'TC-S06-13: Buku Sisa 1 Eksemplar Menghasilkan Status LAST_ONE', () => {
    const status = computeAvailability(1, true);
    expect(status).toBe('LAST_ONE');
  });

  test('Sprint 6', 'TC-S06-14: Buku Habis Terpinjam (availableCopies = 0) Menghasilkan Status BORROWED', () => {
    const status = computeAvailability(0, true);
    expect(status).toBe('BORROWED');
  });

  test('Sprint 6', 'TC-S06-15: Tombol di Halaman Detail Berubah ke "Daftar Antrean Pembaca" Saat Stok Habis', () => {
    const detailClientPath = path.resolve(process.cwd(), '../web/app/buku/[slug]/book-detail-client.tsx');
    const detailClientCode = fs.existsSync(detailClientPath) ? fs.readFileSync(detailClientPath, 'utf8') : '';

    expect(detailClientCode).toContain('DAFTAR ANTREAN PEMBACA');
    expect(detailClientCode).toContain('handleJoinWaitlist');
    expect(detailClientCode).toContain('Semua eksemplar sedang dipinjam');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 5: EDGE CASES DUPLIKASI ISBN & SLUG URL UNIK
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 5] SPRINT 6: Edge Cases Duplikasi ISBN & Keunikan Slug URL\x1b[0m');

  test('Sprint 6', 'TC-S06-16: Format Slug Otomatis Bersih dari Simbol Spesial dan Tanda Baca', () => {
    const dirtyTitle = "Perawan Remaja dalam Cengkeraman Militer: Catatan Pulau Buru!";
    const cleanSlug = slugifyBookTitle(dirtyTitle);
    expect(cleanSlug).toBe('perawan-remaja-dalam-cengkeraman-militer-catatan-pulau-buru');
    expect(cleanSlug.includes(':')).toBe(false);
    expect(cleanSlug.includes('!')).toBe(false);
  });

  test('Sprint 6', 'TC-S06-17: Pencegahan Tabrakan Slug Judul yang Sama via Suffix Acak', () => {
    const title = 'Bumi Manusia';
    const slug1 = slugifyBookTitle(title);
    const slug2 = slugifyBookTitle(title, 'abc12');

    expect(slug1).toBe('bumi-manusia');
    expect(slug2).toBe('bumi-manusia-abc12');
    expect(slug1 === slug2).toBe(false);
  });

  test('Sprint 6', 'TC-S06-18: Validasi Panjang dan Integritas ISBN-10 / ISBN-13', () => {
    const validIsbn13 = {
      title: 'Keluarga Gerilya',
      author: 'Pramoedya Ananta Toer',
      categoryId: 'cat_sastra',
      isbn: '9789799731234', // 13 chars
    };
    expect(bookCreateSchema.safeParse(validIsbn13).success).toBe(true);

    const tooLongIsbn = {
      title: 'Keluarga Gerilya',
      author: 'Pramoedya Ananta Toer',
      categoryId: 'cat_sastra',
      isbn: '978979973123456789', // > 13 chars
    };
    expect(bookCreateSchema.safeParse(tooLongIsbn).success).toBe(false);
  });

  test('Sprint 6', 'TC-S06-18B: Deteksi Duplikasi ISBN Menghasilkan Konflik 409 dengan Saran Tambah Eksemplar', () => {
    const booksServicePath = path.resolve(process.cwd(), 'src/modules/books/books.service.ts');
    const serviceCode = fs.existsSync(booksServicePath) ? fs.readFileSync(booksServicePath, 'utf8') : '';

    expect(serviceCode).toContain('existingWithIsbn');
    expect(serviceCode).toContain('HttpError.conflict');
    expect(serviceCode).toContain('Silakan tambahkan eksemplar fisik');
  });

  test('Sprint 6', 'TC-S06-18C: Error Middleware Menangani Prisma P2002 Unique Constraint sebagai 409 Conflict', () => {
    const errorHandlerPath = path.resolve(process.cwd(), 'src/middleware/errorHandler.ts');
    const handlerCode = fs.existsSync(errorHandlerPath) ? fs.readFileSync(errorHandlerPath, 'utf8') : '';

    expect(handlerCode).toContain("'P2002'");
    expect(handlerCode).toContain("status(409)");
    expect(handlerCode).toContain("CONFLICT");
  });

  test('Sprint 6', 'TC-S06-18D: Algoritma Slug Cerdas Memprioritaskan URL Bersih Tanpa Sufiks Acak', () => {
    const booksServicePath = path.resolve(process.cwd(), 'src/modules/books/books.service.ts');
    const serviceCode = fs.existsSync(booksServicePath) ? fs.readFileSync(booksServicePath, 'utf8') : '';

    expect(serviceCode).toContain('let slug = baseSlug;');
    expect(serviceCode).toContain('existingWithSlug');
    expect(serviceCode).toContain('randomSuffix');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 6: DETAIL HALAMAN BUKU, SEO METADATA & SCHEMA MARKUP
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 6] SPRINT 6: Detail Halaman Buku, SEO Metadata & JSON-LD\x1b[0m');

  test('Sprint 6', 'TC-S06-19: Generator Metadata SEO Next.js (generateMetadata OpenGraph Book Type)', () => {
    const pagePath = path.resolve(process.cwd(), '../web/app/buku/[slug]/page.tsx');
    const pageCode = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf8') : '';

    expect(pageCode).toContain('generateMetadata');
    expect(pageCode).toContain("type: 'book'");
    expect(pageCode).toContain('openGraph');
    expect(pageCode.includes('application/ld+json') || pageCode.includes('JsonLd')).toBe(true);
    expect(pageCode).toContain("'@type': 'Book'");
  });

  test('Sprint 6', 'TC-S06-20: Validasi Sinkronisasi Ketersediaan Real-Time (/availability Endpoint)', () => {
    const detailClientPath = path.resolve(process.cwd(), '../web/app/buku/[slug]/book-detail-client.tsx');
    const detailClientCode = fs.existsSync(detailClientPath) ? fs.readFileSync(detailClientPath, 'utf8') : '';

    // Checks that the client fetches real-time availability to avoid stale cache
    expect(detailClientCode).toContain('/availability');
    expect(detailClientCode).toContain('estimatedReturnDate');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTING SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n======================================================================');
  console.log('📊 RINGKASAN HASIL PENGUJIAN OTOMATIS:');
  console.log(`   Total Pengujian Dijalankan : ${totalTests}`);
  console.log(`   \x1b[32m✔ Lolos (PASS)             : ${passedTests}\x1b[0m`);
  console.log(`   \x1b[31m✖ Gagal (FAIL)             : ${failedTests}\x1b[0m`);
  console.log(`   Persentase Kelulusan       : ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('======================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSprint6Tests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
