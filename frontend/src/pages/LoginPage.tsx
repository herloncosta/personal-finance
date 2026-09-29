import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../features/auth/AuthContext';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

export default function LoginPage() {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await signIn(data.email, data.password);
    } catch {
      setError('Credenciais inválidas');
    }
  });

  return (
    <main className="mx-auto mt-16 max-w-sm p-6">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">E-mail</label>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            {...register('email')}
          />
          {formState.errors.email && (
            <p className="text-xs text-red-600">{formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Senha</label>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            {...register('password')}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full rounded-lg bg-black py-2 text-white disabled:opacity-50"
        >
          {formState.isSubmitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Sem conta?{' '}
        <Link to="/register" className="underline">
          Cadastre-se
        </Link>
      </p>
    </main>
  );
}
