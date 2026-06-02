import { useTasks } from '../hooks/useTasks';
import MissionCard from './MissionCard';
import type { Task } from '../api';
import type { TaskStatus } from '../../../shared/types';

// Solo mostramos las tareas activas (Pending = por hacer, InReview = esperando)
// Las rechazadas vuelven automáticamente a Pending con motivo de rechazo visible.
// Las aprobadas se ven en Actividad (historial de transacciones).
const SECTIONS: { status: TaskStatus; label: string; emoji: string }[] = [
  { status: 'Pending',  label: 'Por hacer',          emoji: '🎯' },
  { status: 'InReview', label: 'Esperando revisión', emoji: '⏳' },
];

export default function MissionList() {
  const { data: tasks = [], isLoading } = useTasks();

  if (isLoading) return <p style={{ padding: '2rem', color: '#94a3b8' }}>Cargando tareas…</p>;

  // Active tasks = Pending (includes previously-rejected ones, now back to Pending) + InReview
  const activeTasks = tasks.filter((t) => t.status === 'Pending' || t.status === 'InReview');
  const byStatus    = (status: TaskStatus): Task[] => activeTasks.filter((t) => t.status === status);

  return (
    <div style={{ padding: '1.25rem', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Mis tareas</h2>
        {activeTasks.length > 0 && (
          <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
            {activeTasks.length}
          </span>
        )}
      </div>

      {activeTasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>🌟</p>
          <p style={{ fontWeight: 700, margin: 0 }}>¡Todo al día!</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>No tienes tareas pendientes.</p>
        </div>
      )}

      {SECTIONS.map(({ status, label, emoji }) => {
        const group = byStatus(status);
        if (!group.length) return null;
        return (
          <section key={status} style={{ marginBottom: '1.75rem' }}>
            <h3 style={{
              fontSize: '0.85rem', fontWeight: 700, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              {emoji} {label} ({group.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {group.map((t) => <MissionCard key={t.id} task={t} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
