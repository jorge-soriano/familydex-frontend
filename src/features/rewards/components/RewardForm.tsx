import { useState } from 'react';
import { useCreateReward, useEditReward } from '../hooks/useRewards';
import type { Reward } from '../api';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';
import { FormInput, FormTextarea } from '../../../shared/components/FormInput';

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={styles.title}>{isEditing ? 'Editar recompensa' : 'Nueva recompensa'}</h2>
          <button type="button" style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <FormInput
          label="Nombre *"
          value={form.name}
          required
          onChange={(e) => set('name', e.target.value)}
        />

        <FormTextarea
          label="Descripción"
          value={form.description}
          style={{ minHeight: 60 }}
          onChange={(e) => set('description', e.target.value)}
        />

        <FormInput
          label="Coste en monedas 🪙 *"
          type="number"
          min={1}
          value={form.coinCost}
          required
          onChange={(e) => set('coinCost', e.target.value)}
        />

        <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          Activa en la tienda
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={create.isPending || edit.isPending}>
            {create.isPending || edit.isPending ? 'Guardando…' : isEditing ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: c.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:   { background: c.surface, borderRadius: 12, padding: '2rem', width: 'calc(100% - 2rem)', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  title:   { margin: 0, fontSize: '1.25rem', fontWeight: 800 },
  closeBtn:{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: c.caption, lineHeight: 1, padding: '0.2rem' },
  error:   { color: c.danger, fontSize: '0.85rem' },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' },
};
