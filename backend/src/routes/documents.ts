import { Router } from 'express';
import multer from 'multer';

import { requireAuth } from '../middleware/auth';
import { getCase } from '../services/cases';
import {
  deleteDocument,
  getDocumentFile,
  saveDocument,
} from '../services/documents';
import { HttpError } from '../httpError';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

function param(value: string | string[] | undefined): string {
  const id = Array.isArray(value) ? value[0] : value;

  if (!id) {
    throw new HttpError(400, 'Missing id.');
  }

  return id;
}

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

documentsRouter.post(
  '/cases/:caseId/documents',
  upload.single('file'),
  async (req, res, next) => {
    try {
      await getCase(param(req.params.caseId));

      if (!req.file) {
        res.status(400).json({ error: 'Choose a PDF or DOCX file.' });
        return;
      }

      const document = await saveDocument(param(req.params.caseId), req.file);
      res.status(201).json({ document });
    } catch (error) {
      next(error);
    }
  },
);

documentsRouter.get('/documents/:id/file', async (req, res, next) => {
  try {
    const file = await getDocumentFile(req.params.id);
    res.download(file.absolutePath, file.document.originalFilename);
  } catch (error) {
    next(error);
  }
});

documentsRouter.delete('/documents/:id', async (req, res, next) => {
  try {
    await deleteDocument(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
