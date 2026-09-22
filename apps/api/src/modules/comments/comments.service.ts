import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/errors.js';
import {
  CommentCreateInput,
  CommentUpdateInput,
  CommentReportInput,
  CommentQueryInput,
  CommentItem,
  CommentStatus,
  Role,
  TrustLevel,
  UserSessionPayload,
} from '@perpusjal/types';

export class CommentsService {
  /**
   * Get threaded comments (max depth 1) for an article or letter
   */
  async getComments(query: CommentQueryInput, user?: UserSessionPayload) {
    const { articleId, letterId, page = 1, perPage = 20 } = query;
    const skip = (page - 1) * perPage;

    if (!articleId && !letterId) {
      throw HttpError.badRequest('articleId atau letterId harus disertakan.');
    }

    // Base condition for target
    const targetFilter = articleId ? { articleId } : { letterId };

    // Determine status visibility filter
    // Public sees PUBLISHED and DELETED_BY_USER (for preserving reply threads)
    // Author can also see their own PENDING comments
    let statusFilter: any;
    if (user) {
      statusFilter = {
        OR: [
          { status: { in: [CommentStatus.PUBLISHED, CommentStatus.DELETED_BY_USER] } },
          { authorId: user.userId, status: CommentStatus.PENDING },
        ],
      };
    } else {
      statusFilter = {
        status: { in: [CommentStatus.PUBLISHED, CommentStatus.DELETED_BY_USER] },
      };
    }

    const whereParent = {
      ...targetFilter,
      parentId: null,
      ...statusFilter,
    };

    const [totalParents, parentComments] = await Promise.all([
      prisma.comment.count({ where: whereParent }),
      prisma.comment.findMany({
        where: whereParent,
        skip,
        take: perPage,
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              role: true,
              trustLevel: true,
            },
          },
          replies: {
            where: statusFilter,
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatarUrl: true,
                  role: true,
                  trustLevel: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const formatComment = (c: any): CommentItem => {
      const isAuthor = user?.userId === c.authorId;
      const isCurator = user?.role === Role.KURATOR || user?.role === Role.ADMIN;
      const elapsedMs = Date.now() - new Date(c.createdAt).getTime();
      const within15Min = elapsedMs <= 15 * 60 * 1000;

      const canEdit = isAuthor && within15Min && c.status === CommentStatus.PUBLISHED;
      const canDelete = (isAuthor && c.status !== CommentStatus.DELETED_BY_USER) || isCurator;

      let displayContent = c.content;
      if (c.status === CommentStatus.DELETED_BY_USER) {
        displayContent = '[Komentar ini telah dihapus oleh penulis]';
      }

      return {
        id: c.id,
        content: displayContent,
        status: c.status as unknown as CommentStatus,
        createdAt: c.createdAt.toISOString(),
        editedAt: c.editedAt ? c.editedAt.toISOString() : null,
        pendingModeration: c.status === CommentStatus.PENDING,
        canEdit,
        canDelete,
        author: {
          id: c.author.id,
          name: c.author.name,
          username: c.author.username,
          avatarUrl: c.author.avatarUrl,
          role: c.author.role as unknown as Role,
          trustLevel: c.author.trustLevel as unknown as TrustLevel,
        },
        replies: c.replies ? c.replies.map(formatComment) : [],
      };
    };

    const items: CommentItem[] = parentComments.map(formatComment);

    return {
      data: items,
      meta: {
        page,
        perPage,
        total: totalParents,
        totalPages: Math.ceil(totalParents / perPage),
      },
    };
  }

  /**
   * Post a new comment or reply
   */
  async createComment(input: CommentCreateInput, user: UserSessionPayload) {
    const { articleId, letterId, parentId, content } = input;

    // 1. Check user trust level from database
    const userDb = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, trustLevel: true, role: true, status: true, deletedAt: true },
    });

    if (!userDb || userDb.deletedAt || userDb.status === 'SUSPENDED' || userDb.status === 'DEACTIVATED') {
      throw HttpError.forbidden('Akun Anda dinonaktifkan.');
    }

    if (userDb.trustLevel === TrustLevel.RESTRICTED) {
      throw HttpError.forbidden('Akun Anda dalam status pembatasan dan tidak dapat mengirim komentar.');
    }

    // 2. Rate limiting check: max 5 comments per 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCount = await prisma.comment.count({
      where: {
        authorId: user.userId,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentCount >= 5) {
      throw HttpError.tooManyRequests('Batas pengiriman komentar terlampaui (maksimal 5 komentar per 10 menit).');
    }

    // 3. Parent check and depth constraint (BR-COM-02: max depth 1)
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parent || parent.status === CommentStatus.DELETED || parent.status === CommentStatus.HIDDEN) {
        throw HttpError.notFound('Komentar rujukan tidak ditemukan atau sudah tidak tersedia.');
      }

