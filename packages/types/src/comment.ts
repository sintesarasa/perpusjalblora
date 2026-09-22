import { z } from 'zod';
import { CommentStatus, ReportReason, Role, TrustLevel } from './enums.js';

export const commentCreateSchema = z
  .object({
    articleId: z.string().optional(),
    letterId: z.string().optional(),
    parentId: z.string().optional(),
    content: z
      .string()
      .min(2, 'Komentar minimal 2 karakter.')
      .max(1500, 'Komentar maksimal 1500 karakter.')
      .refine(
        (val) => (val.match(/https?:\/\//g) || []).length <= 2,
        'Komentar maksimal menyertakan 2 tautan URL.'
      ),
  })
  .refine((data) => data.articleId || data.letterId, {
    message: 'articleId atau letterId wajib diisi.',
    path: ['articleId'],
  });

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;

export const commentUpdateSchema = z.object({
  content: z
    .string()
    .min(2, 'Komentar minimal 2 karakter.')
    .max(1500, 'Komentar maksimal 1500 karakter.')
    .refine(
      (val) => (val.match(/https?:\/\//g) || []).length <= 2,
      'Komentar maksimal menyertakan 2 tautan URL.'
    ),
});

export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;

export const commentReportSchema = z.object({
  reason: z.nativeEnum(ReportReason),
  note: z.string().max(300, 'Catatan laporan maksimal 300 karakter.').optional(),
});

export type CommentReportInput = z.infer<typeof commentReportSchema>;

export const commentQuerySchema = z.object({
  articleId: z.string().optional(),
  letterId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(10),
});

export type CommentQueryInput = z.infer<typeof commentQuerySchema>;

export interface CommentAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: Role;
  trustLevel: TrustLevel;
}

export interface CommentItem {
  id: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  editedAt: string | null;
  pendingModeration?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  author: CommentAuthor;
  replies?: CommentItem[];
}
