import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { healthRouter } from './routes/health';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const origin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin }));
app.use(express.json());
app.use('/api', healthRouter);

app.listen(port, () => {
  console.log(`Express listening on http://localhost:${port}`);
});
