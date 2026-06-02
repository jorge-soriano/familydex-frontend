import { useState } from 'react';
import { useStarters, useChooseInitial } from '../hooks/usePokemon';
import PokemonSprite from './PokemonSprite';
import TypeBadge from './TypeBadge';
import type { PokemonData } from '../api';

export default function PokemonOnboarding() {
  const { data: starters = [], isLoading } = useStarters();
  const [selected, setSelected] = useState<PokemonData | null>(null);
  const choose = useChooseInitial();

  const handleChoose = () => {
    if (!selected) return;
    choose.mutate(selected.id);
  };

  if (isLoading) return <p style={styles.center}>Cargando Pokémon…</p>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>¡Elige tu Pokémon inicial!</h1>
      <p style={styles.sub}>Este Pokémon te acompañará en tu aventura. Elige con cuidado.</p>

      <div style={styles.grid}>
        {starters.map((p) => (
          <button
            key={p.id}
            style={{
              ...styles.card,
              border: selected?.id === p.id ? '3px solid #3b82f6' : '3px solid transparent',
              background: selected?.id === p.id ? '#eff6ff' : '#fff',
            }}
            onClick={() => setSelected(p)}
          >
            <PokemonSprite pokedexNumber={p.pokedexNumber} size={96} alt={p.name} />
            <strong style={styles.cardName}>{p.name}</strong>
            <div style={styles.types}>
              <TypeBadge type={p.type1} />
              {p.type2 && <TypeBadge type={p.type2} />}
            </div>
            {p.pokedexDescription && (
              <p style={styles.desc}>{p.pokedexDescription}</p>
            )}
          </button>
        ))}
      </div>

      {choose.isError && (
        <p style={styles.error}>
          {(choose.error as any)?.response?.data?.message ?? 'Error al elegir'}
        </p>
      )}

      <button
        style={{ ...styles.btn, opacity: selected ? 1 : 0.4 }}
        disabled={!selected || choose.isPending}
        onClick={handleChoose}
      >
        {choose.isPending ? 'Eligiendo…' : selected ? `¡Elegir a ${selected.name}!` : 'Selecciona un Pokémon'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', maxWidth: 800, margin: '0 auto', textAlign: 'center' },
  title: { fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' },
  sub: { color: '#64748b', marginBottom: '2rem' },
  center: { textAlign: 'center', padding: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
    padding: '1rem', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardName: { fontSize: '1.1rem', fontWeight: 800 },
  types: { display: 'flex', gap: '0.3rem' },
  desc: { fontSize: '0.75rem', color: '#64748b', textAlign: 'center', margin: 0 },
  btn: {
    padding: '0.75rem 2rem', background: '#3b82f6', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 700,
    cursor: 'pointer', transition: 'opacity 0.15s',
  },
  error: { color: '#ef4444', marginBottom: '1rem' },
};
