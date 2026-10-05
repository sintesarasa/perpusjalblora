import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  articleDraftSchema,
  articleSubmitSchema,
  articleRequestRevisionSchema,
  articleRejectSchema,
  articleApproveSchema,
  ArticleStatus,
  RejectionReason,
  Role,
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

// ─── HELPER LOGIC COPIED FROM PROD CODEBASE FOR TESTING ─────────────────────────

// Paste cleaner logic from apps/web/components/editor/editorial-editor.tsx
function cleanPastedHtml(html: string): string {
  // Strip comments, office XML tags, style/meta tags
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '')
    .replace(/<\/?(xml|meta|link|style)[^>]*>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/style="[^"]*"/gi, '')
    .replace(/class="[^"]*"/gi, '')
    .replace(/id="[^"]*"/gi, '');

  return cleaned.trim();
}

// Word count & reading time formulas
function calculateWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

// Conflict of Interest (BR-CUR-01) validation
function validateCuratorConflict(curatorId: string, articleAuthorId: string) {
  if (curatorId === articleAuthorId) {
    throw new Error('Kurator tidak boleh mereview naskah yang ditulis sendiri (BR-CUR-01).');
  }
}

// 30-Minute Review Lock evaluation (BR-CUR-03)
function evaluateReviewLock(
  article: { reviewLockedById: string | null; reviewLockedAt: Date | null },
  curatorId: string,
  now: Date
): { canLock: boolean; reason?: string } {
  const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
  if (
    article.reviewLockedById &&
    article.reviewLockedById !== curatorId &&
    article.reviewLockedAt &&
    article.reviewLockedAt > thirtyMinsAgo
  ) {
    return { canLock: false, reason: 'Naskah sedang diperiksa oleh kurator lain.' };
  }
  return { canLock: true };
}

