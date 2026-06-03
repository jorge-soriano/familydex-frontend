interface Props {
  displayName: string;
  avatarColor?: string | null;
  size?: number;
}

/**
 * Avatar circular con la inicial del niño sobre su color de perfil.
 * Se usa en tablas, listas y selectores en vez del nombre en texto plano.
 * El `title` muestra el nombre completo al hacer hover.
 */
export default function ChildAvatar({ displayName, avatarColor, size = 28 }: Props) {
  return (
    <div
      title={displayName}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: avatarColor ?? '#6366f1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: Math.round(size * 0.43) + 'px',
        flexShrink: 0,
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
}
