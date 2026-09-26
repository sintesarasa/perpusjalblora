import { Router } from 'express';
import { loansController } from './loans.controller.js';
import { requireAuth, requireVerified, requireRole } from '../../middleware/auth.js';
import { Role } from '@perpusjal/types';

const router = Router();

// Member loans routes (Protected: U+)
router.post('/', requireAuth, requireVerified, (req, res, next) =>
  loansController.requestLoan(req, res, next)
);
router.get('/me', requireAuth, (req, res, next) =>
  loansController.getMyLoans(req, res, next)
);
router.post('/:id/cancel', requireAuth, (req, res, next) =>
  loansController.cancelLoan(req, res, next)
);
router.post('/:id/extend', requireAuth, (req, res, next) =>
  loansController.extendLoan(req, res, next)
);

// Kurator & Relawan Mode Lapak routes (Protected: KURATOR or ADMIN)
router.get('/pickup-board', requireRole(Role.KURATOR), (req, res, next) =>
  loansController.getPickupBoard(req, res, next)
);
router.get('/lookup', requireRole(Role.KURATOR), (req, res, next) =>
  loansController.lookupLoanByCode(req, res, next)
);
router.post('/pickup', requireRole(Role.KURATOR), (req, res, next) =>
  loansController.pickupLoan(req, res, next)
);
router.post('/:id/return', requireRole(Role.KURATOR), (req, res, next) =>
  loansController.returnLoan(req, res, next)
);

// Admin & Curator listing & review
router.get('/', requireRole(Role.KURATOR), (req, res, next) =>
  loansController.getAdminLoans(req, res, next)
);
router.post('/:id/approve', requireRole(Role.KURATOR), (req, res, next) =>
  loansController.approveLoan(req, res, next)
);
router.post('/:id/reject', requireRole(Role.KURATOR), (req, res, next) =>
  loansController.rejectLoan(req, res, next)
);
router.post('/admin/maintenance', requireRole(Role.KURATOR), (req, res, next) =>
  loansController.runMaintenance(req, res, next)
);

export const loansRoutes = router;
