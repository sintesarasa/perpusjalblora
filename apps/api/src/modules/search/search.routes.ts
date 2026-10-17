import { Router } from 'express';
import { searchController } from './search.controller.js';
import { searchRateLimiter } from '../../middleware/rate-limit.js';

const router = Router();

// Public search endpoints protected by rate limiting
router.get('/', searchRateLimiter, (req, res, next) => searchController.search(req, res, next));
router.get('/suggest', searchRateLimiter, (req, res, next) => searchController.suggest(req, res, next));

export const searchRoutes = router;
