import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminLayout from './shared/components/AdminLayout';
import ChildLayout from './shared/components/ChildLayout';

import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';

import MissionList   from './features/tasks/components/MissionList';   // child — Misiones
import AdminMissionsPage from './features/admin/components/AdminMissionsPage'; // admin — 4 tabs

import ChildEconomyPage from './features/economy/components/ChildEconomyPage';
import AdminEconomyPage from './features/economy/components/AdminEconomyPage';

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
      { path: 'economy',      element: <AdminEconomyPage /> },
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
      { path: 'tasks',     element: <MissionList /> },
      { path: 'economy',   element: <ChildEconomyPage /> },
      { path: 'pokemon',   element: <PokemonPage /> },
      { path: 'rewards',   element: <RewardShop /> },
    ],
  },

  { path: '/', element: <Navigate to="/login" replace /> },
]);
