import { useState } from 'react';
import { useApplyPenalty } from '../hooks/useEconomy';

interface Child { id: number; username: string; displayName: string }
interface Props { children: Child[] }

export default function PenaltyForm({ children }: Props) {
  const [form, setForm] = useState({ childId: children[0]?.id ?? 0, amount: '', reason: '' });
  const penalty = useApplyPenalty();

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    penalty.mutate(
      { childId: Number(form.childId), amount: Number(form.amount), reason: form.reason },
      { onSuccess: () => setForm((p) => ({ ...p, amount: '', reason: '' })) }
    );
  };

  const error = (penalty.error as any)?.response?.data?.message;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Aplicar penalización — HU-13</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Hijo
          <select style={styles.input} value={form.childId}
            onChange={(e) => set('childId', e.target.value)}>
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.displayName} (@{c.username})</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Monedas a restar
          <input style={styles.input} type="number" min={1} value={form.amount} required
            onChange={(e) => set('amount', e.target.value)} placeholder="Ej: 10" />
        </label>

        <label style={styles.label}>
          Motivo *
          <input style={styles.input} type="text" value={form.reason} required
            onChange={(e) => set('reason', e.target.value)}
            placeholder="Describe el motivo de la penalización" />
        </label>

        {error && <p style={styles.error}>{error}</p>}
        {penalty.isSuccess && <p style={styles.success}>Penalización aplicada ✓</p>}

        <button style={styles.btn} type="submit" disabled={penalty.isPending}>
          {penalty.isPending ? 'Aplicando…' : 'Aplicar penalización'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: '#fff', borderRadius: 10, padding: '1.5rem', marginBottom: '1.5rem' },
  title: { margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600 },
  input: { padding: '0.5rem', borderRadius: 6, border: '2px solid #e2e8f0', fontSize: '0.9rem' },
  btn: { padding: '0.6rem 1.25rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, alignSelf: 'flex-start' },
  error: { color: '#ef4444', fontSize: '0.85rem', margin: 0 },
  success: { color: '#22c55e', fontSize: '0.85rem', margin: 0 },
};
