import { AppBar, Box, Button, CircularProgress, Toolbar, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink, Navigate, Outlet, useNavigate } from 'react-router-dom';

import { useMe } from '../hooks/useMe';
import { api } from '../services/api';

export function RequireAuth() {
  const me = useMe();

  if (me.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!me.data) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function AppShell() {
  const me = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = me.data?.user;

  async function logout() {
    await api('/api/logout', { method: 'POST' });
    queryClient.clear();
    navigate('/login');
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            LegalMind
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Clients
          </Button>
          {user?.role === 'admin' ? (
            <Button color="inherit" component={RouterLink} to="/users">
              Users
            </Button>
          ) : null}
          <Button color="inherit" component={RouterLink} to="/status">
            Status
          </Button>
          <Typography sx={{ mx: 2 }}>{user?.username}</Typography>
          <Button color="inherit" onClick={() => void logout()}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      <Outlet />
    </>
  );
}
