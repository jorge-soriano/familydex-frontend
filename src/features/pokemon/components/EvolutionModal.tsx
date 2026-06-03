import { useState } from 'react';
import PokemonSprite from './PokemonSprite';
import TypeBadge from './TypeBadge';
import { useEvolveActive } from '../hooks/usePokemon';
import type { ActivePokemonResult, PokemonData } from '../api';
import '../evolution.css';

type Phase = 'idle' | 'flashing' | 'revealing' | 'done';

interface Props {
  active: ActivePokemonResult;
  onClose: () => void;
}

export default function EvolutionModal({ active, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [evolvedPokemon, setEvolvedPokemon] = useState<PokemonData | null>(null);
  const [trigger, setTrigger] = useState<string | null>(null);
  const evolve = useEvolveActive();

  const handleEvolve = async () => {
    setPhase('flashing');

    // Run animation and API call in parallel; wait at least 2.4s for the animation
    const [result] = await Promise.all([
      evolve.mutateAsync(),
      new Promise<void>((resolve) => setTimeout(resolve, 2400)),
    ]);

    setEvolvedPokemon(result.evolvedTo);
    setTrigger(result.trigger);
    setPhase('revealing');

    setTimeout(() => setPhase('done'), 900);
  };

  const p = active.pokemon;

  return (
    <div style={overlay} onClick={phase === 'done' ? onClose : undefined}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        {/* idle / flashing: show current pokemon */}
        {(phase === 'idle' || phase === 'flashing') && (
          <>
            <h2 style={title}>
              {phase === 'idle'
                ? `⚡ ¡${p.name} puede evolucionar!`
                : `✨ ${p.name} está evolucionando…`}
            </h2>

            {p.evolutionTrigger && phase === 'idle' && (
              <p style={triggerText}>{p.evolutionTrigger}</p>
            )}

            <div style={spriteWrap}>
              <div className={phase === 'flashing' ? 'evo-flashing' : undefined}>
                <PokemonSprite pokedexNumber={p.pokedexNumber} size={140} alt={p.name} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <TypeBadge type={p.type1} />
              {p.type2 && <TypeBadge type={p.type2} />}
            </div>

            {p.pokedexDescription && (
              <p style={desc}>{p.pokedexDescription}</p>
            )}

            <div style={btns}>
              {phase === 'idle' && (
                <>
                  <button style={cancelBtn} onClick={onClose}>Ahora no</button>
                  <button style={evolveBtn} onClick={handleEvolve} disabled={evolve.isPending}>
                    ⚡ Evolucionar
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* revealing / done: show evolved pokemon */}
        {(phase === 'revealing' || phase === 'done') && evolvedPokemon && (
          <>
            <h2 style={{ ...title, color: '#f59e0b' }}>
              ✨ ¡{p.name} ha evolucionado en {evolvedPokemon.name}!
            </h2>
            {trigger && <p style={triggerText}>{trigger}</p>}

            <div style={spriteWrap}>
              <div className={phase === 'revealing' ? 'evo-reveal' : undefined}>
                <PokemonSprite pokedexNumber={evolvedPokemon.pokedexNumber} size={140} alt={evolvedPokemon.name} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <TypeBadge type={evolvedPokemon.type1} />
              {evolvedPokemon.type2 && <TypeBadge type={evolvedPokemon.type2} />}
            </div>

            {evolvedPokemon.pokedexDescription && (
              <p style={desc}>{evolvedPokemon.pokedexDescription}</p>
            )}

            <div style={btns}>
              {phase === 'done' && (
                <button style={evolveBtn} onClick={onClose}>¡Genial! 🎉</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 200,
};
const modal: React.CSSProperties = {
  background: '#fff', borderRadius: 16,
  padding: '2rem', width: 'calc(100% - 2rem)', maxWidth: 400,
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: '0.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  textAlign: 'center',
};
const title: React.CSSProperties  = { margin: 0, fontSize: '1.15rem', fontWeight: 800 };
const triggerText: React.CSSProperties = { margin: 0, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' };
const desc: React.CSSProperties   = { fontSize: '0.85rem', color: '#555', margin: 0, lineHeight: 1.5 };
const spriteWrap: React.CSSProperties = {
  background: 'radial-gradient(circle, #fef3c7 0%, #f8fafc 70%)',
  borderRadius: '50%', width: 180, height: 180,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0.5rem 0',
};
const btns: React.CSSProperties = { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' };
const cancelBtn: React.CSSProperties = {
  padding: '0.55rem 1.25rem', background: '#f1f5f9',
  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
};
const evolveBtn: React.CSSProperties = {
  padding: '0.55rem 1.5rem', background: '#f59e0b', color: '#fff',
  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: '1rem',
};
