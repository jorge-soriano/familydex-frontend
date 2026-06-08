import { useState } from 'react';
import { useCreateChild } from '../hooks/useAdmin';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';
import { FormInput } from '../../../shared/components/FormInput';
import Modal from '../../../shared/components/Modal';

const COLORS = ['#6366f1','#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

interface Props { onClose: () => void }

export default function CreateChildModal({ onClose }: Props) {
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    password: '',
    avatarColor: COLORS[0],
  });
  const create = useCreateChild();

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(form, { onSuccess: onClose });
  };

  const error = (create.error as any)?.response?.data?.message;

  return (
    <Modal title="Nuevo hijo" onClose={onClose} maxWidth={420}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        <FormInput
          label="Nombre visible *"
          helper="El nombre que verá en la app"
          value={form.displayName}
          required minLength={2}
          onChange={(e) => set('displayName', e.target.value)}
          placeholder="Ej: Lucas"
        />

        <FormInput
          label="Nombre de usuario *"
          helper="Sin espacios, para iniciar sesión"
          value={form.username}
          required
          onChange={(e) => set('username', e.target.value)}
          placeholder="Ej: lucas"
        />

        <FormInput
          label="Contraseña *"
          type="password"
          value={form.password}
          required
          onChange={(e) => set('password', e.target.value)}
          placeholder="Contraseña"
        />

        <div>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', fontWeight: 600, color: c.heading }}>
            Color del avatar
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {COLORS.map((col) => (
              <button key={col} type="button"
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: col, flexShrink: 0, outline: form.avatarColor === col ? `3px solid ${c.navy}` : 'none', outlineOffset: 2 }}
                onClick={() => set('avatarColor', col)}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-danger text-[0.85rem] m-0">{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Creando…' : 'Crear hijo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
