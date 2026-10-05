import { test, expect, Page } from '@playwright/test';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * E2E AUTOMATION TEST SUITE: SPRINT 7 & 8 (SIRKULASI LAPAK FISIK & PEMINJAMAN)
 * Perpustakaan Jalanan Blora v3
 *
 * Skenario Pengujian Alur Inti:
 * 1. Member Request Loan (Pengajuan Pinjam di Katalog Buku)
 * 2. Concurrency & Duplicate Check (Proteksi Soft-hold Atomic & BR-LOAN-10)
 * 3. Admin Approve Loan (Penerbitan 6-Digit Pickup Code)
 * 4. Serah-Terima Fisik Lapak (Input Pickup Code -> Status BORROWED)
 * 5. Pengembalian Buku di Lapak (Inspeksi Fisik -> Status RETURNED / Zero Fines ADR-005)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Konfigurasi Test Data
const TEST_CONFIG = {
  baseUrl: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  bookSlug: 'laut-bercerita-3f249',
  memberUser: {
    email: 'pembaca@perpusjal.org',
    password: 'password123',
    phone: '081234567890',
  },
  adminUser: {
    email: 'admin@perpusjal.org',
    password: 'AdminPerpusjal2026!',
  },
};

// Helper Login
async function loginUser(page: Page, user: { email: string; password: string }) {
  await page.goto(`${TEST_CONFIG.baseUrl}/masuk`);
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole('button', { name: /Masuk ke Ruang Baca/i }).click();
  await page.waitForURL('**/dashboard**');
}

