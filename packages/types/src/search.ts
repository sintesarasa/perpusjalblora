import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().min(2, 'Kata kunci pencarian minimal 2 karakter.').max(100),
  type: z.enum(['all', 'artikel', 'buku']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(10),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

export interface SearchArticleItem {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt?: string | null;
  publishedAt?: string | null;
  readingTime?: number;
  author: { name: string; username: string };
  category: { name: string; slug: string };
}

export interface SearchBookItem {
  id: string;
  title: string;
  slug: string;
  author: string;
  isbn?: string | null;
  synopsis?: string | null;
  coverImage?: string | null;
  category?: { name: string; slug: string } | null;
}

export interface SearchResultsData {
  articles: {
    items: SearchArticleItem[];
    total: number;
  };
  books: {
    items: SearchBookItem[];
    total: number;
  };
}
