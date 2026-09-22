import { z } from 'zod';
import { LoanStatus, ReturnCondition } from './enums.js';

export const loanRequestSchema = z.object({
  bookId: z.string().min(1, 'bookId wajib diisi.'),
  pickupPoint: z.string().min(2, 'Titik pengambilan wajib diisi.').max(60),
  pickupDatePlan: z.string().optional().nullable(),
  note: z.string().max(300, 'Catatan maksimal 300 karakter.').optional().nullable(),
});

export type LoanRequestInput = z.infer<typeof loanRequestSchema>;

export const loanApproveSchema = z.object({
  pickupDeadlineDays: z.number().int().min(1).max(14).default(3),
});

export type LoanApproveInput = z.infer<typeof loanApproveSchema>;

export const loanRejectSchema = z.object({
  reason: z.string().min(2, 'Alasan penolakan minimal 2 karakter.').max(300),
});

export type LoanRejectInput = z.infer<typeof loanRejectSchema>;

export const loanPickupSchema = z.object({
  pickupCode: z.string().length(6, 'Kode pengambilan harus 6 digit angka.'),
  bookCopyId: z.string().optional().nullable(),
});

export type LoanPickupInput = z.infer<typeof loanPickupSchema>;

export const loanReturnSchema = z.object({
  condition: z.nativeEnum(ReturnCondition).default(ReturnCondition.BAIK),
  note: z.string().max(500).optional().nullable(),
});

export type LoanReturnInput = z.infer<typeof loanReturnSchema>;

export const loanQuerySchema = z.object({
  status: z.nativeEnum(LoanStatus).optional(),
  q: z.string().optional(),
  overdueOnly: z
    .union([z.boolean(), z.string().transform((v) => v === 'true')])
    .optional(),
  sort: z.enum(['terbaru', 'jatuhTempo']).default('terbaru'),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(20),
});

export type LoanQueryInput = z.infer<typeof loanQuerySchema>;

export interface LoanItem {
  id: string;
  loanCode: string;
  status: LoanStatus;
  requestedAt: string;
  pickupPoint: string;
  pickupDatePlan?: string | null;
  userNote?: string | null;
  approvedAt?: string | null;
  pickupCode?: string | null;
  pickupDeadline?: string | null;
  borrowedAt?: string | null;
  dueDate?: string | null;
  extensionCount: number;
  returnedAt?: string | null;
  returnCondition?: ReturnCondition | null;
  rejectionReason?: string | null;
  book: {
    id: string;
    title: string;
    slug: string;
    author: string;
    coverImage: string | null;
  };
  bookCopy?: {
    id: string;
    inventoryCode: string;
  } | null;
  borrower?: {
    id: string;
    name: string;
    username: string;
    email?: string;
  };
  canCancel: boolean;
  canExtend: boolean;
  nextAction: string;
}

export interface LoanPickupBoardItem {
  id: string;
  loanCode: string;
  pickupCode: string | null;
  borrowerName: string;
  bookTitle: string;
  status: LoanStatus;
  pickupDeadline: string | null;
  dueDate: string | null;
  type: 'READY_FOR_PICKUP' | 'DUE_TODAY' | 'OVERDUE';
}