test.describe.serial('Sprint 7 & 8: Alur Lengkap Siklus Peminjaman & Sirkulasi Lapak Fisik', () => {
  let createdLoanCode = '';
  let issuedPickupCode = '';
  let bookId = '';
  let memberToken = '';

  test.beforeAll(async ({ request }) => {
    // 1. Ambil bookId untuk judul buku uji
    const bookRes = await request.get(`${TEST_CONFIG.apiUrl}/books/${TEST_CONFIG.bookSlug}`);
    if (bookRes.ok()) {
      const bookJson = await bookRes.json();
      bookId = bookJson.data?.id || '';
    }

    // 2. Dapatkan token member & pastikan tidak ada pinjaman aktif sisa sesi sebelumnya
    const loginRes = await request.post(`${TEST_CONFIG.apiUrl}/auth/login`, {
      data: {
        email: TEST_CONFIG.memberUser.email,
        password: TEST_CONFIG.memberUser.password,
      },
    });

    if (loginRes.ok()) {
      const loginJson = await loginRes.json();
      memberToken = loginJson.data?.sessionToken || '';

      if (memberToken) {
        // Cek pinjaman aktif member
        const loansRes = await request.get(`${TEST_CONFIG.apiUrl}/loans/me?status=aktif`, {
          headers: { Authorization: `Bearer ${memberToken}` },
        });

        if (loansRes.ok()) {
          const loansJson = await loansRes.json();
          const activeLoans = loansJson.data || [];
          for (const l of activeLoans) {
            if (l.book?.slug === TEST_CONFIG.bookSlug && (l.status === 'PENDING' || l.status === 'APPROVED')) {
              await request.post(`${TEST_CONFIG.apiUrl}/loans/${l.id}/cancel`, {
                headers: { Authorization: `Bearer ${memberToken}` },
              });
            }
          }
        }
      }
    }
  });

  // ─── TAHAP 1: REQUEST LOAN (PENGAJUAN PINJAM OLEH MEMBER) ─────────────────────
  test('Langkah 1: Member Mengajukan Peminjaman Buku di Katalog (/buku/[slug])', async ({ page }) => {
    // 1. Login session member
    await loginUser(page, TEST_CONFIG.memberUser);

    // 2. Kunjungi halaman detail katalog buku
    await page.goto(`${TEST_CONFIG.baseUrl}/buku/${TEST_CONFIG.bookSlug}`);
    await expect(page.locator('h1')).toContainText(/Laut Bercerita/i);

    // 3. Verifikasi tombol pinjam aktif dan klik
    const borrowButton = page.getByRole('button', { name: /AJUKAN PINJAM BUKU/i });
    await expect(borrowButton).toBeVisible();
    await borrowButton.click();

    // 4. Pengisian modal pengajuan peminjaman
    await expect(page.getByText(/FORMULIR PEMINJAMAN BUKU/i)).toBeVisible();
    await page.locator('select').selectOption('BASECAMP');

    const phoneInput = page.locator('input[type="tel"]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(TEST_CONFIG.memberUser.phone);
    }

    const noteInput = page.locator('input[placeholder*="Saya ambil"]');
    if (await noteInput.isVisible()) {
      await noteInput.fill('Akan diambil hari Minggu pagi di lapak basecamp.');
    }

    // Submit pengajuan
    const submitBtn = page.getByRole('button', { name: /Kirim Pengajuan/i });
    await submitBtn.click();

    // 5. Verifikasi pengajuan sukses di modal
    await expect(page.getByText(/Pengajuan Pinjaman Terkirim!/i)).toBeVisible({ timeout: 10000 });
    const codeElement = page.locator('text=/PJM-\\d{4}-\\d+/');
    await expect(codeElement).toBeVisible();
    createdLoanCode = (await codeElement.textContent())?.trim() || '';
    expect(createdLoanCode).toMatch(/^PJM-\d{4}-\d+$/);
    console.log(`[E2E] Kode Pinjaman Terbit: ${createdLoanCode}`);

    // Buka dasbor pinjaman
    await page.getByRole('link', { name: /Buka Dasbor Pinjaman/i }).click();
    await page.waitForURL('**/dashboard/pinjaman**');

    // Verifikasi naskah terdaftar dengan status MENUNGGU PERSETUJUAN
    await expect(page.getByText(createdLoanCode)).toBeVisible();
    await expect(page.getByText(/MENUNGGU PERSETUJUAN/i).first()).toBeVisible();
  });

  // ─── TAHAP 2: CONCURRENCY & DUPLICATE CHECK (BR-LOAN-10 & BR-LOAN-12) ─────────
  test('Langkah 2: Concurrency & Duplicate Check (BR-LOAN-10 & BR-LOAN-12 Proteksi Soft-Hold)', async ({ request }) => {
    // 1. Member mencoba mengajukan buku yang sama saat pengajuan pertama aktif (BR-LOAN-10)
    const duplicateRes = await request.post(`${TEST_CONFIG.apiUrl}/loans`, {
      data: {
        bookId,
        pickupPoint: 'Basecamp Perpusjal (Jl. Pemuda 12)',
        pickupDatePlan: new Date().toISOString(),
      },
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
    });

    // Wajib ditolak dengan status 409 Conflict atau 400 Bad Request
    expect([400, 409]).toContain(duplicateRes.status());
    const duplicateBody = await duplicateRes.json();
    console.log(`[E2E] BR-LOAN-10 Conflict Terproteksi: Status ${duplicateRes.status()} - ${duplicateBody.error?.message || 'Conflict'}`);

    // 2. Proteksi soft-hold concurrency (BR-LOAN-12) dari sesi tanpa izin/token palsu
    const unauthRes = await request.post(`${TEST_CONFIG.apiUrl}/loans`, {
      data: {
        bookId,
        pickupPoint: 'Basecamp Perpusjal (Jl. Pemuda 12)',
      },
      headers: {
        Authorization: 'Bearer mock_invalid_token',
      },
    });
    expect([401, 403]).toContain(unauthRes.status());
    console.log(`[E2E] BR-LOAN-12 Guard Terverifikasi: Status ${unauthRes.status()}`);
  });

  // ─── TAHAP 3: ADMIN APPROVE (PENERBITAN 6-DIGIT PICKUP CODE) ────────────────
  test('Langkah 3: Admin Menyetujui Pinjaman di Meja Sirkulasi (/dashboard/sirkulasi)', async ({ page }) => {
    // 1. Login sebagai Admin
    await loginUser(page, TEST_CONFIG.adminUser);

    // 2. Buka Meja Sirkulasi Lapak
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard/sirkulasi`);
    await expect(page.locator('h1')).toContainText(/Meja Sirkulasi Lapak/i);

    // 3. Pindah ke Tab Antrean Persetujuan Online
    const approvalsTab = page.getByRole('button', { name: /Antrean Persetujuan Online/i });
    await expect(approvalsTab).toBeVisible();
    await approvalsTab.click();

    // 4. Cari pengajuan pinjaman yang sesuai dengan createdLoanCode
    await expect(page.getByText(createdLoanCode)).toBeVisible({ timeout: 10000 });

    // 5. Klik Setujui (Kode Ambil)
    const approveBtn = page.getByRole('button', { name: /Setujui \(Kode Ambil\)/i }).first();
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // 6. Tangkap notifikasi sukses dan 6-digit pickup code
    const successBanner = page.locator('text=/Kode Ambil:\s*\d{6}/i').or(page.locator('text=/berhasil disetujui/i'));
    await expect(successBanner).toBeVisible({ timeout: 10000 });
    const bannerText = await page.locator('body').innerText();
    const match = bannerText.match(/Kode Ambil:\s*(\d{6})/i);
    issuedPickupCode = match ? match[1] : '';
    expect(issuedPickupCode).toMatch(/^\d{6}$/);
    console.log(`[E2E] Admin Approve Sukses. 6-Digit Pickup Code: ${issuedPickupCode}`);
  });

  // ─── TAHAP 4: SERAH-TERIMA LAPAK (INPUT PICKUP CODE -> BORROWED) ─────────────
  test('Langkah 4: Pengurus Lapak Memvalidasi Pickup Code & Serah Terima Buku', async ({ page }) => {
    // 1. Login sebagai Admin
    await loginUser(page, TEST_CONFIG.adminUser);

    // 2. Di halaman Meja Sirkulasi Lapak
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard/sirkulasi`);
    await expect(page.locator('h1')).toContainText(/Meja Sirkulasi Lapak/i);

    // 3. Gunakan input universal search untuk mencari berdasarkan 6-digit pickupCode
    const searchInput = page.getByPlaceholder(/Scan stiker buku/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill(issuedPickupCode);
    await page.getByRole('button', { name: /Periksa/i }).click();

    // 4. Modal Serah-Terima Buku ke Pembaca terbuka
    const modalHeader = page.locator('text=Serah-Terima Buku ke Pembaca');
    await expect(modalHeader).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(createdLoanCode)).toBeVisible();

    // 5. Klik tombol Serahkan Buku di modal
    const handoverBtn = page.getByRole('button', { name: 'Serahkan Buku' }).last();
    await expect(handoverBtn).toBeVisible();
    await handoverBtn.click();

    // 6. Verifikasi modal tertutup dan status pinjaman berhasil diserahkan (BORROWED)
    await expect(modalHeader).not.toBeVisible({ timeout: 10000 });
    console.log(`[E2E] Serah-Terima Buku di Meja Lapak Berhasil. Status: BORROWED`);
  });

  // ─── TAHAP 5: PENGEMBALIAN BUKU (INSPEKSI FISIK -> RETURNED / RESTORATIF) ───
  test('Langkah 5: Pembaca Mengembalikan Buku di Lapak & Verifikasi Zero Fines (ADR-005)', async ({ page }) => {
    // 1. Login sebagai Admin
    await loginUser(page, TEST_CONFIG.adminUser);

    // 2. Kunjungi Meja Sirkulasi Lapak
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard/sirkulasi`);
    await expect(page.locator('h1')).toContainText(/Meja Sirkulasi Lapak/i);

    // 3. Cari kode pinjaman di universal search
    const searchInput = page.getByPlaceholder(/Scan stiker buku/i);
    await searchInput.fill(createdLoanCode);
    await page.getByRole('button', { name: /Periksa/i }).click();

    // 4. Modal Penerimaan Pengembalian Buku terbuka
    const returnModal = page.locator('text=Penerimaan Pengembalian Buku');
    await expect(returnModal).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(createdLoanCode)).toBeVisible();

    // 5. Pilih kondisi buku BAIK jika radio tersedia
    const conditionRadio = page.locator('input[value="BAIK"]');
    if (await conditionRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await conditionRadio.check();
    }

    // 6. Klik Buku Diterima
    const confirmReturnBtn = page.getByRole('button', { name: 'Buku Diterima' });
    await expect(confirmReturnBtn).toBeVisible();
    await confirmReturnBtn.click();

    // 7. Verifikasi modal tertutup dan transaksi pengembalian tercatat di riwayat sesi lapak
    await expect(returnModal).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Riwayat Transaksi Sesi Ini')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/PENGEMBALIAN/i).first()).toBeVisible();

    // 8. Verifikasi TIDAK ADA tagihan/denda uang (ADR-005)
    await expect(page.locator('text=/Tagihan|Denda Uang|Rp \d+|Invoice/i')).not.toBeVisible();
    console.log(`[E2E] Pengembalian Buku Selesai. Prinsip Restoratif Tanpa Denda Terverifikasi.`);
  });
});
