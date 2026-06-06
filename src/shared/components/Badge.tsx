import { c } from '../../styles/tokens';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface BadgeProps {
  variant: BadgeVariant;
  subtle?: boolean;
  children: React.ReactNode;
}

const SOLID: Record<BadgeVariant, { background: string; color: string }> = {
  success: { background: c.success,     color: c.surface    },
  warning: { background: c.warning,     color: c.warningDeep }, // #78350f sobre #f59e0b ≈ 9:1
  danger:  { background: c.danger,      color: c.surface    },
  neutral: { background: c.caption,     color: c.surface    },
  info:    { background: c.primary,     color: c.surface    },
};

const SUBTLE: Record<BadgeVariant, { background: string; color: string }> = {
  success: { background: c.successSubtle, color: c.successDark },
  warning: { background: c.warningSubtle, color: c.warningDark },
  danger:  { background: c.dangerSubtle,  color: c.dangerDark  },
  neutral: { background: c.subtle,        color: c.heading     }, // heading sobre subtle ≈ 10:1
  info:    { background: c.primarySubtle, color: c.primaryDark },
};

export function Badge({ variant, subtle = false, children }: BadgeProps) {
  const colors = subtle ? SUBTLE[variant] : SOLID[variant];
  return (
    <span style={{
      ...colors,
      fontSize: '0.7rem',
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 10,
      display: 'inline-flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}
