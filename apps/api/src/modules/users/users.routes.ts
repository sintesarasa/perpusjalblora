import { Router } from 'express';
import { usersController } from './users.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { Role } from '@perpusjal/types';

export const usersRouter = Router();

// Public routes
usersRouter.get('/profile/:username', (req, res, next) => usersController.getPublicProfile(req, res, next));
usersRouter.get('/contributors', (req, res, next) => usersController.getContributors(req, res, next));

// Authenticated current-user routes
usersRouter.patch('/me/profile', requireAuth, (req, res, next) => usersController.updateMyProfile(req, res, next));
usersRouter.post('/me/change-password', requireAuth, (req, res, next) => usersController.changePassword(req, res, next));
usersRouter.get('/me/export', requireAuth, (req, res, next) => usersController.exportMyData(req, res, next));

// Admin user management routes
usersRouter.get('/admin/list', requireRole(Role.ADMIN), (req, res, next) =>
  usersController.adminListUsers(req, res, next)
);
usersRouter.patch('/admin/:id/role', requireRole(Role.ADMIN), (req, res, next) =>
  usersController.adminUpdateRole(req, res, next)
);
usersRouter.patch('/admin/:id/suspend', requireRole(Role.ADMIN), (req, res, next) =>
  usersController.adminSuspendUser(req, res, next)
);
