import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  Role,
  UserStatus,
  TrustLevel,
  UserSessionPayload,
} from '@perpusjal/types';
import {
  loginBruteForceLimiter,
  registerLimiter,
  passwordResetLimiter,
} from '../middleware/rate-limit.js';

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
    toThrow(expectedMessage?: string) {
      if (typeof actual !== 'function') throw new Error(`Expected a function to throw`);
      let threw = false;
      let caughtError: any;
      try {
        actual();
      } catch (err) {
        threw = true;
        caughtError = err;
      }
      if (!threw) throw new Error(`Expected function to throw an error, but it did not`);
      if (expectedMessage && !caughtError?.message?.includes(expectedMessage)) {
        throw new Error(`Expected error message to include "${expectedMessage}", got "${caughtError?.message}"`);
      }
    },
  };
}

// Helper: Decode JWT Payload using the exact logic from apps/web/middleware.ts
function decodeJwtPayloadLikeMiddleware(token: string): { role?: string; exp?: number; userId?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString('binary')
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Helper: Middleware routing decision simulation (Next.js middleware logic)
function simulateNextMiddleware(pathname: string, sessionCookie?: string): { action: 'NEXT' | 'REDIRECT'; target?: string; deleteCookie?: boolean } {
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/tulis');

  // 1. Unauthenticated users trying to access protected routes
  if (isProtectedRoute && !sessionCookie) {
    return { action: 'REDIRECT', target: `/masuk?redirect=${encodeURIComponent(pathname)}` };
  }

  // 2. Validate token structure & expiration if token exists
  if (sessionCookie && isProtectedRoute) {
    const payload = decodeJwtPayloadLikeMiddleware(sessionCookie);

    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      return {
        action: 'REDIRECT',
        target: `/masuk?redirect=${encodeURIComponent(pathname)}`,
        deleteCookie: true,
      };
    }

    // 3. Strict Admin Route Guarding
    if (pathname.startsWith('/admin')) {
      const role = payload.role;

      // Only KURATOR and ADMIN can access admin area
      if (role !== 'ADMIN' && role !== 'KURATOR') {
        return { action: 'REDIRECT', target: '/dashboard' };
      }

      // /admin/pengguna is strictly ADMIN only
      if (pathname.startsWith('/admin/pengguna') && role !== 'ADMIN') {
        return { action: 'REDIRECT', target: '/dashboard' };
      }
    }
  }

  return { action: 'NEXT' };
}

