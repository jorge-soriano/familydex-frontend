import { useState } from 'react';
import { useTasks, useApproveTask, useRejectTask, useDeleteTask } from '../hooks/useTasks';
import TaskForm from './TaskForm';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';
import type { Task } from '../api';
import type { TaskStatus, TaskType } from '../../../shared/types';

interface Child { id: number; username: string; displayName: string }
interface Props { children: Child[] }

// ── Configuración ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<TaskStatus, { color: string; bg: string; label: string }> = {
  Pending:  { color: '#64748b', bg: '#f1f5f9', label: 'Pendiente'   },
  InReview: { color: '#d97706', bg: '#fef9c3', label: 'En revisión' },
  Approved: { color: '#16a34a', bg: '#dcfce7', label: 'Aprobada'    },
  Rejected: { color: '#dc2626', bg: '#fee2e2', label: 'Rechazada'   },
};

const TYPE_LABEL: Record<string, string> = {
  hogar:           '🏠 Hogar',
  deberes:         '📚 Deberes',
  comportamiento:  '⭐ Comportamiento',
  responsabilidad: '✅ Responsabilidad',
};

// ── Botón de acción ───────────────────────────────────────────────────────────

interface BtnProps {
  onClick: () => void;
  icon: string;
  label: string;
  color: string; bg: string; border: string;
  disabled?: boolean;
  withLabel?: boolean;
}
function ActionBtn({ onClick, icon, label, color, bg, border, disabled, withLabel }: BtnProps) {
  return (
    <button title={label} disabled={disabled} onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
      padding: withLabel ? '0.3rem 0.55rem' : '0.3rem',
      minWidth: 30, height: 30,
      background: bg, color, border: `1px solid ${border}`,
      borderRadius: 5, cursor: 'pointer',
      fontSize: '0.78rem', fontWeight: 700,
      opacity: disabled ? 0.5 : 1,
      whiteSpace: 'nowrap',
    }}>
      {icon}{withLabel && <span style={{ fontSize: '0.75rem' }}>{label}</span>}
    </button>
  );
}

// ── Acciones de una tarea (reutilizadas en ambos layouts) ─────────────────────

interface ActionsProps {
  task: Task;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onDelete: () => void;
  approving: boolean;
  withLabels?: boolean;
}
function TaskActions({ task, onApprove, onReject, onEdit, onDelete, approving, withLabels }: ActionsProps) {
  return (
    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
      {task.status === 'InReview' && (
        <>
          <ActionBtn onClick={onApprove} icon="✓" label="Aprobar"
            color="#fff" bg="#22c55e" border="#16a34a" disabled={approving} withLabel={withLabels} />
          <ActionBtn onClick={onReject} icon="✗" label="Rechazar"
            color="#fff" bg="#ef4444" border="#dc2626" withLabel={withLabels} />
        </>
      )}
      {task.status !== 'Approved' && (
        <>
          <ActionBtn onClick={onEdit}   icon="✏" label="Editar"   color="#475569" bg="#f1f5f9" border="#e2e8f0" />
          <ActionBtn onClick={onDelete} icon="🗑" label="Eliminar" color="#dc2626" bg="#fef2f2" border="#fecaca" />
        </>
      )}
    </div>
  );
}

// ── Panel principal ───────────────────────────────────────────────────────────

