import { Request, Response, NextFunction } from 'express';
import { badgesService } from './badges.service.js';

export class BadgesController {
  async getAllBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const badges = await badgesService.getAllBadges();
      res.json({ success: true, data: badges });
    } catch (err) {
      next(err);
    }
  }

  async getMyBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const progress = await badgesService.getUserBadgeProgress(userId);
      res.json({ success: true, data: progress });
    } catch (err) {
      next(err);
    }
  }

  async getUserBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String(req.params.userId);
      const progress = await badgesService.getUserBadgeProgress(userId);
      res.json({ success: true, data: progress });
    } catch (err) {
      next(err);
    }
  }
}

export const badgesController = new BadgesController();
