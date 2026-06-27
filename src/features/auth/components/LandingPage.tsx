import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { Button } from '../../../shared/components/Button';
import { c } from '../../../styles/tokens';
import './landing.css';

const SPRITE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;

const STARTERS = [
  { id: 1,  name: 'Bulbasaur',  glow: '#22c55e', float: 'poke-float-1' },
  { id: 4,  name: 'Charmander', glow: '#f97316', float: 'poke-float-2' },
  { id: 7,  name: 'Squirtle',   glow: '#3b82f6', float: 'poke-float-3' },
  { id: 25, name: 'Pikachu',    glow: '#eab308', float: 'poke-float-4' },
];

const STEPS = [
  {
    num: '01', icon: '📋',
    title: 'El padre crea las tareas',
    desc:  'Puntuales o recurrentes, con recompensa configurable en monedas y XP.',
  },
  {
    num: '02', icon: '✅',
    title: 'El hijo las completa',
    desc:  'Marca la tarea y espera la aprobación del padre. Si está bien hecha, aprobada.',
  },
  {
    num: '03', icon: '⭐',
    title: 'El Pokémon crece',
    desc:  'Cada aprobación suma XP al Pokémon activo. Sube de nivel, y puede evolucionar.',
  },
];

const FEATURES = [
  {
    emoji: '💰',
    title: 'Recompensas reales',
    desc:  'Las monedas se canjean en la tienda que crea el padre: tiempo de pantalla, salidas, caprichos. Nada virtual.',
  },
  {
    emoji: '⭐',
    title: 'XP que solo sube',
    desc:  'La experiencia nunca baja. Las penalizaciones afectan a monedas, no a la motivación a largo plazo.',
  },
  {
    emoji: '🔥',
    title: 'Evolución manual',
    desc:  'Cuando el Pokémon alcanza el nivel, el niño decide cuándo evolucionar. Un momento especial que se gana.',
  },
  {
    emoji: '🎯',
    title: 'Nuevas capturas',
    desc:  'Cada 5 000 XP se desbloquea un nuevo slot. La colección crece con el esfuerzo, no con el dinero.',
  },
];

const DEMO_ACCOUNTS = [
  { name: 'Padre', role: 'Admin', identifier: 'padre@demo.com', password: 'Demo1234', color: c.primary, border: c.primaryLight, emoji: '👨‍👩‍👧‍👦' },
  { name: 'Lucas', role: 'Niño',  identifier: 'lucas',          password: 'lucas123',  color: '#10b981', border: '#6ee7b7',      emoji: '🎮' },
  { name: 'Sofía', role: 'Niña',  identifier: 'sofia',          password: 'sofia123',  color: '#ec4899', border: '#f9a8d4',      emoji: '🌸' },
];

const DARK_CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
};

