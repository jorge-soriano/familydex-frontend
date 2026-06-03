import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi, type CreateTaskDto, type EditTaskDto, type GetTasksParams } from '../api';
import { BALANCE_KEY, TRANSACTIONS_KEY } from '../../economy/hooks/useEconomy';
import { POKEMON_KEY } from '../../pokemon/hooks/usePokemon';

export const TASKS_KEY = 'tasks';

export function useTasks(params?: GetTasksParams) {
  return useQuery({
    queryKey: [TASKS_KEY, params],
    queryFn: () => tasksApi.getAll(params),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskDto) => tasksApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useEditTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, applyToSeries }: { id: number; data: EditTaskDto; applyToSeries?: boolean }) =>
      tasksApi.edit(id, data, applyToSeries),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, deleteSeries }: { id: number; deleteSeries?: boolean }) =>
      tasksApi.delete(id, deleteSeries),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tasksApi.complete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useApproveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tasksApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      qc.invalidateQueries({ queryKey: [BALANCE_KEY] });
      qc.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      qc.invalidateQueries({ queryKey: [POKEMON_KEY] });
    },
  });
}

export function useRejectTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      tasksApi.reject(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}


export function useDirectApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tasksApi.directApprove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      qc.invalidateQueries({ queryKey: [BALANCE_KEY] });
      qc.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      qc.invalidateQueries({ queryKey: [POKEMON_KEY] });
    },
  });
}

export function useToggleEnabled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tasksApi.toggleEnabled(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}
