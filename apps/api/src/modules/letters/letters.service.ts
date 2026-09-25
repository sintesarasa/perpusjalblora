import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/errors.js';
import { notificationsService } from '../notifications/notifications.service.js';
import {
  LetterQueryInput,
  LetterCreateInput,
  LetterApproveInput,
  LetterItem,
  LetterDetail,
  LetterStatus,
  Role,
  UserSessionPayload,
} from '@perpusjal/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export class LettersService {
  /**
   * Public reader letters (only PUBLISHED, chronological)
   */
  async getLetters(query: LetterQueryInput) {
    const { page = 1, perPage = 10 } = query;
    const skip = (page - 1) * perPage;

    const where = {
      status: LetterStatus.PUBLISHED as unknown as any,
    };

    const [total, letters] = await Promise.all([
      prisma.readerLetter.count({ where }),
      prisma.readerLetter.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, username: true },
          },
          _count: {
            select: {
              comments: {
                where: { status: 'PUBLISHED' as unknown as any },
              },
            },
          },
        },
      }),
    ]);

    const items: LetterItem[] = letters.map((l) => {
      const excerpt = l.content.slice(0, 160).trim() + (l.content.length > 160 ? '...' : '');
      const displayedAuthor = l.isAnonymous
        ? { id: 'anon', name: l.displayName || 'Warga Blora', username: 'warga' }
        : l.author;

      return {
        id: l.id,
        title: l.title,
        slug: l.slug,
        excerpt,
        displayName: l.displayName,
        isAnonymous: l.isAnonymous,
        publishedAt: l.publishedAt ? l.publishedAt.toISOString() : null,
        createdAt: l.createdAt.toISOString(),
        status: l.status as unknown as LetterStatus,
        author: displayedAuthor,
        commentCount: l._count.comments,
      };
    });

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
   * Detail reader letter
   */
  async getLetterBySlug(slug: string, user?: UserSessionPayload): Promise<LetterDetail> {
    const letter = await prisma.readerLetter.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, username: true },
        },
        _count: {
          select: {
            comments: {
              where: { status: 'PUBLISHED' as unknown as any },
            },
          },
        },
      },
    });

    if (!letter) {
      throw HttpError.notFound('Surat pembaca tidak ditemukan.');
    }

    const isAuthor = user?.userId === letter.authorId;
    const isCurator = user?.role === Role.KURATOR || user?.role === Role.ADMIN;

    if (letter.status !== (LetterStatus.PUBLISHED as unknown as any) && !isAuthor && !isCurator) {
      throw HttpError.notFound('Surat pembaca tidak ditemukan atau belum dipublikasikan.');
    }

    const excerpt = letter.content.slice(0, 160).trim() + (letter.content.length > 160 ? '...' : '');
    const displayedAuthor =
      letter.isAnonymous && !isCurator
        ? { id: 'anon', name: letter.displayName || 'Warga Blora', username: 'warga' }
        : letter.author;

    return {
      id: letter.id,
      title: letter.title,
      slug: letter.slug,
      excerpt,
      content: letter.content,
      originalContent: isCurator ? letter.originalContent : null,
      displayName: letter.displayName,
      isAnonymous: letter.isAnonymous,
      publishedAt: letter.publishedAt ? letter.publishedAt.toISOString() : null,
      createdAt: letter.createdAt.toISOString(),
      status: letter.status as unknown as LetterStatus,
      rejectionReason: isAuthor || isCurator ? letter.rejectionReason : null,
      author: displayedAuthor,
      commentCount: letter._count.comments,
    };
  }

  /**
   * Submit reader letter (max 2 PENDING per user per PRD §15)
   */
  async createLetter(input: LetterCreateInput, user: UserSessionPayload) {
    const userDb = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, name: true, status: true, deletedAt: true },
    });

    if (!userDb || userDb.deletedAt || userDb.status === 'SUSPENDED' || userDb.status === 'DEACTIVATED') {
      throw HttpError.forbidden('Akun Anda dalam status pembatasan.');
    }

    // Check max 2 PENDING letters
    const pendingCount = await prisma.readerLetter.count({
      where: {
        authorId: user.userId,
        status: LetterStatus.PENDING as unknown as any,
      },
    });

    if (pendingCount >= 2) {
      throw HttpError.badRequest('Batas maksimal pengiriman tercapai (maksimal 2 surat berstatus PENDING).');
    }

    const baseSlug = slugify(input.title);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${randomSuffix}`;

    const displayName = input.isAnonymous
      ? input.displayName?.trim() || 'Warga Blora'
      : input.displayName?.trim() || userDb.name;

    const created = await prisma.readerLetter.create({
      data: {
        title: input.title.trim(),
        slug,
        content: input.content.trim(),
        originalContent: input.content.trim(),
        displayName,
        isAnonymous: input.isAnonymous ?? false,
        authorId: user.userId,
        status: LetterStatus.PENDING as unknown as any,
      },
      include: {
        author: {
          select: { id: true, name: true, username: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    return {
      letter: created,
      message: 'Surat pembaca berhasil dikirim dan menunggu telaah kurator redaksi.',
    };
  }

  /**
   * Get member's own letters
   */
  async getMyLetters(user: UserSessionPayload) {
    const letters = await prisma.readerLetter.findMany({
      where: { authorId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, username: true } },
        _count: { select: { comments: true } },
      },
    });

    return letters.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      excerpt: l.content.slice(0, 160).trim() + (l.content.length > 160 ? '...' : ''),
      displayName: l.displayName,
      isAnonymous: l.isAnonymous,
      publishedAt: l.publishedAt ? l.publishedAt.toISOString() : null,
      createdAt: l.createdAt.toISOString(),
      status: l.status as unknown as LetterStatus,
      author: l.author,
      commentCount: l._count.comments,
      rejectionReason: l.rejectionReason,
    }));
  }

  /**
   * Kurator: Moderation queue for reader letters
   */
  async getModerationLetters() {
    const letters = await prisma.readerLetter.findMany({
      where: { status: LetterStatus.PENDING as unknown as any },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, username: true, email: true } },
      },
    });

    return letters.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      content: l.content,
      originalContent: l.originalContent,
      displayName: l.displayName,
      isAnonymous: l.isAnonymous,
      createdAt: l.createdAt.toISOString(),
      status: l.status as unknown as LetterStatus,
      author: l.author,
    }));
  }

  /**
   * Kurator: Approve reader letter (supports minor editorial correction per FR-SP-02)
   */
  async approveLetter(id: string, input: LetterApproveInput, user: UserSessionPayload) {
    const letter = await prisma.readerLetter.findUnique({ where: { id } });
    if (!letter) {
      throw HttpError.notFound('Surat pembaca tidak ditemukan.');
    }

    const updated = await prisma.readerLetter.update({
      where: { id },
      data: {
        status: LetterStatus.PUBLISHED as unknown as any,
        publishedAt: new Date(),
        moderatedById: user.userId,
        moderatedAt: new Date(),
        ...(input.editedContent ? { content: input.editedContent.trim() } : {}),
      },
    });

    try {
      await notificationsService.createNotification(updated.authorId, {
        type: 'ARTICLE_APPROVED',
        title: 'Surat Pembaca Diterbitkan',
        body: `Surat pembaca Anda yang berjudul "${updated.title}" telah disetujui kurator dan terbit di ruang publik Perpusjal Blora.`,
        actionUrl: `/surat-pembaca/${updated.slug}`,
        entityType: 'readerLetter',
        entityId: updated.id,
      });
    } catch {
      // Ignored
    }

    return {
      message: 'Surat pembaca berhasil diterbitkan.',
      letter: updated,
    };
  }

  /**
   * Kurator: Reject reader letter with reason (FR-SP-03)
   */
  async rejectLetter(id: string, reason: string, user: UserSessionPayload) {
    const letter = await prisma.readerLetter.findUnique({ where: { id } });
    if (!letter) {
      throw HttpError.notFound('Surat pembaca tidak ditemukan.');
    }

    const updated = await prisma.readerLetter.update({
      where: { id },
      data: {
        status: LetterStatus.REJECTED as unknown as any,
        rejectionReason: reason.trim(),
        moderatedById: user.userId,
        moderatedAt: new Date(),
      },
    });

    try {
      await notificationsService.createNotification(updated.authorId, {
        type: 'ARTICLE_REJECTED',
        title: 'Surat Pembaca Belum Dapat Diterbitkan',
        body: `Surat pembaca Anda "${updated.title}" belum dapat diterbitkan: ${reason.trim()}`,
        actionUrl: `/surat-pembaca`,
        entityType: 'readerLetter',
        entityId: updated.id,
      });
    } catch {
      // Ignored
    }

    return {
      message: 'Surat pembaca ditolak.',
      letter: updated,
    };
  }
}

export const lettersService = new LettersService();
