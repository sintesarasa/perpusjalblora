import { Router } from 'express';
import { articlesController } from './articles.controller.js';
import { requireAuth, requireVerified, requireRole } from '../../middleware/auth.js';
import { Role } from '@perpusjal/types';

const router = Router();

// Public article routes
router.get('/', (req, res, next) => articlesController.getArticles(req, res, next));
router.get('/categories', (req, res, next) => articlesController.getCategories(req, res, next));

// Author routes (Protected)
router.get('/me/list', requireAuth, (req, res, next) => articlesController.getMyArticles(req, res, next));
router.post('/', requireAuth, requireVerified, (req, res, next) => articlesController.createArticle(req, res, next));
router.patch('/:id', requireAuth, (req, res, next) => articlesController.updateArticle(req, res, next));
router.delete('/:id', requireAuth, (req, res, next) => articlesController.deleteArticle(req, res, next));
router.post('/:id/submit', requireAuth, (req, res, next) => articlesController.submitArticle(req, res, next));
router.post('/:id/withdraw', requireAuth, (req, res, next) => articlesController.withdrawArticle(req, res, next));

// Curator & Admin Curation Queue (Protected: KURATOR or ADMIN)
router.get('/admin/queue', requireRole(Role.KURATOR), (req, res, next) => articlesController.getAdminArticles(req, res, next));
router.post('/:id/review/lock', requireRole(Role.KURATOR), (req, res, next) => articlesController.lockArticle(req, res, next));
router.delete('/:id/review/lock', requireRole(Role.KURATOR), (req, res, next) => articlesController.unlockArticle(req, res, next));
router.post('/:id/approve', requireRole(Role.KURATOR), (req, res, next) => articlesController.approveArticle(req, res, next));
router.post('/:id/request-revision', requireRole(Role.KURATOR), (req, res, next) => articlesController.requestRevision(req, res, next));
router.post('/:id/reject', requireRole(Role.KURATOR), (req, res, next) => articlesController.rejectArticle(req, res, next));
router.post('/:id/feature', requireRole(Role.KURATOR), (req, res, next) => articlesController.toggleFeatured(req, res, next));

// Specific slug routes (Must be placed AFTER specific named routes like /categories, /me/list, /admin/queue)
router.get('/:slug', (req, res, next) => articlesController.getArticleBySlug(req, res, next));
router.get('/:slug/related', (req, res, next) => articlesController.getRelatedArticles(req, res, next));
router.post('/:id/view', (req, res, next) => articlesController.recordView(req, res, next));

export const articlesRoutes = router;
