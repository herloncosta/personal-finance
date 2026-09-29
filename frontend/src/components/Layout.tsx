import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { HomeIcon, OutIcon, SwapIcon, TagIcon, WalletIcon } from './icons';

const items = [
  { to: '/', label: 'Início', Icon: HomeIcon, end: true },
  { to: '/transactions', label: 'Movimento', Icon: SwapIcon, end: false },
  { to: '/accounts', label: 'Contas', Icon: WalletIcon, end: false },
  { to: '/categories', label: 'Categorias', Icon: TagIcon, end: false },
];

const sideLink = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-brand-600 text-white shadow-card' : 'text-brand-100/80 hover:bg-white/10 hover:text-white'
  }`;

const tabLink = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition ${
    isActive ? 'text-brand-700' : 'text-muted'
  }`;

export default function Layout() {
  const { user, signOut } = useAuth();
  const initial = (user?.name ?? 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-64 shrink-0 flex-col self-start bg-brand-950 p-5 text-white md:sticky md:top-0 md:flex md:h-screen">
        <div className="flex items-center gap-2.5 px-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-display text-lg font-bold">
            F
          </span>
          <div>
            <p className="font-display text-[15px] font-semibold leading-tight">Personal Finance</p>
            <p className="text-xs text-brand-200">seu mês sob controle</p>
          </div>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {items.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={sideLink}>
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-lg bg-white/10 p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-300 font-display text-sm font-bold text-brand-950">
            {initial}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{user?.name}</span>
          <button
            onClick={signOut}
            title="Sair"
            aria-label="Sair"
            className="rounded-lg p-1.5 text-brand-100/80 transition hover:bg-white/10 hover:text-white"
          >
            <OutIcon className="h-5 w-5" />
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex items-center gap-2.5 border-b border-brand-100 bg-ground/90 px-4 py-3 backdrop-blur md:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-display text-base font-bold text-white">
            F
          </span>
          <p className="font-display text-[15px] font-semibold">Personal Finance</p>
          <button
            onClick={signOut}
            aria-label="Sair"
            className="ml-auto rounded-lg p-2 text-muted transition hover:text-ink"
          >
            <OutIcon className="h-5 w-5" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-8">
          <Outlet />
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-brand-100 bg-white/95 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur md:hidden">
          <div className="flex">
            {items.map(({ to, label, Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={tabLink}>
                {({ isActive }) => (
                  <>
                    <span className={`rounded-lg px-4 py-0.5 ${isActive ? 'bg-brand-100' : ''}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
