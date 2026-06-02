import { useCompleteTask } from '../hooks/useTasks';
import type { Task } from '../api';

const TYPE_LABEL: Record<string, string> = {
  hogar:           '🏠 Hogar',
  deberes:         '📚 Deberes',
  comportamiento:  '⭐ Comportamiento',
  responsabilidad: '✅ Responsabilidad',
};

interface Props { task: Task }

export default function MissionCard({ task }: Props) {
  const complete = useCompleteTask();
  const isPending  = task.status === 'Pending';
  const isReview   = task.status === 'InReview';
  const isApproved = task.status === 'Approved';
  const isRejected = task.status === 'Rejected';

  const borderColor = isPending ? '#3b82f6'
    : isReview   ? '#f59e0b'
    : isApproved ? '#22c55e'
    : '#ef4444';

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      borderLeft: `5px solid ${borderColor}`,
      padding: '1.1rem 1.25rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
    }}>
      {/* Título */}
      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>
        {task.title}
      </div>

      {/* Tipo + descripción */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 5 }}>
          {TYPE_LABEL[task.type] ?? task.type}
        </span>
        {task.description && (
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{task.description}</span>
        )}
      </div>

      {/* Recompensas */}
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#475569' }}>
        <span>🪙 <strong>{task.coinsReward}</strong> monedas</span>
        <span>⭐ <strong>{task.xpReward}</strong> XP</span>
      </div>

      {/* Pokémon XP hint (for pending/rejected) */}
      {(isPending || isRejected) && task.xpReward > 0 && (
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600 }}>
          🎮 Tu Pokémon ganará {task.xpReward} XP al completarse
        </p>
      )}

      {/* Estado específico */}
      {isReview && (
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#d97706', fontWeight: 600 }}>
          ⏳ Esperando que tu padre/madre lo revise…
        </p>
      )}

      {isApproved && (
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#16a34a', fontWeight: 700 }}>
          ✅ ¡Misión completada!
        </p>
      )}

      {isRejected && task.rejectionReason && (
        <div style={{ background: '#fef3c7', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#92400e', fontWeight: 600 }}>
            💪 Casi, falta esto:
          </p>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: '#78350f' }}>
            {task.rejectionReason}
          </p>
        </div>
      )}

      {/* Acción principal */}
      {isPending && (
        <button
          style={{
            padding: '0.65rem 1rem',
            background: '#3b82f6', color: '#fff',
            border: 'none', borderRadius: 10,
            fontSize: '1rem', fontWeight: 800,
            cursor: 'pointer', marginTop: '0.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          }}
          disabled={complete.isPending}
          onClick={() => complete.mutate(task.id)}
        >
          {complete.isPending ? 'Enviando…' : '🙋 ¡He terminado!'}
        </button>
      )}

      {isRejected && !task.rejectionReason && (
        <button
          style={{
            padding: '0.55rem 1rem',
            background: '#f59e0b', color: '#fff',
            border: 'none', borderRadius: 10,
            fontSize: '0.9rem', fontWeight: 700,
            cursor: 'pointer',
          }}
          disabled={complete.isPending}
          onClick={() => complete.mutate(task.id)}
        >
          🔄 Intentarlo de nuevo
        </button>
      )}
    </div>
  );
}
