import { useAvailableToCapture, useCapture } from '../hooks/usePokemon';
import { useBalance } from '../../activity/hooks/useActivity';
import { Unlock } from 'lucide-react';
import { PokeballIcon } from '../../../shared/components/GameIcons';
import PokemonCard from './PokemonCard';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';

export default function CaptureScreen() {
  const { data: available = [], isLoading } = useAvailableToCapture();
  const { data: balance } = useBalance();
  const capture = useCapture();

  const pendingCaptures = balance?.pendingCaptures ?? 0;

  return (
    <div style={styles.page}>
      {pendingCaptures > 0 ? (
        <div style={{ ...styles.banner, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <PokeballIcon size={15} /> Tienes <strong>{pendingCaptures}</strong>{' '}
          {pendingCaptures === 1 ? 'captura disponible' : 'capturas disponibles'}
        </div>
      ) : (
        <div style={styles.noCap}>
          Completa tareas para ganar XP y desbloquear nuevas capturas.<br />
          Cada <strong>5 000 XP</strong> ganas una captura adicional.
        </div>
      )}

      {isLoading && <p style={styles.loading}>Cargando…</p>}

      {!isLoading && available.length === 0 && (
        <p style={styles.empty}>¡Tienes todos los Pokémon disponibles! Gana más XP para desbloquear los siguientes.</p>
      )}

      {available.length > 0 && (
        <div style={styles.grid}>
          {available.map((p) => (
            <PokemonCard
              key={p.id}
              pokedexNumber={p.pokedexNumber}
              name={p.name}
              type1={p.type1}
              type2={p.type2}
              infoSlot={p.unlockXp > 0 ? <span style={{ color: c.success, fontWeight: 700 }}><Unlock size={11} /> {p.unlockXp.toLocaleString()} XP</span> : undefined}
              actionSlot={
                <Button
                  size="sm"
                  disabled={pendingCaptures === 0 || capture.isPending}
                  onClick={() => capture.mutate(p.id)}
                >
                  {pendingCaptures > 0 ? '¡Capturar!' : 'Sin capturas'}
                </Button>
              }
            />
          ))}
        </div>
      )}

      {capture.isError && (
        <p style={styles.error}>
          {(capture.error as any)?.response?.data?.message ?? 'Error al capturar'}
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1200, margin: '0 auto', paddingTop: '0.25rem' },
  banner: { background: c.primarySubtle, border: `1px solid ${c.primaryLight}`, borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: c.primaryDark },
  noCap: { background: c.page, borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: c.body, fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' },
  loading: { color: c.caption },
  empty: { color: c.caption, textAlign: 'center', padding: '2rem', fontSize: '0.9rem' },
  error: { color: c.danger, marginTop: '1rem', textAlign: 'center' },
};
