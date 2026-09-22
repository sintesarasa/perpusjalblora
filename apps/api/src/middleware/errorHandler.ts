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
  const statusCode = err.statusCode || (err instanceof ZodError ? 400 : 500);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Payload tidak valid.',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

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
