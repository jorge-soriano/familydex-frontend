import type { Task } from '../api';
import { useCompleteTask } from '../hooks/useTasks';
import { c } from '../../../styles/tokens';
import { Badge } from '../../../shared/components/Badge';
import type { BadgeVariant } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

const TYPE_LABEL: Record<string, string> = {
  hogar:           '🏠 Hogar',
  deberes:         '📚 Deberes',
  comportamiento:  '⭐ Comportamiento',
  responsabilidad: '✅ Responsabilidad',
};

const TYPE_EMOJI: Record<string, string> = {
  hogar:           '🏠',
  deberes:         '📚',
  comportamiento:  '⭐',
  responsabilidad: '✅',
};

const TYPE_BG: Record<string, string> = {
  hogar:           '#dbeafe',
  deberes:         '#dcfce7',
  comportamiento:  '#fef3c7',
  responsabilidad: '#f3e8ff',
};

const TYPE_COLOR: Record<string, string> = {
  hogar:           '#1e40af',
  deberes:         '#059669',
  comportamiento:  '#92400e',
  responsabilidad: '#6d28d9',
};

interface Props {
  task: Task;
  /**
   * 'child'  — horizontal interactive card for child view
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
    const STATUS_COLOR: Record<string, string> = {
      Pending: c.caption, InReview: c.warning, Approved: c.success, Rejected: c.danger,
    };

    return (
      <div className="bg-surface rounded-[8px] px-4 py-[0.55rem] mb-[0.4rem]"
        style={{ boxShadow: c.shadowSm, borderLeft: `3px solid ${STATUS_COLOR[task.status]}` }}>
        <div className="flex justify-between items-center mb-[0.35rem]">
          <span className="font-bold text-[0.9rem]">{task.title}</span>
          <Badge variant={STATUS_VARIANT[task.status]}>{STATUS_LABEL[task.status]}</Badge>
        </div>
        <div className="flex gap-3 text-[0.78rem] text-body flex-wrap">
          <span className="text-[0.7rem] bg-subtle text-body py-[1px] px-[7px] rounded whitespace-nowrap">
            {TYPE_LABEL[task.type] ?? task.type}
          </span>
          <span>🪙 {task.coinsReward}</span>
          <span>⭐ {task.xpReward} XP</span>
          {task.dueDate && <span className="text-caption">📅 {task.dueDate}</span>}
        </div>
        {task.description && (
          <p className="text-[0.82rem] text-body mt-[0.35rem] mb-0">{task.description}</p>
        )}
        {isRejected && task.rejectionReason && (
          <p className="text-[0.82rem] text-danger bg-danger-subtle px-2 py-[0.3rem] rounded mt-[0.35rem] mb-0">
            ❌ {task.rejectionReason}
          </p>
        )}
      </div>
    );
  }

  // ── Child variant — horizontal card ───────────────────────────────────────
  const stripColor = isPending ? c.primary : isReview ? c.warning : isApproved ? c.success : c.danger;
  const typeEmoji  = TYPE_EMOJI[task.type] ?? '📋';
  const typeBg     = TYPE_BG[task.type]    ?? c.subtle;
  const typeColor  = TYPE_COLOR[task.type] ?? c.body;

  return (
    <div style={{ background: c.surface, borderRadius: 10, overflow: 'hidden', boxShadow: c.shadowMd }}>

      {/* Main row */}
      <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem' }}>

        {/* Left: tipo emoji */}
        <div style={{
          width: 52, height: 52, borderRadius: 8, flexShrink: 0,
          background: typeBg, color: typeColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem',
        }}>
          {typeEmoji}
        </div>

        {/* Center: título + descripción */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem', justifyContent: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: c.heading }}>{task.title}</span>
          {task.description && (
            <p style={{ margin: 0, fontSize: '0.8rem', color: c.body }}>{task.description}</p>
          )}
          {isReview && (
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: c.warningMid }}>
              ⏳ Esperando revisión…
            </p>
          )}
          {isApproved && (
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: c.successDark }}>
              ✅ ¡Completada!
            </p>
          )}
        </div>

        {/* Right: recompensas */}
        <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem', justifyContent: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: c.warningDark }}>🪙 {task.coinsReward}</span>
          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: c.accent }}>⭐ {task.xpReward}</span>
        </div>
      </div>

      {/* Franja de estado */}
      <div style={{ height: 3, background: stripColor }} />

      {/* Feedback de rechazo */}
      {isRejected && task.rejectionReason && (
        <div style={{ margin: '0.5rem 0.75rem', borderRadius: 6, padding: '0.4rem 0.6rem', background: c.warningPale }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: c.warningDark, fontWeight: 600 }}>
            💪 Casi, falta esto: {task.rejectionReason}
          </p>
        </div>
      )}

      {/* Botón */}
      {isPending && (
        <div style={{ padding: '0.5rem 0.75rem 0.75rem' }}>
          <Button
            disabled={complete.isPending}
            onClick={() => complete.mutate(task.id)}
            style={{ width: '100%', justifyContent: 'center' }}>
            {complete.isPending ? 'Enviando…' : '🙋 ¡He terminado!'}
          </Button>
        </div>
      )}

      {isRejected && !task.rejectionReason && (
        <div style={{ padding: '0.5rem 0.75rem 0.75rem' }}>
          <Button
            disabled={complete.isPending}
            onClick={() => complete.mutate(task.id)}
            style={{ width: '100%', justifyContent: 'center' }}>
            🔄 Intentarlo de nuevo
          </Button>
        </div>
      )}
    </div>
  );
}
