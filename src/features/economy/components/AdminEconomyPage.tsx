import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/apiClient';
import HistoryList from './HistoryList';

interface Child { id: number; username: string; displayName: string }

function useChildren() {
  return useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: () => apiClient.get<Child[]>('/auth/children').then((r) => r.data),
  });
}

export default function AdminEconomyPage() {
  const { data: children = [], isLoading } = useChildren();
  const [filterChild, setFilterChild] = useState<number | ''>('');

  if (isLoading) return <p style={{ padding: '2rem' }}>Cargando…</p>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Actividad familiar</h2>
        <select
          style={{ padding: '0.35rem 0.6rem', borderRadius: 6, border: '2px solid #e2e8f0', fontSize: '0.85rem', background: '#fff' }}
          value={filterChild}
          onChange={(e) => setFilterChild(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Todos los hijos</option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.displayName}</option>
          ))}
        </select>
      </div>

      <HistoryList childId={filterChild || undefined} />
    </div>
  );
}
