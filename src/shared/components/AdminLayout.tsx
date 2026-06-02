import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/hooks/useAuthStore';
import { authApi } from '../../features/auth/api';
import { useNotifications } from '../../features/admin/hooks/useAdmin';
import { useWindowWidth } from '../hooks/useWindowWidth';

function NavBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span style={{
      background: '#ef4444', color: '#fff', fontSize: '0.65rem',
      fontWeight: 800, padding: '1px 5px', borderRadius: 10,
      marginLeft: '4px', verticalAlign: 'middle', lineHeight: 1.4,
    }}>
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

export default function AdminLayout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { data: notif } = useNotifications();
  const isNarrow = useWindowWidth() < 640;
  const [open, setOpen] = useState(false);
  const links = LINKS(notif);

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    clearAuth();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* Barra de navegación */}
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        background: '#1e3a5f', color: '#fff',
        padding: '0 1rem', height: 52,
        position: 'sticky', top: 0, zIndex: 50,
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 800, fontSize: '1.05rem', flexShrink: 0 }}>FamilyDex Admin</span>

        {/* Links — solo en pantallas anchas */}
        {!isNarrow && (
          <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
            {links.map(({ to, label, badge }) => (
              <Link key={to} to={to} style={{ color: '#cbd5e1', textDecoration: 'none', padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.9rem' }}>
                {label}<NavBadge count={badge} />
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isNarrow && (
            <button style={{ padding: '0.3rem 0.75rem', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}
              onClick={handleLogout}>Salir</button>
          )}
          {isNarrow && (
            <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', padding: '0.25rem 0.4rem', lineHeight: 1, borderRadius: 4 }}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setOpen(o => !o)}>
              {open ? '✕' : '☰'}
            </button>
          )}
        </div>
      </nav>

      {/* Menú desplegable móvil */}
      {isNarrow && open && (
        <div style={{ background: '#162d4a', borderBottom: '1px solid #1e3a5f', zIndex: 49 }}>
          {links.map(({ to, label, badge }) => (
            <Link key={to} to={to}
              style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1.25rem', color: '#e2e8f0', textDecoration: 'none', fontSize: '0.95rem', borderBottom: '1px solid #1e3a5f20' }}
              onClick={() => setOpen(false)}>
              {label}<NavBadge count={badge} />
            </Link>
          ))}
          <button
            style={{ display: 'block', width: '100%', padding: '0.85rem 1.25rem', background: 'transparent', border: 'none', color: '#94a3b8', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem' }}
            onClick={handleLogout}>
            Salir
          </button>
        </div>
      )}

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
