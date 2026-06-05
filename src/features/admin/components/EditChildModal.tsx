import { useState } from 'react';
import { useUpdateChild } from '../hooks/useAdmin';
import type { ChildSummary } from '../api';
import { c } from '../../../styles/tokens';

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

        <label style={styles.label}>
          Nombre visible
          <input style={styles.input} value={displayName}
            onChange={(e) => setDisplayName(e.target.value)} required minLength={2} />
        </label>

        <label style={styles.label}>
          Nueva contraseña <span className="text-caption font-normal text-[0.78rem]">(dejar vacío para no cambiar)</span>
          <input style={styles.input} type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña" />
        </label>

        {error && <p className="text-danger text-[0.85rem] m-0">{error}</p>}

        <div style={styles.actions}>
          <button type="button" style={styles.cancel} onClick={onClose}>Cancelar</button>
          <button type="submit" style={styles.submit} disabled={update.isPending}>
            {update.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: c.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:   { background: c.surface, borderRadius: 12, padding: '2rem', width: 'calc(100% - 2rem)', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  title:    { margin: 0, fontSize: '1.1rem', fontWeight: 800 },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: c.caption, lineHeight: 1, padding: '0.2rem' },
  label:   { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600 },
  input:   { padding: '0.5rem', borderRadius: 6, border: `2px solid ${c.stroke}`, fontSize: '0.9rem' },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' },
  cancel:  { padding: '0.5rem 1rem', background: c.subtle, border: 'none', borderRadius: 6, cursor: 'pointer' },
  submit:  { padding: '0.5rem 1.25rem', background: c.primary, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
};
