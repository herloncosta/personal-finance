import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { brl, currentMonth } from '../lib/format';
import { useDeleteTransaction, useTransactions } from '../features/transactions/hooks';
import type { Transaction } from '../features/transactions/api';
import TxModal from '../features/transactions/TxModal';
import TxRow from '../features/transactions/TxRow';
import MonthStepper from '../components/MonthStepper';
import { PlusIcon } from '../components/icons';
import { rise, stagger } from '../components/motion';

export default function TransactionsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [type, setType] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const { data, isLoading } = useTransactions({ month, type: type || undefined });
  const del = useDeleteTransaction();

  const list = data?.data ?? [];
  const income = list.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = list.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const segs = [
    { v: '', label: 'Todas' },
    { v: 'income', label: 'Receitas' },
    { v: 'expense', label: 'Despesas' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={rise} className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-xl font-bold">Movimento</h1>
        <div className="ml-auto">
          <MonthStepper value={month} onChange={setMonth} />
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary inline-flex items-center gap-1.5">
          <PlusIcon className="h-4 w-4" />
          Nova
        </button>
      </motion.div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg bg-brand-100/70 p-1" role="tablist" aria-label="Filtrar por tipo">
          {segs.map((s) => (
            <button
              key={s.v}
              role="tab"
              aria-selected={type === s.v}
              onClick={() => setType(s.v)}
              className={`seg ${type === s.v ? 'seg-active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="ml-auto font-display text-sm font-semibold">
          Saldo: <span className={income - expense < 0 ? 'text-red-600' : 'text-emerald-700'}>{brl(income - expense)}</span>
        </p>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-white" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="card mt-4 p-10 text-center">
          <p className="font-display text-[15px] font-semibold">Nada por aqui neste mês</p>
          <p className="mt-1 text-sm text-muted">Registre a primeira movimentação para ver o mês ganhar forma.</p>
          <button onClick={() => setCreating(true)} className="btn-primary mt-4 inline-flex items-center gap-1.5">
            <PlusIcon className="h-4 w-4" />
            Nova transação
          </button>
        </div>
      ) : (
        <ul className="card mt-4 divide-y divide-brand-50 px-2 py-1">
          {list.map((t) => (
            <TxRow key={t.id} tx={t} onEdit={() => setEditing(t)} onDelete={() => del.mutate(t.id)} />
          ))}
        </ul>
      )}
      <AnimatePresence>
        {creating && <TxModal key="new" onClose={() => setCreating(false)} />}
        {editing && <TxModal key={editing.id} initial={editing} onClose={() => setEditing(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
