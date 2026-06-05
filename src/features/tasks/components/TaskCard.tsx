import type { Task } from '../api';
import { useCompleteTask } from '../hooks/useTasks';
import { c } from '../../../styles/tokens';
import { Badge } from '../../../shared/components/Badge';
import type { BadgeVariant } from '../../../shared/components/Badge';

const TYPE_LABEL: Record<string, string> = {
  hogar:           '🏠 Hogar',
  deberes:         '📚 Deberes',
  comportamiento:  '⭐ Comportamiento',
  responsabilidad: '✅ Responsabilidad',
};

interface Props {
  task: Task;
  /**
   * 'child'  — compact interactive card for child view
   * 'admin'  — compact read-only card used in admin ChildDetail
   */
  variant?: 'child' | 'admin';
}

export default function TaskCard({ task, variant = 'admin' }: Props) {
  const complete   = useCompleteTask();
  const isPending  = task.status === 'Pending';
  const isReview   = task.status === 'InReview';
  const isApproved = task.status === 'Approved';
  const isRejected = task.status === 'Rejected';

  // ── Compact admin variant ──────────────────────────────────────────────────
  if (variant === 'admin') {
    const STATUS_VARIANT: Record<string, BadgeVariant> = {
      Pending: 'neutral', InReview: 'warning', Approved: 'success', Rejected: 'danger',
    };
    const STATUS_LABEL: Record<string, string> = {
      Pending: 'Pendiente', InReview: 'En revisión', Approved: 'Aprobada', Rejected: 'Rechazada',
    };

    return (
      <div className="bg-surface rounded-[8px] px-4 py-[0.55rem] mb-[0.4rem]" style={{ boxShadow: c.shadowSm }}>
        <div className="flex justify-between items-center mb-[0.35rem]">
          <span className="font-bold text-[0.9rem]">{task.title}</span>
          <Badge variant={STATUS_VARIANT[task.status]}>{STATUS_LABEL[task.status]}</Badge>
        </div>
        <div className="flex gap-3 text-[0.78rem] text-[#555] flex-wrap">
          <span className="text-[0.7rem] bg-subtle text-body py-[1px] px-[7px] rounded whitespace-nowrap">{TYPE_LABEL[task.type] ?? task.type}</span>
          <span>🪙 {task.coinsReward}</span>
          <span>⭐ {task.xpReward} XP</span>
          {task.dueDate && <span className="text-caption">📅 {task.dueDate}</span>}
        </div>
        {task.description && <p className="text-[0.82rem] text-[#666] mt-[0.35rem] mb-0">{task.description}</p>}
        {isRejected && task.rejectionReason && (
          <p className="text-[0.82rem] text-danger bg-danger-subtle px-2 py-[0.3rem] rounded mt-[0.35rem] mb-0">❌ {task.rejectionReason}</p>
        )}
      </div>
    );
  }

  // ── Child variant ─────────────────────────────────────────────────────────
  const borderColor = isPending ? c.primary : isReview ? c.warning : isApproved ? c.success : c.danger;

  return (
    <div className="bg-surface rounded-[10px] p-5 flex flex-col gap-2"
      style={{ borderLeft: `4px solid ${borderColor}`, boxShadow: c.shadowMd }}>

      <span className="font-bold text-heading">{task.title}</span>
      <span className="font-extrabold text-base text-primary-dark">🪙 {task.coinsReward} · ⭐ {task.xpReward} XP</span>

      {task.description && <p className="text-[0.85rem] text-body m-0">{task.description}</p>}

      {isReview && <p className="m-0 text-[0.82rem] text-[#d97706] font-semibold">⏳ Esperando revisión…</p>}
      {isApproved && <p className="m-0 text-[0.82rem] text-success-dark font-bold">✅ ¡Completada!</p>}

      {isRejected && task.rejectionReason && (
        <div className="bg-[#fef9c3] rounded-md px-[0.6rem] py-[0.4rem]">
          <p className="m-0 text-[0.82rem] text-warning-dark font-semibold">💪 Casi, falta esto:</p>
          <p className="mt-[0.1rem] mb-0 text-[0.82rem] text-[#78350f]">{task.rejectionReason}</p>
        </div>
      )}

      {isPending && (
        <button
          className="py-[0.45rem] px-4 bg-primary text-white border-none rounded-md text-[0.85rem] font-bold cursor-pointer mt-auto"
          disabled={complete.isPending}
          onClick={() => complete.mutate(task.id)}>
          {complete.isPending ? 'Enviando…' : '🙋 ¡He terminado!'}
        </button>
      )}

      {isRejected && !task.rejectionReason && (
        <button
          className="py-[0.45rem] px-4 bg-primary text-white border-none rounded-md text-[0.85rem] font-bold cursor-pointer mt-auto"
          disabled={complete.isPending}
          onClick={() => complete.mutate(task.id)}>
          🔄 Intentarlo de nuevo
        </button>
      )}
    </div>
  );
}
