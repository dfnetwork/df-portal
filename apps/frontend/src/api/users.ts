import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    },
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; name: string; password: string; role: string }) =>
      api.post('/users', payload).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};
