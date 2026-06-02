import { useState } from 'react';
import { useTasks, useApproveTask, useRejectTask, useDeleteTask } from '../hooks/useTasks';
import TaskForm from './TaskForm';
import type { Task } from '../api';
import type { TaskStatus, TaskType } from '../../../shared/types';

interface Child { id: number; username: string; displayName: string }
interface Props { children: Child[] }

// ── Configuration ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { color: string; bg: string; label: string }> = {
  Pending:  { color: '#64748b', bg: '#f1f5f9', label: 'Pendiente' },
  InReview: { color: '#d97706', bg: '#fffbeb', label: 'En revisión' },
  Approved: { color: '#16a34a', bg: '#f0fdf4', label: 'Aprobada' },
  Rejected: { color: '#dc2626', bg: '#fef2f2', label: 'Rechazada' },
};

const TYPE_LABEL: Record<string, string> = {
  hogar:           '🏠 Hogar',
  deberes:         '📚 Deberes',
  comportamiento:  '⭐ Comportamiento',
  responsabilidad: '✅ Responsabilidad',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  Pending:  'Pendiente',
  InReview: 'En revisión',
  Approved: 'Aprobada',
  Rejected: 'Rechazada',
};

// ── Action icon button ────────────────────────────────────────────────────────

interface ActionBtnProps {
  onClick: () => void;
  icon: string;
  label: string;
  variant: 'approve' | 'reject' | 'edit' | 'delete';
  disabled?: boolean;
}

function ActionBtn({ onClick, icon, label, variant, disabled }: ActionBtnProps) {
  const COLORS = {
    approve: { bg: '#22c55e', text: '#fff', border: '#16a34a' },
    reject:  { bg: '#ef4444', text: '#fff', border: '#dc2626' },
    edit:    { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
    delete:  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  };
  const c = COLORS[variant];

  return (
    <button
      title={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.25rem',
        padding: variant === 'approve' || variant === 'reject' ? '0.3rem 0.6rem' : '0.3rem',
        minWidth: variant === 'approve' || variant === 'reject' ? 'auto' : 32,
        height: 32,
        background: c.bg, color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: 6, cursor: 'pointer',
        fontSize: '0.78rem', fontWeight: 700,
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span>{icon}</span>
      {(variant === 'approve' || variant === 'reject') && <span>{label}</span>}
    </button>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────

interface RowProps {
  task: Task;
  childName: string;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onDelete: () => void;
  approving: boolean;
}

function TaskRow({ task, childName, onApprove, onReject, onEdit, onDelete, approving }: RowProps) {
  const cfg = STATUS_CONFIG[task.status];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      background: '#fff',
      borderRadius: 8,
      borderLeft: `4px solid ${cfg.color}`,
      padding: '0.65rem 1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.15s',
    }}>
      {/* ── Título + tipo ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700, fontSize: '0.9rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: '#1e293b',
        }}>
          {task.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
          <span style={{
            fontSize: '0.7rem', color: '#64748b',
            background: '#f1f5f9', padding: '1px 6px', borderRadius: 4,
          }}>
            {TYPE_LABEL[task.type] ?? task.type}
          </span>
          {task.rejectionReason && (
            <span style={{
              fontSize: '0.72rem', color: '#dc2626',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: 200,
            }}>
              ↩ {task.rejectionReason}
            </span>
          )}
        </div>
      </div>

      {/* ── Hijo ── */}
      <div style={{
        fontSize: '0.8rem', color: '#475569', fontWeight: 600,
        whiteSpace: 'nowrap', flexShrink: 0, minWidth: 70,
      }}>
        {childName}
      </div>

      {/* ── Recompensas ── */}
      <div style={{
        display: 'flex', gap: '0.4rem', fontSize: '0.8rem',
        color: '#475569', flexShrink: 0, minWidth: 80,
      }}>
        <span>🪙 {task.coinsReward}</span>
        <span>⭐ {task.xpReward}</span>
      </div>

      {/* ── Estado ── */}
      <div style={{
        fontSize: '0.72rem', fontWeight: 700,
        padding: '3px 8px', borderRadius: 10,
        background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.color}40`,
        flexShrink: 0, minWidth: 88, textAlign: 'center',
      }}>
        {cfg.label}
      </div>

      {/* ── Acciones ── */}
      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, alignItems: 'center' }}>
        {task.status === 'InReview' && (
          <>
            <ActionBtn onClick={onApprove} icon="✓" label="Aprobar"  variant="approve" disabled={approving} />
            <ActionBtn onClick={onReject}  icon="✗" label="Rechazar" variant="reject" />
          </>
        )}
        {task.status !== 'Approved' && (
          <>
            <ActionBtn onClick={onEdit}   icon="✏" label="Editar"    variant="edit" />
            <ActionBtn onClick={onDelete} icon="🗑" label="Eliminar" variant="delete" />
          </>
        )}
        {task.status === 'Approved' && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0 0.5rem' }}>—</span>
        )}
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

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

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topbar}>
        <div style={styles.titleRow}>
          <h2 style={styles.h2}>Panel de tareas</h2>
          {inReview > 0 && (
            <span style={styles.badge}>{inReview} en revisión</span>
          )}
        </div>
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
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select style={styles.select} value={filterType}
          onChange={(e) => setFilterType(e.target.value as TaskType | '')}>
          <option value="">Todos los tipos</option>
          {(['hogar','deberes','comportamiento','responsabilidad'] as TaskType[]).map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Task list */}
      {isLoading ? (
        <p style={styles.empty}>Cargando…</p>
      ) : tasks.length === 0 ? (
        <p style={styles.empty}>No hay tareas con estos filtros.</p>
      ) : (
        <div style={styles.list}>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              childName={childMap[task.assignedTo] ?? '—'}
              onApprove={() => approve.mutate(task.id)}
              onReject={() => { setRejectId(task.id); setRejectReason(''); }}
              onEdit={() => { setEditTask(task); setShowForm(true); }}
              onDelete={() => del.mutate({ id: task.id })}
              approving={approve.isPending}
            />
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectId !== null && (
        <div style={styles.overlay} onClick={() => setRejectId(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Motivo del rechazo</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              El motivo es opcional, pero ayuda al niño a entender qué mejorar.
            </p>
            <textarea style={styles.textarea} value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: No está bien hecha, inténtalo de nuevo…"
              autoFocus />
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setRejectId(null)}>Cancelar</button>
              <button style={styles.rejectConfirm} disabled={reject.isPending}
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

const styles: Record<string, React.CSSProperties> = {
  page:    { padding: '1.5rem', maxWidth: 1000, margin: '0 auto' },
  topbar:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  titleRow:{ display: 'flex', alignItems: 'center', gap: '0.75rem' },
  h2:      { fontSize: '1.5rem', fontWeight: 800, margin: 0 },
  badge:   { background: '#f59e0b', color: '#fff', fontSize: '0.78rem', padding: '3px 10px', borderRadius: 12, fontWeight: 700 },
  newBtn:  { padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' },
  select:  { padding: '0.4rem 0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', color: '#1e293b' },
  list:    { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  empty:   { color: '#94a3b8', textAlign: 'center', marginTop: '2rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:   { background: '#fff', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  textarea:{ padding: '0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', minHeight: 90, fontSize: '0.9rem', resize: 'vertical' },
  modalActions: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' },
  cancelBtn:    { padding: '0.45rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  rejectConfirm:{ padding: '0.45rem 1.1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
};
