import { useState } from 'react';
import { useCreateTask, useEditTask } from '../hooks/useTasks';
import type { Task, CreateTaskDto, EditTaskDto } from '../api';

interface Child { id: number; username: string; displayName: string }

interface Props {
  task?: Task;          // provided when editing
  children: Child[];   // family's children list for assignedTo selector
  onClose: () => void;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function TaskForm({ task, children, onClose }: Props) {
  const createTask = useCreateTask();
  const editTask   = useEditTask();
  const isEditing  = Boolean(task);

  const [form, setForm] = useState({
    assignedTo: task?.assignedTo ?? (children[0]?.id ?? 0),
    title: task?.title ?? '',
    description: task?.description ?? '',
    type: task?.type ?? 'hogar',
    coinsReward: task?.coinsReward ?? 0,
    xpReward: task?.xpReward ?? 0,
    frequency: 'OneTime' as 'OneTime' | 'Daily' | 'Weekly',
    daysOfWeek: [] as number[],
    dueDate: task?.dueDate ?? '',
  });

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleDay = (d: number) =>
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(d)
        ? prev.daysOfWeek.filter((x) => x !== d)
        : [...prev.daysOfWeek, d],
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && task) {
      const dto: EditTaskDto = {
        title: form.title, description: form.description || undefined,
        type: form.type as any, coinsReward: form.coinsReward,
        xpReward: form.xpReward, dueDate: form.dueDate || null,
      };
      editTask.mutate({ id: task.id, data: dto }, { onSuccess: onClose });
    } else {
      const dto: CreateTaskDto = {
        assignedTo: form.assignedTo, title: form.title,
        description: form.description || undefined,
        type: form.type as any, coinsReward: form.coinsReward, xpReward: form.xpReward,
        frequency: form.frequency,
        daysOfWeek: form.frequency === 'Weekly' ? form.daysOfWeek : undefined,
        dueDate: form.frequency === 'OneTime' && form.dueDate ? form.dueDate : undefined,
      };
      createTask.mutate(dto, { onSuccess: onClose });
    }
  };

  const error = (createTask.error || editTask.error) as any;
  const isPending = createTask.isPending || editTask.isPending;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <form style={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 style={styles.title}>{isEditing ? 'Editar tarea' : 'Nueva tarea'}</h2>

        {!isEditing && (
          <label style={styles.label}>
            Asignar a
            <select style={styles.input} value={form.assignedTo}
              onChange={(e) => set('assignedTo', Number(e.target.value))}>
              {children.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName} (@{c.username})</option>
              ))}
            </select>
          </label>
        )}

        <label style={styles.label}>
          Título *
          <input style={styles.input} value={form.title} required
            onChange={(e) => set('title', e.target.value)} />
        </label>

        <label style={styles.label}>
          Descripción
          <textarea style={{ ...styles.input, minHeight: 60 }} value={form.description}
            onChange={(e) => set('description', e.target.value)} />
        </label>

        <div style={styles.row}>
          <label style={{ ...styles.label, flex: 1 }}>
            Tipo
            <select style={styles.input} value={form.type}
              onChange={(e) => set('type', e.target.value)}>
              {['hogar','deberes','comportamiento','responsabilidad'].map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </label>

          {!isEditing && (
            <label style={{ ...styles.label, flex: 1 }}>
              Frecuencia
              <select style={styles.input} value={form.frequency}
                onChange={(e) => set('frequency', e.target.value)}>
                <option value="OneTime">Puntual</option>
                <option value="Daily">Diaria</option>
                <option value="Weekly">Semanal</option>
              </select>
            </label>
          )}
        </div>

        <div style={styles.row}>
          <label style={{ ...styles.label, flex: 1 }}>
            Monedas 🪙
            <input style={styles.input} type="number" min={0} value={form.coinsReward}
              onChange={(e) => set('coinsReward', Number(e.target.value))} />
          </label>
          <label style={{ ...styles.label, flex: 1 }}>
            XP ⭐
            <input style={styles.input} type="number" min={0} value={form.xpReward}
              onChange={(e) => set('xpReward', Number(e.target.value))} />
          </label>
        </div>

        {!isEditing && form.frequency === 'Weekly' && (
          <div>
            <p style={styles.daysLabel}>Días de la semana</p>
            <div style={styles.days}>
              {DAYS.map((d, i) => (
                <button key={i} type="button"
                  style={{ ...styles.dayBtn, background: form.daysOfWeek.includes(i) ? '#3b82f6' : '#e2e8f0',
                    color: form.daysOfWeek.includes(i) ? '#fff' : '#333' }}
                  onClick={() => toggleDay(i)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {(isEditing || form.frequency === 'OneTime') && (
          <label style={styles.label}>
            Fecha límite
            <input style={styles.input} type="date" value={form.dueDate ?? ''}
              onChange={(e) => set('dueDate', e.target.value)} />
          </label>
        )}

        {error && <p style={styles.error}>{error?.response?.data?.message ?? 'Error'}</p>}

        <div style={styles.actions}>
          <button type="button" style={styles.cancel} onClick={onClose}>Cancelar</button>
          <button type="submit" style={styles.submit} disabled={isPending}>
            {isPending ? 'Guardando…' : isEditing ? 'Guardar' : 'Crear tarea'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', borderRadius: 12, padding: '2rem', width: 'calc(100% - 2rem)', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  title: { margin: 0, fontSize: '1.25rem', fontWeight: 800 },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600 },
  input: { padding: '0.5rem 0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', fontSize: '0.95rem' },
  row: { display: 'flex', gap: '1rem' },
  daysLabel: { fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.4rem' },
  days: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  dayBtn: { border: 'none', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' },
  error: { color: '#ef4444', fontSize: '0.85rem' },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
  cancel: { padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  submit: { padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 },
};
