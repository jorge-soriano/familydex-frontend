import { Link } from 'react-router-dom';
import { useBalance } from '../hooks/useActivity';
import { usePokemonCollection } from '../../pokemon/hooks/usePokemon';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';

export default function BalanceBar() {
  const { data: balance }  = useBalance();
  const { data: pokemon }  = usePokemonCollection();
  const isNarrow = useWindowWidth() < 480;
  const pending  = balance?.pendingCaptures ?? 0;
  const readyToEvolve = pokemon?.active?.readyToEvolve ?? false;
  const activeName    = pokemon?.active?.pokemon.name ?? '';

  const chipBase = `text-white font-bold rounded-xl no-underline whitespace-nowrap ${isNarrow ? 'text-[0.72rem] py-[0.2rem] px-[0.6rem]' : 'text-[0.8rem] py-1 px-3'}`;

  return (
    <div
      className={`flex items-center bg-night text-white shrink-0 ${isNarrow ? 'gap-3 px-4 py-[0.4rem] text-[0.82rem]' : 'gap-6 px-6 py-2 text-[0.9rem]'}`}>
      <span>🪙 <strong>{balance?.coins ?? '—'}</strong></span>
      <span>⭐ <strong>{balance?.xp ?? '—'}</strong> XP</span>

      {(readyToEvolve || pending > 0) && (
        <div className="ml-auto flex gap-2 items-center">
          {readyToEvolve && (
            <Link to="/child/pokemon" className={`${chipBase} bg-warning`}>
              ⚡ {isNarrow ? '' : `${activeName} puede evolucionar`}
            </Link>
          )}
          {pending > 0 && (
            <Link to="/child/pokemon?tab=capturar" className={`${chipBase} bg-warning`}>
              🎯 {isNarrow ? pending : `${pending} Pokémon por capturar`}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
