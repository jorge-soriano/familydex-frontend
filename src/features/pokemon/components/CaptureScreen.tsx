import { useAvailableToCapture, useCapture } from '../hooks/usePokemon';
import { useBalance } from '../../economy/hooks/useEconomy';
import PokemonSprite from './PokemonSprite';
import TypeBadge from './TypeBadge';

export default function CaptureScreen() {
  const { data: available = [], isLoading } = useAvailableToCapture();
  const { data: balance } = useBalance();
  const capture = useCapture();

  const childXp           = balance?.xp ?? 0;
  const pendingCaptures   = balance?.pendingCaptures ?? 0;

  // Split into unlocked (child has enough XP) and locked (not yet)
  const unlocked = available.filter((p) => p.unlockXp <= childXp);
  const locked   = available.filter((p) => p.unlockXp > childXp);

  return (
    <div style={styles.page}>
      {pendingCaptures > 0 ? (
        <div style={styles.banner}>
          🎯 Tienes <strong>{pendingCaptures}</strong>{' '}
          {pendingCaptures === 1 ? 'captura disponible' : 'capturas disponibles'}
        </div>
      ) : (
        <div style={styles.noCap}>
          Completa tareas para ganar XP y desbloquear capturas.<br />
          Cada <strong>5 000 XP</strong> ganas una nueva captura.
        </div>
      )}

      {isLoading && <p>Cargando…</p>}

      {!isLoading && available.length === 0 && (
        <p style={styles.empty}>¡Tienes todos los Pokémon disponibles!</p>
      )}

      {/* ── Disponibles para capturar ────────────────────────────────────── */}
      {unlocked.length > 0 && (
        <>
          <h3 style={styles.sectionTitle}>Disponibles</h3>
          <div style={styles.grid}>
            {unlocked.map((p) => (
              <div key={p.id} style={styles.card}>
                <PokemonSprite pokedexNumber={p.pokedexNumber} size={80} alt={p.name} />
                <strong style={styles.name}>{p.name}</strong>
                <div style={styles.types}>
                  <TypeBadge type={p.type1} />
                  {p.type2 && <TypeBadge type={p.type2} />}
                </div>
                <span style={styles.xpTag}>🔓 {p.unlockXp.toLocaleString()} XP</span>
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
        </>
      )}

      {/* ── Próximos — bloqueados hasta acumular más XP ───────────────────── */}
      {locked.length > 0 && (
        <>
          <h3 style={{ ...styles.sectionTitle, color: '#94a3b8', marginTop: unlocked.length ? '1.5rem' : 0 }}>
            Próximos desbloqueables
          </h3>
          <div style={styles.grid}>
            {locked.map((p) => (
              <div key={p.id} style={{ ...styles.card, opacity: 0.55 }}>
                <div style={{ position: 'relative' }}>
                  <PokemonSprite pokedexNumber={p.pokedexNumber} size={80} alt={p.name} />
                  <span style={styles.lock}>🔒</span>
                </div>
                <strong style={styles.name}>{p.name}</strong>
                <div style={styles.types}>
                  <TypeBadge type={p.type1} />
                  {p.type2 && <TypeBadge type={p.type2} />}
                </div>
                <span style={styles.xpNeeded}>
                  Faltan {(p.unlockXp - childXp).toLocaleString()} XP
                </span>
              </div>
            ))}
          </div>
        </>
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
  banner: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#1d4ed8' },
  noCap: { background: '#f8fafc', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#64748b', fontSize: '0.9rem' },
  sectionTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#475569', margin: '0 0 0.75rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  name: { fontSize: '0.9rem' },
  types: { display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' },
  xpTag: { fontSize: '0.72rem', color: '#22c55e', fontWeight: 700 },
  xpNeeded: { fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 },
  lock: { position: 'absolute', top: 0, right: 0, fontSize: '1rem' },
  btn: { padding: '0.35rem 0.75rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  empty: { color: '#94a3b8', textAlign: 'center', padding: '2rem' },
  error: { color: '#ef4444', marginTop: '1rem', textAlign: 'center' },
};
