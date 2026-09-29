import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  withCredentials: true,
});

// Refresh transparente: 401 -> tenta /auth/refresh uma vez e repete a request.
let refreshing: Promise<unknown> | null = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      refreshing ??= axios
        .post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true })
        .finally(() => (refreshing = null));
      await refreshing;
      const token = localStorage.getItem('access_token');
      if (token) original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    }
    throw error;
  },
);

export function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem('access_token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common.Authorization;
  }
}
