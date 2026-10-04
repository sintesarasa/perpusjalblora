import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/errors.js';
import {
  JoinWaitlistInput,
  AllocateWaitlistInput,
  WaitlistItem,
  WaitlistStatus,
  LoanStatus,
  UserSessionPayload,
} from '@perpusjal/types';
import { notificationsService } from '../notifications/notifications.service.js';

function generateLoanCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PJM-${year}-${rand}`;
}

function generatePickupCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatWaitlistItem(w: any): WaitlistItem {
  return {
    id: w.id,
    bookId: w.bookId,
    userId: w.userId,
    position: w.position,
    status: w.status as WaitlistStatus,
    notifiedAt: w.notifiedAt ? w.notifiedAt.toISOString() : null,
    priorityUntil: w.priorityUntil ? w.priorityUntil.toISOString() : null,
    createdAt: w.createdAt.toISOString(),
    book: {
      id: w.book.id,
      title: w.book.title,
      slug: w.book.slug,
      author: w.book.author,
      coverImage: w.book.coverImage,
      availableCopies: w.book.availableCopies,
    },
    user: w.user
      ? {
          id: w.user.id,
          name: w.user.name,
          username: w.user.username,
          email: w.user.email,
        }
      : undefined,
  };
}

export class WaitlistService {
  /**
   * User registers for a book waitlist when copies are depleted
   */
  async joinWaitlist(input: JoinWaitlistInput, user: UserSessionPayload) {
    const { bookId } = input;

    return prisma.$transaction(async (tx) => {
      // 1. Check user status
      const userDb = await tx.user.findUnique({
        where: { id: user.userId },
        select: { id: true, status: true, deletedAt: true },
      });

      if (!userDb || userDb.deletedAt || userDb.status === 'SUSPENDED' || userDb.status === 'DEACTIVATED') {
        throw HttpError.forbidden('Akun Anda dalam status pembatasan.');
      }

      // 2. Check book validity
      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book || book.deletedAt || !book.isPublished) {
        throw HttpError.notFound('Buku tidak ditemukan.');
      }

      if (!book.isBorrowable) {
        throw HttpError.badRequest('Buku ini adalah koleksi baca di tempat.');
      }

      // 3. If book is currently available, prompt user to borrow directly instead
      if (book.availableCopies > 0) {
        throw HttpError.badRequest('Buku saat ini masih tersedia di lapak! Anda dapat langsung meminjam.');
      }

      // 4. Check if user already has an active loan for this book
      const existingLoan = await tx.loan.findFirst({
        where: {
          userId: user.userId,
          bookId,
          status: {
            in: [LoanStatus.PENDING, LoanStatus.APPROVED, LoanStatus.BORROWED] as unknown as any[],
          },
        },
      });

      if (existingLoan) {
        throw HttpError.badRequest('Anda sedang meminjam atau memiliki pengajuan aktif untuk buku ini.');
      }

      // 5. Check if already in active waitlist
      const existingWaitlist = await tx.waitlist.findFirst({
        where: {
          userId: user.userId,
          bookId,
          status: {
            in: [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] as unknown as any[],
          },
        },
      });

      if (existingWaitlist) {
        throw HttpError.conflict('Anda sudah berada dalam daftar tunggu untuk buku ini.');
      }

      // 6. Max waitlist limit: max 2 active waitlists per user
      const userActiveWaitlists = await tx.waitlist.count({
        where: {
          userId: user.userId,
          status: {
            in: [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] as unknown as any[],
          },
        },
      });

      if (userActiveWaitlists >= 2) {
        throw HttpError.badRequest('Maksimal antrean aktif adalah 2 judul buku.');
      }

      // 7. Calculate position
      const currentQueueLength = await tx.waitlist.count({
        where: {
          bookId,
          status: {
            in: [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] as unknown as any[],
          },
        },
      });

      const nextPosition = currentQueueLength + 1;

      const created = await tx.waitlist.create({
        data: {
          bookId,
          userId: user.userId,
          position: nextPosition,
          status: WaitlistStatus.WAITING as unknown as any,
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: true,
              coverImage: true,
              availableCopies: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
      });

      return formatWaitlistItem(created);
    });
  }

  /**
   * User leaves/cancels their waitlist entry
   */
  async leaveWaitlist(waitlistId: string, user: UserSessionPayload) {
    return prisma.$transaction(async (tx) => {
      const waitlist = await tx.waitlist.findUnique({
        where: { id: waitlistId },
      });

      if (!waitlist) {
        throw HttpError.notFound('Data antrean tidak ditemukan.');
      }

      if (waitlist.userId !== user.userId) {
        throw HttpError.forbidden('Hanya pemilik antrean yang dapat membatalkan.');
      }

      const activeStatuses = [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] as unknown as any[];
      if (!activeStatuses.includes(waitlist.status)) {
        throw HttpError.badRequest('Antrean ini sudah tidak aktif.');
      }

      const leavingPosition = waitlist.position;

      // Mark cancelled
      await tx.waitlist.update({
        where: { id: waitlistId },
        data: { status: WaitlistStatus.CANCELLED as unknown as any },
      });

      // Shift subsequent positions down by 1
      await tx.waitlist.updateMany({
        where: {
          bookId: waitlist.bookId,
          status: { in: activeStatuses },
          position: { gt: leavingPosition },
        },
        data: {
          position: { decrement: 1 },
        },
      });

      return { message: 'Anda telah keluar dari daftar antrean buku.' };
    });
  }

  /**
   * Get active waitlists of the current user
   */
  async getMyWaitlists(user: UserSessionPayload) {
    const list = await prisma.waitlist.findMany({
      where: {
        userId: user.userId,
        status: {
          in: [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] as unknown as any[],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: true,
            coverImage: true,
            availableCopies: true,
          },
        },
      },
    });

    return list.map(formatWaitlistItem);
  }

  /**
   * Kurator / Admin: Get queue list for a specific book
   */
  async getBookWaitlists(bookId: string) {
    const list = await prisma.waitlist.findMany({
      where: {
        bookId,
        status: {
          in: [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] as unknown as any[],
        },
      },
      orderBy: { position: 'asc' },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: true,
            coverImage: true,
            availableCopies: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return list.map(formatWaitlistItem);
  }

  /**
   * Kurator / Admin: 1-Click allocate a returned/available copy to waitlisted user
   * Converts the top waitlist into an APPROVED Loan with 6-digit pickupCode!
   */
  async allocateWaitlistToLoan(
    waitlistId: string,
    input: AllocateWaitlistInput,
    curatorUser: UserSessionPayload
  ) {
    const result = await prisma.$transaction(async (tx) => {
      const waitlist = await tx.waitlist.findUnique({
        where: { id: waitlistId },
        include: {
          book: true,
          user: true,
        },
      });

      if (!waitlist) {
        throw HttpError.notFound('Data antrean tidak ditemukan.');
      }

      if (waitlist.status !== (WaitlistStatus.WAITING as unknown as any) &&
          waitlist.status !== (WaitlistStatus.NOTIFIED as unknown as any)) {
        throw HttpError.badRequest('Hanya antrean berstatus WAITING atau NOTIFIED yang dapat dialokasikan.');
      }

      const book = waitlist.book;
      if (book.availableCopies <= 0) {
        throw HttpError.badRequest('Tidak ada stok eksemplar buku yang tersedia untuk dialokasikan.');
      }

      // 1. Decrement available copies (soft hold for this user with concurrency protection)
      const decrementResult = await tx.book.updateMany({
        where: { id: book.id, availableCopies: { gt: 0 } },
        data: { availableCopies: { decrement: 1 } },
      });

      if (decrementResult.count === 0) {
        throw HttpError.badRequest('Tidak ada stok eksemplar buku yang tersedia untuk dialokasikan.');
      }

      // 2. Generate unique pickup & loan codes
      let loanCode = generateLoanCode();
      while (await tx.loan.findUnique({ where: { loanCode } })) {
        loanCode = generateLoanCode();
      }

      let pickupCode = generatePickupCode();
      while (
        await tx.loan.findFirst({
          where: { pickupCode, status: LoanStatus.APPROVED as unknown as any },
        })
      ) {
        pickupCode = generatePickupCode();
      }

      const deadlineDays = input.pickupDeadlineDays || 3;
      const pickupDeadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000);

      // 3. Create Loan directly in APPROVED status
      const createdLoan = await tx.loan.create({
        data: {
          loanCode,
          userId: waitlist.userId,
          bookId: waitlist.bookId,
          status: LoanStatus.APPROVED as unknown as any,
          pickupPoint: 'Lapak Fisik Perpusjal Blora',
          pickupCode,
          pickupDeadline,
          approvedById: curatorUser.userId,
          approvedAt: new Date(),
          userNote: `Dialokasikan dari Antrean Posisi #${waitlist.position}`,
        },
        include: {
          book: { select: { id: true, title: true, slug: true, author: true } },
          user: { select: { id: true, name: true, username: true, email: true } },
        },
      });

      // 4. Mark waitlist as FULFILLED
      await tx.waitlist.update({
        where: { id: waitlistId },
        data: { status: WaitlistStatus.FULFILLED as unknown as any },
      });

      // 5. Shift remaining positions down by 1
      await tx.waitlist.updateMany({
        where: {
          bookId: waitlist.bookId,
          status: {
            in: [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] as unknown as any[],
          },
          position: { gt: waitlist.position },
        },
        data: {
          position: { decrement: 1 },
        },
      });

      return {
        loan: createdLoan,
        pickupCode,
        pickupDeadline,
        user: waitlist.user,
        book: waitlist.book,
      };
    });

    // Send notification to the lucky reader
    try {
      const deadlineStr = result.pickupDeadline.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      await notificationsService.createNotification(result.user.id, {
        type: 'WAITLIST_ALLOCATED',
        title: '🎉 Giliran Anda! Buku Siap Diambil di Lapak',
        body: `Antrean buku "${result.book.title}" telah dialokasikan untuk Anda! Kode Ambil: ${result.pickupCode} (ambil sebelum ${deadlineStr}).`,
        actionUrl: '/dashboard/pinjaman',
        entityType: 'LOAN',
        entityId: result.loan.id,
      });
    } catch (e) {
      console.error('Failed to send waitlist allocated notification:', e);
    }

    return {
      message: `Buku berhasil dialokasikan ke ${result.user.name}. Kode ambil: ${result.pickupCode}`,
      loan: result.loan,
    };
  }

  /**
   * Helper: Check if a returned book has pending waitlist (for Sirkulasi Desk Banner)
   */
  async getTopWaitlistRecommendation(bookId: string): Promise<WaitlistItem | null> {
    const top = await prisma.waitlist.findFirst({
      where: {
        bookId,
        status: {
          in: [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] as unknown as any[],
        },
      },
      orderBy: { position: 'asc' },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: true,
            coverImage: true,
            availableCopies: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return top ? formatWaitlistItem(top) : null;
  }
}

export const waitlistService = new WaitlistService();
