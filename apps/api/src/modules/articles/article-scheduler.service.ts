import { prisma } from '../../lib/prisma.js';
import { ArticleStatus } from '@perpusjal/types';
import { notificationsService } from '../notifications/notifications.service.js';

export class ArticleSchedulerService {
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Process SCHEDULED articles whose scheduledAt timestamp has passed.
   * Changes status to PUBLISHED and sets publishedAt.
   * Sends notification to the article's author.
   */
  async processScheduledArticles(): Promise<number> {
    const now = new Date();

    const scheduledArticles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.SCHEDULED as unknown as any,
        scheduledAt: { lte: now },
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        authorId: true,
        scheduledAt: true,
      },
    });

    if (scheduledArticles.length === 0) return 0;

    let publishedCount = 0;

    for (const article of scheduledArticles) {
      try {
        await prisma.article.update({
          where: { id: article.id },
          data: {
            status: ArticleStatus.PUBLISHED as unknown as any,
            publishedAt: article.scheduledAt || now,
            scheduledAt: null,
          },
        });

        // Notify author
        try {
          await notificationsService.createNotification(article.authorId, {
            type: 'ARTICLE_APPROVED',
            title: 'Naskahmu Kini Sudah Terbit!',
            body: `Naskah "${article.title}" yang dijadwalkan kini telah terbit dan dapat dibaca publik di Perpusjal Blora.`,
            actionUrl: `/artikel/${article.slug}`,
            entityType: 'ARTICLE',
            entityId: article.id,
          });
        } catch (notifErr) {
          console.error(`[ArticleScheduler] Failed to send publish notification for article ${article.id}:`, notifErr);
        }

        publishedCount++;
        console.log(`[ArticleScheduler] Published scheduled article: "${article.title}" (${article.id})`);
      } catch (err) {
        console.error(`[ArticleScheduler] Failed to publish article ${article.id}:`, err);
      }
    }

    return publishedCount;
  }

  /**
   * Start the background scheduler (every 5 minutes)
   */
  startScheduler(): void {
    if (this.schedulerInterval) return; // Already running

    console.log('[ArticleScheduler] ⏰ Article publish scheduler started (5-minute interval)');

    // Run once immediately on startup
    this.processScheduledArticles().catch((err) =>
      console.error('[ArticleScheduler] Initial run error:', err)
    );

    // Then run every 5 minutes
    this.schedulerInterval = setInterval(() => {
      this.processScheduledArticles().catch((err) =>
        console.error('[ArticleScheduler] Scheduled run error:', err)
      );
    }, 5 * 60 * 1000);
  }

  stopScheduler(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
      console.log('[ArticleScheduler] Scheduler stopped.');
    }
  }
}

export const articleSchedulerService = new ArticleSchedulerService();
