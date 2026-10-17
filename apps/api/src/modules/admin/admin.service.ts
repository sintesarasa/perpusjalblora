import { prisma } from '../../lib/prisma.js';
import {
  AdminDashboardStats,
  AdminAuditLogItem,
  LandingSettings,
  DEFAULT_LANDING_SETTINGS,
  LandingPublicConfigResponse,
  LandingFeaturedEventData,
  LandingFeaturedArticleItem,
} from '@perpusjal/types';

export class AdminService {
  async getDashboardKPIs(): Promise<AdminDashboardStats> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      usersThisWeek,
      totalArticles,
      pendingArticles,
      totalBooks,
      availableCopies,
      pendingLoans,
      activeLoans,
      overdueLoans,
      readyPickupToday,
      upcomingEvents,
      pendingComments,
      pendingLetters,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null } }),
      prisma.article.count({ where: { deletedAt: null } }),
      prisma.article.count({ where: { status: 'PENDING_REVIEW' as any, deletedAt: null } }),
      prisma.book.count(),
      prisma.bookCopy.count({ where: { status: 'AVAILABLE' as any } }),
      prisma.loan.count({ where: { status: 'PENDING' as any } }),
      prisma.loan.count({ where: { status: 'BORROWED' as any } }),
      prisma.loan.count({
        where: {
          OR: [
            { status: 'OVERDUE' as any },
            { status: 'BORROWED' as any, dueDate: { lt: now } },
          ],
        },
      }),
      prisma.loan.count({ where: { status: 'APPROVED' as any } }),
      prisma.event.count({
        where: {
          startAt: { gte: now },
          status: { in: ['PUBLISHED', 'OPEN'] as any[] },
        },
      }),
      prisma.comment.count({ where: { status: 'PENDING' as any } }),
      prisma.readerLetter.count({ where: { status: 'PENDING' as any } }),
    ]);

    return {
      totalUsers,
      usersThisWeek,
      totalArticles,
      pendingArticles,
      totalBooks,
      availableCopies,
      pendingLoans,
      activeLoans,
      overdueLoans,
      readyPickupToday,
      upcomingEvents,
      pendingComments,
      pendingLetters,
    };
  }

  async getAuditLogs(query: {
    page?: number;
    limit?: number;
    entityType?: string;
    actorId?: string;
  }): Promise<{ items: AdminAuditLogItem[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.entityType) where.entityType = query.entityType;
    if (query.actorId) where.actorId = query.actorId;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, name: true, username: true },
          },
        },
      }),
    ]);

    const items: AdminAuditLogItem[] = logs.map((l) => ({
      id: l.id,
      actorId: l.actorId,
      actorName: l.actor ? l.actor.name : null,
      actorUsername: l.actor ? l.actor.username : null,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      before: l.before,
      after: l.after,
      createdAt: l.createdAt.toISOString(),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getLandingSettings(): Promise<LandingSettings> {
    const setting = await prisma.setting.findUnique({
      where: { key: 'LANDING_PAGE_CONFIG' },
    });
    if (!setting || !setting.value) {
      return DEFAULT_LANDING_SETTINGS;
    }
    return {
      ...DEFAULT_LANDING_SETTINGS,
      ...(setting.value as any),
    };
  }

  async updateLandingSettings(userId: string, input: LandingSettings): Promise<LandingSettings> {
    const updated = await prisma.setting.upsert({
      where: { key: 'LANDING_PAGE_CONFIG' },
      update: {
        value: input as any,
        updatedById: userId,
      },
      create: {
        key: 'LANDING_PAGE_CONFIG',
        value: input as any,
        description: 'Konfigurasi etalase dan promosi beranda utama Perpusjal Blora',
        updatedById: userId,
      },
    });
    return updated.value as any;
  }

  async getPublicLandingConfig(): Promise<LandingPublicConfigResponse> {
    const settings = await this.getLandingSettings();
    let featuredEventData: LandingFeaturedEventData | null = null;

    if (settings.featuredEvent?.isActive && settings.featuredEvent.eventId) {
      try {
        const ev = await prisma.event.findUnique({
          where: { id: settings.featuredEvent.eventId },
          include: {
            _count: {
              select: {
                registrations: { where: { status: 'REGISTERED' as any } },
              },
            },
          },
        });

        if (ev && ev.status !== ('DRAFT' as any) && ev.status !== ('CANCELLED' as any)) {
          let descPlain = '';
          if (ev.description) {
            if (typeof ev.description === 'string') descPlain = ev.description;
            else if (typeof ev.description === 'object') {
              descPlain = (ev.description as any).summary || (ev.description as any).text || '';
              if (!descPlain) {
                try {
                  descPlain = JSON.stringify(ev.description);
                } catch {
                  descPlain = '';
                }
              }
            }
          }

          featuredEventData = {
            id: ev.id,
            title: ev.title,
            slug: ev.slug,
            type: ev.type,
            descriptionPlain: descPlain.slice(0, 320),
            coverImage: ev.coverImage,
            startAt: ev.startAt.toISOString(),
            endAt: ev.endAt.toISOString(),
            locationName: ev.locationName,
            locationDetail: ev.locationDetail,
            quota: ev.quota,
            registeredCount: ev._count.registrations,
            status: ev.status,
          };
        }
      } catch (err) {
        console.error('Error fetching featured event for landing:', err);
      }
    }

    let featuredArticlesData: LandingPublicConfigResponse['featuredArticlesData'] = null;
    const headlineId = settings.featuredArticles?.headlineArticleId;
    const sideIds = settings.featuredArticles?.sideArticleIds || [];
    const idsToFetch = [headlineId, ...sideIds].filter(Boolean) as string[];

    if (idsToFetch.length > 0) {
      try {
        const fetchedArticles = await prisma.article.findMany({
          where: {
            id: { in: idsToFetch },
            status: 'PUBLISHED' as any,
            deletedAt: null,
          },
          include: {
            author: { select: { name: true, username: true } },
            category: { select: { name: true, slug: true } },
          },
        });

        const mapArticle = (art: any): LandingFeaturedArticleItem => ({
          id: art.id,
          slug: art.slug,
          title: art.title,
          excerpt: art.excerpt,
          readingTime: art.readingTime || 3,
          authorName: art.author?.name || 'Warga Blora',
          authorUsername: art.author?.username || 'warga',
          categoryName: art.category?.name || 'Suara Lapak',
          categorySlug: art.category?.slug || 'suara-lapak',
          publishedAt: art.publishedAt?.toISOString() || new Date().toISOString(),
          isFeatured: art.isFeatured || false,
        });

        const headlineRaw = headlineId ? fetchedArticles.find((a) => a.id === headlineId) : null;
        const sideRaw = sideIds.map((id) => fetchedArticles.find((a) => a.id === id)).filter(Boolean);

        featuredArticlesData = {
          headlineArticle: headlineRaw ? mapArticle(headlineRaw) : null,
          sideArticles: sideRaw.map(mapArticle),
        };
      } catch (err) {
        console.error('Error fetching featured articles for landing:', err);
      }
    }

    return {
      settings,
      featuredEventData,
      featuredArticlesData,
    };
  }
}

export const adminService = new AdminService();
