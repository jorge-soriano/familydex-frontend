import { useState } from 'react';
import { useUpdateChild } from '../hooks/useAdmin';
import type { ChildSummary } from '../api';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';
import { FormInput } from '../../../shared/components/FormInput';

interface Props {
  child: ChildSummary;
  onClose: () => void;
}

export default function EditChildModal({ child, onClose }: Props) {
  const [displayName, setDisplayName] = useState(child.displayName);
  const [password, setPassword] = useState('');
  const update = useUpdateChild();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dto: { displayName?: string; password?: string } = {};
    if (displayName !== child.displayName) dto.displayName = displayName;
    if (password) dto.password = password;
    if (!Object.keys(dto).length) { onClose(); return; }
    update.mutate({ id: child.id, dto }, { onSuccess: onClose });
  };

  const error = (update.error as any)?.response?.data?.message;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <form style={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={styles.title}>Editar — {child.username}</h2>
          <button type="button" style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <FormInput
          label="Nombre visible"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          minLength={2}
        />

        <FormInput
          label="Nueva contraseña"
          helper="Dejar vacío para no cambiar"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nueva contraseña"
        />

        {error && <p className="text-danger text-[0.85rem] m-0">{error}</p>}

        <div style={styles.actions}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: c.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:   { background: c.surface, borderRadius: 12, padding: '2rem', width: 'calc(100% - 2rem)', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  title:   { margin: 0, fontSize: '1.1rem', fontWeight: 800 },
  closeBtn:{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: c.caption, lineHeight: 1, padding: '0.2rem' },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' },
};
