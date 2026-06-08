import apiClient from '../../shared/api/apiClient';

export interface ActivePokemonSummary {
  pokedexNumber: number;
  name: string;
  level: number;
}

export interface ChildSummary {
  id: number;
  username: string;
  displayName: string;
  avatarColor: string | null;
  isActive: boolean;
  coins: number;
  xp: number;
  activePokemon: ActivePokemonSummary | null;
  pendingReviewCount: number;
  pendingRewardRequestCount: number;
}

export interface DashboardData {
  children: ChildSummary[];
  totalInReview: number;
  totalPendingRequests: number;
}

export interface Notifications {
  inReview: number;
  pendingRequests: number;
}

export const adminApi = {
  getDashboard: () =>
    apiClient.get<DashboardData>('/admin/dashboard').then((r) => r.data),

  getNotifications: () =>
    apiClient.get<Notifications>('/admin/notifications').then((r) => r.data),

  getChildren: () =>
    apiClient.get<ChildSummary[]>('/admin/children').then((r) => r.data),

  getChild: (id: number) =>
    apiClient.get<ChildSummary>(`/admin/children/${id}`).then((r) => r.data),

  updateChild: (id: number, dto: { displayName?: string; password?: string; avatarColor?: string }) =>
    apiClient.put(`/admin/children/${id}`, dto).then((r) => r.data),

  toggleChildStatus: (id: number, isActive: boolean) =>
    apiClient.patch(`/admin/children/${id}/status`, { isActive }).then((r) => r.data),
};
