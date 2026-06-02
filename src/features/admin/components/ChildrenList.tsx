import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminChildren, useToggleChildStatus } from '../hooks/useAdmin';
import EditChildModal from './EditChildModal';
import CreateChildModal from './CreateChildModal';
import { SPRITE_STATIC_URL } from '../../pokemon/api';
import type { ChildSummary } from '../api';

export default function ChildrenList() {
  const { data: children = [], isLoading } = useAdminChildren();
  const toggle = useToggleChildStatus();
  const [editing, setEditing] = useState<ChildSummary | null>(null);
  const [creating, setCreating] = useState(false);

  if (isLoading) return <p style={{ padding: '2rem' }}>Cargando…</p>;

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <h2 style={styles.h2}>Gestión de hijos</h2>
        <button style={styles.newBtn} onClick={() => setCreating(true)}>
          + Nuevo hijo
        </button>
      </div>

      <div style={styles.table}>
        <div style={{ ...styles.row, ...styles.header }}>
          <span>Nombre</span>
          <span>Usuario</span>
          <span>🪙</span>
          <span>⭐ XP</span>
          <span>Pokémon</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {children.length === 0 && (
          <p style={styles.empty}>No hay hijos registrados.</p>
        )}

        {children.map((child) => (
          <div key={child.id} style={{ ...styles.row, opacity: child.isActive ? 1 : 0.55 }}>
            <Link to={`/admin/children/${child.id}`} style={styles.nameCell}>
              <div style={{ ...styles.avatar, background: child.avatarColor ?? '#6366f1' }}>
                {child.displayName.charAt(0).toUpperCase()}
              </div>
              <span>{child.displayName}</span>
            </Link>

            <span style={styles.username}>@{child.username}</span>
            <span>{child.coins}</span>
            <span>{child.xp}</span>

            <span style={styles.pokemon}>
              {child.activePokemon ? (
                <>
                  <img src={SPRITE_STATIC_URL(child.activePokemon.pokedexNumber)}
                    alt={child.activePokemon.name} width={32} height={32}
                    style={{ imageRendering: 'pixelated' }} />
                  <span style={{ fontSize: '0.8rem' }}>{child.activePokemon.name} Nv.{child.activePokemon.level}</span>
                </>
              ) : '—'}
            </span>

            <span style={{ color: child.isActive ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>
              {child.isActive ? 'Activo' : 'Inactivo'}
            </span>

            <div style={styles.actions}>
              <button style={styles.editBtn} onClick={() => setEditing(child)}>Editar</button>
              <button
                style={{ ...styles.toggleBtn, color: child.isActive ? '#ef4444' : '#22c55e' }}
                disabled={toggle.isPending}
                onClick={() => toggle.mutate({ id: child.id, isActive: !child.isActive })}
              >
                {child.isActive ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing  && <EditChildModal   child={editing} onClose={() => setEditing(null)} />}
      {creating && <CreateChildModal onClose={() => setCreating(false)} />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: 1000, margin: '0 auto' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  h2: { fontSize: '1.5rem', fontWeight: 800, margin: 0 },
  newBtn: { padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  table: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  row: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.2fr 0.7fr 0.8fr 1.8fr 0.8fr 1.5fr',
    alignItems: 'center', gap: '0.75rem',
    background: '#fff', borderRadius: 8, padding: '0.75rem 1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  header: { background: '#f8fafc', fontWeight: 700, fontSize: '0.85rem', color: '#475569', boxShadow: 'none' },
  nameCell: { display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', fontWeight: 600 },
  avatar: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 },
  username: { color: '#64748b', fontSize: '0.85rem' },
  pokemon: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  actions: { display: 'flex', gap: '0.4rem' },
  editBtn: { padding: '0.3rem 0.6rem', background: '#f1f5f9', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '0.78rem' },
  toggleBtn: { padding: '0.3rem 0.6rem', background: 'transparent', border: '1px solid currentColor', borderRadius: 5, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  empty: { color: '#94a3b8', padding: '1rem 0' },
};
