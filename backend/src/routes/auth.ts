import { Router } from 'express';

import { requireAuth } from '../middleware/auth';
import {
  authCookieName,
  authCookieOptions,
  login,
} from '../services/auth';
import { parseBody, loginBody } from '../validation';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = parseBody(loginBody, req.body);
    const result = await login(body.username, body.password);

    res.cookie(authCookieName, result.token, authCookieOptions(7 * 24 * 60 * 60 * 1000));
    res.json({ user: result.user });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(authCookieName, authCookieOptions());
  res.status(204).send();
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
