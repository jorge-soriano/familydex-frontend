import type { Task } from '../api';
import { useCompleteTask } from '../hooks/useTasks';

const TYPE_LABEL: Record<string, string> = {
  hogar: '🏠 Hogar', deberes: '📚 Deberes',
  comportamiento: '⭐ Comportamiento', responsabilidad: '✅ Responsabilidad',
};
const STATUS_COLOR: Record<string, string> = {
  Pending: '#888', InReview: '#f59e0b', Approved: '#22c55e', Rejected: '#ef4444',
};
const STATUS_LABEL: Record<string, string> = {
  Pending: 'Pendiente', InReview: 'En revisión', Approved: 'Aprobada', Rejected: 'Rechazada',
};

interface Props {
  task: Task;
  showComplete?: boolean;
}

export default function TaskCard({ task, showComplete = false }: Props) {
  const complete = useCompleteTask();

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>{task.title}</span>
        <span style={{ ...styles.badge, background: STATUS_COLOR[task.status] }}>
          {STATUS_LABEL[task.status]}
        </span>
      </div>

      <div style={styles.meta}>
        <span style={styles.type}>{TYPE_LABEL[task.type] ?? task.type}</span>
        <span style={styles.reward}>🪙 {task.coinsReward}</span>
        <span style={styles.reward}>⭐ {task.xpReward} XP</span>
        {task.dueDate && <span style={styles.due}>📅 {task.dueDate}</span>}
      </div>

      {task.description && <p style={styles.desc}>{task.description}</p>}

      {task.status === 'Rejected' && task.rejectionReason && (
        <p style={styles.rejection}>❌ {task.rejectionReason}</p>
      )}

      {showComplete && task.status === 'Pending' && (
        <button
          style={styles.btn}
          disabled={complete.isPending}
          onClick={() => complete.mutate(task.id)}
        >
          {complete.isPending ? 'Enviando…' : 'Marcar como completada'}
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1rem', marginBottom: '0.75rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  title: { fontWeight: 700, fontSize: '1rem' },
  badge: { color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12 },
  meta: { display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', flexWrap: 'wrap' },
  type: { background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 },
  reward: {},
  due: { color: '#94a3b8' },
  desc: { fontSize: '0.85rem', color: '#666', margin: '0.25rem 0' },
  rejection: { fontSize: '0.85rem', color: '#ef4444', background: '#fef2f2', padding: '0.4rem', borderRadius: 4 },
  btn: {
    marginTop: '0.5rem', padding: '0.4rem 1rem', background: '#3b82f6',
    color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
  },
};
