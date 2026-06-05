import ChildAvatar from '../../../shared/components/ChildAvatar';
import { Button } from '../../../shared/components/Button';
import { FormInput, FormSelect, FormTextarea } from '../../../shared/components/FormInput';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCreateTask, useEditTask, useDeleteTask, useToggleEnabled, TASKS_KEY } from '../hooks/useTasks';
import { tasksApi } from '../api';
import type { CreateTaskDto, EditTaskDto, TaskWithSeries } from '../api';
import { c } from '../../../styles/tokens';

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
  const [localEnabled, setLocalEnabled] = useState(task?.isEnabled !== false);

  const [selectedChildren, setSelectedChildren] = useState<number[]>(
    task ? [task.assignedTo] : children.length === 1 ? [children[0].id] : []
  );

  const { data: suggestions = [] } = useQuery({
    queryKey: [TASKS_KEY, 'suggestions'],
    queryFn: () => tasksApi.getAll({ status: 'Approved' }),
    select: (tasks) => {
      const seen = new Set<string>();
      return tasks.filter((t) => { if (seen.has(t.title)) return false; seen.add(t.title); return true; }).slice(0, 15);
    },
    enabled: !task,
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
    coinsReward: task?.coinsReward ?? 5,
    xpReward: task?.xpReward ?? 25,
    frequency: 'OneTime' as 'OneTime' | 'Daily' | 'Weekly',
    daysOfWeek: [] as number[],
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
        xpReward: form.xpReward,
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
      };
      createTask.mutate(dto, { onSuccess: onClose });
    }
  };

  const error = (createTask.error || editTask.error) as any;
  const isPending = createTask.isPending || editTask.isPending;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <form style={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={styles.title}>{isEditing ? 'Editar tarea' : 'Nueva tarea'}</h2>
          <button type="button" style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {!isEditing && suggestions.length > 0 && (
          <FormSelect
            label="Usar tarea anterior (opcional)"
            defaultValue=""
            onChange={(e) => {
              const t = suggestions.find((s) => s.id === +e.target.value);
              if (t) setForm((p) => ({ ...p, title: t.title, type: t.type, coinsReward: t.coinsReward, xpReward: t.xpReward, description: t.description ?? '' }));
            }}>
            <option value="">— Rellenar manualmente —</option>
            {suggestions.map((t) => (
              <option key={t.id} value={t.id}>{t.title} · 🪙{t.coinsReward} ⭐{t.xpReward}</option>
            ))}
          </FormSelect>
        )}

        {!isEditing && (
          <div>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>
              Hijos <span style={{ color: c.caption, fontWeight: 400 }}>(uno o varios)</span>
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {children.map((ch) => {
                const sel = selectedChildren.includes(ch.id);
                return (
                  <button key={ch.id} type="button" title={ch.displayName}
                    style={{ padding: '0.25rem', borderRadius: '50%', border: `3px solid ${sel ? c.primary : 'transparent'}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: sel ? `2px solid ${c.primaryLight}` : 'none', outlineOffset: '1px' }}
                    onClick={() => toggleChild(ch.id)}>
                    <ChildAvatar displayName={ch.displayName} avatarColor={ch.avatarColor} size={34} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <FormInput label="Título *" value={form.title} required onChange={(e) => set('title', e.target.value)} />

        <FormTextarea label="Descripción" value={form.description} onChange={(e) => set('description', e.target.value)} style={{ minHeight: 60 }} />

        <div style={styles.row}>
          <FormSelect label="Tipo" value={form.type} onChange={(e) => set('type', e.target.value)} style={{ flex: 1 }}>
            {['hogar','deberes','comportamiento','responsabilidad'].map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </FormSelect>

          {!isEditing && (
            <FormSelect label="Frecuencia" value={form.frequency} onChange={(e) => set('frequency', e.target.value)} style={{ flex: 1 }}>
              <option value="OneTime">Puntual</option>
              <option value="Daily">Diaria</option>
              <option value="Weekly">Semanal</option>
            </FormSelect>
          )}
        </div>

        <div style={styles.row}>
          <FormInput label="Monedas 🪙" type="number" min={0} value={form.coinsReward} onChange={(e) => set('coinsReward', Number(e.target.value))} style={{ flex: 1 }} />
          <FormInput label="XP ⭐" type="number" min={0} value={form.xpReward} onChange={(e) => set('xpReward', Number(e.target.value))} style={{ flex: 1 }} />
        </div>

        {!isEditing && form.frequency === 'Weekly' && (
          <div>
            <p style={styles.daysLabel}>Días de la semana</p>
            <div style={styles.days}>
              {DAYS.map((d, i) => (
                <button key={i} type="button"
                  style={{ ...styles.dayBtn, background: form.daysOfWeek.includes(i) ? c.primary : c.stroke, color: form.daysOfWeek.includes(i) ? c.surface : c.heading }}
                  onClick={() => toggleDay(i)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {isEditing && task && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Estado</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              onClick={() => setLocalEnabled(!localEnabled)}>
              <div style={{ width: 40, height: 22, borderRadius: 11, background: localEnabled ? c.success : c.captionLight, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 2, left: localEnabled ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: c.surface, boxShadow: c.shadowSm, transition: 'left 0.2s' }} />
              </div>
              <span style={{ fontSize: '0.85rem', color: c.body, userSelect: 'none' }}>
                {localEnabled ? 'Activa' : 'Desactivada'}
              </span>
            </div>
          </div>
        )}

        {error && <p style={styles.error}>{error?.response?.data?.message ?? 'Error'}</p>}

        <div style={{ borderTop: `1px solid ${c.subtle}`, paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>

          {isEditing && task ? (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {!confirmDel ? (
                <button type="button"
                  style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: `1px solid ${c.stroke}`, background: c.dangerSubtle, color: c.dangerDark, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                  onClick={() => setConfirmDel(true)}>
                  🗑 Eliminar
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: c.dangerDark, fontWeight: 600 }}>¿Seguro?</span>
                  <button type="button"
                    style={{ padding: '0.3rem 0.65rem', background: c.danger, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}
                    disabled={del.isPending}
                    onClick={() => del.mutate({ id: task.id }, { onSuccess: onClose })}>
                    Sí
                  </button>
                  <button type="button"
                    style={{ padding: '0.3rem 0.6rem', background: c.subtle, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}
                    onClick={() => setConfirmDel(false)}>
                    No
                  </button>
                </div>
              )}
            </div>
          ) : <span />}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando…' : isEditing ? 'Guardar' : 'Crear tarea'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay:   { position: 'fixed', inset: 0, background: c.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:     { background: c.surface, borderRadius: 12, padding: '2rem', width: 'calc(100% - 2rem)', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  title:     { margin: 0, fontSize: '1.25rem', fontWeight: 800 },
  closeBtn:  { background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: c.caption, lineHeight: 1, padding: '0.2rem' },
  row:       { display: 'flex', gap: '1rem' },
  daysLabel: { fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.4rem' },
  days:      { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  dayBtn:    { border: 'none', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' },
  error:     { color: c.danger, fontSize: '0.85rem' },
};
