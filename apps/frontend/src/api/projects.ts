import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const useProjects = () =>
  useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data,
  });

export const useProject = (id?: string) =>
  useQuery({
    enabled: !!id,
    queryKey: ['projects', id],
    queryFn: async () => (await api.get(`/projects/${id}`)).data,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      api.post('/projects', payload).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};
