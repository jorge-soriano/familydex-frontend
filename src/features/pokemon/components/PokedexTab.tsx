import { usePokemonCatalog, usePokemonCollection } from '../hooks/usePokemon';
import { SPRITE_STATIC_URL } from '../api';
import TypeBadge from './TypeBadge';
import { c } from '../../../styles/tokens';

export default function PokedexTab() {
  const { data: catalog = []    } = usePokemonCatalog();
  const { data: colData          } = usePokemonCollection();
  const collection = colData?.collection ?? [];

  // Pokedex numbers the child owns (any CaughtPokemon, active or not)
  const ownedNumbers = new Set(collection.map((c) => c.pokemon.pokedexNumber));

  return (
    <div style={styles.page}>
      <p style={styles.counter}>
        {ownedNumbers.size} / {catalog.length} Pokémon descubiertos
      </p>

      <div style={styles.grid}>
        {catalog.map((p) => {
          const owned = ownedNumbers.has(p.pokedexNumber);

          return (
            <div key={p.id} style={{ ...styles.card, opacity: owned ? 1 : 0.55 }}>
              <span style={styles.num}>#{String(p.pokedexNumber).padStart(3, '0')}</span>
              <div style={styles.spriteWrap}>
                <img
                  src={SPRITE_STATIC_URL(p.pokedexNumber)}
                  alt={owned ? p.name : '???'}
                  width={56} height={56}
                  style={{
                    imageRendering: 'pixelated',
                    filter: owned ? 'none' : 'grayscale(1) brightness(0.3)',
                  }}
                />
              </div>
              <strong style={styles.name}>{owned ? p.name : '???'}</strong>

              {owned ? (
                <div style={styles.types}>
                  <TypeBadge type={p.type1} />
                  {p.type2 && <TypeBadge type={p.type2} />}
                </div>
              ) : (
                <span style={styles.locked}>
                  {p.unlockXp > 0 ? `🔒 ${p.unlockXp.toLocaleString()} XP` : '🔒'}
                </span>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { paddingTop: '0.5rem' },
  counter: { fontSize: '0.85rem', color: c.body, marginBottom: '1rem', fontWeight: 600 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    gap: '0.75rem',
  },
  card: {
    background: c.surface, borderRadius: 10,
    padding: '0.75rem 0.5rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    transition: 'opacity 0.2s',
  },
  num: { fontSize: '0.7rem', color: c.caption, fontWeight: 700 },
  spriteWrap: { width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: '0.8rem', textAlign: 'center' },
  types: { display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' },
  locked: { fontSize: '0.7rem', color: c.caption },
  level: { fontSize: '0.72rem', color: c.primary, fontWeight: 700 },
};
