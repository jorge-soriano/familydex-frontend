import apiClient from '../../shared/api/apiClient';
import type { TaskType } from '../../shared/types';
import type { Task } from '../tasks/api';

export interface TaskTemplate {
  id: number;
  familyId: string;
  title: string;
  description: string | null;
  type: TaskType;
  coinsReward: number;
  xpReward: number;
  isActive: boolean;
  category: string | null;
  sortOrder: number | null;
  createdAt: string;
}

export interface CreateTemplateDto {
  title: string;
  description?: string;
  type: TaskType;
  coinsReward: number;
  xpReward: number;
  category?: string;
}

export interface TemplateTaskOverrides {
  childId: number;
  coinsReward?: number;
  xpReward?: number;
  description?: string;
  dueDate?: string;
  frequency?: 'OneTime' | 'Daily' | 'Weekly';
}

export const taskTemplatesApi = {
  getAll: (onlyActive?: boolean) =>
    apiClient.get<TaskTemplate[]>('/task-templates', {
      params: onlyActive ? { active: true } : undefined,
    }).then((r) => r.data),

  create: (data: CreateTemplateDto) =>
    apiClient.post<TaskTemplate>('/task-templates', data).then((r) => r.data),

  edit: (id: number, data: Partial<CreateTemplateDto>) =>
    apiClient.put<TaskTemplate>(`/task-templates/${id}`, data).then((r) => r.data),

  toggleStatus: (id: number, isActive: boolean) =>
    apiClient.patch<TaskTemplate>(`/task-templates/${id}/status`, { isActive }).then((r) => r.data),

  createTask: (id: number, overrides: TemplateTaskOverrides) =>
    apiClient.post<Task>(`/task-templates/${id}/create-task`, overrides).then((r) => r.data),

  quickComplete: (id: number, childId: number, overrides?: Pick<TemplateTaskOverrides, 'coinsReward' | 'xpReward' | 'description'>) =>
    apiClient.post<{ task: Task }>(`/task-templates/${id}/quick-complete`, { childId, ...overrides }).then((r) => r.data),
};
