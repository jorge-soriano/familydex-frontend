import { useState } from 'react';
import { useCreateChild } from '../hooks/useAdmin';
import { useUpdateChild, useToggleChildStatus } from '../hooks/useAdmin';
import type { ChildSummary } from '../api';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';
import { FormInput } from '../../../shared/components/FormInput';
import Modal from '../../../shared/components/Modal';
import ToggleSwitch from '../../../shared/components/ToggleSwitch';

const COLORS = ['#6366f1','#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

interface Props {
  child?: ChildSummary;
  onClose: () => void;
}

export default function ChildModal({ child, onClose }: Props) {
  const isEditing = Boolean(child);

  const [displayName, setDisplayName] = useState(child?.displayName ?? '');
  const [username,    setUsername]    = useState('');
  const [password,    setPassword]    = useState('');
  const [avatarColor, setAvatarColor] = useState(child?.avatarColor ?? COLORS[0]);
  const [isActive,    setIsActive]    = useState(child?.isActive ?? true);

  const create = useCreateChild();
  const update = useUpdateChild();
  const toggle = useToggleChildStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing) {
      create.mutate({ displayName, username, password, avatarColor }, { onSuccess: onClose });
      return;
    }

    const dto: { displayName?: string; password?: string; avatarColor?: string } = {};
    if (displayName !== child!.displayName) dto.displayName = displayName;
    if (password) dto.password = password;
    if (avatarColor !== (child!.avatarColor ?? COLORS[0])) dto.avatarColor = avatarColor;

    const statusChanged = isActive !== child!.isActive;
    const dataChanged   = Object.keys(dto).length > 0;

    if (!dataChanged && !statusChanged) { onClose(); return; }
    if (dataChanged)   await update.mutateAsync({ id: child!.id, dto });
    if (statusChanged) await toggle.mutateAsync({ id: child!.id, isActive });
    onClose();
  };

  const error = ((create.error || update.error) as any)?.response?.data?.message;
  const isPending = create.isPending || update.isPending || toggle.isPending;

  return (
    <Modal title={isEditing ? `Editar — ${child!.username}` : 'Nuevo hijo'} onClose={onClose} maxWidth={420}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        <FormInput
          label="Nombre visible *"
          helper={!isEditing ? 'El nombre que verá en la app' : undefined}
          value={displayName}
          required minLength={2}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ej: Lucas"
        />

        {!isEditing && (
          <FormInput
            label="Nombre de usuario *"
            helper="Sin espacios, para iniciar sesión"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej: lucas"
          />
        )}

        <FormInput
          label={isEditing ? 'Nueva contraseña' : 'Contraseña *'}
          helper={isEditing ? 'Dejar vacío para no cambiar' : undefined}
          type="password"
          value={password}
          required={!isEditing}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
        />

        <div>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', fontWeight: 600, color: c.heading }}>
            Color del avatar
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {COLORS.map((col) => (
              <button key={col} type="button"
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: col, flexShrink: 0, outline: avatarColor === col ? `3px solid ${c.navy}` : 'none', outlineOffset: 2 }}
                onClick={() => setAvatarColor(col)}
              />
            ))}
          </div>
        </div>

        {isEditing && (
          <ToggleSwitch
            label="Cuenta activa"
            helper="Un hijo inactivo no puede iniciar sesión ni recibir tareas"
            value={isActive}
            onChange={setIsActive}
          />
        )}

        {error && <p style={{ color: c.danger, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando…' : isEditing ? 'Guardar' : 'Crear hijo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
