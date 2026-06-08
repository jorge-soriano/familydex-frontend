import { useRewards, useRequestReward, useRewardRequests } from '../hooks/useRewards';
import { useBalance } from '../../activity/hooks/useActivity';
import { Gift, Clock } from 'lucide-react';
import { CoinIcon } from '../../../shared/components/GameIcons';
import type { Reward } from '../api';
import { c } from '../../../styles/tokens';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

export default function RewardShop() {
  const { data: rewards = [], isLoading } = useRewards();
  const { data: myRequests = [] }         = useRewardRequests();
  const { data: balance }                 = useBalance();
  const request = useRequestReward();

  const coins = balance?.coins ?? 0;
  const pendingIds = new Set(
    myRequests.filter((r) => r.status === 'Pending').map((r) => r.rewardId),
  );

  const canAfford = (r: Reward) => coins >= r.coinCost;
  const isPending = (r: Reward) => pendingIds.has(r.id);

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 1.5rem)', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header: título + saldo */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Premios</h2>
        <span style={{
          marginLeft: 'auto',
          background: c.warningSubtle, color: c.warningDark,
          fontWeight: 800, fontSize: '1rem',
          padding: '0.25rem 0.9rem', borderRadius: 20,
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        }}>
          <CoinIcon size={16} /> {coins}
        </span>
      </div>

      {isLoading && <p style={{ color: c.caption }}>Cargando…</p>}

      {/* Estado vacío */}
      {!isLoading && rewards.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: c.caption }}>
          <p style={{ margin: '0 0 0.75rem', display: 'flex', justifyContent: 'center' }}><Gift size={40} /></p>
          <p style={{ fontWeight: 700, margin: 0, color: c.body }}>Aún no hay premios</p>
          <p style={{ fontSize: '0.875rem', margin: '0.4rem 0 0' }}>
            Pide a tu padre que añada premios
          </p>
        </div>
      )}

      {/* Grid de recompensas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {rewards.map((r) => (
          <div key={r.id} style={{
            background: c.surface, borderRadius: 12,
            padding: '1.25rem', boxShadow: c.shadowCard,
            display: 'flex', flexDirection: 'column', gap: '0.6rem',
            opacity: !canAfford(r) && !isPending(r) ? 0.72 : 1,
          }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: c.heading }}>{r.name}</span>
            {r.description && (
              <p style={{ fontSize: '0.875rem', color: c.body, margin: 0, flex: 1 }}>{r.description}</p>
            )}

            {/* Footer: coste + acción */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', gap: '0.5rem' }}>
              <span style={{
                background: c.warningSubtle, color: c.warningDark,
                fontWeight: 800, fontSize: '0.875rem',
                padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              }}>
                <CoinIcon size={13} /> {r.coinCost}
              </span>

              {isPending(r) ? (
                <span style={{
                  background: c.warningSubtle, color: c.warningMid,
                  fontWeight: 700, fontSize: '0.78rem',
                  padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                }}>
                  <Clock size={12} /> Pedido enviado
                </span>
              ) : canAfford(r) ? (
                <Button
                  disabled={request.isPending}
                  onClick={() => request.mutate(r.id)}
                  style={{ fontSize: '0.875rem', padding: '0.4rem 0.9rem', whiteSpace: 'nowrap' }}>
                  ¡Lo quiero!
                </Button>
              ) : (
                <button
                  disabled
                  style={{
                    background: c.subtle, color: c.caption,
                    fontWeight: 600, fontSize: '0.78rem',
                    padding: '0.4rem 0.75rem', borderRadius: 6,
                    cursor: 'not-allowed', border: 'none', whiteSpace: 'nowrap',
                  }}>
                  Me faltan {r.coinCost - coins} <CoinIcon size={12}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mis peticiones */}
      {myRequests.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Mis peticiones</h3>
          <div style={{ background: c.surface, borderRadius: 10, boxShadow: c.shadowSm, overflow: 'hidden' }}>
            {myRequests.map((rr, idx) => (
              <div key={rr.id} style={{
                display: 'flex', gap: '1rem', alignItems: 'center',
                padding: '0.65rem 1rem', fontSize: '0.875rem',
                borderBottom: idx < myRequests.length - 1 ? `1px solid ${c.subtle}` : 'none',
              }}>
                <span style={{ flex: 1 }}>{rr.reward?.name ?? `Recompensa #${rr.rewardId}`}</span>
                <Badge
                  variant={rr.status === 'Pending' ? 'warning' : rr.status === 'Approved' ? 'success' : 'danger'}
                  subtle>
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
        <p aria-live="polite" role="alert" style={{ color: c.danger, marginTop: '1rem' }}>
          {(request.error as any)?.response?.data?.message ?? 'Error al solicitar'}
        </p>
      )}
    </div>
  );
}
