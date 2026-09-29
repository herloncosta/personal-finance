import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ACCOUNT_LABELS } from '../../lib/format';
import { SelectField } from '../../components/fields';
import { XIcon } from '../../components/icons';
import { overlay, panel } from '../../components/motion';
import { updateAccount, type Account } from './api';

interface Props {
  account: Account;
  onClose: () => void;
  onSaved: () => void;
}

export default function AccountEditModal({ account, onClose, onSaved }: Props) {
  const [name, setName] = useState(account.name);
  const [type, setType] = useState(account.type);
  const [balance, setBalance] = useState(String(account.balance));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);

  const moved = account.balance - account.initialBalance;
  const hasMovement = Math.abs(moved) > 0.004;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(balance);
    if (!name.trim() || !Number.isFinite(target)) {
      setError('Informe nome e saldo válidos.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateAccount(account.id, {
        name: name.trim(),
        type,
        initialBalance: Math.round((target - moved) * 100) / 100,
      });
      onSaved();
    } catch {
      setError('Falha ao salvar. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      variants={overlay}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-20 flex items-end justify-center bg-brand-950/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.form
        variants={panel}
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-3 rounded-t-lg bg-white p-6 shadow-pop sm:rounded-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Editar conta</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 text-muted hover:text-ink">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div>
          <label htmlFor="edit-name" className="text-sm font-medium">Nome</label>
          <input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="field mt-1 w-full" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="edit-balance" className="text-sm font-medium">Saldo atual</label>
            <input id="edit-balance" value={balance} onChange={(e) => setBalance(e.target.value)} type="number" step="0.01" className="field mt-1 w-full font-display text-lg" />
          </div>
          <div className="flex-1">
            <span id="edit-type-label" className="text-sm font-medium">Tipo</span>
            <div className="mt-1" role="group" aria-labelledby="edit-type-label">
              <SelectField
                options={Object.entries(ACCOUNT_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                value={type}
                onChange={setType}
                aria-label="Tipo de conta"
              />
            </div>
          </div>
        </div>
        {hasMovement && (
          <p className="text-xs text-muted">Esta conta tem lançamentos: o saldo inicial será recalculado para manter o saldo atual informado.</p>
        )}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </motion.form>
    </motion.div>
  );
}
