import { c } from '../../styles/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: c.primary,  color: c.surface, border: 'none' },
  secondary: { background: c.subtle,   color: c.heading, border: 'none' },
  danger:    { background: c.danger,   color: c.surface, border: 'none' },
  success:   { background: c.success,  color: c.surface, border: 'none' },
  ghost:     { background: 'transparent', color: c.body, border: `1px solid ${c.stroke}` },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '0.35rem 0.75rem', fontSize: '0.8rem',   borderRadius: 6 },
  md: { padding: '0.5rem 1.25rem',  fontSize: '0.875rem', borderRadius: 8 },
};

export function Button({ variant = 'primary', size = 'md', children, style, disabled, className, ...props }: ButtonProps) {
  const hoverCls = !disabled
    ? variant === 'ghost' ? 'hover:bg-subtle' : 'hover:brightness-90'
    : '';
  const activeCls = !disabled ? 'active:scale-[0.97]' : '';
  const finalCls = ['transition-[filter,transform,background-color] duration-150', hoverCls, activeCls, className]
    .filter(Boolean).join(' ');

  return (
    <button
      disabled={disabled}
      className={finalCls}
      style={{
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
