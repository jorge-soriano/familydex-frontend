import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import BalanceBar from '../../features/economy/components/BalanceBar';
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* Barra de navegación */}
      <nav style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        background: '#1a1a2e', color: '#fff',
        padding: '0 1rem', height: 52,
        position: 'sticky', top: 0, zIndex: 50,
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 800, fontSize: '1.05rem', flexShrink: 0 }}>FamilyDex</span>

        {!isNarrow && (
          <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
            {LINKS.map(({ to, label }) => (
              <Link key={to} to={to} style={{ color: '#cbd5e1', textDecoration: 'none', padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.9rem' }}>
                {label}
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
        <div style={{ background: '#111827', borderBottom: '1px solid #1a1a2e20', zIndex: 49 }}>
          {LINKS.map(({ to, label }) => (
            <Link key={to} to={to}
              style={{ display: 'block', padding: '0.85rem 1.25rem', color: '#e2e8f0', textDecoration: 'none', fontSize: '0.95rem', borderBottom: '1px solid #ffffff10' }}
              onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <button
            style={{ display: 'block', width: '100%', padding: '0.85rem 1.25rem', background: 'transparent', border: 'none', color: '#94a3b8', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem' }}
            onClick={handleLogout}>
            Salir
          </button>
        </div>
      )}

      <BalanceBar />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
