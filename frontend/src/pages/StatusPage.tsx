import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { getHealth } from '../services/health';
import type { CheckResult } from '../types/health';

type Row = {
  name: string;
  result: CheckResult;
};

export default function StatusPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const health = await getHealth();
      setRows([
        { name: 'Express', result: { status: 'ok' } },
        { name: 'PostgreSQL', result: health.checks.postgres },
        { name: 'AI service', result: health.checks.aiService },
      ]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown error';
      setRows([
        { name: 'Express', result: { status: 'error', detail } },
        {
          name: 'PostgreSQL',
          result: { status: 'error', detail: 'Not checked. Express is unreachable.' },
        },
        {
          name: 'AI service',
          result: { status: 'error', detail: 'Not checked. Express is unreachable.' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1">
            LegalMind
          </Typography>
          <Typography color="text.secondary">
            Phase 0 checks that the browser can reach Express, and that Express
            can reach PostgreSQL and the AI service.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            {rows.length === 0 ? (
              <Typography>Checking services...</Typography>
            ) : null}
            {rows.map((row) => (
              <Alert
                key={row.name}
                severity={row.result.status === 'ok' ? 'success' : 'error'}
              >
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {row.name}
                </Box>
                {row.result.detail ? ` — ${row.result.detail}` : ''}
              </Alert>
            ))}
            <Button variant="contained" onClick={() => void load()} disabled={loading}>
              {loading ? 'Checking...' : 'Check again'}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
