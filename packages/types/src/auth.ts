import { z } from 'zod';
import { Role, UserStatus, TrustLevel } from './enums.js';

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Nama minimal 2 karakter.')
      .max(60, 'Nama maksimal 60 karakter.')
      .regex(/^[a-zA-Z\s.'’]+$/, 'Nama hanya boleh berisi huruf, spasi, titik, atau tanda petik.'),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, 'Username minimal 3 karakter.')
      .max(20, 'Username maksimal 20 karakter.')
      .regex(/^[a-z0-9_]+$/, 'Username hanya boleh huruf kecil, angka, dan underscore.')
      .refine((val) => !['admin', 'administrator', 'root', 'perpusjal'].includes(val), {
        message: 'Username ini tidak diperbolehkan.',
      }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Format email tidak valid.')
      .max(120, 'Email terlalu panjang.'),
    phoneNumber: z.string().trim().max(20, 'Nomor telepon maksimal 20 karakter.').optional().nullable(),
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
  email: z.string().trim().toLowerCase().email('Format email tidak valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token verifikasi wajib ada.'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Format email tidak valid.'),
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

export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email('Format email tidak valid.').optional(),
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Kata sandi lama wajib diisi.').optional(),
    currentPassword: z.string().min(1, 'Kata sandi saat ini wajib diisi.').optional(),
    newPassword: z
      .string()
      .min(8, 'Kata sandi baru minimal 8 karakter.')
      .regex(/[A-Za-z]/, 'Kata sandi baru harus mengandung setidaknya satu huruf.')
      .regex(/[0-9]/, 'Kata sandi baru harus mengandung setidaknya satu angka.'),
    confirmPassword: z.string().optional(),
    newPasswordConfirm: z.string().optional(),
  })
  .refine((data) => Boolean(data.oldPassword || data.currentPassword), {
    message: 'Kata sandi lama wajib diisi.',
    path: ['oldPassword'],
  })
  .refine(
    (data) => {
      const confirm = data.confirmPassword || data.newPasswordConfirm;
      if (confirm) {
        return data.newPassword === confirm;
      }
      return true;
    },
    {
      message: 'Konfirmasi kata sandi baru tidak cocok.',
      path: ['confirmPassword'],
    }
  );

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export interface UserSessionPayload {
  userId: string;
  id?: string;
  sessionId?: string;
  email: string;
  username: string;
  name: string;
  role: Role;
  status: UserStatus;
  trustLevel: TrustLevel;
}

