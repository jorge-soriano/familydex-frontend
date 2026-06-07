import { Link, useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useAdmin';
import { SPRITE_STATIC_URL } from '../../pokemon/api';
import { c } from '../../../styles/tokens';
import ChildAvatar from '../../../shared/components/ChildAvatar';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';
import type { ChildSummary } from '../api';

export default function Dashboard() {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();
  const isDesktop = useWindowWidth() >= 1024;

  if (isLoading) return <p className="p-8">Cargando dashboard…</p>;

  const children: ChildSummary[] = data?.children ?? [];
  const totalInReview        = data?.totalInReview ?? 0;
  const totalPendingRequests = data?.totalPendingRequests ?? 0;
  const childrenInReview           = children.filter((ch) => ch.pendingReviewCount > 0);
  const childrenWithRewardRequests = children.filter((ch) => ch.pendingRewardRequestCount > 0);

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Panel familiar</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? '280px 1fr' : '1fr',
        gap: '1.5rem',
      }}>

        {/* ── Columna 1: Acciones requeridas ──────────────────────────── */}
        <div style={styles.card}>
          <div style={styles.colHeader}>
            {totalInReview > 0 || totalPendingRequests > 0 ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.danger, display: 'inline-block', flexShrink: 0 }} />
                Acciones requeridas
              </span>
            ) : (
              <span>Todo en orden ✓</span>
            )}
          </div>

          {totalInReview === 0 && totalPendingRequests === 0 ? (
            <div style={styles.allGood}>
              Sin pendientes. ¡El equipo está al día!
            </div>
          ) : (
            <div style={styles.actionList}>
              {childrenInReview.map((child) => (
                <Link key={`task-${child.id}`} to="/admin/tasks" style={styles.actionRow}>
                  <ChildAvatar displayName={child.displayName} avatarColor={child.avatarColor} size={32} />
                  <div style={styles.actionInfo}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{child.displayName}</span>
                    <span style={{ fontSize: '0.75rem', color: c.body }}>
                      {child.pendingReviewCount} tarea{child.pendingReviewCount !== 1 ? 's' : ''} por revisar
                    </span>
                  </div>
                  <span style={styles.actionCta}>Revisar →</span>
                </Link>
              ))}

              {childrenWithRewardRequests.map((child) => (
                <Link key={`reward-${child.id}`} to="/admin/rewards" style={{ ...styles.actionRow, borderLeft: `3px solid ${c.accent}` }}>
                  <ChildAvatar displayName={child.displayName} avatarColor={child.avatarColor} size={32} />
                  <div style={styles.actionInfo}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{child.displayName}</span>
                    <span style={{ fontSize: '0.75rem', color: c.body }}>
                      {child.pendingRewardRequestCount} solicitud{child.pendingRewardRequestCount !== 1 ? 'es' : ''} de recompensa
                    </span>
                  </div>
                  <span style={{ ...styles.actionCta, color: c.accent }}>Ver →</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Columna 2: Hijos ─────────────────────────────────────────── */}
        <div style={styles.card}>
          <div style={styles.colHeader}>Hijos</div>

          {children.length === 0 ? (
            <p style={{ color: c.caption, fontSize: '0.875rem', margin: 0, padding: '1rem 0' }}>
              No hay hijos registrados todavía.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={{ ...styles.th, width: 1, textAlign: 'right', whiteSpace: 'nowrap' }}>🪙</th>
                    <th style={{ ...styles.th, width: 1, textAlign: 'right', whiteSpace: 'nowrap' }}>⭐ XP</th>
                    <th style={{ ...styles.th, width: 1, padding: '0.5rem 0 0.5rem 0.5rem' }}>{/* sprite */}</th>
                    <th style={{ ...styles.th, width: 1, whiteSpace: 'nowrap' }}>Pokémon</th>
                  </tr>
                </thead>
                <tbody>
                  {children.map((child) => (
                    <tr
                      key={child.id}
                      style={styles.tr}
                      onClick={() => navigate(`/admin/children/${child.id}`)}
                    >
                      <td style={styles.td}>
                        <Link
                          to={`/admin/children/${child.id}`}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ChildAvatar displayName={child.displayName} avatarColor={child.avatarColor} size={28} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{child.displayName}</div>
                            <div style={{ fontSize: '0.72rem', color: c.caption }}>@{child.username}</div>
                          </div>
                        </Link>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', color: c.warningMid }}>
                        {child.coins}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', color: c.primary }}>
                        {child.xp}
                      </td>
                      {/* sprite — columna estrecha sin padding derecho */}
                      <td style={{ ...styles.td, padding: '0.6rem 0 0.6rem 0.5rem' }}>
                        {child.activePokemon && (
                          <div style={{ width: 40, height: 40, flexShrink: 0 }}>
                            <img
                              src={SPRITE_STATIC_URL(child.activePokemon.pokedexNumber)}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        )}
                      </td>
                      {/* nombre + nivel — sin padding izquierdo para pegarse al sprite */}
                      <td style={{ ...styles.td, padding: '0.6rem 0.5rem 0.6rem 0.3rem' }}>
                        {child.activePokemon ? (
                          <>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{child.activePokemon.name}</div>
                            <div style={{ fontSize: '0.7rem', color: c.caption }}>Nv. {child.activePokemon.level}</div>
                          </>
                        ) : (
                          <span style={{ color: c.caption, fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 'clamp(1rem, 4vw, 1.5rem)', maxWidth: 1200, margin: '0 auto' },
  h2:   { fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', marginTop: 0 },

  card: {
    background: c.surface,
    borderRadius: 12,
    padding: '1.25rem',
    boxShadow: c.shadowCard,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },

  colHeader: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: c.heading,
    paddingBottom: '0.5rem',
    borderBottom: `1px solid ${c.stroke}`,
    marginBottom: '0.25rem',
  },

  allGood: {
    background: c.successSubtle,
    color: c.successDark,
    borderRadius: 8,
    padding: '0.75rem',
    fontSize: '0.85rem',
    fontWeight: 600,
  },

  actionList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },

  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.6rem 0.75rem',
    background: c.subtle,
    borderRadius: 8,
    textDecoration: 'none',
    color: 'inherit',
    borderLeft: `3px solid ${c.warning}`,
    cursor: 'pointer',
  },

  actionInfo: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },

  actionCta: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: c.warningMid,
    flexShrink: 0,
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.875rem',
  },

  th: {
    padding: '0.5rem 0.5rem',
    fontWeight: 700,
    fontSize: '0.72rem',
    color: c.caption,
    textAlign: 'left' as const,
    borderBottom: `1px solid ${c.stroke}`,
  },

  tr: {
    cursor: 'pointer',
    borderBottom: `1px solid ${c.subtle}`,
    transition: 'background 0.1s',
  },

  td: {
    padding: '0.6rem 0.5rem',
    verticalAlign: 'middle' as const,
  },

};
