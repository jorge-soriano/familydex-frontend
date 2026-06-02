import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './shared/components/ProtectedRoute';
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import TaskList from './features/tasks/components/TaskList';
import TaskPanelPage from './features/tasks/components/TaskPanelPage';

export const router = createBrowserRouter([
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      { index: true,        element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',  element: <div>Admin Dashboard — Épica 6</div> },
      { path: 'tasks',      element: <TaskPanelPage /> },
      { path: 'children',   element: <div>Admin Children — Épica 6</div> },
      { path: 'children/:id', element: <div>Child Detail — Épica 6</div> },
      { path: 'rewards',    element: <div>Admin Rewards — Épica 5</div> },
    ],
  },

  {
    path: '/child',
    element: (
      <ProtectedRoute requiredRole="child">
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      { index: true,       element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <div>Child Dashboard — Épicas 3-5</div> },
      { path: 'tasks',     element: <TaskList /> },
      { path: 'pokemon',   element: <div>Pokémon — Épica 4</div> },
      { path: 'rewards',   element: <div>Reward Shop — Épica 5</div> },
    ],
  },

  { path: '/', element: <Navigate to="/login" replace /> },
]);
