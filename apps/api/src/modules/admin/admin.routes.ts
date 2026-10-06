import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { requireRole } from '../../middleware/auth.js';
import { Role } from '@perpusjal/types';

export const adminRouter = Router();

adminRouter.get('/stats', requireRole(Role.ADMIN), (req, res, next) => adminController.getDashboardKPIs(req, res, next));
adminRouter.get('/audit-logs', requireRole(Role.ADMIN), (req, res, next) => adminController.getAuditLogs(req, res, next));

// Landing page configuration for Kurator and Admin
adminRouter.get('/landing-config', requireRole(Role.KURATOR), (req, res, next) => adminController.getLandingSettings(req, res, next));
adminRouter.put('/landing-config', requireRole(Role.KURATOR), (req, res, next) => adminController.updateLandingSettings(req, res, next));
