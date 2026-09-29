import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { deleteBudget, getSummary, upsertBudget } from './api';

export function useHealth() {
  return useQuery({ queryKey: ['health'], queryFn: () => api.get('/health').then((r) => r.data) });
}

export function useDashboard(month: string) {
  return useQuery({ queryKey: ['dashboard', month], queryFn: () => getSummary(month) });
}

export function useUpsertBudget(month: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { categoryId: string; limitAmount: number }) =>
      upsertBudget({ ...data, month }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard', month] }),
  });
}

export function useDeleteBudget(month: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard', month] }),
  });
}