export default function LandingPage() {
  const login = useLogin();

  const handleDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    login.mutate({ identifier: acc.identifier, password: acc.password });
  };

  return (
    <div style={{ background: c.night, minHeight: '100vh', color: '#fff' }}>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: 60,
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          FamilyDex
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/login">
            <Button
              variant="ghost"
              style={{ padding: '0.42rem 1rem', fontSize: '0.82rem', borderRadius: 8, color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.18)' }}
            >
              Entrar
            </Button>
          </Link>
          <Link to="/register">
            <Button style={{ padding: '0.42rem 1rem', fontSize: '0.82rem', borderRadius: 8 }}>
              Crear cuenta
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(3rem,7vw,5.5rem) 1.5rem 4rem', maxWidth: 1100, margin: '0 auto' }}>
        <div className="landing-hero-grid">

          {/* Left — copy */}
          <div>
            <div
              className="hero-enter hero-delay-1"
              style={{
                display: 'inline-block',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: c.primaryMid,
                marginBottom: '1rem',
              }}
            >
              Gamificación familiar
            </div>

            <h1
              className="hero-enter hero-delay-2"
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.03em',
                marginBottom: '1.2rem',
              }}
            >
              Las tareas del hogar,{' '}
              <span style={{ color: c.primaryMid }}>como un videojuego</span>
            </h1>

            <p
              className="hero-enter hero-delay-3"
              style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
                color: 'rgba(255,255,255,0.52)',
                lineHeight: 1.7,
                marginBottom: '2rem',
                maxWidth: 460,
              }}
            >
              FamilyDex convierte las responsabilidades diarias en una aventura Pokémon.
              Los niños ganan XP, evolucionan Pokémon y canjean recompensas reales.
            </p>

            <div className="hero-enter hero-delay-4" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/login">
                <Button style={{ padding: '0.72rem 1.75rem', fontSize: '1rem', borderRadius: 10 }}>
                  Entrar
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="ghost"
                  style={{
                    padding: '0.72rem 1.75rem', fontSize: '1rem', borderRadius: 10,
                    color: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — sprites */}
          <div className="hero-sprites hero-enter hero-delay-3">
            {STARTERS.map((s) => (
              <div key={s.id} className={`sprite-card ${s.float}`}>
                <div className="sprite-glow" style={{ background: s.glow }} />
                <img src={SPRITE(s.id)} alt={s.name} className="sprite-img" />
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', position: 'relative', zIndex: 1 }}>
                  {s.name}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Cómo funciona ───────────────────────────────────── */}
      <section style={{
        background: 'rgba(255,255,255,0.025)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: 'clamp(2.5rem,5vw,4rem) 1.5rem',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
            fontWeight: 800, letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
          }}>
            Cómo funciona
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginBottom: '2.25rem', fontSize: '0.95rem' }}>
            Tres pasos que convierten el esfuerzo diario en progresión real.
          </p>

          <div className="steps-grid">
            {STEPS.map((step) => (
              <div key={step.num} style={{ ...DARK_CARD, padding: '1.75rem', textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: c.primaryMid, marginBottom: '0.75rem',
                }}>
                  {step.num}
                </div>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem', lineHeight: 1 }}>{step.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{step.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(2.5rem,5vw,4rem) 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
          fontWeight: 800, letterSpacing: '-0.02em',
          marginBottom: '0.5rem',
        }}>
          Todo lo que necesitas
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginBottom: '2.25rem', fontSize: '0.95rem' }}>
          Un sistema pensado para que funcione durante años, no semanas.
        </p>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card" style={{ ...DARK_CARD, padding: '1.5rem' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.75rem', lineHeight: 1 }}>{f.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>{f.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo ────────────────────────────────────────────── */}
      <section style={{
        background: 'rgba(255,255,255,0.025)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: 'clamp(2.5rem,5vw,4rem) 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
            fontWeight: 800, letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
          }}>
            Pruébalo ahora
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Sin registro. Un clic y entras directamente con datos de ejemplo ya cargados.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.identifier}
                className="demo-acct-btn"
                disabled={login.isPending}
                onClick={() => handleDemo(acc)}
                style={{
                  background: 'transparent',
                  border: `2px solid ${acc.border}`,
                  borderRadius: 14,
                  cursor: login.isPending ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                  padding: '1rem 1.25rem',
                  minWidth: 130,
                  opacity: login.isPending ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{acc.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: acc.color }}>{acc.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{acc.role}</span>
              </button>
            ))}
          </div>

          {login.isError && (
            <p style={{ color: c.danger, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Error al iniciar sesión. Inténtalo de nuevo.
            </p>
          )}

          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>
            O{' '}
            <Link to="/login" style={{ color: c.primaryMid }}>entra con tu cuenta</Link>
            {' · '}
            <Link to="/register" style={{ color: c.primaryMid }}>crea una cuenta nueva</Link>
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'rgba(255,255,255,0.2)',
      }}>
        FamilyDex · TFM Máster en Desarrollo con IA · 2026
      </footer>

    </div>
  );
}
