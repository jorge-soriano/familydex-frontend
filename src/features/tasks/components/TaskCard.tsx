import type { Task } from '../api';
import { useCompleteTask } from '../hooks/useTasks';

const TYPE_LABEL: Record<string, string> = {
  hogar:           '🏠 Hogar',
  deberes:         '📚 Deberes',
  comportamiento:  '⭐ Comportamiento',
  responsabilidad: '✅ Responsabilidad',
};

interface Props {
  task: Task;
  /**
   * 'child'  — compact interactive card for child view
   * 'admin'  — compact read-only card used in admin ChildDetail
   */
  variant?: 'child' | 'admin';
}

export default function TaskCard({ task, variant = 'admin' }: Props) {
  const complete   = useCompleteTask();
  const isPending  = task.status === 'Pending';
  const isReview   = task.status === 'InReview';
  const isApproved = task.status === 'Approved';
  const isRejected = task.status === 'Rejected';

  // ── Compact admin variant ──────────────────────────────────────────────────
  if (variant === 'admin') {
    const STATUS_COLOR: Record<string, string> = {
      Pending: '#888', InReview: '#f59e0b', Approved: '#22c55e', Rejected: '#ef4444',
    };
    const STATUS_LABEL: Record<string, string> = {
      Pending: 'Pendiente', InReview: 'En revisión', Approved: 'Aprobada', Rejected: 'Rechazada',
    };

    return (
      <div style={s.adminCard}>
        <div style={s.adminHeader}>
          <span style={s.adminTitle}>{task.title}</span>
          <span style={{ ...s.adminBadge, background: STATUS_COLOR[task.status] }}>
            {STATUS_LABEL[task.status]}
          </span>
        </div>
        <div style={s.adminMeta}>
          <span style={s.typePill}>{TYPE_LABEL[task.type] ?? task.type}</span>
          <span>🪙 {task.coinsReward}</span>
          <span>⭐ {task.xpReward} XP</span>
          {task.dueDate && <span style={{ color: '#94a3b8' }}>📅 {task.dueDate}</span>}
        </div>
        {task.description && <p style={s.adminDesc}>{task.description}</p>}
        {isRejected && task.rejectionReason && (
          <p style={s.adminRejection}>❌ {task.rejectionReason}</p>
        )}
      </div>
    );
  }

  // ── Child compact interactive variant ────────────────────────────────────
  const borderColor = isPending ? '#3b82f6' : isReview ? '#f59e0b' : isApproved ? '#22c55e' : '#ef4444';

  return (
    <div style={{ ...s.childCard, borderLeftColor: borderColor }}>

      {/* Row 1: title + rewards */}
      <div style={s.childRow}>
        <span style={s.childTitle}>{task.title}</span>
        <span style={s.childRewards}>🪙 {task.coinsReward} · ⭐ {task.xpReward}</span>
      </div>

      {/* Row 2: type + optional description */}
      <div style={s.childMeta}>
        <span style={s.typePill}>{TYPE_LABEL[task.type] ?? task.type}</span>
        {task.description && <span style={s.childDesc}>{task.description}</span>}
      </div>

      {/* State messages */}
      {isReview && (
        <p style={s.stateReview}>⏳ Esperando revisión…</p>
      )}

      {isApproved && (
        <p style={s.stateApproved}>✅ ¡Completada!</p>
      )}

      {isRejected && task.rejectionReason && (
        <div style={s.rejectionBox}>
          <p style={s.rejectionTitle}>💪 Casi, falta esto:</p>
          <p style={s.rejectionText}>{task.rejectionReason}</p>
        </div>
      )}

      {/* Action button */}
      {isPending && (
        <button style={s.completeBtn} disabled={complete.isPending}
          onClick={() => complete.mutate(task.id)}>
          {complete.isPending ? 'Enviando…' : '🙋 ¡He terminado!'}
        </button>
      )}

      {isRejected && !task.rejectionReason && (
        <button style={{ ...s.completeBtn, background: '#f59e0b' }}
          disabled={complete.isPending}
          onClick={() => complete.mutate(task.id)}>
          🔄 Intentarlo de nuevo
        </button>
      )}
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────
const typePill: React.CSSProperties = {
  fontSize: '0.7rem', background: '#f1f5f9', color: '#64748b',
  padding: '1px 7px', borderRadius: 4, whiteSpace: 'nowrap' as const,
};

// ── Admin styles ──────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  adminCard:      { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '0.6rem' },
  adminHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' },
  adminTitle:     { fontWeight: 700, fontSize: '0.9rem' },
  adminBadge:     { color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 },
  adminMeta:      { display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: '#555', flexWrap: 'wrap' },
  adminDesc:      { fontSize: '0.82rem', color: '#666', margin: '0.35rem 0 0' },
  adminRejection: { fontSize: '0.82rem', color: '#ef4444', background: '#fef2f2', padding: '0.3rem 0.5rem', borderRadius: 4, margin: '0.35rem 0 0' },

  // child card — compact grid card, similar to reward cards
  // justify-content: space-between pushes the button to the bottom when
  // cards in the same grid row have different heights
  childCard: {
    background: '#fff', borderRadius: 8,
    borderLeft: '4px solid #3b82f6',
    padding: '0.65rem 0.85rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: '0.3rem',
    justifyContent: 'space-between',
  },
  childRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' },
  childTitle:   { fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', flex: 1, minWidth: 0 },
  childRewards: { fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' as const, flexShrink: 0 },
  childMeta:    { display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' },
  childDesc:    { fontSize: '0.75rem', color: '#94a3b8' },

  stateReview:   { margin: 0, fontSize: '0.75rem', color: '#d97706', fontWeight: 600 },
  stateApproved: { margin: 0, fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 },

  rejectionBox:  { background: '#fef9c3', borderRadius: 6, padding: '0.35rem 0.6rem' },
  rejectionTitle:{ margin: 0, fontSize: '0.75rem', color: '#92400e', fontWeight: 600 },
  rejectionText: { margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#78350f' },

  completeBtn: {
    padding: '0.45rem 0.75rem', background: '#3b82f6', color: '#fff',
    border: 'none', borderRadius: 7, fontSize: '0.85rem', fontWeight: 700,
    cursor: 'pointer', marginTop: 'auto',  // stick to bottom in grid
  },

  typePill,
};
