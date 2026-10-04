import { Request, Response, NextFunction } from 'express';
import { badgesService } from './badges.service.js';

export class BadgesController {
  private getUserId(req: Request): string {
    const userId = req.user?.userId || (req.user as any)?.id;
    if (!userId) {
      throw new Error('User ID tidak ditemukan dalam sesi');
    }
    return userId;
  }

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
      const userId = this.getUserId(req);
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

  async equipTitle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = this.getUserId(req);
      const { title } = req.body;
      const result = await badgesService.equipTitle(userId, title ?? null);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateShowcase(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = this.getUserId(req);
      const { badgeCodes } = req.body;
      const result = await badgesService.updateShowcaseBadges(
        userId,
        Array.isArray(badgeCodes) ? badgeCodes : []
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async recordDonation(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = this.getUserId(req);
      const { targetUserId, count, note } = req.body;
      const result = await badgesService.recordBookDonation(
        adminUserId,
        String(targetUserId),
        Number(count),
        note
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const badgesController = new BadgesController();
