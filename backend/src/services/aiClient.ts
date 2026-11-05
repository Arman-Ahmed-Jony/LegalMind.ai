type AiHealthPayload = {
  status?: string;
  service?: string;
};

export async function checkAiService(): Promise<void> {
  const baseUrl = process.env.AI_SERVICE_URL;

  if (!baseUrl) {
    throw new Error('AI_SERVICE_URL is not set');
  }

  const response = await fetch(`${baseUrl}/health`, {
    signal: AbortSignal.timeout(3000),
  });

  if (!response.ok) {
    throw new Error(`AI service returned HTTP ${response.status}`);
  }

  const body = (await response.json()) as AiHealthPayload;

  if (body.status !== 'ok' || body.service !== 'ai-service') {
    throw new Error('AI service returned an unexpected health payload');
  }
}
