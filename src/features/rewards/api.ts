import apiClient from '../../shared/api/apiClient';

export interface Reward {
  id: number;
  familyId: string;
  name: string;
  description: string | null;
  coinCost: number;
  isActive: boolean;
  createdAt: string;
}

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface RewardRequest {
  id: number;
  childId: number;
  rewardId: number;
  status: RequestStatus;
  rejectionReason: string | null;
  coinsReserved: number;
  createdAt: string;
  reward?: Reward;
}

export interface CreateRewardDto {
  name: string;
  description?: string;
  coinCost: number;
  isActive?: boolean;
}

export interface EditRewardDto {
  name?: string;
  description?: string;
  coinCost?: number;
}

export const rewardsApi = {
  getAll: () =>
    apiClient.get<Reward[]>('/rewards').then((r) => r.data),

  create: (data: CreateRewardDto) =>
    apiClient.post<Reward>('/rewards', data).then((r) => r.data),

  edit: (id: number, data: EditRewardDto) =>
    apiClient.put<Reward>(`/rewards/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/rewards/${id}`),

  toggleActive: (id: number, isActive: boolean) =>
    apiClient.patch<Reward>(`/rewards/${id}/status`, { isActive }).then((r) => r.data),

  getRequests: (params?: { status?: RequestStatus }) =>
    apiClient.get<RewardRequest[]>('/rewards/requests', { params }).then((r) => r.data),

  request: (rewardId: number) =>
    apiClient.post<RewardRequest>('/rewards/requests', { rewardId }).then((r) => r.data),

  approve: (id: number) =>
    apiClient.post<RewardRequest>(`/rewards/requests/${id}/approve`).then((r) => r.data),

  reject: (id: number, reason?: string) =>
    apiClient.post<RewardRequest>(`/rewards/requests/${id}/reject`, { reason }).then((r) => r.data),
};
