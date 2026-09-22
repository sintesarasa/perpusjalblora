import { Request, Response, NextFunction } from 'express';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@perpusjal/types';
import { authService } from './auth.service.js';

const COOKIE_NAME = 'perpusjal_session';

function getCookieOptions(expiresAt?: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(expiresAt ? { expires: expiresAt } : {}),
  };
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const meta = {
        userAgent: req.headers['user-agent'],
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      };

      const result = await authService.login(validated, meta);

      // Set HTTP-only session cookie
      res.cookie(COOKIE_NAME, result.sessionToken, getCookieOptions(new Date(result.expiresAt)));

      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = verifyEmailSchema.parse(req.body);
      const meta = {
        userAgent: req.headers['user-agent'],
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      };

      const result = await authService.verifyEmail(validated.token, meta);

      // Automatically set session cookie upon successful verification
      res.cookie(COOKIE_NAME, result.sessionToken, getCookieOptions(new Date(result.expiresAt)));

      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await authService.resendVerification(userId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(validated.email);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(validated);

      // Clear cookie just in case
      res.clearCookie(COOKIE_NAME, getCookieOptions());

      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user?.sessionId);
      res.clearCookie(COOKIE_NAME, getCookieOptions());
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await authService.getMe(userId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await authService.getSessions(userId, req.user?.sessionId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const sessionId = req.params.id as string;
      const result = await authService.revokeSession(userId, sessionId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
