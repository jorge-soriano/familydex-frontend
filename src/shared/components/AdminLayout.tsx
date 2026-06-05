import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/hooks/useAuthStore';
import { authApi } from '../../features/auth/api';
import { useNotifications } from '../../features/admin/hooks/useAdmin';
import { useWindowWidth } from '../hooks/useWindowWidth';
import BottomNav from './BottomNav';

function NavBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="bg-danger text-white font-extrabold rounded-[10px] ml-1 align-middle leading-[1.4]"
      style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
      {count}
    </span>
  );
}

const LINKS = (notif?: { inReview: number; pendingRequests: number }) => [
  { to: '/admin/dashboard', label: 'Dashboard',  badge: 0 },
  { to: '/admin/tasks',     label: 'Tareas',      badge: notif?.inReview ?? 0 },
  { to: '/admin/economy',   label: 'Actividad',   badge: 0 },
  { to: '/admin/rewards',   label: 'Tienda',      badge: notif?.pendingRequests ?? 0 },
  { to: '/admin/children',  label: 'Hijos',       badge: 0 },
];

const BOTTOM_NAV = (notif?: { inReview: number; pendingRequests: number }) => [
  { to: '/admin/dashboard', icon: '🏠', label: 'Inicio',    badge: 0 },
  { to: '/admin/tasks',     icon: '📋', label: 'Tareas',    badge: notif?.inReview ?? 0 },
  { to: '/admin/economy',   icon: '📊', label: 'Actividad', badge: 0 },
  { to: '/admin/rewards',   icon: '🏪', label: 'Tienda',    badge: notif?.pendingRequests ?? 0 },
  { to: '/admin/children',  icon: '👦', label: 'Hijos',     badge: 0 },
];

export default function AdminLayout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { data: notif } = useNotifications();
  const isNarrow = useWindowWidth() < 640;
  const [open, setOpen] = useState(false);
  const links = LINKS(notif);
  const bottomItems = BOTTOM_NAV(notif);

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">

      {/* Barra de navegación */}
      <nav className="flex items-center gap-4 bg-navy text-white px-4 h-[52px] sticky top-0 z-50 shrink-0">
        <span className="font-extrabold text-[1.05rem] shrink-0">FamilyDex Admin</span>

        {/* Links — solo en pantallas anchas */}
        {!isNarrow && (
          <div className="flex gap-1 flex-1">
            {links.map(({ to, label, badge }) => (
              <Link key={to} to={to}
                className="text-slate-300 no-underline px-3 py-[0.3rem] rounded-md text-[0.9rem]">
                {label}<NavBadge count={badge} />
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

      <main className={`flex-1 ${isNarrow ? 'pb-[60px]' : ''}`}>
        <Outlet />
      </main>

      {isNarrow && <BottomNav items={bottomItems} />}
    </div>
  );
}
