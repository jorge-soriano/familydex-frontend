import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Package, Book, Zap, Check } from 'lucide-react';
import { PokeballIcon } from '../../../shared/components/GameIcons';
import { usePokemonCollection, useSetActive } from '../hooks/usePokemon';
import { useBalance } from '../../activity/hooks/useActivity';
import PokemonOnboarding from './PokemonOnboarding';
import PokemonDisplay from './PokemonDisplay';
import PokemonCard from './PokemonCard';
import CaptureScreen from './CaptureScreen';
import PokedexTab from './PokedexTab';
import EvolutionModal from './EvolutionModal';
import type { CaughtPokemonItem } from '../api';
import { Button } from '../../../shared/components/Button';
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
  const autoTabApplied = useRef(false);

  useEffect(() => {
    if (autoTabApplied.current || paramTab) return;
    if (balance?.pendingCaptures && balance.pendingCaptures > 0) {
      setTab('capturar');
      autoTabApplied.current = true;
    }
  }, [balance?.pendingCaptures, paramTab]);

  if (isLoading) return <p style={{ padding: '2rem', color: c.caption }}>Cargando…</p>;

  // Onboarding: no pokemon yet
  if (!data?.active && data?.collection.length === 0) {
    return <PokemonOnboarding />;
  }

  const pendingCaptures = balance?.pendingCaptures ?? 0;
  const collection = data?.collection ?? [];

  // Caja shows only current forms (not evolved-from entries)
  const boxItems = collection.filter((item) => !hasEvolved(item, collection));
  const TABS: { key: Tab; label: React.ReactNode }[] = [
    { key: 'activo',   label: <><Star size={13} /> Activo</> },
    { key: 'caja',     label: boxItems.length > 1 ? <><Package size={13} /> Caja ({boxItems.length})</> : <><Package size={13} /> Caja</> },
    { key: 'pokedex',  label: <><Book size={13} /> Pokédex</> },
    { key: 'capturar', label: <><PokeballIcon size={13} /> Capturar{pendingCaptures > 0 ? ` (${pendingCaptures})` : ''}</> },
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
          <span style={{ color: c.warningDark, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Zap size={15} /> <strong>{data.active.pokemon.name}</strong> puede evolucionar
          </span>
          <Button
            size="sm"
            style={{ background: c.warning, color: c.surface, border: 'none', flexShrink: 0 }}
            onClick={() => setShowEvo(true)}>
            Evolucionar
          </Button>
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
          {boxItems.map((item) => (
            <PokemonCard
              key={item.id}
              pokedexNumber={item.pokemon.pokedexNumber}
              name={item.pokemon.name}
              type1={item.pokemon.type1}
              type2={item.pokemon.type2}
              isActive={item.isActive}
              infoSlot={<>Nv. {item.level}</>}
              actionSlot={
                item.isActive
                  ? <span style={styles.activeBadge}><Check size={11} /> Activo</span>
                  : <Button variant="secondary" size="sm" onClick={() => setActive.mutate(item.id)} disabled={setActive.isPending}>Activar</Button>
              }
            />
          ))}
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
  page: { padding: '1.5rem', maxWidth: 1200, margin: '0 auto' },
  tabs: { display: 'flex', flexWrap: 'wrap', borderBottom: `2px solid ${c.stroke}`, marginBottom: '1.5rem' },
  tab: { padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', background: 'transparent', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '0.35rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' },
  activeBadge: { fontSize: '0.72rem', color: c.primary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' },
  empty: { color: c.caption, textAlign: 'center', padding: '2rem' },
};
