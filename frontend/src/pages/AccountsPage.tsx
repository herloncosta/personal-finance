import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAccount, deleteAccount, listAccounts } from '../features/accounts/api';
import { ACCOUNT_LABELS, brl } from '../lib/format';

export default function AccountsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['accounts'], queryFn: listAccounts });
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [initial, setInitial] = useState('0');
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => createAccount({ name, type, initialBalance: Number(initial) || 0 }),
    onSuccess: () => {
      setName('');
      setInitial('0');
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
  const del = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
    onError: (e: any) =>
      setError(e.response?.status === 409 ? 'Conta possui lançamentos.' : 'Falha ao excluir.'),
  });

  const total = (data ?? []).reduce((s, a) => s + a.balance, 0);

  return (
    <div>
      <h1 className="text-xl font-bold">Contas</h1>
      <p className="mt-1 text-sm text-gray-600">Patrimônio total: <strong>{brl(total)}</strong></p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {isLoading ? (
          <p className="text-sm text-gray-500">Carregando…</p>
        ) : (
          (data ?? []).map((a) => (
            <div key={a.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{a.name}</p>
                <button onClick={() => { setError(null); del.mutate(a.id); }} className="text-xs text-gray-400 hover:text-red-600">✕</button>
              </div>
              <p className="text-xs text-gray-500">{ACCOUNT_LABELS[a.type] ?? a.type}</p>
              <p className="mt-1 text-lg font-semibold">{brl(a.balance)}</p>
            </div>
          ))
        )}
      </div>

      <form
        className="mt-6 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da conta" className="rounded-lg border px-3 py-2 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          {Object.entries(ACCOUNT_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <input value={initial} onChange={(e) => setInitial(e.target.value)} type="number" step="0.01" placeholder="Saldo inicial" className="w-32 rounded-lg border px-3 py-2 text-sm" />
        <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">+ Adicionar</button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
