import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';
import { FormInput } from '../../../shared/components/FormInput';

const DEMO_ACCOUNTS = [
  { name: 'Padre',  role: 'Administrador',    identifier: 'padre@demo.com', password: 'Demo1234', color: c.primaryDark, emoji: '👨‍👩‍👧‍👦' },
  { name: 'Lucas',  role: '8 años · Hijo',     identifier: 'lucas',          password: 'lucas123',  color: c.primary,    emoji: '🎮' },
  { name: 'Sofía',  role: '5 años · Hija',     identifier: 'sofia',          password: 'sofia123',  color: '#ec4899',    emoji: '🌸' },
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-night p-4">

      {/* Logo — fuera de la card, sobre fondo oscuro */}
      <div className="text-center mb-6">
        <h1 className="m-0 text-[2.4rem] font-extrabold text-white tracking-tight">
          FamilyDex
        </h1>
        <p className="mt-1 mb-0 text-slate-400 text-[0.875rem]">
          Gestión familiar de tareas
        </p>
      </div>

      {/* Card */}
      <div className="bg-surface rounded-xl p-8 w-full max-w-[400px]"
        style={{ boxShadow: c.shadowFloat }}>

        {/* Formulario siempre visible */}
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

        {/* Enlace de registro — antes del separador */}
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

        {/* Botones demo estilo tarjeta de perfil */}
        <div className="flex flex-col gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.identifier}
              disabled={login.isPending}
              onClick={() => handleDemo(acc)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.75rem', borderRadius: 10, width: '100%',
                background: c.subtle, border: `1.5px solid ${c.stroke}`,
                cursor: login.isPending ? 'not-allowed' : 'pointer',
                opacity: login.isPending ? 0.5 : 1,
                transition: 'background 0.15s',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                background: acc.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.15rem',
              }}>
                {acc.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: c.heading }}>
                  {acc.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: c.caption }}>
                  {acc.role}
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-[0.75rem] text-caption mt-[0.6rem] mb-0 text-center">
          Un clic carga una cuenta con datos de ejemplo ya cargados.
        </p>
      </div>
    </div>
  );
}
