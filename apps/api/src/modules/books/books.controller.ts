import { Request, Response, NextFunction } from 'express';
import {
  bookQuerySchema,
  bookCreateSchema,
  bookUpdateSchema,
  bookCopyCreateSchema,
  bookCopyUpdateSchema,
  createBookReviewSchema,
  bookFeaturedSchema,
} from '@perpusjal/types';
import { booksService } from './books.service.js';

export class BooksController {
  async getBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const query = bookQuerySchema.parse(req.query);
      const result = await booksService.getBooks(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getBookBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const result = await booksService.getBookBySlug(slug);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async getBookAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const result = await booksService.getBookAvailability(slug, req.user);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const input = bookCreateSchema.parse(req.body);
      const result = await booksService.createBook(input);
      res.status(201).json({ data: result, message: 'Buku berhasil ditambahkan ke katalog.' });
    } catch (error) {
      next(error);
    }
  }

  async updateBook(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = bookUpdateSchema.parse(req.body);
      const result = await booksService.updateBook(id, input);
      res.status(200).json({ data: result, message: 'Buku berhasil diperbarui.' });
    } catch (error) {
      next(error);
    }
  }

  async togglePublish(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await booksService.togglePublish(id);
      res.status(200).json({ data: result, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async toggleFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = bookFeaturedSchema.parse(req.body);
      const result = await booksService.toggleFeatured(id, input.isFeatured, input.curatorNote);
      res.status(200).json({ data: result, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async toggleBorrowable(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const isBorrowable = typeof req.body?.isBorrowable === 'boolean' ? req.body.isBorrowable : undefined;
      const result = await booksService.toggleBorrowable(id, isBorrowable);
      res.status(200).json({ data: result, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async deleteBook(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await booksService.deleteBook(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCopies(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = req.params.id as string;
      const result = await booksService.getCopies(bookId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async createCopy(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = req.params.id as string;
      const input = bookCopyCreateSchema.parse(req.body);
      const result = await booksService.createCopy(bookId, input);
      res.status(201).json({ data: result, message: 'Eksemplar baru berhasil ditambahkan.' });
    } catch (error) {
      next(error);
    }
  }

  async updateCopy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = bookCopyUpdateSchema.parse(req.body);
      const result = await booksService.updateCopy(id, input);
      res.status(200).json({ data: result, message: 'Data eksemplar berhasil diperbarui.' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCopy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await booksService.deleteCopy(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const bookSlugOrId = req.params.id as string;
      const input = createBookReviewSchema.parse(req.body);
      const result = await booksService.createReview(bookSlugOrId, input, req.user!);
      res.status(201).json({
        data: result,
        message: 'Resensi buku berhasil disimpan.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const bookSlugOrId = req.params.id as string;
      const result = await booksService.getBookReviews(bookSlugOrId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const booksController = new BooksController();
