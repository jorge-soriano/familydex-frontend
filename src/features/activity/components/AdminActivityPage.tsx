import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/apiClient';
import HistoryList from './HistoryList';
import DirectRecordsForm from './DirectRecordsForm';

interface Child { id: number; username: string; displayName: string; avatarColor?: string | null }

function useChildren() {
  return useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: () => apiClient.get<Child[]>('/auth/children').then((r) => r.data),
  });
}

export default function AdminActivityPage() {
  const { data: children = [], isLoading } = useChildren();
  const [filterChild, setFilterChild] = useState<number | ''>('');
  const [filterType,  setFilterType]  = useState('');
  const [showForm,    setShowForm]    = useState(false);

  if (isLoading) return <p style={{ padding: '2rem' }}>Cargando…</p>;

  const childMap = Object.fromEntries(children.map((c) => [c.id, { displayName: c.displayName, avatarColor: c.avatarColor ?? null }]));

  const sel: React.CSSProperties = {
    padding: '0.4rem 0.6rem', borderRadius: 6,
    border: '2px solid #e2e8f0', background: '#fff',
    fontSize: '0.875rem', color: '#1e293b',
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 800 }}>Actividad familiar</h2>

      {/* Filtros + botón — mismo layout que TaskPanel */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select style={sel} value={filterChild}
            onChange={(e) => setFilterChild(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Todos los hijos</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.displayName}</option>
            ))}
          </select>
          <select style={sel} value={filterType}
            onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="TaskReward">Tareas</option>
            <option value="DirectRecord">Registros directos</option>
            <option value="RewardRedeemed">Recompensas</option>
          </select>
        </div>
        <button
          style={{ padding: '0.45rem 1.1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}
          onClick={() => setShowForm(true)}>
          + Nuevo registro
        </button>
      </div>

      <HistoryList
        childId={filterChild || undefined}
        filterType={filterType || undefined}
        childMap={childMap}
      />

      {/* Modal Nuevo registro */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 'calc(100% - 2rem)', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Nuevo registro</h2>
              <button style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
                onClick={() => setShowForm(false)}>✕</button>
            </div>
            <DirectRecordsForm familyChildren={children} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
