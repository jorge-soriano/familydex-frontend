import { useState } from 'react';
import { useTasks, useApproveTask, useRejectTask, useDeleteTask } from '../hooks/useTasks';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import type { Task } from '../api';
import type { TaskStatus, TaskType } from '../../../shared/types';

interface Child { id: number; username: string; displayName: string }
interface Props { children: Child[] }

export default function TaskPanel({ children }: Props) {
  const [filterChild, setFilterChild] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterType, setFilterType] = useState<TaskType | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: tasks = [], isLoading } = useTasks({
    assignedTo: filterChild || undefined,
    status: filterStatus || undefined,
    type: filterType || undefined,
  });

  const approve = useApproveTask();
  const reject  = useRejectTask();
  const del     = useDeleteTask();

  const inReview = tasks.filter((t) => t.status === 'InReview');

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <h2 style={styles.h2}>
          Panel de tareas
          {inReview.length > 0 && (
            <span style={styles.badge}>{inReview.length} en revisión</span>
          )}
        </h2>
        <button style={styles.newBtn} onClick={() => { setEditTask(null); setShowForm(true); }}>
          + Nueva tarea
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select style={styles.select} value={filterChild}
          onChange={(e) => setFilterChild(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Todos los hijos</option>
          {children.map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
        </select>
        <select style={styles.select} value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')}>
          <option value="">Todos los estados</option>
          {['Pending','InReview','Approved','Rejected'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select style={styles.select} value={filterType}
          onChange={(e) => setFilterType(e.target.value as TaskType | '')}>
          <option value="">Todos los tipos</option>
          {['hogar','deberes','comportamiento','responsabilidad'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {isLoading ? <p>Cargando…</p> : (
        <div>
          {tasks.length === 0 && <p style={styles.empty}>No hay tareas con estos filtros.</p>}
          {tasks.map((task) => (
            <div key={task.id} style={styles.taskRow}>
              <TaskCard task={task} />
              <div style={styles.actions}>
                {task.status === 'InReview' && (
                  <>
                    <button style={styles.approve}
                      disabled={approve.isPending}
                      onClick={() => approve.mutate(task.id)}>
                      ✓ Aprobar
                    </button>
                    <button style={styles.rejectBtn}
                      onClick={() => { setRejectId(task.id); setRejectReason(''); }}>
                      ✗ Rechazar
                    </button>
                  </>
                )}
                {task.status !== 'Approved' && (
                  <>
                    <button style={styles.editBtn}
                      onClick={() => { setEditTask(task); setShowForm(true); }}>
                      Editar
                    </button>
                    <button style={styles.delBtn}
                      onClick={() => del.mutate({ id: task.id })}>
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectId !== null && (
        <div style={styles.overlay} onClick={() => setRejectId(null)}>
          <div style={styles.rejectModal} onClick={(e) => e.stopPropagation()}>
            <h3>Motivo del rechazo (opcional)</h3>
            <textarea style={styles.textarea} value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explica al niño por qué se rechaza…" />
            <div style={styles.rejectActions}>
              <button style={styles.cancel} onClick={() => setRejectId(null)}>Cancelar</button>
              <button style={styles.rejectConfirm} disabled={reject.isPending}
                onClick={() => {
                  reject.mutate({ id: rejectId!, reason: rejectReason || undefined },
                    { onSuccess: () => setRejectId(null) });
                }}>
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <TaskForm
          task={editTask ?? undefined}
          children={children}
          onClose={() => { setShowForm(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: 900, margin: '0 auto' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  h2: { fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' },
  badge: { background: '#f59e0b', color: '#fff', fontSize: '0.8rem', padding: '3px 10px', borderRadius: 12, fontWeight: 700 },
  newBtn: { padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' },
  select: { padding: '0.4rem 0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', background: '#fff', fontSize: '0.875rem' },
  taskRow: { display: 'flex', gap: '0.5rem', alignItems: 'flex-start' },
  actions: { display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingTop: '1rem', flexShrink: 0 },
  approve: { padding: '0.35rem 0.75rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  rejectBtn: { padding: '0.35rem 0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  editBtn: { padding: '0.35rem 0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' },
  delBtn: { padding: '0.35rem 0.75rem', background: '#fff', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: '2rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  rejectModal: { background: '#fff', borderRadius: 10, padding: '1.5rem', width: 380, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  textarea: { padding: '0.5rem', borderRadius: 6, border: '2px solid #e2e8f0', minHeight: 80, fontSize: '0.9rem' },
  rejectActions: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' },
  cancel: { padding: '0.4rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' },
  rejectConfirm: { padding: '0.4rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
};
