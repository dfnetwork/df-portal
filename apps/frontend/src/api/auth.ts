import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './client';
import { useAuthStore } from '../store/auth';

export const useLogin = () =>
  useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', payload);
      return data;
    },
    onSuccess: (data) => {
      const user = JSON.parse(atob(data.accessToken.split('.')[1]));
      useAuthStore.getState().setAuth(data.accessToken, {
        sub: user.sub,
        email: user.email,
        role: user.role,
      });
    },
  });

export const useProfile = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
  });

export const useRegister = () =>
  useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      name: string;
      role?: string;
      organizationCode?: string;
    }) => {
      const { data } = await api.post('/auth/register', payload);
      return data;
    },
    onSuccess: (data) => {
      const user = JSON.parse(atob(data.accessToken.split('.')[1]));
      useAuthStore.getState().setAuth(data.accessToken, {
        sub: user.sub,
        email: user.email,
        role: user.role,
      });
    },
  });
