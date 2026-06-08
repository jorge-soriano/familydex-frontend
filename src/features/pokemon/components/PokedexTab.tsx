import { Lock } from 'lucide-react';
import { usePokemonCatalog, usePokemonCollection } from '../hooks/usePokemon';
import PokemonCard from './PokemonCard';
import { c } from '../../../styles/tokens';

export default function PokedexTab() {
  const { data: catalog = []    } = usePokemonCatalog();
  const { data: colData          } = usePokemonCollection();
  const collection = colData?.collection ?? [];

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
            <PokemonCard
              key={p.id}
              pokedexNumber={p.pokedexNumber}
              name={owned ? p.name : '???'}
              type1={owned ? p.type1 : undefined}
              type2={owned ? p.type2 : undefined}
              spriteSize={56}
              staticSprite
              spriteFilter={owned ? undefined : 'grayscale(1) brightness(0.3)'}
              dimmed={!owned}
              topBadge={`#${String(p.pokedexNumber).padStart(3, '0')}`}
              infoSlot={!owned ? (
                <span style={styles.locked}>
                  <Lock size={10} />{p.unlockXp > 0 ? ` ${p.unlockXp.toLocaleString()} XP` : ''}
                </span>
              ) : undefined}
            />
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '0.75rem',
  },
  locked: { fontSize: '0.7rem', color: c.caption, display: 'flex', alignItems: 'center', gap: '0.15rem' },
};
