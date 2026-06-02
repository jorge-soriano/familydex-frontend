import { useState } from 'react';
import {
  useTaskTemplates, useCreateTemplate, useEditTemplate,
  useToggleTemplate, useCreateTaskFromTemplate, useQuickCompleteFromTemplate,
} from '../../task-templates/hooks/useTaskTemplates';
import type { TaskTemplate } from '../../task-templates/api';
import type { TaskType } from '../../../shared/types';

interface Child { id: number; username: string; displayName: string }
interface Props { familyChildren: Child[] }

const TYPE_OPTS: TaskType[] = ['hogar', 'deberes', 'comportamiento', 'responsabilidad'];

function TemplateForm({
  initial, onSave, onCancel,
}: {
  initial?: Partial<TaskTemplate>;
  onSave: (data: object) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    type: initial?.type ?? 'hogar' as TaskType,
    coinsReward: initial?.coinsReward ?? 10,
    xpReward: initial?.xpReward ?? 50,
    description: initial?.description ?? '',
    category: initial?.category ?? '',
  });
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', border: '2px solid #e2e8f0' }}>
      <input style={inp} placeholder="Título *" value={form.title} required onChange={(e) => set('title', e.target.value)} />
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <select style={{ ...inp, flex: 1 }} value={form.type} onChange={(e) => set('type', e.target.value)}>
          {TYPE_OPTS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <input style={{ ...inp, width: 80 }} type="number" min={0} placeholder="🪙" value={form.coinsReward} onChange={(e) => set('coinsReward', +e.target.value)} />
        <input style={{ ...inp, width: 80 }} type="number" min={0} placeholder="⭐ XP" value={form.xpReward}    onChange={(e) => set('xpReward', +e.target.value)} />
      </div>
      <input style={inp} placeholder="Descripción (opcional)" value={form.description} onChange={(e) => set('description', e.target.value)} />
      <input style={inp} placeholder="Categoría (opcional, ej: Exámenes)" value={form.category} onChange={(e) => set('category', e.target.value)} />
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button style={{ padding: '0.4rem 0.9rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer' }} onClick={onCancel}>Cancelar</button>
        <button style={{ padding: '0.4rem 0.9rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
          onClick={() => form.title && onSave({ ...form, description: form.description || undefined, category: form.category || undefined })}>
          Guardar
        </button>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { padding: '0.45rem 0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', fontSize: '0.875rem' };

export default function TemplatesTab({ familyChildren }: Props) {
  const { data: templates = [], isLoading } = useTaskTemplates();
  const createTpl  = useCreateTemplate();
  const editTpl    = useEditTemplate();
  const toggleTpl  = useToggleTemplate();
  const createTask = useCreateTaskFromTemplate();
  const quickDone  = useQuickCompleteFromTemplate();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [useMenu, setUseMenu]       = useState<number | null>(null); // template ID for "Usar" submenu
  const [useChildId, setUseChildId] = useState<number>(familyChildren[0]?.id ?? 0);

  if (isLoading) return <p style={{ color: '#94a3b8' }}>Cargando plantillas…</p>;

  const grouped = templates.reduce<Record<string, TaskTemplate[]>>((acc, t) => {
    const cat = t.category ?? 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
          {templates.length} plantilla{templates.length !== 1 ? 's' : ''} · reutilízalas para crear misiones rápido
        </p>
        <button style={{ padding: '0.45rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
          onClick={() => setShowCreate(true)}>
          + Nueva plantilla
        </button>
      </div>

      {showCreate && (
        <div style={{ marginBottom: '1rem' }}>
          <TemplateForm
            onSave={(data) => createTpl.mutate(data as any, { onSuccess: () => setShowCreate(false) })}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {category}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {items.map((tpl) => (
              <div key={tpl.id}>
                {editingId === tpl.id ? (
                  <TemplateForm
                    initial={tpl}
                    onSave={(data) => editTpl.mutate({ id: tpl.id, data: data as any }, { onSuccess: () => setEditingId(null) })}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div style={{
                    background: '#fff', borderRadius: 8, padding: '0.65rem 0.9rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    opacity: tpl.isActive ? 1 : 0.5,
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{tpl.title}</span>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                        🪙 {tpl.coinsReward} · ⭐ {tpl.xpReward} XP · {tpl.type}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, flexWrap: 'wrap' }}>
                      <button style={{ padding: '0.3rem 0.6rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                        onClick={() => { setUseMenu(tpl.id); setUseChildId(familyChildren[0]?.id ?? 0); }}>
                        Usar ▾
                      </button>
                      <button style={{ padding: '0.3rem 0.6rem', background: '#f1f5f9', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '0.75rem' }}
                        onClick={() => setEditingId(tpl.id)}>✎</button>
                      <button style={{ padding: '0.3rem 0.6rem', background: tpl.isActive ? '#fef2f2' : '#f0fdf4', color: tpl.isActive ? '#dc2626' : '#16a34a', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                        onClick={() => toggleTpl.mutate({ id: tpl.id, isActive: !tpl.isActive })}>
                        {tpl.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submenu "Usar" */}
                {useMenu === tpl.id && (
                  <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 8, padding: '0.75rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      Asignar a
                      <select style={inp} value={useChildId} onChange={(e) => setUseChildId(+e.target.value)}>
                        {familyChildren.map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                      </select>
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button style={{ padding: '0.4rem 0.9rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                        disabled={createTask.isPending}
                        onClick={() => createTask.mutate({ id: tpl.id, overrides: { childId: useChildId } }, { onSuccess: () => setUseMenu(null) })}>
                        📋 Crear misión
                      </button>
                      <button style={{ padding: '0.4rem 0.9rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                        disabled={quickDone.isPending}
                        onClick={() => quickDone.mutate({ id: tpl.id, childId: useChildId }, { onSuccess: () => setUseMenu(null) })}>
                        ✔ Registrar logro
                      </button>
                      <button style={{ padding: '0.4rem 0.75rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}
                        onClick={() => setUseMenu(null)}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {templates.length === 0 && !showCreate && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          <p>Aún no tienes plantillas. Crea una para reutilizarla en futuras misiones.</p>
        </div>
      )}
    </div>
  );
}
