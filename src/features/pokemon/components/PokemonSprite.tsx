import { useState } from 'react';
import { SPRITE_URL, SPRITE_STATIC_URL } from '../api';

interface Props {
  pokedexNumber: number;
  size?: number;
  alt?: string;
}

export default function PokemonSprite({ pokedexNumber, size = 96, alt = '' }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed ? SPRITE_STATIC_URL(pokedexNumber) : SPRITE_URL(pokedexNumber)}
      alt={alt}
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
      onError={() => setFailed(true)}
    />
  );
}
