import ChildAvatar from '../../../shared/components/ChildAvatar';
import Modal from '../../../shared/components/Modal';
import { useState } from 'react';
import { useTasks, useApproveTask, useRejectTask } from '../../tasks/hooks/useTasks';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';
import { FormTextarea } from '../../../shared/components/FormInput';

interface Props { familyChildren: { id: number; username: string; displayName: string; avatarColor?: string | null }[] }

export default function InboxTab({ familyChildren }: Props) {
  const { data: tasks = [], isLoading } = useTasks({ status: 'InReview' });
  const approve = useApproveTask();
  const reject  = useRejectTask();
  const [rejectId, setRejectId]         = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const isNarrow = useWindowWidth() < 640;

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
              {isNarrow ? (
                <button aria-label="Aprobar tarea" style={smBtn(c.success)} disabled={approve.isPending} onClick={() => approve.mutate(task.id)}>✔</button>
              ) : (
                <Button variant="success" size="sm" disabled={approve.isPending} onClick={() => approve.mutate(task.id)}>✔ Aprobar</Button>
              )}
              {isNarrow ? (
                <button aria-label="Rechazar tarea" style={smBtn(c.danger)} onClick={() => { setRejectId(task.id); setRejectReason(''); }}>✖</button>
              ) : (
                <Button variant="danger" size="sm" onClick={() => { setRejectId(task.id); setRejectReason(''); }}>✖ Rechazar</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {rejectId !== null && (
        <Modal title="Motivo del rechazo" maxWidth={420} onClose={() => setRejectId(null)}>
          <FormTextarea
            label="Motivo (opcional)"
            helper="Ayuda al niño a saber qué mejorar."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Ej: Falta ordenar los juguetes…"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setRejectId(null)}>Cancelar</Button>
            <Button variant="danger" disabled={reject.isPending}
              onClick={() => reject.mutate({ id: rejectId!, reason: rejectReason || undefined }, { onSuccess: () => setRejectId(null) })}>
              ✖ Rechazar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const smBtn = (bg: string): React.CSSProperties => ({
  width: 34, height: 34, background: bg, color: c.surface, border: 'none',
  borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});
