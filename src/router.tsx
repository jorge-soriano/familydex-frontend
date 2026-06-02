import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminLayout from './shared/components/AdminLayout';
import ChildLayout from './shared/components/ChildLayout';
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import TaskList from './features/tasks/components/TaskList';
import TaskPanelPage from './features/tasks/components/TaskPanelPage';
import ChildEconomyPage from './features/economy/components/ChildEconomyPage';
import AdminEconomyPage from './features/economy/components/AdminEconomyPage';

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
      { path: 'dashboard',    element: <div style={{ padding: '2rem' }}>Admin Dashboard — Épica 6</div> },
      { path: 'tasks',        element: <TaskPanelPage /> },
      { path: 'economy',      element: <AdminEconomyPage /> },
      { path: 'children',     element: <div style={{ padding: '2rem' }}>Gestión de hijos — Épica 6</div> },
      { path: 'children/:id', element: <div style={{ padding: '2rem' }}>Detalle hijo — Épica 6</div> },
      { path: 'rewards',      element: <div style={{ padding: '2rem' }}>Tienda — Épica 5</div> },
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
      { path: 'economy',   element: <ChildEconomyPage /> },
      { path: 'pokemon',   element: <div style={{ padding: '2rem' }}>Pokémon — Épica 4</div> },
      { path: 'rewards',   element: <div style={{ padding: '2rem' }}>Tienda — Épica 5</div> },
    ],
  },

  { path: '/', element: <Navigate to="/login" replace /> },
]);
