import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service.js';

export class NotificationsController {
  private getUserId(req: Request): string {
    const userId = req.user?.userId || (req.user as any)?.id;
    if (!userId) {
      throw new Error('User ID not found in session payload');
    }
    return userId;
  }

  /**
   * Real-time Server-Sent Events (SSE) notification stream
   * Endpoint: GET /api/v1/notifications/stream
   */
  async streamNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = this.getUserId(req);

      // Set headers for standard Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx proxy buffering
      res.flushHeaders?.();

      // Send initial state
      const initialUnread = await notificationsService.getUnreadCount(userId);
      res.write(`event: connected\ndata: ${JSON.stringify({ unreadCount: initialUnread })}\n\n`);

      // Heartbeat ping every 25 seconds to keep connection alive through reverse proxies
      const heartbeatTimer = setInterval(() => {
        if (!res.writableEnded) {
          res.write(':keep-alive\n\n');
        }
      }, 25000);

      // Subscribe to user notifications
      const unsubscribe = notificationsService.subscribe(userId, async (notification) => {
        try {
          if (!res.writableEnded) {
            const currentUnread = await notificationsService.getUnreadCount(userId);
            res.write(`event: notification\ndata: ${JSON.stringify(notification)}\n\n`);
            res.write(`event: unread_count\ndata: ${JSON.stringify({ unreadCount: currentUnread })}\n\n`);
          }
        } catch {
          // Ignore write errors on disconnected clients
        }
      });

      // Cleanup when client disconnects
      req.on('close', () => {
        clearInterval(heartbeatTimer);
        unsubscribe();
      });
    } catch (err) {
      next(err);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = this.getUserId(req);
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
      const userId = this.getUserId(req);
      const unreadCount = await notificationsService.getUnreadCount(userId);
      res.json({ success: true, data: { unreadCount } });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = this.getUserId(req);
      const id = String(req.params.id);
      const result = await notificationsService.markAsRead(id, userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = this.getUserId(req);
      const result = await notificationsService.markAllAsRead(userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = this.getUserId(req);
      const prefs = await notificationsService.getPreferences(userId);
      res.json({ success: true, data: prefs });
    } catch (err) {
      next(err);
    }
  }

  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = this.getUserId(req);
      const { preferences } = req.body;
      const result = await notificationsService.updatePreferences(userId, preferences || []);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationsController = new NotificationsController();
