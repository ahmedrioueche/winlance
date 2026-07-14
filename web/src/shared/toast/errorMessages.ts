import type { ApiError } from '@/shared/types/api'

/** Maps API / HTTP error codes to i18n keys under `common.errors.*`. */
export function errorCodeToI18nKey(code: string | undefined): string {
  switch (code) {
    case 'network_error':
    case 'http_0':
      return 'common.errors.network'
    case 'http_401':
    case 'unauthorized':
      return 'common.errors.unauthorized'
    case 'http_403':
    case 'forbidden':
      return 'common.errors.forbidden'
    case 'http_404':
    case 'not_found':
      return 'common.errors.notFound'
    case 'http_429':
      return 'common.errors.rateLimited'
    case 'http_500':
    case 'http_502':
    case 'http_503':
    case 'server_error':
      return 'common.errors.server'
    case 'validation_error':
    case 'http_400':
    case 'http_422':
      return 'common.errors.validation'
    default:
      return 'common.errors.generic'
  }
}

export function isApiErrorLike(value: unknown): value is Pick<ApiError, 'code'> {
  return typeof value === 'object' && value !== null && 'code' in value
}
