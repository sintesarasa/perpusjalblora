import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', (req, res, next) => notificationsController.getNotifications(req, res, next));
notificationsRouter.get('/unread-count', (req, res, next) => notificationsController.getUnreadCount(req, res, next));
notificationsRouter.post('/mark-all-read', (req, res, next) => notificationsController.markAllAsRead(req, res, next));
notificationsRouter.patch('/:id/read', (req, res, next) => notificationsController.markAsRead(req, res, next));
notificationsRouter.get('/preferences', (req, res, next) => notificationsController.getPreferences(req, res, next));
notificationsRouter.put('/preferences', (req, res, next) => notificationsController.updatePreferences(req, res, next));
