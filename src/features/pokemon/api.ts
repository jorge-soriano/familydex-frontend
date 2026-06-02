import apiClient from '../../shared/api/apiClient';

export interface PokemonData {
  id: number;
  pokedexNumber: number;
  name: string;
  type1: string;
  type2: string | null;
  pokedexDescription: string | null;
  evolutionChainId: number | null;
  evolutionOrder: number | null;
  evolvesToPokedexNumber: number | null;
  evolvesAtLevel: number | null;
  evolutionTrigger: string | null;
  unlockXp: number;
}

export interface CaughtPokemonItem {
  id: number;
  pokemonId: number;
  isActive: boolean;
  pokemonXp: number;
  level: number;
  caughtAt: string;
  pokemon: PokemonData;
}

export interface ActivePokemonResult extends CaughtPokemonItem {
  xpForNextLevel: number;
  progressPercent: number;
  isFinalForm: boolean;
  evolveLevel: number | null;
}

export interface PokemonCollection {
  active: ActivePokemonResult | null;
  collection: CaughtPokemonItem[];
}

export const pokemonApi = {
  getStarters: () =>
    apiClient.get<PokemonData[]>('/pokemon/starters').then((r) => r.data),

  chooseInitial: (pokemonId: number) =>
    apiClient.post('/pokemon/choose-initial', { pokemonId }).then((r) => r.data),

  getCollection: (childId?: number) =>
    apiClient.get<PokemonCollection>('/pokemon', { params: childId ? { childId } : {} })
      .then((r) => r.data),

  getAvailable: () =>
    apiClient.get<PokemonData[]>('/pokemon/available').then((r) => r.data),

  capture: (pokemonId: number) =>
    apiClient.post('/pokemon/capture', { pokemonId }).then((r) => r.data),

  setActive: (caughtPokemonId: number) =>
    apiClient.put('/pokemon/active', { caughtPokemonId }).then((r) => r.data),
};

export const SPRITE_URL = (pokedexNumber: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokedexNumber}.gif`;

export const SPRITE_STATIC_URL = (pokedexNumber: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png`;
