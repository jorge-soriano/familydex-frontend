import { useRewards, useRequestReward, useRewardRequests } from '../hooks/useRewards';
import { useBalance } from '../../activity/hooks/useActivity';
import type { Reward } from '../api';

export default function RewardShop() {
  const { data: rewards = [], isLoading } = useRewards();
  const { data: myRequests = [] } = useRewardRequests();
  const { data: balance } = useBalance();
  const request = useRequestReward();

  const coins = balance?.coins ?? 0;
  const pendingIds = new Set(
    myRequests.filter((r) => r.status === 'Pending').map((r) => r.rewardId)
  );

  const canAfford = (r: Reward) => coins >= r.coinCost;
  const isPending = (r: Reward) => pendingIds.has(r.id);

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Tienda de recompensas</h2>
      <p style={styles.balance}>Tu saldo: <strong>🪙 {coins}</strong></p>

      {isLoading && <p>Cargando…</p>}

      <div style={styles.grid}>
        {rewards.length === 0 && (
          <p style={styles.empty}>Aún no hay recompensas disponibles.</p>
        )}
        {rewards.map((r) => (
          <div
            key={r.id}
            style={{ ...styles.card, opacity: canAfford(r) ? 1 : 0.6 }}
          >
            <div style={styles.cardTop}>
              <span style={styles.name}>{r.name}</span>
              <span style={styles.cost}>🪙 {r.coinCost}</span>
            </div>

            {r.description && <p style={styles.desc}>{r.description}</p>}

            {!canAfford(r) && (
              <p style={styles.hint}>Necesitas {r.coinCost - coins} monedas más</p>
            )}

            {isPending(r) ? (
              <span style={styles.pendingBadge}>⏳ Solicitud enviada</span>
            ) : (
              <button
                style={{ ...styles.btn, opacity: canAfford(r) ? 1 : 0.4 }}
                disabled={!canAfford(r) || request.isPending}
                onClick={() => request.mutate(r.id)}
              >
                Solicitar
              </button>
            )}
          </div>
        ))}
      </div>

      {myRequests.length > 0 && (
        <div style={styles.history}>
          <h3 style={styles.h3}>Mis solicitudes</h3>
          {myRequests.map((rr) => (
            <div key={rr.id} style={styles.histRow}>
              <span>{rr.reward?.name ?? `Recompensa #${rr.rewardId}`}</span>
              <span style={styles[`status_${rr.status}` as keyof typeof styles] ?? {}}>
                {rr.status === 'Pending' ? '⏳ Pendiente'
                  : rr.status === 'Approved' ? '✅ Aprobada'
                  : '❌ Rechazada'}
              </span>
              {rr.status === 'Rejected' && rr.rejectionReason && (
                <span style={styles.reason}>{rr.rejectionReason}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {request.isError && (
        <p style={styles.error}>
          {(request.error as any)?.response?.data?.message ?? 'Error al solicitar'}
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: 800, margin: '0 auto' },
  h2: { fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' },
  h3: { fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' },
  balance: { color: '#475569', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: 10, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: 700 },
  cost: { fontWeight: 800, fontSize: '1.1rem', color: '#1d4ed8' },
  desc: { fontSize: '0.85rem', color: '#64748b', margin: 0 },
  hint: { fontSize: '0.75rem', color: '#ef4444', margin: 0 },
  btn: { padding: '0.45rem 1rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, marginTop: 'auto' },
  pendingBadge: { fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 },
  empty: { color: '#94a3b8', gridColumn: '1/-1' },
  history: {},
  histRow: { display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' },
  reason: { fontSize: '0.8rem', color: '#ef4444' },
  status_Pending: { color: '#f59e0b', fontWeight: 600 },
  status_Approved: { color: '#22c55e', fontWeight: 600 },
  status_Rejected: { color: '#ef4444', fontWeight: 600 },
  error: { color: '#ef4444', marginTop: '1rem' },
};
