import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { brl, currentMonth, todayInput } from '../lib/format';
import { suggestCategory } from '../features/ai/api';
import { useAccounts, useCategories, useCreateTransaction, useDeleteTransaction, useTransactions } from '../features/transactions/hooks';

const schema = z.object({
  description: z.string().min(1, 'Obrigatório').max(140),
  amount: z.coerce.number().positive('Deve ser > 0'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Obrigatório'),
  accountId: z.string().min(1, 'Escolha a conta'),
  categoryId: z.string().optional(),
});

type Form = z.infer<typeof schema>;

const input = 'w-full rounded-lg border px-3 py-2 text-sm';

export default function TransactionsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [type, setType] = useState('');
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useTransactions({ month, type: type || undefined });
  const del = useDeleteTransaction();

  const income = (data?.data ?? []).filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = (data?.data ?? []).filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold">Transações</h1>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border px-2 py-1.5 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border px-2 py-1.5 text-sm">
          <option value="">Todas</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <button onClick={() => setOpen(true)} className="ml-auto rounded-lg bg-black px-4 py-1.5 text-sm text-white">
          + Nova
        </button>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        <span className="text-green-700">Receitas: {brl(income)}</span>
        <span className="text-red-700">Despesas: {brl(expense)}</span>
        <span className="font-semibold">Saldo: {brl(income - expense)}</span>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-gray-500">Carregando…</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2">Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Conta</th>
              <th className="text-right">Valor</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data?.data ?? []).map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-2">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td>{t.description}</td>
                <td>
                  {t.category ? (
                    <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: `${t.category.color}22`, color: t.category.color }}>
                      {t.category.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="text-gray-600">{t.account.name}</td>
                <td className={`text-right font-medium ${t.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                  {t.type === 'income' ? '+' : '−'}{brl(t.amount)}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => del.mutate(t.id)}
                    className="text-xs text-gray-400 hover:text-red-600"
                    title="Excluir"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data?.data.length === 0 && <p className="mt-6 text-sm text-gray-500">Nada por aqui neste mês.</p>}
      {open && <TxModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function TxModal({ onClose }: { onClose: () => void }) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const create = useCreateTransaction();
  const [suggesting, setSuggesting] = useState(false);
  const [suggestMsg, setSuggestMsg] = useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'expense', date: todayInput() },
  });
  const selectedType = watch('type');
  const description = watch('description');
  const cats = (categories ?? []).filter((c) => c.type === selectedType);

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
    await create.mutateAsync({ ...data, categoryId: data.categoryId || undefined });
    onClose();
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-3 rounded-xl bg-white p-6">
        <h2 className="font-bold">Nova transação</h2>
        <input placeholder="Descrição (ex: iFood)" className={input} {...register('description')} />
        <div className="flex gap-2">
          <input type="number" step="0.01" placeholder="0,00" className={input} {...register('amount')} />
          <select className={input} {...register('type')}>
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input type="date" className={input} {...register('date')} />
          <select className={input} {...register('accountId')} defaultValue="">
            <option value="" disabled>Conta…</option>
            {(accounts ?? []).map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <select className={`${input} flex-1`} {...register('categoryId')} defaultValue="">
            <option value="">Sem categoria</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onSuggest}
            disabled={suggesting}
            title="Sugerir categoria com IA"
            className="rounded-lg border px-3 text-sm disabled:opacity-50"
          >
            {suggesting ? '…' : '✨'}
          </button>
        </div>
        {suggestMsg && <p className="text-xs text-gray-500">{suggestMsg}</p>}
        {(formState.errors.description || formState.errors.amount || formState.errors.accountId) && (
          <p className="text-xs text-red-600">Verifique descrição, valor e conta.</p>
        )}
        {create.isError && <p className="text-xs text-red-600">Falha ao salvar.</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button>
          <button type="submit" disabled={create.isPending} className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50">
            {create.isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
