import { Router } from 'express';
import { searchController } from './search.controller.js';

const router = Router();

// Public search endpoints
router.get('/', (req, res, next) => searchController.search(req, res, next));
router.get('/suggest', (req, res, next) => searchController.suggest(req, res, next));

export const searchRoutes = router;
