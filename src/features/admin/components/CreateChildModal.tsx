import { useState } from 'react';
import { useCreateChild } from '../hooks/useAdmin';
import { c } from '../../../styles/tokens';

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
    <div style={styles.overlay} onClick={onClose}>
      <form style={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Nuevo hijo</h2>

        <label style={styles.label}>
          Nombre visible *
          <input style={styles.input} value={form.displayName} required minLength={2}
            onChange={(e) => set('displayName', e.target.value)} placeholder="Ej: Lucas" />
        </label>

        <label style={styles.label}>
          Nombre de usuario * <span className="text-caption font-normal text-[0.78rem]">(sin espacios, para iniciar sesión)</span>
          <input style={styles.input} value={form.username} required
            onChange={(e) => set('username', e.target.value)} placeholder="Ej: lucas" />
        </label>

        <label style={styles.label}>
          Contraseña *
          <input style={styles.input} type="password" value={form.password} required
            onChange={(e) => set('password', e.target.value)} placeholder="Contraseña" />
        </label>

        <div>
          <p style={styles.label}>Color del avatar</p>
          <div style={styles.colorRow}>
            {COLORS.map((col) => (
              <button key={col} type="button"
                style={{ ...styles.colorBtn, background: col, outline: form.avatarColor === col ? `3px solid ${c.navy}` : 'none', outlineOffset: 2 }}
                onClick={() => set('avatarColor', col)}
              />
            ))}
          </div>
          <div style={{ ...styles.avatarPreview, background: form.avatarColor }}>
            {form.displayName.charAt(0).toUpperCase() || '?'}
          </div>
        </div>

        {error && <p className="text-danger text-[0.85rem] m-0">{error}</p>}

        <div style={styles.actions}>
          <button type="button" style={styles.cancel} onClick={onClose}>Cancelar</button>
          <button type="submit" style={styles.submit} disabled={create.isPending}>
            {create.isPending ? 'Creando…' : 'Crear hijo'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay:      { position: 'fixed', inset: 0, background: c.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:        { background: c.surface, borderRadius: 12, padding: '2rem', width: 'calc(100% - 2rem)', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  title:        { margin: 0, fontSize: '1.25rem', fontWeight: 800 },
  label:        { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, margin: 0 },
  input:        { padding: '0.5rem', borderRadius: 6, border: `2px solid ${c.stroke}`, fontSize: '0.9rem' },
  colorRow:     { display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' },
  colorBtn:     { width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0 },
  avatarPreview:{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.surface, fontWeight: 800, fontSize: '1.25rem', marginTop: '0.5rem' },
  actions:      { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' },
  cancel:       { padding: '0.5rem 1rem', background: c.subtle, border: 'none', borderRadius: 6, cursor: 'pointer' },
  submit:       { padding: '0.5rem 1.25rem', background: c.primary, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
};
