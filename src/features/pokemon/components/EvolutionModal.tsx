import { useState, useEffect } from 'react';
import PokemonSprite from './PokemonSprite';
import TypeBadge from './TypeBadge';
import { useEvolveActive } from '../hooks/usePokemon';
import type { ActivePokemonResult, PokemonData } from '../api';
import '../evolution.css';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';

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

  // Escape solo cierra cuando la animación ha terminado (igual que el overlay click)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && phase === 'done') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [phase, onClose]);

  // Congelar el Pokémon original al montar — cuando mutateAsync() complete,
  // React Query invalida la caché y el prop 'active' cambia al evolucionado.
  // Sin esto, 'p' pasa a ser Charmeleon antes de que termine la animación.
  const [originalPokemon] = useState<PokemonData>(active.pokemon);
  const p = originalPokemon;

  const handleEvolve = async () => {
    setPhase('flashing');

    const [result] = await Promise.all([
      evolve.mutateAsync(),
      new Promise<void>((resolve) => setTimeout(resolve, 2400)),
    ]);

    setEvolvedPokemon(result.evolvedTo);
    setTrigger(result.trigger);
    setPhase('revealing');

    setTimeout(() => setPhase('done'), 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="evo-modal-title"
      style={{ ...overlay, overscrollBehavior: 'contain' } as React.CSSProperties}
      onClick={phase === 'done' ? onClose : undefined}
    >
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        {/* idle / flashing: show current pokemon */}
        {(phase === 'idle' || phase === 'flashing') && (
          <>
            <h2 id="evo-modal-title" style={title}>
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
                  <Button variant="secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={onClose}>Ahora no</Button>
                  <Button style={{ background: c.warning, color: c.surface, padding: '0.55rem 1.5rem', fontSize: '1rem', fontWeight: 800 }} onClick={handleEvolve} disabled={evolve.isPending}>
                    ⚡ Evolucionar
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {/* revealing / done: show evolved pokemon */}
        {(phase === 'revealing' || phase === 'done') && evolvedPokemon && (
          <>
            <h2 id="evo-modal-title" style={{ ...title, color: c.warning }}>
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
                <Button style={{ background: c.warning, color: c.surface, padding: '0.55rem 1.5rem', fontSize: '1rem', fontWeight: 800 }} onClick={onClose}>¡Genial! 🎉</Button>
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
  background: c.overlayDark,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 200,
};
const modal: React.CSSProperties = {
  background: c.surface, borderRadius: 12,
  padding: '2rem', width: 'calc(100% - 2rem)', maxWidth: 400,
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: '0.5rem', boxShadow: c.shadowLg,
  textAlign: 'center',
};
const title: React.CSSProperties  = { margin: 0, fontSize: '1.15rem', fontWeight: 800 };
const triggerText: React.CSSProperties = { margin: 0, fontSize: '0.85rem', color: c.body, fontStyle: 'italic' };
const desc: React.CSSProperties   = { fontSize: '0.85rem', color: c.body, margin: 0, lineHeight: 1.5 };
const spriteWrap: React.CSSProperties = {
  background: `radial-gradient(circle, ${c.warningSubtle} 0%, ${c.page} 70%)`,
  borderRadius: '50%', width: 180, height: 180,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0.5rem 0',
};
const btns: React.CSSProperties = { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' };
