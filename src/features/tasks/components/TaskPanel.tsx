import { useState } from 'react';
import { useTasks, useApproveTask, useRejectTask, useDeleteTask } from '../hooks/useTasks';
import TaskForm from './TaskForm';
import type { Task } from '../api';
import type { TaskStatus, TaskType } from '../../../shared/types';

interface Child { id: number; username: string; displayName: string }
interface Props { children: Child[] }

// ── Configuración de estados ──────────────────────────────────────────────────

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
  color: string;
  bg: string;
  border: string;
  disabled?: boolean;
  withLabel?: boolean;
}
function ActionBtn({ onClick, icon, label, color, bg, border, disabled, withLabel }: BtnProps) {
  return (
    <button
      title={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
        padding: withLabel ? '0.3rem 0.55rem' : '0.3rem',
        minWidth: 30, height: 30,
        background: bg, color, border: `1px solid ${border}`,
        borderRadius: 5, cursor: 'pointer',
        fontSize: '0.78rem', fontWeight: 700,
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}{withLabel && <span style={{ fontSize: '0.75rem' }}>{label}</span>}
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function TaskPanel({ children }: Props) {
  const [filterChild, setFilterChild]   = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterType, setFilterType]     = useState<TaskType | ''>('');
  const [showForm, setShowForm]         = useState(false);
  const [editTask, setEditTask]         = useState<Task | null>(null);
  const [rejectId, setRejectId]         = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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

  // ── Cabecera de columna ───────────────────────────────────────────────────
  const TH = (label: string, align: 'left' | 'center' | 'right' = 'left', width?: string) => (
    <th style={{
      padding: '0.6rem 0.75rem',
      textAlign: align,
      fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
      textTransform: 'uppercase', letterSpacing: '0.05em',
      borderBottom: '2px solid #e2e8f0',
      width, whiteSpace: 'nowrap',
      background: '#f8fafc',
    }}>
      {label}
    </th>
  );

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topbar}>
        <div style={s.titleRow}>
          <h2 style={s.h2}>Panel de tareas</h2>
          {inReview > 0 && (
            <span style={s.badge}>{inReview} en revisión</span>
          )}
        </div>
        <button style={s.newBtn} onClick={() => { setEditTask(null); setShowForm(true); }}>
          + Nueva tarea
        </button>
      </div>

      {/* Filtros */}
      <div style={s.filters}>
        <select style={s.select} value={filterChild}
          onChange={(e) => setFilterChild(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Todos los hijos</option>
          {children.map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
        </select>
        <select style={s.select} value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')}>
          <option value="">Todos los estados</option>
          {(Object.keys(STATUS_CFG) as TaskStatus[]).map((k) => (
            <option key={k} value={k}>{STATUS_CFG[k].label}</option>
          ))}
        </select>
        <select style={s.select} value={filterType}
          onChange={(e) => setFilterType(e.target.value as TaskType | '')}>
          <option value="">Todos los tipos</option>
          {(['hogar', 'deberes', 'comportamiento', 'responsabilidad'] as TaskType[]).map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Tabla con scroll horizontal en pantallas pequeñas */}
      <div style={{ overflowX: 'auto', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580, background: '#fff' }}>
          <thead>
            <tr>
              {TH('Estado',     'left',   '110px')}
              {TH('Tarea',      'left'            )}
              {TH('Hijo',       'center', '90px'  )}
              {TH('Recompensa', 'center', '110px' )}
              {TH('Acciones',   'right',  '160px' )}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} style={s.cell}><p style={s.empty}>Cargando…</p></td></tr>
            )}
            {!isLoading && tasks.length === 0 && (
              <tr><td colSpan={5} style={s.cell}><p style={s.empty}>No hay tareas con estos filtros.</p></td></tr>
            )}
            {tasks.map((task) => {
              const cfg = STATUS_CFG[task.status];
              return (
                <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9' }}>

                  {/* Estado */}
                  <td style={{ ...s.cell, borderLeft: `3px solid ${cfg.color}`, paddingLeft: '0.75rem' }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.72rem', fontWeight: 700,
                      padding: '3px 8px', borderRadius: 6,
                      background: cfg.bg, color: cfg.color,
                      whiteSpace: 'nowrap',
                    }}>
                      {cfg.label}
                    </span>
                  </td>

                  {/* Tarea */}
                  <td style={s.cell}>
                    <div style={s.taskTitle}>{task.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                      <span style={s.typeBadge}>{TYPE_LABEL[task.type] ?? task.type}</span>
                      {task.rejectionReason && (
                        <span style={s.rejection}>↩ {task.rejectionReason}</span>
                      )}
                    </div>
                  </td>

                  {/* Hijo */}
                  <td style={{ ...s.cell, textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                    {childMap[task.assignedTo] ?? '—'}
                  </td>

                  {/* Recompensa */}
                  <td style={{ ...s.cell, textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem', fontSize: '0.82rem' }}>
                      <span>🪙 {task.coinsReward}</span>
                      <span>⭐ {task.xpReward} XP</span>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td style={{ ...s.cell, textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem', alignItems: 'center' }}>
                      {task.status === 'InReview' && (
                        <>
                          <ActionBtn
                            onClick={() => approve.mutate(task.id)}
                            icon="✓" label="Aprobar"
                            color="#fff" bg="#22c55e" border="#16a34a"
                            disabled={approve.isPending} withLabel
                          />
                          <ActionBtn
                            onClick={() => { setRejectId(task.id); setRejectReason(''); }}
                            icon="✗" label="Rechazar"
                            color="#fff" bg="#ef4444" border="#dc2626"
                            withLabel
                          />
                        </>
                      )}
                      {task.status !== 'Approved' && (
                        <>
                          <ActionBtn
                            onClick={() => { setEditTask(task); setShowForm(true); }}
                            icon="✏" label="Editar"
                            color="#475569" bg="#f1f5f9" border="#e2e8f0"
                          />
                          <ActionBtn
                            onClick={() => del.mutate({ id: task.id })}
                            icon="🗑" label="Eliminar"
                            color="#dc2626" bg="#fef2f2" border="#fecaca"
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal rechazar */}
      {rejectId !== null && (
        <div style={s.overlay} onClick={() => setRejectId(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Motivo del rechazo</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Opcional. Ayuda al niño a saber qué mejorar.
            </p>
            <textarea
              style={s.textarea}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: No está bien hecha, inténtalo de nuevo…"
              autoFocus
            />
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setRejectId(null)}>Cancelar</button>
              <button style={s.rejectConfirm} disabled={reject.isPending}
                onClick={() => reject.mutate(
                  { id: rejectId!, reason: rejectReason || undefined },
                  { onSuccess: () => setRejectId(null) }
                )}>
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

const s: Record<string, React.CSSProperties> = {
  page:    { padding: '1.5rem', maxWidth: 1100, margin: '0 auto' },
  topbar:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  titleRow:{ display: 'flex', alignItems: 'center', gap: '0.75rem' },
  h2:      { fontSize: '1.5rem', fontWeight: 800, margin: 0 },
  badge:   { background: '#f59e0b', color: '#fff', fontSize: '0.78rem', padding: '3px 10px', borderRadius: 12, fontWeight: 700 },
  newBtn:  { padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' },
  select:  { padding: '0.4rem 0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', color: '#1e293b' },
  cell:    { padding: '0.65rem 0.75rem', verticalAlign: 'middle' },
  taskTitle:  { fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' },
  typeBadge:  { fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap' as const },
  rejection:  { fontSize: '0.72rem', color: '#dc2626', overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, whiteSpace: 'nowrap' as const, maxWidth: 200 },
  empty:   { color: '#94a3b8', textAlign: 'center', padding: '2rem 0', margin: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:   { background: '#fff', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  textarea:{ padding: '0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', minHeight: 90, fontSize: '0.9rem', resize: 'vertical' },
  modalActions:  { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' },
  cancelBtn:     { padding: '0.45rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  rejectConfirm: { padding: '0.45rem 1.1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
};
