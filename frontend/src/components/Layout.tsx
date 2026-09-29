import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`;

export default function Layout() {
  const { user, signOut } = useAuth();
  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="flex items-center justify-between gap-4">
        <nav className="flex gap-1">
          <NavLink to="/" className={link}>
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={link}>
            Transações
          </NavLink>
          <NavLink to="/accounts" className={link}>
            Contas
          </NavLink>
          <NavLink to="/categories" className={link}>
            Categorias
          </NavLink>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600">{user?.name}</span>
          <button onClick={signOut} className="underline">
            Sair
          </button>
        </div>
      </header>
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
