import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rewardsApi, type CreateRewardDto, type EditRewardDto, type RequestStatus } from '../api';
import { BALANCE_KEY, TRANSACTIONS_KEY } from '../../activity/hooks/useActivity';

export const REWARDS_KEY  = 'rewards';
export const REQUESTS_KEY = 'reward-requests';

export function useRewards() {
  return useQuery({ queryKey: [REWARDS_KEY], queryFn: rewardsApi.getAll });
}

export function useRewardRequests(status?: RequestStatus) {
  return useQuery({
    queryKey: [REQUESTS_KEY, status],
    queryFn: () => rewardsApi.getRequests(status ? { status } : undefined),
  });
}

export function useCreateReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRewardDto) => rewardsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [REWARDS_KEY] }),
  });
}

export function useEditReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditRewardDto }) => rewardsApi.edit(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [REWARDS_KEY] }),
  });
}

export function useToggleReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      rewardsApi.toggleActive(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: [REWARDS_KEY] }),
  });
}

export function useRequestReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: number) => rewardsApi.request(rewardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REQUESTS_KEY] });
      qc.invalidateQueries({ queryKey: [BALANCE_KEY] });
    },
  });
}

export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rewardsApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REQUESTS_KEY] });
      qc.invalidateQueries({ queryKey: [BALANCE_KEY] });
      qc.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
    },
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      rewardsApi.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [REQUESTS_KEY] });
      qc.invalidateQueries({ queryKey: [BALANCE_KEY] });
    },
  });
}
