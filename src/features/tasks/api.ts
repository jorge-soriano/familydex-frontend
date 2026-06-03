import apiClient from '../../shared/api/apiClient';
import type { TaskStatus, TaskType, TaskFrequency } from '../../shared/types';

export interface Task {
  id: number;
  familyId: string;
  assignedTo: number;
  seriesId: number | null;
  title: string;
  description: string | null;
  type: TaskType;
  coinsReward: number;
  xpReward: number;
  status: TaskStatus;
  rejectionReason: string | null;
  dueDate: string | null;
  createdAt: string;
}

export interface CreateTaskDto {
  assignedTo: number;
  title: string;
  description?: string;
  type: TaskType;
  coinsReward: number;
  xpReward: number;
  frequency: TaskFrequency | 'OneTime';
  daysOfWeek?: number[];
  dueDate?: string;
}

export interface EditTaskDto {
  title?: string;
  description?: string;
  type?: TaskType;
  coinsReward?: number;
  xpReward?: number;
  dueDate?: string | null;
}

export interface GetTasksParams {
  assignedTo?: number;
  status?: TaskStatus;
  type?: TaskType;
}

export interface QuickCompleteDto {
  childId: number;
  title: string;
  description?: string;
  type: TaskType;
  coinsReward: number;
  xpReward: number;
}

export const tasksApi = {
  getAll: (params?: GetTasksParams) =>
    apiClient.get<Task[]>('/tasks', { params }).then((r) => r.data),

  create: (data: CreateTaskDto) =>
    apiClient.post<Task>('/tasks', data).then((r) => r.data),

  edit: (id: number, data: EditTaskDto, applyToSeries?: boolean) =>
    apiClient.put<Task>(`/tasks/${id}`, data, {
      params: applyToSeries ? { applyToSeries: true } : undefined,
    }).then((r) => r.data),

  delete: (id: number, deleteSeries?: boolean) =>
    apiClient.delete(`/tasks/${id}`, {
      params: deleteSeries ? { deleteSeries: true } : undefined,
    }),

  complete: (id: number) =>
    apiClient.post<Task>(`/tasks/${id}/complete`).then((r) => r.data),

  approve: (id: number) =>
    apiClient.post<Task>(`/tasks/${id}/approve`).then((r) => r.data),

  reject: (id: number, reason?: string) =>
    apiClient.post<Task>(`/tasks/${id}/reject`, { reason }).then((r) => r.data),

  directApprove: (id: number) =>
    apiClient.post<Task>(`/tasks/${id}/direct-approve`).then((r) => r.data),

  toggleEnabled: (id: number) =>
    apiClient.patch<{ isEnabled: boolean }>(`/tasks/${id}/enabled`).then((r) => r.data),

  quickComplete: (data: QuickCompleteDto) =>
    apiClient.post<{ task: Task }>('/tasks/quick-complete', data).then((r) => r.data),
};

export interface TaskSeriesInfo {
  id: number;
  frequency: 'Daily' | 'Weekly';
  daysOfWeek: string | null;
  isActive: boolean;
}

// Task with optional series info (included in getTasks response)
export interface TaskWithSeries extends Task {
  series?: TaskSeriesInfo | null;
  isEnabled?: boolean;
}
