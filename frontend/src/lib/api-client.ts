import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  withCredentials: true,
});

// Access token vive SÓ em memória (nunca localStorage): XSS não o lê do disco
// e cada reload exige um refresh via cookie httpOnly — ou o usuário desloga.
let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function onUnauthorizedExpired(cb: () => void) {
  onUnauthorized = cb;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Refresh transparente: 401 -> tenta /auth/refresh uma vez e repete a request.
// Sem token válido e sem refresh, desloga (onUnauthorized).
let refreshing: Promise<string> | null = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.includes('/auth/');
    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        refreshing ??= axios
          .post<{ accessToken: string }>(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true })
          .then((r) => r.data.accessToken)
          .finally(() => (refreshing = null));
        accessToken = await refreshing;
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        accessToken = null;
        onUnauthorized?.();
      }
    }
    throw error;
  },
);
