import ChildAvatar from '../../../shared/components/ChildAvatar';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCreateTask, useEditTask, useDeleteTask, useToggleEnabled, TASKS_KEY } from '../hooks/useTasks';
import { tasksApi } from '../api';
import type { CreateTaskDto, EditTaskDto, TaskWithSeries } from '../api';

interface Child { id: number; username: string; displayName: string; avatarColor?: string | null }

interface Props {
  task?: TaskWithSeries;
  children: Child[];
  onClose: () => void;
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function TaskForm({ task, children, onClose }: Props) {
  const createTask   = useCreateTask();
  const editTask     = useEditTask();
  const del          = useDeleteTask();
  const toggleEnable = useToggleEnabled();
  const isEditing    = Boolean(task);
  const [confirmDel, setConfirmDel] = useState(false);
  // Toggle local — el cambio real se aplica al guardar
  const [localEnabled, setLocalEnabled] = useState(task?.isEnabled !== false);

  // Multi-select children for creation
  const [selectedChildren, setSelectedChildren] = useState<number[]>(
    task ? [task.assignedTo] : children.length === 1 ? [children[0].id] : []
  );

  // Approved tasks as suggestions (deduplicated by title)
  const { data: suggestions = [] } = useQuery({
    queryKey: [TASKS_KEY, 'suggestions'],
    queryFn: () => tasksApi.getAll({ status: 'Approved' }),
    select: (tasks) => {
      const seen = new Set<string>();
      return tasks.filter((t) => { if (seen.has(t.title)) return false; seen.add(t.title); return true; }).slice(0, 15);
    },
    enabled: !task, // only for creation
  });

  const toggleChild = (id: number) =>
    setSelectedChildren((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

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
      editTask.mutate({ id: task.id, data: dto }, {
        onSuccess: async () => {
          const originalEnabled = task?.isEnabled !== false;
          if (localEnabled !== originalEnabled) await toggleEnable.mutateAsync(task.id);
          onClose();
        },
      });
    } else {
      const dto: CreateTaskDto = {
        assignedTo: selectedChildren.length === 1 ? selectedChildren[0] : (selectedChildren[0] ?? form.assignedTo),
        title: form.title,
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

        {/* Selector de tarea anterior — pre-rellena el formulario */}
        {!isEditing && suggestions.length > 0 && (
          <label style={styles.label}>
            Usar tarea anterior (opcional)
            <select style={styles.input} defaultValue=""
              onChange={(e) => {
                const t = suggestions.find((s) => s.id === +e.target.value);
                if (t) setForm((p) => ({ ...p, title: t.title, type: t.type, coinsReward: t.coinsReward, xpReward: t.xpReward, description: t.description ?? '' }));
              }}>
              <option value="">— Rellenar manualmente —</option>
              {suggestions.map((t) => (
                <option key={t.id} value={t.id}>{t.title} · 🪙{t.coinsReward} ⭐{t.xpReward}</option>
              ))}
            </select>
          </label>
        )}

        {/* Multi-select hijos — mismo estilo que DirectRecordsForm */}
        {!isEditing && (
          <div>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>
              Hijos <span style={{ color: '#94a3b8', fontWeight: 400 }}>(uno o varios)</span>
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {children.map((c) => {
                const sel = selectedChildren.includes(c.id);
                return (
                  <button key={c.id} type="button" title={c.displayName}
                    style={{ padding: '0.25rem', borderRadius: '50%', border: `3px solid ${sel ? '#3b82f6' : 'transparent'}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: sel ? '2px solid #bfdbfe' : 'none', outlineOffset: '1px' }}
                    onClick={() => toggleChild(c.id)}>
                    <ChildAvatar displayName={c.displayName} avatarColor={c.avatarColor} size={34} />
                  </button>
                );
              })}
            </div>
          </div>
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

        {/* Fila de botones: toggle+eliminar IZQUIERDA | cancelar+guardar DERECHA */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>

          {/* Izquierda: Deshabilitar (toggle local) + Eliminar — solo en edición */}
          {isEditing && task ? (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {/* Switch visual rojo/verde — el API call ocurre al Guardar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                onClick={() => setLocalEnabled(!localEnabled)}>
                <div style={{ width: 40, height: 22, borderRadius: 11, background: localEnabled ? '#22c55e' : '#ef4444', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: localEnabled ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: localEnabled ? '#16a34a' : '#dc2626', userSelect: 'none' }}>
                  {localEnabled ? 'Activa' : 'Desactivada'}
                </span>
              </div>

              {!confirmDel ? (
                <button type="button"
                  style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                  onClick={() => setConfirmDel(true)}>
                  🗑 Eliminar
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>¿Seguro?</span>
                  <button type="button"
                    style={{ padding: '0.3rem 0.65rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}
                    disabled={del.isPending}
                    onClick={() => del.mutate({ id: task.id }, { onSuccess: onClose })}>
                    Sí
                  </button>
                  <button type="button"
                    style={{ padding: '0.3rem 0.6rem', background: '#f1f5f9', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '0.78rem' }}
                    onClick={() => setConfirmDel(false)}>
                    No
                  </button>
                </div>
              )}
            </div>
          ) : <span />}

          {/* Derecha: Cancelar + Guardar */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" style={styles.cancel} onClick={onClose}>Cancelar</button>
            <button type="submit" style={styles.submit} disabled={isPending}>
              {isPending ? 'Guardando…' : isEditing ? 'Guardar' : 'Crear tarea'}
            </button>
          </div>
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
