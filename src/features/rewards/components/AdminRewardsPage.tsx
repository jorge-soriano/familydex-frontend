import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRewards, useToggleReward, useApproveRequest, useRejectRequest, useRewardRequests } from '../hooks/useRewards';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';
import RewardForm from './RewardForm';
import ChildAvatar from '../../../shared/components/ChildAvatar';
import apiClient from '../../../shared/api/apiClient';
import type { Reward } from '../api';
import { c } from '../../../styles/tokens';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { FormTextarea } from '../../../shared/components/FormInput';

interface ChildInfo { id: number; displayName: string; avatarColor?: string | null }

function useChildren() {
  return useQuery<ChildInfo[]>({
    queryKey: ['children'],
    queryFn: () => apiClient.get<ChildInfo[]>('/auth/children').then((r) => r.data),
  });
}

type Tab = 'rewards' | 'requests';

export default function AdminRewardsPage() {
  const [tab, setTab] = useState<Tab>('requests');
  const [showForm, setShowForm] = useState(false);
  const [editReward, setEditReward] = useState<Reward | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: rewards = [] } = useRewards();
  const { data: requests = [] } = useRewardRequests();
  const { data: children = [] } = useChildren();
  const childById = Object.fromEntries(children.map((ch) => [ch.id, ch]));
  const toggle  = useToggleReward();
  const approve = useApproveRequest();
  const reject  = useRejectRequest();

  const pending = requests.filter((r) => r.status === 'Pending');
  const isNarrow = useWindowWidth() < 640;

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Tienda de recompensas</h2>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['requests', 'rewards'] as Tab[]).map((t) => (
          <button key={t} style={{ ...styles.tab, color: tab === t ? c.primary : c.body, borderBottom: tab === t ? `2px solid ${c.primary}` : '2px solid transparent' }}
            onClick={() => setTab(t)}>
            {t === 'requests' ? `📋 Solicitudes${pending.length ? ` (${pending.length})` : ''}` : '🏪 Recompensas'}
          </button>
        ))}
      </div>

      {/* Requests tab */}
      {tab === 'requests' && (
        <div style={{ background: c.surface, borderRadius: 10, boxShadow: c.shadowSm, overflow: 'hidden' }}>
          {requests.length === 0 && <p className="text-caption" style={{ padding: '1rem' }}>No hay solicitudes.</p>}
          {requests.map((rr) => (
            <div key={rr.id} style={{ ...styles.reqRow, borderBottom: `1px solid ${c.subtle}` }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <strong style={{ fontSize: '0.9rem' }}>{rr.reward?.name ?? `Recompensa #${rr.rewardId}`}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: c.body }}>
                  {childById[rr.childId] && (
                    <ChildAvatar displayName={childById[rr.childId].displayName} avatarColor={childById[rr.childId].avatarColor} size={20} />
                  )}
                  <span>🪙 {rr.coinsReserved} monedas</span>
                </div>
              </div>
              <div style={styles.reqActions}>
                {rr.status === 'Pending' ? (
                  <>
                    <button
                      title="Aprobar"
                      style={isNarrow ? styles.approveBtnSm : styles.approveBtn}
                      disabled={approve.isPending}
                      onClick={() => approve.mutate(rr.id)}>
                      {isNarrow ? '✓' : '✓ Aprobar'}
                    </button>
                    <button
                      title="Rechazar"
                      style={isNarrow ? styles.rejectBtnSm : styles.rejectBtn}
                      onClick={() => { setRejectId(rr.id); setRejectReason(''); }}>
                      {isNarrow ? '✗' : '✗ Rechazar'}
                    </button>
                  </>
                ) : (
                  <Badge variant={rr.status === 'Approved' ? 'success' : 'danger'} subtle>
                    {rr.status === 'Approved' ? 'Aprobada' : 'Rechazada'}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rewards tab */}
      {tab === 'rewards' && (
        <>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Button onClick={() => { setEditReward(null); setShowForm(true); }}>+ Nueva recompensa</Button>
        </div>
        <div style={styles.grid}>
          {rewards.map((r) => (
            <div key={r.id} style={{ ...styles.rewardCard, opacity: r.isActive ? 1 : 0.55 }}>
              <div style={styles.cardHeader}>
                <span className="font-bold">{r.name}</span>
                <span style={{ fontWeight: 800, color: c.primaryDark }}>🪙 {r.coinCost}</span>
              </div>
              {r.description && <p style={styles.desc}>{r.description}</p>}
              <div style={styles.cardFooter}>
                <button style={styles.editBtn} onClick={() => { setEditReward(r); setShowForm(true); }}>Editar</button>
                <button style={{ ...styles.toggleBtn, color: r.isActive ? c.danger : c.primary }}
                  onClick={() => toggle.mutate({ id: r.id, isActive: !r.isActive })}>
                  {r.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
          {rewards.length === 0 && <p className="text-caption py-4" style={{ gridColumn: '1/-1' }}>Sin recompensas creadas.</p>}
        </div>
        </>
      )}

      {/* Reject modal */}
      {rejectId !== null && (
        <div style={styles.overlay} onClick={() => setRejectId(null)}>
          <div style={styles.rejectModal} onClick={(e) => e.stopPropagation()}>
            <h3 className="m-0 font-extrabold">Motivo del rechazo</h3>
            <FormTextarea
              helper="Opcional. Se enviará al hijo al rechazar."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explica por qué se rechaza la solicitud…"
            />
            <div style={styles.rejectActions}>
              <Button variant="secondary" onClick={() => setRejectId(null)}>Cancelar</Button>
              <Button variant="danger" disabled={reject.isPending}
                onClick={() => reject.mutate({ id: rejectId!, reason: rejectReason || undefined }, { onSuccess: () => setRejectId(null) })}>
                ✖ Rechazar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showForm && <RewardForm reward={editReward ?? undefined} onClose={() => { setShowForm(false); setEditReward(null); }} />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:          { padding: '1.5rem', maxWidth: 900, margin: '0 auto' },
  h2:            { fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1rem' },
  tabs:          { display: 'flex', flexWrap: 'wrap', borderBottom: `2px solid ${c.stroke}`, marginBottom: '1.5rem' },
  tab:           { padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', background: 'transparent', marginBottom: '-2px' },
  reqRow:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem' },
  reqActions:    { display: 'flex', gap: '0.5rem' },
  approveBtn:    { padding: '0.35rem 0.75rem', background: c.success, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  rejectBtn:     { padding: '0.35rem 0.75rem', background: c.danger,  color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  approveBtnSm:  { width: 34, height: 34, background: c.success, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  rejectBtnSm:   { width: 34, height: 34, background: c.danger,  color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  rewardCard:    { background: c.surface, borderRadius: 10, padding: '1.25rem', boxShadow: c.shadowMd },
  cardHeader:    { display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' },
  desc:          { fontSize: '0.85rem', color: c.body, margin: '0 0 0.75rem' },
  cardFooter:    { display: 'flex', gap: '0.5rem' },
  editBtn:       { padding: '0.35rem 0.75rem', background: c.subtle, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 },
  toggleBtn:     { padding: '0.35rem 0.75rem', background: 'transparent', border: '1px solid currentColor', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 },
  overlay:       { position: 'fixed', inset: 0, background: c.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  rejectModal:   { background: c.surface, borderRadius: 10, padding: '1.5rem', width: 380, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  rejectActions: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' },
  confirmReject: { padding: '0.4rem 1rem', background: c.danger, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
};
