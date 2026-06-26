import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/Button';

interface Props {
  variant: 'login' | 'register';
}

const GHOST_ACTIVE: React.CSSProperties = {
  padding: '0.42rem 1rem', fontSize: '0.82rem', borderRadius: 8,
  color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.18)',
};

const GHOST_INACTIVE: React.CSSProperties = {
  padding: '0.42rem 1rem', fontSize: '0.82rem', borderRadius: 8,
  color: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.08)',
  cursor: 'default',
};

const PRIMARY: React.CSSProperties = {
  padding: '0.42rem 1rem', fontSize: '0.82rem', borderRadius: 8,
};

export default function AuthNav({ variant }: Props) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', height: 60,
      background: 'rgba(15,23,42,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <Link
        to="/"
        style={{ textDecoration: 'none', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}
      >
        FamilyDex
      </Link>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {/* Entrar */}
        {variant === 'login' ? (
          <Button variant="ghost" disabled style={GHOST_INACTIVE}>Entrar</Button>
        ) : (
          <Link to="/login">
            <Button variant="ghost" style={GHOST_ACTIVE}>Entrar</Button>
          </Link>
        )}

        {/* Crear cuenta */}
        {variant === 'register' ? (
          <Button disabled style={{ ...PRIMARY, opacity: 0.35, cursor: 'default' }}>Crear cuenta</Button>
        ) : (
          <Link to="/register">
            <Button style={PRIMARY}>Crear cuenta</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
