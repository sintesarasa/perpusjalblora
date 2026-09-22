import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/errors.js';
import {
  BookQueryInput,
  BookCreateInput,
  BookUpdateInput,
  BookCopyCreateInput,
  BookCopyUpdateInput,
  BookItem,
  BookDetail,
  BookAvailabilityResponse,
  BookAvailabilityStatus,
  BookCopyStatus,
  BookCondition,
  Language,
  LoanStatus,
  UserSessionPayload,
} from '@perpusjal/types';

function computeAvailability(availableCopies: number, isBorrowable: boolean): BookAvailabilityStatus {
  if (!isBorrowable) return 'READ_ONLY';
  if (availableCopies > 1) return 'AVAILABLE';
  if (availableCopies === 1) return 'LAST_ONE';
  return 'BORROWED';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export class BooksService {
  /**
   * Public Book Catalog with filters and availability computation
   */
  async getBooks(query: BookQueryInput) {
    const {
      q,
      kategori,
      tersedia,
      bahasa,
      tahunMin,
      tahunMax,
      sort = 'terbaru',
      page = 1,
      perPage = 24,
    } = query;
    const skip = (page - 1) * perPage;

    const where: any = {
      isPublished: true,
      deletedAt: null,
    };

    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { author: { contains: term, mode: 'insensitive' } },
        { isbn: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (kategori) {
      where.category = { slug: kategori };
    }

    if (tersedia === true) {
      where.availableCopies = { gt: 0 };
      where.isBorrowable = true;
    }

    if (bahasa) {
      where.language = bahasa as unknown as any;
    }

    if (tahunMin || tahunMax) {
      where.publicationYear = {};
      if (tahunMin) where.publicationYear.gte = tahunMin;
      if (tahunMax) where.publicationYear.lte = tahunMax;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'populer') {
      orderBy = { borrowCount: 'desc' };
    } else if (sort === 'judul') {
      orderBy = { title: 'asc' };
    }

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          author: true,
          isbn: true,
          coverImage: true,
          totalCopies: true,
          availableCopies: true,
          isBorrowable: true,
          shelfLocation: true,
          publicationYear: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    const items: BookItem[] = books.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      author: b.author,
      isbn: b.isbn,
      coverImage: b.coverImage,
      category: b.category,
      totalCopies: b.totalCopies,
      availableCopies: b.availableCopies,
      isBorrowable: b.isBorrowable,
      availability: computeAvailability(b.availableCopies, b.isBorrowable),
      shelfLocation: b.shelfLocation,
      publicationYear: b.publicationYear,
    }));

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
   * Detail dossier of a book + 4 similar books + estimated return date
   */
  async getBookBySlug(slug: string): Promise<BookDetail> {
    const book = await prisma.book.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        copies: {
          where: {
            status: {
              not: BookCopyStatus.LOST as unknown as any,
            },
          },
          select: {
            id: true,
            inventoryCode: true,
            condition: true,
            status: true,
            note: true,
            createdAt: true,
          },
        },
      },
    });

    if (!book || book.deletedAt) {
      throw HttpError.notFound('Buku tidak ditemukan atau telah dihapus dari katalog.');
    }

    // Similar books from same category
    const similarRaw = await prisma.book.findMany({
      where: {
        categoryId: book.categoryId,
        id: { not: book.id },
        isPublished: true,
        deletedAt: null,
      },
      take: 4,
      orderBy: { borrowCount: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        author: true,
        isbn: true,
        coverImage: true,
        totalCopies: true,
        availableCopies: true,
        isBorrowable: true,
        shelfLocation: true,
        publicationYear: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const similarBooks: BookItem[] = similarRaw.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      author: b.author,
      isbn: b.isbn,
      coverImage: b.coverImage,
      category: b.category,
      totalCopies: b.totalCopies,
      availableCopies: b.availableCopies,
      isBorrowable: b.isBorrowable,
      availability: computeAvailability(b.availableCopies, b.isBorrowable),
      shelfLocation: b.shelfLocation,
      publicationYear: b.publicationYear,
    }));

    // If all copies are borrowed, find the closest return date
    let estimatedReturnDate: string | null = null;
    if (book.availableCopies === 0) {
      const nearestLoan = await prisma.loan.findFirst({
        where: {
          bookId: book.id,
          status: LoanStatus.BORROWED as unknown as any,
          dueDate: { gte: new Date() },
        },
        orderBy: { dueDate: 'asc' },
        select: { dueDate: true },
      });
      if (nearestLoan?.dueDate) {
        estimatedReturnDate = nearestLoan.dueDate.toISOString().split('T')[0];
      }
    }

    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      description: book.description,
      coverImage: book.coverImage,
      language: book.language as unknown as Language,
      pages: book.pages,
      shelfLocation: book.shelfLocation,
      donatedBy: book.donatedBy,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      isBorrowable: book.isBorrowable,
      availability: computeAvailability(book.availableCopies, book.isBorrowable),
      borrowCount: book.borrowCount,
      createdAt: book.createdAt.toISOString(),
      category: book.category,
      copies: book.copies.map((c) => ({
        id: c.id,
        inventoryCode: c.inventoryCode,
        condition: c.condition as unknown as BookCondition,
        status: c.status as unknown as BookCopyStatus,
        note: c.note,
        createdAt: c.createdAt.toISOString(),
      })),
      similarBooks,
      estimatedReturnDate,
    };
  }

  /**
   * Fast real-time availability and user eligibility check (FR-LIB-02)
   */
  async getBookAvailability(slug: string, user?: UserSessionPayload): Promise<BookAvailabilityResponse> {
    const book = await prisma.book.findUnique({
      where: { slug },
      select: {
        id: true,
        availableCopies: true,
        isBorrowable: true,
        isPublished: true,
        deletedAt: true,
      },
    });

    if (!book || book.deletedAt || !book.isPublished) {
      throw HttpError.notFound('Buku tidak ditemukan.');
    }

    const availability = computeAvailability(book.availableCopies, book.isBorrowable);

    let estimatedReturnDate: string | null = null;
    if (book.availableCopies === 0) {
      const nearestLoan = await prisma.loan.findFirst({
        where: {
          bookId: book.id,
          status: LoanStatus.BORROWED as unknown as any,
          dueDate: { gte: new Date() },
        },
        orderBy: { dueDate: 'asc' },
        select: { dueDate: true },
      });
      if (nearestLoan?.dueDate) {
        estimatedReturnDate = nearestLoan.dueDate.toISOString().split('T')[0];
      }
    }

    let canBorrow = true;
    let reason: string | undefined;
    let message: string | undefined;

    if (!book.isBorrowable) {
      canBorrow = false;
      reason = 'BOOK_NOT_BORROWABLE';
      message = 'Buku ini hanya untuk dibaca di tempat / referensi arsip.';
    } else if (book.availableCopies <= 0) {
      canBorrow = false;
      reason = 'BOOK_UNAVAILABLE';
      message = 'Semua eksemplar buku ini sedang dipinjam.';
    } else if (user) {
      // Check user eligibility
      const [overdueCount, activeLoansCount, duplicateLoan] = await Promise.all([
        prisma.loan.count({
          where: {
            userId: user.userId,
            status: LoanStatus.OVERDUE as unknown as any,
          },
        }),
        prisma.loan.count({
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
        }),
        prisma.loan.findFirst({
          where: {
            userId: user.userId,
            bookId: book.id,
            status: {
              in: [
                LoanStatus.PENDING,
                LoanStatus.APPROVED,
                LoanStatus.BORROWED,
              ] as unknown as any[],
            },
          },
        }),
      ]);

      if (overdueCount > 0) {
        canBorrow = false;
        reason = 'HAS_OVERDUE';
        message = 'Anda memiliki pinjaman yang melewati batas tenggat. Kembalikan buku terlebih dahulu.';
      } else if (activeLoansCount >= 2) {
        canBorrow = false;
        reason = 'MAX_ACTIVE_LOANS';
        message = 'Batas maksimal peminjaman aktif tercapai (maksimal 2 judul buku).';
      } else if (duplicateLoan) {
        canBorrow = false;
        reason = 'DUPLICATE_REQUEST';
        message = 'Anda sudah memiliki pengajuan aktif untuk judul buku ini.';
      }
    }

    return {
      availableCopies: book.availableCopies,
      availability,
      estimatedReturnDate,
      userEligibility: {
        canBorrow,
        reason,
        message,
        canJoinWaitlist: !canBorrow && book.isBorrowable,
      },
    };
  }

  /**
   * Create a new Book with initial copies
   */
  async createBook(input: BookCreateInput) {
    const baseSlug = slugify(input.title);
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${randomSuffix}`;

    const initialCopiesCount = input.initialCopies || 0;
    const year = new Date().getFullYear();

    const book = await prisma.$transaction(async (tx) => {
      const created = await tx.book.create({
        data: {
          title: input.title.trim(),
          slug,
          author: input.author.trim(),
          isbn: input.isbn ? input.isbn.trim() : null,
          publisher: input.publisher ? input.publisher.trim() : null,
          publicationYear: input.publicationYear || null,
          categoryId: input.categoryId,
          description: input.description ? input.description.trim() : null,
          coverImage: input.coverImage || null,
          language: input.language as unknown as any,
          pages: input.pages || null,
          shelfLocation: input.shelfLocation ? input.shelfLocation.trim() : null,
          donatedBy: input.donatedBy ? input.donatedBy.trim() : null,
          isPublished: input.isPublished ?? true,
          isBorrowable: input.isBorrowable ?? true,
          totalCopies: initialCopiesCount,
          availableCopies: initialCopiesCount,
        },
      });

      if (initialCopiesCount > 0) {
        const copyData = Array.from({ length: initialCopiesCount }).map((_, idx) => ({
          bookId: created.id,
          inventoryCode: `PJ-${year}-${(idx + 1).toString().padStart(4, '0')}`,
          condition: BookCondition.BAIK as unknown as any,
          status: BookCopyStatus.AVAILABLE as unknown as any,
        }));

        await tx.bookCopy.createMany({
          data: copyData,
        });
      }

      return created;
    });

    return this.getBookBySlug(book.slug);
  }

  /**
   * Update Book details
   */
  async updateBook(id: string, input: BookUpdateInput) {
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw HttpError.notFound('Buku tidak ditemukan.');
    }

    const updated = await prisma.book.update({
      where: { id },
      data: {
        ...(input.title ? { title: input.title.trim() } : {}),
        ...(input.author ? { author: input.author.trim() } : {}),
        ...(input.isbn !== undefined ? { isbn: input.isbn ? input.isbn.trim() : null } : {}),
        ...(input.publisher !== undefined ? { publisher: input.publisher ? input.publisher.trim() : null } : {}),
        ...(input.publicationYear !== undefined ? { publicationYear: input.publicationYear } : {}),
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
        ...(input.description !== undefined ? { description: input.description ? input.description.trim() : null } : {}),
        ...(input.coverImage !== undefined ? { coverImage: input.coverImage } : {}),
        ...(input.language ? { language: input.language as unknown as any } : {}),
        ...(input.pages !== undefined ? { pages: input.pages } : {}),
        ...(input.shelfLocation !== undefined ? { shelfLocation: input.shelfLocation } : {}),
        ...(input.donatedBy !== undefined ? { donatedBy: input.donatedBy } : {}),
        ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
        ...(input.isBorrowable !== undefined ? { isBorrowable: input.isBorrowable } : {}),
      },
    });

    return this.getBookBySlug(updated.slug);
  }

  /**
   * Soft-delete book (check active loans first)
   */
  async deleteBook(id: string) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        loans: {
          where: {
            status: {
              in: [
                LoanStatus.PENDING,
                LoanStatus.APPROVED,
                LoanStatus.BORROWED,
                LoanStatus.OVERDUE,
              ] as unknown as any[],
            },
          },
        },
      },
    });

    if (!book) {
      throw HttpError.notFound('Buku tidak ditemukan.');
    }

    if (book.loans.length > 0) {
      throw HttpError.conflict('Buku memiliki pinjaman aktif yang belum selesai. Tidak dapat dihapus.');
    }

    await prisma.book.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isPublished: false,
      },
    });

    return { message: 'Buku berhasil dihapus dari katalog.' };
  }

  /**
   * Copies management
   */
  async getCopies(bookId: string) {
    return prisma.bookCopy.findMany({
      where: { bookId },
      orderBy: { inventoryCode: 'asc' },
    });
  }

  async createCopy(bookId: string, input: BookCopyCreateInput) {
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.deletedAt) {
      throw HttpError.notFound('Buku tidak ditemukan.');
    }

    const year = new Date().getFullYear();
    const count = await prisma.bookCopy.count({ where: { bookId } });
    const inventoryCode = input.inventoryCode || `PJ-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const isAvailable = (input.status || BookCopyStatus.AVAILABLE) === BookCopyStatus.AVAILABLE;

    return prisma.$transaction(async (tx) => {
      const copy = await tx.bookCopy.create({
        data: {
          bookId,
          inventoryCode,
          condition: input.condition as unknown as any,
          status: input.status as unknown as any,
          note: input.note || null,
        },
      });

      await tx.book.update({
        where: { id: bookId },
        data: {
          totalCopies: { increment: 1 },
          ...(isAvailable ? { availableCopies: { increment: 1 } } : {}),
        },
      });

      return copy;
    });
  }

  async updateCopy(copyId: string, input: BookCopyUpdateInput) {
    const copy = await prisma.bookCopy.findUnique({ where: { id: copyId } });
    if (!copy) {
      throw HttpError.notFound('Eksemplar tidak ditemukan.');
    }

    const oldStatus = copy.status as unknown as BookCopyStatus;
    const newStatus = (input.status || oldStatus) as BookCopyStatus;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.bookCopy.update({
        where: { id: copyId },
        data: {
          ...(input.condition ? { condition: input.condition as unknown as any } : {}),
          ...(input.status ? { status: input.status as unknown as any } : {}),
          ...(input.note !== undefined ? { note: input.note } : {}),
        },
      });

      // Adjust availableCopies if availability changed
      if (oldStatus !== BookCopyStatus.AVAILABLE && newStatus === BookCopyStatus.AVAILABLE) {
        await tx.book.update({
          where: { id: copy.bookId },
          data: { availableCopies: { increment: 1 } },
        });
      } else if (oldStatus === BookCopyStatus.AVAILABLE && newStatus !== BookCopyStatus.AVAILABLE) {
        await tx.book.update({
          where: { id: copy.bookId },
          data: { availableCopies: { decrement: 1 } },
        });
      }

      return updated;
    });
  }

  async deleteCopy(copyId: string) {
    const copy = await prisma.bookCopy.findUnique({ where: { id: copyId } });
    if (!copy) {
      throw HttpError.notFound('Eksemplar tidak ditemukan.');
    }

    if (copy.status === (BookCopyStatus.BORROWED as unknown as any)) {
      throw HttpError.badRequest('Eksemplar sedang dipinjam dan tidak dapat dihapus.');
    }

    const wasAvailable = copy.status === (BookCopyStatus.AVAILABLE as unknown as any);

    await prisma.$transaction(async (tx) => {
      await tx.bookCopy.delete({ where: { id: copyId } });
      await tx.book.update({
        where: { id: copy.bookId },
        data: {
          totalCopies: { decrement: 1 },
          ...(wasAvailable ? { availableCopies: { decrement: 1 } } : {}),
        },
      });
    });

    return { message: 'Eksemplar berhasil dihapus.' };
  }
}

export const booksService = new BooksService();
