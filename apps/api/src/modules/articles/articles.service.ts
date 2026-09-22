import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/errors.js';
import {
  ArticleQueryInput,
  ArticleDraftInput,
  ArticleUpdateInput,
  ArticleApproveInput,
  ArticleRequestRevisionInput,
  ArticleRejectInput,
  ArticleAdminQueryInput,
  ArticleStatus,
  Role,
  UserSessionPayload,
} from '@perpusjal/types';

export class ArticlesService {
  /**
   * Get public articles list with filters, search, and pagination
   */
  async getArticles(query: ArticleQueryInput) {
    const { page, perPage, kategori, tag, q, featured, sort } = query;
    const skip = (page - 1) * perPage;

    const where: any = {
      status: ArticleStatus.PUBLISHED,
      deletedAt: null,
    };

    if (kategori) {
      where.category = { slug: kategori };
    }

    if (tag) {
      where.tags = { some: { slug: tag } };
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    if (q && q.trim()) {
      const searchTerm = q.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { subtitle: { contains: searchTerm, mode: 'insensitive' } },
        { excerpt: { contains: searchTerm, mode: 'insensitive' } },
        { plainText: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { publishedAt: 'desc' };
    if (sort === 'populer') {
      orderBy = { viewCount: 'desc' };
    } else if (sort === 'terlama') {
      orderBy = { publishedAt: 'asc' };
    }

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          subtitle: true,
          excerpt: true,
          coverImage: true,
          coverCredit: true,
          publishedAt: true,
          readingTime: true,
          viewCount: true,
          commentCount: true,
          isFeatured: true,
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              bio: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    return {
      data: articles.map((a) => ({
        ...a,
        publishedAt: a.publishedAt?.toISOString() || null,
      })),
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  /**
   * Get single article by slug with preview support (FR-ART-04 & FR-ART-05)
   */
  async getArticleBySlug(
    slug: string,
    options: { user?: UserSessionPayload; previewToken?: string } = {}
  ) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!article || article.deletedAt !== null) {
      throw HttpError.notFound('Artikel tidak ditemukan.');
    }

    const isPublished = article.status === ArticleStatus.PUBLISHED;

    // Check preview permissions if not published
    let isPreview = false;
    if (!isPublished) {
      const isAuthor = options.user && options.user.userId === article.authorId;
      const isCuratorOrAdmin =
        options.user &&
        (options.user.role === Role.KURATOR || options.user.role === Role.ADMIN);
      const hasValidPreviewToken =
        options.previewToken && options.previewToken === article.previewToken;

      if (!isAuthor && !isCuratorOrAdmin && !hasValidPreviewToken) {
        throw HttpError.notFound('Artikel ini belum diterbitkan atau tidak tersedia untuk publik.');
      }
      isPreview = true;
    }

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      subtitle: article.subtitle,
      excerpt: article.excerpt,
      content: article.content,
      plainText: article.plainText,
      coverImage: article.coverImage,
      coverCredit: article.coverCredit,
      publishedAt: article.publishedAt?.toISOString() || null,
      readingTime: article.readingTime,
      wordCount: article.wordCount,
      viewCount: article.viewCount,
      commentCount: article.commentCount,
      isFeatured: article.isFeatured,
      allowComments: article.allowComments,
      status: article.status as unknown as ArticleStatus,
      author: article.author,
      category: article.category,
      tags: article.tags,
      ...(isPreview ? { preview: { status: article.status as unknown as ArticleStatus } } : {}),
    };
  }

  /**
   * Get 3 related articles in the same category
   */
  async getRelatedArticles(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    });

    if (!article) {
      return [];
    }

    const related = await prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        id: { not: article.id },
        status: ArticleStatus.PUBLISHED,
        deletedAt: null,
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        subtitle: true,
        excerpt: true,
        coverImage: true,
        coverCredit: true,
        publishedAt: true,
        readingTime: true,
        viewCount: true,
        commentCount: true,
        isFeatured: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return related.map((a) => ({
      ...a,
      publishedAt: a.publishedAt?.toISOString() || null,
    }));
  }

