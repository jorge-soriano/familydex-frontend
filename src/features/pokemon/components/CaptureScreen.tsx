import { useAvailableToCapture, useCapture } from '../hooks/usePokemon';
import { useBalance } from '../../economy/hooks/useEconomy';
import PokemonSprite from './PokemonSprite';
import TypeBadge from './TypeBadge';

export default function CaptureScreen() {
  const { data: available = [], isLoading } = useAvailableToCapture();
  const { data: balance } = useBalance();
  const capture = useCapture();

  const pendingCaptures = balance?.pendingCaptures ?? 0;

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Capturar Pokémon</h2>

      {pendingCaptures > 0 ? (
        <div style={styles.banner}>
          🎯 Tienes <strong>{pendingCaptures}</strong> {pendingCaptures === 1 ? 'captura disponible' : 'capturas disponibles'}
        </div>
      ) : (
        <div style={styles.noCap}>
          Necesitas más XP para capturar un nuevo Pokémon.<br />
          Cada 5 000 XP ganas una captura.
        </div>
      )}

      {isLoading ? <p>Cargando…</p> : (
        <div style={styles.grid}>
          {available.length === 0 && (
            <p style={styles.empty}>No hay Pokémon disponibles para capturar todavía.</p>
          )}
          {available.map((p) => (
            <div key={p.id} style={styles.card}>
              <PokemonSprite pokedexNumber={p.pokedexNumber} size={80} alt={p.name} />
              <strong>{p.name}</strong>
              <div style={styles.types}>
                <TypeBadge type={p.type1} />
                {p.type2 && <TypeBadge type={p.type2} />}
              </div>
              <span style={styles.xpReq}>🔓 {p.unlockXp.toLocaleString()} XP</span>
              <button
                style={{ ...styles.btn, opacity: pendingCaptures > 0 ? 1 : 0.4 }}
                disabled={pendingCaptures === 0 || capture.isPending}
                onClick={() => capture.mutate(p.id)}
              >
                ¡Capturar!
              </button>
            </div>
          ))}
        </div>
      )}

      {capture.isError && (
        <p style={styles.error}>
          {(capture.error as any)?.response?.data?.message ?? 'Error al capturar'}
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: 800, margin: '0 auto' },
  h2: { fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' },
  banner: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#1d4ed8' },
  noCap: { background: '#f8fafc', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#64748b', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  types: { display: 'flex', gap: '0.3rem' },
  xpReq: { fontSize: '0.75rem', color: '#64748b' },
  btn: { padding: '0.35rem 0.75rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  empty: { color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' },
  error: { color: '#ef4444', marginTop: '1rem', textAlign: 'center' },
};
