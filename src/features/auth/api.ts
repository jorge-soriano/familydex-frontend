import apiClient from '../../shared/api/apiClient';

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface RegisterAdminDto {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface CreateChildDto {
  username: string;
  password: string;
  displayName: string;
  avatarColor?: string;
}

export interface AuthResponse {
  token: string;
}

export interface ChildResponse {
  id: number;
  username: string;
  displayName: string;
  avatarColor: string | null;
  familyId: string;
}

export const authApi = {
  register: (data: RegisterAdminDto) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginDto) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  logout: () =>
    apiClient.post('/auth/logout').then((r) => r.data),

  createChild: (data: CreateChildDto) =>
    apiClient.post<ChildResponse>('/auth/children', data).then((r) => r.data),
};
