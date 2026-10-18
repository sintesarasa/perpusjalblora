import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware, requireAuth, requireRole } from './middleware/auth.js';
import { healthLimiter } from './middleware/rate-limit.js';
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
import { adminController } from './modules/admin/admin.controller.js';
import { waitlistRoutes } from './modules/waitlist/waitlist.routes.js';
import { circulationSchedulerService } from './modules/loans/circulation-scheduler.service.js';
import { articleSchedulerService } from './modules/articles/article-scheduler.service.js';
import { prisma } from './lib/prisma.js';
import { Role } from '@perpusjal/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Trust reverse proxy (Vercel & Render load balancers) so rate limiting reads real client IP
app.set('trust proxy', 1);

app.set('etag', false);

// Security & Utility Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.APP_URL,
  'https://perpusjalblora.org',
  'https://www.perpusjalblora.org',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-side calls)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow only official Perpusjal Vercel deployment branches (prevent arbitrary vercel app takeover)
      if (/^https:\/\/(perpusjal|perpusjalblora)(-[a-z0-9-]+)?\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      // Allow localhost with any port in development
      if (
        process.env.NODE_ENV !== 'production' &&
        (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin))
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));
app.use(authMiddleware);

// Intelligent Cache Control: No-store for authenticated / mutative routes, but enable edge/browser caching for public GET catalog
app.use('/api', (req, res, next) => {
  const hasAuth = req.cookies?.perpusjal_session || req.headers.authorization;
  if (hasAuth || req.method !== 'GET') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  } else {
    // Public GET endpoints (landing, public book catalog, public articles) get lightweight edge/browser cache
    res.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600');
  }
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articlesRoutes);
app.use('/api/v1/pages', pagesRoutes);
app.use('/api/v1/comments', commentsRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/books', booksRoutes);
app.use('/api/v1/loans', loansRoutes);
app.use('/api/v1/waitlist', waitlistRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/letters', lettersRoutes);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/badges', badgesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/admin', adminRouter);

// Protected Cron Endpoints (Compatible with GitHub Actions, Vercel Cron, or External Uptime/Cron runners)
const verifyCronSecret = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Cron authentication required or invalid token.' },
    });
  }
  next();
};

app.post('/api/v1/cron/circulation', verifyCronSecret, async (req, res) => {
  try {
    const stats = await circulationSchedulerService.runMaintenance();
    res.json({ success: true, timestamp: new Date().toISOString(), stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Circulation maintenance failed' });
  }
});

app.post('/api/v1/cron/articles', verifyCronSecret, async (req, res) => {
  try {
    const publishedCount = await articleSchedulerService.processScheduledArticles();
    res.json({ success: true, timestamp: new Date().toISOString(), publishedCount });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Article publish processing failed' });
  }
});

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

// Public Landing Page configuration & featured event
app.get('/api/v1/landing/config', (req, res, next) =>
  adminController.getPublicLandingConfig(req, res, next)
);

// 1. Lightweight Liveness check (0 DB queries - Safe for Render Health Checks & external uptime pingers without waking Neon)
const livenessHandler = (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'perpusjal-api',
    check: 'liveness',
    timestamp: new Date().toISOString(),
  });
};

// 2. Readiness check (Verifies active connection to Neon PostgreSQL on demand)
const readinessHandler = async (_req: express.Request, res: express.Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      service: 'perpusjal-api',
      check: 'readiness',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      service: 'perpusjal-api',
      check: 'readiness',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
};

// Explicit liveness endpoints (0 DB queries)
app.get('/health/live', healthLimiter, livenessHandler);
app.get('/api/health/live', healthLimiter, livenessHandler);
app.get('/api/v1/health/live', healthLimiter, livenessHandler);

// Explicit readiness endpoints (Deep DB verification)
app.get('/health/ready', healthLimiter, readinessHandler);
app.get('/api/health/ready', healthLimiter, readinessHandler);
app.get('/api/v1/health/ready', healthLimiter, readinessHandler);

// Standard /health endpoints: Defaults to liveness to protect Neon compute hours from uptime pings,
// unless explicit ?check=db or ?check=ready query is provided
app.get(['/health', '/api/health', '/api/v1/health'], healthLimiter, (req, res, next) => {
  if (req.query.check === 'db' || req.query.check === 'ready') {
    return readinessHandler(req, res);
  }
  return livenessHandler(req, res);
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
  const server = app.listen(PORT, () => {
    console.log(`📖 Perpusjal API v3 running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);

    // Start background circulation maintenance scheduler (hourly checks)
    circulationSchedulerService.startScheduler();

    // Start article publish scheduler (every 5 minutes — auto-publish SCHEDULED articles)
    articleSchedulerService.startScheduler();
  });

  // Global Process Error Handlers
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('💥 [Server Process] Unhandled Rejection at:', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('💥 [Server Process] Uncaught Exception thrown:', error);
  });

  // Graceful Shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 [Server Process] Menerima sinyal ${signal}. Menutup server secara aman...`);
    try {
      circulationSchedulerService.stopScheduler();
      articleSchedulerService.stopScheduler();
      server.close(async () => {
        console.log('🔒 Server HTTP ditutup.');
        await prisma.$disconnect();
        console.log('✅ Koneksi database Prisma terputus secara bersih.');
        process.exit(0);
      });
    } catch (err) {
      console.error('⚠️ Gagal memutus koneksi secara bersih:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
