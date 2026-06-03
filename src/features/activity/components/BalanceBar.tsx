import { Link } from 'react-router-dom';
import { useBalance } from '../hooks/useActivity';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';

export default function BalanceBar() {
  const { data: balance } = useBalance();
  const isNarrow = useWindowWidth() < 480;
  const pending  = balance?.pendingCaptures ?? 0;

  return (
    <div style={{
      display: 'flex', gap: isNarrow ? '0.75rem' : '1.5rem', alignItems: 'center',
      background: '#1a1a2e', color: '#fff',
      padding: isNarrow ? '0.4rem 1rem' : '0.5rem 1.5rem',
      fontSize: isNarrow ? '0.82rem' : '0.9rem',
      flexShrink: 0,
    }}>
      <span>🪙 <strong>{balance?.coins ?? '—'}</strong></span>
      <span>⭐ <strong>{balance?.xp ?? '—'}</strong> XP</span>

      {pending > 0 && (
        <Link to="/child/pokemon?tab=capturar" style={{
          marginLeft: 'auto',
          background: '#f59e0b', color: '#fff',
          padding: isNarrow ? '0.2rem 0.6rem' : '0.25rem 0.75rem',
          borderRadius: 12, fontWeight: 700,
          fontSize: isNarrow ? '0.72rem' : '0.8rem',
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          🎯 {isNarrow ? pending : `${pending} Pokémon por capturar`}
        </Link>
      )}
    </div>
  );
}
