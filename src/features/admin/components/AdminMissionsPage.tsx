import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Inbox, List } from 'lucide-react';
import apiClient from '../../../shared/api/apiClient';
import InboxTab           from './InboxTab';
import TaskPanelPage      from '../../tasks/components/TaskPanelPage';
import { useTasks }       from '../../tasks/hooks/useTasks';
import { c } from '../../../styles/tokens';

interface Child { id: number; username: string; displayName: string }

function useChildren() {
  return useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: () => apiClient.get<Child[]>('/auth/children').then((r) => r.data),
  });
}

type Tab = 'inbox' | 'tasks';

export default function AdminMissionsPage() {
  const [tab, setTab] = useState<Tab>('inbox');
  const { data: children = [], isLoading } = useChildren();
  const { data: inReviewTasks = [] } = useTasks({ status: 'InReview' });
  const inReviewCount = inReviewTasks.length;

  if (isLoading) return <p className="p-8 text-caption">Cargando…</p>;

  const TABS = [
    { key: 'inbox' as Tab, label: 'Bandeja', Icon: Inbox, badge: inReviewCount },
    { key: 'tasks' as Tab, label: 'Tareas',  Icon: List,  badge: undefined     },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>Tareas</h2>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', borderBottom: `2px solid ${c.stroke}`, marginBottom: '1.5rem' }}>
        {TABS.map(({ key, label, Icon, badge }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '0.5rem 1rem', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.875rem', background: 'transparent',
            color: tab === key ? c.primary : c.body,
            borderBottom: tab === key ? `2px solid ${c.primary}` : '2px solid transparent',
            marginBottom: '-2px',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            <Icon size={14} />{label}
            {badge != null && badge > 0 && (
              <span style={{ background: c.warning, color: c.surface, fontSize: '0.65rem', fontWeight: 800, padding: '1px 6px', borderRadius: 10 }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'inbox' && <InboxTab familyChildren={children} />}
      {tab === 'tasks' && <TaskPanelPage />}
    </div>
  );
}
