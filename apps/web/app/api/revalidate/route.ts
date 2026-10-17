import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secretHeader = req.headers.get('x-revalidate-secret');
    const secret = secretHeader || (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null);

    const expectedSecret =
      process.env.REVALIDATE_SECRET ||
      process.env.INTERNAL_API_TOKEN ||
      process.env.JWT_SECRET;

    if (!secret || !expectedSecret || secret !== expectedSecret) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token revalidasi tidak valid atau tidak disertakan.',
          },
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { paths = [], tags = [] } = body as {
      paths?: string[];
      tags?: string[];
    };

    const revalidatedTags: string[] = [];
    const revalidatedPaths: string[] = [];

    for (const tag of tags) {
      if (typeof tag === 'string' && tag.trim()) {
        const clean = tag.trim();
        revalidateTag(clean);
        revalidatedTags.push(clean);
      }
    }

    for (const path of paths) {
      if (typeof path === 'string' && path.trim()) {
        const clean = path.trim();
        revalidatePath(clean);
        revalidatedPaths.push(clean);
      }
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      timestamp: new Date().toISOString(),
      revalidatedTags,
      revalidatedPaths,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Gagal memproses revalidasi cache.';
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message,
        },
      },
      { status: 500 }
    );
  }
}
