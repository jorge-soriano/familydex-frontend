import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/hooks/useAuthStore';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== requiredRole) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
