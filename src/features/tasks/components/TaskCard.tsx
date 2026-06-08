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
  const typeEmoji = TYPE_EMOJI[task.type] ?? '📋';
  const typeBg    = TYPE_BG[task.type]    ?? c.subtle;
  const typeColor = TYPE_COLOR[task.type] ?? c.body;

  const statusStrip = isReview
    ? { bg: '#fef3c7', color: '#92400e', text: '⏳ Esperando revisión del admin…' }
    : isApproved
    ? { bg: c.successSubtle, color: c.successDark, text: '✅ ¡Tarea completada!' }
    : isRejected
    ? { bg: '#fef2f2', color: c.dangerDark, text: task.rejectionReason ? `💪 Casi: ${task.rejectionReason}` : '❌ Rechazada — inténtalo de nuevo' }
    : null;

  return (
    <div style={{ background: c.surface, borderRadius: 10, overflow: 'hidden', boxShadow: c.shadowMd, display: 'flex', flexDirection: 'column' }}>

      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 64 }}>

        {/* Left: bloque de tipo flush a la esquina */}
        <div style={{
          width: 56, flexShrink: 0,
          background: typeBg, color: typeColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
        }}>
          {typeEmoji}
        </div>

        {/* Center: título + descripción */}
        <div style={{ flex: 1, padding: '0.6rem 0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: c.heading, lineHeight: 1.3 }}>
            {task.title}
          </span>
          {task.description && (
            <span style={{ fontSize: '0.78rem', color: c.body, marginTop: 2, lineHeight: 1.4 }}>
              {task.description}
            </span>
          )}
        </div>

        {/* Right: recompensas */}
        <div style={{
          width: 72, flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0.5rem 0.75rem', gap: 2,
        }}>
          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#b45309' }}>🪙 {task.coinsReward}</span>
          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: c.primary }}>⭐ {task.xpReward}</span>
        </div>
      </div>

      {/* Franja de estado */}
      {statusStrip && (
        <div style={{
          background: statusStrip.bg, color: statusStrip.color,
          fontSize: '0.78rem', fontWeight: 600,
          padding: '0.3rem 0.75rem',
          borderTop: '1px solid rgba(0,0,0,0.05)',
        }}>
          {statusStrip.text}
        </div>
      )}

      {/* Botón — flush al fondo, sin wrapper */}
      {(isPending || (isRejected && !task.rejectionReason)) && (
        <Button
          disabled={complete.isPending}
          onClick={() => complete.mutate(task.id)}
          style={{
            borderRadius: 0,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            justifyContent: 'center',
            width: '100%',
            padding: '0.6rem',
            fontSize: '0.85rem',
            borderTop: `1px solid ${c.stroke}`,
            marginTop: 'auto',
          }}>
          {complete.isPending ? 'Enviando…' : isPending ? '🙋 ¡He terminado!' : '🔄 Intentarlo de nuevo'}
        </Button>
      )}

      {isRejected && task.rejectionReason && (
        <Button
          disabled={complete.isPending}
          onClick={() => complete.mutate(task.id)}
          style={{
            borderRadius: 0,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            justifyContent: 'center',
            width: '100%',
            padding: '0.6rem',
            fontSize: '0.85rem',
            borderTop: `1px solid ${c.stroke}`,
            marginTop: 'auto',
          }}>
          {complete.isPending ? 'Enviando…' : '🔄 Intentarlo de nuevo'}
        </Button>
      )}
    </div>
  );
}