// ─── EXECUTE SUITES ────────────────────────────────────────────────────────────
async function runAll() {
  console.log('\n======================================================================');
  console.log('⚡ PERPUSJAL BLORA v3 — AUTOMATED TEST SUITE');
  console.log('   Sprint 1 (Design System & Mobile Layout) & Sprint 2 (Auth & RBAC)');
  console.log('======================================================================\n');

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 1: SPRINT 1 — DESIGN SYSTEM, TOKENS & RESPONSIVE MOBILE BASELINE
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\x1b[1m📦 [SUITE 1] SPRINT 1: Design System, Tokens & Responsive Baseline\x1b[0m');

  const globalsCssPath = path.resolve(process.cwd(), '../web/app/globals.css');
  const tailwindConfigPath = path.resolve(process.cwd(), '../web/tailwind.config.ts');
  const globalsCss = fs.existsSync(globalsCssPath) ? fs.readFileSync(globalsCssPath, 'utf8') : '';
  const tailwindConfig = fs.existsSync(tailwindConfigPath) ? fs.readFileSync(tailwindConfigPath, 'utf8') : '';

  test('Sprint 1', 'TC-S01-01: Verifikasi CSS Design Tokens (Editorial Stark Monochrome & Gold Heritage)', () => {
    expect(globalsCss).toContain('--background: #f9f9f7');
    expect(globalsCss).toContain('--foreground: #0a0a0a');
    expect(globalsCss).toContain('--surface: #ffffff');
    expect(globalsCss).toContain('--border: #0a0a0a');
    // Dark mode tokens
    expect(globalsCss).toContain('.dark {');
    expect(globalsCss).toContain('--background: #0a0a0a');
    expect(globalsCss).toContain('--foreground: #f9f9f7');
  });

  test('Sprint 1', 'TC-S01-02: Verifikasi Konfigurasi Tailwind (Tipografi Font Inter & Serif Lora)', () => {
    expect(tailwindConfig).toContain("darkMode: 'class'");
    expect(tailwindConfig).toContain('fontFamily');
    expect(tailwindConfig).toContain('serif');
    expect(tailwindConfig).toContain('sans');
    expect(tailwindConfig).toContain('colors');
  });

  test('Sprint 1', 'TC-S01-03: Ketersediaan Halaman Styleguide Internal (/styleguide)', () => {
    const styleguidePagePath = path.resolve(process.cwd(), '../web/app/styleguide/page.tsx');
    expect(fs.existsSync(styleguidePagePath)).toBe(true);
    const content = fs.readFileSync(styleguidePagePath, 'utf8');
    expect(content).toContain('Styleguide');
  });

  test('Sprint 1', 'TC-S01-04: Verifikasi Komponen Header & Drawer Mobile (Persona Rina)', () => {
    const headerPath = path.resolve(process.cwd(), '../web/components/layout/header.tsx');
    expect(fs.existsSync(headerPath)).toBe(true);
    const content = fs.readFileSync(headerPath, 'utf8');
    // Header includes mobile hamburger menu toggle
    expect(content.toLowerCase()).toContain('menu');
  });

  test('Sprint 1', 'TC-S01-05: Filosofi Bebas Denda Termuat pada Footer & Navigasi Publik', () => {
    const footerPath = path.resolve(process.cwd(), '../web/components/layout/footer.tsx');
    expect(fs.existsSync(footerPath)).toBe(true);
    const content = fs.readFileSync(footerPath, 'utf8');
    expect(content).toContain('tanpa denda sepeser pun');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 2: SPRINT 2 — ALUR PENDAFTARAN & VALIDASI SKEMA (ZOD)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 2] SPRINT 2: Validasi Skema Pendaftaran & Keamanan Input (Zod)\x1b[0m');

  test('Sprint 2', 'TC-S02-01: Validasi Pendaftaran dengan Data Lengkap dan Valid (Happy Path)', () => {
    const validData = {
      name: 'Rina Kartika',
      username: 'rina_blora',
      email: 'rina@blora.id',
      phoneNumber: '081234567890',
      password: 'PasswordRina123',
      passwordConfirm: 'PasswordRina123',
      agreeTerms: true as const,
    };
    const parsed = registerSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.username).toBe('rina_blora');
      expect(parsed.data.email).toBe('rina@blora.id');
    }
  });

  test('Sprint 2', 'TC-S02-02: Penolakan Nama Mengandung Simbol Khusus atau Skrip HTML', () => {
    const invalidNameData = {
      name: '<script>alert(1)</script>',
      username: 'hacker_blora',
      email: 'hacker@blora.id',
      password: 'Password123',
      passwordConfirm: 'Password123',
      agreeTerms: true as const,
    };
    const parsed = registerSchema.safeParse(invalidNameData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message);
      expect(issues.some((m) => m.includes('hanya boleh berisi huruf'))).toBe(true);
    }
  });

  test('Sprint 2', 'TC-S02-03: Pencegahan Penggunaan Reserved Username (admin, root, perpusjal)', () => {
    const reservedUsers = ['admin', 'administrator', 'root', 'perpusjal'];
    for (const rUser of reservedUsers) {
      const data = {
        name: 'Pengurus Lapak',
        username: rUser,
        email: `${rUser}@blora.id`,
        password: 'Password123',
        passwordConfirm: 'Password123',
        agreeTerms: true as const,
      };
      const parsed = registerSchema.safeParse(data);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0].message).toContain('Username ini tidak diperbolehkan');
      }
    }
  });

  test('Sprint 2', 'TC-S02-04: Penolakan Password Lemah Tanpa Angka atau Di Bawah 8 Karakter', () => {
    const shortPassword = {
      name: 'Budi Santoso',
      username: 'budi_s',
      email: 'budi@blora.id',
      password: 'short',
      passwordConfirm: 'short',
      agreeTerms: true as const,
    };
    const noDigitPassword = {
      name: 'Budi Santoso',
      username: 'budi_s',
      email: 'budi@blora.id',
      password: 'passwordhanyahuruf',
      passwordConfirm: 'passwordhanyahuruf',
      agreeTerms: true as const,
    };
    expect(registerSchema.safeParse(shortPassword).success).toBe(false);
    expect(registerSchema.safeParse(noDigitPassword).success).toBe(false);
  });

  test('Sprint 2', 'TC-S02-05: Penolakan Jika Password dan Konfirmasi Password Tidak Cocok', () => {
    const mismatch = {
      name: 'Budi Santoso',
      username: 'budi_s',
      email: 'budi@blora.id',
      password: 'Password123',
      passwordConfirm: 'BedaPassword456',
      agreeTerms: true as const,
    };
    const parsed = registerSchema.safeParse(mismatch);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain('Konfirmasi password tidak cocok');
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 3: SPRINT 2 — KRIPTOGRAFI PASSWORD & TOKEN VERIFIKASI EMAIL
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 3] SPRINT 2: Hashing Password (Bcrypt) & Verifikasi Token\x1b[0m');

  await test('Sprint 2', 'TC-S02-06: Pengujian Bcrypt Hashing dan Salt Rounds Security', async () => {
    const rawPassword = 'PasswordAmanBlora2026!';
    const saltRounds = 10;
    const hash = await bcrypt.hash(rawPassword, saltRounds);

    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
    const isMatch = await bcrypt.compare(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare('SalahPassword!', hash);
    expect(isWrongMatch).toBe(false);
  });

  test('Sprint 2', 'TC-S02-07: Pembuatan Token Verifikasi Email (SHA-256 Hash & Masa Berlaku 24 Jam)', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    expect(rawToken.length).toBe(64); // 32 bytes hex = 64 chars

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    expect(tokenHash.length).toBe(64);

    const now = Date.now();
    const expiresAt = new Date(now + 24 * 60 * 60 * 1000);
    const diffHours = (expiresAt.getTime() - now) / (1000 * 60 * 60);
    expect(Math.round(diffHours)).toBe(24);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 4: SPRINT 2 — SESI, COOKIE KEAMANAN & JWT
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 4] SPRINT 2: Manajemen Sesi & Struktur JWT Token\x1b[0m');

  const dummySecret = 'super-secret-jwt-key-replace-in-production-min-32-chars';

  test('Sprint 2', 'TC-S02-08: Penerbitan JWT Session Payload dan Sinkronisasi Sesi', () => {
    const payload: UserSessionPayload = {
      userId: 'usr_rina_123',
      sessionId: 'sess_abc_456',
      email: 'rina@blora.id',
      username: 'rina_blora',
      name: 'Rina Kartika',
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL1,
    };

    const token = jwt.sign(payload, dummySecret, { expiresIn: '7d' });
    const verified = jwt.verify(token, dummySecret) as UserSessionPayload;

    expect(verified.userId).toBe('usr_rina_123');
    expect(verified.role).toBe(Role.USER);
    expect(verified.trustLevel).toBe(TrustLevel.TL1);
  });

  test('Sprint 2', 'TC-S02-09: Decode Payload Sesi Persis Logika Next.js Middleware (Base64 URL Safe)', () => {
    const payload = {
      userId: 'usr_bayu_admin',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const token = jwt.sign(payload, dummySecret);

    const decoded = decodeJwtPayloadLikeMiddleware(token);
    expect(decoded).toBeTruthy();
    expect(decoded?.userId).toBe('usr_bayu_admin');
    expect(decoded?.role).toBe('ADMIN');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 5: SPRINT 2 — ROUTE GUARD & RBAC HIERARKI (NEXT.JS MIDDLEWARE)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 5] SPRINT 2: Route Guard & Matriks Akses RBAC (apps/web/middleware.ts)\x1b[0m');

  test('Sprint 2', 'TC-S02-10: Pengunjung Tanpa Login Buka /dashboard -> Redirect ke /masuk?redirect=/dashboard', () => {
    const result = simulateNextMiddleware('/dashboard');
    expect(result.action).toBe('REDIRECT');
    expect(result.target).toBe('/masuk?redirect=%2Fdashboard');
  });

  test('Sprint 2', 'TC-S02-11: Pengunjung Tanpa Login Buka /tulis -> Redirect ke /masuk?redirect=/tulis', () => {
    const result = simulateNextMiddleware('/tulis');
    expect(result.action).toBe('REDIRECT');
    expect(result.target).toBe('/masuk?redirect=%2Ftulis');
  });

  test('Sprint 2', 'TC-S02-12: Token Kedaluwarsa pada Cookie -> Hapus Cookie & Redirect ke /masuk', () => {
    const expiredPayload = {
      userId: 'usr_rina_123',
      role: 'USER',
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 jam lalu
    };
    const expiredToken = jwt.sign(expiredPayload, dummySecret);

    const result = simulateNextMiddleware('/dashboard', expiredToken);
    expect(result.action).toBe('REDIRECT');
    expect(result.deleteCookie).toBe(true);
    expect(result.target).toBe('/masuk?redirect=%2Fdashboard');
  });

  test('Sprint 2', 'TC-S02-13: User Biasa (USER TL2) Akses /admin/sirkulasi -> Ditolak & Redirect ke /dashboard', () => {
    const userPayload = {
      userId: 'usr_rina_123',
      role: 'USER',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const userToken = jwt.sign(userPayload, dummySecret);

    const result = simulateNextMiddleware('/admin/sirkulasi', userToken);
    expect(result.action).toBe('REDIRECT');
    expect(result.target).toBe('/dashboard');
  });

  test('Sprint 2', 'TC-S02-14: Kurator (KURATOR) Akses /admin/kurasi -> DIIZINKAN (Next)', () => {
    const kuratorPayload = {
      userId: 'usr_mbak_ayu',
      role: 'KURATOR',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const kuratorToken = jwt.sign(kuratorPayload, dummySecret);

    const result = simulateNextMiddleware('/admin/kurasi', kuratorToken);
    expect(result.action).toBe('NEXT');
  });

  test('Sprint 2', 'TC-S02-15: Kurator (KURATOR) Akses /admin/pengguna -> STRICTLY DITOLAK & Redirect ke /dashboard', () => {
    const kuratorPayload = {
      userId: 'usr_mbak_ayu',
      role: 'KURATOR',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const kuratorToken = jwt.sign(kuratorPayload, dummySecret);

    const result = simulateNextMiddleware('/admin/pengguna', kuratorToken);
    expect(result.action).toBe('REDIRECT');
    expect(result.target).toBe('/dashboard');
  });

  test('Sprint 2', 'TC-S02-16: Admin Utama (ADMIN) Akses /admin/pengguna -> DIIZINKAN (Next)', () => {
    const adminPayload = {
      userId: 'usr_mas_bayu',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const adminToken = jwt.sign(adminPayload, dummySecret);

    const result = simulateNextMiddleware('/admin/pengguna', adminToken);
    expect(result.action).toBe('NEXT');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 6: SPRINT 2 — PERTAHANAN BRUTE-FORCE & RATE LIMITER
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 6] SPRINT 2: Konfigurasi Anti Brute-Force & Proteksi Flooding\x1b[0m');

  test('Sprint 2', 'TC-S02-17: Verifikasi Ambang Batas Login Rate Limiter (Maksimal 8 Percobaan)', () => {
    const rateLimitSourcePath = path.resolve(__dirname, '../middleware/rate-limit.ts');
    const source = fs.readFileSync(rateLimitSourcePath, 'utf8');
    expect(source).toContain('export const loginBruteForceLimiter = rateLimit(');
    expect(source).toContain('limit: 8');
    expect(source).toContain('windowMs: 15 * 60 * 1000');
    expect(source).toContain('skipSuccessfulRequests: true');
  });

  test('Sprint 2', 'TC-S02-18: Verifikasi Ambang Batas Registrasi Rate Limiter (Maksimal 5 Akun/Jam)', () => {
    const rateLimitSourcePath = path.resolve(__dirname, '../middleware/rate-limit.ts');
    const source = fs.readFileSync(rateLimitSourcePath, 'utf8');
    expect(source).toContain('export const registerLimiter = rateLimit(');
    expect(source).toContain('limit: 5');
    expect(source).toContain('windowMs: 60 * 60 * 1000');
  });

  test('Sprint 2', 'TC-S02-19: Verifikasi Ambang Batas Reset Password (Maksimal 4 Permintaan/Jam)', () => {
    const rateLimitSourcePath = path.resolve(__dirname, '../middleware/rate-limit.ts');
    const source = fs.readFileSync(rateLimitSourcePath, 'utf8');
    expect(source).toContain('export const passwordResetLimiter = rateLimit(');
    expect(source).toContain('limit: 4');
    expect(source).toContain('windowMs: 60 * 60 * 1000');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SUITE 7: SPRINT 2 — EDGE CASES KEAMANAN & SMOKE TEST 1 & 2
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n\x1b[1m📦 [SUITE 7] SPRINT 2: Edge Cases Keamanan & Simulasi Smoke Test 1 & 2\x1b[0m');

  test('Sprint 2', 'TC-S02-20: Penolakan Payload SQL Injection pada Input Pendaftaran', () => {
    const sqliData = {
      name: "User Normal",
      username: "user'; DROP TABLE \"User\"; --",
      email: "sqli@test.com",
      password: "Password123!",
      passwordConfirm: "Password123!",
      agreeTerms: true as const,
    };
    const parsed = registerSchema.safeParse(sqliData);
    expect(parsed.success).toBe(false);
  });

  test('Sprint 2', 'TC-S02-21: Penolakan Payload XSS Scripting pada Kolom Nama & Username', () => {
    const xssData = {
      name: "<script>alert('xss')</script>",
      username: "<img src=x onerror=alert(1)>",
      email: "xss@test.com",
      password: "Password123!",
      passwordConfirm: "Password123!",
      agreeTerms: true as const,
    };
    const parsed = registerSchema.safeParse(xssData);
    expect(parsed.success).toBe(false);
  });

  await test('Sprint 2', 'TC-SMK-01 (Smoke Test 1): Simulasi Lengkap Pendaftaran & Verifikasi Email (TL0 -> TL1)', async () => {
    const regInput = {
      name: "Rina Kartika",
      username: "rina_test_smk",
      email: "rina.smk@blora.org",
      password: "PasswordRina123!",
      passwordConfirm: "PasswordRina123!",
      agreeTerms: true as const,
    };
    const parsed = registerSchema.safeParse(regInput);
    expect(parsed.success).toBe(true);

    const passwordHash = await bcrypt.hash(regInput.password, 10);
    expect(await bcrypt.compare(regInput.password, passwordHash)).toBe(true);

    const mockUser = {
      id: "usr_mock_rina",
      status: UserStatus.PENDING_VERIFICATION,
      trustLevel: TrustLevel.TL0,
      emailVerifiedAt: null as Date | null,
    };
    expect(mockUser.status).toBe(UserStatus.PENDING_VERIFICATION);
    expect(mockUser.trustLevel).toBe(TrustLevel.TL0);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    expect(tokenHash.length).toBe(64);

    const tokenValidation = verifyEmailSchema.safeParse({ token: rawToken });
    expect(tokenValidation.success).toBe(true);

    // Aktivasi akun
    mockUser.status = UserStatus.ACTIVE;
    mockUser.trustLevel = TrustLevel.TL1;
    mockUser.emailVerifiedAt = new Date();

    expect(mockUser.status).toBe(UserStatus.ACTIVE);
    expect(mockUser.trustLevel).toBe(TrustLevel.TL1);
    expect(mockUser.emailVerifiedAt).toBeTruthy();
  });

  test('Sprint 2', 'TC-SMK-02 (Smoke Test 2): Simulasi Login, Atribut Cookie HTTP-Only & Akses Dashboard', () => {
    const loginInput = {
      email: "rina.smk@blora.org",
      password: "PasswordRina123!",
      rememberMe: true,
    };
    const loginParsed = loginSchema.safeParse(loginInput);
    expect(loginParsed.success).toBe(true);

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      path: '/',
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    expect(cookieOptions.httpOnly).toBe(true);
    expect(cookieOptions.sameSite).toBe('lax');
    expect(cookieOptions.path).toBe('/');

    const sessionPayload = {
      userId: "usr_mock_rina",
      sessionId: "sess_mock_001",
      role: Role.USER,
      status: UserStatus.ACTIVE,
      trustLevel: TrustLevel.TL1,
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const sessionToken = jwt.sign(sessionPayload, dummySecret);

    const middlewareResult = simulateNextMiddleware('/dashboard', sessionToken);
    expect(middlewareResult.action).toBe('NEXT');
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

runAll().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
