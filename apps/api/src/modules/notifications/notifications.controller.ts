import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service.js';

export class NotificationsController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { page, limit, unreadOnly } = req.query;
      const result = await notificationsService.getNotifications(userId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 15,
        unreadOnly: unreadOnly === 'true',
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const unreadCount = await notificationsService.getUnreadCount(userId);
      res.json({ success: true, data: { unreadCount } });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const id = String(req.params.id);
      const result = await notificationsService.markAsRead(id, userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await notificationsService.markAllAsRead(userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const prefs = await notificationsService.getPreferences(userId);
      res.json({ success: true, data: prefs });
    } catch (err) {
      next(err);
    }
  }

  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { preferences } = req.body;
      const result = await notificationsService.updatePreferences(userId, preferences || []);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationsController = new NotificationsController();
