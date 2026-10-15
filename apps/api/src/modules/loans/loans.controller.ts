import { Request, Response, NextFunction } from 'express';
import {
  loanRequestSchema,
  loanApproveSchema,
  loanRejectSchema,
  loanPickupSchema,
  loanReturnSchema,
  loanQuerySchema,
  walkInLoanSchema,
} from '@perpusjal/types';
import { loansService } from './loans.service.js';
import { circulationSchedulerService } from './circulation-scheduler.service.js';

export class LoansController {
  async createWalkInLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const input = walkInLoanSchema.parse(req.body);
      const result = await loansService.createWalkInLoan(input, req.user!);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

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

  async approveAndPickup(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { bookCopyId } = req.body || {};
      const result = await loansService.approveAndPickup(id, { bookCopyId }, req.user!);
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

  async runMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await circulationSchedulerService.runMaintenance();
      res.status(200).json({
        message: 'Pemeliharaan sirkulasi berhasil dijalankan.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCirculationReport(req: Request, res: Response, next: NextFunction) {
    try {
      const period = typeof req.query.period === 'string' ? req.query.period : undefined;
      const result = await loansService.getCirculationReport(period);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async exportCirculationReportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await loansService.exportCirculationReportCsv();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="laporan-sirkulasi-perpusjal-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }

  async exportBooksInventoryCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await loansService.exportBooksInventoryCsv();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="inventaris-buku-perpusjal-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}

export const loansController = new LoansController();
