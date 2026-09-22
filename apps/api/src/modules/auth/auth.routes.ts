import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// Authenticated user routes
router.post('/logout', requireAuth, (req, res, next) => authController.logout(req, res, next));
router.post('/resend-verification', requireAuth, (req, res, next) => authController.resendVerification(req, res, next));
router.get('/me', requireAuth, (req, res, next) => authController.getMe(req, res, next));
router.get('/sessions', requireAuth, (req, res, next) => authController.getSessions(req, res, next));
router.delete('/sessions/:id', requireAuth, (req, res, next) => authController.revokeSession(req, res, next));

export const authRoutes = router;
