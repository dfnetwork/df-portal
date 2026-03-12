import { useQuery } from '@tanstack/react-query';
import { api } from './client';

export const useActivity = (projectId?: string) =>
  useQuery({
    queryKey: ['activity', projectId],
    queryFn: async () =>
      (await api.get('/activity', { params: { projectId } })).data,
  });
