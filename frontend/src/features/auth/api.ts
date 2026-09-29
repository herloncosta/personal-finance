import { api, setAccessToken } from '../../lib/api-client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export async function register(data: { name: string; email: string; password: string }) {
  const res = await api.post<AuthResponse>('/auth/register', data);
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function login(data: { email: string; password: string }) {
  const res = await api.post<AuthResponse>('/auth/login', data);
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}

export async function me() {
  const token = localStorage.getItem('access_token');
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  const res = await api.get<AuthUser>('/auth/me');
  return res.data;
}
