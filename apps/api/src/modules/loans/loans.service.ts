import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/errors.js';
import {
  LoanRequestInput,
  LoanApproveInput,
  LoanPickupInput,
  LoanReturnInput,
  LoanQueryInput,
  LoanItem,
  LoanPickupBoardItem,
  LoanStatus,
  ReturnCondition,
  BookCopyStatus,
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

function formatLoanItem(l: any, isBorrowerOrAdmin = false): LoanItem {
  const isOverdue =
    l.status === LoanStatus.OVERDUE ||
    (l.status === LoanStatus.BORROWED && l.dueDate && new Date(l.dueDate) < new Date());

  const currentStatus = isOverdue ? LoanStatus.OVERDUE : (l.status as LoanStatus);

  let nextAction = '';
  let canCancel = false;
  let canExtend = false;

  switch (currentStatus) {
    case LoanStatus.PENDING:
      nextAction = 'Menunggu persetujuan pengurus lapak.';
      canCancel = true;
      break;
    case LoanStatus.APPROVED:
      nextAction = l.pickupDeadline
        ? `Ambil buku di lapak sebelum ${new Date(l.pickupDeadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}.`
        : 'Buku siap diambil di lapak.';
      canCancel = true;
      break;
    case LoanStatus.BORROWED:
      nextAction = l.dueDate
        ? `Jatuh tempo pengembalian: ${new Date(l.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}.`
        : 'Sedang dibaca.';
      canExtend = l.extensionCount === 0;
      break;
    case LoanStatus.OVERDUE:
      nextAction = 'Terlambat! Harap segera kembalikan buku ke lapak fisik.';
      break;
    case LoanStatus.RETURNED:
      nextAction = 'Selesai dibaca & dikembalikan.';
      break;
    case LoanStatus.RETURNED_LOST:
      nextAction = 'Tercatat hilang (penyelesaian kekeluargaan).';
      break;
    case LoanStatus.CANCELLED:
      nextAction = 'Peminjaman dibatalkan.';
      break;
    case LoanStatus.REJECTED:
      nextAction = l.rejectionReason ? `Ditolak: ${l.rejectionReason}` : 'Pengajuan ditolak.';
      break;
    default:
      nextAction = '-';
  }

  return {
    id: l.id,
    loanCode: l.loanCode,
    status: currentStatus,
    requestedAt: l.requestedAt ? l.requestedAt.toISOString() : l.createdAt.toISOString(),
    pickupPoint: l.pickupPoint,
    pickupDatePlan: l.pickupDatePlan ? l.pickupDatePlan.toISOString() : null,
    userNote: l.userNote,
    approvedAt: l.approvedAt ? l.approvedAt.toISOString() : null,
    pickupCode: isBorrowerOrAdmin ? l.pickupCode : null,
    pickupDeadline: l.pickupDeadline ? l.pickupDeadline.toISOString() : null,
    borrowedAt: l.borrowedAt ? l.borrowedAt.toISOString() : null,
    dueDate: l.dueDate ? l.dueDate.toISOString() : null,
    extensionCount: l.extensionCount,
    returnedAt: l.returnedAt ? l.returnedAt.toISOString() : null,
    returnCondition: l.returnCondition as ReturnCondition | null,
    rejectionReason: l.rejectionReason,
    book: {
      id: l.book.id,
      title: l.book.title,
      slug: l.book.slug,
      author: l.book.author,
      coverImage: l.book.coverImage,
    },
    bookCopy: l.bookCopy
      ? {
          id: l.bookCopy.id,
          inventoryCode: l.bookCopy.inventoryCode,
        }
      : null,
    borrower: l.user
      ? {
          id: l.user.id,
          name: l.user.name,
          username: l.user.username,
          email: isBorrowerOrAdmin ? l.user.email : undefined,
        }
      : undefined,
    canCancel,
    canExtend,
    nextAction,
  };
}

export class LoansService {
  /**
   * Request a new book loan (7-step BR check & soft-hold transaction)
   */
  async requestLoan(input: LoanRequestInput, user: UserSessionPayload) {
    const { bookId, pickupPoint, pickupDatePlan, note } = input;

    return prisma.$transaction(async (tx) => {
      // 1. Check user status
      const userDb = await tx.user.findUnique({
        where: { id: user.userId },
        select: { id: true, status: true, deletedAt: true },
      });

      if (!userDb || userDb.deletedAt || userDb.status === 'SUSPENDED' || userDb.status === 'DEACTIVATED') {
        throw HttpError.forbidden('Akun Anda dalam status pembatasan dan tidak dapat meminjam buku.');
      }

      // 2. Check overdue loans (BR-LOAN-06)
      const overdueCount = await tx.loan.count({
        where: {
          userId: user.userId,
          status: LoanStatus.OVERDUE as unknown as any,
        },
      });

      if (overdueCount > 0) {
        throw HttpError.forbidden(
          'Anda memiliki pinjaman yang melewati batas tenggat. Kembalikan buku terlebih dahulu.'
        );
      }

      // 3. Check active loan limit (BR-LOAN-01: max 2 active books)
      const activeCount = await tx.loan.count({
        where: {
          userId: user.userId,
          status: {
            in: [
              LoanStatus.PENDING,
              LoanStatus.APPROVED,
              LoanStatus.BORROWED,
              LoanStatus.OVERDUE,
            ] as unknown as any[],
          },
        },
      });

      if (activeCount >= 2) {
        throw HttpError.badRequest('Batas maksimal peminjaman aktif tercapai (maksimal 2 judul buku).');
      }

      // 4. Check duplicate request for the same book (BR-LOAN-10)
      const duplicate = await tx.loan.findFirst({
        where: {
          userId: user.userId,
          bookId,
          status: {
            in: [
              LoanStatus.PENDING,
              LoanStatus.APPROVED,
              LoanStatus.BORROWED,
            ] as unknown as any[],
          },
        },
      });

      if (duplicate) {
        throw HttpError.conflict('Anda sudah memiliki pengajuan aktif untuk judul buku ini.');
      }

      // 5. Check book availability & borrowability
      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book || book.deletedAt || !book.isPublished) {
        throw HttpError.notFound('Buku tidak ditemukan.');
      }

      if (!book.isBorrowable) {
        throw HttpError.badRequest('Buku ini tidak dapat dipinjam (koleksi baca di tempat).');
      }

      if (book.availableCopies <= 0) {
        throw HttpError.badRequest('Semua eksemplar buku ini sedang dipinjam.');
      }

      // 6. Soft hold: decrement availableCopies (BR-LOAN-12)
      await tx.book.update({
        where: { id: bookId },
        data: {
          availableCopies: { decrement: 1 },
        },
      });

      // 7. Create Loan
      let loanCode = generateLoanCode();
      // Ensure unique loanCode
      while (await tx.loan.findUnique({ where: { loanCode } })) {
        loanCode = generateLoanCode();
      }

      const created = await tx.loan.create({
        data: {
          loanCode,
          userId: user.userId,
          bookId,
          status: LoanStatus.PENDING as unknown as any,
          pickupPoint: pickupPoint.trim(),
          pickupDatePlan: pickupDatePlan ? new Date(pickupDatePlan) : null,
          userNote: note ? note.trim() : null,
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: true,
              coverImage: true,
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

      return formatLoanItem(created, true);
    });
  }

  /**
   * Get loans for authenticated user (Active or History)
   */
  async getMyLoans(user: UserSessionPayload, filter: 'aktif' | 'riwayat' = 'aktif') {
    const activeStatuses: any[] = [
      LoanStatus.PENDING,
      LoanStatus.APPROVED,
      LoanStatus.BORROWED,
      LoanStatus.OVERDUE,
    ];

    const historyStatuses: any[] = [
      LoanStatus.RETURNED,
      LoanStatus.RETURNED_LOST,
      LoanStatus.REJECTED,
      LoanStatus.CANCELLED,
      LoanStatus.EXPIRED,
    ];

    const where: any = {
      userId: user.userId,
      status: {
        in: filter === 'riwayat' ? historyStatuses : activeStatuses,
      },
    };

    const loans = await prisma.loan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: true,
            coverImage: true,
          },
        },
        bookCopy: {
          select: {
            id: true,
            inventoryCode: true,
          },
        },
      },
    });

    return loans.map((l) => formatLoanItem(l, true));
  }

  /**
   * User cancels loan while PENDING or APPROVED (BR-LOAN-11)
   */
  async cancelLoan(loanId: string, user: UserSessionPayload) {
    return prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
      });

      if (!loan) {
        throw HttpError.notFound('Pinjaman tidak ditemukan.');
      }

      if (loan.userId !== user.userId) {
        throw HttpError.forbidden('Hanya peminjam yang dapat membatalkan pengajuan ini.');
      }

      const status = loan.status as unknown as LoanStatus;
      if (status !== LoanStatus.PENDING && status !== LoanStatus.APPROVED) {
        throw HttpError.badRequest('Pinjaman dengan status saat ini tidak dapat dibatalkan.');
      }

      // Restore available copy
      await tx.book.update({
        where: { id: loan.bookId },
        data: { availableCopies: { increment: 1 } },
      });

      // If an individual copy was marked reserved, restore it
      if (loan.bookCopyId) {
        await tx.bookCopy.update({
          where: { id: loan.bookCopyId },
          data: { status: BookCopyStatus.AVAILABLE as unknown as any },
        });
      }

      await tx.loan.update({
        where: { id: loanId },
        data: {
          status: LoanStatus.CANCELLED as unknown as any,
        },
      });

      return { message: 'Pengajuan peminjaman berhasil dibatalkan.' };
    });
  }

  /**
   * Extend loan duration 1x (+7 days) (BR-LOAN-03 & BR-LOAN-04)
   */
  async extendLoan(loanId: string, user: UserSessionPayload) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { book: true },
    });

    if (!loan) {
      throw HttpError.notFound('Pinjaman tidak ditemukan.');
    }

    if (loan.userId !== user.userId) {
      throw HttpError.forbidden('Hanya peminjam yang dapat memperpanjang durasi pinjaman.');
    }

    if (loan.status !== (LoanStatus.BORROWED as unknown as any)) {
      throw HttpError.badRequest('Hanya pinjaman yang sedang berjalan yang dapat diperpanjang.');
    }

    if (loan.extensionCount >= 1) {
      throw HttpError.unprocessable('Perpanjangan hanya dapat dilakukan satu kali.', 'EXTENSION_NOT_ALLOWED');
    }

    // Check overdue
    if (loan.dueDate && new Date(loan.dueDate) < new Date()) {
      throw HttpError.badRequest('Pinjaman yang sudah melewati batas tenggat tidak dapat diperpanjang.');
    }

    // Check waitlist
    const waitlistCount = await prisma.waitlist.count({
      where: {
        bookId: loan.bookId,
        status: 'WAITING' as unknown as any,
      },
    });

    if (waitlistCount > 0) {
      throw HttpError.badRequest('Buku memiliki antrean daftar tunggu pembaca lain dan tidak dapat diperpanjang.');
    }

    const currentDue = loan.dueDate || new Date();
    const newDue = new Date(currentDue.getTime() + 7 * 24 * 60 * 60 * 1000);

    const updated = await prisma.loan.update({
      where: { id: loanId },
      data: {
        dueDate: newDue,
        extensionCount: { increment: 1 },
        lastExtendedAt: new Date(),
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: true,
            coverImage: true,
          },
        },
        bookCopy: {
          select: {
            id: true,
            inventoryCode: true,
          },
        },
      },
    });

    return {
      data: formatLoanItem(updated, true),
      message: 'Peminjaman berhasil diperpanjang 7 hari ke depan.',
    };
  }

  /**
   * Admin / Curator: List all loans with filters
   */
  async getAdminLoans(query: LoanQueryInput) {
    const { status, q, overdueOnly, sort = 'terbaru', page = 1, perPage = 20 } = query;
    const skip = (page - 1) * perPage;

    const where: any = {};

    if (status) {
      where.status = status as unknown as any;
    }

    if (overdueOnly === true) {
      where.OR = [
        { status: LoanStatus.OVERDUE as unknown as any },
        {
          status: LoanStatus.BORROWED as unknown as any,
          dueDate: { lt: new Date() },
        },
      ];
    }

    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { loanCode: { contains: term, mode: 'insensitive' } },
        { pickupCode: { contains: term, mode: 'insensitive' } },
        { user: { name: { contains: term, mode: 'insensitive' } } },
        { user: { username: { contains: term, mode: 'insensitive' } } },
        { book: { title: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const orderBy: any = sort === 'jatuhTempo' ? { dueDate: 'asc' } : { createdAt: 'desc' };

    const [total, items] = await Promise.all([
      prisma.loan.count({ where }),
      prisma.loan.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: true,
              coverImage: true,
            },
          },
          bookCopy: {
            select: {
              id: true,
              inventoryCode: true,
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
      }),
    ]);

    return {
      data: items.map((l) => formatLoanItem(l, true)),
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  /**
   * Admin / Curator: Approve loan & issue 6-digit pickup code
   */
  async approveLoan(loanId: string, input: LoanApproveInput, user: UserSessionPayload) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw HttpError.notFound('Pinjaman tidak ditemukan.');
    }

    if (loan.status !== (LoanStatus.PENDING as unknown as any)) {
      throw HttpError.badRequest('Hanya pengajuan dengan status PENDING yang dapat disetujui.');
    }

    let pickupCode = generatePickupCode();
    while (
      await prisma.loan.findFirst({
        where: { pickupCode, status: LoanStatus.APPROVED as unknown as any },
      })
    ) {
      pickupCode = generatePickupCode();
    }

    const deadlineDays = input.pickupDeadlineDays || 3;
    const pickupDeadline = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000);

    const updated = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: LoanStatus.APPROVED as unknown as any,
        pickupCode,
        pickupDeadline,
        approvedById: user.userId,
        approvedAt: new Date(),
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: true,
            coverImage: true,
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

    // Notify borrower
    try {
      const deadlineStr = pickupDeadline.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      await notificationsService.createNotification(updated.userId, {
        type: 'LOAN_APPROVED',
        title: 'Pengajuan Pinjaman Disetujui!',
        body: `Buku "${updated.book.title}" siap diambil di Meja Lapak. Kode Ambil: ${pickupCode} (berlaku s.d. ${deadlineStr}).`,
        actionUrl: '/dashboard/pinjaman',
        entityType: 'LOAN',
        entityId: updated.id,
      });
    } catch (e) {
      console.error('Failed to send loan approved notification:', e);
    }

    return {
      data: formatLoanItem(updated, true),
      message: `Peminjaman disetujui. Kode pengambilan: ${pickupCode}`,
    };
  }

  /**
   * Admin / Curator: Reject loan & restore available copies
   */
  async rejectLoan(loanId: string, reason: string, user?: UserSessionPayload) {
    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: {
          book: {
            select: { title: true },
          },
        },
      });

      if (!loan) {
        throw HttpError.notFound('Pinjaman tidak ditemukan.');
      }

      if (loan.status !== (LoanStatus.PENDING as unknown as any)) {
        throw HttpError.badRequest('Hanya pengajuan berstatus PENDING yang dapat ditolak.');
      }

      // Restore book copy
      await tx.book.update({
        where: { id: loan.bookId },
        data: { availableCopies: { increment: 1 } },
      });

      const updated = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: LoanStatus.REJECTED as unknown as any,
          rejectionReason: reason.trim(),
        },
        include: {
          book: {
            select: { title: true },
          },
        },
      });

      return { message: 'Pengajuan peminjaman ditolak.', data: updated };
    });

    // Notify borrower
    try {
      await notificationsService.createNotification(result.data.userId, {
        type: 'LOAN_REJECTED',
        title: 'Pengajuan Pinjaman Ditolak',
        body: `Pengajuan pinjaman buku "${result.data.book?.title || 'buku'}" belum dapat disetujui. Alasan: ${reason.trim()}`,
        actionUrl: '/dashboard/pinjaman',
        entityType: 'LOAN',
        entityId: result.data.id,
      });
    } catch (e) {
      console.error('Failed to send loan rejection notification:', e);
    }

    return result;
  }

  /**
   * Mode Lapak: Handover book to borrower using 6-digit pickupCode
   */
  async pickupLoan(input: LoanPickupInput, user: UserSessionPayload) {
    const { pickupCode, bookCopyId } = input;

    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findFirst({
        where: {
          pickupCode,
          status: LoanStatus.APPROVED as unknown as any,
        },
        include: { book: true },
      });

      if (!loan) {
        throw HttpError.notFound('Kode pengambilan tidak valid atau status bukan APPROVED.');
      }

      // Select copy to assign
      let copyId = bookCopyId;
      if (!copyId) {
        const availableCopy = await tx.bookCopy.findFirst({
          where: {
            bookId: loan.bookId,
            status: BookCopyStatus.AVAILABLE as unknown as any,
          },
        });

        if (!availableCopy) {
          throw HttpError.badRequest('Tidak ditemukan eksemplar fisik berstatus AVAILABLE untuk diserahkan.');
        }
        copyId = availableCopy.id;
      }

      // Update copy status
      await tx.bookCopy.update({
        where: { id: copyId },
        data: { status: BookCopyStatus.BORROWED as unknown as any },
      });

      // Update loan status to BORROWED with 14 days due date (BR-LOAN-02)
      const now = new Date();
      const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      const updated = await tx.loan.update({
        where: { id: loan.id },
        data: {
          status: LoanStatus.BORROWED as unknown as any,
          bookCopyId: copyId,
          handedOverById: user.userId,
          borrowedAt: now,
          dueDate,
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: true,
              coverImage: true,
            },
          },
          bookCopy: {
            select: {
              id: true,
              inventoryCode: true,
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

      return {
        data: formatLoanItem(updated, true),
        message: 'Buku berhasil diserahkan kepada peminjam.',
      };
    });

    // Notify borrower
    try {
      const borrowerId = result.data.borrower?.id;
      if (borrowerId) {
        const dueStr = result.data.dueDate
          ? new Date(result.data.dueDate).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '14 hari ke depan';
        await notificationsService.createNotification(borrowerId, {
          type: 'LOAN_ACTIVE',
          title: 'Buku Berhasil Diserah-terimakan!',
          body: `Selamat membaca "${result.data.book.title}". Batas pengembalian buku adalah ${dueStr}.`,
          actionUrl: '/dashboard/pinjaman',
          entityType: 'LOAN',
          entityId: result.data.id,
        });
      }
    } catch (e) {
      console.error('Failed to send loan handover notification:', e);
    }

    return result;
  }

  /**
   * Mode Lapak: Return book and inspect physical condition
   */
  async returnLoan(loanId: string, input: LoanReturnInput, user: UserSessionPayload) {
    const { condition, note } = input;

    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { bookCopy: true },
      });

      if (!loan) {
        throw HttpError.notFound('Pinjaman tidak ditemukan.');
      }

      const currentStatus = loan.status as unknown as LoanStatus;
      if (currentStatus !== LoanStatus.BORROWED && currentStatus !== LoanStatus.OVERDUE) {
        throw HttpError.badRequest('Hanya pinjaman yang sedang berjalan (BORROWED / OVERDUE) yang dapat dikembalikan.');
      }

      const isLost = condition === ReturnCondition.HILANG;
      const isDamaged = condition === ReturnCondition.RUSAK;

      let newLoanStatus: LoanStatus = LoanStatus.RETURNED;
      let newCopyStatus: BookCopyStatus = BookCopyStatus.AVAILABLE;

      if (isLost) {
        newLoanStatus = LoanStatus.RETURNED_LOST;
        newCopyStatus = BookCopyStatus.LOST;
      } else if (isDamaged) {
        newCopyStatus = BookCopyStatus.DAMAGED;
      }

      // Update book copy if exists
      if (loan.bookCopyId) {
        await tx.bookCopy.update({
          where: { id: loan.bookCopyId },
          data: { status: newCopyStatus as unknown as any },
        });
      }

      // Update book inventory statistics
      if (condition === ReturnCondition.BAIK) {
        await tx.book.update({
          where: { id: loan.bookId },
          data: {
            availableCopies: { increment: 1 },
            borrowCount: { increment: 1 },
          },
        });
      } else if (condition === ReturnCondition.RUSAK) {
        // Damaged book is pulled from active circulation:
        // availableCopies NOT incremented, totalCopies decremented for inventory accuracy
        await tx.book.update({
          where: { id: loan.bookId },
          data: {
            borrowCount: { increment: 1 },
            totalCopies: { decrement: 1 },
          },
        });
      } else if (condition === ReturnCondition.HILANG) {
        // totalCopies is decremented
        await tx.book.update({
          where: { id: loan.bookId },
          data: {
            totalCopies: { decrement: 1 },
          },
        });
      }

      const updated = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: newLoanStatus as unknown as any,
          returnCondition: condition as unknown as any,
          adminNote: note ? note.trim() : null,
          returnedAt: new Date(),
          receivedById: user.userId,
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: true,
              coverImage: true,
            },
          },
          bookCopy: {
            select: {
              id: true,
              inventoryCode: true,
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

      return {
        data: formatLoanItem(updated, true),
        message: 'Pengembalian buku berhasil dicatat.',
      };
    });

    // Notify borrower
    try {
      const borrowerId = result.data.borrower?.id;
      if (borrowerId) {
        await notificationsService.createNotification(borrowerId, {
          type: 'LOAN_RETURNED',
          title: 'Buku Berhasil Dikembalikan',
          body: `Buku "${result.data.book.title}" telah diterima kembali di Meja Lapak dengan kondisi ${condition}. Terima kasih telah membaca bersama Perpusjal Blora!`,
          actionUrl: '/dashboard/pinjaman',
          entityType: 'LOAN',
          entityId: result.data.id,
        });
      }
    } catch (e) {
      console.error('Failed to send loan return notification:', e);
    }

    return result;
  }

  /**
   * Mode Lapak: Fast Pickup Board ("Siap Diambil", "Jatuh Tempo Hari Ini", "Terlambat")
   */
  async getPickupBoard(): Promise<{
    readyForPickup: LoanPickupBoardItem[];
    dueToday: LoanPickupBoardItem[];
    overdue: LoanPickupBoardItem[];
  }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [ready, dueTodayRaw, overdueRaw] = await Promise.all([
      prisma.loan.findMany({
        where: {
          status: LoanStatus.APPROVED as unknown as any,
          pickupDeadline: { gte: todayStart },
        },
        include: { user: true, book: true },
        orderBy: { pickupDeadline: 'asc' },
        take: 20,
      }),
      prisma.loan.findMany({
        where: {
          status: LoanStatus.BORROWED as unknown as any,
          dueDate: { gte: todayStart, lte: todayEnd },
        },
        include: { user: true, book: true },
        orderBy: { dueDate: 'asc' },
        take: 20,
      }),
      prisma.loan.findMany({
        where: {
          OR: [
            { status: LoanStatus.OVERDUE as unknown as any },
            {
              status: LoanStatus.BORROWED as unknown as any,
              dueDate: { lt: todayStart },
            },
          ],
        },
        include: { user: true, book: true },
        orderBy: { dueDate: 'asc' },
        take: 20,
      }),
    ]);

    const toBoardItem = (l: any, type: 'READY_FOR_PICKUP' | 'DUE_TODAY' | 'OVERDUE'): LoanPickupBoardItem => ({
      id: l.id,
      loanCode: l.loanCode,
      pickupCode: l.pickupCode,
      borrowerName: l.user.name,
      bookTitle: l.book.title,
      status: l.status,
      pickupDeadline: l.pickupDeadline ? l.pickupDeadline.toISOString() : null,
      dueDate: l.dueDate ? l.dueDate.toISOString() : null,
      type,
    });

    return {
      readyForPickup: ready.map((l) => toBoardItem(l, 'READY_FOR_PICKUP')),
      dueToday: dueTodayRaw.map((l) => toBoardItem(l, 'DUE_TODAY')),
      overdue: overdueRaw.map((l) => toBoardItem(l, 'OVERDUE')),
    };
  }

  /**
   * Mode Lapak: Fast lookup by pickupCode, loanCode, memberCode (PJL-), username, or bookCopy inventoryCode (PJ-)
   */
  async lookupLoanByCode(code: string) {
    let trimmed = code.trim();

    // Strip full URL if scanned from web QR codes (e.g. https://domain.id/u/username or /buku/slug)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const url = new URL(trimmed);
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length >= 2 && pathSegments[0] === 'u') {
          trimmed = `@${pathSegments[1]}`;
        }
      } catch {
        // keep as is
      }
    }

    let loan: any = null;

    // 1. Direct match by pickupCode or loanCode (exact or case-insensitive)
    loan = await prisma.loan.findFirst({
      where: {
        OR: [
          { pickupCode: trimmed },
          { loanCode: { equals: trimmed, mode: 'insensitive' } },
        ],
      },
      include: {
        book: {
          include: {
            copies: {
              where: {
                status: BookCopyStatus.AVAILABLE as unknown as any,
              },
            },
          },
        },
        bookCopy: true,
        user: true,
      },
    });

    // 2. Member code match (PJL-XXXXXX) or username (@username)
    if (!loan && (trimmed.toUpperCase().startsWith('PJL-') || trimmed.startsWith('@'))) {
      let matchedUser: any = null;
      if (trimmed.startsWith('@')) {
        matchedUser = await prisma.user.findUnique({
          where: { username: trimmed.slice(1).toLowerCase() },
        });
      } else {
        const suffix = trimmed.replace(/^PJL-/i, '').toLowerCase();
        matchedUser = await prisma.user.findFirst({
          where: {
            id: { endsWith: suffix, mode: 'insensitive' },
          },
        });
      }

      if (matchedUser) {
        // Look for approved loan first, then active borrowed/overdue
        loan = await prisma.loan.findFirst({
          where: {
            userId: matchedUser.id,
            status: {
              in: [
                LoanStatus.APPROVED,
                LoanStatus.BORROWED,
                LoanStatus.OVERDUE,
              ] as unknown as any[],
            },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            book: {
              include: {
                copies: {
                  where: {
                    status: BookCopyStatus.AVAILABLE as unknown as any,
                  },
                },
              },
            },
            bookCopy: true,
            user: true,
          },
        });
      }
    }

    // 3. Book copy inventory code match (e.g. PJ-2026-0001)
    if (!loan) {
      const copy = await prisma.bookCopy.findFirst({
        where: {
          inventoryCode: { equals: trimmed, mode: 'insensitive' },
        },
      });

      if (copy) {
        loan = await prisma.loan.findFirst({
          where: {
            bookCopyId: copy.id,
            status: {
              in: [
                LoanStatus.BORROWED,
                LoanStatus.OVERDUE,
              ] as unknown as any[],
            },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            book: {
              include: {
                copies: {
                  where: {
                    status: BookCopyStatus.AVAILABLE as unknown as any,
                  },
                },
              },
            },
            bookCopy: true,
            user: true,
          },
        });
      }
    }

    if (!loan) {
      throw HttpError.notFound('Data peminjaman tidak ditemukan.');
    }

    return {
      loan: formatLoanItem(loan, true),
      availableCopies: loan.book.copies.map((c: any) => ({
        id: c.id,
        inventoryCode: c.inventoryCode,
        condition: c.condition,
      })),
    };
  }
}

export const loansService = new LoansService();