export default function TaskPanel({ children }: Props) {
  const [filterChild, setFilterChild]   = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterType, setFilterType]     = useState<TaskType | ''>('');
  const [showForm, setShowForm]         = useState(false);
  const [editTask, setEditTask]         = useState<Task | null>(null);
  const [rejectId, setRejectId]         = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const width    = useWindowWidth();
  const isNarrow = width < 700;

  const { data: tasks = [], isLoading } = useTasks({
    assignedTo: filterChild  || undefined,
    status:     filterStatus || undefined,
    type:       filterType   || undefined,
  });

  const approve = useApproveTask();
  const reject  = useRejectTask();
  const del     = useDeleteTask();

  const childMap = Object.fromEntries(children.map((c) => [c.id, c.displayName]));
  const inReview = tasks.filter((t) => t.status === 'InReview').length;

  const actionProps = (task: Task) => ({
    task, approving: approve.isPending,
    onApprove: () => approve.mutate(task.id),
    onReject:  () => { setRejectId(task.id); setRejectReason(''); },
    onEdit:    () => { setEditTask(task); setShowForm(true); },
    onDelete:  () => del.mutate({ id: task.id }),
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Panel de tareas</h2>
          {inReview > 0 && (
            <span style={{ background: '#f59e0b', color: '#fff', fontSize: '0.78rem', padding: '3px 10px', borderRadius: 12, fontWeight: 700 }}>
              {inReview} en revisión
            </span>
          )}
        </div>
        <button style={{ padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
          onClick={() => { setEditTask(null); setShowForm(true); }}>
          + Nueva tarea
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { value: filterChild,  onChange: (v: string) => setFilterChild(v ? Number(v) : ''),
            options: [['', 'Todos los hijos'], ...children.map((c) => [String(c.id), c.displayName])] },
          { value: filterStatus, onChange: (v: string) => setFilterStatus(v as TaskStatus | ''),
            options: [['', 'Todos los estados'], ...Object.entries(STATUS_CFG).map(([k, v]) => [k, v.label])] },
          { value: filterType,   onChange: (v: string) => setFilterType(v as TaskType | ''),
            options: [['', 'Todos los tipos'], ...['hogar','deberes','comportamiento','responsabilidad']
              .map((t) => [t, t.charAt(0).toUpperCase() + t.slice(1)])] },
        ].map((sel, i) => (
          <select key={i} value={String(sel.value)}
            onChange={(e) => sel.onChange(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', color: '#1e293b' }}>
            {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* ── LAYOUT ANCHO: tabla ── */}
      {!isNarrow && (
        <div style={{ overflowX: 'auto', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580, background: '#fff' }}>
            <thead>
              <tr>
                {[
                  { label: 'Estado', w: '110px', align: 'left' as const },
                  { label: 'Tarea',  w: undefined, align: 'left' as const },
                  { label: 'Hijo',   w: '90px',  align: 'center' as const },
                  { label: 'Recompensa', w: '110px', align: 'center' as const },
                  { label: 'Acciones',   w: '170px', align: 'right' as const },
                ].map(({ label, w, align }) => (
                  <th key={label} style={{
                    padding: '0.6rem 0.75rem', textAlign: align, width: w,
                    fontSize: '0.72rem', fontWeight: 700, color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '2px solid #e2e8f0', background: '#f8fafc',
                  }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Cargando…</td></tr>}
              {!isLoading && tasks.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No hay tareas.</td></tr>}
              {tasks.map((task) => {
                const cfg = STATUS_CFG[task.status];
                return (
                  <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 0.75rem', verticalAlign: 'middle', borderLeft: `3px solid ${cfg.color}`, paddingLeft: '0.75rem' }}>
                      <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>{task.title}</div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>
                          {TYPE_LABEL[task.type] ?? task.type}
                        </span>
                        {task.rejectionReason && (
                          <span style={{ fontSize: '0.72rem', color: '#dc2626', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                            ↩ {task.rejectionReason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', verticalAlign: 'middle', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                      {childMap[task.assignedTo] ?? '—'}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem', fontSize: '0.82rem' }}>
                        <span>🪙 {task.coinsReward}</span>
                        <span>⭐ {task.xpReward} XP</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem' }}>
                        <TaskActions {...actionProps(task)} withLabels />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── LAYOUT ESTRECHO: tarjetas ── */}
      {isNarrow && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {isLoading && <p style={{ color: '#94a3b8', textAlign: 'center' }}>Cargando…</p>}
          {!isLoading && tasks.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay tareas.</p>}

          {tasks.map((task) => {
            const cfg = STATUS_CFG[task.status];
            return (
              <div key={task.id} style={{
                background: '#fff', borderRadius: 8,
                borderLeft: `4px solid ${cfg.color}`,
                padding: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
              }}>
                {/* Fila 1: estado + título */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {cfg.label}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.3 }}>
                    {task.title}
                  </span>
                </div>

                {/* Fila 2: tipo + motivo rechazo */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>
                    {TYPE_LABEL[task.type] ?? task.type}
                  </span>
                  {task.rejectionReason && (
                    <span style={{ fontSize: '0.72rem', color: '#dc2626' }}>
                      ↩ {task.rejectionReason}
                    </span>
                  )}
                </div>

                {/* Fila 3: hijo + recompensa | acciones */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600 }}>{childMap[task.assignedTo] ?? '—'}</span>
                    <span>🪙 {task.coinsReward}</span>
                    <span>⭐ {task.xpReward} XP</span>
                  </div>
                  <TaskActions {...actionProps(task)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal rechazar */}
      {rejectId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setRejectId(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0 1rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Motivo del rechazo</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Opcional. Ayuda al niño a saber qué mejorar.</p>
            <textarea
              style={{ padding: '0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', minHeight: 90, fontSize: '0.9rem', resize: 'vertical' }}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: No está bien hecha, inténtalo de nuevo…"
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button style={{ padding: '0.45rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setRejectId(null)}>Cancelar</button>
              <button style={{ padding: '0.45rem 1.1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
                disabled={reject.isPending}
                onClick={() => reject.mutate({ id: rejectId!, reason: rejectReason || undefined }, { onSuccess: () => setRejectId(null) })}>
                {reject.isPending ? 'Rechazando…' : '✗ Rechazar tarea'}
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
