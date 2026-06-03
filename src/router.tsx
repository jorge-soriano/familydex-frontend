import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminLayout from './shared/components/AdminLayout';
import ChildLayout from './shared/components/ChildLayout';

import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';

import TaskList from './features/tasks/components/TaskList';
import AdminMissionsPage from './features/admin/components/AdminMissionsPage';

import ChildActivityPage from './features/activity/components/ChildActivityPage';
import AdminActivityPage from './features/activity/components/AdminActivityPage';

import PokemonPage from './features/pokemon/components/PokemonPage';

import RewardShop from './features/rewards/components/RewardShop';
import AdminRewardsPage from './features/rewards/components/AdminRewardsPage';

import Dashboard from './features/admin/components/Dashboard';
import ChildrenList from './features/admin/components/ChildrenList';
import ChildDetail from './features/admin/components/ChildDetail';

export const router = createBrowserRouter([
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,          element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',    element: <Dashboard /> },
      { path: 'tasks',        element: <AdminMissionsPage /> },
      { path: 'economy',      element: <AdminActivityPage /> },
      { path: 'rewards',      element: <AdminRewardsPage /> },
      { path: 'children',     element: <ChildrenList /> },
      { path: 'children/:id', element: <ChildDetail /> },
    ],
  },

  {
    path: '/child',
    element: (
      <ProtectedRoute requiredRole="child">
        <ChildLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,       element: <Navigate to="tasks" replace /> },
      { path: 'tasks',     element: <TaskList /> },
      { path: 'economy',   element: <ChildActivityPage /> },
      { path: 'pokemon',   element: <PokemonPage /> },
      { path: 'rewards',   element: <RewardShop /> },
    ],
  },

  { path: '/', element: <Navigate to="/login" replace /> },
]);
