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

      {/* Fixed sprite zone — CSS dimensions guarantee consistent height across GIF canvas sizes */}
      <div style={{ width: spriteSize, height: spriteSize, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {staticSprite ? (
          <img
            src={SPRITE_STATIC_URL(pokedexNumber)}
            alt={name}
            style={{ width: spriteSize, height: spriteSize, objectFit: 'contain', filter: spriteFilter }}
          />
        ) : (
          <PokemonSprite pokedexNumber={pokedexNumber} size={spriteSize} alt={name} />
        )}
      </div>

      <strong style={{ fontSize: '0.875rem', textAlign: 'center' }}>{name}</strong>

      {/* Types area always rendered — prevents height mismatch between owned/unowned cards in same row */}
      <div style={{ minHeight: '1.4rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {type1 && <TypeBadge type={type1} />}
        {type2 && <TypeBadge type={type2} />}
      </div>

      {/* Info area always rendered — reserves consistent height so all cards in a row align */}
      <div style={{ minHeight: '1.1em', fontSize: '0.78rem', color: c.body, textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}>
        {infoSlot}
      </div>

      {actionSlot && (
        <div style={{ marginTop: 'auto', paddingTop: '0.35rem', display: 'flex', justifyContent: 'center' }}>
          {actionSlot}
        </div>
      )}
    </div>
  );
}
