import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { todayInput } from '../../lib/format';
import { suggestCategory } from '../ai/api';
import { DateField, SelectField } from '../../components/fields';
import { SparkIcon, XIcon } from '../../components/icons';
import { overlay, panel } from '../../components/motion';
import { useAccounts, useCategories, useCreateTransaction, useUpdateTransaction } from './hooks';
import type { Transaction } from './api';

const schema = z.object({
  description: z.string().min(1, 'Obrigatório').max(140),
  amount: z.coerce.number().positive('Deve ser > 0'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Obrigatório'),
  accountId: z.string().min(1, 'Escolha a conta'),
  categoryId: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function TxModal({ initial, onClose }: { initial?: Transaction; onClose: () => void }) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const [suggesting, setSuggesting] = useState(false);
  const [suggestMsg, setSuggestMsg] = useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, control, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          type: initial.type,
          date: initial.date.slice(0, 10),
          description: initial.description,
          amount: initial.amount,
          accountId: initial.account.id,
          categoryId: initial.category?.id ?? '',
        }
      : { type: 'expense', date: todayInput() },
  });
  const selectedType = watch('type');
  const description = watch('description');
  const cats = (categories ?? []).filter((c) => c.type === selectedType);

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);

  const onSuggest = async () => {
    if (!description?.trim()) {
      setSuggestMsg('Descreva a transação primeiro.');
      return;
    }
    setSuggesting(true);
    setSuggestMsg(null);
    try {
      const s = await suggestCategory(description, selectedType);
      if (s.categoryId) {
        setValue('categoryId', s.categoryId);
        setSuggestMsg(`Sugestão: ${s.categoryName} (${Math.round(s.confidence * 100)}%)`);
      } else {
        setSuggestMsg('Sem sugestão — escolha manualmente.');
      }
    } catch {
      setSuggestMsg('IA indisponível no momento.');
    } finally {
      setSuggesting(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (initial) {
      await update.mutateAsync({
        id: initial.id,
        data: { ...data, categoryId: data.categoryId || null },
      });
    } else {
      await create.mutateAsync({ ...data, categoryId: data.categoryId || undefined });
    }
    onClose();
  });
  const saving = create.isPending || update.isPending;
  const failed = create.isError || update.isError;

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
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-3 rounded-t-lg bg-white p-6 shadow-pop sm:rounded-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{initial ? 'Editar transação' : 'Nova transação'}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 text-muted hover:text-ink">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex rounded-lg bg-brand-100/70 p-1" role="tablist" aria-label="Tipo">
          {(['expense', 'income'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={selectedType === v}
              onClick={() => setValue('type', v)}
              className={`seg flex-1 ${selectedType === v ? 'seg-active' : ''}`}
            >
              {v === 'expense' ? 'Despesa' : 'Receita'}
            </button>
          ))}
        </div>
        <input placeholder="Descrição (ex: iFood)" className="field w-full" {...register('description')} />
        <input type="number" step="0.01" min="0" placeholder="0,00" className="field w-full font-display text-lg" {...register('amount')} />
        <div className="flex gap-2">
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DateField value={field.value} onChange={field.onChange} ariaLabel="Data da transação" maxDate={new Date()} />
            )}
          />
          <Controller
            name="accountId"
            control={control}
            render={({ field }) => (
              <div className="flex-1">
                <SelectField
                  options={(accounts ?? []).map((a) => ({ value: a.id, label: a.name }))}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Conta…"
                  aria-label="Conta"
                />
              </div>
            )}
          />
        </div>
        <div className="flex gap-2">
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <div className="flex-1">
                <SelectField
                  options={cats.map((c) => ({ value: c.id, label: c.name, color: c.color }))}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Categoria…"
                  aria-label="Categoria"
                  isClearable
                />
              </div>
            )}
          />
          <button
            type="button"
            onClick={onSuggest}
            disabled={suggesting}
            title="Sugerir categoria com IA"
            aria-label="Sugerir categoria com IA"
            className="btn-ghost flex items-center gap-1.5 disabled:opacity-50"
          >
            <SparkIcon className="h-4 w-4" />
            {suggesting ? '…' : 'IA'}
          </button>
        </div>
        {suggestMsg && <p className="text-xs text-muted">{suggestMsg}</p>}
        {(formState.errors.description || formState.errors.amount || formState.errors.accountId) && (
          <p className="text-xs text-red-600">Verifique descrição, valor e conta.</p>
        )}
        {failed && <p className="text-xs text-red-600">Falha ao salvar. Tente de novo.</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </motion.form>
    </motion.div>
  );
}
