import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';
import { FormInput } from '../../../shared/components/FormInput';

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
    <div className="min-h-screen flex items-center justify-center bg-night p-4">
      <div className="bg-surface rounded-xl p-8 w-full max-w-[400px]"
        style={{ boxShadow: c.shadowLg }}>
        <h1 className="m-0 text-[2rem] font-extrabold text-night text-center">FamilyDex</h1>
        <p className="mt-1 mb-6 text-body text-center text-[0.9rem]">Gestión familiar de tareas</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormInput
            label="Email / Usuario"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email o nombre de usuario"
            required
            autoFocus
          />

          <FormInput
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />

          {login.isError && <p className="text-danger text-[0.85rem] m-0">{errorMessage}</p>}

          <Button type="submit" disabled={login.isPending} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', borderRadius: 6, marginTop: '0.5rem' }}>
            {login.isPending ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        {/* Acceso demo ─────────────────────────────────────────────────── */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-subtle text-body text-[0.75rem] font-bold py-[2px] px-[10px] rounded-[10px] whitespace-nowrap border border-stroke"
              style={{ boxShadow: '0 0 0 1px #e2e8f0' }}>
              Acceso demo
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.identifier}
                className="py-[0.45rem] px-4 rounded-lg text-[0.85rem] font-semibold cursor-pointer text-left border-2"
                style={{ background: 'transparent', color: acc.color, borderColor: acc.color, opacity: login.isPending ? 0.5 : 1 }}
                disabled={login.isPending}
                onClick={() => handleDemo(acc)}
              >
                {acc.label}
              </button>
            ))}
          </div>
          <p className="text-[0.75rem] text-caption mt-[0.6rem] mb-0 text-center">
            Un clic carga una cuenta con datos de ejemplo ya cargados.
          </p>
        </div>

        <p className="text-center mt-4 text-[0.85rem] text-body">
          ¿Primera vez? <Link to="/register">Crear cuenta de administrador</Link>
        </p>
      </div>
    </div>
  );
}
