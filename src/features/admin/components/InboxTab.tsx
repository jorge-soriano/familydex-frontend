import { useState } from 'react';
import { useTasks, useApproveTask, useRejectTask } from '../../tasks/hooks/useTasks';

interface Props { familyChildren: { id: number; username: string; displayName: string }[] }

export default function InboxTab({ familyChildren }: Props) {
  const { data: tasks = [], isLoading } = useTasks({ status: 'InReview' });
  const approve = useApproveTask();
  const reject  = useRejectTask();
  const [rejectId, setRejectId]       = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const childMap = Object.fromEntries(familyChildren.map((c) => [c.id, c.displayName]));

  if (isLoading) return <p style={{ color: '#94a3b8' }}>Cargando…</p>;

  if (!tasks.length) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
      <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>🎉</p>
      <p style={{ fontWeight: 700, margin: 0 }}>¡Todo al día! No hay tareas esperando revisión.</p>
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
        {tasks.length} {tasks.length === 1 ? 'misión esperando' : 'tareas esperando'} tu revisión
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {tasks.map((task) => (
          <div key={task.id} style={{
            background: '#fff', borderRadius: 10,
            borderLeft: '4px solid #f59e0b',
            padding: '0.9rem 1rem',
            display: 'flex', alignItems: 'center', gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>{task.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                {childMap[task.assignedTo] ?? '—'} · 🪙 {task.coinsReward} · ⭐ {task.xpReward} XP
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              <button style={{ padding: '0.4rem 0.9rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 700 }}
                disabled={approve.isPending} onClick={() => approve.mutate(task.id)}>
                ✔ Aprobar
              </button>
              <button style={{ padding: '0.4rem 0.9rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 700 }}
                onClick={() => { setRejectId(task.id); setRejectReason(''); }}>
                ✖ Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>

      {rejectId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setRejectId(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: 'calc(100% - 2rem)', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Motivo del rechazo</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Opcional. Ayuda al niño a saber qué mejorar.</p>
            <textarea style={{ padding: '0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', minHeight: 80, fontSize: '0.9rem', resize: 'vertical' }}
              value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: Falta ordenar los juguetes…" autoFocus />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button style={{ padding: '0.45rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setRejectId(null)}>Cancelar</button>
              <button style={{ padding: '0.45rem 1.1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
                disabled={reject.isPending}
                onClick={() => reject.mutate({ id: rejectId!, reason: rejectReason || undefined }, { onSuccess: () => setRejectId(null) })}>
                ✖ Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
