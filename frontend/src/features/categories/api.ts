import { api } from '../../lib/api-client';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

export const listCategories = () => api.get<Category[]>('/categories').then((r) => r.data);

export const createCategory = (data: { name: string; type: string; color: string }) =>
  api.post<Category>('/categories', data).then((r) => r.data);

export const deleteCategory = (id: string) => api.delete(`/categories/${id}`);
