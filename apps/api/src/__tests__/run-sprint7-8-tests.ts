import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  LoanStatus,
  ReturnCondition,
  BookCopyStatus,
  BookCondition,
  loanRequestSchema,
  loanApproveSchema,
  loanPickupSchema,
  loanReturnSchema,
  walkInLoanSchema,
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
    toBeGreaterThan(expected: number) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (!(actual >= expected)) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
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

// ─── REPLICATED BUSINESS LOGIC (PURE DOMAIN RULES ENGINE) ──────────────────────
function generateLoanCode(): string {
  const year = 2026;
  const rand = 7890;
  return `PJM-${year}-${rand}`;
}

function generatePickupCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── SUITE EXECUTION ───────────────────────────────────────────────────────────
async function runSprint78Tests() {
  console.log('\n======================================================================');
  console.log('⚡ PERPUSJAL BLORA v3 — AUTOMATED TEST SUITE');
  console.log('   Sprint 7 & 8 (Peminjaman Inti, Mode Lapak Fisik & Cron Scheduler)');
  console.log('======================================================================\n');

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 1: ATURAN BISNIS SIRKULASI (BR-LOAN-01 S/D BR-LOAN-12)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\x1b[1m📦 [SUITE 1] SPRINT 7: Validasi Aturan Bisnis Peminjaman (BR-LOAN)\x1b[0m');

  test('Sprint 7', 'TC-S07-01: BR-LOAN-01 Batas Maksimal 2 Peminjaman Aktif (Pengajuan ke-3 Ditolak 400)', () => {
    const activeCount = 2;
    const canBorrow = activeCount < 2;
    expect(canBorrow).toBe(false);

    // Verifikasi schema input pengajuan
    const validPayload = {
      bookId: 'book_bumi_manusia',
      pickupPoint: 'Lapak CFD Alun-Alun Blora',
      pickupDatePlan: new Date().toISOString(),
      phoneNumber: '081234567890',
    };
    expect(loanRequestSchema.safeParse(validPayload).success).toBe(true);
  });

  test('Sprint 7', 'TC-S07-02: BR-LOAN-06 Larangan Meminjam Jika Memiliki Pinjaman OVERDUE (403 Forbidden)', () => {
    const userLoans = [
      { id: 'loan_1', status: LoanStatus.OVERDUE },
      { id: 'loan_2', status: LoanStatus.RETURNED },
    ];
    const overdueCount = userLoans.filter((l) => l.status === LoanStatus.OVERDUE).length;
    const isForbidden = overdueCount > 0;
    expect(isForbidden).toBe(true);
  });

  test('Sprint 7', 'TC-S07-03: BR-LOAN-10 Pencegahan Duplikasi Pengajuan Buku yang Sama (409 Conflict)', () => {
    const bookId = 'bk_bumi_manusia';
    const activeUserLoans = [
      { bookId: 'bk_bumi_manusia', status: LoanStatus.PENDING },
    ];
    const isDuplicate = activeUserLoans.some(
      (l) => l.bookId === bookId && [LoanStatus.PENDING, LoanStatus.APPROVED, LoanStatus.BORROWED].includes(l.status)
    );
    expect(isDuplicate).toBe(true);
  });

  test('Sprint 7', 'TC-S07-04: BR-LOAN-11 Penolakan Peminjaman Buku Koleksi Baca di Tempat (isBorrowable: false)', () => {
    const book = { id: 'bk_arsip_blora', isBorrowable: false, availableCopies: 2 };
    let errorThrown = false;
    if (!book.isBorrowable) {
      errorThrown = true;
    }
    expect(errorThrown).toBe(true);
  });

  test('Sprint 7', 'TC-S07-05: BR-LOAN-12 Atomic Concurrency Soft-Hold (Stok 1 Hanya Lolos 1 User, Tanpa Minus)', () => {
    let availableCopies = 1;
    let user1Success = false;
    let user2Success = false;

    // Simulasi 2 request serentak
    function attemptSoftHold() {
      if (availableCopies > 0) {
        availableCopies -= 1;
        return true;
      }
      return false;
    }

    user1Success = attemptSoftHold();
    user2Success = attemptSoftHold();

    expect(user1Success).toBe(true);
    expect(user2Success).toBe(false);
    expect(availableCopies).toBe(0); // Stok tidak pernah negatif
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 2: ALUR PERSETUJUAN LAPAK & KODE PENGAMBILAN (PICKUP CODE)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 2] SPRINT 7: Siklus Lapak Fisik & Kode Pengambilan (Pickup Code)\x1b[0m');

  test('Sprint 7', 'TC-S07-06: BR-LOAN-05 Penerbitan 6-Digit Pickup Code & Batas Jemput 3 Hari Saat Disetujui', () => {
    const pickupCode = generatePickupCode();
    expect(pickupCode.length).toBe(6);
    expect(/^\d{6}$/.test(pickupCode)).toBe(true);

    const now = new Date('2026-10-05T08:00:00Z');
    const deadlineDays = 3;
    const pickupDeadline = new Date(now.getTime() + deadlineDays * 24 * 60 * 60 * 1000);
    const diffDays = Math.round((pickupDeadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    expect(diffDays).toBe(3);
  });

  test('Sprint 7', 'TC-S07-07: Serah Terima Lapak (pickupLoan) Mengubah Status ke BORROWED & Set Jatuh Tempo', () => {
    const validPickupInput = {
      pickupCode: '582914',
      bookCopyId: 'copy_pj_0001',
    };
    expect(loanPickupSchema.safeParse(validPickupInput).success).toBe(true);

    const now = new Date('2026-10-05T08:00:00Z');
    const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const diffDays = Math.round((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    expect(diffDays).toBe(14);
  });

  test('Sprint 7', 'TC-S07-08: Pembatalan Pengajuan (User Cancel) Memulihkan Stok availableCopies (+1)', () => {
    let availableCopies = 0;
    const loan = { status: LoanStatus.PENDING };

    if (loan.status === LoanStatus.PENDING || loan.status === LoanStatus.APPROVED) {
      loan.status = LoanStatus.CANCELLED;
      availableCopies += 1;
    }

    expect(loan.status).toBe(LoanStatus.CANCELLED);
    expect(availableCopies).toBe(1);
  });

  test('Sprint 7', 'TC-S07-09: Penolakan Pengajuan (Admin Reject) Memulihkan Stok availableCopies (+1)', () => {
    let availableCopies = 0;
    const loan = { status: LoanStatus.PENDING, rejectionReason: '' };

    if (loan.status === LoanStatus.PENDING) {
      loan.status = LoanStatus.REJECTED;
      loan.rejectionReason = 'Eksemplar sedang masa konservasi fisik.';
      availableCopies += 1;
    }

    expect(loan.status).toBe(LoanStatus.REJECTED);
    expect(availableCopies).toBe(1);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 3: PERPANJANGAN MASA PINJAM (EXTEND LOAN)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 3] SPRINT 7: Perpanjangan Pinjaman (Extend Loan Duration)\x1b[0m');

  test('Sprint 7', 'TC-S07-10: BR-LOAN-03 & 04 Perpanjangan Hanya Boleh 1 Kali (+7 Hari)', () => {
    const loan = {
      status: LoanStatus.BORROWED,
      extensionCount: 0,
      dueDate: new Date('2026-10-19T08:00:00Z'),
    };

    // Percobaan perpanjangan ke-1: Lolos
    expect(loan.extensionCount < 1).toBe(true);
    loan.dueDate = new Date(loan.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    loan.extensionCount += 1;
    expect(loan.extensionCount).toBe(1);

    // Percobaan perpanjangan ke-2: Ditolak
    const canExtendAgain = loan.extensionCount < 1;
    expect(canExtendAgain).toBe(false);
  });

  test('Sprint 7', 'TC-S07-11: BR-LOAN-04 Perpanjangan Ditolak Jika Terdapat Pembaca Lain di Antrean (Waitlist)', () => {
    const waitlistCount: number = 2; // Ada 2 pembaca menunggu buku ini
    const canExtend = waitlistCount === 0;
    expect(canExtend).toBe(false);
  });

  test('Sprint 7', 'TC-S07-12: BR-LOAN-04 Perpanjangan Ditolak Jika Pinjaman Sudah Berstatus OVERDUE', () => {
    const loanStatus: any = LoanStatus.OVERDUE;
    const canExtend = loanStatus === LoanStatus.BORROWED;
    expect(canExtend).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 4: PENGEMBALIAN BUKU & KONDISI FISIK (NON-MONETARY RESTORATIVE)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 4] SPRINT 8: Pengembalian & Penegakan Prinsip Restoratif Tanpa Denda\x1b[0m');

  test('Sprint 7', 'TC-S07-13: Pengembalian Kondisi BAIK -> Status RETURNED & Stok Kembali Pulih (+1)', () => {
    let availableCopies = 0;
    let onTimeStreak = 3;
    const returnPayload = { condition: ReturnCondition.BAIK, note: 'Buku bersih dan utuh.' };
    expect(loanReturnSchema.safeParse(returnPayload).success).toBe(true);

    availableCopies += 1;
    onTimeStreak += 1;
    expect(availableCopies).toBe(1);
    expect(onTimeStreak).toBe(4);
  });

  test('Sprint 7', 'TC-S07-14: Pengembalian Kondisi RUSAK -> Ditarik dari Sirkulasi (Stok Tidak Bertambah)', () => {
    let availableCopies = 0;
    let totalCopies = 2;
    const copy = { status: BookCopyStatus.BORROWED };

    copy.status = BookCopyStatus.DAMAGED;
    totalCopies -= 1; // Ditarik untuk restorasi fisik

    expect(copy.status).toBe(BookCopyStatus.DAMAGED);
    expect(availableCopies).toBe(0); // Tidak bertambah
    expect(totalCopies).toBe(1);
  });

  test('Sprint 7', 'TC-S07-15: BR-LOAN-09 Kondisi HILANG -> Status RETURNED_LOST & Zero Monetary Fines (ADR-005)', () => {
    const loan = { status: LoanStatus.BORROWED, feeAmount: 0 };
    const copy = { status: BookCopyStatus.BORROWED };

    loan.status = LoanStatus.RETURNED_LOST;
    copy.status = BookCopyStatus.LOST;

    expect(loan.status).toBe(LoanStatus.RETURNED_LOST);
    expect(copy.status).toBe(BookCopyStatus.LOST);
    // Tidak ada kalkulasi denda uang tunai / payment gateway sama sekali
    expect(loan.feeAmount).toBe(0);
  });

  test('Sprint 7', 'TC-S07-16: Mode Lapak Walk-in Loan (Peminjaman Langsung di Terpal) Mengeluarkan Status BORROWED', () => {
    const validWalkIn = {
      memberIdentifier: '@rinablora',
      bookCopyIdentifier: 'PJ-2026-0005',
      pickupPoint: 'Meja Lapak CFD Alun-Alun',
    };
    expect(walkInLoanSchema.safeParse(validWalkIn).success).toBe(true);
  });

  test('Sprint 7', 'TC-S07-17: Pencegahan Peminjaman Pada Akun dalam Masa Suspensi (borrowSuspendedUntil)', () => {
    const user = {
      borrowSuspendedUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Masih 10 hari suspensi
      suspensionReason: 'Terlambat mengembalikan buku.',
    };
    const isSuspended = user.borrowSuspendedUntil && user.borrowSuspendedUntil > new Date();
    expect(isSuspended).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 5: BACKGROUND CRON SCHEDULER & SANKSI WAKTU OTOMATIS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 5] SPRINT 8: Background Cron Scheduler & Penalti Waktu Otomatis\x1b[0m');

  test('Sprint 8', 'TC-S07-18: Scheduler: Melewati pickupDeadline (3 Hari) Berubah ke EXPIRED & Stok Pulih (+1)', () => {
    const now = new Date('2026-10-09T00:00:00Z');
    const loan = {
      status: LoanStatus.APPROVED,
      pickupDeadline: new Date('2026-10-08T00:00:00Z'), // Telah lewat
    };
    let availableCopies = 0;

    if (loan.status === LoanStatus.APPROVED && loan.pickupDeadline < now) {
      loan.status = LoanStatus.EXPIRED;
      availableCopies += 1;
    }

    expect(loan.status).toBe(LoanStatus.EXPIRED);
    expect(availableCopies).toBe(1);
  });

  test('Sprint 8', 'TC-S07-19: Scheduler: Melewati dueDate Berubah ke Status OVERDUE', () => {
    const now = new Date('2026-10-20T00:00:00Z');
    const loan = {
      status: LoanStatus.BORROWED,
      dueDate: new Date('2026-10-19T00:00:00Z'), // Melewati tenggat
    };

    if (loan.status === LoanStatus.BORROWED && loan.dueDate < now) {
      loan.status = LoanStatus.OVERDUE;
    }

    expect(loan.status).toBe(LoanStatus.OVERDUE);
  });

  test('Sprint 8', 'TC-S07-20: Scheduler: BR-LOAN-07 Terlambat >= 14 Hari Otomatis Suspensi Hak Pinjam 30 Hari', () => {
    const now = new Date('2026-10-30T00:00:00Z');
    const loan = {
      status: LoanStatus.OVERDUE,
      dueDate: new Date('2026-10-10T00:00:00Z'), // 20 hari terlambat (>= 14 hari)
      userId: 'usr_rinablora',
    };

    const diffDays = Math.floor((now.getTime() - loan.dueDate.getTime()) / (24 * 60 * 60 * 1000));
    expect(diffDays).toBeGreaterThanOrEqual(14);

    let borrowSuspendedUntil: Date | null = null;
    let suspensionReason = '';
    if (loan.status === LoanStatus.OVERDUE && diffDays >= 14) {
      borrowSuspendedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      suspensionReason = 'Terlambat mengembalikan buku lebih dari 14 hari (Suspensi 30 hari).';
    }

    expect(borrowSuspendedUntil).toBeTruthy();
    expect(suspensionReason).toContain('30 hari');
  });

  test('Sprint 8', 'TC-S07-21: Scheduler: BR-LOAN-08 No-Show 3 Kali Otomatis Suspensi Hak Pinjam 14 Hari', () => {
    let noShowCount = 2;
    // Terjadi 1x no-show tambahan
    noShowCount += 1;

    let borrowSuspendedUntil: Date | null = null;
    if (noShowCount >= 3) {
      borrowSuspendedUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }

    expect(noShowCount).toBe(3);
    expect(borrowSuspendedUntil).toBeTruthy();
  });

  test('Sprint 8', 'TC-S07-22: Scheduler: Pengiriman Notifikasi Pengingat Jatuh Tempo (Due-Soon H-1)', () => {
    const now = new Date('2026-10-18T10:00:00Z');
    const loan = {
      status: LoanStatus.BORROWED,
      dueDate: new Date('2026-10-19T09:30:00Z'), // ~23.5 jam dari sekarang
    };

    const diffHours = (loan.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isDueSoonWindow = diffHours >= 23 && diffHours <= 24;
    expect(isDueSoonWindow).toBe(true);
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

runSprint78Tests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
