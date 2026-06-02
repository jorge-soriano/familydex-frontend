import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskTemplatesApi, type CreateTemplateDto, type TemplateTaskOverrides } from '../api';
import { TASKS_KEY } from '../../tasks/hooks/useTasks';
import { BALANCE_KEY, TRANSACTIONS_KEY } from '../../economy/hooks/useEconomy';
import { POKEMON_KEY } from '../../pokemon/hooks/usePokemon';

export const TEMPLATES_KEY = 'task-templates';

export function useTaskTemplates(onlyActive?: boolean) {
  return useQuery({
    queryKey: [TEMPLATES_KEY, onlyActive],
    queryFn: () => taskTemplatesApi.getAll(onlyActive),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateDto) => taskTemplatesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEMPLATES_KEY] }),
  });
}

export function useEditTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateTemplateDto> }) =>
      taskTemplatesApi.edit(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEMPLATES_KEY] }),
  });
}

export function useToggleTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      taskTemplatesApi.toggleStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEMPLATES_KEY] }),
  });
}

export function useCreateTaskFromTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, overrides }: { id: number; overrides: TemplateTaskOverrides }) =>
      taskTemplatesApi.createTask(id, overrides),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useQuickCompleteFromTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, childId, overrides }: { id: number; childId: number; overrides?: object }) =>
      taskTemplatesApi.quickComplete(id, childId, overrides as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TASKS_KEY] });
      qc.invalidateQueries({ queryKey: [BALANCE_KEY] });
      qc.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      qc.invalidateQueries({ queryKey: [POKEMON_KEY] });
    },
  });
}
