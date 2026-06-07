/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semánticos / interactivos
        primary: { DEFAULT: '#3b82f6', dark: '#1d4ed8', subtle: '#eff6ff' },
        success: { DEFAULT: '#22c55e', dark: '#16a34a', subtle: '#f0fdf4' },
        danger:  { DEFAULT: '#ef4444', dark: '#dc2626', subtle: '#fef2f2' },
        warning: { DEFAULT: '#f59e0b', dark: '#92400e', subtle: '#fef3c7' },
        accent:  { DEFAULT: '#8b5cf6', subtle: '#f5f3ff' }, // XP, recompensas

        // Superficies
        page:    '#e2eaf3',  // fondo de página
        surface: '#ffffff',  // tarjetas, modales
        subtle:  '#f1f5f9',  // fondos secundarios, botones inactivos
        stroke:  '#e2e8f0',  // bordes

        // Tipografía
        heading: '#1e293b',  // títulos
        body:    '#64748b',  // texto secundario
        caption: '#94a3b8',  // placeholders, hints

        // Fondos de navegación oscuros
        navy:  { DEFAULT: '#1e3a5f', dark: '#162d4a' }, // nav admin
        night: '#1a1a2e',  // nav child + BalanceBar
      },
    },
  },
  plugins: [],
};
