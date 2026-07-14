export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'Winlance',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE || 'en',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
} as const

export type AppConfig = typeof appConfig
