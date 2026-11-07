import {
  Alert,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { ApiError, api } from '../services/api';
import type { Client } from '../types/api';

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const clients = useQuery({
    queryKey: ['clients'],
    queryFn: () => api<{ clients: Client[] }>('/api/clients'),
  });
  const create = useMutation({
    mutationFn: () =>
      api('/api/clients', {
        method: 'POST',
        body: JSON.stringify({ name, notes: notes || null }),
      }),
    onSuccess: async () => {
      setName('');
      setNotes('');
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    create.mutate();
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Clients
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <Typography variant="h6">New client</Typography>
            {create.error ? (
              <Alert severity="error">
                {create.error instanceof ApiError
                  ? create.error.message
                  : 'Could not create the client.'}
              </Alert>
            ) : null}
            <TextField
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <TextField
              label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              multiline
              minRows={2}
            />
            <Button type="submit" variant="contained" disabled={create.isPending} sx={{ alignSelf: 'flex-start' }}>
              Create client
            </Button>
          </Stack>
        </Paper>
        {clients.isLoading ? <Typography>Loading clients...</Typography> : null}
        {clients.error ? (
          <Alert severity="error">Could not load clients.</Alert>
        ) : null}
        <Stack spacing={1}>
          {clients.data?.clients.map((client) => (
            <Paper key={client.id} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6">
                <RouterLink to={`/clients/${client.id}`}>{client.name}</RouterLink>
              </Typography>
              {client.notes ? (
                <Typography color="text.secondary">{client.notes}</Typography>
              ) : null}
            </Paper>
          ))}
          {clients.data?.clients.length === 0 ? (
            <Typography color="text.secondary">No clients yet.</Typography>
          ) : null}
        </Stack>
      </Stack>
    </Container>
  );
}
