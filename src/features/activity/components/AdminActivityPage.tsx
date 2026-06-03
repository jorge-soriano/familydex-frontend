import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/apiClient';
import HistoryList from './HistoryList';

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

  if (isLoading) return <p style={{ padding: '2rem' }}>Cargando…</p>;

  const childMap = Object.fromEntries(children.map((c) => [c.id, { displayName: c.displayName, avatarColor: c.avatarColor ?? null }]));

  const sel: React.CSSProperties = {
    padding: '0.4rem 0.6rem', borderRadius: 6,
    border: '2px solid #e2e8f0', background: '#fff',
    fontSize: '0.875rem', color: '#1e293b',
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 800 }}>
        Actividad familiar
      </h2>

      {/* Both filters on the same row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
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

      <HistoryList
        childId={filterChild || undefined}
        filterType={filterType || undefined}
        childMap={childMap}
      />
    </div>
  );
}
