import { useState } from 'react';
import { useCreateReward, useEditReward, useDeleteReward } from '../hooks/useRewards';
import type { Reward } from '../api';
import { Button } from '../../../shared/components/Button';
import { FormInput, FormTextarea } from '../../../shared/components/FormInput';
import Modal from '../../../shared/components/Modal';
import ToggleSwitch from '../../../shared/components/ToggleSwitch';
import { c } from '../../../styles/tokens';

interface Props {
  reward?: Reward;
  onClose: () => void;
}

export default function RewardForm({ reward, onClose }: Props) {
  const [form, setForm] = useState({
    name:        reward?.name ?? '',
    description: reward?.description ?? '',
    coinCost:    reward?.coinCost ?? '',
    isActive:    reward?.isActive ?? true,
  });
  const [confirmDel, setConfirmDel] = useState(false);

  const create    = useCreateReward();
  const edit      = useEditReward();
  const del       = useDeleteReward();
  const isEditing = Boolean(reward);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dto = {
      name:        form.name,
      description: form.description || undefined,
      coinCost:    Number(form.coinCost),
      isActive:    form.isActive,
    };
    if (isEditing && reward) {
      edit.mutate({ id: reward.id, data: dto }, { onSuccess: onClose });
    } else {
      create.mutate(dto, { onSuccess: onClose });
    }
  };

  const error = ((create.error || edit.error) as any)?.response?.data?.message;

  return (
    <Modal title={isEditing ? 'Editar recompensa' : 'Nueva recompensa'} onClose={onClose} maxWidth={440}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

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
          type="number" min={1}
          value={form.coinCost}
          required
          onChange={(e) => set('coinCost', e.target.value)}
        />

        <ToggleSwitch
          label="Activa en la tienda"
          helper="Los hijos solo pueden solicitar recompensas activas"
          value={form.isActive}
          onChange={(v) => set('isActive', v)}
        />

        {error && <p style={{ color: c.danger, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

        <div style={{ borderTop: `1px solid ${c.subtle}`, paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>

          {isEditing && reward ? (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {!confirmDel ? (
                <Button type="button" size="sm" variant="ghost"
                  style={{ color: c.dangerDark, background: c.dangerSubtle, border: `1px solid ${c.stroke}`, boxShadow: 'none' }}
                  onClick={() => setConfirmDel(true)}>
                  🗑 Eliminar
                </Button>
              ) : (
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: c.dangerDark, fontWeight: 600 }}>¿Seguro?</span>
                  <Button type="button" variant="danger" size="sm" disabled={del.isPending}
                    onClick={() => del.mutate(reward.id, { onSuccess: onClose })}>
                    Sí
                  </Button>
                  <Button type="button" variant="secondary" size="sm"
                    onClick={() => setConfirmDel(false)}>
                    No
                  </Button>
                </div>
              )}
            </div>
          ) : <span />}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending || edit.isPending}>
              {create.isPending || edit.isPending ? 'Guardando…' : isEditing ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
