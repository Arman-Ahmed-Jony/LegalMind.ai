import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../httpError';
import { authCookieName, findUserById, readUserId, toPublicUser } from '../services/auth';

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[authCookieName];

  if (typeof token !== 'string' || token.length === 0) {
    next(new HttpError(401, 'Sign in required.'));
    return;
  }

  try {
    const user = await findUserById(readUserId(token));

    if (!user) {
      next(new HttpError(401, 'Sign in required.'));
      return;
    }

    req.user = toPublicUser(user);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== 'admin') {
    next(new HttpError(403, 'Admin access required.'));
    return;
  }

  next();
}
