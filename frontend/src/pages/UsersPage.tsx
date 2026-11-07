import {
  Alert,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';

import { useMe } from '../hooks/useMe';
import { ApiError, api } from '../services/api';
import type { PublicUser, UserRole } from '../types/api';

export default function UsersPage() {
  const me = useMe();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const users = useQuery({
    queryKey: ['users'],
    queryFn: () => api<{ users: PublicUser[] }>('/api/users'),
    enabled: me.data?.user.role === 'admin',
  });
  const create = useMutation({
    mutationFn: () =>
      api('/api/users', {
        method: 'POST',
        body: JSON.stringify({ username, password, role }),
      }),
    onSuccess: async () => {
      setUsername('');
      setPassword('');
      setRole('member');
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  const update = useMutation({
    mutationFn: (input: { id: string; role: UserRole }) =>
      api(`/api/users/${input.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: input.role }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/users/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  if (me.data && me.data.user.role !== 'admin') {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Admin access required.</Alert>
      </Container>
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    create.mutate();
  }

  const actionError = create.error ?? update.error ?? remove.error;

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Internal users
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <Typography variant="h6">New user</Typography>
            {actionError ? (
              <Alert severity="error">
                {actionError instanceof ApiError ? actionError.message : 'Could not update users.'}
              </Alert>
            ) : null}
            <TextField
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <TextField
              select
              label="Role"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" disabled={create.isPending} sx={{ alignSelf: 'flex-start' }}>
              Create user
            </Button>
          </Stack>
        </Paper>
        {users.isLoading ? <Typography>Loading users...</Typography> : null}
        {users.error ? <Alert severity="error">Could not load users.</Alert> : null}
        <Stack spacing={1}>
          {users.data?.users.map((user) => (
            <Paper key={user.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Typography sx={{ flexGrow: 1 }}>
                  {user.username} ({user.role})
                </Typography>
                {user.id !== me.data?.user.id ? (
                  <>
                    <Button
                      onClick={() =>
                        update.mutate({
                          id: user.id,
                          role: user.role === 'admin' ? 'member' : 'admin',
                        })
                      }
                    >
                      Make {user.role === 'admin' ? 'member' : 'admin'}
                    </Button>
                    <Button
                      color="error"
                      onClick={() => {
                        if (window.confirm(`Delete ${user.username}?`)) {
                          remove.mutate(user.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </>
                ) : (
                  <Typography color="text.secondary">Signed in</Typography>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
