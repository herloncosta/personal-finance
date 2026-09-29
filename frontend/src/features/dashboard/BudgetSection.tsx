import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCategories } from '../../features/transactions/hooks';
import { SelectField } from '../../components/fields';
import { XIcon } from '../../components/icons';
import { rise } from '../../components/motion';
import { brl } from '../../lib/format';
import { useDashboard, useDeleteBudget, useUpsertBudget } from './hooks';

export default function BudgetSection({ month }: { month: string }) {
  const { data } = useDashboard(month);
  const { data: categories } = useCategories();
  const upsert = useUpsertBudget(month);
  const del = useDeleteBudget(month);
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');

  const expenseCats = (categories ?? []).filter((c) => c.type === 'expense');
  const budgets = data?.budgetStatus ?? [];

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !Number(limit)) return;
    upsert.mutate(
      { categoryId, limitAmount: Number(limit) },
      { onSuccess: () => { setCategoryId(''); setLimit(''); } },
    );
  };

  return (
    <motion.section variants={rise} className="card mt-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-[15px] font-semibold">Orçamentos do mês</h2>
        {budgets.length > 0 && (
          <span className="badge bg-brand-50 text-brand-800">
            {budgets.filter((b) => b.pct < 0.8).length}/{budgets.length} sob controle
          </span>
        )}
      </div>
      <form onSubmit={save} className="mt-3 flex flex-wrap gap-2">
        <div className="min-w-[9rem] flex-1">
          <SelectField
            options={expenseCats.map((c) => ({ value: c.id, label: c.name, color: c.color }))}
            value={categoryId}
            onChange={setCategoryId}
            placeholder="Categoria…"
            aria-label="Categoria do orçamento"
          />
        </div>
        <input
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          type="number"
          step="0.01"
          min="0"
          placeholder="Limite R$"
          aria-label="Limite em reais"
          className="field w-32"
        />
        <button className="btn-primary" disabled={upsert.isPending}>
          {upsert.isPending ? 'Definindo…' : 'Definir'}
        </button>
      </form>
      <ul className="mt-4 space-y-4">
        {budgets.map((b) => {
          const over = b.pct >= 1;
          const warn = !over && b.pct >= 0.8;
          return (
            <li key={b.id}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate font-medium">
                  {b.category.name}{' '}
                  <span className="font-normal text-muted">
                    {brl(b.spent)} de {brl(b.limitAmount)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className={`badge ${over ? 'bg-red-50 text-red-700' : warn ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {Math.round(b.pct * 100)}%
                  </span>
                  <button
                    onClick={() => del.mutate(b.id)}
                    aria-label={`Remover orçamento de ${b.category.name}`}
                    className="rounded-lg p-1 text-muted transition hover:text-red-600"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-lg bg-brand-50">
                <div
                  className={`bar-fill h-full w-full rounded-lg ${over ? 'bg-red-500' : warn ? 'bg-amber-400' : 'bg-brand-600'}`}
                  style={{ transform: `scaleX(${Math.min(1, b.pct)})` }}
                />
              </div>
            </li>
          );
        })}
        {budgets.length === 0 && (
          <li className="text-sm text-muted">Defina um teto por categoria e acompanhe aqui.</li>
        )}
      </ul>
    </motion.section>
  );
}
