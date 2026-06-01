import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './shared/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <div>Login — implementado en Épica 1</div>,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <div>Admin Dashboard — Épica 6</div> },
      { path: 'tasks', element: <div>Admin Tasks — Épica 2</div> },
      { path: 'children', element: <div>Admin Children — Épica 6</div> },
      { path: 'children/:id', element: <div>Child Detail — Épica 6</div> },
      { path: 'rewards', element: <div>Admin Rewards — Épica 5</div> },
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
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <div>Child Dashboard — Épicas 2-5</div> },
      { path: 'tasks', element: <div>Tasks — Épica 2</div> },
      { path: 'pokemon', element: <div>Pokémon — Épica 4</div> },
      { path: 'rewards', element: <div>Reward Shop — Épica 5</div> },
    ],
  },
  { path: '/', element: <Navigate to="/login" replace /> },
]);
