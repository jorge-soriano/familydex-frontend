/**
 * Tokens de color — mismos valores que tailwind.config.js.
 * Usar en inline styles de componentes complejos.
 * Para nuevos componentes, usar clases Tailwind directamente.
 */
export const c = {
  primary:       '#1e40af',
  primaryDark:   '#1e3a8a',
  primaryMid:    '#60a5fa',
  primarySubtle: '#dbeafe',
  primaryLight:  '#93c5fd',

  success:       '#059669',
  successDark:   '#047857',
  successSubtle: '#d1fae5',

  danger:        '#dc2626',
  dangerDark:    '#b91c1c',
  dangerSubtle:  '#fee2e2',

  warning:       '#d97706',
  warningMid:    '#b45309',
  warningDark:   '#92400e',
  warningDeep:   '#78350f',
  warningSubtle: '#fef3c7',
  warningPale:   '#fef9c3',

  accent:        '#7c3aed',
  accentSubtle:  '#ede9fe',

  page:          '#f0f4f8',
  surface:       '#ffffff',
  subtle:        '#eef2f7',
  stroke:        '#d1dce8',

  heading:       '#0f172a',
  body:          '#475569',
  caption:       '#64748b',
  captionLight:  '#94a3b8',

  navy:          '#0f172a',
  navyDark:      '#080f1e',
  night:         '#0f172a',

  // Overlays (fondos de modales)
  overlay:       'rgba(15,23,42,0.55)',
  overlayDark:   'rgba(15,23,42,0.78)',

  // Sombras estandarizadas
  shadowSm:      '0 2px 8px rgba(30,64,175,0.08), 0 0 0 1px rgba(30,64,175,0.07)',
  shadowMd:      '0 4px 14px rgba(30,64,175,0.10), 0 0 0 1px rgba(30,64,175,0.08)',
  shadowCard:    '0 6px 22px rgba(30,64,175,0.12), 0 2px 6px rgba(30,64,175,0.07), 0 0 0 1px rgba(30,64,175,0.09)',
  shadowFloat:   '0 14px 36px rgba(30,64,175,0.18), 0 0 0 1px rgba(30,64,175,0.10)',
  shadowLg:      '0 8px 32px rgba(30,64,175,0.25)',
} as const;
