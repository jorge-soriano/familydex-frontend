import type { ActivePokemonResult } from '../api';
import { Sparkles } from 'lucide-react';
import PokemonSprite from './PokemonSprite';
import TypeBadge, { TYPE_COLORS } from './TypeBadge';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';
import { c } from '../../../styles/tokens';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface Props { data: ActivePokemonResult }

export default function PokemonDisplay({ data }: Props) {
  const { pokemon: p, level, pokemonXp, xpForNextLevel, progressPercent, isFinalForm, evolveLevel } = data;
  const xpToNextLevel = xpForNextLevel - pokemonXp;
  const typeColor = TYPE_COLORS[p.type1] ?? c.primary;
  const isNarrow = useWindowWidth() < 480;

  return (
    <div style={{ ...styles.card,
      flexDirection: isNarrow ? 'column' : 'row', alignItems: 'center',
      background: `linear-gradient(160deg, ${hexToRgba(typeColor, 0.12)} 0%, ${c.surface} 55%)`,
      borderColor: hexToRgba(typeColor, 0.35),
    }}>
      <div style={{ ...styles.spriteWrap,
        minWidth: isNarrow ? 'auto' : 140, minHeight: isNarrow ? 'auto' : 140,
        background: `radial-gradient(ellipse at 50% 60%, ${hexToRgba(typeColor, 0.28)} 0%, ${hexToRgba(typeColor, 0.07)} 100%)`,
        boxShadow: `0 0 0 2px ${hexToRgba(typeColor, 0.45)}, inset 0 3px 12px ${hexToRgba(typeColor, 0.12)}`,
      }}>
        <PokemonSprite pokedexNumber={p.pokedexNumber} size={120} alt={p.name} />
      </div>

      <div style={styles.info}>
        <div style={styles.nameRow}>
          <h3 style={styles.name}>{p.name}</h3>
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
          <span style={styles.xpLabel}>{xpToNextLevel} XP para el siguiente nivel</span>
        </div>

        <div style={styles.barBg}>
          <div style={{ ...styles.barFill, width: `${progressPercent}%` }} />
        </div>

        {isFinalForm ? (
          <p style={{ ...styles.finalForm, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Sparkles size={13} /> Forma final</p>
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
    background: c.surface, borderRadius: 10, padding: '1.5rem',
    boxShadow: c.shadowCard,
    border: '2px solid transparent',
  },
  spriteWrap: {
    borderRadius: 16, padding: '1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 140, minHeight: 140,
  },
  info: { flex: 1 },
  nameRow: { display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' },
  name: { margin: 0, fontSize: '1.5rem', fontWeight: 800 },
  num: { color: c.caption, fontSize: '0.85rem' },
  types: { display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' },
  desc: { fontSize: '0.85rem', color: c.body, margin: '0 0 0.75rem', lineHeight: 1.5 },
  levelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' },
  levelLabel: { fontWeight: 700 },
  xpLabel: { color: c.body },
  barBg: { height: 10, background: c.stroke, borderRadius: 5, overflow: 'hidden', marginBottom: '0.5rem' },
  barFill: { height: '100%', background: `linear-gradient(90deg, ${c.primary}, ${c.accent})`, borderRadius: 5, transition: 'width 0.4s ease' },
  finalForm: { margin: 0, fontSize: '0.8rem', color: c.warning, fontWeight: 700 },
  evoHint: { margin: 0, fontSize: '0.8rem', color: c.body },
};
