import { Request, Response, NextFunction } from 'express';
import {
  letterQuerySchema,
  letterCreateSchema,
  letterApproveSchema,
  letterRejectSchema,
} from '@perpusjal/types';
import { lettersService } from './letters.service.js';

export class LettersController {
  async getLetters(req: Request, res: Response, next: NextFunction) {
    try {
      const query = letterQuerySchema.parse(req.query);
      const result = await lettersService.getLetters(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getLetterBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const result = await lettersService.getLetterBySlug(slug, req.user);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async createLetter(req: Request, res: Response, next: NextFunction) {
    try {
      const input = letterCreateSchema.parse(req.body);
      const result = await lettersService.createLetter(input, req.user!);
      res.status(201).json({ data: result.letter, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async getMyLetters(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await lettersService.getMyLetters(req.user!);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async getModerationLetters(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await lettersService.getModerationLetters();
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async approveLetter(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = letterApproveSchema.parse(req.body || {});
      const result = await lettersService.approveLetter(id, input, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async rejectLetter(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { reason } = letterRejectSchema.parse(req.body);
      const result = await lettersService.rejectLetter(id, reason, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const lettersController = new LettersController();
