import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const isZod =
    err instanceof ZodError ||
    err.name === 'ZodError' ||
    (Boolean(err && typeof err === 'object' && 'issues' in err && Array.isArray((err as any).issues)));

  if (isZod) {
    const issues = (err as any).issues || (err as any).errors || [];
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Isian formulir tidak valid.',
        details: issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
          message: e.message,
        })),
      },
    });
  }

  // Handle Prisma unique constraint violation (P2002)
  if ((err as any)?.code === 'P2002') {
    const target = Array.isArray((err as any)?.meta?.target)
      ? (err as any).meta.target.join(', ')
      : String((err as any)?.meta?.target || 'data');
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: `Terjadi duplikasi data unik pada ${target}. Silakan gunakan nilai lain atau periksa data yang sudah ada.`,
      },
    });
  }

  const statusCode = err.statusCode || 500;

  const response = {
    error: {
      code: err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
      message:
        statusCode >= 500
          ? 'Ada yang salah di sisi server. Coba lagi sebentar lagi.'
          : err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(err.details ? { details: err.details } : {}),
    },
  };

  if (statusCode >= 500) {
    console.error('💥 Server Error:', err);
  }

  return res.status(statusCode).json(response);
}
