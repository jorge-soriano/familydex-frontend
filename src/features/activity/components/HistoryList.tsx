import ChildAvatar from '../../../shared/components/ChildAvatar';
import { useHistory } from '../hooks/useActivity';
import type { TransactionType } from '../../../shared/types';

interface Props {
  childId?: number;
  filterType?: string;
  /** Admin view: maps childId → child info for avatar display */
  childMap?: Record<number, { displayName: string; avatarColor: string | null }>;
}

const TYPE_LABEL: Record<TransactionType, string> = {
  TaskReward:     '✅ Tarea aprobada',
  Penalty:        '❌ Penalización',
  RewardRedeemed: '🎁 Recompensa canjeada',
  DirectReward:   '🎁 Recompensa directa',
  DirectRecord:   '📝 Registro directo',
};
const TYPE_COLOR: Record<TransactionType, string> = {
  TaskReward:     '#22c55e',
  Penalty:        '#ef4444',
  RewardRedeemed: '#8b5cf6',
  DirectReward:   '#3b82f6',
  DirectRecord:   '#f59e0b',
};

export default function HistoryList({ childId, filterType, childMap }: Props) {
  const { data: transactions = [], isLoading } = useHistory({
    type: (filterType || undefined) as TransactionType | undefined,
    childId,
  });

  if (isLoading) return <p style={{ color: '#94a3b8', padding: '1rem' }}>Cargando…</p>;

  if (!transactions.length) return (
    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
      No hay actividad registrada.
    </p>
  );

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '0.5rem 1rem' }}>
      {transactions.map((tx) => (
        <div key={tx.id} style={styles.row}>

          {/* Left: badge + description + child name */}
          <div style={styles.left}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ ...styles.typeBadge, background: TYPE_COLOR[tx.type] }}>
                {TYPE_LABEL[tx.type]}
              </span>
              {/* Child avatar — only in admin view when childMap provided */}
              {childMap && tx.childId && childMap[tx.childId] && (
                <ChildAvatar displayName={childMap[tx.childId].displayName} avatarColor={childMap[tx.childId].avatarColor} size={24} />
              )}
            </div>
            <span style={styles.desc}>{tx.description}</span>
          </div>

          {/* Right: amounts + date */}
          <div style={styles.right}>
            {tx.coinsDelta !== 0 && (
              <span style={{ color: tx.coinsDelta > 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                {tx.coinsDelta > 0 ? '+' : ''}{tx.coinsDelta} 🪙
              </span>
            )}
            {tx.xpDelta !== 0 && (
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>+{tx.xpDelta} ⭐</span>
            )}
            <span style={styles.date}>
              {new Date(tx.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.65rem 0', borderBottom: '1px solid #f1f5f9', gap: '0.75rem',
  },
  left:       { display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: 0 },
  typeBadge:  { color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, flexShrink: 0 },

  desc:       { fontSize: '0.83rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  right:      { display: 'flex', gap: '0.65rem', alignItems: 'center', fontSize: '0.83rem', flexShrink: 0 },
  date:       { color: '#94a3b8', fontSize: '0.75rem' },
};
