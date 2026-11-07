import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useMe } from '../hooks/useMe';
import { ApiError, api } from '../services/api';
import type { PublicUser } from '../types/api';

export default function LoginPage() {
  const me = useMe();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (me.data) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await api<{ user: PublicUser }>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      queryClient.setQueryData(['me'], result);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack component="form" spacing={2} onSubmit={(event) => void onSubmit(event)}>
          <Box>
            <Typography variant="h4" component="h1">
              Legal Mind
            </Typography>
            <Typography color="text.secondary">Sign in to continue.</Typography>
          </Box>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
