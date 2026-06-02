import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/apiClient';
import InboxTab      from './InboxTab';
import TaskPanelPage from '../../tasks/components/TaskPanelPage';
import TemplatesTab  from './TemplatesTab';
import LogroTab      from './LogroTab';
import { useTasks } from '../../tasks/hooks/useTasks';

interface Child { id: number; username: string; displayName: string }

function useChildren() {
  return useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: () => apiClient.get<Child[]>('/auth/children').then((r) => r.data),
  });
}

type Tab = 'inbox' | 'planner' | 'templates' | 'logro';

export default function AdminMissionsPage() {
  const [tab, setTab] = useState<Tab>('inbox');
  const { data: children = [], isLoading } = useChildren();
  const { data: inReviewTasks = [] } = useTasks({ status: 'InReview' });
  const inReviewCount = inReviewTasks.length;

  if (isLoading) return <p style={{ padding: '2rem', color: '#94a3b8' }}>Cargando…</p>;

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'inbox',     label: '📥 Bandeja',     badge: inReviewCount },
    { key: 'planner',   label: '📋 Misiones'                         },
    { key: 'templates', label: '📚 Plantillas'                       },
    { key: 'logro',     label: '🏆 Registrar'                        },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>
        Misiones
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
        {TABS.map(({ key, label, badge }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '0.5rem 1.1rem',
            border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.875rem',
            background: 'transparent',
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

      {tab === 'inbox'     && <InboxTab      familyChildren={children} />}
      {tab === 'planner'   && <TaskPanelPage />}
      {tab === 'templates' && <TemplatesTab  familyChildren={children} />}
      {tab === 'logro'     && <LogroTab      familyChildren={children} />}
    </div>
  );
}
