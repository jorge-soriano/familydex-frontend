import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/apiClient';
import HistoryList from './HistoryList';
import DirectRecordsForm from './DirectRecordsForm';
import Modal from '../../../shared/components/Modal';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';

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

  if (isLoading) return <p className="p-8 text-caption">Cargando…</p>;

  const childMap = Object.fromEntries(children.map((ch) => [ch.id, { displayName: ch.displayName, avatarColor: ch.avatarColor ?? null }]));

  const sel: React.CSSProperties = { padding: '0.4rem 0.6rem', borderRadius: 6, border: `2px solid ${c.stroke}`, background: c.surface, fontSize: '0.875rem', color: c.heading };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.5rem', fontWeight: 800 }}>Actividad familiar</h2>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select style={sel} value={filterChild} onChange={(e) => setFilterChild(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Todos los hijos</option>
            {children.map((ch) => <option key={ch.id} value={ch.id}>{ch.displayName}</option>)}
          </select>
          <select style={sel} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="TaskReward">Tareas</option>
            <option value="DirectRecord">Registros directos</option>
            <option value="RewardRedeemed">Recompensas</option>
          </select>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Nuevo registro</Button>
      </div>

      <HistoryList childId={filterChild || undefined} filterType={filterType || undefined} childMap={childMap} />

      {showForm && (
        <Modal title="Nuevo registro" maxWidth={520} onClose={() => setShowForm(false)}>
          <DirectRecordsForm familyChildren={children} onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
