import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminChildren, useToggleChildStatus } from '../hooks/useAdmin';
import EditChildModal from './EditChildModal';
import CreateChildModal from './CreateChildModal';
import { SPRITE_STATIC_URL } from '../../pokemon/api';
import { useWindowWidth } from '../../../shared/hooks/useWindowWidth';
import type { ChildSummary } from '../api';
import { c } from '../../../styles/tokens';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';

export default function ChildrenList() {
  const { data: children = [], isLoading } = useAdminChildren();
  const toggle = useToggleChildStatus();
  const [editing, setEditing] = useState<ChildSummary | null>(null);
  const [creating, setCreating] = useState(false);
  const isNarrow = useWindowWidth() < 700;

  if (isLoading) return <p className="p-8">Cargando…</p>;

  const TH = (label: string, align: 'left' | 'center' | 'right' = 'left', w?: string) => (
    <th style={{ padding: '0.6rem 0.75rem', textAlign: align, width: w, fontSize: '0.72rem', fontWeight: 700, color: c.body, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `2px solid ${c.stroke}`, background: c.page, whiteSpace: 'nowrap' }}>
      {label}
    </th>
  );

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Gestión de hijos</h2>

      {/* Toolbar — mismo nivel que los filtros en TaskPanel */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button onClick={() => setCreating(true)}>+ Nuevo hijo</Button>
      </div>

      {/* Wide: tabla real */}
      {!isNarrow && (
        <div style={{ overflowX: 'auto', background: c.surface, borderRadius: 10, boxShadow: c.shadowSm }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
            <thead>
              <tr>
                {TH('Nombre')}
                {TH('Usuario', 'left', '110px')}
                {TH('🪙', 'center', '70px')}
                {TH('⭐ XP', 'center', '80px')}
                {TH('Pokémon', 'left')}
                {TH('Estado', 'center', '90px')}
                {TH('Acciones', 'right', '150px')}
              </tr>
            </thead>
            <tbody>
              {children.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: c.caption }}>No hay hijos registrados.</td></tr>
              )}
              {children.map((child) => (
                <tr key={child.id} style={{ borderBottom: `1px solid ${c.subtle}`, opacity: child.isActive ? 1 : 0.55, background: c.surface }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <Link to={`/admin/children/${child.id}`} style={styles.nameCell}>
                      <div style={{ ...styles.avatar, background: child.avatarColor ?? c.accent }}>
                        {child.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{child.displayName}</span>
                    </Link>
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', color: c.body }}>@{child.username}</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontSize: '0.875rem' }}>{child.coins}</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontSize: '0.875rem' }}>{child.xp}</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <div style={styles.pokemon}>
                      {child.activePokemon ? (
                        <>
                          <img src={SPRITE_STATIC_URL(child.activePokemon.pokedexNumber)} alt={child.activePokemon.name} width={32} height={32} style={{ imageRendering: 'pixelated' }} />
                          <span style={{ fontSize: '0.8rem' }}>{child.activePokemon.name} Nv.{child.activePokemon.level}</span>
                        </>
                      ) : <span style={{ color: c.caption }}>—</span>}
                    </div>
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                    <Badge variant={child.isActive ? 'success' : 'neutral'} subtle>
                      {child.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button style={styles.editBtn} onClick={() => setEditing(child)}>Editar</button>
                      <button
                        style={{ ...styles.toggleBtn, color: child.isActive ? c.danger : c.primary }}
                        disabled={toggle.isPending}
                        onClick={() => toggle.mutate({ id: child.id, isActive: !child.isActive })}
                      >
                        {child.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Narrow: tarjetas */}
      {isNarrow && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {children.length === 0 && <p className="text-caption">No hay hijos registrados.</p>}
          {children.map((child) => (
            <div key={child.id} style={{ background: c.surface, borderRadius: 8, padding: '0.75rem', boxShadow: c.shadowSm, opacity: child.isActive ? 1 : 0.55 }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ ...styles.avatar, background: child.avatarColor ?? c.accent }}>
                  {child.displayName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/admin/children/${child.id}`} style={{ fontWeight: 700, textDecoration: 'none', color: c.heading, display: 'block' }}>
                    {child.displayName}
                  </Link>
                  <div style={{ fontSize: '0.8rem', color: c.body }}>@{child.username} · 🪙{child.coins} · ⭐{child.xp}</div>
                </div>
                <Badge variant={child.isActive ? 'success' : 'neutral'} subtle>
                  {child.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              {child.activePokemon && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: c.body, marginBottom: '0.4rem' }}>
                  <img src={SPRITE_STATIC_URL(child.activePokemon.pokedexNumber)} alt={child.activePokemon.name} width={26} height={26} style={{ imageRendering: 'pixelated' }} />
                  <span>{child.activePokemon.name} Nv.{child.activePokemon.level}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
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
      )}

      {editing  && <EditChildModal   child={editing} onClose={() => setEditing(null)} />}
      {creating && <CreateChildModal onClose={() => setCreating(false)} />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:     { padding: '1.5rem', maxWidth: 1200, margin: '0 auto' },
  h2:       { fontSize: '1.5rem', fontWeight: 800, margin: '0 0 1.25rem' },
  nameCell: { display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' },
  avatar:   { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.surface, fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 },
  pokemon:  { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  editBtn:  { padding: '0.35rem 0.75rem', background: c.subtle, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 },
  toggleBtn:{ padding: '0.35rem 0.75rem', background: 'transparent', border: '1px solid currentColor', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 },
};
