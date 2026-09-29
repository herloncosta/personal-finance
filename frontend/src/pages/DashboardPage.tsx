import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCategories } from '../features/transactions/hooks';
import { useDashboard, useDeleteBudget, useUpsertBudget } from '../features/dashboard/hooks';
import InsightCard from '../components/InsightCard';
import { brl, currentMonth } from '../lib/format';

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useDashboard(month);

  if (isLoading) return <p className="text-sm text-gray-500">Carregando…</p>;
  if (!data) return <p className="text-sm text-red-600">Falha ao carregar.</p>;

  const kpis = [
    { label: 'Receitas', value: data.income, cls: 'text-green-700' },
    { label: 'Despesas', value: data.expense, cls: 'text-red-700' },
    { label: 'Saldo', value: data.balance, cls: data.balance >= 0 ? 'text-gray-900' : 'text-red-700' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border px-2 py-1.5 text-sm"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border p-4">
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className={`text-xl font-semibold ${k.cls}`}>{brl(k.value)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border p-4">
          <h2 className="text-sm font-semibold">Despesas por categoria</h2>
          {data.byCategory.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">Sem despesas no mês.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.byCategory} dataKey="total" nameKey="name" innerRadius={55} outerRadius={90}>
                  {data.byCategory.map((c) => (
                    <Cell key={c.id} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => brl(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <ul className="mt-2 space-y-1 text-sm">
            {data.byCategory.map((c) => (
              <li key={c.id} className="flex justify-between">
                <span><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: c.color }} />{c.name}</span>
                <span className="font-medium">{brl(c.total)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border p-4">
          <h2 className="text-sm font-semibold">Fluxo diário</h2>
          {data.dailySeries.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">Sem movimento no mês.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.dailySeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#16a34a" fill="#16a34a33" name="Receitas" />
                <Area type="monotone" dataKey="expense" stackId="2" stroke="#dc2626" fill="#dc262622" name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      <BudgetSection month={month} />
      <InsightCard month={month} />
    </div>
  );
}

function BudgetSection({ month }: { month: string }) {
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
    <section className="mt-6 rounded-xl border p-4">
      <h2 className="text-sm font-semibold">Orçamentos do mês</h2>
      <form onSubmit={save} className="mt-3 flex flex-wrap gap-2">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded-lg border px-2 py-1.5 text-sm">
          <option value="">Categoria…</option>
          {expenseCats.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input value={limit} onChange={(e) => setLimit(e.target.value)} type="number" step="0.01" placeholder="Limite R$" className="w-32 rounded-lg border px-2 py-1.5 text-sm" />
        <button className="rounded-lg bg-black px-4 py-1.5 text-sm text-white">Definir</button>
      </form>
      <ul className="mt-4 space-y-3">
        {budgets.map((b) => {
          const over = b.pct >= 1;
          const warn = !over && b.pct >= 0.8;
          return (
            <li key={b.id} className="text-sm">
              <div className="flex items-center justify-between">
                <span>{b.category.name} <span className="text-gray-500">· {brl(b.spent)} / {brl(b.limitAmount)}</span></span>
                <span className="flex items-center gap-2">
                  <span className={`font-medium ${over ? 'text-red-700' : warn ? 'text-amber-600' : 'text-gray-600'}`}>
                    {Math.round(b.pct * 100)}%
                  </span>
                  <button onClick={() => del.mutate(b.id)} className="text-xs text-gray-400 hover:text-red-600">✕</button>
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${over ? 'bg-red-600' : warn ? 'bg-amber-500' : 'bg-green-600'}`}
                  style={{ width: `${Math.min(100, b.pct * 100)}%` }}
                />
              </div>
            </li>
          );
        })}
        {budgets.length === 0 && <li className="text-sm text-gray-400">Nenhum orçamento definido.</li>}
      </ul>
    </section>
  );
}
