import ChildAvatar from '../../../shared/components/ChildAvatar';
import { Badge } from '../../../shared/components/Badge';
import type { BadgeVariant } from '../../../shared/components/Badge';
import { useHistory } from '../hooks/useActivity';
import type { TransactionType } from '../../../shared/types';

interface Props {
  childId?: number;
  filterType?: string;
  /** Admin view: maps childId → child info for avatar display */
  childMap?: Record<number, { displayName: string; avatarColor: string | null }>;
}

const TYPE_LABEL: Record<TransactionType, string> = {
  TaskReward:     'Tarea aprobada',
  Penalty:        'Penalización',
  RewardRedeemed: 'Recompensa canjeada',
  DirectReward:   'Recompensa directa',
  DirectRecord:   'Registro directo',
};
const TYPE_VARIANT: Record<TransactionType, BadgeVariant> = {
  TaskReward:     'success',
  Penalty:        'danger',
  RewardRedeemed: 'neutral',
  DirectReward:   'neutral',
  DirectRecord:   'warning',
};

export default function HistoryList({ childId, filterType, childMap }: Props) {
  const { data: transactions = [], isLoading } = useHistory({
    type: (filterType || undefined) as TransactionType | undefined,
    childId,
  });

  if (isLoading) return <p className="text-caption p-4">Cargando…</p>;

  if (!transactions.length) return (
    <p className="text-caption text-center p-8">
      No hay actividad registrada.
    </p>
  );

  return (
    <div className="bg-surface rounded-[10px] px-4 py-2">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex justify-between items-center py-[0.45rem] border-b border-subtle gap-3">

          {/* Left: badge + description + child name */}
          <div className="flex flex-col gap-[0.2rem] flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={TYPE_VARIANT[tx.type]}>{TYPE_LABEL[tx.type]}</Badge>
              {childMap && tx.childId && childMap[tx.childId] && (
                <ChildAvatar displayName={childMap[tx.childId].displayName} avatarColor={childMap[tx.childId].avatarColor} size={24} />
              )}
            </div>
            <span className="text-[0.875rem] text-body overflow-hidden text-ellipsis whitespace-nowrap">{tx.description}</span>
          </div>

          {/* Right: amounts + date */}
          <div className="flex gap-[0.65rem] items-center text-[0.875rem] shrink-0">
            {tx.coinsDelta !== 0 && (
              <span className={`font-bold ${tx.coinsDelta > 0 ? 'text-success' : 'text-danger'}`}>
                {tx.coinsDelta > 0 ? '+' : ''}{tx.coinsDelta} 🪙
              </span>
            )}
            {tx.xpDelta !== 0 && (
              <span className="text-warning font-bold">+{tx.xpDelta} ⭐</span>
            )}
            <span className="text-caption text-[0.75rem]">
              {new Date(tx.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
