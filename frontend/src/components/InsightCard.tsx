import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInsights, useRegenerateInsights } from '../features/ai/api';
import { rise } from './motion';
import { AlertIcon, BulbIcon, SparkIcon } from './icons';

export default function InsightCard({ month }: { month: string }) {
  const { data, isLoading } = useInsights(month);
  const regenerate = useRegenerateInsights(month);
  const [busy, setBusy] = useState(false);

  const onRegen = async () => {
    setBusy(true);
    try {
      await regenerate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.section variants={rise} className="card mt-4 overflow-hidden">
      <div className="flex items-center gap-2 bg-brand-950 px-5 py-3.5 text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <SparkIcon className="h-5 w-5" />
        </span>
        <h2 className="font-display text-[15px] font-semibold">Análise inteligente</h2>
        {data && (
          <span className="badge bg-white/15 text-brand-100">
            {data.provider === 'keyword' ? 'local' : 'IA'}
            {data.cached ? ' · salvo' : ''}
          </span>
        )}
        <button
          onClick={onRegen}
          disabled={busy || isLoading}
          className="ml-auto rounded-lg px-3 py-1 text-xs font-medium text-brand-200 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          {busy ? 'Gerando…' : 'Regenerar'}
        </button>
      </div>
      <div className="p-5">
        {isLoading ? (
          <p className="text-sm text-muted">Analisando o mês…</p>
        ) : !data ? (
          <p className="text-sm text-muted">Sem análise por enquanto.</p>
        ) : (
          <div className="space-y-3 text-sm leading-relaxed">
            <p>{data.summary}</p>
            {data.alerts.map((a) => (
              <p key={a} className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-700">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                {a}
              </p>
            ))}
            {data.tip && (
              <p className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-800">
                <BulbIcon className="mt-0.5 h-4 w-4 shrink-0" />
                {data.tip}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
