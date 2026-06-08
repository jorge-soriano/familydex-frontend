import ChildAvatar from '../../../shared/components/ChildAvatar';
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { CoinIcon, XpIcon } from '../../../shared/components/GameIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../shared/api/apiClient';
import { BALANCE_KEY, TRANSACTIONS_KEY } from '../hooks/useActivity';
import { POKEMON_KEY } from '../../pokemon/hooks/usePokemon';
import type { TransactionItem } from '../api';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';
import { FormInput, FormSelect } from '../../../shared/components/FormInput';

interface Child { id: number; username: string; displayName: string; avatarColor?: string | null }
interface Props { familyChildren: Child[]; onClose?: () => void }

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

export default function DirectRecordsForm({ familyChildren, onClose }: Props) {
  const [selectedChildren, setSelectedChildren] = useState<number[]>(
    familyChildren.length === 1 ? [familyChildren[0].id] : []
  );
  const [coins,  setCoins]  = useState(10);
  const [isNeg,  setIsNeg]  = useState(false);
  const [xp,     setXp]     = useState(50);
  const [reason, setReason] = useState('');

  const record = useDirectRecord();
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
      { onSuccess: () => { setReason(''); onClose?.(); } }
    );
  };

  return (
    <div style={{ maxWidth: 560 }}>
      {recentRecords.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <FormSelect
            label="Usar registro anterior (opcional)"
            defaultValue=""
            onChange={(e) => {
              const tx = recentRecords.find((r) => r.id === +e.target.value);
              if (tx) applyRecord(tx);
            }}
          >
            <option value="">— Rellenar manualmente —</option>
            {recentRecords.map((tx) => (
              <option key={tx.id} value={tx.id}>
                {tx.description} · {tx.coinsDelta > 0 ? '+' : ''}{tx.coinsDelta} monedas +{tx.xpDelta} XP
              </option>
            ))}
          </FormSelect>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Multi-select hijos */}
        <div>
          <p style={{ ...lbl, marginBottom: '0.35rem' }}>
            Hijos <span style={{ color: c.caption, fontWeight: 400 }}>(uno o varios)</span>
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {familyChildren.map((ch) => {
              const sel = selectedChildren.includes(ch.id);
              return (
                <button key={ch.id} type="button" title={ch.displayName}
                  style={{ padding: '0.25rem', borderRadius: '50%', border: `3px solid ${sel ? c.primary : 'transparent'}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: sel ? `2px solid ${c.primaryLight}` : 'none', outlineOffset: '1px' }}
                  onClick={() => toggleChild(ch.id)}>
                  <ChildAvatar displayName={ch.displayName} avatarColor={ch.avatarColor} size={34} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Coins */}
        <div>
          <p style={{ ...lbl, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Monedas <CoinIcon size={14} />
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button type="button"
              style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '2px solid', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                borderColor: !isNeg ? c.success : c.stroke, background: !isNeg ? c.successSubtle : c.surface, color: !isNeg ? c.successDark : c.body }}
              onClick={() => setIsNeg(false)}>+ Dar</button>
            <button type="button"
              style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '2px solid', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                borderColor: isNeg ? c.danger : c.stroke, background: isNeg ? c.dangerSubtle : c.surface, color: isNeg ? c.dangerDark : c.body }}
              onClick={() => setIsNeg(true)}>− Quitar</button>
            <input style={{ ...inp, width: 90 }} type="number" min={0} value={coins}
              onChange={(e) => setCoins(Math.max(0, +e.target.value))} />
            <span style={{ fontSize: '0.85rem', color: c.body }}>monedas</span>
          </div>
        </div>

        {/* XP */}
        <div>
          <p style={{ ...lbl, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            XP <XpIcon size={14} /> <span style={{ color: c.caption, fontWeight: 400, fontSize: '0.78rem' }}>siempre positivo</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input style={{ ...inp, width: 90 }} type="number" min={0} value={xp}
              onChange={(e) => setXp(Math.max(0, +e.target.value))} />
            <span style={{ fontSize: '0.85rem', color: c.body }}>XP</span>
          </div>
        </div>

        {/* Motivo */}
        <FormInput
          label="Motivo *"
          value={reason}
          required
          placeholder="Ej: Buen comportamiento en el médico"
          onChange={(e) => setReason(e.target.value)}
        />

        {(record.error as any)?.response?.data?.message && (
          <p style={{ margin: 0, color: c.danger, fontSize: '0.85rem' }}>
            {(record.error as any).response.data.message}
          </p>
        )}
        {record.isSuccess && (
          <p style={{ margin: 0, color: c.successDark, fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle size={14} /> Registro aplicado
          </p>
        )}

        <Button
          type="submit"
          disabled={record.isPending || !selectedChildren.length}
          style={{ padding: '0.65rem 1.25rem', fontSize: '1rem', width: '100%', justifyContent: 'center' }}
        >
          {record.isPending ? 'Aplicando…' : isNeg
            ? <><XCircle size={14} /> Quitar {coins} <CoinIcon size={13} />{xp > 0 ? <> · +{xp} <XpIcon size={13} /></> : null}</>
            : <><CheckCircle size={14} /> Dar {coins} <CoinIcon size={13} />{xp > 0 ? <> · +{xp} <XpIcon size={13} /></> : null}</>
          }
        </Button>
      </form>
    </div>
  );
}

const lbl: React.CSSProperties = { margin: 0, fontSize: '0.85rem', fontWeight: 600 };
const inp: React.CSSProperties = { padding: '0.45rem 0.6rem', borderRadius: 6, border: `2px solid ${c.stroke}`, fontSize: '0.875rem' };
