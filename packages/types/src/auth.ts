import { z } from 'zod';
import { Role, UserStatus, TrustLevel } from './enums.js';

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Nama minimal 2 karakter.')
      .max(60, 'Nama maksimal 60 karakter.')
      .regex(/^[a-zA-Z\s.'’]+$/, 'Nama hanya boleh berisi huruf, spasi, titik, atau tanda petik.'),
    username: z
      .string()
      .min(3, 'Username minimal 3 karakter.')
      .max(20, 'Username maksimal 20 karakter.')
      .regex(/^[a-z0-9_]+$/, 'Username hanya boleh huruf kecil, angka, dan underscore.')
      .refine((val) => !['admin', 'administrator', 'root', 'perpusjal'].includes(val), {
        message: 'Username ini tidak diperbolehkan.',
      }),
    email: z
      .string()
      .email('Format email tidak valid.')
      .max(120, 'Email terlalu panjang.')
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter.')
      .regex(/[A-Za-z]/, 'Password harus mengandung setidaknya satu huruf.')
      .regex(/[0-9]/, 'Password harus mengandung setidaknya satu angka.'),
    passwordConfirm: z.string(),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'Kamu perlu menyetujui ketentuan.' }),
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['passwordConfirm'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid.').toLowerCase(),
  password: z.string().min(1, 'Password wajib diisi.'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token verifikasi wajib ada.'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid.').toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token reset password wajib ada.'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter.')
      .regex(/[A-Za-z]/, 'Password harus mengandung setidaknya satu huruf.')
      .regex(/[0-9]/, 'Password harus mengandung setidaknya satu angka.'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['passwordConfirm'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export interface UserSessionPayload {
  userId: string;
  sessionId?: string;
  email: string;
  username: string;
  name: string;
  role: Role;
  status: UserStatus;
  trustLevel: TrustLevel;
}
