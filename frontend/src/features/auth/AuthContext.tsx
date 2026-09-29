import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { onUnauthorizedExpired } from '../../lib/api-client';
import * as authApi from './api';
import type { AuthUser } from './api';

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Sem token em memória após reload: tenta o refresh via cookie httpOnly.
    // Sem refresh válido, segue deslogado.
    authApi
      .refresh()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // 401 irrecuperável em qualquer request (refresh falhou) → desloga.
    onUnauthorizedExpired(() => {
      setUser(null);
      navigate('/login');
    });
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
    navigate('/');
  };

  const signUp = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    setUser(res.user);
    navigate('/');
  };

  const signOut = async () => {
    await authApi.logout();
    setUser(null);
    navigate('/login');
  };

  return <Ctx.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}
