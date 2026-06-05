import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';
import { c } from '../../../styles/tokens';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const register = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(form);
  };

  const errorMessage =
    (register.error as any)?.response?.data?.message ?? 'Error al registrarse';

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>FamilyDex</h1>
        <h2 style={styles.subtitle}>Crear cuenta de administrador</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {([
            { name: 'email',           label: 'Email',              type: 'email',    placeholder: 'tu@email.com' },
            { name: 'username',        label: 'Nombre de usuario',  type: 'text',     placeholder: 'admin' },
            { name: 'password',        label: 'Contraseña',         type: 'password', placeholder: 'Mín. 8 chars, 1 mayúscula, 1 número' },
            { name: 'confirmPassword', label: 'Confirmar contraseña', type: 'password', placeholder: '' },
          ] as const).map(({ name, label, type, placeholder }) => (
            <label key={name} style={styles.label}>
              {label}
              <input
                style={styles.input}
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required
              />
            </label>
          ))}

          {register.isError && <p style={styles.error}>{errorMessage}</p>}

          <button style={styles.button} type="submit" disabled={register.isPending}>
            {register.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p style={styles.loginLink}>
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: c.night,
    padding: '1rem',
  },
  card: {
    background: c.surface,
    borderRadius: 12,
    padding: '2.5rem',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  title: { margin: 0, fontSize: '1.75rem', fontWeight: 800, color: c.night, textAlign: 'center' },
  subtitle: { margin: '0.25rem 0 1.5rem', color: c.body, textAlign: 'center', fontSize: '1rem', fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' },
  input: { padding: '0.6rem 0.8rem', borderRadius: 6, border: `2px solid ${c.stroke}`, fontSize: '1rem' },
  button: {
    padding: '0.75rem',
    background: c.danger,
    color: c.surface,
    border: 'none',
    borderRadius: 6,
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  error: { color: c.danger, fontSize: '0.85rem', margin: 0 },
  loginLink: { textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: c.body },
};
