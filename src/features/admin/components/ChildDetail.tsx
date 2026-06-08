import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, BarChart2, ClipboardList, History, Gift, Check } from 'lucide-react';
import { CoinIcon, XpIcon, PokeballIcon } from '../../../shared/components/GameIcons';
import { useAdminChild } from '../hooks/useAdmin';
import { useTasks } from '../../tasks/hooks/useTasks';
import { usePokemonCollection } from '../../pokemon/hooks/usePokemon';
import { useRewardRequests } from '../../rewards/hooks/useRewards';
import { SPRITE_STATIC_URL } from '../../pokemon/api';
import PokemonCard from '../../pokemon/components/PokemonCard';
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

  const TABS: { key: Tab; label: React.ReactNode }[] = [
    { key: 'resumen',     label: <><BarChart2 size={13} /> Resumen</> },
    { key: 'tareas',      label: <><ClipboardList size={13} /> Tareas ({tasks.length})</> },
    { key: 'historial',   label: <><History size={13} /> Historial</> },
    { key: 'pokemon',     label: <><PokeballIcon size={13} /> Pokémon ({pokemonData?.collection.length ?? 0})</> },
    { key: 'solicitudes', label: <><Gift size={13} /> Solicitudes ({childRequests.length})</> },
  ];

  const statusVariant = (s: string): BadgeVariant =>
    s === 'Approved' ? 'success' : s === 'Pending' ? 'warning' : 'danger';

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <Link to="/admin/children" className="text-body no-underline text-[0.9rem] mr-2" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><ChevronLeft size={15} /> Volver</Link>
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
      <div role="tablist" style={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            aria-controls={`tab-panel-${t.key}`}
            id={`tab-${t.key}`}
            style={{ ...styles.tab, color: tab === t.key ? c.primary : c.body, borderBottom: tab === t.key ? `2px solid ${c.primary}` : '2px solid transparent' }}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Resumen tab */}
      {tab === 'resumen' && (
        <div role="tabpanel" id="tab-panel-resumen" aria-labelledby="tab-resumen" style={styles.summaryGrid}>
          <div style={styles.statCard}><p style={styles.statLabel}>Monedas</p><p style={{ ...styles.statValue, display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CoinIcon size={20} /> {child.coins}</p></div>
          <div style={styles.statCard}><p style={styles.statLabel}>XP total</p><p style={{ ...styles.statValue, display: 'flex', alignItems: 'center', gap: '0.35rem' }}><XpIcon size={20} /> {child.xp}</p></div>
          <div style={styles.statCard}><p style={styles.statLabel}>Pokémon</p><p style={styles.statValue}>{pokemonData?.collection.length ?? 0} / {1 + Math.floor(child.xp / 5000)}</p></div>
          <div style={styles.statCard}><p style={styles.statLabel}>En revisión</p><p style={styles.statValue}>{child.pendingReviewCount}</p></div>

          {child.activePokemon && (
            <div style={{ ...styles.statCard, flexDirection: 'row', gap: '1rem', gridColumn: '1/-1', alignItems: 'center' }}>
              <img src={SPRITE_STATIC_URL(child.activePokemon.pokedexNumber)} alt={child.activePokemon.name} width={64} height={64} style={{  }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={styles.statLabel}>Pokémon activo</p>
                <p style={{ ...styles.statValue, fontSize: '1.25rem' }}>{child.activePokemon.name}</p>
                <p className="text-body m-0 text-[0.85rem]" style={{ marginBottom: '0.4rem' }}>Nivel {child.activePokemon.level}</p>
                {pokemonData?.active && (
                  <div>
                    <div style={{ height: 6, borderRadius: 3, background: c.stroke, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pokemonData.active.progressPercent}%`, background: c.primary, borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: c.caption }}>
                      {pokemonData.active.pokemonXp} / {pokemonData.active.pokemonXp + pokemonData.active.xpForNextLevel} XP
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tareas tab */}
      {tab === 'tareas' && (
        <div role="tabpanel" id="tab-panel-tareas" aria-labelledby="tab-tareas" className="flex flex-col gap-2">
          {tasks.length === 0 && <p className="text-caption py-4">Sin tareas asignadas.</p>}
          {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      )}

      {/* Historial tab */}
      {tab === 'historial' && (
        <div role="tabpanel" id="tab-panel-historial" aria-labelledby="tab-historial">
          <HistoryList childId={childId} />
        </div>
      )}

      {/* Pokémon tab */}
      {tab === 'pokemon' && (
        <div role="tabpanel" id="tab-panel-pokemon" aria-labelledby="tab-pokemon" style={styles.pokeGrid}>
          {(pokemonData?.collection.length ?? 0) === 0 && (
            <p className="text-caption py-4">No ha elegido su Pokémon inicial todavía.</p>
          )}
          {pokemonData?.collection.map((item) => (
            <PokemonCard
              key={item.id}
              pokedexNumber={item.pokemon.pokedexNumber}
              name={item.pokemon.name}
              type1={item.pokemon.type1}
              type2={item.pokemon.type2}
              isActive={item.isActive}
              infoSlot={<>Nv. {item.level}</>}
              actionSlot={item.isActive ? <span style={styles.activeBadge}><Check size={11} /> Activo</span> : undefined}
            />
          ))}
        </div>
      )}

      {/* Solicitudes tab */}
      {tab === 'solicitudes' && (
        <div role="tabpanel" id="tab-panel-solicitudes" aria-labelledby="tab-solicitudes" style={{ background: c.surface, borderRadius: 10, boxShadow: c.shadowSm, overflow: 'hidden' }}>
          {childRequests.length === 0 && <p className="text-caption" style={{ padding: '1rem' }}>Sin solicitudes de recompensa.</p>}
          {childRequests.map((rr) => (
            <div key={rr.id} style={{ ...styles.reqRow, borderBottom: `1px solid ${c.subtle}` }}>
              <span>{rr.reward?.name ?? `Recompensa #${rr.rewardId}`}</span>
              <span className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CoinIcon size={13} /> {rr.coinsReserved}</span>
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
  page:        { padding: '1.5rem', maxWidth: 1200, margin: '0 auto' },
  header:      { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  avatar:      { width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.surface, fontWeight: 800, fontSize: '1.4rem', flexShrink: 0 },
  name:        { margin: 0, fontSize: '1.5rem', fontWeight: 800 },
  tabs:        { display: 'flex', flexWrap: 'wrap', borderBottom: `2px solid ${c.stroke}`, marginBottom: '1.5rem' },
  tab:         { padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', background: 'transparent', marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '0.35rem' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' },
  statCard:    { background: c.surface, borderRadius: 10, padding: '1rem 1.25rem', boxShadow: c.shadowMd, display: 'flex', flexDirection: 'column' },
  statLabel:   { margin: '0 0 0.25rem', fontSize: '0.78rem', color: c.body, fontWeight: 600 },
  statValue:   { margin: 0, fontSize: '1.6rem', fontWeight: 800 },
  pokeGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' },
  activeBadge: { fontSize: '0.72rem', color: c.primary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' },
  reqRow:      { display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.65rem 1rem' },
};
