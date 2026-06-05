import { useAvailableToCapture, useCapture } from '../hooks/usePokemon';
import { useBalance } from '../../activity/hooks/useActivity';
import PokemonSprite from './PokemonSprite';
import TypeBadge from './TypeBadge';
import { c } from '../../../styles/tokens';

export default function CaptureScreen() {
  const { data: available = [], isLoading } = useAvailableToCapture();
  const { data: balance } = useBalance();
  const capture = useCapture();

  const pendingCaptures = balance?.pendingCaptures ?? 0;

  return (
    <div style={styles.page}>
      {pendingCaptures > 0 ? (
        <div style={styles.banner}>
          🎯 Tienes <strong>{pendingCaptures}</strong>{' '}
          {pendingCaptures === 1 ? 'captura disponible' : 'capturas disponibles'}
        </div>
      ) : (
        <div style={styles.noCap}>
          Completa tareas para ganar XP y desbloquear nuevas capturas.<br />
          Cada <strong>5 000 XP</strong> ganas una captura adicional.
        </div>
      )}

      {isLoading && <p style={styles.loading}>Cargando…</p>}

      {!isLoading && available.length === 0 && (
        <p style={styles.empty}>¡Tienes todos los Pokémon disponibles! Gana más XP para desbloquear los siguientes.</p>
      )}

      {available.length > 0 && (
        <div style={styles.grid}>
          {available.map((p) => (
            <div key={p.id} style={styles.card}>
              <PokemonSprite pokedexNumber={p.pokedexNumber} size={80} alt={p.name} />
              <strong style={styles.name}>{p.name}</strong>
              <div style={styles.types}>
                <TypeBadge type={p.type1} />
                {p.type2 && <TypeBadge type={p.type2} />}
              </div>
              {p.unlockXp > 0 && (
                <span style={styles.xpTag}>🔓 {p.unlockXp.toLocaleString()} XP</span>
              )}
              <button
                style={{ ...styles.btn, opacity: pendingCaptures > 0 ? 1 : 0.45 }}
                disabled={pendingCaptures === 0 || capture.isPending}
                onClick={() => capture.mutate(p.id)}
              >
                {pendingCaptures > 0 ? '¡Capturar!' : 'Sin capturas'}
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
  page: { maxWidth: 800, margin: '0 auto', paddingTop: '0.25rem' },
  banner: { background: c.primarySubtle, border: `1px solid ${c.primaryLight}`, borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: c.primaryDark },
  noCap: { background: c.page, borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: c.body, fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: '1rem' },
  card: { background: c.surface, borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', boxShadow: c.shadowMd },
  name: { fontSize: '0.9rem' },
  types: { display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' },
  xpTag: { fontSize: '0.72rem', color: c.success, fontWeight: 700 },
  btn: { padding: '0.35rem 0.75rem', background: c.primary, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  loading: { color: c.caption },
  empty: { color: c.caption, textAlign: 'center', padding: '2rem', fontSize: '0.9rem' },
  error: { color: c.danger, marginTop: '1rem', textAlign: 'center' },
};
