import { useState } from 'react';
import { useQuickComplete } from '../../tasks/hooks/useTasks';
import { useTaskTemplates } from '../../task-templates/hooks/useTaskTemplates';
import { economyApi } from '../../economy/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BALANCE_KEY, TRANSACTIONS_KEY } from '../../economy/hooks/useEconomy';
import { POKEMON_KEY } from '../../pokemon/hooks/usePokemon';
import type { TaskType } from '../../../shared/types';

interface Child { id: number; username: string; displayName: string }
interface Props { familyChildren: Child[] }

type Mode = 'logro' | 'directa';

const TYPE_OPTS: TaskType[] = ['hogar', 'deberes', 'comportamiento', 'responsabilidad'];

function useDirectReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ childId, coins, xp, reason }: { childId: number; coins: number; xp: number; reason: string }) =>
      economyApi.applyDirectReward({ childId, coins, xp, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BALANCE_KEY] });
      qc.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      qc.invalidateQueries({ queryKey: [POKEMON_KEY] });
    },
  });
}

export default function LogroTab({ familyChildren }: Props) {
  const [mode, setMode] = useState<Mode>('logro');
  const [form, setForm] = useState({
    childId: familyChildren[0]?.id ?? 0,
    title: '',
    type: 'hogar' as TaskType,
    coinsReward: 10,
    xpReward: 50,
    description: '',
    // for direct reward
    coins: 10,
    xp: 50,
    reason: '',
  });
  const [fromTemplate, setFromTemplate] = useState<number | ''>('');

  const { data: templates = [] } = useTaskTemplates(true);
  const quickComplete = useQuickComplete();
  const directReward  = useDirectReward();

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const applyTemplate = (tplId: number) => {
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    setForm((p) => ({ ...p, title: tpl.title, type: tpl.type, coinsReward: tpl.coinsReward, xpReward: tpl.xpReward, description: tpl.description ?? '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'logro') {
      quickComplete.mutate({
        childId: form.childId, title: form.title, type: form.type,
        coinsReward: form.coinsReward, xpReward: form.xpReward,
        description: form.description || undefined,
      }, { onSuccess: () => setForm((p) => ({ ...p, title: '', description: '' })) });
    } else {
      directReward.mutate({
        childId: form.childId, coins: form.coins, xp: form.xp, reason: form.reason,
      }, { onSuccess: () => setForm((p) => ({ ...p, reason: '' })) });
    }
  };

  const isPending = quickComplete.isPending || directReward.isPending;
  const error = ((quickComplete.error || directReward.error) as any)?.response?.data?.message;
  const success = quickComplete.isSuccess || directReward.isSuccess;

  return (
    <div style={{ maxWidth: 520 }}>
      {/* Tipo de acción */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {([['logro', '🏆 Registrar logro'], ['directa', '🎁 Recompensa directa']] as [Mode, string][]).map(([m, lbl]) => (
          <button key={m} style={{
            padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.875rem',
            background: mode === m ? '#3b82f6' : '#f1f5f9',
            color: mode === m ? '#fff' : '#475569',
          }} onClick={() => setMode(m)}>{lbl}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Hijo */}
        <label style={lbl}>
          Hijo
          <select style={inp} value={form.childId} onChange={(e) => set('childId', +e.target.value)}>
            {familyChildren.map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
          </select>
        </label>

        {mode === 'logro' && (
          <>
            {/* Desde plantilla */}
            {templates.length > 0 && (
              <label style={lbl}>
                Desde plantilla (opcional)
                <select style={inp} value={fromTemplate}
                  onChange={(e) => { const v = +e.target.value; setFromTemplate(v); if (v) applyTemplate(v); }}>
                  <option value="">— Rellenar manualmente —</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </label>
            )}

            <label style={lbl}>
              Título del logro *
              <input style={inp} value={form.title} required placeholder="Ej: Notable en mates"
                onChange={(e) => set('title', e.target.value)} />
            </label>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <label style={{ ...lbl, flex: 1 }}>
                Tipo
                <select style={inp} value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {TYPE_OPTS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </label>
              <label style={{ ...lbl, flex: 1 }}>
                🪙 Monedas
                <input style={inp} type="number" min={0} value={form.coinsReward}
                  onChange={(e) => set('coinsReward', +e.target.value)} />
              </label>
              <label style={{ ...lbl, flex: 1 }}>
                ⭐ XP
                <input style={inp} type="number" min={0} value={form.xpReward}
                  onChange={(e) => set('xpReward', +e.target.value)} />
              </label>
            </div>

            <label style={lbl}>
              Descripción (opcional)
              <input style={inp} value={form.description} placeholder="Contexto adicional…"
                onChange={(e) => set('description', e.target.value)} />
            </label>
          </>
        )}

        {mode === 'directa' && (
          <>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', background: '#f0fdf4', padding: '0.6rem 0.75rem', borderRadius: 8 }}>
              Añade monedas y/o XP sin crear una misión. Útil para: buen comportamiento, ayuda espontánea, etc.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <label style={{ ...lbl, flex: 1 }}>
                🪙 Monedas
                <input style={inp} type="number" min={0} value={form.coins}
                  onChange={(e) => set('coins', +e.target.value)} />
              </label>
              <label style={{ ...lbl, flex: 1 }}>
                ⭐ XP
                <input style={inp} type="number" min={0} value={form.xp}
                  onChange={(e) => set('xp', +e.target.value)} />
              </label>
            </div>
            <label style={lbl}>
              Motivo *
              <input style={inp} value={form.reason} required placeholder="Ej: Buen comportamiento en el médico"
                onChange={(e) => set('reason', e.target.value)} />
            </label>
          </>
        )}

        {error  && <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}
        {success && <p style={{ margin: 0, color: '#16a34a', fontSize: '0.85rem', fontWeight: 700 }}>✓ Guardado correctamente</p>}

        <button type="submit" style={{ padding: '0.65rem 1.25rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
          disabled={isPending}>
          {isPending ? 'Guardando…' : mode === 'logro' ? '🏆 Registrar logro' : '🎁 Aplicar recompensa'}
        </button>
      </form>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600 };
const inp: React.CSSProperties = { padding: '0.45rem 0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', fontSize: '0.875rem' };
