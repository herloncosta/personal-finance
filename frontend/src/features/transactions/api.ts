import { api } from '../../lib/api-client';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description: string;
  account: { id: string; name: string };
  category: { id: string; name: string; color: string } | null;
}

export interface TxList {
  data: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TxFilters {
  month?: string;
  type?: string;
}

export const listTransactions = (f: TxFilters) =>
  api.get<TxList>('/transactions', { params: { ...f, pageSize: 50 } }).then((r) => r.data);

export const createTransaction = (data: {
  type: string;
  amount: number;
  date: string;
  description: string;
  accountId: string;
  categoryId?: string;
}) => api.post<Transaction>('/transactions', data).then((r) => r.data);

export const deleteTransaction = (id: string) => api.delete(`/transactions/${id}`);
