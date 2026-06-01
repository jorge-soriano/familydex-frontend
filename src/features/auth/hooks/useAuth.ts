import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, type LoginDto, type RegisterAdminDto } from '../api';
import { useAuthStore } from './useAuthStore';
import type { UserRole } from '../../../shared/types';

interface JwtPayload {
  userId: number;
  role: UserRole;
  familyId: string;
}

function decodeToken(token: string): JwtPayload {
  return JSON.parse(atob(token.split('.')[1]));
}

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: ({ token }) => {
      const { userId, role, familyId } = decodeToken(token);
      setAuth(token, userId, role, familyId);
      navigate(role === 'admin' ? '/admin/dashboard' : '/child/dashboard');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterAdminDto) => authApi.register(data),
    onSuccess: ({ token }) => {
      const { userId, role, familyId } = decodeToken(token);
      setAuth(token, userId, role, familyId);
      navigate('/admin/dashboard');
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  return () => {
    clearAuth();
    navigate('/login');
  };
}
