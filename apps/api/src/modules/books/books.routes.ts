import { Router } from 'express';
import { booksController } from './books.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { Role } from '@perpusjal/types';

const router = Router();

// Public routes
router.get('/', (req, res, next) => booksController.getBooks(req, res, next));
router.get('/:slug/availability', (req, res, next) => booksController.getBookAvailability(req, res, next));
router.get('/:slug', (req, res, next) => booksController.getBookBySlug(req, res, next));

// Curator & Admin management routes
router.post('/', requireRole(Role.KURATOR), (req, res, next) => booksController.createBook(req, res, next));
router.patch('/:id', requireRole(Role.KURATOR), (req, res, next) => booksController.updateBook(req, res, next));
router.delete('/:id', requireRole(Role.KURATOR), (req, res, next) => booksController.deleteBook(req, res, next));

// Copy management routes
router.get('/:id/copies', requireRole(Role.KURATOR), (req, res, next) => booksController.getCopies(req, res, next));
router.post('/:id/copies', requireRole(Role.KURATOR), (req, res, next) => booksController.createCopy(req, res, next));
router.patch('/copies/:id', requireRole(Role.KURATOR), (req, res, next) => booksController.updateCopy(req, res, next));
router.delete('/copies/:id', requireRole(Role.KURATOR), (req, res, next) => booksController.deleteCopy(req, res, next));

export const booksRoutes = router;
