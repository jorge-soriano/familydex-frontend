import { useState } from 'react';
import { useTasks, useDirectApprove, useRejectTask, useDeleteTask, useToggleEnabled } from '../hooks/useTasks';
import TaskForm from './TaskForm';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';
import type { TaskWithSeries } from '../api';
import type { TaskType } from '../../../shared/types';

interface Child { id: number; username: string; displayName: string }
interface Props  { children: Child[] }

// ── Frequency label from series info ─────────────────────────────────────────

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function freqLabel(task: TaskWithSeries): string {
  if (!task.seriesId || !task.series) return 'Puntual';
  if (task.series.frequency === 'Daily')  return '🔄 Diaria';
  const days: number[] = JSON.parse(task.series.daysOfWeek || '[]');
  return `📅 ${days.map((d) => DAY_NAMES[d]).join(', ')}`;
}

const TYPE_LABEL: Record<string, string> = {
  hogar: '🏠', deberes: '📚', comportamiento: '⭐', responsabilidad: '✅',
};

// ── Panel ─────────────────────────────────────────────────────────────────────

export default function TaskPanel({ children }: Props) {
  const [filterChild,  setFilterChild]  = useState<number | ''>('');
  const [filterType,   setFilterType]   = useState<TaskType | ''>('');
  const [showForm,     setShowForm]     = useState(false);
  const [editTask,     setEditTask]     = useState<TaskWithSeries | null>(null);
  const [rejectId,     setRejectId]     = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const isNarrow = useWindowWidth() < 700;

  const { data: tasks = [], isLoading } = useTasks({
    assignedTo: filterChild || undefined,
    type:       filterType  || undefined,
  });

  const directApprove  = useDirectApprove();
  const reject         = useRejectTask();
  const del            = useDeleteTask();
  const toggleEnabled  = useToggleEnabled();

  const childMap = Object.fromEntries(children.map((c) => [c.id, c.displayName]));

  // ── Table header ────────────────────────────────────────────────────────────
  const TH = (label: string, align: 'left' | 'center' | 'right' = 'left', w?: string) => (
    <th style={{ padding: '0.6rem 0.75rem', textAlign: align, width: w, fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', background: '#f8fafc', whiteSpace: 'nowrap' }}>
      {label}
    </th>
  );

  // ── Action button ────────────────────────────────────────────────────────────
  const Btn = ({ onClick, icon, label, bg, color, border, disabled }: { onClick: () => void; icon: string; label: string; bg: string; color: string; border: string; disabled?: boolean }) => (
    <button title={label} disabled={disabled} onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: bg, color, border: `1px solid ${border}`, borderRadius: 5, cursor: 'pointer', fontSize: '0.95rem', opacity: disabled ? 0.45 : 1 }}>
      {icon}
    </button>
  );

  return (
    <div>
      {/* Filters + New button */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select style={sel} value={filterChild} onChange={(e) => setFilterChild(e.target.value ? +e.target.value : '')}>
            <option value="">Todos los hijos</option>
            {children.map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
          </select>
          <select style={sel} value={filterType} onChange={(e) => setFilterType(e.target.value as TaskType | '')}>
            <option value="">Todos los tipos</option>
            {['hogar','deberes','comportamiento','responsabilidad'].map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
            ))}
          </select>
        </div>
        <button style={{ padding: '0.45rem 1.1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}
          onClick={() => { setEditTask(null); setShowForm(true); }}>
          + Nueva tarea
        </button>
      </div>

      {/* ── Wide layout: table ─────────────────────────────────────────────── */}
      {!isNarrow && (
        <div style={{ overflowX: 'auto', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560, background: '#fff' }}>
            <thead>
              <tr>
                {TH('Tarea',       'left')}
                {TH('Hijo',        'center', '90px')}
                {TH('Frecuencia',  'center', '110px')}
                {TH('Recompensa',  'center', '100px')}
                {TH('Acciones',    'right',  '150px')}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Cargando…</td></tr>}
              {!isLoading && tasks.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Sin tareas con estos filtros.</td></tr>}
              {(tasks as TaskWithSeries[]).map((task) => {
                const disabled = task.isEnabled === false;
                return (
                  <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: disabled ? 0.5 : 1 }}>
                    <td style={{ padding: '0.65rem 0.75rem', verticalAlign: 'middle', borderLeft: `3px solid ${disabled ? '#94a3b8' : task.status === 'Approved' ? '#22c55e' : task.status === 'InReview' ? '#f59e0b' : '#e2e8f0'}` }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>
                        {TYPE_LABEL[task.type]} {task.title}
                      </div>
                      {task.rejectionReason && (
                        <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.1rem' }}>↩ {task.rejectionReason}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                      {childMap[task.assignedTo] ?? '—'}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontSize: '0.82rem', color: '#475569' }}>
                      {freqLabel(task)}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                        <span>🪙 {task.coinsReward}</span>
                        <span>⭐ {task.xpReward}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem' }}>
                        {task.status !== 'Approved' && (
                          <Btn onClick={() => directApprove.mutate(task.id)} icon="✔" label="Aprobar" bg="#22c55e" color="#fff" border="#16a34a" disabled={directApprove.isPending} />
                        )}
                        {task.status === 'InReview' && (
                          <Btn onClick={() => { setRejectId(task.id); setRejectReason(''); }} icon="✖" label="Rechazar" bg="#ef4444" color="#fff" border="#dc2626" />
                        )}
                        <Btn onClick={() => { setEditTask(task); setShowForm(true); }} icon="✎" label="Editar" bg="#f1f5f9" color="#475569" border="#cbd5e1" />
                        <Btn onClick={() => toggleEnabled.mutate(task.id)} icon={disabled ? '▶' : '⏸'} label={disabled ? 'Habilitar' : 'Deshabilitar'} bg={disabled ? '#f0fdf4' : '#f8fafc'} color={disabled ? '#16a34a' : '#64748b'} border="#e2e8f0" />
                        <Btn onClick={() => del.mutate({ id: task.id })} icon="🗑" label="Eliminar" bg="#fef2f2" color="#dc2626" border="#fecaca" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Narrow layout: cards ───────────────────────────────────────────── */}
      {isNarrow && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {isLoading && <p style={{ color: '#94a3b8' }}>Cargando…</p>}
          {(tasks as TaskWithSeries[]).map((task) => {
            const disabled = task.isEnabled === false;
            return (
              <div key={task.id} style={{ background: '#fff', borderRadius: 8, borderLeft: `4px solid ${disabled ? '#94a3b8' : task.status === 'InReview' ? '#f59e0b' : '#e2e8f0'}`, padding: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', opacity: disabled ? 0.55 : 1 }}>
                <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{TYPE_LABEL[task.type]} {task.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  {childMap[task.assignedTo]} · {freqLabel(task)} · 🪙{task.coinsReward} ⭐{task.xpReward}
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {task.status !== 'Approved' && <Btn onClick={() => directApprove.mutate(task.id)} icon="✔" label="Aprobar" bg="#22c55e" color="#fff" border="#16a34a" />}
                  {task.status === 'InReview' && <Btn onClick={() => { setRejectId(task.id); setRejectReason(''); }} icon="✖" label="Rechazar" bg="#ef4444" color="#fff" border="#dc2626" />}
                  <Btn onClick={() => { setEditTask(task); setShowForm(true); }} icon="✎" label="Editar" bg="#f1f5f9" color="#475569" border="#cbd5e1" />
                  <Btn onClick={() => toggleEnabled.mutate(task.id)} icon={disabled ? '▶' : '⏸'} label={disabled ? 'Habilitar' : 'Deshabilitar'} bg="#f8fafc" color="#64748b" border="#e2e8f0" />
                  <Btn onClick={() => del.mutate({ id: task.id })} icon="🗑" label="Eliminar" bg="#fef2f2" color="#dc2626" border="#fecaca" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setRejectId(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: 'calc(100% - 2rem)', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Motivo del rechazo</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Opcional. Ayuda al niño a mejorar.</p>
            <textarea style={{ padding: '0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', minHeight: 80, fontSize: '0.9rem', resize: 'vertical' }}
              value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: Falta ordenar los juguetes…" autoFocus />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button style={{ padding: '0.45rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }} onClick={() => setRejectId(null)}>Cancelar</button>
              <button style={{ padding: '0.45rem 1.1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
                disabled={reject.isPending}
                onClick={() => reject.mutate({ id: rejectId!, reason: rejectReason || undefined }, { onSuccess: () => setRejectId(null) })}>
                ✖ Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <TaskForm task={editTask ?? undefined} children={children} onClose={() => { setShowForm(false); setEditTask(null); }} />
      )}
    </div>
  );
}

const sel: React.CSSProperties = { padding: '0.4rem 0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', color: '#1e293b' };
