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
import { FormEvent, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

import { ApiError, api } from '../services/api';
import type { Client, LegalCase } from '../types/api';

export default function ClientDetailPage() {
  const { clientId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const detail = useQuery({
    queryKey: ['client', clientId],
    queryFn: () =>
      api<{ client: Client; cases: LegalCase[] }>(`/api/clients/${clientId}`),
  });

  useEffect(() => {
    if (detail.data) {
      setName(detail.data.client.name);
      setNotes(detail.data.client.notes ?? '');
    }
  }, [detail.data]);

  const save = useMutation({
    mutationFn: () =>
      api(`/api/clients/${clientId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, notes: notes || null }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
  const remove = useMutation({
    mutationFn: () => api(`/api/clients/${clientId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigate('/');
    },
  });
  const createCase = useMutation({
    mutationFn: () =>
      api(`/api/clients/${clientId}/cases`, {
        method: 'POST',
        body: JSON.stringify({ title, description: description || null }),
      }),
    onSuccess: async () => {
      setTitle('');
      setDescription('');
      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
    },
  });

  function saveClient(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  function addCase(event: FormEvent) {
    event.preventDefault();
    createCase.mutate();
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          {detail.data?.client.name ?? 'Client'}
        </Typography>
        {detail.isLoading ? <Typography>Loading client...</Typography> : null}
        {detail.error ? <Alert severity="error">Could not load this client.</Alert> : null}
        {detail.data ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack component="form" spacing={2} onSubmit={saveClient}>
              <Typography variant="h6">Client details</Typography>
              {save.error || remove.error ? (
                <Alert severity="error">
                  {(save.error ?? remove.error) instanceof ApiError
                    ? (save.error ?? remove.error)?.message
                    : 'Could not update the client.'}
                </Alert>
              ) : null}
              <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
              <TextField
                label="Notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                multiline
                minRows={2}
              />
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" disabled={save.isPending}>
                  Save
                </Button>
                <Button
                  color="error"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm('Delete this client?')) {
                      remove.mutate();
                    }
                  }}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ) : null}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack component="form" spacing={2} onSubmit={addCase}>
            <Typography variant="h6">New case</Typography>
            {createCase.error ? (
              <Alert severity="error">
                {createCase.error instanceof ApiError
                  ? createCase.error.message
                  : 'Could not create the case.'}
              </Alert>
            ) : null}
            <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
            <TextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              multiline
              minRows={2}
            />
            <Button type="submit" variant="contained" disabled={createCase.isPending} sx={{ alignSelf: 'flex-start' }}>
              Create case
            </Button>
          </Stack>
        </Paper>
        <Stack spacing={1}>
          {detail.data?.cases.map((legalCase) => (
            <Paper key={legalCase.id} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6">
                <RouterLink to={`/cases/${legalCase.id}`}>{legalCase.title}</RouterLink>
              </Typography>
              {legalCase.description ? (
                <Typography color="text.secondary">{legalCase.description}</Typography>
              ) : null}
            </Paper>
          ))}
          {detail.data?.cases.length === 0 ? (
            <Typography color="text.secondary">No cases yet.</Typography>
          ) : null}
        </Stack>
      </Stack>
    </Container>
  );
}
