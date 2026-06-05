import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import BalanceBar from '../../features/activity/components/BalanceBar';
import { useAuthStore } from '../../features/auth/hooks/useAuthStore';
import { authApi } from '../../features/auth/api';
import { useWindowWidth } from '../hooks/useWindowWidth';

const LINKS = [
  { to: '/child/tasks',   label: '📋 Tareas'    },
  { to: '/child/pokemon', label: '🎮 Pokémon'   },
  { to: '/child/rewards', label: '🏪 Tienda'    },
  { to: '/child/economy', label: '📊 Actividad' },
];

export default function ChildLayout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const isNarrow = useWindowWidth() < 640;
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">

      {/* Barra de navegación */}
      <nav className="flex items-center gap-4 bg-night text-white px-4 h-[52px] sticky top-0 z-50 shrink-0">
        <span className="font-extrabold text-[1.05rem] shrink-0">FamilyDex</span>

        {!isNarrow && (
          <div className="flex gap-1 flex-1">
            {LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className="text-slate-300 no-underline px-3 py-[0.3rem] rounded-md text-[0.9rem]">
                {label}
              </Link>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {!isNarrow && (
            <button
              className="py-[0.3rem] px-3 bg-transparent text-caption border border-slate-600 rounded-md cursor-pointer text-[0.85rem]"
              onClick={handleLogout}>Salir</button>
          )}
          {isNarrow && (
            <button
              className="bg-transparent border-none text-white text-[1.4rem] cursor-pointer py-1 px-[0.4rem] leading-none rounded"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setOpen(o => !o)}>
              {open ? '✕' : '☰'}
            </button>
          )}
        </div>
      </nav>

      {/* Menú desplegable móvil */}
      {isNarrow && open && (
        <div className="bg-gray-900 border-b border-night/20 z-[49]">
          {LINKS.map(({ to, label }) => (
            <Link key={to} to={to}
              className="block py-[0.85rem] px-5 text-slate-200 no-underline text-[0.95rem] border-b border-white/10"
              onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <button
            className="block w-full py-[0.85rem] px-5 bg-transparent border-none text-caption text-left cursor-pointer text-[0.95rem]"
            onClick={handleLogout}>
            Salir
          </button>
        </div>
      )}

      <BalanceBar />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
