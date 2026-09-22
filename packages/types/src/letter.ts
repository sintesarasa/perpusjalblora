import { z } from 'zod';
import { LetterStatus } from './enums.js';

export const letterQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(10),
});

export type LetterQueryInput = z.infer<typeof letterQuerySchema>;

export const letterCreateSchema = z.object({
  title: z.string().min(5, 'Judul surat pembaca minimal 5 karakter.').max(120),
  content: z
    .string()
    .min(100, 'Isi surat pembaca minimal 100 karakter.')
    .max(15000, 'Isi surat pembaca maksimal 15.000 karakter.')
    .refine((val) => {
      const words = val.trim().split(/\s+/).length;
      return words >= 50 && words <= 2500;
    }, 'Surat pembaca harus memuat antara 50 hingga 2.500 kata.'),
  isAnonymous: z.boolean().default(false),
  displayName: z.string().max(60).optional().nullable(),
});

export type LetterCreateInput = z.infer<typeof letterCreateSchema>;

export const letterApproveSchema = z.object({
  editedContent: z.string().optional().nullable(),
});

export type LetterApproveInput = z.infer<typeof letterApproveSchema>;

export const letterRejectSchema = z.object({
  reason: z.string().min(2, 'Alasan penolakan surat minimal 2 karakter.').max(300),
});

export type LetterRejectInput = z.infer<typeof letterRejectSchema>;

export interface LetterItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  displayName: string;
  isAnonymous: boolean;
  publishedAt: string | null;
  createdAt: string;
  status: LetterStatus;
  author: {
    id: string;
    name: string;
    username: string;
  };
  commentCount: number;
}

export interface LetterDetail extends LetterItem {
  content: string;
  originalContent?: string | null;
  rejectionReason?: string | null;
}
