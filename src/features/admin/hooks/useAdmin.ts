import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api';
import { authApi, type CreateChildDto } from '../../auth/api';

export const DASHBOARD_KEY      = 'admin-dashboard';
export const NOTIFICATIONS_KEY  = 'admin-notifications';
export const ADMIN_CHILDREN_KEY = 'admin-children';

export function useDashboard() {
  return useQuery({ queryKey: [DASHBOARD_KEY], queryFn: adminApi.getDashboard });
}

export function useNotifications() {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY],
    queryFn: adminApi.getNotifications,
    refetchInterval: 60_000, // refresh every minute
    staleTime: 30_000,
  });
}

export function useAdminChildren() {
  return useQuery({ queryKey: [ADMIN_CHILDREN_KEY], queryFn: adminApi.getChildren });
}

export function useAdminChild(id: number) {
  return useQuery({
    queryKey: [ADMIN_CHILDREN_KEY, id],
    queryFn: () => adminApi.getChild(id),
  });
}

export function useUpdateChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: { displayName?: string; password?: string } }) =>
      adminApi.updateChild(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ADMIN_CHILDREN_KEY] });
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
    },
  });
}

export function useCreateChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChildDto) => authApi.createChild(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ADMIN_CHILDREN_KEY] });
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
    },
  });
}

export function useToggleChildStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      adminApi.toggleChildStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ADMIN_CHILDREN_KEY] });
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
    },
  });
}
