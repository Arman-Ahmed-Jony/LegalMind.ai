import type { HealthResponse } from '../types/health';

const apiUrl = import.meta.env.VITE_API_URL;

export async function getHealth(): Promise<HealthResponse> {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not set');
  }

  const response = await fetch(`${apiUrl}/api/health`);

  if (!response.ok && response.status !== 503) {
    throw new Error(`Backend returned HTTP ${response.status}`);
  }

  return (await response.json()) as HealthResponse;
}
