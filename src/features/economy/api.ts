import apiClient from '../../shared/api/apiClient';
import type { TransactionType } from '../../shared/types';

export interface Balance {
  coins: number;
  xp: number;
  maxPokemon: number;
  caughtCount: number;
  pendingCaptures: number;
}

export interface TransactionItem {
  id: number;
  childId: number;
  taskId: number | null;
  rewardRequestId: number | null;
  type: TransactionType;
  coinsDelta: number;
  xpDelta: number;
  description: string;
  createdAt: string;
}

export interface GetHistoryParams {
  type?: TransactionType;
  from?: string;
  to?: string;
  childId?: number;
}

export interface PenaltyDto {
  childId: number;
  amount: number;
  reason: string;
}

export const economyApi = {
  getBalance: (childId?: number) =>
    apiClient.get<Balance>('/economy/balance', { params: childId ? { childId } : {} })
      .then((r) => r.data),

  getHistory: (params?: GetHistoryParams) =>
    apiClient.get<TransactionItem[]>('/economy/transactions', { params })
      .then((r) => r.data),

  applyPenalty: (data: PenaltyDto) =>
    apiClient.post('/economy/penalty', data).then((r) => r.data),

  applyDirectReward: (data: { childId: number; coins: number; xp: number; reason: string }) =>
    apiClient.post('/economy/direct-reward', data).then((r) => r.data),
};
