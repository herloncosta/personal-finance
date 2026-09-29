import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory, listCategories } from '../features/categories/api';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

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
      <h1 className="text-xl font-bold">Categorias</h1>

      <form
        className="mt-4 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nova categoria" className="rounded-lg border px-3 py-2 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full ${color === c ? 'ring-2 ring-black ring-offset-1' : ''}`}
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
        <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">+ Adicionar</button>
      </form>

      {isLoading ? (
        <p className="mt-6 text-sm text-gray-500">Carregando…</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {[
            ['Despesas', 'expense'],
            ['Receitas', 'income'],
          ].map(([label, t]) => (
            <div key={t}>
              <h2 className="text-sm font-semibold text-gray-500">{label}</h2>
              <ul className="mt-2 space-y-1">
                {group(t).map((c) => (
                  <li key={c.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                    <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                    <span className="flex-1">{c.name}</span>
                    <button onClick={() => del.mutate(c.id)} className="text-xs text-gray-400 hover:text-red-600">✕</button>
                  </li>
                ))}
                {group(t).length === 0 && <li className="text-sm text-gray-400">Nenhuma.</li>}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
