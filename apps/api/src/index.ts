import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware, requireAuth, requireRole } from './middleware/auth.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { articlesRoutes } from './modules/articles/articles.routes.js';
import { articlesController } from './modules/articles/articles.controller.js';
import { pagesRoutes } from './modules/pages/pages.routes.js';
import { commentsRoutes } from './modules/comments/comments.routes.js';
import { searchRoutes } from './modules/search/search.routes.js';
import { booksRoutes } from './modules/books/books.routes.js';
import { loansRoutes } from './modules/loans/loans.routes.js';
import { loansController } from './modules/loans/loans.controller.js';
import { eventsRoutes } from './modules/events/events.routes.js';
import { lettersRoutes } from './modules/letters/letters.routes.js';
import { lettersController } from './modules/letters/letters.controller.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { badgesRouter } from './modules/badges/badges.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { prisma } from './lib/prisma.js';
import { Role } from '@perpusjal/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Utility Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use(authMiddleware);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articlesRoutes);
app.use('/api/v1/pages', pagesRoutes);
app.use('/api/v1/comments', commentsRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/books', booksRoutes);
app.use('/api/v1/loans', loansRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/letters', lettersRoutes);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/badges', badgesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/admin', adminRouter);

// Convenience aliases per API-SPEC §6, §11, §14
app.get('/api/v1/me/articles', requireAuth, (req, res, next) =>
  articlesController.getMyArticles(req, res, next)
);
app.get('/api/v1/me/loans', requireAuth, (req, res, next) =>
  loansController.getMyLoans(req, res, next)
);
app.get('/api/v1/me/letters', requireAuth, (req, res, next) =>
  lettersController.getMyLetters(req, res, next)
);
app.get('/api/v1/moderation/letters', requireRole(Role.KURATOR), (req, res, next) =>
  lettersController.getModerationLetters(req, res, next)
);
app.get('/api/v1/admin/articles', requireRole(Role.KURATOR), (req, res, next) =>
  articlesController.getAdminArticles(req, res, next)
);

// Health check endpoint (PRD §23.2, §31.2)
app.get('/health', async (req, res) => {
  try {
    // Quick DB ping
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      service: 'perpusjal-api',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      service: 'perpusjal-api',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// API Root Information
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'Perpusjal API',
    version: '3.0.0',
    description: 'REST API Perpustakaan Jalanan Blora — Membaca dan Berbahagia.',
    docs: '/api-docs',
  });
});

// Error handling middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`📖 Perpusjal API v3 running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
  });
}

export default app;