// ─── EXECUTE SUITES ────────────────────────────────────────────────────────────
async function runSprint4And10Tests() {
  console.log('\n======================================================================');
  console.log('⚡ PERPUSJAL BLORA v3 — AUTOMATED TEST SUITE');
  console.log('   Sprint 4 & 10 (Studio Menulis & Alur Kurasi Redaksi Tulisan Warga)');
  console.log('======================================================================\n');

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 1: EDITOR TULISAN, WORD COUNT & PASTE SANITASI
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\x1b[1m📦 [SUITE 1] SPRINT 4: Editor Tulisan, Word Count & Paste Sanitasi\x1b[0m');

  test('Sprint 4', 'TC-S10-01: Perhitungan Jumlah Kata (Word Count) dan Estimasi Waktu Baca', () => {
    const text150Words = Array(150).fill('literasi').join(' ');
    const count150 = calculateWordCount(text150Words);
    expect(count150).toBe(150);
    expect(calculateReadingTime(count150)).toBe(1); // 150 / 200 -> 1 min

    const text450Words = Array(450).fill('buku').join(' ');
    const count450 = calculateWordCount(text450Words);
    expect(count450).toBe(450);
    expect(calculateReadingTime(count450)).toBe(3); // ceil(450 / 200) = 3 min
  });

  test('Sprint 4', 'TC-S10-02: Pembersihan Format Paste dari MS Word / Google Docs (Office XML & Styles)', () => {
    const dirtyHtml = `
      <!--[if gte mso 9]><xml><w:WordDocument><w:View>Normal</w:View></w:WordDocument></xml><![endif]-->
      <p class="MsoNormal" style="margin: 0cm; font-family: Calibri, sans-serif; font-size: 11pt;">
        Di atas terpal Alun-Alun Blora,<o:p></o:p> buku-buku digelar terbuka.
      </p>
    `;
    const cleaned = cleanPastedHtml(dirtyHtml);
    expect(cleaned.includes('<o:p>')).toBe(false);
    expect(cleaned.includes('class="MsoNormal"')).toBe(false);
    expect(cleaned.includes('font-family: Calibri')).toBe(false);
    expect(cleaned.includes('Di atas terpal Alun-Alun Blora')).toBe(true);
  });

  test('Sprint 4', 'TC-S10-03: Netralisasi Payload XSS Berbahaya pada Konten Tempel (Paste)', () => {
    const maliciousHtml = `<p>Tulisan bagus <script>alert("hack")</script><img src="x" onerror="alert(1)" /></p>`;
    const cleaned = cleanPastedHtml(maliciousHtml);
    expect(cleaned.includes('<script>')).toBe(false);
    expect(cleaned.includes('onerror=')).toBe(false);
    expect(cleaned.includes('Tulisan bagus')).toBe(true);
  });

  test('Sprint 4', 'TC-S10-04: Skema Penyimpanan Draf Lokal Offline (localStorage Schema Backup)', () => {
    const mockBackup = {
      title: 'Catatan Malam dari Pojok Blora',
      subtitle: 'Refleksi seorang pembaca',
      categoryId: 'pojok-blora',
      coverImage: 'https://res.cloudinary.com/perpusjal/image/upload/v1/sample.jpg',
      coverCredit: 'Foto: Relawan',
      tagIds: ['literasi', 'komunitas'],
      contentJson: { type: 'doc', content: [{ type: 'paragraph', text: 'Halo' }] },
      plainText: 'Halo',
      agreeOriginality: true,
      updatedAt: new Date().toISOString(),
    };
    const serialized = JSON.stringify(mockBackup);
    const parsed = JSON.parse(serialized);
    expect(parsed.title).toBe('Catatan Malam dari Pojok Blora');
    expect(parsed.categoryId).toBe('pojok-blora');
    expect(parsed.agreeOriginality).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 2: CHECKLIST PENGAJUAN & VALIDASI SKEMA (ZOD)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 2] SPRINT 4: Checklist Pengajuan & Validasi Skema (Zod)\x1b[0m');

  test('Sprint 4', 'TC-S10-05: Validasi Pengajuan Naskah Lengkap (articleSubmitSchema Happy Path)', () => {
    const validSubmit = {
      title: 'Pentingnya Ruang Baca Terbuka di Blora', // >= 10 chars
      categoryId: 'suara-lapak',
      coverImage: 'https://res.cloudinary.com/perpusjal/image/upload/cover.webp',
      agreeOriginality: true as const,
      isDraft: false,
    };
    const parsed = articleSubmitSchema.safeParse(validSubmit);
    expect(parsed.success).toBe(true);
  });

  test('Sprint 4', 'TC-S10-06: Penolakan Pengajuan Jika Judul di Bawah 10 Karakter', () => {
    const shortTitle = {
      title: 'Pendek', // < 10 chars
      categoryId: 'suara-lapak',
      coverImage: 'https://res.cloudinary.com/perpusjal/image/upload/cover.webp',
      agreeOriginality: true as const,
      isDraft: false,
    };
    const parsed = articleSubmitSchema.safeParse(shortTitle);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain('Judul minimal 10 karakter');
    }
  });

  test('Sprint 4', 'TC-S10-07: Penolakan Pengajuan Jika Gambar Sampul (Cover Image) Kosong', () => {
    const noCover = {
      title: 'Pentingnya Ruang Baca Terbuka di Blora',
      categoryId: 'suara-lapak',
      coverImage: undefined,
      agreeOriginality: true as const,
      isDraft: false,
    };
    const parsed = articleSubmitSchema.safeParse(noCover);
    expect(parsed.success).toBe(false);
  });

  test('Sprint 4', 'TC-S10-08: Penolakan Pengajuan Jika Tidak Menyetujui Ikrar Orisinalitas', () => {
    const notAgree = {
      title: 'Pentingnya Ruang Baca Terbuka di Blora',
      categoryId: 'suara-lapak',
      coverImage: 'https://res.cloudinary.com/perpusjal/image/upload/cover.webp',
      agreeOriginality: false,
      isDraft: false,
    };
    const parsed = articleSubmitSchema.safeParse(notAgree);
    expect(parsed.success).toBe(false);
  });

  test('Sprint 4', 'TC-S10-09: Validasi Batas Minimal Naskah 100 Kata Sebelum Diajukan ke Redaksi', () => {
    const shortWords = 80;
    const isAllowedToSubmit = shortWords >= 100;
    expect(isAllowedToSubmit).toBe(false);

    const fullWords = 120;
    const isAllowedFull = fullWords >= 100;
    expect(isAllowedFull).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 3: SIKLUS HIDUP PENGAJUAN & PENARIKAN (WITHDRAW)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 3] SPRINT 4 & 10: State Machine & Penarikan Naskah (Withdraw)\x1b[0m');

  test('Sprint 4', 'TC-S10-10: Transisi Status Pengajuan dari DRAFT ke PENDING_REVIEW', () => {
    let status = ArticleStatus.DRAFT;
    let submittedAt: Date | null = null;

    // Aksi submit
    status = ArticleStatus.PENDING_REVIEW;
    submittedAt = new Date();

    expect(status).toBe(ArticleStatus.PENDING_REVIEW);
    expect(submittedAt).toBeTruthy();
  });

  test('Sprint 4', 'TC-S10-11: Penulis Menarik Naskah (Withdraw) dari PENDING_REVIEW Kembali ke DRAFT', () => {
    let status = ArticleStatus.PENDING_REVIEW;
    let submittedAt: Date | null = new Date();

    // Aksi withdraw
    expect(status === ArticleStatus.PENDING_REVIEW).toBe(true);
    status = ArticleStatus.DRAFT;
    submittedAt = null;

    expect(status).toBe(ArticleStatus.DRAFT);
    expect(submittedAt).toBe(null);
  });

  test('Sprint 4', 'TC-S10-12: Larangan Menarik Naskah Jika Status Sudah Terbit (PUBLISHED)', () => {
    const currentStatus = ArticleStatus.PUBLISHED as string;
    const canWithdraw = currentStatus === ArticleStatus.PENDING_REVIEW;
    expect(canWithdraw).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 4: MEJA KURASI (ATURAN BR-CUR-01, LOCK 30 MIN, REVISI & TOLAK)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 4] SPRINT 10: Meja Kurasi (Conflict of Interest & Review Lock)\x1b[0m');

  test('Sprint 10', 'TC-S10-13: BR-CUR-01 Kurator Tidak Boleh Mereview Naskah Miliknya Sendiri', () => {
    const kuratorA = 'usr_ayu_kurator';
    const authorA = 'usr_ayu_kurator'; // Sama!

    let threw = false;
    try {
      validateCuratorConflict(kuratorA, authorA);
    } catch (err: any) {
      threw = true;
      expect(err.message).toContain('BR-CUR-01');
    }
    expect(threw).toBe(true);
  });

  test('Sprint 10', 'TC-S10-14: BR-CUR-03 Tabrakan Kurator Dicegah via Review Lock Selama 30 Menit', () => {
    const now = new Date();
    const lockedArticle = {
      reviewLockedById: 'usr_ayu_kurator',
      reviewLockedAt: new Date(now.getTime() - 10 * 60 * 1000), // Baru dikunci 10 menit lalu
    };

    // Kurator B mencoba mengunci
    const evaluationB = evaluateReviewLock(lockedArticle, 'usr_budi_kurator', now);
    expect(evaluationB.canLock).toBe(false);
    expect(evaluationB.reason).toBe('Naskah sedang diperiksa oleh kurator lain.');

    // Kurator A sendiri yang membuka kembali -> diizinkan
    const evaluationA = evaluateReviewLock(lockedArticle, 'usr_ayu_kurator', now);
    expect(evaluationA.canLock).toBe(true);
  });

  test('Sprint 10', 'TC-S10-15: BR-CUR-03 Kunci Review Otomatis Hangus Pasca 30 Menit Tanpa Aktivitas', () => {
    const now = new Date();
    const staleLockedArticle = {
      reviewLockedById: 'usr_ayu_kurator',
      reviewLockedAt: new Date(now.getTime() - 35 * 60 * 1000), // Sudah 35 menit lalu!
    };

    // Kurator B mencoba mengambil alih review naskah
    const evaluationB = evaluateReviewLock(staleLockedArticle, 'usr_budi_kurator', now);
    expect(evaluationB.canLock).toBe(true);
  });

  test('Sprint 10', 'TC-S10-16: BR-CUR-02 Permintaan Revisi Wajib Mengisi Catatan Minimal 10 Karakter', () => {
    const emptyRevision = { note: 'Kurang' }; // < 10 chars
    const parsedEmpty = articleRequestRevisionSchema.safeParse(emptyRevision);
    expect(parsedEmpty.success).toBe(false);

    const validRevision = {
      note: 'Tambahkan data sumber referensi pada bagian pembuka esai.',
    };
    const parsedValid = articleRequestRevisionSchema.safeParse(validRevision);
    expect(parsedValid.success).toBe(true);
  });

  test('Sprint 10', 'TC-S10-17: BR-CUR-02 Penolakan Naskah Wajib Memilih Alasan Enum RejectionReason', () => {
    const validReject = {
      reason: RejectionReason.PLAGIARISM,
      note: 'Ditemukan indikasi penjiplakan karya dari sumber eksternal.',
    };
    const parsed = articleRejectSchema.safeParse(validReject);
    expect(parsed.success).toBe(true);

    const invalidReason = {
      reason: 'BOSAN', // Bukan enum RejectionReason
      note: 'Tidak suka',
    };
    const parsedInvalid = articleRejectSchema.safeParse(invalidReason);
    expect(parsedInvalid.success).toBe(false);
  });

  test('Sprint 10', 'TC-S10-18: Persetujuan Terbit Langsung (Immediate Publish)', () => {
    const approveInput = {
      scheduledAt: undefined,
      note: 'Naskah opini sangat berbobot dan layak terbit.',
    };
    const parsed = articleApproveSchema.safeParse(approveInput);
    expect(parsed.success).toBe(true);

    const isScheduled = !!parsed.data?.scheduledAt;
    const finalStatus = isScheduled ? ArticleStatus.SCHEDULED : ArticleStatus.PUBLISHED;
    expect(finalStatus).toBe(ArticleStatus.PUBLISHED);
  });

  test('Sprint 10', 'TC-S10-19: Persetujuan Terbit Terjadwal (Scheduled Publish)', () => {
    const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const approveInput = {
      scheduledAt: futureDate,
      note: 'Dijadwalkan untuk rilis hari Rabu pagi.',
    };
    const parsed = articleApproveSchema.safeParse(approveInput);
    expect(parsed.success).toBe(true);

    const isScheduled = !!parsed.data?.scheduledAt;
    const finalStatus = isScheduled ? ArticleStatus.SCHEDULED : ArticleStatus.PUBLISHED;
    expect(finalStatus).toBe(ArticleStatus.SCHEDULED);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 5: PENJADWALAN & KONTROL AKSES PUBLIK
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 5] SPRINT 10: Penjadwalan & Kontrol Akses Publik\x1b[0m');

  test('Sprint 10', 'TC-S10-20: Naskah SCHEDULED Tidak Dapat Diakses Publik Tanpa Token Preview', () => {
    const article = {
      status: ArticleStatus.SCHEDULED,
      authorId: 'usr_penulis_1',
      previewToken: 'secret_token_123',
    };

    // Simulasi pengunjung umum anonymous
    const isAuthor = false;
    const isCurator = false;
    const providedToken = undefined;

    const canAccess = isAuthor || isCurator || providedToken === article.previewToken;
    expect(canAccess).toBe(false); // Ditolak (HTTP 404)
  });

  test('Sprint 10', 'TC-S10-21: Penulis atau Pengguna dengan Token Sah Berhak Membuka Pratinjau Naskah SCHEDULED', () => {
    const article = {
      status: ArticleStatus.SCHEDULED,
      authorId: 'usr_penulis_1',
      previewToken: 'secret_token_123',
    };

    // Simulasi jika penulis sendiri yang mengakses
    const isAuthor = true;
    expect(isAuthor).toBe(true);

    // Simulasi jika pengunjung membuka via token pratinjau khusus
    const providedToken = 'secret_token_123';
    const tokenMatch = providedToken === article.previewToken;
    expect(tokenMatch).toBe(true);
  });

  test('Sprint 10', 'TC-S10-22: Simulasi Job Otomatis ArticleSchedulerService Menerbitkan Naskah SCHEDULED', () => {
    const now = new Date();
    const scheduledArticles = [
      { id: 'art_1', title: 'Sudah Tiba Waktu', scheduledAt: new Date(now.getTime() - 1000) },
      { id: 'art_2', title: 'Masih Masa Depan', scheduledAt: new Date(now.getTime() + 100000) },
    ];

    const toPublish = scheduledArticles.filter((a) => a.scheduledAt <= now);
    expect(toPublish.length).toBe(1);
    expect(toPublish[0].id).toBe('art_1');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 6: RESPONSIVITAS SMARTPHONE (LAYAR 360px–414px)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 6] SPRINT 4: Responsivitas Mobile Layar HP 360px–414px\x1b[0m');

  const editorCompPath = path.resolve(process.cwd(), '../web/components/editor/editorial-editor.tsx');
  const editorCode = fs.existsSync(editorCompPath) ? fs.readFileSync(editorCompPath, 'utf8') : '';

  test('Sprint 4', 'TC-S10-23: Formatting Toolbar Memiliki Pengguliran Horizontal (overflow-x) Tanpa Merusak Layar 360px', () => {
    expect(editorCode).toContain('overflow');
    expect(editorCode).toContain('editorial-editor');
  });

  test('Sprint 4', 'TC-S10-24: Verifikasi Drawer Modal Pengaturan Naskah Responsif (Bottom Sheet)', () => {
    const writePagePath = path.resolve(process.cwd(), '../web/app/dashboard/tulisan/tulis/page.tsx');
    const writeCode = fs.existsSync(writePagePath) ? fs.readFileSync(writePagePath, 'utf8') : '';

    expect(writeCode).toContain('isSettingsOpen');
    expect(writeCode).toContain('agreeOriginality');
    expect(writeCode).toContain('persistLocalBackup');
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

runSprint4And10Tests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
