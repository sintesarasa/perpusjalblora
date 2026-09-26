import { Router } from 'express';
import { waitlistController } from './waitlist.controller.js';
import { requireAuth, requireVerified, requireRole } from '../../middleware/auth.js';
import { Role } from '@perpusjal/types';

const router = Router();

// Member waitlist routes (Protected: U+)
router.get('/me', requireAuth, (req, res, next) => waitlistController.getMyWaitlists(req, res, next));
router.post('/', requireAuth, requireVerified, (req, res, next) => waitlistController.joinWaitlist(req, res, next));
router.delete('/:id', requireAuth, (req, res, next) => waitlistController.leaveWaitlist(req, res, next));

// Kurator / Relawan Sirkulasi routes (Protected: KURATOR or ADMIN)
router.get('/book/:bookId', requireRole(Role.KURATOR), (req, res, next) => waitlistController.getBookWaitlists(req, res, next));
router.get('/recommendation/:bookId', requireRole(Role.KURATOR), (req, res, next) => waitlistController.getTopRecommendation(req, res, next));
router.post('/:id/allocate', requireRole(Role.KURATOR), (req, res, next) => waitlistController.allocateWaitlist(req, res, next));

export const waitlistRoutes = router;
