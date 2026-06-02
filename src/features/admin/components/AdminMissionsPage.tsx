import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/apiClient';
import InboxTab           from './InboxTab';
import TaskPanelPage      from '../../tasks/components/TaskPanelPage';
import DirectRecordsForm  from '../../economy/components/DirectRecordsForm';
import { useTasks }       from '../../tasks/hooks/useTasks';

interface Child { id: number; username: string; displayName: string }

function useChildren() {
  return useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: () => apiClient.get<Child[]>('/auth/children').then((r) => r.data),
  });
}

type Tab = 'inbox' | 'tasks' | 'records';

export default function AdminMissionsPage() {
  const [tab, setTab] = useState<Tab>('inbox');
  const { data: children = [], isLoading } = useChildren();
  const { data: inReviewTasks = [] } = useTasks({ status: 'InReview' });
  const inReviewCount = inReviewTasks.length;

  if (isLoading) return <p style={{ padding: '2rem', color: '#94a3b8' }}>Cargando…</p>;

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'inbox',   label: '📥 Bandeja',  badge: inReviewCount },
    { key: 'tasks',   label: '📋 Tareas'                         },
    { key: 'records', label: '📝 Registros'                      },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>Tareas</h2>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        {TABS.map(({ key, label, badge }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '0.5rem 1.1rem', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.875rem', background: 'transparent',
            color: tab === key ? '#3b82f6' : '#64748b',
            borderBottom: tab === key ? '2px solid #3b82f6' : '2px solid transparent',
            marginBottom: '-2px',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            {label}
            {badge != null && badge > 0 && (
              <span style={{ background: '#f59e0b', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '1px 6px', borderRadius: 10 }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'inbox'   && <InboxTab familyChildren={children} />}
      {tab === 'tasks'   && <TaskPanelPage />}
      {tab === 'records' && (
        <div>
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: '#64748b' }}>
            Da o quita monedas y XP directamente — sin crear una tarea. Aparece en la Actividad del niño.
          </p>
          <DirectRecordsForm familyChildren={children} />
        </div>
      )}
    </div>
  );
}
