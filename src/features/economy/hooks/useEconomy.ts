import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { economyApi, type GetHistoryParams, type PenaltyDto } from '../api';

export const BALANCE_KEY = 'balance';
export const TRANSACTIONS_KEY = 'transactions';

export function useBalance(childId?: number) {
  return useQuery({
    queryKey: [BALANCE_KEY, childId],
    queryFn: () => economyApi.getBalance(childId),
  });
}

export function useHistory(params?: GetHistoryParams) {
  return useQuery({
    queryKey: [TRANSACTIONS_KEY, params],
    queryFn: () => economyApi.getHistory(params),
  });
}

export function useApplyPenalty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PenaltyDto) => economyApi.applyDirectRecord({ childIds: [data.childId], coinsDelta: -(data.amount), xp: 0, reason: data.reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BALANCE_KEY] });
      qc.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
    },
  });
}
