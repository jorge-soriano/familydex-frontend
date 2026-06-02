import type { ActivePokemonResult } from '../api';
import PokemonSprite from './PokemonSprite';
import TypeBadge from './TypeBadge';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';

interface Props { data: ActivePokemonResult }

export default function PokemonDisplay({ data }: Props) {
  const { pokemon: p, level, pokemonXp, xpForNextLevel, progressPercent, isFinalForm, evolveLevel } = data;
  const isNarrow = useWindowWidth() < 480;

  return (
    <div style={{ ...styles.card, flexDirection: isNarrow ? 'column' : 'row', alignItems: isNarrow ? 'center' : 'center' }}>
      <div style={{ ...styles.spriteWrap, minWidth: isNarrow ? 'auto' : 140, minHeight: isNarrow ? 'auto' : 140 }}>
        <PokemonSprite pokedexNumber={p.pokedexNumber} size={120} alt={p.name} />
      </div>

      <div style={styles.info}>
        <div style={styles.nameRow}>
          <h2 style={styles.name}>{p.name}</h2>
          <span style={styles.num}>#{String(p.pokedexNumber).padStart(3, '0')}</span>
        </div>

        <div style={styles.types}>
          <TypeBadge type={p.type1} />
          {p.type2 && <TypeBadge type={p.type2} />}
        </div>

        {p.pokedexDescription && (
          <p style={styles.desc}>{p.pokedexDescription}</p>
        )}

        <div style={styles.levelRow}>
          <span style={styles.levelLabel}>Nv. {level}</span>
          <span style={styles.xpLabel}>{pokemonXp} / {xpForNextLevel} XP</span>
        </div>

        <div style={styles.barBg}>
          <div style={{ ...styles.barFill, width: `${progressPercent}%` }} />
        </div>

        {isFinalForm ? (
          <p style={styles.finalForm}>✨ Forma final</p>
        ) : (
          <p style={styles.evoHint}>
            Evoluciona en nivel {evolveLevel}
            {p.evolutionTrigger && ` — ${p.evolutionTrigger}`}
          </p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex', gap: '1.5rem', alignItems: 'center',
    background: '#fff', borderRadius: 14, padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  spriteWrap: {
    background: '#f8fafc', borderRadius: 12, padding: '0.75rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 140, minHeight: 140,
  },
  info: { flex: 1 },
  nameRow: { display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' },
  name: { margin: 0, fontSize: '1.5rem', fontWeight: 800 },
  num: { color: '#94a3b8', fontSize: '0.85rem' },
  types: { display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' },
  desc: { fontSize: '0.85rem', color: '#555', margin: '0 0 0.75rem', lineHeight: 1.5 },
  levelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' },
  levelLabel: { fontWeight: 700 },
  xpLabel: { color: '#64748b' },
  barBg: { height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', marginBottom: '0.5rem' },
  barFill: { height: '100%', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: 5, transition: 'width 0.4s ease' },
  finalForm: { margin: 0, fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 },
  evoHint: { margin: 0, fontSize: '0.8rem', color: '#64748b' },
};
