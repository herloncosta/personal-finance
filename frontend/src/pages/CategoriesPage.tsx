import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory, listCategories } from '../features/categories/api';
import { PlusIcon, XIcon } from '../components/icons';

const COLORS = ['#820ad1', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#64748b'];

export default function CategoriesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: listCategories });
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [color, setColor] = useState(COLORS[0]);

  const refresh = () => qc.invalidateQueries({ queryKey: ['categories'] });
  const create = useMutation({
    mutationFn: () => createCategory({ name, type, color }),
    onSuccess: () => {
      setName('');
      refresh();
    },
  });
  const del = useMutation({ mutationFn: deleteCategory, onSuccess: refresh });

  const group = (t: string) => (data ?? []).filter((c) => c.type === t);

  return (
    <div>
      <h1 className="font-display text-xl font-bold">Categorias</h1>
      <p className="mt-1 text-sm text-muted">Organize receitas e despesas do seu jeito.</p>

      <form
        className="card mt-4 flex flex-wrap items-center gap-2 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nova categoria" aria-label="Nome da categoria" className="field min-w-[10rem] flex-1" />
        <div className="flex rounded-lg bg-brand-100/70 p-1" role="tablist" aria-label="Tipo">
          {(['expense', 'income'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={type === v}
              onClick={() => setType(v)}
              className={`seg ${type === v ? 'seg-active' : ''}`}
            >
              {v === 'expense' ? 'Despesa' : 'Receita'}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5" role="radiogroup" aria-label="Cor">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-lg transition ${color === c ? 'ring-2 ring-brand-700 ring-offset-2 ring-offset-white' : 'hover:scale-110'}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <button className="btn-primary inline-flex items-center gap-1.5" disabled={create.isPending}>
          <PlusIcon className="h-4 w-4" />
          {create.isPending ? 'Adicionando…' : 'Adicionar'}
        </button>
      </form>

      {isLoading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-lg bg-white" />
          <div className="h-40 animate-pulse rounded-lg bg-white" />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ['Despesas', 'expense'],
              ['Receitas', 'income'],
            ] as const
          ).map(([label, t]) => (
            <section key={t} className="card p-5">
              <h2 className="font-display text-[15px] font-semibold">{label}</h2>
              <ul className="mt-3 space-y-1.5">
                {group(t).map((c) => (
                  <li key={c.id} className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-brand-50">
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: c.color }} />
                    <span className="flex-1 text-sm font-medium">{c.name}</span>
                    <button
                      onClick={() => del.mutate(c.id)}
                      aria-label={`Excluir ${c.name}`}
                      className="rounded-lg p-1 text-muted opacity-0 transition hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {group(t).length === 0 && <li className="text-sm text-muted">Nenhuma categoria.</li>}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
