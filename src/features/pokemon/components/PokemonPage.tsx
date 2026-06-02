import { useState } from 'react';
import { usePokemonCollection, useSetActive } from '../hooks/usePokemon';
import { useBalance } from '../../economy/hooks/useEconomy';
import PokemonOnboarding from './PokemonOnboarding';
import PokemonDisplay from './PokemonDisplay';
import PokemonSprite from './PokemonSprite';
import CaptureScreen from './CaptureScreen';
import TypeBadge from './TypeBadge';

type Tab = 'activo' | 'coleccion' | 'capturar';

export default function PokemonPage() {
  const { data, isLoading } = usePokemonCollection();
  const { data: balance } = useBalance();
  const setActive = useSetActive();
  const [tab, setTab] = useState<Tab>('activo');

  if (isLoading) return <p style={{ padding: '2rem' }}>Cargando…</p>;

  // Onboarding: child has no pokemon yet
  if (!data?.active && data?.collection.length === 0) {
    return <PokemonOnboarding />;
  }

  const pendingCaptures = balance?.pendingCaptures ?? 0;

  return (
    <div style={styles.page}>
      {/* Tabs */}
      <div style={styles.tabs}>
        {(['activo', 'coleccion', 'capturar'] as Tab[]).map((t) => (
          <button
            key={t}
            style={{ ...styles.tab, background: tab === t ? '#3b82f6' : '#f1f5f9', color: tab === t ? '#fff' : '#333' }}
            onClick={() => setTab(t)}
          >
            {t === 'activo' ? '⭐ Activo' : t === 'coleccion' ? '📦 Colección' : `🎯 Capturar${pendingCaptures > 0 ? ` (${pendingCaptures})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'activo' && (
        <div style={styles.section}>
          {data?.active
            ? <PokemonDisplay data={data.active} />
            : <p style={styles.empty}>Sin Pokémon activo. Activa uno desde tu colección.</p>
          }
        </div>
      )}

      {tab === 'coleccion' && (
        <div style={styles.grid}>
          {data?.collection.map((item) => (
            <div key={item.id} style={{ ...styles.card, border: item.isActive ? '3px solid #3b82f6' : '3px solid transparent' }}>
              <PokemonSprite pokedexNumber={item.pokemon.pokedexNumber} size={80} alt={item.pokemon.name} />
              <strong>{item.pokemon.name}</strong>
              <div style={styles.types}>
                <TypeBadge type={item.pokemon.type1} />
                {item.pokemon.type2 && <TypeBadge type={item.pokemon.type2} />}
              </div>
              <span style={styles.lvl}>Nv. {item.level}</span>
              {item.isActive
                ? <span style={styles.activeBadge}>Activo ✓</span>
                : (
                  <button
                    style={styles.activateBtn}
                    onClick={() => setActive.mutate(item.id)}
                    disabled={setActive.isPending}
                  >
                    Activar
                  </button>
                )
              }
            </div>
          ))}
        </div>
      )}

      {tab === 'capturar' && <CaptureScreen />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: 900, margin: '0 auto' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  tab: { padding: '0.5rem 1.25rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' },
  section: {},
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  types: { display: 'flex', gap: '0.3rem' },
  lvl: { fontSize: '0.8rem', color: '#64748b', fontWeight: 700 },
  activeBadge: { color: '#3b82f6', fontSize: '0.75rem', fontWeight: 700 },
  activateBtn: { padding: '0.3rem 0.75rem', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  empty: { color: '#94a3b8', textAlign: 'center', padding: '2rem' },
};
