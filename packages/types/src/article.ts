import { z } from 'zod';
import { ArticleStatus, RejectionReason } from './enums.js';

export const articleDraftSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi.').max(120, 'Judul maksimal 120 karakter.'),
  subtitle: z.string().max(160, 'Subjudul maksimal 160 karakter.').optional(),
  excerpt: z.string().max(300, 'Ringkasan maksimal 300 karakter.').optional(),
  content: z.any().optional(), // JSON from TipTap
  coverImage: z.string().url('URL cover tidak valid.').optional(),
  coverCredit: z.string().max(120, 'Kredit cover maksimal 120 karakter.').optional(),
  categoryId: z.string().min(1, 'Kategori wajib dipilih.'),
  tagIds: z.array(z.string()).max(5, 'Maksimal 5 tag.').optional().default([]),
  allowComments: z.boolean().optional().default(true),
  isDraft: z.boolean().optional().default(true),
});

export const articleSubmitSchema = articleDraftSchema.extend({
  title: z.string().min(10, 'Judul minimal 10 karakter.').max(120, 'Judul maksimal 120 karakter.'),
  coverImage: z.string().url('Cover image wajib diunggah sebelum submit.'),
  agreeOriginality: z.literal(true, {
    errorMap: () => ({ message: 'Pernyataan orisinalitas wajib disetujui.' }),
  }),
});

export const articleUpdateSchema = articleDraftSchema.partial().extend({
  agreeOriginality: z.boolean().optional(),
});

export const articleApproveSchema = z.object({
  scheduledAt: z.string().optional(),
  note: z.string().max(500).optional(),
});

export const articleRequestRevisionSchema = z.object({
  note: z.string().min(10, 'Catatan revisi minimal 10 karakter.').max(1000),
});

export const articleRejectSchema = z.object({
  reason: z.nativeEnum(RejectionReason),
  note: z.string().max(1000).optional(),
});

export const articleFeatureSchema = z.object({
  isFeatured: z.boolean(),
});

export const articleAdminQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(20),
  status: z.nativeEnum(ArticleStatus).optional(),
  kategori: z.string().optional(),
  q: z.string().optional(),
});

export type ArticleDraftInput = z.infer<typeof articleDraftSchema>;
export type ArticleSubmitInput = z.infer<typeof articleSubmitSchema>;
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
export type ArticleApproveInput = z.infer<typeof articleApproveSchema>;
export type ArticleRequestRevisionInput = z.infer<typeof articleRequestRevisionSchema>;
export type ArticleRejectInput = z.infer<typeof articleRejectSchema>;
export type ArticleFeatureInput = z.infer<typeof articleFeatureSchema>;
export type ArticleAdminQueryInput = z.infer<typeof articleAdminQuerySchema>;

export const articleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(12),
  kategori: z.string().optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['terbaru', 'populer', 'terlama']).default('terbaru'),
});

export type ArticleQueryInput = z.infer<typeof articleQuerySchema>;

export interface ArticleAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio?: string | null;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleTag {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  coverImage: string | null;
  coverCredit: string | null;
  publishedAt: string | null;
  readingTime: number;
  viewCount: number;
  commentCount: number;
  isFeatured: boolean;
  author: ArticleAuthor;
  category: ArticleCategory;
  tags?: ArticleTag[];
}

export interface ArticleDetail extends ArticleSummary {
  content: unknown; // TipTap JSON
  plainText: string | null;
  allowComments: boolean;
  status: ArticleStatus;
  previewToken?: string | null;
  preview?: {
    status: ArticleStatus;
  };
}
