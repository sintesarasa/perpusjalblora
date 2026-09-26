import { z } from 'zod';
import { WaitlistStatus } from './enums.js';

export const joinWaitlistSchema = z.object({
  bookId: z.string().min(1, 'ID buku wajib diisi.'),
});
export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;

export const allocateWaitlistSchema = z.object({
  pickupDeadlineDays: z.number().int().min(1).max(14).default(3),
});
export type AllocateWaitlistInput = z.infer<typeof allocateWaitlistSchema>;

export interface WaitlistItem {
  id: string;
  bookId: string;
  userId: string;
  position: number;
  status: WaitlistStatus;
  notifiedAt: string | null;
  priorityUntil: string | null;
  createdAt: string;
  book: {
    id: string;
    title: string;
    slug: string;
    author: string;
    coverImage: string | null;
    availableCopies: number;
  };
  user?: {
    id: string;
    name: string;
    username: string;
    email?: string;
  };
}
