import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { requireRole } from '../../middleware/auth.js';
import { Role } from '@perpusjal/types';

export const adminRouter = Router();

adminRouter.use(requireRole(Role.ADMIN));

adminRouter.get('/stats', (req, res, next) => adminController.getDashboardKPIs(req, res, next));
adminRouter.get('/audit-logs', (req, res, next) => adminController.getAuditLogs(req, res, next));
