import { useState } from 'react';
import { motion } from 'framer-motion';
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
import { useDashboard } from '../features/dashboard/hooks';
import BudgetSection from '../features/dashboard/BudgetSection';
import InsightCard from '../components/InsightCard';
import MonthStepper from '../components/MonthStepper';
import { rise, stagger } from '../components/motion';
import { AlertIcon, DownIcon, UpIcon } from '../components/icons';
import { brl, currentMonth } from '../lib/format';

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useDashboard(month);

  if (isLoading)
    return (
      <div className="space-y-4">
        <div className="h-44 animate-pulse rounded-lg bg-brand-100" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg bg-white" />
          <div className="h-64 animate-pulse rounded-lg bg-white" />
        </div>
      </div>
    );
  if (!data) return <p className="text-sm text-red-600">Falha ao carregar o mês. Tente de novo.</p>;

  const over = data.budgetStatus.filter((b) => b.pct >= 1).length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.section variants={rise} className="relative overflow-hidden rounded-lg bg-brand-950 p-6 text-white shadow-pop md:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-600/40" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 right-24 h-56 w-56 rounded-full bg-brand-400/20" />
        <div className="relative flex flex-wrap items-center gap-2">
          <MonthStepper value={month} onChange={setMonth} dark />
          {month !== currentMonth() && (
            <button
              onClick={() => setMonth(currentMonth())}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-brand-100 transition hover:bg-white/15 hover:text-white"
            >
              Mês atual
            </button>
          )}
        </div>
        <p className="relative mt-5 text-sm text-brand-200">Saldo do mês</p>
        <p className={`relative font-display text-4xl font-bold tracking-tight md:text-5xl ${data.balance < 0 ? 'text-red-300' : ''}`}>
          {brl(data.balance)}
        </p>
        <div className="relative mt-6 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
              <UpIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-brand-200">Receitas</p>
              <p className="font-display text-base font-semibold md:text-lg">{brl(data.income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-400/20 text-red-300">
              <DownIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-brand-200">Despesas</p>
              <p className="font-display text-base font-semibold md:text-lg">{brl(data.expense)}</p>
            </div>
          </div>
        </div>
        {over > 0 && (
          <p className="relative mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-400/15 px-3 py-1 text-xs font-medium text-red-200">
            <AlertIcon className="h-4 w-4" />
            {over} orçamento{over > 1 ? 's' : ''} estourado{over > 1 ? 's' : ''}
          </p>
        )}
      </motion.section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <motion.section variants={rise} className="card p-5">
          <h2 className="font-display text-[15px] font-semibold">Despesas por categoria</h2>
          {data.byCategory.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted">Sem despesas neste mês.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.byCategory}
                    dataKey="total"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={3}
                    cornerRadius={5}
                    strokeWidth={0}
                  >
                    {data.byCategory.map((c) => (
                      <Cell key={c.id ?? c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CategoryTooltip total={data.expense} />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-1 space-y-1.5 text-sm">
                {data.byCategory.map((c) => (
                  <li key={c.id ?? c.name} className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="font-display font-semibold">{brl(c.total)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </motion.section>

        <motion.section variants={rise} className="card p-5">
          <h2 className="font-display text-[15px] font-semibold">Fluxo diário</h2>
          {data.dailySeries.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted">Sem movimento neste mês.</p>
          ) : (
            <ResponsiveContainer width="100%" height={248}>
              <AreaChart data={data.dailySeries} margin={{ top: 12, right: 4, bottom: 0, left: -8 }}>
                <CartesianGrid stroke="#eee5f6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6f5b7e' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6f5b7e' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Area type="monotone" dataKey="income" stroke="#059669" fill="#05966922" strokeWidth={2} name="Receitas" />
                <Area type="monotone" dataKey="expense" stroke="#820ad1" fill="#820ad122" strokeWidth={2} name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.section>
      </div>

      <BudgetSection month={month} />
      <InsightCard month={month} />
    </motion.div>
  );
}

function CategoryTooltip({ active, payload, total }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const pct = total > 0 ? (item.total / total) * 100 : 0;
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-card">
      <p className="font-medium">{item.name}</p>
      <p className="text-muted">{pct.toFixed(1)}% · {brl(item.total)}</p>
    </div>
  );
}
