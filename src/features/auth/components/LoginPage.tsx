import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';
import { FormInput } from '../../../shared/components/FormInput';

const DEMO_ACCOUNTS = [
  { label: '👨‍👩‍👧‍👦 Padre (admin)',     identifier: 'padre@demo.com', password: 'Demo1234',  color: c.primaryDark },
  { label: '🎮 Lucas (8 años)',        identifier: 'lucas',          password: 'lucas123',  color: c.primary },
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-night p-4">

      {/* Logo — fuera de la card, sobre fondo oscuro */}
      <div className="text-center mb-6">
        <h1 className="m-0 text-[2.4rem] font-extrabold text-white tracking-tight">
          FamilyDex ⚡
        </h1>
        <p className="mt-1 mb-0 text-slate-400 text-[0.875rem]">
          Gestión familiar con temática Pokémon
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

        {/* Separador */}
        <div className="flex items-center gap-3 my-5">
          <hr className="flex-1 border-0 border-t border-stroke m-0" />
          <span className="text-caption text-[0.72rem] font-bold bg-subtle px-[0.6rem] py-[2px] rounded-full border border-stroke whitespace-nowrap">
            Acceso demo
          </span>
          <hr className="flex-1 border-0 border-t border-stroke m-0" />
        </div>

        {/* Botones demo debajo del formulario */}
        <div className="flex flex-col gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.identifier}
              className="py-[0.45rem] px-4 rounded-lg text-[0.85rem] font-semibold cursor-pointer text-left border-2 transition-opacity duration-150"
              style={{ background: 'transparent', color: acc.color, borderColor: acc.color, opacity: login.isPending ? 0.5 : 1 }}
              disabled={login.isPending}
              aria-disabled={login.isPending}
              onClick={() => handleDemo(acc)}
            >
              {acc.label}
            </button>
          ))}
        </div>
        <p className="text-[0.75rem] text-caption mt-[0.6rem] mb-0 text-center">
          Un clic carga una cuenta con datos de ejemplo ya cargados.
        </p>

        <p className="text-center mt-4 text-[0.85rem] text-body">
          ¿Primera vez? <Link to="/register">Crear cuenta de administrador</Link>
        </p>
      </div>
    </div>
  );
}
