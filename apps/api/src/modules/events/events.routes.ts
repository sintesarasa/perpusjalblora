import { Router } from 'express';
import { eventsController } from './events.controller.js';
import { requireAuth, requireVerified, requireRole } from '../../middleware/auth.js';
import { Role } from '@perpusjal/types';

const router = Router();

// Public routes
router.get('/', (req, res, next) => eventsController.getEvents(req, res, next));
router.get('/:id/calendar.ics', (req, res, next) => eventsController.getIcsCalendar(req, res, next));
router.get('/:slug', (req, res, next) => eventsController.getEventBySlug(req, res, next));

// Registered member routes (U+)
router.post('/:id/register', requireAuth, requireVerified, (req, res, next) =>
  eventsController.registerEvent(req, res, next)
);
router.post('/:id/cancel-registration', requireAuth, (req, res, next) =>
  eventsController.cancelRegistration(req, res, next)
);

// Organizer / Kurator desk (Protected: KURATOR or ADMIN)
router.post('/', requireRole(Role.KURATOR), (req, res, next) =>
  eventsController.createEvent(req, res, next)
);
router.patch('/:id', requireRole(Role.KURATOR), (req, res, next) =>
  eventsController.updateEvent(req, res, next)
);
router.get('/:id/registrations', requireRole(Role.KURATOR), (req, res, next) =>
  eventsController.getRegistrations(req, res, next)
);
router.post('/:id/checkin', requireRole(Role.KURATOR), (req, res, next) =>
  eventsController.checkin(req, res, next)
);
router.post('/:id/complete', requireRole(Role.KURATOR), (req, res, next) =>
  eventsController.completeEvent(req, res, next)
);

export const eventsRoutes = router;
