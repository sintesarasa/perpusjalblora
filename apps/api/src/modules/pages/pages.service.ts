import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/errors.js';

export class PagesService {
  async getPageBySlug(slug: string) {
    const page = await prisma.page.findFirst({
      where: {
        slug,
        isPublished: true,
      },
    });

    if (!page) {
      throw HttpError.notFound('Halaman tidak ditemukan.');
    }

    return page;
  }

  async getNavPages() {
    return prisma.page.findMany({
      where: {
        isPublished: true,
        OR: [{ showInNav: true }, { showInFooter: true }],
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        showInNav: true,
        showInFooter: true,
      },
    });
  }
}

export const pagesService = new PagesService();
