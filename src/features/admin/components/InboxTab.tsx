import ChildAvatar from '../../../shared/components/ChildAvatar';
import { useState } from 'react';
import { useTasks, useApproveTask, useRejectTask } from '../../tasks/hooks/useTasks';
import { c } from '../../../styles/tokens';

interface Props { familyChildren: { id: number; username: string; displayName: string; avatarColor?: string | null }[] }

export default function InboxTab({ familyChildren }: Props) {
  const { data: tasks = [], isLoading } = useTasks({ status: 'InReview' });
  const approve = useApproveTask();
  const reject  = useRejectTask();
  const [rejectId, setRejectId]         = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const childById = Object.fromEntries(familyChildren.map((ch) => [ch.id, ch]));

  if (isLoading) return <p className="text-caption">Cargando…</p>;

  if (!tasks.length) return (
    <div className="text-center py-12 text-caption">
      <p className="text-[2rem] mb-2 mt-0">🎉</p>
      <p className="font-bold m-0">¡Todo al día! No hay tareas esperando revisión.</p>
    </div>
  );

  return (
    <div>
      <p className="text-[0.85rem] text-body mb-4">
        {tasks.length} {tasks.length === 1 ? 'misión esperando' : 'tareas esperando'} tu revisión
      </p>

      <div className="flex flex-col gap-[0.6rem]">
        {tasks.map((task) => (
          <div key={task.id} style={{ background: c.surface, borderRadius: 10, borderLeft: `4px solid ${c.warning}`, padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: c.shadowSm, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: c.heading }}>{task.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: c.body, marginTop: '0.2rem' }}>
                {childById[task.assignedTo] && <ChildAvatar displayName={childById[task.assignedTo].displayName} avatarColor={childById[task.assignedTo].avatarColor} size={22} />}
                <span>🪙 {task.coinsReward} · ⭐ {task.xpReward} XP</span>
              </div>
            </div>
            <div className="flex gap-[0.4rem] shrink-0">
              <button style={{ padding: '0.35rem 0.75rem', background: c.success, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                disabled={approve.isPending} onClick={() => approve.mutate(task.id)}>
                ✔ Aprobar
              </button>
              <button style={{ padding: '0.35rem 0.75rem', background: c.danger, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                onClick={() => { setRejectId(task.id); setRejectReason(''); }}>
                ✖ Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>

      {rejectId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: c.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setRejectId(null)}>
          <div style={{ background: c.surface, borderRadius: 12, padding: '1.5rem', width: 'calc(100% - 2rem)', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            onClick={(e) => e.stopPropagation()}>
            <h3 className="m-0 font-extrabold">Motivo del rechazo</h3>
            <p className="m-0 text-[0.85rem] text-body">Opcional. Ayuda al niño a saber qué mejorar.</p>
            <textarea style={{ padding: '0.6rem', borderRadius: 6, border: `2px solid ${c.stroke}`, minHeight: 80, fontSize: '0.9rem', resize: 'vertical' }}
              value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: Falta ordenar los juguetes…" autoFocus />
            <div className="flex gap-2 justify-end">
              <button style={{ padding: '0.45rem 1rem', background: c.subtle, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setRejectId(null)}>Cancelar</button>
              <button style={{ padding: '0.45rem 1.1rem', background: c.danger, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
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
