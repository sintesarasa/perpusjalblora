import { Request, Response, NextFunction } from 'express';
import {
  loanRequestSchema,
  loanApproveSchema,
  loanRejectSchema,
  loanPickupSchema,
  loanReturnSchema,
  loanQuerySchema,
} from '@perpusjal/types';
import { loansService } from './loans.service.js';

export class LoansController {
  async requestLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loanRequestSchema.parse(req.body);
      const result = await loansService.requestLoan(input, req.user!);
      res.status(201).json({
        data: result,
        message: 'Pengajuan terkirim. Tunggu persetujuan pengurus ya.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyLoans(req: Request, res: Response, next: NextFunction) {
    try {
      const statusFilter = (req.query.status as 'aktif' | 'riwayat') || 'aktif';
      const result = await loansService.getMyLoans(req.user!, statusFilter);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async cancelLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await loansService.cancelLoan(id, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async extendLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await loansService.extendLoan(id, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAdminLoans(req: Request, res: Response, next: NextFunction) {
    try {
      const query = loanQuerySchema.parse(req.query);
      const result = await loansService.getAdminLoans(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async approveLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = loanApproveSchema.parse(req.body || {});
      const result = await loansService.approveLoan(id, input, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async rejectLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { reason } = loanRejectSchema.parse(req.body);
      const result = await loansService.rejectLoan(id, reason, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async pickupLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loanPickupSchema.parse(req.body);
      const result = await loansService.pickupLoan(input, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async returnLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = loanReturnSchema.parse(req.body);
      const result = await loansService.returnLoan(id, input, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPickupBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await loansService.getPickupBoard();
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async lookupLoanByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const code = (req.query.code as string) || '';
      const result = await loansService.lookupLoanByCode(code);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const loansController = new LoansController();
