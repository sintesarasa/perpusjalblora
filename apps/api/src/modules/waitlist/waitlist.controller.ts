import { Request, Response, NextFunction } from 'express';
import { joinWaitlistSchema, allocateWaitlistSchema } from '@perpusjal/types';
import { waitlistService } from './waitlist.service.js';

export class WaitlistController {
  async joinWaitlist(req: Request, res: Response, next: NextFunction) {
    try {
      const input = joinWaitlistSchema.parse(req.body);
      const result = await waitlistService.joinWaitlist(input, req.user!);
      res.status(201).json({
        data: result,
        message: 'Berhasil mendaftar ke antrean pembaca buku.',
      });
    } catch (error) {
      next(error);
    }
  }

  async leaveWaitlist(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await waitlistService.leaveWaitlist(id, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyWaitlists(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await waitlistService.getMyWaitlists(req.user!);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async getBookWaitlists(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = req.params.bookId as string;
      const result = await waitlistService.getBookWaitlists(bookId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async allocateWaitlist(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = allocateWaitlistSchema.parse(req.body || {});
      const result = await waitlistService.allocateWaitlistToLoan(id, input, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTopRecommendation(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = req.params.bookId as string;
      const result = await waitlistService.getTopWaitlistRecommendation(bookId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const waitlistController = new WaitlistController();
