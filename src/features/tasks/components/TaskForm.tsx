import ChildAvatar from '../../../shared/components/ChildAvatar';
import { Trash2 } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { FormInput, FormSelect, FormTextarea } from '../../../shared/components/FormInput';
import Modal from '../../../shared/components/Modal';
import ToggleSwitch from '../../../shared/components/ToggleSwitch';
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

  const initialEditFreq = task?.series?.frequency ?? 'OneTime';

  const [form, setForm] = useState({
    assignedTo:     task?.assignedTo ?? (children[0]?.id ?? 0),
    title:          task?.title ?? '',
    description:    task?.description ?? '',
    type:           task?.type ?? 'hogar',
    coinsReward:    task?.coinsReward ?? 5,
    xpReward:       task?.xpReward ?? 25,
    frequency:      'OneTime' as 'OneTime' | 'Daily' | 'Weekly',
    daysOfWeek:     [] as number[],
    editFrequency:  initialEditFreq as 'OneTime' | 'Daily' | 'Weekly',
    editDaysOfWeek: task?.series?.daysOfWeek ? (JSON.parse(task.series.daysOfWeek) as number[]) : [] as number[],
    isEnabled:      task?.isEnabled !== false,
  });

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleDay = (d: number, edit = false) =>
    setForm((prev) => {
      const key = edit ? 'editDaysOfWeek' : 'daysOfWeek';
      const cur = prev[key];
      return { ...prev, [key]: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d] };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && task) {
      const hasSeries = Boolean(task.seriesId);
      const dto: EditTaskDto = {
        title:       form.title,
        description: form.description || undefined,
        type:        form.type as any,
        coinsReward: form.coinsReward,
        xpReward:    form.xpReward,
        ...(hasSeries && { frequency: form.editFrequency }),
        ...(hasSeries && form.editFrequency === 'Weekly' && { daysOfWeek: JSON.stringify(form.editDaysOfWeek) }),
      };
      await editTask.mutateAsync({ id: task.id, data: dto, applyToSeries: hasSeries });
      const originalEnabled = task?.isEnabled !== false;
      if (form.isEnabled !== originalEnabled) await toggleEnable.mutateAsync(task.id);
      onClose();
    } else {
      const dto: CreateTaskDto = {
        assignedTo:  selectedChildren.length >= 1 ? selectedChildren[0] : form.assignedTo,
        title:       form.title,
        description: form.description || undefined,
        type:        form.type as any,
        coinsReward: form.coinsReward,
        xpReward:    form.xpReward,
        frequency:   form.frequency,
        daysOfWeek:  form.frequency === 'Weekly' ? form.daysOfWeek : undefined,
      };
      const created = await createTask.mutateAsync(dto);
      if (!form.isEnabled) await toggleEnable.mutateAsync(created.id);
      onClose();
    }
  };

  const error = (createTask.error || editTask.error) as any;
  const isPending = createTask.isPending || editTask.isPending || toggleEnable.isPending;

  return (
    <Modal title={isEditing ? 'Editar tarea' : 'Nueva tarea'} onClose={onClose} maxWidth={520}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

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
              <option key={t.id} value={t.id}>{t.title} · {t.coinsReward} monedas / {t.xpReward} XP</option>
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

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FormSelect label="Tipo" value={form.type} onChange={(e) => set('type', e.target.value)}>
              {['hogar','deberes','comportamiento','responsabilidad'].map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </FormSelect>
          </div>

          {!isEditing ? (
            <div style={{ flex: 1, minWidth: 0 }}>
              <FormSelect label="Frecuencia" value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>
                <option value="OneTime">Puntual</option>
                <option value="Daily">Diaria</option>
                <option value="Weekly">Semanal</option>
              </FormSelect>
            </div>
          ) : task?.seriesId ? (
            <div style={{ flex: 1, minWidth: 0 }}>
              <FormSelect label="Frecuencia" value={form.editFrequency} onChange={(e) => set('editFrequency', e.target.value)}>
                <option value="Daily">Diaria</option>
                <option value="Weekly">Semanal</option>
              </FormSelect>
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', fontWeight: 600, color: c.heading }}>Frecuencia</p>
              <div style={{ padding: '0.55rem 0.75rem', background: c.subtle, borderRadius: 6, border: `2px solid ${c.stroke}`, fontSize: '0.95rem', color: c.body }}>
                Puntual
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FormInput label="Monedas" type="number" min={0} value={form.coinsReward} onChange={(e) => set('coinsReward', Number(e.target.value))} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FormInput label="XP" type="number" min={0} value={form.xpReward} onChange={(e) => set('xpReward', Number(e.target.value))} />
          </div>
        </div>

        {!isEditing && form.frequency === 'Weekly' && (
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.4rem' }}>Días de la semana</p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {DAYS.map((d, i) => (
                <button key={i} type="button"
                  style={{ border: 'none', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: form.daysOfWeek.includes(i) ? c.primary : c.stroke, color: form.daysOfWeek.includes(i) ? c.surface : c.heading }}
                  onClick={() => toggleDay(i)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {isEditing && task?.seriesId && form.editFrequency === 'Weekly' && (
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.4rem' }}>Días de la semana</p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {DAYS.map((d, i) => (
                <button key={i} type="button"
                  style={{ border: 'none', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: form.editDaysOfWeek.includes(i) ? c.primary : c.stroke, color: form.editDaysOfWeek.includes(i) ? c.surface : c.heading }}
                  onClick={() => toggleDay(i, true)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        <ToggleSwitch
          label="Visible para el niño"
          helper="Las tareas desactivadas no aparecen en la lista del niño"
          value={form.isEnabled}
          onChange={(v) => set('isEnabled', v)}
        />

        {error && <p style={{ color: c.danger, fontSize: '0.85rem', margin: 0 }}>{error?.response?.data?.message ?? 'Error'}</p>}

        <div style={{ borderTop: `1px solid ${c.subtle}`, paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>

          {isEditing && task ? (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {!confirmDel ? (
                <Button type="button" variant="ghost"
                  style={{ color: c.danger, boxShadow: 'none' }}
                  onClick={() => setConfirmDel(true)}>
                  <Trash2 size={14} /> Eliminar
                </Button>
              ) : (
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: c.dangerDark, fontWeight: 600 }}>¿Seguro?</span>
                  <Button type="button" variant="danger" size="sm" disabled={del.isPending}
                    onClick={() => del.mutate({ id: task.id }, { onSuccess: onClose })}>
                    Sí
                  </Button>
                  <Button type="button" variant="secondary" size="sm"
                    onClick={() => setConfirmDel(false)}>
                    No
                  </Button>
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
    </Modal>
  );
}
