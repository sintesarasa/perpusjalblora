import { prisma } from '../../lib/prisma.js';
import {
  SearchQueryInput,
  SearchResultsData,
  SearchArticleItem,
  SearchBookItem,
  ArticleStatus,
} from '@perpusjal/types';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SearchMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxEntries = 400;
  private ttlMs = 60 * 1000; // 60 seconds TTL

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const searchMemoryCache = new SearchMemoryCache();

export class SearchService {
  /**
   * Global search across Articles and Books with in-memory TTL caching
   */
  async search(query: SearchQueryInput): Promise<SearchResultsData> {
    const { q, type = 'all', page = 1, perPage = 10 } = query;
    const skip = (page - 1) * perPage;
    const trimmed = q.trim();

    const emptyResult: SearchResultsData = {
      articles: { items: [], total: 0 },
      books: { items: [], total: 0 },
    };

    if (!trimmed) {
      return emptyResult;
    }

    const cacheKey = `search:${trimmed.toLowerCase()}:${type}:${page}:${perPage}`;
    const cached = searchMemoryCache.get<SearchResultsData>(cacheKey);
    if (cached) {
      return cached;
    }

    const shouldSearchArticles = type === 'all' || type === 'artikel';
    const shouldSearchBooks = type === 'all' || type === 'buku';

    let articlesData = { items: [] as SearchArticleItem[], total: 0 };
    let booksData = { items: [] as SearchBookItem[], total: 0 };

    if (shouldSearchArticles) {
      const articleWhere: any = {
        status: ArticleStatus.PUBLISHED,
        deletedAt: null,
        OR: [
          { title: { contains: trimmed, mode: 'insensitive' } },
          { subtitle: { contains: trimmed, mode: 'insensitive' } },
          { excerpt: { contains: trimmed, mode: 'insensitive' } },
          { author: { name: { contains: trimmed, mode: 'insensitive' } } },
          { category: { name: { contains: trimmed, mode: 'insensitive' } } },
          { tags: { some: { name: { contains: trimmed, mode: 'insensitive' } } } },
        ],
      };

      const [totalArticles, articles] = await Promise.all([
        prisma.article.count({ where: articleWhere }),
        prisma.article.findMany({
          where: articleWhere,
          skip,
          take: perPage,
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            subtitle: true,
            excerpt: true,
            publishedAt: true,
            readingTime: true,
            author: {
              select: {
                name: true,
                username: true,
              },
            },
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        }),
      ]);

      articlesData = {
        total: totalArticles,
        items: articles.map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          subtitle: a.subtitle,
          excerpt: a.excerpt,
          publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
          readingTime: a.readingTime,
          author: a.author,
          category: a.category,
        })),
      };
    }

    if (shouldSearchBooks) {
      const bookWhere: any = {
        isPublished: true,
        deletedAt: null,
        OR: [
          { title: { contains: trimmed, mode: 'insensitive' } },
          { author: { contains: trimmed, mode: 'insensitive' } },
          { description: { contains: trimmed, mode: 'insensitive' } },
          { isbn: { contains: trimmed, mode: 'insensitive' } },
          { category: { name: { contains: trimmed, mode: 'insensitive' } } },
        ],
      };

      const [totalBooks, books] = await Promise.all([
        prisma.book.count({ where: bookWhere }),
        prisma.book.findMany({
          where: bookWhere,
          skip,
          take: perPage,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            author: true,
            isbn: true,
            description: true,
            coverImage: true,
            isBorrowable: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        }),
      ]);

      booksData = {
        total: totalBooks,
        items: books.map((b) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          author: b.author,
          isbn: b.isbn,
          synopsis: b.description,
          coverImage: b.coverImage,
          category: b.category,
          isBorrowable: b.isBorrowable,
        })),
      };
    }

    const result: SearchResultsData = {
      articles: articlesData,
      books: booksData,
    };

    searchMemoryCache.set(cacheKey, result);

    return result;
  }

  /**
   * Fast suggestions for live dropdown with in-memory TTL caching
   */
  async suggest(q: string) {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) {
      return { articles: [], books: [] };
    }

    const suggestCacheKey = `suggest:${trimmed.toLowerCase()}`;
    const cachedSuggest = searchMemoryCache.get<{ articles: any[]; books: any[] }>(suggestCacheKey);
    if (cachedSuggest) {
      return cachedSuggest;
    }

    const [articles, books] = await Promise.all([
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          deletedAt: null,
          OR: [
            { title: { contains: trimmed, mode: 'insensitive' } },
            { subtitle: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
        take: 3,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          author: { select: { name: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.book.findMany({
        where: {
          isPublished: true,
          deletedAt: null,
          OR: [
            { title: { contains: trimmed, mode: 'insensitive' } },
            { author: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          author: true,
          category: { select: { name: true } },
        },
      }),
    ]);

    const suggestResult = { articles, books };
    searchMemoryCache.set(suggestCacheKey, suggestResult);

    return suggestResult;
  }
}

export const searchService = new SearchService();
