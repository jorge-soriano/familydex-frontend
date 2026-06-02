import { Link, Outlet, useNavigate } from 'react-router-dom';
import BalanceBar from '../../features/economy/components/BalanceBar';
import { useAuthStore } from '../../features/auth/hooks/useAuthStore';
import { authApi } from '../../features/auth/api';

export default function ChildLayout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    authApi.logout().catch(() => {});
    clearAuth();
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.nav}>
        <span style={styles.brand}>FamilyDex</span>
        <div style={styles.links}>
          <Link to="/child/tasks"   style={styles.link}>Tareas</Link>
          <Link to="/child/pokemon" style={styles.link}>Pokémon</Link>
          <Link to="/child/rewards" style={styles.link}>Tienda</Link>
          <Link to="/child/economy" style={styles.link}>Historial</Link>
        </div>
        <button style={styles.logout} onClick={handleLogout}>Salir</button>
      </nav>
      <BalanceBar />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' },
  nav: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    background: '#1a1a2e', color: '#fff', padding: '0 1.5rem', height: 52,
  },
  brand: { fontWeight: 800, fontSize: '1.1rem', marginRight: '1rem' },
  links: { display: 'flex', gap: '0.25rem', flex: 1 },
  link: { color: '#cbd5e1', textDecoration: 'none', padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.9rem' },
  logout: { marginLeft: 'auto', padding: '0.3rem 0.75rem', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' },
  main: { flex: 1, padding: '0' },
};
