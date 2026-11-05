export type CheckResult = {
  status: 'ok' | 'error';
  detail?: string;
};

export type HealthResponse = {
  status: 'ok' | 'degraded';
  service: string;
  checks: {
    postgres: CheckResult;
    aiService: CheckResult;
  };
};
