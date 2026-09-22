import { Request, Response, NextFunction } from 'express';
import {
  commentQuerySchema,
  commentCreateSchema,
  commentUpdateSchema,
  commentReportSchema,
  CommentStatus,
} from '@perpusjal/types';
import { commentsService } from './comments.service.js';

export class CommentsController {
  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const query = commentQuerySchema.parse(req.query);
      const result = await commentsService.getComments(query, req.user);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const input = commentCreateSchema.parse(req.body);
      const result = await commentsService.createComment(input, req.user!);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = commentUpdateSchema.parse(req.body);
      const result = await commentsService.updateComment(id, input, req.user!);
      res.status(200).json({ data: result, message: 'Komentar berhasil diperbarui.' });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await commentsService.deleteComment(id, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async reportComment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = commentReportSchema.parse(req.body);
      const result = await commentsService.reportComment(id, input, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getModerationQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as CommentStatus | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const perPage = req.query.perPage ? parseInt(req.query.perPage as string, 10) : 20;

      const result = await commentsService.getModerationQueue({ status, page, perPage });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async moderateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const action = req.body.action as 'approve' | 'hide' | 'delete';
      const result = await commentsService.moderateComment(id, action, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const commentsController = new CommentsController();
