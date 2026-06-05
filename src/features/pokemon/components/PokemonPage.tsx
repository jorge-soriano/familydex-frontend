import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePokemonCollection, useSetActive } from '../hooks/usePokemon';
import { useBalance } from '../../activity/hooks/useActivity';
import PokemonOnboarding from './PokemonOnboarding';
import PokemonDisplay from './PokemonDisplay';
import PokemonSprite from './PokemonSprite';
import CaptureScreen from './CaptureScreen';
import PokedexTab from './PokedexTab';
import TypeBadge from './TypeBadge';
import EvolutionModal from './EvolutionModal';
import type { CaughtPokemonItem } from '../api';
import { c } from '../../../styles/tokens';

type Tab = 'activo' | 'caja' | 'pokedex' | 'capturar';

/** Returns true if this caught pokemon has evolved into another one in the collection. */
function hasEvolved(item: CaughtPokemonItem, collection: CaughtPokemonItem[]): boolean {
  if (!item.pokemon.evolvesToPokedexNumber) return false;
  return collection.some(
    (other) => other.pokemon.pokedexNumber === item.pokemon.evolvesToPokedexNumber
  );
}

const VALID_TABS: Tab[] = ['activo', 'caja', 'pokedex', 'capturar'];

export default function PokemonPage() {
  const [searchParams] = useSearchParams();
  const { data, isLoading } = usePokemonCollection();
  const { data: balance } = useBalance();
  const setActive = useSetActive();

  const paramTab = searchParams.get('tab') as Tab;
  const [tab, setTab] = useState<Tab>(
    VALID_TABS.includes(paramTab) ? paramTab : 'activo'
  );
  const [showEvo, setShowEvo] = useState(false);

  if (isLoading) return <p style={{ padding: '2rem' }}>Cargando…</p>;

  // Onboarding: no pokemon yet
  if (!data?.active && data?.collection.length === 0) {
    return <PokemonOnboarding />;
  }

  const pendingCaptures = balance?.pendingCaptures ?? 0;
  const collection = data?.collection ?? [];

  // Caja shows only current forms (not evolved-from entries)
  const boxItems = collection.filter((item) => !hasEvolved(item, collection));
  const boxLabel = boxItems.length > 1 ? `📦 Caja (${boxItems.length})` : '📦 Caja';

  const TABS: { key: Tab; label: string }[] = [
    { key: 'activo',   label: '⭐ Activo' },
    { key: 'caja',     label: boxLabel },
    { key: 'pokedex',  label: '📖 Pokédex' },
    { key: 'capturar', label: `🎯 Capturar${pendingCaptures > 0 ? ` (${pendingCaptures})` : ''}` },
  ];

  return (
    <div style={styles.page}>
      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.key}
            style={{ ...styles.tab, color: tab === t.key ? c.primary : c.body, borderBottom: tab === t.key ? `2px solid ${c.primary}` : '2px solid transparent' }}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Evolution banner */}
      {data?.active?.readyToEvolve && (
        <div style={{ background: c.warningSubtle, border: `1px solid ${c.warning}`, borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: c.warningDark, fontSize: '0.9rem' }}>
            ⚡ <strong>{data.active.pokemon.name}</strong> puede evolucionar
          </span>
          <button
            style={{ padding: '0.35rem 0.85rem', background: c.warning, color: c.surface, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}
            onClick={() => setShowEvo(true)}>
            Evolucionar
          </button>
        </div>
      )}

      {/* ── Activo ─────────────────────────────────────────────────────────── */}
      {tab === 'activo' && (
        <div>
          {data?.active
            ? <PokemonDisplay data={data.active} />
            : <p style={styles.empty}>Sin Pokémon activo. Activa uno desde la Caja.</p>
          }
        </div>
      )}

      {/* ── Caja — solo formas actuales, sin Pokémon que ya han evolucionado */}
      {tab === 'caja' && (
        <div style={styles.grid}>
          {boxItems.map((item) => {
            const isActive = item.isActive;

            return (
              <div key={item.id}
                style={{
                  ...styles.card,
                  border: isActive ? `3px solid ${c.primary}` : '3px solid transparent',
                }}>
                <PokemonSprite pokedexNumber={item.pokemon.pokedexNumber} size={72} alt={item.pokemon.name} />
                <strong style={{ fontSize: '0.85rem' }}>{item.pokemon.name}</strong>
                <div style={styles.types}>
                  <TypeBadge type={item.pokemon.type1} />
                  {item.pokemon.type2 && <TypeBadge type={item.pokemon.type2} />}
                </div>
                <span style={{ fontSize: '0.78rem', color: c.body }}>Nv. {item.level}</span>

                {isActive ? (
                  <span style={styles.activeBadge}>Activo ✓</span>
                ) : (
                  <button
                    style={styles.activateBtn}
                    onClick={() => setActive.mutate(item.id)}
                    disabled={setActive.isPending}
                  >
                    Activar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pokédex ───────────────────────────────────────────────────────── */}
      {tab === 'pokedex' && <PokedexTab />}

      {/* ── Capturar ──────────────────────────────────────────────────────── */}
      {tab === 'capturar' && <CaptureScreen />}

      {showEvo && data?.active && (
        <EvolutionModal
          active={data.active}
          onClose={() => setShowEvo(false)}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: 900, margin: '0 auto' },
  tabs: { display: 'flex', flexWrap: 'wrap', borderBottom: `2px solid ${c.stroke}`, marginBottom: '1.5rem' },
  tab: { padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', background: 'transparent', marginBottom: '-2px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' },
  card: {
    background: c.surface, borderRadius: 10, padding: '1.25rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
    boxShadow: c.shadowMd,
  },
  types: { display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' },
  activeBadge: { fontSize: '0.72rem', color: c.primary, fontWeight: 700 },
  evolvedBadge: {
    fontSize: '0.7rem', color: c.warning, fontWeight: 700,
    background: c.warningSubtle, padding: '2px 8px', borderRadius: 8,
  },
  activateBtn: {
    padding: '0.3rem 0.75rem', background: c.subtle,
    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
  },
  empty: { color: c.caption, textAlign: 'center', padding: '2rem' },
};
