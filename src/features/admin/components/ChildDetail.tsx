import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminChild } from '../hooks/useAdmin';
import { useTasks } from '../../tasks/hooks/useTasks';
import { usePokemonCollection } from '../../pokemon/hooks/usePokemon';
import { useRewardRequests } from '../../rewards/hooks/useRewards';
import { SPRITE_STATIC_URL } from '../../pokemon/api';
import HistoryList from '../../activity/components/HistoryList';
import TaskCard from '../../tasks/components/TaskCard';
import { c } from '../../../styles/tokens';
import { Badge } from '../../../shared/components/Badge';
import type { BadgeVariant } from '../../../shared/components/Badge';

type Tab = 'resumen' | 'tareas' | 'historial' | 'pokemon' | 'solicitudes';

export default function ChildDetail() {
  const { id } = useParams<{ id: string }>();
  const childId = Number(id);
  const [tab, setTab] = useState<Tab>('resumen');

  const { data: child, isLoading } = useAdminChild(childId);
  const { data: tasks = [] } = useTasks({ assignedTo: childId });
  const { data: pokemonData } = usePokemonCollection(childId);
  const { data: requests = [] } = useRewardRequests();

  const childRequests = requests.filter((r) => r.childId === childId);

  if (isLoading) return <p className="p-8">Cargando…</p>;
  if (!child) return <p className="p-8 text-danger">Hijo no encontrado.</p>;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'resumen',     label: '📊 Resumen' },
    { key: 'tareas',      label: `📋 Tareas (${tasks.length})` },
    { key: 'historial',   label: '💰 Historial' },
    { key: 'pokemon',     label: `🎮 Pokémon (${pokemonData?.collection.length ?? 0})` },
    { key: 'solicitudes', label: `🎁 Solicitudes (${childRequests.length})` },
  ];

  const statusVariant = (s: string): BadgeVariant =>
    s === 'Approved' ? 'success' : s === 'Pending' ? 'warning' : 'danger';

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <Link to="/admin/children" className="text-body no-underline text-[0.9rem] mr-2">← Volver</Link>
        <div style={{ ...styles.avatar, background: child.avatarColor ?? c.accent }}>
          {child.displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={styles.name}>{child.displayName}</h2>
          <span className="text-caption text-[0.85rem]">@{child.username}</span>
        </div>
        {!child.isActive && (
          <span style={{ marginLeft: 'auto' }}>
            <Badge variant="danger" subtle>Cuenta inactiva</Badge>
          </span>
        )}
      </div>

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

      {/* Resumen tab */}
      {tab === 'resumen' && (
        <div style={styles.summaryGrid}>
          <div style={styles.statCard}><p style={styles.statLabel}>Monedas</p><p style={styles.statValue}>🪙 {child.coins}</p></div>
          <div style={styles.statCard}><p style={styles.statLabel}>XP total</p><p style={styles.statValue}>⭐ {child.xp}</p></div>
          <div style={styles.statCard}><p style={styles.statLabel}>Pokémon</p><p style={styles.statValue}>{pokemonData?.collection.length ?? 0} / {1 + Math.floor(child.xp / 5000)}</p></div>
          <div style={styles.statCard}><p style={styles.statLabel}>En revisión</p><p style={styles.statValue}>{child.pendingReviewCount}</p></div>

          {child.activePokemon && (
            <div style={{ ...styles.statCard, flexDirection: 'row', gap: '1rem', gridColumn: '1/-1', alignItems: 'center' }}>
              <img src={SPRITE_STATIC_URL(child.activePokemon.pokedexNumber)} alt={child.activePokemon.name} width={64} height={64} style={{ imageRendering: 'pixelated' }} />
              <div>
                <p style={styles.statLabel}>Pokémon activo</p>
                <p style={{ ...styles.statValue, fontSize: '1.25rem' }}>{child.activePokemon.name}</p>
                <p className="text-body m-0 text-[0.85rem]">Nivel {child.activePokemon.level}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tareas tab */}
      {tab === 'tareas' && (
        <div className="flex flex-col gap-2">
          {tasks.length === 0 && <p className="text-caption py-4">Sin tareas asignadas.</p>}
          {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      )}

      {/* Historial tab */}
      {tab === 'historial' && <HistoryList childId={childId} />}

      {/* Pokémon tab */}
      {tab === 'pokemon' && (
        <div style={styles.pokeGrid}>
          {(pokemonData?.collection.length ?? 0) === 0 && (
            <p className="text-caption py-4">No ha elegido su Pokémon inicial todavía.</p>
          )}
          {pokemonData?.collection.map((item) => (
            <div key={item.id} style={{ ...styles.pokeCard, border: item.isActive ? `3px solid ${c.primary}` : '3px solid transparent' }}>
              <img src={SPRITE_STATIC_URL(item.pokemon.pokedexNumber)} alt={item.pokemon.name} width={64} height={64} style={{ imageRendering: 'pixelated' }} />
              <strong style={{ fontSize: '0.9rem' }}>{item.pokemon.name}</strong>
              <span className="text-body text-[0.8rem]">Nv. {item.level}</span>
              {item.isActive && <span style={{ fontSize: '0.72rem', color: c.primary, fontWeight: 700 }}>Activo ✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* Solicitudes tab */}
      {tab === 'solicitudes' && (
        <div className="flex flex-col gap-2">
          {childRequests.length === 0 && <p className="text-caption py-4">Sin solicitudes de recompensa.</p>}
          {childRequests.map((rr) => (
            <div key={rr.id} style={styles.reqRow}>
              <span>{rr.reward?.name ?? `Recompensa #${rr.rewardId}`}</span>
              <span className="font-bold">🪙 {rr.coinsReserved}</span>
              <Badge variant={statusVariant(rr.status)} subtle>
                {rr.status === 'Pending' ? 'Pendiente' : rr.status === 'Approved' ? 'Aprobada' : 'Rechazada'}
              </Badge>
              {rr.rejectionReason && <span className="text-caption text-[0.8rem]">{rr.rejectionReason}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:        { padding: '1.5rem', maxWidth: 900, margin: '0 auto' },
  header:      { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  avatar:      { width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.surface, fontWeight: 800, fontSize: '1.4rem', flexShrink: 0 },
  name:        { margin: 0, fontSize: '1.5rem', fontWeight: 800 },
  tabs:        { display: 'flex', flexWrap: 'wrap', borderBottom: `2px solid ${c.stroke}`, marginBottom: '1.5rem' },
  tab:         { padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', background: 'transparent', marginBottom: '-2px' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' },
  statCard:    { background: c.surface, borderRadius: 10, padding: '1rem 1.25rem', boxShadow: c.shadowSm, display: 'flex', flexDirection: 'column' },
  statLabel:   { margin: '0 0 0.25rem', fontSize: '0.78rem', color: c.body, fontWeight: 600 },
  statValue:   { margin: 0, fontSize: '1.6rem', fontWeight: 800 },
  pokeGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' },
  pokeCard:    { background: c.surface, borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', boxShadow: c.shadowSm },
  reqRow:      { display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', background: c.surface, borderRadius: 8, boxShadow: c.shadowSm },
};
