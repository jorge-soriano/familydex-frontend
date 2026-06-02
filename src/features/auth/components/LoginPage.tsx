import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';

const DEMO_ACCOUNTS = [
  { label: '👨‍👩‍👧‍👦 Padre (admin)',     identifier: 'padre@demo.com', password: 'Demo1234',  color: '#1e3a5f' },
  { label: '🎮 Lucas (8 años)',        identifier: 'lucas',          password: 'lucas123',  color: '#3b82f6' },
  { label: '🌸 Sofía (5 años)',        identifier: 'sofia',          password: 'sofia123',  color: '#ec4899' },
];

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ identifier, password });
  };

  const handleDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    login.mutate({ identifier: acc.identifier, password: acc.password });
  };

  const errorMessage =
    (login.error as any)?.response?.data?.message ?? 'Error al iniciar sesión';

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>FamilyDex</h1>
        <p style={styles.subtitle}>Gamificación familiar Pokémon</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email / Usuario
            <input
              style={styles.input}
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email o nombre de usuario"
              required
              autoFocus
            />
          </label>

          <label style={styles.label}>
            Contraseña
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
          </label>

          {login.isError && <p style={styles.error}>{errorMessage}</p>}

          <button style={styles.button} type="submit" disabled={login.isPending}>
            {login.isPending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        {/* Acceso demo ─────────────────────────────────────────────────── */}
        <div style={styles.demoSection}>
          <div style={styles.divider}>
            <span style={styles.dividerText}>Acceso demo</span>
          </div>
          <div style={styles.demoGrid}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.identifier}
                style={{ ...styles.demoBtn, background: acc.color }}
                disabled={login.isPending}
                onClick={() => handleDemo(acc)}
              >
                {acc.label}
              </button>
            ))}
          </div>
          <p style={styles.demoHint}>
            Un clic carga una cuenta con datos de ejemplo ya cargados.
          </p>
        </div>

        <p style={styles.registerLink}>
          ¿Primera vez? <Link to="/register">Crear cuenta de administrador</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#1a1a2e',
  },
  card: {
    background: '#fff', borderRadius: 12, padding: '2.5rem',
    width: '100%', maxWidth: 400,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  title: { margin: 0, fontSize: '2rem', fontWeight: 800, color: '#1a1a2e', textAlign: 'center' },
  subtitle: { margin: '0.25rem 0 1.5rem', color: '#666', textAlign: 'center', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' },
  input: { padding: '0.6rem 0.8rem', borderRadius: 6, border: '2px solid #ddd', fontSize: '1rem', outline: 'none' },
  button: {
    padding: '0.75rem', background: '#e53935', color: '#fff', border: 'none',
    borderRadius: 6, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem',
  },
  error: { color: '#e53935', fontSize: '0.85rem', margin: 0 },

  // Demo section
  demoSection: { marginTop: '1.5rem' },
  divider: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  dividerText: {
    background: '#f1f5f9', color: '#64748b', fontSize: '0.75rem',
    fontWeight: 700, padding: '2px 10px', borderRadius: 10,
    whiteSpace: 'nowrap',
    boxShadow: '0 0 0 1px #e2e8f0',
  },
  demoGrid: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  demoBtn: {
    padding: '0.6rem 1rem', color: '#fff', border: 'none',
    borderRadius: 8, fontSize: '0.9rem', fontWeight: 700,
    cursor: 'pointer', textAlign: 'left',
  },
  demoHint: { fontSize: '0.75rem', color: '#94a3b8', margin: '0.6rem 0 0', textAlign: 'center' },

  registerLink: { textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#666' },
};
