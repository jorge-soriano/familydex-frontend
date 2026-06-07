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
        primary: { DEFAULT: '#1e40af', dark: '#1e3a8a', subtle: '#dbeafe', light: '#93c5fd' },
        success: { DEFAULT: '#059669', dark: '#047857', subtle: '#d1fae5' },
        danger:  { DEFAULT: '#dc2626', dark: '#b91c1c', subtle: '#fee2e2' },
        warning: { DEFAULT: '#d97706', mid: '#b45309', dark: '#92400e', deep: '#78350f', subtle: '#fef3c7', pale: '#fef9c3' },
        accent:  { DEFAULT: '#7c3aed', subtle: '#ede9fe' },

        // Superficies
        page:    '#f0f4f8',
        surface: '#ffffff',
        subtle:  '#eef2f7',
        stroke:  '#d1dce8',

        // Tipografía
        heading:      '#0f172a',
        body:         '#475569',
        caption:      '#64748b',
        captionLight: '#94a3b8',

        // Fondos de navegación oscuros
        navy:  { DEFAULT: '#0f172a', dark: '#080f1e' },
        night: '#0f172a',
      },
    },
  },
  plugins: [],
};
