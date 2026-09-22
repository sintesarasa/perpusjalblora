import { Router } from 'express';
import { commentsController } from './comments.controller.js';
import { requireAuth, requireVerified, requireRole } from '../../middleware/auth.js';
import { Role } from '@perpusjal/types';

const router = Router();

// Public comment read (respects req.user if logged in for author's pending comments)
router.get('/', (req, res, next) => commentsController.getComments(req, res, next));

// Authenticated comment actions
router.post('/', requireAuth, requireVerified, (req, res, next) =>
  commentsController.createComment(req, res, next)
);
router.patch('/:id', requireAuth, (req, res, next) =>
  commentsController.updateComment(req, res, next)
);
router.delete('/:id', requireAuth, (req, res, next) =>
  commentsController.deleteComment(req, res, next)
);
router.post('/:id/report', requireAuth, (req, res, next) =>
  commentsController.reportComment(req, res, next)
);

// Kurator & Admin Moderation Queue
router.get('/admin/queue', requireRole(Role.KURATOR), (req, res, next) =>
  commentsController.getModerationQueue(req, res, next)
);
router.post('/admin/:id/moderate', requireRole(Role.KURATOR), (req, res, next) =>
  commentsController.moderateComment(req, res, next)
);

export const commentsRoutes = router;
