import { c } from '../../../styles/tokens';

const TYPE_COLORS: Record<string, string> = {
  Fuego: '#ff6b35', Agua: '#4ea8de', Planta: '#56ab2f', Eléctrico: '#f7d716',
  Psíquico: '#d64de1', Hielo: '#74d7ec', Dragón: '#6e5fa6', Veneno: '#9b59b6',
  Normal: '#a8a878', Volador: '#87ceeb', Hada: '#ffb6c1', Lucha: '#c03028',
};

export default function TypeBadge({ type }: { type: string }) {
  const bg = TYPE_COLORS[type] ?? c.caption;
  return (
    <span style={{
      background: bg, color: c.surface, fontSize: '0.7rem', fontWeight: 700,
      padding: '2px 8px', borderRadius: 10, display: 'inline-block',
    }}>
      {type}
    </span>
  );
}
