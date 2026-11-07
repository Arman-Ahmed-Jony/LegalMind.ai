import { Router } from 'express';

import { requireAuth } from '../middleware/auth';
import { deleteCase, getCase, updateCase } from '../services/cases';
import { listDocuments } from '../services/documents';
import { caseBody, parseBody } from '../validation';

export const casesRouter = Router();

casesRouter.use(requireAuth);

casesRouter.get('/cases/:id', async (req, res, next) => {
  try {
    const legalCase = await getCase(req.params.id);
    const documents = await listDocuments(legalCase.id);
    res.json({ case: legalCase, documents });
  } catch (error) {
    next(error);
  }
});

casesRouter.patch('/cases/:id', async (req, res, next) => {
  try {
    const body = parseBody(caseBody, req.body);
    res.json({ case: await updateCase(req.params.id, body) });
  } catch (error) {
    next(error);
  }
});

casesRouter.delete('/cases/:id', async (req, res, next) => {
  try {
    await deleteCase(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
