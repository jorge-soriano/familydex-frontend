import ChildAvatar from '../../../shared/components/ChildAvatar';
import { useState } from 'react';
import { useTasks, useDirectApprove, useRejectTask } from '../hooks/useTasks';
import TaskForm from './TaskForm';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';
import type { TaskWithSeries } from '../api';
import type { TaskType } from '../../../shared/types';
import { c } from '../../../styles/tokens';

interface Child { id: number; username: string; displayName: string; avatarColor?: string | null }
interface Props  { children: Child[] }

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function freqLabel(task: TaskWithSeries): string {
  if (!task.seriesId || !task.series) return 'Puntual';
  if (task.series.frequency === 'Daily') return '🔄 Diaria';
  const days: number[] = JSON.parse(task.series.daysOfWeek || '[]');
  return `📅 ${days.map((d) => DAY_NAMES[d]).join(', ')}`;
}

const TYPE_LABEL: Record<string, string> = {
  hogar: '🏠', deberes: '📚', comportamiento: '⭐', responsabilidad: '✅',
};

export default function TaskPanel({ children }: Props) {
  const [filterChild,  setFilterChild]  = useState<number | ''>('');
  const [filterType,   setFilterType]   = useState<TaskType | ''>('');
  const [showForm,     setShowForm]     = useState(false);
  const [editTask,     setEditTask]     = useState<TaskWithSeries | null>(null);
  const [rejectId,     setRejectId]     = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const isNarrow = useWindowWidth() < 700;

  const { data: rawTasks = [], isLoading } = useTasks({
    assignedTo: filterChild || undefined,
    type:       filterType  || undefined,
  });

  // Active planner view: hide one-time Approved tasks (done, no need to manage them).
  // Keep recurring Approved tasks (they'll repeat — useful to have in the planner).
  // Disabled tasks appear at the bottom.
  const visible = (rawTasks as TaskWithSeries[]).filter(
    (t) => t.status === 'Pending' || t.status === 'InReview' ||
           (t.status === 'Approved' && t.seriesId !== null)
  );
  const tasks = [
    ...visible.filter((t) => t.isEnabled !== false),
    ...visible.filter((t) => t.isEnabled === false),
  ];

  const directApprove = useDirectApprove();
  const reject        = useRejectTask();

  const childById = Object.fromEntries(children.map((ch) => [ch.id, ch]));

  const sel: React.CSSProperties = { padding: '0.4rem 0.6rem', borderRadius: 6, border: `2px solid ${c.stroke}`, background: c.surface, fontSize: '0.875rem', color: c.heading };

  const TH = (label: string, align: 'left' | 'center' | 'right' = 'left', w?: string) => (
    <th style={{ padding: '0.6rem 0.75rem', textAlign: align, width: w, fontSize: '0.72rem', fontWeight: 700, color: c.body, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `2px solid ${c.stroke}`, background: c.page, whiteSpace: 'nowrap' }}>
      {label}
    </th>
  );

  const Btn = ({ onClick, icon, label, bg, color, border, disabled }: { onClick: () => void; icon: string; label: string; bg: string; color: string; border: string; disabled?: boolean }) => (
    <button title={label} disabled={disabled} onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: bg, color, border: `1px solid ${border}`, borderRadius: 6, cursor: 'pointer', fontSize: '0.95rem', opacity: disabled ? 0.45 : 1 }}>
      {icon}
    </button>
  );

  return (
    <div>
      {/* Filters + new button */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select style={sel} value={filterChild} onChange={(e) => setFilterChild(e.target.value ? +e.target.value : '')}>
            <option value="">Todos los hijos</option>
            {children.map((ch) => <option key={ch.id} value={ch.id}>{ch.displayName}</option>)}
          </select>
          <select style={sel} value={filterType} onChange={(e) => setFilterType(e.target.value as TaskType | '')}>
            <option value="">Todos los tipos</option>
            {['hogar','deberes','comportamiento','responsabilidad'].map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
            ))}
          </select>
        </div>
        <button style={{ padding: '0.5rem 1.25rem', background: c.primary, color: c.surface, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}
          onClick={() => { setEditTask(null); setShowForm(true); }}>
          + Nueva tarea
        </button>
      </div>

      {/* ── Wide: table ──────────────────────────────────────────────────────── */}
      {!isNarrow && (
        <div style={{ overflowX: 'auto', borderRadius: 10, boxShadow: c.shadowSm }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540, background: c.surface }}>
            <thead>
              <tr>
                {TH('Tarea',      'left')}
                {TH('Hijo',       'center', '90px')}
                {TH('Frecuencia', 'center', '110px')}
                {TH('Recompensa', 'center', '100px')}
                {TH('Acciones',   'right',  '120px')}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: c.caption }}>Cargando…</td></tr>}
              {!isLoading && tasks.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: c.caption }}>Sin tareas.</td></tr>}

              {tasks.map((task, idx) => {
                const isDisabled = task.isEnabled === false;
                const prevEnabled = idx > 0 && (tasks[idx-1] as TaskWithSeries).isEnabled !== false;
                const showSeparator = isDisabled && (idx === 0 || prevEnabled);

                return (
                  <>
                    {showSeparator && (
                      <tr key={`sep-${task.id}`}>
                        <td colSpan={5} style={{ padding: '0.4rem 0.75rem', background: c.page, fontSize: '0.72rem', fontWeight: 700, color: c.caption, textTransform: 'uppercase', letterSpacing: '0.05em', borderTop: `1px solid ${c.stroke}` }}>
                          Deshabilitadas
                        </td>
                      </tr>
                    )}
                    <tr key={task.id} style={{ borderBottom: `1px solid ${c.subtle}`, opacity: isDisabled ? 0.45 : 1, background: isDisabled ? c.page : c.surface }}>
                      <td style={{ padding: '0.65rem 0.75rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: c.heading }}>
                          {TYPE_LABEL[task.type]} {task.title}
                        </div>
                        {task.rejectionReason && (
                          <div style={{ fontSize: '0.75rem', color: c.dangerDark, marginTop: '0.1rem' }}>↩ {task.rejectionReason}</div>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {childById[task.assignedTo] ? <ChildAvatar displayName={childById[task.assignedTo].displayName} avatarColor={childById[task.assignedTo].avatarColor} size={28} /> : <span style={{ color: c.caption }}>—</span>}
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontSize: '0.82rem', color: c.body }}>
                        {freqLabel(task)}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: c.body, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                          <span>🪙 {task.coinsReward}</span>
                          <span>⭐ {task.xpReward}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem' }}>
                          {task.status !== 'Approved' && (
                            <Btn onClick={() => directApprove.mutate(task.id)} icon="✔" label="Aprobar" bg={c.success} color={c.surface} border={c.successDark} disabled={directApprove.isPending} />
                          )}
                          {task.status === 'InReview' && (
                            <Btn onClick={() => { setRejectId(task.id); setRejectReason(''); }} icon="✖" label="Rechazar" bg={c.danger} color={c.surface} border={c.dangerDark} />
                          )}
                          <Btn onClick={() => { setEditTask(task); setShowForm(true); }} icon="✎" label="Editar" bg={c.subtle} color={c.body} border={c.subtle} />
                        </div>
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Narrow: cards ────────────────────────────────────────────────────── */}
      {isNarrow && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {isLoading && <p style={{ color: c.caption }}>Cargando…</p>}

          {tasks.map((task, idx) => {
            const isDisabled = task.isEnabled === false;
            const prevEnabled = idx > 0 && (tasks[idx-1] as TaskWithSeries).isEnabled !== false;
            const showSeparator = isDisabled && (idx === 0 || prevEnabled);

            return (
              <>
                {showSeparator && (
                  <div key={`sep-${task.id}`} style={{ fontSize: '0.72rem', fontWeight: 700, color: c.caption, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0 0.25rem' }}>
                    Deshabilitadas
                  </div>
                )}
                <div key={task.id} style={{ background: isDisabled ? c.page : c.surface, borderRadius: 8, padding: '0.75rem', boxShadow: c.shadowSm, opacity: isDisabled ? 0.5 : 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{TYPE_LABEL[task.type]} {task.title}</div>
                  <div style={{ fontSize: '0.8rem', color: c.body, marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{childById[task.assignedTo] && <ChildAvatar displayName={childById[task.assignedTo].displayName} avatarColor={childById[task.assignedTo].avatarColor} size={22} />}{freqLabel(task)} · 🪙{task.coinsReward} ⭐{task.xpReward}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {task.status !== 'Approved' && <Btn onClick={() => directApprove.mutate(task.id)} icon="✔" label="Aprobar" bg={c.success} color={c.surface} border={c.successDark} />}
                    {task.status === 'InReview' && <Btn onClick={() => { setRejectId(task.id); setRejectReason(''); }} icon="✖" label="Rechazar" bg={c.danger} color={c.surface} border={c.dangerDark} />}
                    <Btn onClick={() => { setEditTask(task); setShowForm(true); }} icon="✎" label="Editar" bg={c.subtle} color={c.body} border={c.subtle} />
                  </div>
                </div>
              </>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: c.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setRejectId(null)}>
          <div style={{ background: c.surface, borderRadius: 12, padding: '1.5rem', width: 'calc(100% - 2rem)', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Motivo del rechazo</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: c.body }}>Opcional. Ayuda al niño a mejorar.</p>
            <textarea style={{ padding: '0.6rem', borderRadius: 6, border: `2px solid ${c.stroke}`, minHeight: 80, fontSize: '0.9rem', resize: 'vertical' }}
              value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: Falta ordenar los juguetes…" autoFocus />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button style={{ padding: '0.45rem 1rem', background: c.subtle, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }} onClick={() => setRejectId(null)}>Cancelar</button>
              <button style={{ padding: '0.45rem 1.1rem', background: c.danger, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
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
