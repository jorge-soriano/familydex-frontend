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
      className={`flex items-center bg-night text-white shrink-0 ${isNarrow ? 'gap-2 px-4 py-[0.5rem]' : 'gap-3 px-6 py-[0.45rem]'}`}>

      <span className={`bg-white/20 border border-white/25 rounded-full flex items-center gap-[0.35rem] ${isNarrow ? 'px-[0.5rem] py-[0.2rem]' : 'px-[0.75rem] py-[0.3rem]'}`}>
        <span className={isNarrow ? 'text-[0.85rem]' : 'text-[0.9rem]'}>🪙</span>
        <span className={`font-black leading-none ${isNarrow ? 'text-[1rem]' : 'text-[1.2rem]'}`}>{balance?.coins ?? '—'}</span>
      </span>

      <span className="w-px h-5 bg-white/25 self-center shrink-0" />

      <span className={`bg-white/20 border border-white/25 rounded-full flex items-center gap-[0.35rem] ${isNarrow ? 'px-[0.5rem] py-[0.2rem]' : 'px-[0.75rem] py-[0.3rem]'}`}>
        <span className={isNarrow ? 'text-[0.85rem]' : 'text-[0.9rem]'}>⭐</span>
        <span className={`font-black leading-none ${isNarrow ? 'text-[1rem]' : 'text-[1.2rem]'}`}>{balance?.xp ?? '—'}</span>
        {!isNarrow && <span className="opacity-50 font-medium text-[0.7rem]">XP</span>}
      </span>

      {(readyToEvolve || pending > 0) && (
        <div className="ml-auto flex gap-2 items-center">
          {readyToEvolve && (
            <Link
              to="/child/pokemon"
              aria-label={`${activeName} puede evolucionar`}
              className={`${chipBase} bg-warning`}
            >
              ⚡ {isNarrow ? '' : `${activeName} puede evolucionar`}
            </Link>
          )}
          {pending > 0 && (
            <Link
              to="/child/pokemon?tab=capturar"
              aria-label={`${pending} Pokémon por capturar`}
              className={`${chipBase} bg-warning`}
            >
              🎯 {isNarrow ? pending : `${pending} Pokémon por capturar`}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
