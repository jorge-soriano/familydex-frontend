import type { Task } from '../api';
import { useCompleteTask } from '../hooks/useTasks';
import { Home, BookOpen, Crown, CheckCircle, XCircle, Clock, Calendar, Dumbbell, Flag, RefreshCw, ClipboardList } from 'lucide-react';
import { CoinIcon, XpIcon } from '../../../shared/components/GameIcons';
import { c } from '../../../styles/tokens';
import { Badge } from '../../../shared/components/Badge';
import type { BadgeVariant } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

const TYPE_LABEL: Record<string, string> = {
  hogar:           'Hogar',
  deberes:         'Deberes',
  comportamiento:  'Comportamiento',
  responsabilidad: 'Responsabilidad',
};

const TYPE_ICON_SM: Record<string, React.ReactNode> = {
  hogar:           <Home size={11} />,
  deberes:         <BookOpen size={11} />,
  comportamiento:  <Crown size={11} />,
  responsabilidad: <CheckCircle size={11} />,
};

const TYPE_ICON_LG: Record<string, React.ReactNode> = {
  hogar:           <Home size={22} />,
  deberes:         <BookOpen size={22} />,
  comportamiento:  <Crown size={22} />,
  responsabilidad: <CheckCircle size={22} />,
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
        <div className="flex gap-3 text-[0.78rem] text-body flex-wrap items-center">
          <span className="text-[0.7rem] bg-subtle text-body py-[1px] px-[7px] rounded whitespace-nowrap"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {TYPE_ICON_SM[task.type]} {TYPE_LABEL[task.type] ?? task.type}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CoinIcon size={12} /> {task.coinsReward}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><XpIcon size={12} /> {task.xpReward} XP</span>
          {task.dueDate && (
            <span className="text-caption" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} /> {task.dueDate}
            </span>
          )}
        </div>
        {task.description && (
          <p className="text-[0.82rem] text-body mt-[0.35rem] mb-0">{task.description}</p>
        )}
        {isRejected && task.rejectionReason && (
          <p className="text-[0.82rem] text-danger bg-danger-subtle px-2 py-[0.3rem] rounded mt-[0.35rem] mb-0"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <XCircle size={13} /> {task.rejectionReason}
          </p>
        )}
      </div>
    );
  }

  // ── Child variant — horizontal card ───────────────────────────────────────
  const typeIconLg = TYPE_ICON_LG[task.type] ?? <ClipboardList size={22} />;
  const typeBg     = TYPE_BG[task.type]    ?? c.subtle;
  const typeColor  = TYPE_COLOR[task.type] ?? c.body;

  const statusStrip = isReview
    ? { bg: '#fef3c7', color: '#92400e', icon: <Clock size={13} />, text: 'Esperando revisión del admin…' }
    : isApproved
    ? { bg: c.successSubtle, color: c.successDark, icon: <CheckCircle size={13} />, text: '¡Tarea completada!' }
    : isRejected
    ? {
        bg: '#fef2f2', color: c.dangerDark,
        icon: task.rejectionReason ? <Dumbbell size={13} /> : <XCircle size={13} />,
        text: task.rejectionReason ? `Casi: ${task.rejectionReason}` : 'Rechazada — inténtalo de nuevo',
      }
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
        }}>
          {typeIconLg}
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
          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: 3 }}>
            <CoinIcon size={13} /> {task.coinsReward}
          </span>
          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: c.primary, display: 'flex', alignItems: 'center', gap: 3 }}>
            <XpIcon size={12} /> {task.xpReward}
          </span>
        </div>
      </div>

      {/* Franja de estado */}
      {statusStrip && (
        <div style={{
          background: statusStrip.bg, color: statusStrip.color,
          fontSize: '0.78rem', fontWeight: 600,
          padding: '0.3rem 0.75rem',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', gap: '0.35rem',
        }}>
          {statusStrip.icon} {statusStrip.text}
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
          {complete.isPending ? 'Enviando…' : isPending
            ? <><Flag size={14} /> ¡He terminado!</>
            : <><RefreshCw size={14} /> Intentarlo de nuevo</>
          }
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
          {complete.isPending ? 'Enviando…' : <><RefreshCw size={14} /> Intentarlo de nuevo</>}
        </Button>
      )}
    </div>
  );
}
