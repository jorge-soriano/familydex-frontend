import { useTasks } from '../hooks/useTasks';
import TaskCard from './TaskCard';
import type { Task } from '../api';
import type { TaskStatus } from '../../../shared/types';

const SECTIONS: { status: TaskStatus; label: string; emoji: string }[] = [
  { status: 'Pending',  label: 'Por hacer',          emoji: '🎯' },
  { status: 'InReview', label: 'Esperando revisión', emoji: '⏳' },
];

export default function TaskList() {
  const { data: tasks = [], isLoading } = useTasks();

  if (isLoading) return <p className="p-8 text-caption">Cargando tareas…</p>;

  const activeTasks = tasks.filter((t) => t.status === 'Pending' || t.status === 'InReview');
  const byStatus    = (status: TaskStatus): Task[] => activeTasks.filter((t) => t.status === status);

  return (
    <div className="px-5 py-5 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="m-0 text-[1.5rem] font-extrabold">Misiones activas</h2>
        {activeTasks.length > 0 && (
          <span className="bg-subtle text-body text-[0.8rem] font-bold py-[3px] px-[10px] rounded-xl">
            {activeTasks.length}
          </span>
        )}
      </div>

      {activeTasks.length === 0 && (
        <div className="text-center py-12 px-4 text-caption">
          <p className="text-[2rem] mb-2 mt-0">🌟</p>
          <p className="font-bold m-0">¡Todo al día!</p>
          <p className="mt-1 mb-0 text-[0.875rem]">No tienes tareas pendientes.</p>
        </div>
      )}

      {SECTIONS.map(({ status, label, emoji }) => {
        const group = byStatus(status);
        if (!group.length) return null;
        return (
          <section key={status} className="mb-7">
            <h3 className="text-[0.82rem] font-bold text-body uppercase tracking-[0.06em] mb-3 flex items-center gap-[0.4rem]">
              {emoji} {label} ({group.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {group.map((t) => <TaskCard key={t.id} task={t} variant="child" />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
