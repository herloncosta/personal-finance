import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';

export interface Insight {
  summary: string;
  alerts: string[];
  tip: string;
  provider: string;
  cached: boolean;
}

export interface Suggestion {
  categoryId: string | null;
  categoryName: string | null;
  confidence: number;
  provider: string;
}

export const getInsights = (month: string, refresh = false) =>
  api
    .get<Insight>('/ai/insights', { params: { month, ...(refresh ? { refresh: 'true' } : {}) } })
    .then((r) => r.data);

export const suggestCategory = (description: string, type: string) =>
  api.post<Suggestion>('/ai/categorize', { description, type }).then((r) => r.data);

export function useInsights(month: string) {
  return useQuery({ queryKey: ['insights', month], queryFn: () => getInsights(month) });
}

export function useRegenerateInsights(month: string) {
  const qc = useQueryClient();
  return async () => {
    const fresh = await getInsights(month, true);
    qc.setQueryData(['insights', month], fresh);
    return fresh;
  };
}
