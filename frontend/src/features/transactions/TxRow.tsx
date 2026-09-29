import { brl } from '../../lib/format';
import { DownIcon, PencilIcon, UpIcon, XIcon } from '../../components/icons';
import type { Transaction } from './api';

interface Props {
  tx: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TxRow({ tx: t, onEdit, onDelete }: Props) {
  const isIn = t.type === 'income';
  return (
    <li className="group flex items-center gap-3 px-3 py-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isIn ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-700'}`}
      >
        {isIn ? <UpIcon className="h-5 w-5" /> : <DownIcon className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{t.description}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <span>{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{t.account.name}</span>
          {t.category && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: t.category.color }} />
                {t.category.name}
              </span>
            </>
          )}
        </p>
      </div>
      <span className={`shrink-0 font-display text-sm font-semibold ${isIn ? 'text-emerald-700' : 'text-ink'}`}>
        {isIn ? '+' : '−'}{brl(t.amount)}
      </span>
      <div className="flex shrink-0 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
        <button
          onClick={onEdit}
          aria-label={`Editar ${t.description}`}
          className="rounded-lg p-1.5 text-muted transition hover:text-brand-700 focus:opacity-100"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          aria-label={`Excluir ${t.description}`}
          className="rounded-lg p-1.5 text-muted transition hover:text-red-600 focus:opacity-100"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
