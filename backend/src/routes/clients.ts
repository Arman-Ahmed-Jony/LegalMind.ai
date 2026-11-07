import { Router } from 'express';

import { requireAuth } from '../middleware/auth';
import { createCase } from '../services/cases';
import {
  createClient,
  deleteClient,
  getClient,
  listCasesForClient,
  listClients,
  updateClient,
} from '../services/clients';
import { caseBody, clientBody, parseBody } from '../validation';

export const clientsRouter = Router();

clientsRouter.use(requireAuth);

clientsRouter.get('/clients', async (_req, res, next) => {
  try {
    res.json({ clients: await listClients() });
  } catch (error) {
    next(error);
  }
});

clientsRouter.post('/clients', async (req, res, next) => {
  try {
    const body = parseBody(clientBody, req.body);
    const client = await createClient(body);
    res.status(201).json({ client });
  } catch (error) {
    next(error);
  }
});

clientsRouter.get('/clients/:id', async (req, res, next) => {
  try {
    const client = await getClient(req.params.id);
    const cases = await listCasesForClient(client.id);
    res.json({ client, cases });
  } catch (error) {
    next(error);
  }
});

clientsRouter.patch('/clients/:id', async (req, res, next) => {
  try {
    const body = parseBody(clientBody, req.body);
    res.json({ client: await updateClient(req.params.id, body) });
  } catch (error) {
    next(error);
  }
});

clientsRouter.delete('/clients/:id', async (req, res, next) => {
  try {
    await deleteClient(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

clientsRouter.post('/clients/:clientId/cases', async (req, res, next) => {
  try {
    const body = parseBody(caseBody, req.body);
    const legalCase = await createCase(req.params.clientId, body);
    res.status(201).json({ case: legalCase });
  } catch (error) {
    next(error);
  }
});