      if (parent.parentId !== null) {
        throw HttpError.badRequest('Kedalaman balasan komentar dibatasi maksimal 1 tingkat.');
      }

      if (articleId && parent.articleId !== articleId) {
        throw HttpError.badRequest('Komentar rujukan tidak sesuai dengan artikel.');
      }

      if (letterId && parent.letterId !== letterId) {
        throw HttpError.badRequest('Komentar rujukan tidak sesuai dengan surat pembaca.');
      }
    }

    // 4. Initial status by trust level (BR-COM-01)
    // TL0 -> PENDING (requires curator review)
    // TL1, TL2, or KURATOR/ADMIN -> PUBLISHED
    const isElevated =
      userDb.trustLevel === TrustLevel.TL1 ||
      userDb.trustLevel === TrustLevel.TL2 ||
      userDb.role === Role.KURATOR ||
      userDb.role === Role.ADMIN;

    const initialStatus = isElevated ? CommentStatus.PUBLISHED : CommentStatus.PENDING;

    // 5. Create comment
    const created = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: user.userId,
        articleId: articleId || null,
        letterId: letterId || null,
        parentId: parentId || null,
        status: initialStatus,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            role: true,
            trustLevel: true,
          },
        },
      },
    });

    // 6. If published immediately and attached to an article, increment commentCount
    if (initialStatus === CommentStatus.PUBLISHED && articleId) {
      await prisma.article.update({
        where: { id: articleId },
        data: { commentCount: { increment: 1 } },
      });
    }

    const commentItem: CommentItem = {
      id: created.id,
      content: created.content,
      status: created.status as unknown as CommentStatus,
      createdAt: created.createdAt.toISOString(),
      editedAt: null,
      pendingModeration: created.status === CommentStatus.PENDING,
      canEdit: created.status === CommentStatus.PUBLISHED,
      canDelete: true,
      author: {
        id: created.author.id,
        name: created.author.name,
        username: created.author.username,
        avatarUrl: created.author.avatarUrl,
        role: created.author.role as unknown as Role,
        trustLevel: created.author.trustLevel as unknown as TrustLevel,
      },
      replies: [],
    };

    return {
      comment: commentItem,
      message:
        initialStatus === CommentStatus.PENDING
          ? 'Komentar Anda telah dikirim dan menunggu persetujuan kurator (TL0).'
          : 'Komentar berhasil dipublikasikan.',
    };
  }

  /**
   * Update comment content (15-minute author edit window)
   */
  async updateComment(id: string, input: CommentUpdateInput, user: UserSessionPayload) {
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw HttpError.notFound('Komentar tidak ditemukan.');
    }

    if (comment.authorId !== user.userId) {
      throw HttpError.forbidden('Hanya penulis yang berhak menyunting komentar ini.');
    }

    if (comment.status === CommentStatus.DELETED_BY_USER || comment.status === CommentStatus.DELETED) {
      throw HttpError.badRequest('Komentar yang telah dihapus tidak dapat disunting.');
    }

    // 15-minute edit window check (BR-COM-03)
    const elapsedMs = Date.now() - comment.createdAt.getTime();
    if (elapsedMs > 15 * 60 * 1000) {
      throw HttpError.badRequest('Batas waktu penyuntingan komentar telah berakhir (maksimal 15 menit).');
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: {
        content: input.content.trim(),
        editedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            role: true,
            trustLevel: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      content: updated.content,
      status: updated.status as unknown as CommentStatus,
      createdAt: updated.createdAt.toISOString(),
      editedAt: updated.editedAt ? updated.editedAt.toISOString() : null,
      pendingModeration: updated.status === CommentStatus.PENDING,
      canEdit: true,
      canDelete: true,
      author: {
        id: updated.author.id,
        name: updated.author.name,
        username: updated.author.username,
        avatarUrl: updated.author.avatarUrl,
        role: updated.author.role as unknown as Role,
        trustLevel: updated.author.trustLevel as unknown as TrustLevel,
      },
    };
  }

  /**
   * Delete comment (Author sets DELETED_BY_USER, Curator/Admin can DELETED)
   */
  async deleteComment(id: string, user: UserSessionPayload) {
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { replies: { select: { id: true } } },
    });

    if (!comment) {
      throw HttpError.notFound('Komentar tidak ditemukan.');
    }

    const isAuthor = comment.authorId === user.userId;
    const isCurator = user.role === Role.KURATOR || user.role === Role.ADMIN;

    if (!isAuthor && !isCurator) {
      throw HttpError.forbidden('Anda tidak memiliki izin untuk menghapus komentar ini.');
    }

    const wasPublished = comment.status === CommentStatus.PUBLISHED;

    if (isAuthor) {
      // Author deletion marks as DELETED_BY_USER
      await prisma.comment.update({
        where: { id },
        data: {
          status: CommentStatus.DELETED_BY_USER,
          deletedAt: new Date(),
        },
      });
    } else {
      // Curator / Admin deletion
      await prisma.comment.update({
        where: { id },
        data: {
          status: CommentStatus.DELETED,
          deletedAt: new Date(),
          moderatedById: user.userId,
          moderatedAt: new Date(),
        },
      });
    }

    // Decrement article commentCount if it was published
    if (wasPublished && comment.articleId) {
      await prisma.article.update({
        where: { id: comment.articleId },
        data: { commentCount: { decrement: 1 } },
      });
    }

    return { message: 'Komentar berhasil dihapus.' };
  }

  /**
   * Report a comment (auto-hides at >= 3 unique reports)
   */
  async reportComment(id: string, input: CommentReportInput, user: UserSessionPayload) {
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw HttpError.notFound('Komentar tidak ditemukan.');
    }

    if (comment.authorId === user.userId) {
      throw HttpError.badRequest('Anda tidak dapat melaporkan komentar Anda sendiri.');
    }

    // Check duplicate report
    const existing = await prisma.commentReport.findUnique({
      where: {
        commentId_reporterId: {
          commentId: id,
          reporterId: user.userId,
        },
      },
    });

    if (existing) {
      throw HttpError.conflict('Anda telah melaporkan komentar ini sebelumnya.');
    }

    // Record report
    await prisma.commentReport.create({
      data: {
        commentId: id,
        reporterId: user.userId,
        reason: input.reason,
        note: input.note,
      },
    });

    // Increment reportCount
    const updated = await prisma.comment.update({
      where: { id },
      data: {
        reportCount: { increment: 1 },
      },
    });

    // Auto-hide threshold (BR-COM-04 / FR-CMT-03: reportCount >= 3)
    if (updated.reportCount >= 3 && updated.status === CommentStatus.PUBLISHED) {
      await prisma.comment.update({
        where: { id },
        data: {
          status: CommentStatus.HIDDEN,
        },
      });

      if (comment.articleId) {
        await prisma.article.update({
          where: { id: comment.articleId },
          data: { commentCount: { decrement: 1 } },
        });
      }
    }

    return { message: 'Laporan berhasil dicatat. Terima kasih atas bantuan Anda menjaga ruang diskusi.' };
  }

  /**
   * Moderation list for Kurator / Admin
   */
  async getModerationQueue(params: { status?: CommentStatus; page?: number; perPage?: number }) {
    const { status = CommentStatus.PENDING, page = 1, perPage = 20 } = params;
    const skip = (page - 1) * perPage;

    const [total, items] = await Promise.all([
      prisma.comment.count({ where: { status } }),
      prisma.comment.findMany({
        where: { status },
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
              trustLevel: true,
            },
          },
          article: {
            select: { id: true, title: true, slug: true },
          },
          reports: {
            select: { id: true, reason: true, note: true, createdAt: true },
          },
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  /**
   * Moderate comment: approve, hide, or delete
   */
  async moderateComment(id: string, action: 'approve' | 'hide' | 'delete', user: UserSessionPayload) {
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw HttpError.notFound('Komentar tidak ditemukan.');
    }

    let newStatus: CommentStatus;
    if (action === 'approve') {
      newStatus = CommentStatus.PUBLISHED;
    } else if (action === 'hide') {
      newStatus = CommentStatus.HIDDEN;
    } else {
      newStatus = CommentStatus.DELETED;
    }

    const previousStatus = comment.status;

    await prisma.comment.update({
      where: { id },
      data: {
        status: newStatus,
        moderatedById: user.userId,
        moderatedAt: new Date(),
      },
    });

    // Adjust article comment count
    if (comment.articleId) {
      if (previousStatus !== CommentStatus.PUBLISHED && newStatus === CommentStatus.PUBLISHED) {
        await prisma.article.update({
          where: { id: comment.articleId },
          data: { commentCount: { increment: 1 } },
        });
      } else if (previousStatus === CommentStatus.PUBLISHED && newStatus !== CommentStatus.PUBLISHED) {
        await prisma.article.update({
          where: { id: comment.articleId },
          data: { commentCount: { decrement: 1 } },
        });
      }
    }

    return { message: `Komentar berhasil di-${action}.` };
  }
}

export const commentsService = new CommentsService();
