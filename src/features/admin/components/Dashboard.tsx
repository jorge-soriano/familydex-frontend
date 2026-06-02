import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useAdmin';
import { SPRITE_STATIC_URL } from '../../pokemon/api';

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <p style={styles.loading}>Cargando dashboard…</p>;

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Dashboard familiar</h2>

      {/* Action alerts */}
      <div style={styles.alerts}>
        {(data?.totalInReview ?? 0) > 0 && (
          <Link to="/admin/tasks?status=InReview" style={{display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f59e0b', color: '#fff', padding: '1rem 1.5rem', borderRadius: 10, textDecoration: 'none', fontWeight: 600}}>
            <span style={styles.alertNum}>{data!.totalInReview}</span>
            <span>tarea{data!.totalInReview !== 1 ? 's' : ''} en revisión</span>
            <span style={styles.alertAction}>Revisar →</span>
          </Link>
        )}
        {(data?.totalPendingRequests ?? 0) > 0 && (
          <Link to="/admin/rewards" style={{display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#6366f1', color: '#fff', padding: '1rem 1.5rem', borderRadius: 10, textDecoration: 'none', fontWeight: 600}}>
            <span style={styles.alertNum}>{data!.totalPendingRequests}</span>
            <span>solicitud{data!.totalPendingRequests !== 1 ? 'es' : ''} pendiente{data!.totalPendingRequests !== 1 ? 's' : ''}</span>
            <span style={styles.alertAction}>Ver →</span>
          </Link>
        )}
        {!data?.totalInReview && !data?.totalPendingRequests && (
          <div style={styles.allGood}>✅ Todo al día — no hay acciones pendientes</div>
        )}
      </div>

      {/* Child cards */}
      <h3 style={styles.h3}>Resumen de hijos</h3>
      <div style={styles.grid}>
        {data?.children.length === 0 && (
          <p style={styles.empty}>No hay hijos registrados todavía.</p>
        )}
        {data?.children.map((child) => (
          <Link key={child.id} to={`/admin/children/${child.id}`} style={styles.childCard}>
            <div style={{ ...styles.avatar, background: child.avatarColor ?? '#6366f1' }}>
              {child.displayName.charAt(0).toUpperCase()}
            </div>

            <div style={styles.childInfo}>
              <strong style={styles.childName}>{child.displayName}</strong>
              <span style={styles.username}>@{child.username}</span>
            </div>

            <div style={styles.stats}>
              <span>🪙 {child.coins}</span>
              <span>⭐ {child.xp} XP</span>
            </div>

            {child.activePokemon ? (
              <div style={styles.pokemon}>
                <img
                  src={SPRITE_STATIC_URL(child.activePokemon.pokedexNumber)}
                  alt={child.activePokemon.name}
                  width={48} height={48}
                  style={{ imageRendering: 'pixelated' }}
                />
                <div>
                  <div style={styles.pokeName}>{child.activePokemon.name}</div>
                  <div style={styles.pokeLevel}>Nv. {child.activePokemon.level}</div>
                </div>
              </div>
            ) : (
              <div style={styles.noPokemon}>Sin Pokémon</div>
            )}

            {child.pendingReviewCount > 0 && (
              <div style={styles.reviewBadge}>
                {child.pendingReviewCount} en revisión
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}


const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: 900, margin: '0 auto' },
  h2: { fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.25rem' },
  h3: { fontSize: '1.1rem', fontWeight: 700, margin: '1.5rem 0 0.75rem', color: '#475569' },
  loading: { padding: '2rem' },
  alerts: { display: 'flex', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' },
  alertNum: { fontSize: '1.75rem', fontWeight: 800 },
  alertAction: { marginLeft: 'auto', opacity: 0.85, fontSize: '0.9rem' },
  allGood: { background: '#f0fdf4', color: '#166534', padding: '0.75rem 1.25rem', borderRadius: 8, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  childCard: {
    background: '#fff', borderRadius: 12, padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textDecoration: 'none', color: 'inherit',
    display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'box-shadow 0.15s',
  },
  avatar: { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.25rem' },
  childInfo: { display: 'flex', flexDirection: 'column' },
  childName: { fontSize: '1.05rem' },
  username: { fontSize: '0.8rem', color: '#94a3b8' },
  stats: { display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#475569' },
  pokemon: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  pokeName: { fontWeight: 700, fontSize: '0.85rem' },
  pokeLevel: { fontSize: '0.75rem', color: '#64748b' },
  noPokemon: { fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' },
  reviewBadge: { background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 12, width: 'fit-content' },
  empty: { color: '#94a3b8', gridColumn: '1/-1' },
};

// Inline style factory needs to be callable
