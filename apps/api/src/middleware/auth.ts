import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role, UserStatus, UserSessionPayload } from '@perpusjal/types';

declare global {
  namespace Express {
    interface Request {
      user?: UserSessionPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production-min-32-chars';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. Check HTTP-only cookie first, then Bearer token
  const token = req.cookies?.perpusjal_session || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSessionPayload;
    req.user = decoded;
  } catch (err) {
    // Invalid/expired token: clear user and continue
    req.user = undefined;
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Kamu perlu masuk untuk mengakses halaman ini.',
      },
    });
  }
  next();
}

export function requireVerified(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Kamu perlu masuk terlebih dahulu.',
      },
    });
  }

  if (req.user.status === UserStatus.PENDING_VERIFICATION) {
    return res.status(422).json({
      error: {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Verifikasi emailmu terlebih dahulu untuk melanjutkan.',
      },
    });
  }

  next();
}

const roleWeights: Record<Role, number> = {
  [Role.USER]: 1,
  [Role.KURATOR]: 2,
  [Role.ADMIN]: 3,
};

export function requireRole(minimumRole: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Kamu perlu masuk terlebih dahulu.',
        },
      });
    }

    const userWeight = roleWeights[req.user.role] || 0;
    const requiredWeight = roleWeights[minimumRole];

    if (userWeight < requiredWeight) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Kamu tidak memiliki wewenang untuk aksi ini.',
        },
      });
    }

    next();
  };
}
