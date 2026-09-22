import { Router, Request, Response, NextFunction } from 'express';
import { pagesService } from './pages.service.js';

const router = Router();

router.get('/nav', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pages = await pagesService.getNavPages();
    res.status(200).json({ data: pages });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const page = await pagesService.getPageBySlug(slug);
    res.status(200).json({ data: page });
  } catch (error) {
    next(error);
  }
});

export const pagesRoutes = router;
