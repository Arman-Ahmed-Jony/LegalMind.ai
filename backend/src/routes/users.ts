import { Router } from 'express';

import { requireAdmin, requireAuth } from '../middleware/auth';
import { createUser, deleteUser, listUsers, updateUser } from '../services/users';
import { createUserBody, parseBody, updateUserBody } from '../validation';

export const usersRouter = Router();

usersRouter.get('/users', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    res.json({ users: await listUsers() });
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/users', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = parseBody(createUserBody, req.body);
    const user = await createUser(body);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch('/users/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = parseBody(updateUserBody, req.body);
    const user = await updateUser(req.params.id, body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

usersRouter.delete('/users/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await deleteUser(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
