import { useBalance } from '../hooks/useActivity';
import HistoryList from './HistoryList';

export default function ChildActivityPage() {
  const { data: balance } = useBalance();

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Mi actividad</h2>

      <div style={styles.cards}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Monedas</p>
          <p style={styles.cardValue}>🪙 {balance?.coins ?? '—'}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>XP total</p>
          <p style={styles.cardValue}>⭐ {balance?.xp ?? '—'}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Pokémon disponibles</p>
          <p style={styles.cardValue}>
            {balance?.caughtCount ?? 0} / {balance?.maxPokemon ?? 0}
          </p>
        </div>
      </div>

      <HistoryList />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: 700, margin: '0 auto' },
  h2: { fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' },
  cards: { display: 'flex', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' },
  card: { background: '#fff', borderRadius: 10, padding: '1rem 1.5rem', flex: 1, minWidth: 140, textAlign: 'center' },
  cardLabel: { margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 },
  cardValue: { margin: 0, fontSize: '1.5rem', fontWeight: 800 },
};
