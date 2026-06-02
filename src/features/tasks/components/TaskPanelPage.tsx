import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/apiClient';
import TaskPanel from './TaskPanel';

interface ChildItem { id: number; username: string; displayName: string }

function useChildren() {
  return useQuery<ChildItem[]>({
    queryKey: ['children'],
    queryFn: () => apiClient.get<ChildItem[]>('/auth/children').then((r) => r.data),
  });
}

export default function TaskPanelPage() {
  const { data: children = [], isLoading } = useChildren();
  if (isLoading) return <p style={{ padding: '2rem' }}>Cargando…</p>;
  return <TaskPanel children={children} />;
}
