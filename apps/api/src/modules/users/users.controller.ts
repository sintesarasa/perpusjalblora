import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';
import { Role, UserStatus } from '@perpusjal/types';

export class UsersController {
  async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const username = String(req.params.username);
      const profile = await usersService.getPublicProfile(username);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  async getContributors(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await usersService.getContributors(
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const updated = await usersService.updateMyProfile(userId, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await usersService.changePassword(userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async exportMyData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await usersService.exportMyData(userId);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=perpusjal-data-${userId}.json`);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async adminListUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, role, status, q } = req.query;
      const result = await usersService.adminListUsers({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        role: role as Role,
        status: status as UserStatus,
        q: q ? String(q) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async adminUpdateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user.id;
      const id = String(req.params.id);
      const { role } = req.body;
      const result = await usersService.adminUpdateRole(actorId, id, role);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async adminSuspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user.id;
      const id = String(req.params.id);
      const result = await usersService.adminSuspendUser(actorId, id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();
