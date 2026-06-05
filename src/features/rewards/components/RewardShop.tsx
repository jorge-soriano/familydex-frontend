import { useRewards, useRequestReward, useRewardRequests } from '../hooks/useRewards';
import { useBalance } from '../../activity/hooks/useActivity';
import type { Reward } from '../api';
import { c } from '../../../styles/tokens';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

export default function RewardShop() {
  const { data: rewards = [], isLoading } = useRewards();
  const { data: myRequests = [] } = useRewardRequests();
  const { data: balance } = useBalance();
  const request = useRequestReward();

  const coins = balance?.coins ?? 0;
  const pendingIds = new Set(myRequests.filter((r) => r.status === 'Pending').map((r) => r.rewardId));

  const canAfford = (r: Reward) => coins >= r.coinCost;
  const isPending = (r: Reward) => pendingIds.has(r.id);

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Tienda de recompensas</h2>
      <p style={styles.balance}>Tu saldo: <strong>🪙 {coins}</strong></p>

      {isLoading && <p>Cargando…</p>}

      <div style={styles.grid}>
        {rewards.length === 0 && (
          <p className="text-caption" style={{ gridColumn: '1/-1' }}>Aún no hay recompensas disponibles.</p>
        )}
        {rewards.map((r) => (
          <div key={r.id} style={{ ...styles.card, opacity: canAfford(r) ? 1 : 0.6 }}>
            <div style={styles.cardTop}>
              <span className="font-bold">{r.name}</span>
              <span style={styles.cost}>🪙 {r.coinCost}</span>
            </div>
            {r.description && <p style={styles.desc}>{r.description}</p>}
            {!canAfford(r) && <p style={styles.hint}>Necesitas {r.coinCost - coins} monedas más</p>}
            {isPending(r) ? (
              <Badge variant="warning" subtle>⏳ Solicitud enviada</Badge>
            ) : (
              <Button
                style={{ marginTop: 'auto' }}
                disabled={!canAfford(r) || request.isPending}
                onClick={() => request.mutate(r.id)}>
                Solicitar
              </Button>
            )}
          </div>
        ))}
      </div>

      {myRequests.length > 0 && (
        <div style={styles.history}>
          <h3 style={styles.h3}>Mis solicitudes</h3>
          <div style={{ background: c.surface, borderRadius: 10, boxShadow: c.shadowSm, overflow: 'hidden' }}>
          {myRequests.map((rr) => (
            <div key={rr.id} style={{ ...styles.histRow, borderBottom: `1px solid ${c.subtle}` }}>
              <span>{rr.reward?.name ?? `Recompensa #${rr.rewardId}`}</span>
              <Badge variant={rr.status === 'Pending' ? 'warning' : rr.status === 'Approved' ? 'success' : 'danger'} subtle>
                {rr.status === 'Pending' ? 'Pendiente' : rr.status === 'Approved' ? 'Aprobada' : 'Rechazada'}
              </Badge>
              {rr.status === 'Rejected' && rr.rejectionReason && (
                <span style={{ fontSize: '0.8rem', color: c.danger }}>{rr.rejectionReason}</span>
              )}
            </div>
          ))}
          </div>
        </div>
      )}

      {request.isError && (
        <p style={{ color: c.danger, marginTop: '1rem' }}>
          {(request.error as any)?.response?.data?.message ?? 'Error al solicitar'}
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:         { padding: '1.5rem', maxWidth: 1200, margin: '0 auto' },
  h2:           { fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' },
  h3:           { fontSize: '1rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' },
  balance:      { color: c.body, marginBottom: '1.5rem' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  card:         { background: c.surface, borderRadius: 10, padding: '1.25rem', boxShadow: c.shadowMd, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  cardTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cost:         { fontWeight: 800, fontSize: '1.1rem', color: c.primaryDark },
  desc:         { fontSize: '0.85rem', color: c.body, margin: 0 },
  hint:         { fontSize: '0.75rem', color: c.danger, margin: 0 },
  history:      {},
  histRow:      { display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.65rem 1rem', fontSize: '0.85rem' },
};
