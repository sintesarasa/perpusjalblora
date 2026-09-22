import { Router } from 'express';
import { badgesController } from './badges.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const badgesRouter = Router();

badgesRouter.get('/', (req, res, next) => badgesController.getAllBadges(req, res, next));
badgesRouter.get('/my-progress', requireAuth, (req, res, next) => badgesController.getMyBadges(req, res, next));
badgesRouter.get('/user/:userId', (req, res, next) => badgesController.getUserBadges(req, res, next));
