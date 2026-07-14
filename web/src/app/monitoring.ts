import type { App } from 'vue'

import { appConfig } from '@/config'
import { logger } from '@/shared/utils/logger'

/** Wire Sentry (or equivalent) when VITE_SENTRY_DSN is set. */
export function initMonitoring(app: App) {
  app.config.errorHandler = (error, _instance, info) => {
    logger.error('Vue errorHandler', { error, info })
  }

  if (!appConfig.sentryDsn) {
    logger.debug('Sentry DSN not configured; monitoring stub active')
  }
}
