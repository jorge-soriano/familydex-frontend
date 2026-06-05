import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ClipboardList, Sword, ShoppingBag, BarChart2 } from 'lucide-react';
import BalanceBar from '../../features/activity/components/BalanceBar';
import { useAuthStore } from '../../features/auth/hooks/useAuthStore';
import { authApi } from '../../features/auth/api';
import { useWindowWidth } from '../hooks/useWindowWidth';
import BottomNav from './BottomNav';

const LINKS = [
  { to: '/child/tasks',   label: 'Tareas',    Icon: ClipboardList },
  { to: '/child/pokemon', label: 'Pokémon',   Icon: Sword         },
  { to: '/child/rewards', label: 'Tienda',    Icon: ShoppingBag   },
  { to: '/child/economy', label: 'Actividad', Icon: BarChart2     },
];

const BOTTOM_NAV = [
  { to: '/child/tasks',   icon: <ClipboardList size={18} />, label: 'Tareas'    },
  { to: '/child/pokemon', icon: <Sword         size={18} />, label: 'Pokémon'   },
  { to: '/child/rewards', icon: <ShoppingBag   size={18} />, label: 'Tienda'    },
  { to: '/child/economy', icon: <BarChart2     size={18} />, label: 'Actividad' },
];

export default function ChildLayout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const isNarrow = useWindowWidth() < 640;

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
            {LINKS.map(({ to, label, Icon }) => (
              <Link key={to} to={to}
                className="text-slate-300 no-underline px-3 py-[0.3rem] rounded-md text-[0.9rem] flex items-center gap-[0.3rem]">
                <Icon size={14} />{label}
              </Link>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            className="py-[0.3rem] px-3 bg-transparent text-caption border border-slate-600 rounded-md cursor-pointer text-[0.85rem]"
            onClick={handleLogout}>Salir</button>
        </div>
      </nav>

      <BalanceBar />

      <main className={`flex-1 ${isNarrow ? 'pb-[60px]' : ''}`}>
        <Outlet />
      </main>

      {isNarrow && <BottomNav items={BOTTOM_NAV} />}
    </div>
  );
}
