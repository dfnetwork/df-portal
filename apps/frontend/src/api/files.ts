import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export const useFolder = (projectId: string, folderId?: string) =>
  useQuery({
    queryKey: ['files', projectId, folderId],
    queryFn: async () =>
      (await api.get(`/projects/${projectId}/files`, { params: { folderId } })).data,
  });

export const useUpload = (projectId: string, folderId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      form.append('folderId', folderId);
      return (await api.post(`/projects/${projectId}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files', projectId, folderId] }),
  });
};

export const useCreateFolder = (projectId: string, folderId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      api.post(`/projects/${projectId}/folders`, { name, parentId: folderId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files', projectId, folderId] }),
  });
};
