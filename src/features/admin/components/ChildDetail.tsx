import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminChild } from '../hooks/useAdmin';
import { useTasks } from '../../tasks/hooks/useTasks';
import { usePokemonCollection } from '../../pokemon/hooks/usePokemon';
import { useRewardRequests } from '../../rewards/hooks/useRewards';
import { SPRITE_STATIC_URL } from '../../pokemon/api';
import HistoryList from '../../activity/components/HistoryList';
import TaskCard from '../../tasks/components/TaskCard';

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

  if (isLoading) return <p style={{ padding: '2rem' }}>Cargando…</p>;
  if (!child) return <p style={{ padding: '2rem', color: '#ef4444' }}>Hijo no encontrado.</p>;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'resumen',     label: '📊 Resumen' },
    { key: 'tareas',      label: `📋 Tareas (${tasks.length})` },
    { key: 'historial',   label: '💰 Historial' },
    { key: 'pokemon',     label: `🎮 Pokémon (${pokemonData?.collection.length ?? 0})` },
    { key: 'solicitudes', label: `🎁 Solicitudes (${childRequests.length})` },
  ];

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <Link to="/admin/children" style={styles.back}>← Volver</Link>
        <div style={{ ...styles.avatar, background: child.avatarColor ?? '#6366f1' }}>
          {child.displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={styles.name}>{child.displayName}</h2>
          <span style={styles.username}>@{child.username}</span>
        </div>
        {!child.isActive && <span style={styles.inactiveBadge}>Cuenta inactiva</span>}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.key}
            style={{ ...styles.tab, background: tab === t.key ? '#3b82f6' : '#f1f5f9', color: tab === t.key ? '#fff' : '#333' }}
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
              <img src={SPRITE_STATIC_URL(child.activePokemon.pokedexNumber)}
                alt={child.activePokemon.name} width={64} height={64}
                style={{ imageRendering: 'pixelated' }} />
              <div>
                <p style={styles.statLabel}>Pokémon activo</p>
                <p style={{ ...styles.statValue, fontSize: '1.25rem' }}>{child.activePokemon.name}</p>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>Nivel {child.activePokemon.level}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tareas tab */}
      {tab === 'tareas' && (
        <div style={styles.section}>
          {tasks.length === 0 && <p style={styles.empty}>Sin tareas asignadas.</p>}
          {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      )}

      {/* Historial tab */}
      {tab === 'historial' && <HistoryList childId={childId} />}

      {/* Pokémon tab (HU-33) */}
      {tab === 'pokemon' && (
        <div style={styles.pokeGrid}>
          {(pokemonData?.collection.length ?? 0) === 0 && (
            <p style={styles.empty}>No ha elegido su Pokémon inicial todavía.</p>
          )}
          {pokemonData?.collection.map((item) => (
            <div key={item.id} style={{ ...styles.pokeCard, border: item.isActive ? '3px solid #3b82f6' : '3px solid transparent' }}>
              <img src={SPRITE_STATIC_URL(item.pokemon.pokedexNumber)}
                alt={item.pokemon.name} width={64} height={64}
                style={{ imageRendering: 'pixelated' }} />
              <strong style={{ fontSize: '0.9rem' }}>{item.pokemon.name}</strong>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Nv. {item.level}</span>
              {item.isActive && <span style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 700 }}>Activo ✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* Solicitudes tab */}
      {tab === 'solicitudes' && (
        <div style={styles.section}>
          {childRequests.length === 0 && <p style={styles.empty}>Sin solicitudes de recompensa.</p>}
          {childRequests.map((rr) => (
            <div key={rr.id} style={styles.reqRow}>
              <span>{rr.reward?.name ?? `Recompensa #${rr.rewardId}`}</span>
              <span style={{ fontWeight: 700 }}>🪙 {rr.coinsReserved}</span>
              <span style={{ color: rr.status === 'Approved' ? '#22c55e' : rr.status === 'Pending' ? '#f59e0b' : '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>
                {rr.status === 'Pending' ? '⏳ Pendiente' : rr.status === 'Approved' ? '✅ Aprobada' : '❌ Rechazada'}
              </span>
              {rr.rejectionReason && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{rr.rejectionReason}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: 900, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  back: { color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', marginRight: '0.5rem' },
  avatar: { width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.4rem', flexShrink: 0 },
  name: { margin: 0, fontSize: '1.5rem', fontWeight: 800 },
  username: { color: '#94a3b8', fontSize: '0.85rem' },
  inactiveBadge: { marginLeft: 'auto', background: '#fef2f2', color: '#ef4444', padding: '3px 10px', borderRadius: 12, fontWeight: 700, fontSize: '0.8rem' },
  tabs: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  tab: { padding: '0.45rem 1rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' },
  statCard: { background: '#fff', borderRadius: 10, padding: '1rem 1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column' },
  statLabel: { margin: '0 0 0.25rem', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 },
  statValue: { margin: 0, fontSize: '1.6rem', fontWeight: 800 },
  section: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  pokeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' },
  pokeCard: { background: '#fff', borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  reqRow: { display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  empty: { color: '#94a3b8', padding: '1rem 0' },
};
