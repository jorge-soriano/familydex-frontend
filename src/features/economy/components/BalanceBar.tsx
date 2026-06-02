import { Link } from 'react-router-dom';
import { useBalance } from '../hooks/useEconomy';

export default function BalanceBar() {
  const { data: balance } = useBalance();

  return (
    <div style={styles.bar}>
      <span style={styles.stat}>🪙 <strong>{balance?.coins ?? '—'}</strong></span>
      <span style={styles.stat}>⭐ <strong>{balance?.xp ?? '—'}</strong> XP</span>
      {(balance?.pendingCaptures ?? 0) > 0 && (
        <Link to="/child/pokemon?tab=capturar" style={styles.capture}>
          🎯 {balance!.pendingCaptures} Pokémon por capturar
        </Link>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex', gap: '1.5rem', alignItems: 'center',
    background: '#1a1a2e', color: '#fff',
    padding: '0.5rem 1.5rem', fontSize: '0.9rem',
  },
  stat: { display: 'flex', alignItems: 'center', gap: '0.3rem' },
  capture: {
    marginLeft: 'auto', background: '#f59e0b', color: '#fff',
    padding: '0.25rem 0.75rem', borderRadius: 12, fontWeight: 700,
    fontSize: '0.8rem', textDecoration: 'none',
  },
};
