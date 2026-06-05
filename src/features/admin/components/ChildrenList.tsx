import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminChildren, useToggleChildStatus } from '../hooks/useAdmin';
import EditChildModal from './EditChildModal';
import CreateChildModal from './CreateChildModal';
import { SPRITE_STATIC_URL } from '../../pokemon/api';
import type { ChildSummary } from '../api';
import { c } from '../../../styles/tokens';
import { Badge } from '../../../shared/components/Badge';

export default function ChildrenList() {
  const { data: children = [], isLoading } = useAdminChildren();
  const toggle = useToggleChildStatus();
  const [editing, setEditing] = useState<ChildSummary | null>(null);
  const [creating, setCreating] = useState(false);

  if (isLoading) return <p className="p-8">Cargando…</p>;

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <h2 style={styles.h2}>Gestión de hijos</h2>
        <button style={styles.newBtn} onClick={() => setCreating(true)}>
          + Nuevo hijo
        </button>
      </div>

      <div style={{ overflowX: 'auto', background: c.surface, borderRadius: 10, boxShadow: c.shadowSm }}>
        <div style={{ ...styles.table, minWidth: 640 }}>
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
            <p className="text-caption" style={{ padding: '1rem 0' }}>No hay hijos registrados.</p>
          )}

          {children.map((child) => (
            <div key={child.id} style={{ ...styles.row, opacity: child.isActive ? 1 : 0.55 }}>
              <Link to={`/admin/children/${child.id}`} style={styles.nameCell}>
                <div style={{ ...styles.avatar, background: child.avatarColor ?? c.accent }}>
                  {child.displayName.charAt(0).toUpperCase()}
                </div>
                <span>{child.displayName}</span>
              </Link>

              <span className="text-body" style={{ fontSize: '0.85rem' }}>@{child.username}</span>
              <span>{child.coins}</span>
              <span>{child.xp}</span>

              <span style={styles.pokemon}>
                {child.activePokemon ? (
                  <>
                    <img src={SPRITE_STATIC_URL(child.activePokemon.pokedexNumber)} alt={child.activePokemon.name} width={32} height={32} style={{ imageRendering: 'pixelated' }} />
                    <span style={{ fontSize: '0.8rem' }}>{child.activePokemon.name} Nv.{child.activePokemon.level}</span>
                  </>
                ) : '—'}
              </span>

              <Badge variant={child.isActive ? 'success' : 'neutral'} subtle>
                {child.isActive ? 'Activo' : 'Inactivo'}
              </Badge>

              <div style={styles.actions}>
                <button style={styles.editBtn} onClick={() => setEditing(child)}>Editar</button>
                <button
                  style={{ ...styles.toggleBtn, color: child.isActive ? c.danger : c.primary }}
                  disabled={toggle.isPending}
                  onClick={() => toggle.mutate({ id: child.id, isActive: !child.isActive })}
                >
                  {child.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing  && <EditChildModal   child={editing} onClose={() => setEditing(null)} />}
      {creating && <CreateChildModal onClose={() => setCreating(false)} />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:     { padding: '1.5rem', maxWidth: 1000, margin: '0 auto' },
  topbar:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  h2:       { fontSize: '1.5rem', fontWeight: 800, margin: 0 },
  newBtn:   { padding: '0.5rem 1.25rem', background: c.primary, color: c.surface, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  table:    { display: 'flex', flexDirection: 'column' },
  row:      { display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.7fr 0.8fr 1.8fr 0.8fr 1.5fr', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', borderBottom: `1px solid ${c.subtle}` },
  header:   { background: c.page, fontWeight: 700, fontSize: '0.85rem', color: c.body, borderBottom: `2px solid ${c.stroke}` },
  nameCell: { display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', fontWeight: 600 },
  avatar:   { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.surface, fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 },
  pokemon:  { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  actions:  { display: 'flex', gap: '0.4rem' },
  editBtn:  { padding: '0.35rem 0.75rem', background: c.subtle, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 },
  toggleBtn:{ padding: '0.35rem 0.75rem', background: 'transparent', border: '1px solid currentColor', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 },
};
