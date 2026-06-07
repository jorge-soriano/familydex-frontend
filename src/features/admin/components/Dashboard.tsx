import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useAdmin';
import { SPRITE_STATIC_URL } from '../../pokemon/api';
import { c } from '../../../styles/tokens';
import { Badge } from '../../../shared/components/Badge';

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <p className="p-8">Cargando dashboard…</p>;

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Dashboard familiar</h2>

      {/* Action alerts */}
      {(data?.totalInReview ?? 0) > 0 || (data?.totalPendingRequests ?? 0) > 0 ? (
        <div style={styles.alertSection}>
          <p style={styles.alertTitle}>Acciones pendientes</p>
          <div style={styles.alerts}>
            {(data?.totalInReview ?? 0) > 0 && (
              <Link to="/admin/tasks" style={styles.alertCard}>
                <span style={styles.alertNum}>{data!.totalInReview}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Tarea{data!.totalInReview !== 1 ? 's' : ''} por revisar</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>El niño espera tu aprobación</div>
                </div>
                <span aria-hidden="true" style={styles.alertAction}>Revisar →</span>
              </Link>
            )}
            {(data?.totalPendingRequests ?? 0) > 0 && (
              <Link to="/admin/rewards" style={{ ...styles.alertCard, background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', boxShadow: '0 4px 16px rgba(139,92,246,0.40)' }}>
                <span style={styles.alertNum}>{data!.totalPendingRequests}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Solicitud{data!.totalPendingRequests !== 1 ? 'es' : ''} de recompensa</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Pendiente{data!.totalPendingRequests !== 1 ? 's' : ''} de aprobar o rechazar</div>
                </div>
                <span aria-hidden="true" style={styles.alertAction}>Ver →</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div style={{ background: c.successSubtle, color: c.successDark, padding: '0.75rem 1.25rem', borderRadius: 8, fontWeight: 600, marginBottom: '1.5rem' }}>
          ✅ Todo al día — no hay acciones pendientes
        </div>
      )}

      {/* Child cards */}
      <h3 style={styles.h3}>Resumen de hijos</h3>
      <div style={styles.grid}>
        {data?.children.length === 0 && (
          <p className="text-caption" style={{ gridColumn: '1/-1' }}>No hay hijos registrados todavía.</p>
        )}
        {data?.children.map((child) => (
          <Link key={child.id} to={`/admin/children/${child.id}`} className="card-interactive" style={styles.childCard}>
            <div aria-hidden="true" style={{ ...styles.avatar, background: child.avatarColor ?? c.accent }}>
              {child.displayName.charAt(0).toUpperCase()}
            </div>

            <div style={styles.childInfo}>
              <strong style={styles.childName}>{child.displayName}</strong>
              <span className="text-caption" style={{ fontSize: '0.8rem' }}>@{child.username}</span>
            </div>

            <div style={styles.stats}>
              <span>🪙 {child.coins}</span>
              <span>⭐ {child.xp} XP</span>
            </div>

            {child.activePokemon ? (
              <div style={styles.pokemon}>
                <img src={SPRITE_STATIC_URL(child.activePokemon.pokedexNumber)} alt={child.activePokemon.name} width={48} height={48} style={{ imageRendering: 'pixelated' }} />
                <div>
                  <div style={styles.pokeName}>{child.activePokemon.name}</div>
                  <div className="text-body" style={{ fontSize: '0.75rem' }}>Nv. {child.activePokemon.level}</div>
                </div>
              </div>
            ) : (
              <div className="text-caption italic" style={{ fontSize: '0.8rem' }}>Sin Pokémon</div>
            )}

            {child.pendingReviewCount > 0 && (
              <Badge variant="warning" subtle>{child.pendingReviewCount} en revisión</Badge>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:      { padding: 'clamp(1rem, 4vw, 1.5rem)', maxWidth: 1200, margin: '0 auto' },
  h2:        { fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' },
  h3:          { fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.75rem', color: c.body },
  alertSection:{ marginBottom: '1.5rem' },
  alertTitle:  { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: c.body, margin: '0 0 0.6rem' },
  alerts:      { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const },
  alertCard:   { display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: c.surface, padding: '1.25rem 1.5rem', borderRadius: 14, textDecoration: 'none', fontWeight: 600, flex: 1, minWidth: 220, boxShadow: '0 4px 16px rgba(245,158,11,0.40)', borderTop: '4px solid rgba(255,255,255,0.45)' },
  alertNum:    { fontSize: '2.4rem', fontWeight: 800, lineHeight: 1, flexShrink: 0 },
  alertAction: { marginLeft: 'auto', opacity: 0.85, fontSize: '0.85rem', flexShrink: 0 },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  childCard: { background: c.surface, borderRadius: 10, padding: '1.25rem', boxShadow: c.shadowCard, textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  avatar:    { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.surface, fontWeight: 800, fontSize: '1.25rem' },
  childInfo: { display: 'flex', flexDirection: 'column' },
  childName: { fontSize: '1.05rem' },
  stats:     { display: 'flex', gap: '1rem', fontSize: '0.9rem', color: c.body },
  pokemon:   { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  pokeName:  { fontWeight: 700, fontSize: '0.85rem' },
};
