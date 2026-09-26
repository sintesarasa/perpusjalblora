import { prisma } from '../../lib/prisma.js';
import { LoanStatus, BookCopyStatus } from '@perpusjal/types';
import { notificationsService } from '../notifications/notifications.service.js';

export class CirculationSchedulerService {
  /**
   * 1. Expire uncollected loans past pickup deadline (APPROVED -> EXPIRED)
   * Restores book copy and book available copies count
   */
  async expireUncollectedLoans(): Promise<number> {
    const now = new Date();
    const expiredLoans = await prisma.loan.findMany({
      where: {
        status: LoanStatus.APPROVED as unknown as any,
        pickupDeadline: { lt: now },
      },
      include: {
        book: { select: { id: true, title: true } },
      },
    });

    let count = 0;
    for (const loan of expiredLoans) {
      await prisma.$transaction(async (tx) => {
        // Restore book copy and availability
        await tx.book.update({
          where: { id: loan.bookId },
          data: { availableCopies: { increment: 1 } },
        });

        if (loan.bookCopyId) {
          await tx.bookCopy.update({
            where: { id: loan.bookCopyId },
            data: { status: BookCopyStatus.AVAILABLE as unknown as any },
          });
        }

        await tx.loan.update({
          where: { id: loan.id },
          data: { status: LoanStatus.EXPIRED as unknown as any },
        });
      });

      // Send in-app notification
      try {
        const deadlineStr = loan.pickupDeadline
          ? new Date(loan.pickupDeadline).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'tanggal batas jemput';

        await notificationsService.createNotification(loan.userId, {
          type: 'LOAN_EXPIRED',
          title: 'Peminjaman Buku Kedaluwarsa',
          body: `Buku "${loan.book.title}" tidak diambil melewati batas waktu penjemputan (${deadlineStr}). Pengajuan dibatalkan dan buku dikembalikan ke rak ketersediaan umum.`,
          actionUrl: '/dashboard/pinjaman',
          entityType: 'loan',
          entityId: loan.id,
        });
      } catch {
        // Ignored
      }

      count++;
    }

    return count;
  }

  /**
   * 2. Mark active loans past due date as OVERDUE (BORROWED -> OVERDUE)
   */
  async markOverdueLoans(): Promise<number> {
    const now = new Date();
    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: LoanStatus.BORROWED as unknown as any,
        dueDate: { lt: now },
      },
      include: {
        book: { select: { id: true, title: true } },
      },
    });

    let count = 0;
    for (const loan of overdueLoans) {
      await prisma.loan.update({
        where: { id: loan.id },
        data: { status: LoanStatus.OVERDUE as unknown as any },
      });

      // Send in-app notification
      try {
        const dueStr = loan.dueDate
          ? new Date(loan.dueDate).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'tenggat waktu';

        await notificationsService.createNotification(loan.userId, {
          type: 'LOAN_OVERDUE',
          title: 'Buku Melewati Tenggat Pengembalian!',
          body: `Masa pinjam buku "${loan.book.title}" telah jatuh tempo pada ${dueStr}. Mohon segera kembalikan buku ini pada lapak baca Perpusjal terdekat demi kenyamanan pembaca lain.`,
          actionUrl: '/dashboard/pinjaman',
          entityType: 'loan',
          entityId: loan.id,
        });
      } catch {
        // Ignored
      }

      count++;
    }

    return count;
  }

  /**
   * 3. Send due-soon reminder notifications (~24h before due date)
   * Uses a 1-hour sliding window so each loan receives exactly one reminder
   * per scheduler cycle without needing a schema field.
   */
  async sendDueSoonReminders(): Promise<number> {
    const now = new Date();
    // Window: loans due between 23h and 24h from now (1-hour slot = 1 reminder per loan)
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const loans = await prisma.loan.findMany({
      where: {
        status: LoanStatus.BORROWED as unknown as any,
        dueDate: { gte: windowStart, lte: windowEnd },
      },
      include: { book: { select: { id: true, title: true } } },
    });

    let count = 0;
    for (const loan of loans) {
      try {
        const dueStr = loan.dueDate
          ? loan.dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'besok';

        await notificationsService.createNotification(loan.userId, {
          type: 'LOAN_DUE_SOON',
          title: '⏰ Pengingat: Buku Hampir Jatuh Tempo',
          body: `Buku "${loan.book.title}" akan jatuh tempo pada ${dueStr}. Segera kembalikan atau perpanjang pinjaman sebelum melewati batas waktu.`,
          actionUrl: '/dashboard/pinjaman',
          entityType: 'loan',
          entityId: loan.id,
        });
        count++;
      } catch {
        // Ignored — non-critical
      }
    }

    return count;
  }

  /**
   * Run full circulation maintenance job
   */
  async runMaintenance(): Promise<{ expiredCount: number; overdueCount: number; reminderCount: number }> {
    const expiredCount = await this.expireUncollectedLoans();
    const overdueCount = await this.markOverdueLoans();
    const reminderCount = await this.sendDueSoonReminders();
    return { expiredCount, overdueCount, reminderCount };
  }

  /**
   * Start recurring background loop (e.g. every 1 hour)
   */
  startScheduler(intervalMs: number = 60 * 60 * 1000) {
    // Run initial maintenance on boot (after 10s delay to allow DB ready)
    setTimeout(() => {
      this.runMaintenance()
        .then((res) => {
          if (res.expiredCount > 0 || res.overdueCount > 0 || res.reminderCount > 0) {
            console.log(
              `⚡ [CirculationScheduler] Pemeliharaan awal selesai: ${res.expiredCount} kedaluwarsa, ${res.overdueCount} terlambat, ${res.reminderCount} pengingat terkirim.`
            );
          }
        })
        .catch((err) => {
          console.error('⚠️ [CirculationScheduler] Pemeliharaan awal gagal:', err?.message || err);
        });
    }, 10000);

    // Schedule regular hourly checks
    const timer = setInterval(() => {
      this.runMaintenance()
        .then((res) => {
          if (res.expiredCount > 0 || res.overdueCount > 0 || res.reminderCount > 0) {
            console.log(
              `⚡ [CirculationScheduler] Pemeliharaan rutin: ${res.expiredCount} kedaluwarsa, ${res.overdueCount} terlambat, ${res.reminderCount} pengingat terkirim.`
            );
          }
        })
        .catch((err) => {
          console.error('⚠️ [CirculationScheduler] Pemeliharaan berkala gagal:', err?.message || err);
        });
    }, intervalMs);

    return timer;
  }
}

export const circulationSchedulerService = new CirculationSchedulerService();
