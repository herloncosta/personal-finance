import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAccounts } from '../accounts/api';
import { listCategories } from '../categories/api';
import { createTransaction, deleteTransaction, listTransactions, updateTransaction, type TxFilters } from './api';

export const useTransactions = (f: TxFilters) =>
  useQuery({ queryKey: ['transactions', f], queryFn: () => listTransactions(f) });

export const useAccounts = () => useQuery({ queryKey: ['accounts'], queryFn: listAccounts });

export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: listCategories });

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTransaction>[1] }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
