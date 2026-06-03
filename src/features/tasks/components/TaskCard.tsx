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
   * 'child'  — vista del niño: tarjeta grande, botón "¡He terminado!", mensajes de estado
   * 'admin'  — vista compacta para el panel del administrador (ChildDetail)
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
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{task.title}</span>
          <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: STATUS_COLOR[task.status] }}>
            {STATUS_LABEL[task.status]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#555', flexWrap: 'wrap' }}>
          <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>{TYPE_LABEL[task.type] ?? task.type}</span>
          <span>🪙 {task.coinsReward}</span>
          <span>⭐ {task.xpReward} XP</span>
          {task.dueDate && <span style={{ color: '#94a3b8' }}>📅 {task.dueDate}</span>}
        </div>
        {task.description && <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.5rem 0 0' }}>{task.description}</p>}
        {isRejected && task.rejectionReason && (
          <p style={{ fontSize: '0.85rem', color: '#ef4444', background: '#fef2f2', padding: '0.4rem', borderRadius: 4, margin: '0.5rem 0 0' }}>
            ❌ {task.rejectionReason}
          </p>
        )}
      </div>
    );
  }

  // ── Child interactive variant ──────────────────────────────────────────────
  const borderColor = isPending ? '#3b82f6' : isReview ? '#f59e0b' : isApproved ? '#22c55e' : '#ef4444';

  return (
    <div style={{ background: '#fff', borderRadius: 14, borderLeft: `5px solid ${borderColor}`, padding: '1.1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{task.title}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 5 }}>
          {TYPE_LABEL[task.type] ?? task.type}
        </span>
        {task.description && (
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{task.description}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#475569' }}>
        <span>🪙 <strong>{task.coinsReward}</strong> monedas</span>
        <span>⭐ <strong>{task.xpReward}</strong> XP</span>
      </div>

      {(isPending || isRejected) && task.xpReward > 0 && (
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600 }}>
          🎮 Tu Pokémon ganará {task.xpReward} XP al completarse
        </p>
      )}

      {isReview && (
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#d97706', fontWeight: 600 }}>
          ⏳ Esperando que tu padre/madre lo revise…
        </p>
      )}

      {isApproved && (
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#16a34a', fontWeight: 700 }}>
          ✅ ¡Tarea completada!
        </p>
      )}

      {isRejected && task.rejectionReason && (
        <div style={{ background: '#fef3c7', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#92400e', fontWeight: 600 }}>💪 Casi, falta esto:</p>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: '#78350f' }}>{task.rejectionReason}</p>
        </div>
      )}

      {isPending && (
        <button
          style={{ padding: '0.65rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 800, cursor: 'pointer', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          disabled={complete.isPending}
          onClick={() => complete.mutate(task.id)}
        >
          {complete.isPending ? 'Enviando…' : '🙋 ¡He terminado!'}
        </button>
      )}

      {isRejected && !task.rejectionReason && (
        <button
          style={{ padding: '0.55rem 1rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
          disabled={complete.isPending}
          onClick={() => complete.mutate(task.id)}
        >
          🔄 Intentarlo de nuevo
        </button>
      )}
    </div>
  );
}
