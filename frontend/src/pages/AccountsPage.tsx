import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { createAccount, deleteAccount, listAccounts } from '../features/accounts/api';
import type { Account } from '../features/accounts/api';
import AccountEditModal from '../features/accounts/AccountEditModal';
import { ACCOUNT_LABELS, brl } from '../lib/format';
import { SelectField } from '../components/fields';
import { rise, stagger } from '../components/motion';
import { PencilIcon, PlusIcon, WalletIcon, XIcon } from '../components/icons';

export default function AccountsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['accounts'], queryFn: listAccounts });
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [initial, setInitial] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);

  const create = useMutation({
    mutationFn: () => createAccount({ name, type, initialBalance: Number(initial) || 0 }),
    onSuccess: () => {
      setName('');
      setInitial('0');
      setError(null);
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: () => setError('Falha ao criar a conta.'),
  });
  const del = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
    onError: (e: any) =>
      setError(e.response?.status === 409 ? 'Esta conta possui lançamentos e não pode ser excluída.' : 'Falha ao excluir.'),
  });

  const total = (data ?? []).reduce((s, a) => s + a.balance, 0);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.section variants={rise} className="relative overflow-hidden rounded-lg bg-brand-950 p-6 text-white shadow-pop md:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-600/40" />
        <p className="relative text-sm text-brand-200">Patrimônio total</p>
        <p className="relative font-display text-4xl font-bold tracking-tight md:text-5xl">{brl(total)}</p>
        <p className="relative mt-2 text-sm text-brand-200">
          {(data ?? []).length} conta{(data ?? []).length === 1 ? '' : 's'}
        </p>
      </motion.section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {isLoading ? (
          [0, 1].map((i) => <div key={i} className="h-28 animate-pulse rounded-lg bg-white" />)
        ) : (
          (data ?? []).map((a) => (
            <div key={a.id} className="card group flex items-center gap-3 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <WalletIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.name}</p>
                <p className="text-xs text-muted">{ACCOUNT_LABELS[a.type] ?? a.type}</p>
                <p className="mt-0.5 font-display text-lg font-semibold">{brl(a.balance)}</p>
              </div>
              <div className="flex shrink-0 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
                <button
                  onClick={() => { setError(null); setEditing(a); }}
                  aria-label={`Editar ${a.name}`}
                  className="rounded-lg p-1.5 text-muted transition hover:text-brand-700 focus:opacity-100"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setError(null); del.mutate(a.id); }}
                  aria-label={`Excluir ${a.name}`}
                  className="rounded-lg p-1.5 text-muted transition hover:text-red-600 focus:opacity-100"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        className="card mt-4 flex flex-wrap gap-2 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da conta" aria-label="Nome da conta" className="field min-w-[10rem] flex-1" />
        <div className="w-44">
          <SelectField
            options={Object.entries(ACCOUNT_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            value={type}
            onChange={setType}
            aria-label="Tipo de conta"
          />
        </div>
        <input value={initial} onChange={(e) => setInitial(e.target.value)} type="number" step="0.01" placeholder="Saldo inicial" aria-label="Saldo inicial" className="field w-32" />
        <button className="btn-primary inline-flex items-center gap-1.5" disabled={create.isPending}>
          <PlusIcon className="h-4 w-4" />
          {create.isPending ? 'Adicionando…' : 'Adicionar'}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <AnimatePresence>
        {editing && (
          <AccountEditModal
            account={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              qc.invalidateQueries({ queryKey: ['accounts'] });
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
