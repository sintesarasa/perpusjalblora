import { Request, Response, NextFunction } from 'express';
import {
  articleQuerySchema,
  articleDraftSchema,
  articleUpdateSchema,
  articleApproveSchema,
  articleRequestRevisionSchema,
  articleRejectSchema,
  articleFeatureSchema,
  articleAdminQuerySchema,
  ArticleStatus,
} from '@perpusjal/types';
import { articlesService } from './articles.service.js';

export class ArticlesController {
  // Public handlers
  async getArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const query = articleQuerySchema.parse(req.query);
      const result = await articlesService.getArticles(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getArticleBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const previewToken = req.query.preview as string | undefined;
      const article = await articlesService.getArticleBySlug(slug, {
        user: req.user,
        previewToken,
      });
      res.status(200).json({ data: article });
    } catch (error) {
      next(error);
    }
  }

  async getRelatedArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const articles = await articlesService.getRelatedArticles(slug);
      res.status(200).json({ data: articles });
    } catch (error) {
      next(error);
    }
  }

  async recordView(req: Request, res: Response, next: NextFunction) {
    try {
      const articleId = req.params.id as string;
      const { secondsSpent, scrollDepth, anonId } = req.body || {};
      await articlesService.recordView(articleId, {
        userId: req.user?.userId,
        anonId,
        secondsSpent: typeof secondsSpent === 'number' ? secondsSpent : undefined,
        scrollDepth: typeof scrollDepth === 'number' ? scrollDepth : undefined,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await articlesService.getCategories();
      res.status(200).json({ data: categories });
    } catch (error) {
      next(error);
    }
  }

  // Author handlers
  async getMyArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const status = req.query.status as ArticleStatus | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const perPage = req.query.perPage ? parseInt(req.query.perPage as string, 10) : 15;
      const result = await articlesService.getMyArticles(userId, { status, page, perPage });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validated = articleDraftSchema.parse(req.body);
      const article = await articlesService.createArticle(userId, validated);
      res.status(201).json({ data: article });
    } catch (error) {
      next(error);
    }
  }

  async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const articleId = req.params.id as string;
      const validated = articleUpdateSchema.parse(req.body);
      const article = await articlesService.updateArticle(articleId, userId, userRole, validated);
      res.status(200).json({ data: article });
    } catch (error) {
      next(error);
    }
  }

  async deleteArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const articleId = req.params.id as string;
      const result = await articlesService.deleteArticle(articleId, userId, userRole);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async submitArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const articleId = req.params.id as string;
      const article = await articlesService.submitArticle(articleId, userId);
      res.status(200).json({ data: article });
    } catch (error) {
      next(error);
    }
  }

  async withdrawArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const articleId = req.params.id as string;
      const article = await articlesService.withdrawArticle(articleId, userId);
      res.status(200).json({ data: article });
    } catch (error) {
      next(error);
    }
  }

  // Curator / Admin handlers
  async getAdminArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const query = articleAdminQuerySchema.parse(req.query);
      const result = await articlesService.getAdminArticles(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async lockArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const curatorId = req.user!.userId;
      const articleId = req.params.id as string;
      const result = await articlesService.lockArticleForReview(articleId, curatorId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async unlockArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const curatorId = req.user!.userId;
      const articleId = req.params.id as string;
      const result = await articlesService.unlockArticleReview(articleId, curatorId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async approveArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const curatorId = req.user!.userId;
      const articleId = req.params.id as string;
      const validated = articleApproveSchema.parse(req.body);
      const result = await articlesService.approveArticle(articleId, curatorId, validated);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async requestRevision(req: Request, res: Response, next: NextFunction) {
    try {
      const curatorId = req.user!.userId;
      const articleId = req.params.id as string;
      const validated = articleRequestRevisionSchema.parse(req.body);
      const result = await articlesService.requestRevision(articleId, curatorId, validated);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async rejectArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const curatorId = req.user!.userId;
      const articleId = req.params.id as string;
      const validated = articleRejectSchema.parse(req.body);
      const result = await articlesService.rejectArticle(articleId, curatorId, validated);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const curatorId = req.user!.userId;
      const articleId = req.params.id as string;
      const validated = articleFeatureSchema.parse(req.body);
      const article = await articlesService.toggleFeatured(articleId, curatorId, validated.isFeatured);
      res.status(200).json({ data: article });
    } catch (error) {
      next(error);
    }
  }
}

export const articlesController = new ArticlesController();
