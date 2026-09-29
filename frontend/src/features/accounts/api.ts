import { api } from '../../lib/api-client';

export interface Account {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
  balance: number;
}

export const listAccounts = () => api.get<Account[]>('/accounts').then((r) => r.data);

export const createAccount = (data: { name: string; type: string; initialBalance: number }) =>
  api.post<Account>('/accounts', data).then((r) => r.data);

export const deleteAccount = (id: string) => api.delete(`/accounts/${id}`);
