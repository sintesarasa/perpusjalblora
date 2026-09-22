import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';

export class AdminController {
  async getDashboardKPIs(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardKPIs();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, entityType, actorId } = req.query;
      const result = await adminService.getAuditLogs({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        entityType: entityType ? String(entityType) : undefined,
        actorId: actorId ? String(actorId) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
