import { Router } from 'express';
import { badgesController } from './badges.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { Role } from '@perpusjal/types';

export const badgesRouter = Router();

badgesRouter.get('/', (req, res, next) => badgesController.getAllBadges(req, res, next));
badgesRouter.get('/my-progress', requireAuth, (req, res, next) => badgesController.getMyBadges(req, res, next));
badgesRouter.patch('/equip-title', requireAuth, (req, res, next) => badgesController.equipTitle(req, res, next));
badgesRouter.patch('/showcase', requireAuth, (req, res, next) => badgesController.updateShowcase(req, res, next));
badgesRouter.post('/admin/record-donation', requireAuth, requireRole(Role.KURATOR), (req, res, next) =>
  badgesController.recordDonation(req, res, next)
);
badgesRouter.get('/user/:userId', (req, res, next) => badgesController.getUserBadges(req, res, next));
