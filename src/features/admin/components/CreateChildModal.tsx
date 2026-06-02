import { useState } from 'react';
import { useCreateChild } from '../hooks/useAdmin';

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
            onChange={(e) => set('displayName', e.target.value)}
            placeholder="Ej: Lucas" />
        </label>

        <label style={styles.label}>
          Nombre de usuario * <span style={styles.hint}>(sin espacios, para iniciar sesión)</span>
          <input style={styles.input} value={form.username} required
            onChange={(e) => set('username', e.target.value)}
            placeholder="Ej: lucas" />
        </label>

        <label style={styles.label}>
          Contraseña *
          <input style={styles.input} type="password" value={form.password} required
            onChange={(e) => set('password', e.target.value)}
            placeholder="Contraseña" />
        </label>

        <div>
          <p style={styles.label}>Color del avatar</p>
          <div style={styles.colorRow}>
            {COLORS.map((c) => (
              <button key={c} type="button"
                style={{
                  ...styles.colorBtn,
                  background: c,
                  outline: form.avatarColor === c ? '3px solid #1e3a5f' : 'none',
                  outlineOffset: 2,
                }}
                onClick={() => set('avatarColor', c)}
              />
            ))}
          </div>
          {/* Preview */}
          <div style={{ ...styles.avatarPreview, background: form.avatarColor }}>
            {form.displayName.charAt(0).toUpperCase() || '?'}
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

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
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  title: { margin: 0, fontSize: '1.25rem', fontWeight: 800 },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, margin: 0 },
  hint: { fontWeight: 400, color: '#94a3b8', fontSize: '0.78rem' },
  input: { padding: '0.5rem', borderRadius: 6, border: '2px solid #e2e8f0', fontSize: '0.9rem' },
  colorRow: { display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' },
  colorBtn: { width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0 },
  avatarPreview: { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.25rem', marginTop: '0.5rem' },
  error: { color: '#ef4444', fontSize: '0.85rem', margin: 0 },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' },
  cancel: { padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' },
  submit: { padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
};
