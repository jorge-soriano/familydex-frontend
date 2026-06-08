import { Navigate } from 'react-router-dom';
import { usePokemonCollection } from '../../features/pokemon/hooks/usePokemon';

export default function ChildIndexRedirect() {
  const { data, isLoading } = usePokemonCollection();

  if (isLoading) return null;

  if (!data?.active && (data?.collection ?? []).length === 0) {
    return <Navigate to="pokemon" replace />;
  }

  return <Navigate to="tasks" replace />;
}
