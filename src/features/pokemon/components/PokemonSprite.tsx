import { useState } from 'react';
import { SPRITE_URL, SPRITE_STATIC_URL } from '../api';

interface Props {
  pokedexNumber: number;
  size?: number;
  alt?: string;
  pixelated?: boolean;
}

export default function PokemonSprite({ pokedexNumber, size = 96, alt = '', pixelated }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed ? SPRITE_STATIC_URL(pokedexNumber) : SPRITE_URL(pokedexNumber)}
      alt={alt}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        ...(pixelated ? { imageRendering: 'pixelated' } : {}),
      }}
      onError={() => setFailed(true)}
    />
  );
}
