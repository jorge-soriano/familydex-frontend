import { NavLink } from 'react-router-dom';
import { c } from '../../styles/tokens';

interface NavItem {
  to: string;
  icon: React.ReactNode;
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
      height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      background: c.navy,
      display: 'flex',
      zIndex: 50,
      borderTop: `1px solid ${c.navBorder}`,
    }}>
      {items.map(({ to, icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          aria-label={badge ? `${label} (${badge} pendientes)` : label}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            textDecoration: 'none',
            color: isActive ? c.surface : c.navTextInactive,
            fontSize: '0.62rem',
            fontWeight: 700,
            position: 'relative',
            borderTop: isActive ? `2px solid ${c.primaryMid}` : '2px solid transparent',
            background: isActive ? c.navActiveTabBg : 'transparent',
            paddingTop: 2,
          })}
        >
          <span aria-hidden="true" style={{ lineHeight: 1, display: 'flex' }}>{icon}</span>
          <span aria-hidden="true">{label}</span>
          {badge != null && badge > 0 && (
            <span aria-hidden="true" style={{
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
