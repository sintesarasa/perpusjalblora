import { Router } from 'express';
import { lettersController } from './letters.controller.js';
import { requireAuth, requireVerified, requireRole } from '../../middleware/auth.js';
import { Role } from '@perpusjal/types';

const router = Router();

// Public routes
router.get('/', (req, res, next) => lettersController.getLetters(req, res, next));
router.get('/me', requireAuth, (req, res, next) => lettersController.getMyLetters(req, res, next));
router.get('/:slug', (req, res, next) => lettersController.getLetterBySlug(req, res, next));

// Registered member submission (U+)
router.post('/', requireAuth, requireVerified, (req, res, next) =>
  lettersController.createLetter(req, res, next)
);

// Curator & Admin moderation queue (K)
router.get('/moderation/queue', requireRole(Role.KURATOR), (req, res, next) =>
  lettersController.getModerationLetters(req, res, next)
);
router.post('/:id/approve', requireRole(Role.KURATOR), (req, res, next) =>
  lettersController.approveLetter(req, res, next)
);
router.post('/:id/reject', requireRole(Role.KURATOR), (req, res, next) =>
  lettersController.rejectLetter(req, res, next)
);

export const lettersRoutes = router;
