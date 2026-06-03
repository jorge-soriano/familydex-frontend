import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pokemonApi } from '../api';

export const POKEMON_KEY    = 'pokemon';
export const STARTERS_KEY   = 'starters';
export const AVAILABLE_KEY  = 'pokemon-available';
export const CATALOG_KEY    = 'pokemon-catalog';

export function usePokemonCatalog() {
  return useQuery({ queryKey: [CATALOG_KEY], queryFn: pokemonApi.getCatalog, staleTime: Infinity });
}

export function useStarters() {
  return useQuery({ queryKey: [STARTERS_KEY], queryFn: pokemonApi.getStarters });
}

export function usePokemonCollection(childId?: number) {
  return useQuery({
    queryKey: [POKEMON_KEY, childId],
    queryFn: () => pokemonApi.getCollection(childId),
  });
}

export function useChooseInitial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pokemonId: number) => pokemonApi.chooseInitial(pokemonId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [POKEMON_KEY] }),
  });
}

export function useAvailableToCapture() {
  return useQuery({ queryKey: [AVAILABLE_KEY], queryFn: pokemonApi.getAvailable });
}

export function useCapture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pokemonId: number) => pokemonApi.capture(pokemonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [POKEMON_KEY] });
      qc.invalidateQueries({ queryKey: [AVAILABLE_KEY] });
    },
  });
}

export function useSetActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (caughtPokemonId: number) => pokemonApi.setActive(caughtPokemonId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [POKEMON_KEY] }),
  });
}

export function useEvolveActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => pokemonApi.evolveActive(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [POKEMON_KEY] });
    },
  });
}
