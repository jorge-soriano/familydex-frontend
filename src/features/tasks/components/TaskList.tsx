import { useTasks } from '../hooks/useTasks';
import TaskCard from './TaskCard';
import type { Task } from '../api';
import type { TaskStatus } from '../../../shared/types';

const SECTIONS: { status: TaskStatus; label: string }[] = [
  { status: 'Pending',  label: 'Pendientes' },
  { status: 'InReview', label: 'En revisión' },
  { status: 'Approved', label: 'Aprobadas' },
  { status: 'Rejected', label: 'Rechazadas' },
];

export default function TaskList() {
  const { data: tasks = [], isLoading } = useTasks();

  if (isLoading) return <p>Cargando tareas…</p>;

  const byStatus = (status: TaskStatus): Task[] =>
    tasks.filter((t) => t.status === status);

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Mis tareas</h2>
      {SECTIONS.map(({ status, label }) => {
        const group = byStatus(status);
        if (!group.length) return null;
        return (
          <section key={status} style={styles.section}>
            <h3 style={styles.h3}>{label} ({group.length})</h3>
            {group.map((t) => (
              <TaskCard key={t.id} task={t} showComplete />
            ))}
          </section>
        );
      })}
      {tasks.length === 0 && <p style={styles.empty}>No tienes tareas asignadas.</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: 700, margin: '0 auto' },
  h2: { fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' },
  section: { marginBottom: '1.5rem' },
  h3: { fontSize: '1rem', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.75rem' },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: '3rem' },
};
