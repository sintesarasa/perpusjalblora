import { z } from 'zod';
import { BookCondition, BookCopyStatus, Language } from './enums.js';

export type BookAvailabilityStatus = 'AVAILABLE' | 'LAST_ONE' | 'BORROWED' | 'READ_ONLY';

export const bookQuerySchema = z.object({
  q: z.string().optional(),
  kategori: z.string().optional(),
  tersedia: z
    .union([z.boolean(), z.string().transform((v) => v === 'true' || v === '1')])
    .optional(),
  bahasa: z.nativeEnum(Language).optional(),
  tahunMin: z.coerce.number().int().optional(),
  tahunMax: z.coerce.number().int().optional(),
  sort: z.enum(['terbaru', 'populer', 'judul']).default('terbaru'),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(24),
});

export type BookQueryInput = z.infer<typeof bookQuerySchema>;

export const bookCreateSchema = z.object({
  title: z.string().min(2, 'Judul buku minimal 2 karakter.').max(200),
  author: z.string().min(2, 'Nama penulis/pengarang minimal 2 karakter.').max(150),
  isbn: z.string().max(13).optional().nullable(),
  publisher: z.string().max(120).optional().nullable(),
  publicationYear: z.number().int().min(1800).max(2100).optional().nullable(),
  categoryId: z.string().min(1, 'Kategori buku wajib dipilih.'),
  description: z.string().max(2000).optional().nullable(),
  coverImage: z.string().optional().nullable(),
  language: z.nativeEnum(Language).default(Language.ID),
  pages: z.number().int().positive().optional().nullable(),
  shelfLocation: z.string().max(60).optional().nullable(),
  donatedBy: z.string().max(120).optional().nullable(),
  isPublished: z.boolean().default(true),
  isBorrowable: z.boolean().default(true),
  initialCopies: z.number().int().min(0).max(20).default(1),
});

export type BookCreateInput = z.infer<typeof bookCreateSchema>;

export const bookUpdateSchema = bookCreateSchema.partial().omit({ initialCopies: true });
export type BookUpdateInput = z.infer<typeof bookUpdateSchema>;

export const bookCopyCreateSchema = z.object({
  inventoryCode: z.string().max(20).optional(),
  condition: z.nativeEnum(BookCondition).default(BookCondition.BAIK),
  status: z.nativeEnum(BookCopyStatus).default(BookCopyStatus.AVAILABLE),
  note: z.string().max(300).optional().nullable(),
});

export type BookCopyCreateInput = z.infer<typeof bookCopyCreateSchema>;

export const bookCopyUpdateSchema = z.object({
  condition: z.nativeEnum(BookCondition).optional(),
  status: z.nativeEnum(BookCopyStatus).optional(),
  note: z.string().max(300).optional().nullable(),
});

export type BookCopyUpdateInput = z.infer<typeof bookCopyUpdateSchema>;

export interface BookItem {
  id: string;
  title: string;
  slug: string;
  author: string;
  coverImage: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  totalCopies: number;
  availableCopies: number;
  isBorrowable: boolean;
  availability: BookAvailabilityStatus;
  shelfLocation?: string | null;
  publicationYear?: number | null;
  isbn?: string | null;
}

export interface BookCopyItem {
  id: string;
  inventoryCode: string;
  condition: BookCondition;
  status: BookCopyStatus;
  note: string | null;
  createdAt: string;
}

export interface BookDetail extends BookItem {
  publisher: string | null;
  description: string | null;
  language: Language;
  pages: number | null;
  donatedBy: string | null;
  borrowCount: number;
  createdAt: string;
  copies?: BookCopyItem[];
  similarBooks?: BookItem[];
  estimatedReturnDate?: string | null;
}

export interface BookAvailabilityResponse {
  availableCopies: number;
  availability: BookAvailabilityStatus;
  estimatedReturnDate: string | null;
  userEligibility: {
    canBorrow: boolean;
    reason?: string;
    message?: string;
    canJoinWaitlist: boolean;
  };
}
