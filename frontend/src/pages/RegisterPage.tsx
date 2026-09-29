import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../features/auth/AuthContext';

const schema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await signUp(data.name, data.email, data.password);
    } catch (e: any) {
      setError(e.response?.status === 409 ? 'Este e-mail já está cadastrado.' : 'Falha no cadastro. Tente de novo.');
    }
  });

  return (
    <main className="flex min-h-screen">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-brand-950 p-10 text-white lg:flex">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/40" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand-400/20" />
        <p className="relative font-display text-lg font-semibold">Personal Finance</p>
        <div className="relative">
          <p className="font-display text-4xl font-bold leading-tight tracking-tight">
            Comece o mês
            <br />
            no azul.
          </p>
          <p className="mt-3 max-w-sm text-brand-200">
            Contas, categorias e orçamentos do seu jeito — com relatórios inteligentes de brinde.
          </p>
        </div>
        <p className="relative text-sm text-brand-200">Leva menos de um minuto.</p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-ground p-6">
        <div className="card w-full max-w-sm p-8">
          <h1 className="font-display text-2xl font-bold">Criar conta</h1>
          <p className="mt-1 text-sm text-muted">Grátis, sem cartão.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">Nome</label>
              <input id="name" autoComplete="name" className="field mt-1 w-full" {...register('name')} />
              {formState.errors.name && (
                <p className="mt-1 text-xs text-red-600">{formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium">E-mail</label>
              <input id="email" type="email" autoComplete="email" className="field mt-1 w-full" {...register('email')} />
              {formState.errors.email && (
                <p className="mt-1 text-xs text-red-600">{formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">Senha</label>
              <input id="password" type="password" autoComplete="new-password" className="field mt-1 w-full" {...register('password')} />
              {formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">{formState.errors.password.message}</p>
              )}
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={formState.isSubmitting} className="btn-primary w-full py-3">
              {formState.isSubmitting ? 'Criando…' : 'Cadastrar'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            Já tem conta?{' '}
            <Link to="/login" className="font-medium text-brand-700 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
