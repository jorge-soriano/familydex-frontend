import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';
import { FormInput } from '../../../shared/components/FormInput';
import AuthNav from './AuthNav';

const DEMO_ACCOUNTS = [
  { name: 'Padre',  role: 'Admin',    identifier: 'padre@demo.com', password: 'Demo1234', color: c.primary,    borderColor: c.primaryLight, emoji: '👨‍👩‍👧‍👦' },
  { name: 'Lucas',  role: 'Niño',     identifier: 'lucas',          password: 'lucas123',  color: '#10b981',    borderColor: '#6ee7b7',      emoji: '🎮' },
  { name: 'Sofía',  role: 'Niña',     identifier: 'sofia',          password: 'sofia123',  color: '#ec4899',    borderColor: '#f9a8d4',      emoji: '🌸' },
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
    <div className="min-h-screen flex flex-col bg-night">
      <AuthNav variant="login" />

      <div className="flex flex-col items-center p-4 pt-16 pb-16">

        {/* Card */}
        <div className="bg-surface rounded-xl p-8 w-full max-w-[400px]"
          style={{ boxShadow: c.shadowFloat }}>

          <h2 className="m-0 mb-6 text-[1.35rem] font-extrabold text-heading">
            Inicia sesión
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormInput
              label="Email / Usuario"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email o nombre de usuario"
              autoComplete="username"
              spellCheck={false}
              required
            />

            <FormInput
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoComplete="current-password"
              required
            />

            {login.isError && (
              <p aria-live="polite" role="alert" className="text-danger text-[0.85rem] m-0">
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              disabled={login.isPending}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', borderRadius: 6, marginTop: '0.25rem' }}>
              {login.isPending ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center mt-4 mb-0 text-[0.85rem] text-body">
            ¿Primera vez?{' '}
            <Link to="/register" style={{ color: c.primary, fontWeight: 600 }}>
              Crear cuenta de administrador
            </Link>
          </p>

          {/* Separador */}
          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-0 border-t border-stroke m-0" />
            <span className="text-caption text-[0.72rem] font-bold bg-subtle px-[0.6rem] py-[2px] rounded-full border border-stroke whitespace-nowrap">
              Acceso demo
            </span>
            <hr className="flex-1 border-0 border-t border-stroke m-0" />
          </div>

          {/* Botones demo */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.identifier}
                disabled={login.isPending}
                onClick={() => handleDemo(acc)}
                style={{
                  background: 'transparent',
                  border: `2px solid ${acc.borderColor}`,
                  borderRadius: 12,
                  cursor: login.isPending ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.75rem 1rem',
                  minWidth: 100, flex: '0 1 auto',
                  opacity: login.isPending ? 0.5 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{acc.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: acc.color }}>{acc.name}</span>
                <span style={{ fontSize: '0.72rem', color: c.caption }}>{acc.role}</span>
              </button>
            ))}
          </div>

          <p className="text-[0.75rem] text-caption mt-[0.6rem] mb-0 text-center">
            Un clic carga una cuenta con datos de ejemplo ya cargados.
          </p>
        </div>
      </div>
    </div>
  );
}
