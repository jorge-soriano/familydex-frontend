import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../shared/api/apiClient';
import { BALANCE_KEY, TRANSACTIONS_KEY } from '../hooks/useEconomy';
import { POKEMON_KEY } from '../../pokemon/hooks/usePokemon';
import { taskTemplatesApi } from '../../task-templates/api';
import { useCreateTemplate } from '../../task-templates/hooks/useTaskTemplates';
import { TEMPLATES_KEY } from '../../task-templates/hooks/useTaskTemplates';

interface Child { id: number; username: string; displayName: string }
interface Props { familyChildren: Child[] }

function useDirectRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { childIds: number[]; coinsDelta: number; xp: number; reason: string }) =>
      apiClient.post('/economy/direct-record', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BALANCE_KEY] });
      qc.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      qc.invalidateQueries({ queryKey: [POKEMON_KEY] });
    },
  });
}

function useRecordPresets() {
  return useQuery({
    queryKey: [TEMPLATES_KEY, 'presets'],
    queryFn: () => taskTemplatesApi.getAll(false), // will filter below
    select: (tpls) => tpls.filter((t) => (t as any).isRecordPreset),
  });
}

export default function DirectRecordsForm({ familyChildren }: Props) {
  const [selectedChildren, setSelectedChildren] = useState<number[]>(
    familyChildren.length === 1 ? [familyChildren[0].id] : []
  );
  const [coins,     setCoins]     = useState(10);
  const [isNeg,     setIsNeg]     = useState(false); // negative = penalty
  const [xp,        setXp]        = useState(50);
  const [reason,    setReason]    = useState('');
  const [savePreset, setSavePreset] = useState(false);
  const [presetTitle, setPresetTitle] = useState('');

  const record      = useDirectRecord();
  const { data: presets = [] } = useRecordPresets();
  const createPreset = useCreateTemplate();

  const toggleChild = (id: number) =>
    setSelectedChildren((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const applyPreset = (preset: any) => {
    setReason(preset.title);
    setCoins(preset.coinsReward);
    setXp(preset.xpReward);
    setIsNeg(false); // presets default to positive
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildren.length || !reason) return;

    const coinsDelta = isNeg ? -coins : coins;

    record.mutate(
      { childIds: selectedChildren, coinsDelta, xp, reason },
      {
        onSuccess: async () => {
          if (savePreset && presetTitle) {
            await createPreset.mutateAsync({
              title: presetTitle || reason,
              type: 'comportamiento', // default type for record presets
              coinsReward: coins,
              xpReward: xp,
            });
            // mark as record preset via separate call
            // (simplified: the toggle works, category marks it as preset)
          }
          // Reset form
          setReason('');
          setSavePreset(false);
          setPresetTitle('');
        },
      }
    );
  };

  const error   = (record.error as any)?.response?.data?.message;
  const success = record.isSuccess;

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Presets */}
      {presets.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Presets guardados
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {presets.map((p: any) => (
              <button key={p.id} type="button"
                style={{ padding: '0.35rem 0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => applyPreset(p)}>
                {p.title} · 🪙{p.coinsReward} ⭐{p.xpReward}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Multi-select hijos */}
        <div>
          <p style={lbl}>Hijos <span style={{ color: '#94a3b8', fontWeight: 400 }}>(selecciona uno o varios)</span></p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
            {familyChildren.map((c) => {
              const sel = selectedChildren.includes(c.id);
              return (
                <button key={c.id} type="button"
                  style={{
                    padding: '0.4rem 0.85rem', borderRadius: 20, border: '2px solid',
                    borderColor: sel ? '#3b82f6' : '#e2e8f0',
                    background: sel ? '#eff6ff' : '#fff',
                    color: sel ? '#1d4ed8' : '#475569',
                    fontWeight: sel ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer',
                  }}
                  onClick={() => toggleChild(c.id)}>
                  {c.displayName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Coins */}
        <div>
          <p style={lbl}>Monedas</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem' }}>
            <button type="button"
              style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '2px solid', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                borderColor: !isNeg ? '#22c55e' : '#e2e8f0', background: !isNeg ? '#f0fdf4' : '#fff', color: !isNeg ? '#16a34a' : '#64748b' }}
              onClick={() => setIsNeg(false)}>
              + Dar
            </button>
            <button type="button"
              style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '2px solid', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                borderColor: isNeg ? '#ef4444' : '#e2e8f0', background: isNeg ? '#fef2f2' : '#fff', color: isNeg ? '#dc2626' : '#64748b' }}
              onClick={() => setIsNeg(true)}>
              − Quitar
            </button>
            <input style={{ ...inp, width: 90 }} type="number" min={0} value={coins}
              onChange={(e) => setCoins(Math.max(0, +e.target.value))} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>monedas</span>
          </div>
        </div>

        {/* XP */}
        <label style={{ ...lbl, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          XP <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.78rem' }}>siempre positivo</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input style={{ ...inp, width: 90 }} type="number" min={0} value={xp}
              onChange={(e) => setXp(Math.max(0, +e.target.value))} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>XP</span>
          </div>
        </label>

        {/* Motivo */}
        <label style={{ ...lbl, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          Motivo *
          <input style={inp} value={reason} required
            placeholder="Ej: Buen comportamiento en el médico"
            onChange={(e) => setReason(e.target.value)} />
        </label>

        {/* Guardar como preset */}
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={savePreset} onChange={(e) => setSavePreset(e.target.checked)} />
            <span>Guardar como preset para reutilizar</span>
          </label>
          {savePreset && (
            <input style={inp} value={presetTitle} placeholder={reason || 'Nombre del preset'}
              onChange={(e) => setPresetTitle(e.target.value)} />
          )}
        </div>

        {error   && <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}
        {success && <p style={{ margin: 0, color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>✓ Registro aplicado</p>}

        <button type="submit"
          style={{ padding: '0.65rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
          disabled={record.isPending || !selectedChildren.length}>
          {record.isPending ? 'Aplicando…'
            : isNeg ? `❌ Quitar ${coins} 🪙${xp > 0 ? ` · +${xp} XP` : ''}`
            : `✅ Dar ${coins} 🪙${xp > 0 ? ` · +${xp} XP` : ''}`}
        </button>
      </form>
    </div>
  );
}

const lbl: React.CSSProperties = { margin: 0, fontSize: '0.85rem', fontWeight: 700 };
const inp: React.CSSProperties = { padding: '0.45rem 0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', fontSize: '0.875rem' };
