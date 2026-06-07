import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const navigate  = useNavigate();
  const { setAuth } = useAuthStore();
  const qc        = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: ({ token }) => {
      // Limpiar todo el caché antes de cambiar de usuario.
      // React Query cachea por clave, y si dos usuarios usan las mismas
      // claves (e.g. tareas del hijo), el usuario nuevo vería datos del anterior
      // hasta que se refresque. qc.clear() elimina todo y fuerza un refetch limpio.
      qc.clear();

      const { userId, role, familyId } = decodeToken(token);
      setAuth(token, userId, role, familyId);
      navigate(role === 'admin' ? '/admin/dashboard' : '/child/tasks');
    },
  });
}

export function useRegister() {
  const navigate  = useNavigate();
  const { setAuth } = useAuthStore();
  const qc        = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterAdminDto) => authApi.register(data),
    onSuccess: ({ token }) => {
      qc.clear();
      const { userId, role, familyId } = decodeToken(token);
      setAuth(token, userId, role, familyId);
      navigate('/admin/dashboard');
    },
  });
}

export function useLogout() {
  const navigate    = useNavigate();
  const { clearAuth } = useAuthStore();
  const qc          = useQueryClient();

  return () => {
    // Limpiar caché al cerrar sesión para que el siguiente usuario
    // no vea datos residuales del anterior.
    qc.clear();
    clearAuth();
    navigate('/login');
  };
}
