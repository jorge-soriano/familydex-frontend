import { useState } from 'react';
import { useHistory } from '../hooks/useEconomy';
import type { TransactionType } from '../../../shared/types';

interface Props {
  childId?: number; // if provided, admin view for specific child
}

const TYPE_LABEL: Record<TransactionType, string> = {
  TaskReward:     '✅ Tarea aprobada',
  Penalty:        '❌ Penalización',
  RewardRedeemed: '🎁 Recompensa',
};
const TYPE_COLOR: Record<TransactionType, string> = {
  TaskReward: '#22c55e', Penalty: '#ef4444', RewardRedeemed: '#8b5cf6',
};

export default function HistoryList({ childId }: Props) {
  const [filterType, setFilterType] = useState<TransactionType | ''>('');

  const { data: transactions = [], isLoading } = useHistory({
    type: filterType || undefined,
    childId,
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Historial de transacciones</h3>
        <select
          style={styles.filter}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as TransactionType | '')}
        >
          <option value="">Todos los tipos</option>
          <option value="TaskReward">Tareas</option>
          <option value="Penalty">Penalizaciones</option>
          <option value="RewardRedeemed">Recompensas</option>
        </select>
      </div>

      {isLoading && <p style={styles.empty}>Cargando…</p>}

      {!isLoading && transactions.length === 0 && (
        <p style={styles.empty}>No hay transacciones.</p>
      )}

      {transactions.map((tx) => (
        <div key={tx.id} style={styles.row}>
          <div style={styles.left}>
            <span style={{ ...styles.typeBadge, background: TYPE_COLOR[tx.type] }}>
              {TYPE_LABEL[tx.type]}
            </span>
            <span style={styles.desc}>{tx.description}</span>
          </div>
          <div style={styles.right}>
            {tx.coinsDelta !== 0 && (
              <span style={{ color: tx.coinsDelta > 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                {tx.coinsDelta > 0 ? '+' : ''}{tx.coinsDelta} 🪙
              </span>
            )}
            {tx.xpDelta !== 0 && (
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                +{tx.xpDelta} XP
              </span>
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
  container: { background: '#fff', borderRadius: 10, padding: '1.25rem', marginTop: '1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { margin: 0, fontSize: '1rem', fontWeight: 700 },
  filter: { padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.85rem' },
  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9',
  },
  left: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  typeBadge: { color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, width: 'fit-content' },
  desc: { fontSize: '0.85rem', color: '#475569' },
  right: { display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.85rem', flexShrink: 0 },
  date: { color: '#94a3b8', fontSize: '0.78rem' },
  empty: { color: '#94a3b8', textAlign: 'center', padding: '1rem' },
};
