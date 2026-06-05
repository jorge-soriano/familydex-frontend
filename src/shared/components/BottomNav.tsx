import { NavLink } from 'react-router-dom';
import { c } from '../../styles/tokens';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  badge?: number;
}

interface BottomNavProps {
  items: NavItem[];
}

export default function BottomNav({ items }: BottomNavProps) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      background: c.navy,
      display: 'flex',
      zIndex: 50,
      borderTop: `1px solid rgba(255,255,255,0.08)`,
    }}>
      {items.map(({ to, icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            textDecoration: 'none',
            color: isActive ? c.surface : 'rgba(255,255,255,0.5)',
            fontSize: '0.62rem',
            fontWeight: 700,
            position: 'relative',
            borderTop: isActive ? `2px solid ${c.primary}` : '2px solid transparent',
            paddingTop: 2,
          })}
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{icon}</span>
          <span>{label}</span>
          {badge != null && badge > 0 && (
            <span style={{
              position: 'absolute',
              top: 6,
              right: '50%',
              transform: 'translateX(8px)',
              background: c.danger,
              color: c.surface,
              fontSize: '0.6rem',
              fontWeight: 800,
              padding: '1px 4px',
              borderRadius: 8,
              lineHeight: 1.4,
            }}>
              {badge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
