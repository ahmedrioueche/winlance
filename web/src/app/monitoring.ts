import type { App } from 'vue'

import { appConfig } from '@/config'
import { logger } from '@/shared/utils/logger'

/** Wire monitoring when a public DSN is configured. */
export async function initMonitoring(app: App) {
  app.config.errorHandler = (error, _instance, info) => {
    logger.error('Vue errorHandler', { error, info })
  }

  if (!appConfig.sentryDsn) {
    logger.debug('Sentry DSN not configured; monitoring stub active')
    return
  }

  try {
    const vitals = await import('web-vitals')
    const report = (metric: { name: string; value: number; id: string }) => {
      logger.debug('web-vital', {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        dsnConfigured: true,
      })
    }
    vitals.onCLS(report)
    vitals.onINP(report)
    vitals.onLCP(report)
    logger.debug('Web Vitals listeners attached')
  } catch (error) {
    logger.warn('Web Vitals unavailable', error)
  }

  // Full Sentry SDK wiring stays optional until @sentry/vue is added to the stack.
  logger.debug('Sentry DSN present; enable @sentry/vue in production when ready')
}
