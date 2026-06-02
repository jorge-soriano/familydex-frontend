# FamilyDex Frontend

Interfaz de usuario de FamilyDex — app de gamificación familiar con temática Pokémon.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite 4 |
| Server state | TanStack React Query |
| Client state | Zustand (auth store) |
| HTTP | Axios |
| Routing | React Router v7 |
| Testing | Vitest + Testing Library |

## Inicio rápido

```bash
cp .env.example .env
npm install
npm run dev   # http://localhost:5174
```

Requiere la API corriendo en `http://localhost:3001` (ver `familydex-api/`).

## Comandos

```bash
npm run dev        # Desarrollo con HMR (http://localhost:5174)
npm run build      # Build de producción en dist/
npm run preview    # Previsualizar el build de producción
npm run typecheck  # Verificar tipos TypeScript
npm run lint       # ESLint
npm test           # Vitest (requiere Node ≥ 18)
```

## Estructura del proyecto

```
familydex-frontend/src/
├── features/
│   ├── auth/
│   │   ├── api.ts                   # register, login, logout, createChild
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           # useLogin, useRegister, useLogout
│   │   │   └── useAuthStore.ts      # Zustand — token, userId, role, familyId
│   │   └── components/
│   │       ├── LoginPage.tsx
│   │       └── RegisterPage.tsx
│   ├── tasks/
│   │   ├── api.ts
│   │   ├── hooks/useTasks.ts
│   │   └── components/
│   │       ├── TaskList.tsx         # Vista hijo — tareas agrupadas por estado
│   │       ├── TaskCard.tsx
│   │       ├── TaskForm.tsx         # Modal crear/editar (admin)
│   │       ├── TaskPanel.tsx        # Panel admin con filtros y acciones
│   │       └── TaskPanelPage.tsx    # Carga hijos y renderiza TaskPanel
│   ├── economy/
│   │   ├── api.ts
│   │   ├── hooks/useEconomy.ts
│   │   └── components/
│   │       ├── BalanceBar.tsx       # Monedas + XP — siempre visible en ChildLayout
│   │       ├── HistoryList.tsx      # Historial de transacciones con filtro
│   │       ├── PenaltyForm.tsx      # Aplicar penalización (admin)
│   │       ├── ChildEconomyPage.tsx
│   │       └── AdminEconomyPage.tsx
│   ├── pokemon/
│   │   ├── api.ts                   # Includes SPRITE_URL helper
│   │   ├── hooks/usePokemon.ts
│   │   └── components/
│   │       ├── PokemonSprite.tsx    # Sprite animado Gen 5 con fallback PNG
│   │       ├── TypeBadge.tsx        # Badge de tipo con color
│   │       ├── PokemonDisplay.tsx   # Pokémon activo con nivel y barra XP
│   │       ├── PokemonOnboarding.tsx # Selección de starter
│   │       ├── CaptureScreen.tsx    # Capturar nuevo Pokémon
│   │       └── PokemonPage.tsx      # Tabs activo/colección/capturar
│   ├── rewards/
│   │   ├── api.ts
│   │   ├── hooks/useRewards.ts
│   │   └── components/
│   │       ├── RewardShop.tsx       # Tienda vista hijo
│   │       ├── RewardForm.tsx       # Modal crear/editar recompensa (admin)
│   │       └── AdminRewardsPage.tsx # Tabs solicitudes/recompensas (admin)
│   └── admin/
│       ├── api.ts
│       ├── hooks/useAdmin.ts
│       └── components/
│           ├── Dashboard.tsx        # Resumen familiar con alertas
│           ├── ChildrenList.tsx     # Lista con editar y activar/desactivar
│           ├── EditChildModal.tsx   # Editar nombre o contraseña
│           └── ChildDetail.tsx      # Tabs: resumen/tareas/historial/pokémon/solicitudes
├── shared/
│   ├── api/
│   │   └── apiClient.ts            # Axios con interceptor JWT
│   ├── components/
│   │   ├── ProtectedRoute.tsx      # Guard de ruta por rol
│   │   ├── AdminLayout.tsx         # Nav + badges de notificaciones
│   │   └── ChildLayout.tsx         # Nav + BalanceBar
│   └── types/
│       └── index.ts                # UserRole, TaskStatus, TaskFrequency, etc.
├── App.tsx
├── router.tsx                      # Rutas + layouts + ProtectedRoute
└── main.tsx                        # QueryClient + RouterProvider
```

## Rutas de la aplicación

| Ruta | Acceso | Componente |
|---|---|---|
| `/login` | Pública | `LoginPage` |
| `/register` | Pública | `RegisterPage` |
| `/admin/dashboard` | Admin | `Dashboard` |
| `/admin/tasks` | Admin | `TaskPanelPage` |
| `/admin/economy` | Admin | `AdminEconomyPage` |
| `/admin/rewards` | Admin | `AdminRewardsPage` |
| `/admin/children` | Admin | `ChildrenList` |
| `/admin/children/:id` | Admin | `ChildDetail` |
| `/child/tasks` | Hijo | `TaskList` |
| `/child/pokemon` | Hijo | `PokemonPage` |
| `/child/economy` | Hijo | `ChildEconomyPage` |
| `/child/rewards` | Hijo | `RewardShop` |

## Estado de la aplicación

| Tipo | Herramienta | Qué gestiona |
|---|---|---|
| Server state | React Query | Cache, loading, error, refetch automático |
| Global client | Zustand (`useAuthStore`) | JWT, userId, role, familyId — persiste en localStorage |
| Local | `useState` / `useReducer` | Formularios, modales, toggles |

## Autenticación

El token JWT se guarda en `localStorage` via Zustand `persist`. El `apiClient` de Axios lo adjunta automáticamente en cada petición:

```typescript
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Las rutas protegidas comprueban `role` del store:
- `/admin/*` → requiere `role === 'admin'`
- `/child/*` → requiere `role === 'child'`

## Sprites Pokémon

Los sprites animados Gen 5 se sirven desde GitHub PokeAPI:

```
https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/
  versions/generation-v/black-white/animated/{pokedexNumber}.gif
```

Fallback automático a PNG estático si el GIF no existe.

## Variables de entorno

```env
VITE_API_URL=http://localhost:3001/api
```
