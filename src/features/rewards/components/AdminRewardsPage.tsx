import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRewards, useToggleReward, useApproveRequest, useRejectRequest, useRewardRequests } from '../hooks/useRewards';
import RewardForm from './RewardForm';
import ChildAvatar from '../../../shared/components/ChildAvatar';
import apiClient from '../../../shared/api/apiClient';
import type { Reward } from '../api';

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
  const childById = Object.fromEntries(children.map((c) => [c.id, c]));
  const toggle  = useToggleReward();
  const approve = useApproveRequest();
  const reject  = useRejectRequest();

  const pending = requests.filter((r) => r.status === 'Pending');

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <h2 style={styles.h2}>
          Tienda de recompensas
          {pending.length > 0 && (
            <span style={styles.badge}>{pending.length} pendientes</span>
          )}
        </h2>
        {tab === 'rewards' && (
          <button style={styles.newBtn} onClick={() => { setEditReward(null); setShowForm(true); }}>
            + Nueva recompensa
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['requests', 'rewards'] as Tab[]).map((t) => (
          <button key={t} style={{ ...styles.tab, background: tab === t ? '#3b82f6' : '#f1f5f9', color: tab === t ? '#fff' : '#333' }}
            onClick={() => setTab(t)}>
            {t === 'requests' ? `📋 Solicitudes${pending.length ? ` (${pending.length})` : ''}` : '🏪 Recompensas'}
          </button>
        ))}
      </div>

      {/* Requests tab */}
      {tab === 'requests' && (
        <div>
          {requests.length === 0 && <p style={styles.empty}>No hay solicitudes.</p>}
          {requests.map((rr) => (
            <div key={rr.id} style={styles.reqRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {childById[rr.childId] && (
                  <ChildAvatar
                    displayName={childById[rr.childId].displayName}
                    avatarColor={childById[rr.childId].avatarColor}
                    size={28}
                  />
                )}
                <div>
                  <strong>{rr.reward?.name ?? `Recompensa #${rr.rewardId}`}</strong>
                  <span style={{ marginLeft: '0.75rem', color: '#64748b', fontSize: '0.85rem' }}>
                    🪙 {rr.coinsReserved} reservadas
                  </span>
                </div>
              </div>
              <div style={styles.reqActions}>
                {rr.status === 'Pending' ? (
                  <>
                    <button style={styles.approveBtn} disabled={approve.isPending}
                      onClick={() => approve.mutate(rr.id)}>
                      ✓ Aprobar
                    </button>
                    <button style={styles.rejectBtn}
                      onClick={() => { setRejectId(rr.id); setRejectReason(''); }}>
                      ✗ Rechazar
                    </button>
                  </>
                ) : (
                  <span style={{ color: rr.status === 'Approved' ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>
                    {rr.status === 'Approved' ? '✅ Aprobada' : '❌ Rechazada'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rewards tab */}
      {tab === 'rewards' && (
        <div style={styles.grid}>
          {rewards.map((r) => (
            <div key={r.id} style={{ ...styles.rewardCard, opacity: r.isActive ? 1 : 0.55 }}>
              <div style={styles.cardHeader}>
                <span style={styles.rewardName}>{r.name}</span>
                <span style={styles.cost}>🪙 {r.coinCost}</span>
              </div>
              {r.description && <p style={styles.desc}>{r.description}</p>}
              <div style={styles.cardFooter}>
                <button style={styles.editBtn} onClick={() => { setEditReward(r); setShowForm(true); }}>Editar</button>
                <button
                  style={{ ...styles.toggleBtn, color: r.isActive ? '#ef4444' : '#22c55e' }}
                  onClick={() => toggle.mutate({ id: r.id, isActive: !r.isActive })}>
                  {r.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
          {rewards.length === 0 && <p style={styles.empty}>Sin recompensas creadas.</p>}
        </div>
      )}

      {/* Reject modal */}
      {rejectId !== null && (
        <div style={styles.overlay} onClick={() => setRejectId(null)}>
          <div style={styles.rejectModal} onClick={(e) => e.stopPropagation()}>
            <h3>Motivo del rechazo (opcional)</h3>
            <textarea style={styles.textarea} value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explica por qué se rechaza la solicitud…" />
            <div style={styles.rejectActions}>
              <button style={styles.cancelBtn} onClick={() => setRejectId(null)}>Cancelar</button>
              <button style={styles.confirmReject} disabled={reject.isPending}
                onClick={() => reject.mutate(
                  { id: rejectId!, reason: rejectReason || undefined },
                  { onSuccess: () => setRejectId(null) }
                )}>
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <RewardForm
          reward={editReward ?? undefined}
          onClose={() => { setShowForm(false); setEditReward(null); }}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: 900, margin: '0 auto' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  h2: { fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' },
  badge: { background: '#f59e0b', color: '#fff', fontSize: '0.8rem', padding: '3px 10px', borderRadius: 12, fontWeight: 700 },
  newBtn: { padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  tab: { padding: '0.5rem 1.25rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  reqRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#fff', borderRadius: 8, marginBottom: '0.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  reqActions: { display: 'flex', gap: '0.5rem' },
  approveBtn: { padding: '0.35rem 0.75rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  rejectBtn: { padding: '0.35rem 0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  rewardCard: { background: '#fff', borderRadius: 10, padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' },
  rewardName: { fontWeight: 700 },
  cost: { fontWeight: 800, color: '#1d4ed8' },
  desc: { fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.75rem' },
  cardFooter: { display: 'flex', gap: '0.5rem' },
  editBtn: { padding: '0.3rem 0.6rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' },
  toggleBtn: { padding: '0.3rem 0.6rem', background: 'transparent', border: '1px solid currentColor', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  empty: { color: '#94a3b8', gridColumn: '1/-1', padding: '1rem 0' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  rejectModal: { background: '#fff', borderRadius: 10, padding: '1.5rem', width: 380, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  textarea: { padding: '0.5rem', borderRadius: 6, border: '2px solid #e2e8f0', minHeight: 80 },
  rejectActions: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' },
  cancelBtn: { padding: '0.4rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' },
  confirmReject: { padding: '0.4rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
};
