import PokemonSprite from './PokemonSprite';
import { SPRITE_STATIC_URL } from '../api';
import TypeBadge from './TypeBadge';
import { c } from '../../../styles/tokens';

interface PokemonCardProps {
  pokedexNumber: number;
  name: string;
  type1?: string;
  type2?: string | null;
  spriteSize?: number;
  spriteFilter?: string;
  staticSprite?: boolean;
  isActive?: boolean;
  dimmed?: boolean;
  topBadge?: string;
  infoSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
}

export default function PokemonCard({
  pokedexNumber, name, type1, type2,
  spriteSize = 72, spriteFilter, staticSprite,
  isActive, dimmed, topBadge, infoSlot, actionSlot,
}: PokemonCardProps) {
  return (
    <div style={{
      background: c.surface,
      borderRadius: 10,
      padding: '1.25rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.35rem',
      boxShadow: c.shadowMd,
      border: isActive ? `3px solid ${c.primary}` : '3px solid transparent',
      opacity: dimmed ? 0.55 : 1,
      transition: 'opacity 0.2s',
      position: 'relative',
    }}>
      {topBadge && (
        <span style={{ position: 'absolute', top: '0.4rem', left: '0.5rem', fontSize: '0.65rem', color: c.caption, fontWeight: 700 }}>
          {topBadge}
        </span>
      )}

      {staticSprite ? (
        <img
          src={SPRITE_STATIC_URL(pokedexNumber)}
          alt={name}
          width={spriteSize}
          height={spriteSize}
          style={{ objectFit: 'contain', filter: spriteFilter }}
        />
      ) : (
        <PokemonSprite pokedexNumber={pokedexNumber} size={spriteSize} alt={name} />
      )}

      <strong style={{ fontSize: '0.875rem', textAlign: 'center' }}>{name}</strong>

      {(type1 || type2) && (
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {type1 && <TypeBadge type={type1} />}
          {type2 && <TypeBadge type={type2} />}
        </div>
      )}

      {infoSlot && (
        <div style={{ fontSize: '0.78rem', color: c.body, textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}>
          {infoSlot}
        </div>
      )}

      {actionSlot && (
        <div style={{ marginTop: 'auto', paddingTop: '0.35rem', display: 'flex', justifyContent: 'center' }}>
          {actionSlot}
        </div>
      )}
    </div>
  );
}
