import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import multer from 'multer';

import { HttpError } from './httpError';
import { casesRouter } from './routes/cases';
import { clientsRouter } from './routes/clients';
import { documentsRouter } from './routes/documents';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { ensureUploadsDir } from './services/documents';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const origin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api', healthRouter);
app.use('/api', authRouter);
app.use('/api', usersRouter);
app.use('/api', clientsRouter);
app.use('/api', casesRouter);
app.use('/api', documentsRouter);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File is larger than 20 MB.' });
      return;
    }

    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message });
      return;
    }

    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  },
);

ensureUploadsDir()
  .then(() => {
    app.listen(port, () => {
      console.log(`Express listening on http://localhost:${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
