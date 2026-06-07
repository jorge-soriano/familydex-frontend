import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useAdmin';
import { SPRITE_STATIC_URL } from '../../pokemon/api';
import { c } from '../../../styles/tokens';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Dashboard() {
  const { data, isLoading } = useDashboard();
  const isDesktop = useWindowWidth() >= 768;

  if (isLoading) return <p className="p-8">Cargando dashboard…</p>;

  const hasActions =
    (data?.totalInReview ?? 0) + (data?.totalPendingRequests ?? 0) > 0;
  const actionChildren = (data?.children ?? []).filter(
    (ch) => ch.pendingReviewCount > 0,
  );
  const sortedChildren = [...(data?.children ?? [])].sort(
    (a, b) => b.xp - a.xp,
  );

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 1.5rem)', maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>
        Dashboard familiar
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? '280px 1fr' : '1fr',
        gap: '1.25rem',
        alignItems: 'start',
      }}>

        {/* ── Columna 1: Cola de acción ─────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={styles.colLabel}>Cola de acción</p>

          {!hasActions && (
            <div style={{ background: c.successSubtle, color: c.successDark, padding: '0.75rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem' }}>
              ✅ Todo al día — nada pendiente
            </div>
          )}

          {actionChildren.map((child) => (
            <Link key={child.id} to="/admin/tasks" style={{ ...styles.actionRow, borderLeft: `3px solid ${c.warning}` }}>
              <div style={{ ...styles.avatar, background: child.avatarColor ?? c.accent }}>
                {child.displayName.charAt(0).toUpperCase()}
              </div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                {child.displayName}
              </span>
              <span style={{ background: c.warningSubtle, color: c.warningDark, fontWeight: 700, fontSize: '0.72rem', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                {child.pendingReviewCount} tarea{child.pendingReviewCount !== 1 ? 's' : ''}
              </span>
            </Link>
          ))}

          {(data?.totalPendingRequests ?? 0) > 0 && (
            <Link to="/admin/rewards" style={{ ...styles.actionRow, borderLeft: `3px solid ${c.accent}` }}>
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🎁</span>
              <span style={{ flex: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                Recompensas
              </span>
              <span style={{ background: c.accentSubtle, color: c.accent, fontWeight: 700, fontSize: '0.72rem', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                {data!.totalPendingRequests} solicitud{data!.totalPendingRequests !== 1 ? 'es' : ''}
              </span>
            </Link>
          )}
        </div>

        {/* ── Columna 2: Jugadores ──────────────────────────────────────── */}
        <div>
          <p style={styles.colLabel}>Jugadores</p>
          <div style={{ background: c.surface, borderRadius: 10, boxShadow: c.shadowCard, overflow: 'hidden' }}>
            {sortedChildren.length === 0 && (
              <p style={{ padding: '1.5rem', color: c.caption, margin: 0 }}>
                No hay hijos registrados todavía.
              </p>
            )}
            {sortedChildren.map((child, idx) => (
              <Link
                key={child.id}
                to={`/admin/children/${child.id}`}
                className="card-interactive"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.85rem 1rem', textDecoration: 'none', color: 'inherit',
                  borderBottom: idx < sortedChildren.length - 1 ? `1px solid ${c.subtle}` : 'none',
                }}>

                <span style={{ width: 24, textAlign: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                  {idx < 3 ? MEDAL[idx] : String(idx + 1)}
                </span>

                <div style={{ ...styles.avatar, background: child.avatarColor ?? c.accent }}>
                  {child.displayName.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{child.displayName}</div>
                  <div style={{ fontSize: '0.75rem', color: c.caption }}>@{child.username}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
                  <span style={{ background: c.warningSubtle, color: c.warningDark, fontWeight: 700, fontSize: '0.78rem', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                    🪙 {child.coins}
                  </span>
                  <span style={{ background: c.accentSubtle, color: c.accent, fontWeight: 700, fontSize: '0.78rem', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                    ⭐ {child.xp} XP
                  </span>
                </div>

                {child.activePokemon && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                    <img
                      src={SPRITE_STATIC_URL(child.activePokemon.pokedexNumber)}
                      alt={child.activePokemon.name}
                      width={36}
                      height={36}
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{child.activePokemon.name}</div>
                      <div style={{ fontSize: '0.7rem', color: c.caption }}>Nv. {child.activePokemon.level}</div>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  colLabel:  { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.body, margin: '0 0 0.5rem' },
  actionRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', background: c.surface, borderRadius: 8, padding: '0.65rem 0.75rem', textDecoration: 'none', color: 'inherit', boxShadow: c.shadowSm },
  avatar:    { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.surface, fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 },
};
