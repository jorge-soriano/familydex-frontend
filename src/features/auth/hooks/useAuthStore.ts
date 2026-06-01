import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '../../../shared/types';

interface AuthState {
  token: string | null;
  userId: number | null;
  role: UserRole | null;
  familyId: string | null;
  setAuth: (token: string, userId: number, role: UserRole, familyId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      role: null,
      familyId: null,
      setAuth: (token, userId, role, familyId) =>
        set({ token, userId, role, familyId }),
      clearAuth: () =>
        set({ token: null, userId: null, role: null, familyId: null }),
    }),
    { name: 'auth-storage' }
  )
);
