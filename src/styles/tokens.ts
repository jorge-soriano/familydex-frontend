/**
 * Tokens de color — mismos valores que tailwind.config.js.
 * Usar en inline styles de componentes complejos.
 * Para nuevos componentes, usar clases Tailwind directamente.
 */
export const c = {
  primary:       '#3b82f6',
  primaryDark:   '#1d4ed8',
  primarySubtle: '#eff6ff',
  primaryLight:  '#bfdbfe',

  success:       '#22c55e',
  successDark:   '#16a34a',
  successSubtle: '#f0fdf4',

  danger:        '#ef4444',
  dangerDark:    '#dc2626',
  dangerSubtle:  '#fef2f2',

  warning:       '#f59e0b',
  warningMid:    '#d97706',
  warningDark:   '#92400e',
  warningDeep:   '#78350f',
  warningSubtle: '#fef3c7',
  warningPale:   '#fef9c3',

  accent:        '#8b5cf6',
  accentSubtle:  '#f5f3ff',

  page:          '#f8fafc',
  surface:       '#ffffff',
  subtle:        '#f1f5f9',
  stroke:        '#e2e8f0',

  heading:       '#1e293b',
  body:          '#64748b',
  caption:       '#94a3b8',
  captionLight:  '#cbd5e1',

  navy:          '#1e3a5f',
  navyDark:      '#162d4a',
  night:         '#1a1a2e',

  // Overlays (fondos de modales)
  overlay:       'rgba(0,0,0,0.5)',
  overlayDark:   'rgba(0,0,0,0.65)',

  // Sombras estandarizadas
  shadowSm:      '0 1px 4px rgba(0,0,0,0.06)',
  shadowMd:      '0 2px 8px rgba(0,0,0,0.07)',
  shadowLg:      '0 8px 32px rgba(0,0,0,0.28)',
} as const;
