import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';
import { c } from '../../../styles/tokens';
import { Button } from '../../../shared/components/Button';
import { FormInput } from '../../../shared/components/FormInput';
import AuthNav from './AuthNav';

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
    <div className="min-h-screen flex flex-col bg-night">
      <AuthNav variant="register" />

      <div className="flex flex-col items-center p-4 pt-16 pb-16">

        {/* Card */}
        <div className="bg-surface rounded-xl p-8 w-full max-w-[400px]"
          style={{ boxShadow: c.shadowFloat }}>

          <h2 className="m-0 mb-6 text-[1.35rem] font-extrabold text-heading">
            Crear cuenta
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />

            <FormInput
              label="Nombre de usuario"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="admin"
              autoComplete="username"
              spellCheck={false}
              required
            />

            <FormInput
              label="Contraseña"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
              autoComplete="new-password"
              required
            />

            <FormInput
              label="Confirmar contraseña"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder=""
              autoComplete="new-password"
              required
            />

            {register.isError && (
              <p aria-live="polite" role="alert" className="text-danger text-[0.85rem] m-0">
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              disabled={register.isPending}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', borderRadius: 6, marginTop: '0.25rem' }}>
              {register.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="text-center mt-4 mb-0 text-[0.85rem] text-body">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: c.primary, fontWeight: 600 }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
