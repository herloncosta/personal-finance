import { useState } from 'react';
import { useInsights, useRegenerateInsights } from '../features/ai/api';

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
    <section className="mt-6 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold">✨ Análise inteligente</h2>
        {data && (
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-gray-500">
            {data.provider === 'keyword' ? 'local' : 'IA'}
            {data.cached ? ' · cache' : ''}
          </span>
        )}
        <button
          onClick={onRegen}
          disabled={busy || isLoading}
          className="ml-auto text-xs text-violet-700 underline disabled:opacity-50"
        >
          {busy ? 'Gerando…' : 'Regenerar'}
        </button>
      </div>
      {isLoading ? (
        <p className="mt-2 text-sm text-gray-500">Analisando o mês…</p>
      ) : !data ? (
        <p className="mt-2 text-sm text-gray-500">Sem análise por enquanto.</p>
      ) : (
        <div className="mt-2 space-y-2 text-sm">
          <p>{data.summary}</p>
          {data.alerts.map((a) => (
            <p key={a} className="text-red-700">⚠ {a}</p>
          ))}
          <p className="text-green-800">💡 {data.tip}</p>
        </div>
      )}
    </section>
  );
}