  /**
   * Record article view metric and optional ReadingLog
   */
  async recordView(
    articleId: string,
    payload: {
      userId?: string;
      anonId?: string;
      secondsSpent?: number;
      scrollDepth?: number;
    }
  ) {
    await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    // If read for more than 10 seconds, record reading log
    if (payload.secondsSpent && payload.secondsSpent >= 10) {
      await prisma.readingLog.create({
        data: {
          userId: payload.userId,
          anonId: payload.anonId,
          articleId,
          secondsSpent: payload.secondsSpent,
          scrollDepth: payload.scrollDepth || 0,
          counted: true,
        },
      }).catch(() => {});
    }
  }

  /**
   * Get all active categories with published article counts
   */
  async getCategories() {
    const categories = await prisma.category.findMany({
      where: {
        type: { in: ['ARTICLE', 'BOTH'] },
        isActive: true,
      },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            articles: {
              where: {
                status: ArticleStatus.PUBLISHED,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      articleCount: c._count.articles,
    }));
  }

  /**
   * Get user's own articles with status tabs
   */
  async getMyArticles(
    userId: string,
    options: { status?: ArticleStatus; page?: number; perPage?: number } = {}
  ) {
    const page = options.page || 1;
    const perPage = options.perPage || 15;
    const skip = (page - 1) * perPage;

    const where: any = {
      authorId: userId,
      deletedAt: null,
    };

    if (options.status) {
      where.status = options.status;
    }

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    return {
      data: articles.map((a) => ({
        ...a,
        publishedAt: a.publishedAt?.toISOString() || null,
        scheduledAt: a.scheduledAt?.toISOString() || null,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  /**
   * Create new article (draft or submit)
   */
  async createArticle(userId: string, input: ArticleDraftInput) {
    let slug = slugify(input.title);
    if (!slug) slug = `naskah-${Date.now()}`;

    // Ensure slug uniqueness
    const existingSlug = await prisma.article.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const plainText = extractPlainText(input.content);
    const wordCount = plainText ? plainText.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const status = input.isDraft ? ArticleStatus.DRAFT : ArticleStatus.PENDING_REVIEW;
    const submittedAt = input.isDraft ? null : new Date();

    const article = await prisma.article.create({
      data: {
        title: input.title,
        slug,
        subtitle: input.subtitle,
        excerpt: input.excerpt || (plainText ? plainText.slice(0, 160) + '...' : null),
        content: input.content || { type: 'doc', content: [] },
        plainText,
        coverImage: input.coverImage,
        coverCredit: input.coverCredit,
        categoryId: input.categoryId,
        authorId: userId,
        status,
        submittedAt,
        readingTime,
        wordCount,
        allowComments: input.allowComments ?? true,
        previewToken: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
        ...(input.tagIds && input.tagIds.length > 0
          ? { tags: { connect: input.tagIds.map((id: string) => ({ id })) } }
          : {}),
      },
      include: {
        category: true,
        tags: true,
      },
    });

    return article;
  }

  /**
   * Update article
   */
  async updateArticle(
    articleId: string,
    userId: string,
    userRole: Role,
    input: ArticleUpdateInput
  ) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article || article.deletedAt !== null) {
      throw HttpError.notFound('Artikel tidak ditemukan.');
    }

    const isAuthor = article.authorId === userId;
    const isCuratorOrAdmin = userRole === Role.KURATOR || userRole === Role.ADMIN;

    if (!isAuthor && !isCuratorOrAdmin) {
      throw HttpError.forbidden('Kamu tidak memiliki wewenang untuk mengubah naskah ini.');
    }

    // Author can only edit if DRAFT or REVISION
    if (isAuthor && !isCuratorOrAdmin) {
      if (
        article.status !== ArticleStatus.DRAFT &&
        article.status !== ArticleStatus.REVISION
      ) {
        throw HttpError.badRequest(
          'Naskah yang sedang ditinjau atau telah terbit tidak dapat disunting langsung. Tarik pengajuan terlebih dahulu bila ingin mengubah.'
        );
      }
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle;
    if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
    if (input.coverImage !== undefined) updateData.coverImage = input.coverImage;
    if (input.coverCredit !== undefined) updateData.coverCredit = input.coverCredit;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
    if (input.allowComments !== undefined) updateData.allowComments = input.allowComments;

    if (input.content !== undefined) {
      updateData.content = input.content;
      const plainText = extractPlainText(input.content);
      updateData.plainText = plainText;
      const wordCount = plainText ? plainText.trim().split(/\s+/).length : 0;
      updateData.wordCount = wordCount;
      updateData.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    if (input.tagIds) {
      updateData.tags = {
        set: input.tagIds.map((id: string) => ({ id })),
      };
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
      include: {
        category: true,
        tags: true,
      },
    });

    return updated;
  }

  /**
   * Delete article (soft delete)
   */
  async deleteArticle(articleId: string, userId: string, userRole: Role) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article || article.deletedAt !== null) {
      throw HttpError.notFound('Artikel tidak ditemukan.');
    }

    const isAuthor = article.authorId === userId;
    const isAdmin = userRole === Role.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw HttpError.forbidden('Kamu tidak memiliki wewenang untuk menghapus naskah ini.');
    }

    if (isAuthor && !isAdmin && article.status === ArticleStatus.PUBLISHED) {
      throw HttpError.badRequest('Artikel yang sudah terbit hanya dapat diarsipkan oleh pengurus.');
    }

    await prisma.article.update({
      where: { id: articleId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Naskah berhasil dihapus.' };
  }

  /**
   * Submit draft for curator review
   */
  async submitArticle(articleId: string, userId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article || article.deletedAt !== null) {
      throw HttpError.notFound('Artikel tidak ditemukan.');
    }

    if (article.authorId !== userId) {
      throw HttpError.forbidden('Hanya penulis yang berwenang mengajukan naskah ini.');
    }

    if (
      article.status !== ArticleStatus.DRAFT &&
      article.status !== ArticleStatus.REVISION
    ) {
      throw HttpError.badRequest('Hanya naskah draf atau revisi yang dapat diajukan ke redaksi.');
    }

    if (!article.coverImage) {
      throw HttpError.badRequest('Gambar sampul wajib diunggah sebelum mengajukan naskah.');
    }

    if (article.wordCount < 100) {
      throw HttpError.badRequest('Naskah minimal 100 kata sebelum diajukan ke redaksi.');
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.PENDING_REVIEW,
        submittedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Withdraw pending article back to draft
   */
  async withdrawArticle(articleId: string, userId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article || article.deletedAt !== null) {
      throw HttpError.notFound('Artikel tidak ditemukan.');
    }

    if (article.authorId !== userId) {
      throw HttpError.forbidden('Hanya penulis yang berwenang menarik pengajuan naskah.');
    }

    if (article.status !== ArticleStatus.PENDING_REVIEW) {
      throw HttpError.badRequest('Hanya naskah berstatus menunggu review yang dapat ditarik kembali.');
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.DRAFT,
        submittedAt: null,
      },
    });

    return updated;
  }

  /**
   * Get curation queue for Kurator & Admin
   */
  async getAdminArticles(query: ArticleAdminQueryInput) {
    const { page, perPage, status, kategori, q } = query;
    const skip = (page - 1) * perPage;

    const where: any = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (kategori) {
      where.category = { slug: kategori };
    }

    if (q && q.trim()) {
      where.OR = [
        { title: { contains: q.trim(), mode: 'insensitive' } },
        { author: { name: { contains: q.trim(), mode: 'insensitive' } } },
      ];
    }

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        skip,
        take: perPage,
        orderBy: [{ submittedAt: 'desc' }, { updatedAt: 'desc' }],
        include: {
          author: { select: { id: true, name: true, username: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    return {
      data: articles.map((a) => ({
        ...a,
        submittedAt: a.submittedAt?.toISOString() || null,
        publishedAt: a.publishedAt?.toISOString() || null,
        scheduledAt: a.scheduledAt?.toISOString() || null,
        reviewLockedAt: a.reviewLockedAt?.toISOString() || null,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  /**
   * Lock article for active review (FR-ART-11)
   */
  async lockArticleForReview(articleId: string, curatorId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) throw HttpError.notFound('Artikel tidak ditemukan.');

    // If locked by someone else in the last 30 minutes
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (
      article.reviewLockedById &&
      article.reviewLockedById !== curatorId &&
      article.reviewLockedAt &&
      article.reviewLockedAt > thirtyMinsAgo
    ) {
      throw HttpError.conflict('Naskah sedang diperiksa oleh kurator lain.');
    }

    await prisma.article.update({
      where: { id: articleId },
      data: {
        reviewLockedById: curatorId,
        reviewLockedAt: new Date(),
      },
    });

    return { message: 'Naskah berhasil dikunci untuk ditinjau.' };
  }

  /**
   * Unlock review lock
   */
  async unlockArticleReview(articleId: string, curatorId: string) {
    await prisma.article.updateMany({
      where: { id: articleId, reviewLockedById: curatorId },
      data: {
        reviewLockedById: null,
        reviewLockedAt: null,
      },
    });

    return { message: 'Kunci review dilepaskan.' };
  }

  /**
   * Approve article to publish or schedule
   */
  async approveArticle(
    articleId: string,
    curatorId: string,
    input: ArticleApproveInput
  ) {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw HttpError.notFound('Artikel tidak ditemukan.');

    const isScheduled = !!input.scheduledAt;
    const newStatus = isScheduled ? ArticleStatus.SCHEDULED : ArticleStatus.PUBLISHED;

    await prisma.$transaction([
      prisma.article.update({
        where: { id: articleId },
        data: {
          status: newStatus,
          publishedAt: isScheduled ? null : new Date(),
          scheduledAt: isScheduled ? new Date(input.scheduledAt!) : null,
          reviewLockedById: null,
          reviewLockedAt: null,
        },
      }),
      prisma.articleRevision.create({
        data: {
          articleId,
          editorId: curatorId,
          statusFrom: article.status,
          statusTo: newStatus,
          note: input.note || (isScheduled ? 'Naskah dijadwalkan terbit.' : 'Naskah disetujui dan diterbitkan.'),
        },
      }),
    ]);

    return { message: isScheduled ? 'Naskah dijadwalkan terbit.' : 'Naskah berhasil diterbitkan.' };
  }

  /**
   * Request revision with feedback
   */
  async requestRevision(
    articleId: string,
    curatorId: string,
    input: ArticleRequestRevisionInput
  ) {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw HttpError.notFound('Artikel tidak ditemukan.');

    await prisma.$transaction([
      prisma.article.update({
        where: { id: articleId },
        data: {
          status: ArticleStatus.REVISION,
          reviewLockedById: null,
          reviewLockedAt: null,
        },
      }),
      prisma.articleRevision.create({
        data: {
          articleId,
          editorId: curatorId,
          statusFrom: article.status,
          statusTo: ArticleStatus.REVISION,
          note: input.note,
        },
      }),
    ]);

    return { message: 'Catatan revisi telah dikirimkan ke penulis.' };
  }

  /**
   * Reject article
   */
  async rejectArticle(
    articleId: string,
    curatorId: string,
    input: ArticleRejectInput
  ) {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw HttpError.notFound('Artikel tidak ditemukan.');

    await prisma.$transaction([
      prisma.article.update({
        where: { id: articleId },
        data: {
          status: ArticleStatus.REJECTED,
          reviewLockedById: null,
          reviewLockedAt: null,
        },
      }),
      prisma.articleRevision.create({
        data: {
          articleId,
          editorId: curatorId,
          statusFrom: article.status,
          statusTo: ArticleStatus.REJECTED,
          rejectionReason: input.reason,
          note: input.note,
        },
      }),
    ]);

    return { message: 'Naskah ditolak.' };
  }

  /**
   * Toggle featured article (BR-ART-02: max 3 featured articles)
   */
  async toggleFeatured(articleId: string, curatorId: string, isFeatured: boolean) {
    if (isFeatured) {
      const activeFeaturedCount = await prisma.article.count({
        where: {
          isFeatured: true,
          status: ArticleStatus.PUBLISHED,
          deletedAt: null,
        },
      });

      if (activeFeaturedCount >= 3) {
        throw HttpError.badRequest('Maksimal 3 naskah dapat dijadikan Tajuk Utama sekaligus.');
      }
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: { isFeatured },
    });

    return updated;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractPlainText(content: unknown): string {
  if (!content) return '';
  if (typeof content === 'string') return content.replace(/<[^>]*>/g, ' ');
  let text = '';
  function walk(node: any) {
    if (node?.text) text += node.text + ' ';
    if (node?.content && Array.isArray(node.content)) {
      node.content.forEach(walk);
    }
  }
  walk(content);
  return text.trim();
}

export const articlesService = new ArticlesService();

