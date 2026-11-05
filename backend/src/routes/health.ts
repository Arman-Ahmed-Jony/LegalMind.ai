import { Router } from 'express';

import { checkDatabase } from '../db/pool';
import { checkAiService } from '../services/aiClient';

export const healthRouter = Router();

type CheckResult = {
  status: 'ok' | 'error';
  detail?: string;
};

function errorDetail(error: unknown): string {
  if (error instanceof AggregateError) {
    const messages = error.errors
      .map((item) => (item instanceof Error ? item.message : String(item)))
      .filter((message) => message.length > 0);

    if (messages.length > 0) {
      return messages.join('; ');
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Check failed';
}

async function runCheck(check: () => Promise<void>): Promise<CheckResult> {
  try {
    await check();
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', detail: errorDetail(error) };
  }
}

healthRouter.get('/health', async (_req, res) => {
  const [postgres, aiService] = await Promise.all([
    runCheck(checkDatabase),
    runCheck(checkAiService),
  ]);

  const healthy = postgres.status === 'ok' && aiService.status === 'ok';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'backend',
    checks: {
      postgres,
      aiService,
    },
  });
});
