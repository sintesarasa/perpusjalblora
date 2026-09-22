import { prisma } from '../../lib/prisma.js';
import {
  SearchQueryInput,
  SearchResultsData,
  SearchArticleItem,
  SearchBookItem,
  ArticleStatus,
} from '@perpusjal/types';

export class SearchService {
  /**
   * Global search across Articles and Books
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
          { tags: { some: { tag: { name: { contains: trimmed, mode: 'insensitive' } } } } },
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
        })),
      };
    }

    return {
      articles: articlesData,
      books: booksData,
    };
  }

  /**
   * Fast suggestions for live dropdown
   */
  async suggest(q: string) {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) {
      return { articles: [], books: [] };
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

    return { articles, books };
  }
}

export const searchService = new SearchService();
