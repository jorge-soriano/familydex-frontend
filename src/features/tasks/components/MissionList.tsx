import { useTasks } from '../hooks/useTasks';
import MissionCard from './MissionCard';
import type { Task } from '../api';
import type { TaskStatus } from '../../../shared/types';

const SECTIONS: { status: TaskStatus; label: string; emoji: string; emptyText: string }[] = [
  { status: 'Pending',  label: 'Por hacer',           emoji: '🎯', emptyText: '¡Todo al día! No tienes misiones pendientes.' },
  { status: 'Rejected', label: 'Inténtalo de nuevo',  emoji: '💪', emptyText: '' },
  { status: 'InReview', label: 'Esperando revisión',  emoji: '⏳', emptyText: '' },
  { status: 'Approved', label: 'Completadas',          emoji: '✅', emptyText: '' },
];

export default function MissionList() {
  const { data: tasks = [], isLoading } = useTasks();

  if (isLoading) return <p style={{ padding: '2rem', color: '#94a3b8' }}>Cargando misiones…</p>;

  const byStatus = (status: TaskStatus): Task[] => tasks.filter((t) => t.status === status);
  const total = tasks.length;

  return (
    <div style={{ padding: '1.25rem', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Mis misiones</h2>
        {total > 0 && (
          <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
            {total}
          </span>
        )}
      </div>

      {total === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>🌟</p>
          <p style={{ fontWeight: 700, margin: 0 }}>¡No tienes misiones asignadas!</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Tu padre/madre te asignará misiones pronto.</p>
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
