import { Request, Response, NextFunction } from 'express';
import { searchQuerySchema } from '@perpusjal/types';
import { searchService } from './search.service.js';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = searchQuerySchema.parse(req.query);
      const result = await searchService.search(query);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async suggest(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || '';
      const result = await searchService.suggest(q);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
