import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../shared/api/apiClient';
import { BALANCE_KEY, TRANSACTIONS_KEY } from '../hooks/useActivity';
import { POKEMON_KEY } from '../../pokemon/hooks/usePokemon';
import type { TransactionItem } from '../api';

interface Child { id: number; username: string; displayName: string }
interface Props { familyChildren: Child[] }

function useDirectRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { childIds: number[]; coinsDelta: number; xp: number; reason: string }) =>
      apiClient.post('/activity/direct-record', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BALANCE_KEY] });
      qc.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      qc.invalidateQueries({ queryKey: [POKEMON_KEY] });
    },
  });
}

/** Recent DirectRecord + Penalty transactions deduplicated by description */
function useRecentRecords() {
  return useQuery({
    queryKey: ['recent-records'],
    queryFn: () => apiClient.get<TransactionItem[]>('/activity/transactions').then((r) => r.data),
    select: (txs) => {
      const seen = new Set<string>();
      return txs
        .filter((t) => t.type === 'DirectRecord' || t.type === 'Penalty')
        .filter((t) => { if (seen.has(t.description)) return false; seen.add(t.description); return true; })
        .slice(0, 10);
    },
  });
}

export default function DirectRecordsForm({ familyChildren }: Props) {
  const [selectedChildren, setSelectedChildren] = useState<number[]>(
    familyChildren.length === 1 ? [familyChildren[0].id] : []
  );
  const [coins,  setCoins]  = useState(10);
  const [isNeg,  setIsNeg]  = useState(false);
  const [xp,     setXp]     = useState(50);
  const [reason, setReason] = useState('');

  const record       = useDirectRecord();
  const { data: recentRecords = [] } = useRecentRecords();

  const toggleChild = (id: number) =>
    setSelectedChildren((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const applyRecord = (tx: TransactionItem) => {
    setReason(tx.description);
    setCoins(Math.abs(tx.coinsDelta));
    setXp(tx.xpDelta);
    setIsNeg(tx.coinsDelta < 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildren.length || !reason) return;
    record.mutate(
      { childIds: selectedChildren, coinsDelta: isNeg ? -coins : coins, xp, reason },
      { onSuccess: () => { setReason(''); } }
    );
  };

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Selector de registros recientes */}
      {recentRecords.length > 0 && (
        <label style={{ ...lbl, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          Usar registro anterior (opcional)
          <select style={inp} defaultValue=""
            onChange={(e) => {
              const tx = recentRecords.find((r) => r.id === +e.target.value);
              if (tx) applyRecord(tx);
            }}>
            <option value="">— Rellenar manualmente —</option>
            {recentRecords.map((tx) => (
              <option key={tx.id} value={tx.id}>
                {tx.description} · {tx.coinsDelta > 0 ? '+' : ''}{tx.coinsDelta}🪙 +{tx.xpDelta}⭐
              </option>
            ))}
          </select>
        </label>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Multi-select hijos */}
        <div>
          <p style={{ ...lbl, marginBottom: '0.35rem' }}>
            Hijos <span style={{ color: '#94a3b8', fontWeight: 400 }}>(uno o varios)</span>
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {familyChildren.map((c) => {
              const sel = selectedChildren.includes(c.id);
              return (
                <button key={c.id} type="button"
                  style={{ padding: '0.4rem 0.85rem', borderRadius: 20, border: '2px solid',
                    borderColor: sel ? '#3b82f6' : '#e2e8f0', background: sel ? '#eff6ff' : '#fff',
                    color: sel ? '#1d4ed8' : '#475569', fontWeight: sel ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer' }}
                  onClick={() => toggleChild(c.id)}>
                  {c.displayName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Coins */}
        <div>
          <p style={{ ...lbl, marginBottom: '0.35rem' }}>Monedas</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button type="button"
              style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '2px solid', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                borderColor: !isNeg ? '#22c55e' : '#e2e8f0', background: !isNeg ? '#f0fdf4' : '#fff', color: !isNeg ? '#16a34a' : '#64748b' }}
              onClick={() => setIsNeg(false)}>+ Dar</button>
            <button type="button"
              style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '2px solid', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                borderColor: isNeg ? '#ef4444' : '#e2e8f0', background: isNeg ? '#fef2f2' : '#fff', color: isNeg ? '#dc2626' : '#64748b' }}
              onClick={() => setIsNeg(true)}>− Quitar</button>
            <input style={{ ...inp, width: 90 }} type="number" min={0} value={coins}
              onChange={(e) => setCoins(Math.max(0, +e.target.value))} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>monedas</span>
          </div>
        </div>

        {/* XP */}
        <div>
          <p style={{ ...lbl, marginBottom: '0.35rem' }}>XP <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.78rem' }}>siempre positivo</span></p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input style={{ ...inp, width: 90 }} type="number" min={0} value={xp}
              onChange={(e) => setXp(Math.max(0, +e.target.value))} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>XP</span>
          </div>
        </div>

        {/* Motivo */}
        <label style={{ ...lbl, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          Motivo *
          <input style={inp} value={reason} required
            placeholder="Ej: Buen comportamiento en el médico"
            onChange={(e) => setReason(e.target.value)} />
        </label>

        {(record.error as any)?.response?.data?.message && (
          <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem' }}>
            {(record.error as any).response.data.message}
          </p>
        )}
        {record.isSuccess && (
          <p style={{ margin: 0, color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>✓ Registro aplicado</p>
        )}

        <button type="submit"
          style={{ padding: '0.65rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
          disabled={record.isPending || !selectedChildren.length}>
          {record.isPending ? 'Aplicando…'
            : isNeg ? `❌ Quitar ${coins}🪙${xp > 0 ? ` · +${xp}⭐` : ''}`
            : `✅ Dar ${coins}🪙${xp > 0 ? ` · +${xp}⭐` : ''}`}
        </button>
      </form>
    </div>
  );
}

const lbl: React.CSSProperties = { margin: 0, fontSize: '0.85rem', fontWeight: 700 };
const inp: React.CSSProperties = { padding: '0.45rem 0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', fontSize: '0.875rem' };
