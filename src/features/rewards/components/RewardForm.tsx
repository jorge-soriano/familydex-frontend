import { useState } from 'react';
import { useCreateReward, useEditReward } from '../hooks/useRewards';
import type { Reward } from '../api';

interface Props {
  reward?: Reward;
  onClose: () => void;
}

export default function RewardForm({ reward, onClose }: Props) {
  const [form, setForm] = useState({
    name: reward?.name ?? '',
    description: reward?.description ?? '',
    coinCost: reward?.coinCost ?? '',
    isActive: reward?.isActive ?? true,
  });
  const create = useCreateReward();
  const edit   = useEditReward();
  const isEditing = Boolean(reward);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dto = {
      name: form.name,
      description: form.description || undefined,
      coinCost: Number(form.coinCost),
      isActive: form.isActive,
    };
    if (isEditing && reward) {
      edit.mutate({ id: reward.id, data: dto }, { onSuccess: onClose });
    } else {
      create.mutate(dto, { onSuccess: onClose });
    }
  };

  const error = ((create.error || edit.error) as any)?.response?.data?.message;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <form style={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 style={styles.title}>{isEditing ? 'Editar recompensa' : 'Nueva recompensa'}</h2>

        <label style={styles.label}>
          Nombre *
          <input style={styles.input} value={form.name} required
            onChange={(e) => set('name', e.target.value)} />
        </label>

        <label style={styles.label}>
          Descripción
          <textarea style={{ ...styles.input, minHeight: 60 }} value={form.description}
            onChange={(e) => set('description', e.target.value)} />
        </label>

        <label style={styles.label}>
          Coste en monedas 🪙 *
          <input style={styles.input} type="number" min={1} value={form.coinCost} required
            onChange={(e) => set('coinCost', e.target.value)} />
        </label>

        <label style={{ ...styles.label, flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          Activa en la tienda
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.actions}>
          <button type="button" style={styles.cancel} onClick={onClose}>Cancelar</button>
          <button type="submit" style={styles.submit}
            disabled={create.isPending || edit.isPending}>
            {create.isPending || edit.isPending ? 'Guardando…' : isEditing ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  title: { margin: 0, fontSize: '1.25rem', fontWeight: 800 },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600 },
  input: { padding: '0.5rem', borderRadius: 6, border: '2px solid #e2e8f0', fontSize: '0.9rem' },
  error: { color: '#ef4444', fontSize: '0.85rem' },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' },
  cancel: { padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' },
  submit: { padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
};
