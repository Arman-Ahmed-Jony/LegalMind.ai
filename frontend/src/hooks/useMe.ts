import { useQuery } from '@tanstack/react-query';

import { api } from '../services/api';
import type { PublicUser } from '../types/api';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ user: PublicUser }>('/api/me'),
    retry: false,
  });
}
