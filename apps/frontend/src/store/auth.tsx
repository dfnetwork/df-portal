import React, { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { JwtUser } from '@df-portal/shared';

interface AuthState {
  token: string | null;
  user: JwtUser | null;
  setAuth: (token: string, user: JwtUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clear: () => set({ token: null, user: null }),
    }),
    { name: 'df-portal-auth' },
  ),
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);
  return <>{children}</>;
};
