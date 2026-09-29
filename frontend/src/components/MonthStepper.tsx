import { monthLabel, shiftMonth } from '../lib/format';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface Props {
  value: string;
  onChange: (month: string) => void;
  dark?: boolean;
}

export default function MonthStepper({ value, onChange, dark }: Props) {
  const btn = dark
    ? 'rounded-lg p-1.5 text-brand-100 transition hover:bg-white/10 hover:text-white'
    : 'rounded-lg p-1.5 text-muted transition hover:bg-brand-100 hover:text-ink';
  return (
    <div
      className={`flex items-center gap-0.5 rounded-lg p-1 ${dark ? 'bg-white/10' : 'bg-white shadow-card'}`}
      role="group"
      aria-label="Navegar entre meses"
    >
      <button onClick={() => onChange(shiftMonth(value, -1))} aria-label="Mês anterior" className={btn}>
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <span className="min-w-36 px-1 text-center font-display text-base font-semibold capitalize">
        {monthLabel(value)}
      </span>
      <button onClick={() => onChange(shiftMonth(value, 1))} aria-label="Próximo mês" className={btn}>
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
