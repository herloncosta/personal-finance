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
      setError(e.response?.status === 409 ? 'E-mail já cadastrado' : 'Falha no cadastro');
    }
  });

  const field = 'mt-1 w-full rounded-lg border px-3 py-2';

  return (
    <main className="mx-auto mt-16 max-w-sm p-6">
      <h1 className="text-2xl font-bold">Criar conta</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Nome</label>
          <input className={field} {...register('name')} />
          {formState.errors.name && (
            <p className="text-xs text-red-600">{formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">E-mail</label>
          <input type="email" className={field} {...register('email')} />
          {formState.errors.email && (
            <p className="text-xs text-red-600">{formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Senha</label>
          <input type="password" className={field} {...register('password')} />
          {formState.errors.password && (
            <p className="text-xs text-red-600">{formState.errors.password.message}</p>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full rounded-lg bg-black py-2 text-white disabled:opacity-50"
        >
          {formState.isSubmitting ? 'Criando…' : 'Cadastrar'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Já tem conta?{' '}
        <Link to="/login" className="underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
