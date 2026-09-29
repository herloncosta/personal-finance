import { api } from '../../lib/api-client';

export interface BudgetStatus {
  id: string;
  categoryId: string;
  limitAmount: number;
  spent: number;
  pct: number;
  category: { id: string; name: string; color: string };
}

export interface DashboardSummary {
  income: number;
  expense: number;
  balance: number;
  byCategory: { id: string | null; name: string; color: string; total: number }[];
  dailySeries: { date: string; income: number; expense: number }[];
  budgetStatus: BudgetStatus[];
}

export const getSummary = (month: string) =>
  api.get<DashboardSummary>('/dashboard/summary', { params: { month } }).then((r) => r.data);

export const upsertBudget = (data: { categoryId: string; month: string; limitAmount: number }) =>
  api.post('/budgets', data).then((r) => r.data);

export const deleteBudget = (id: string) => api.delete(`/budgets/${id}`);
