export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'winlance.theme'

/** Semantic token names exposed to Tailwind as utilities (bg-*, text-*, border-*). */
export const themeColorTokens = [
  'canvas',
  'canvas-elevated',
  'canvas-muted',
  'ink',
  'ink-soft',
  'muted',
  'border',
  'border-strong',
  'accent',
  'accent-foreground',
  'accent-soft',
  'success',
  'success-soft',
  'warning',
  'warning-soft',
  'error',
  'error-soft',
  'info',
  'info-soft',
  'ring',
  'overlay',
  'glow',
  'glow-secondary',
] as const

export type ThemeColorToken = (typeof themeColorTokens)[number]
