import type { ApiError } from '@/shared/types/api'
import { isApiError } from '@/shared/types/api'

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

/** Prefer the API's human message for client/validation errors. */
export function shouldShowApiMessage(error: ApiError): boolean {
  if (!error.message || error.message === 'request_failed') return false
  if (error.code === 'network_error' || error.status === 0) return false
  // Prefer i18n for auth/session failures; show concrete validation/conflict text otherwise.
  if (error.status === 401 || error.status === 403) return false
  return error.status >= 400 && error.status < 500
}

/**
 * Flatten DRF-style field errors: `{ username: ["..."] }` → `{ username: "..." }`.
 */
export function getApiFieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error) || error.details == null || typeof error.details !== 'object') {
    return {}
  }

  const source = error.details as Record<string, unknown>
  const out: Record<string, string> = {}

  for (const [key, value] of Object.entries(source)) {
    if (key === 'detail' || key === 'non_field_errors') continue
    const text = firstErrorText(value)
    if (text) out[key] = text
  }

  return out
}

export function resolveErrorToastMessage(
  error: unknown,
  translate: (key: string) => string,
): string {
  if (isApiError(error) && shouldShowApiMessage(error)) {
    return error.message
  }
  const code = isApiErrorLike(error) ? error.code : undefined
  return translate(errorCodeToI18nKey(code))
}

function firstErrorText(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value
  if (Array.isArray(value) && value.length) {
    const first = value[0]
    if (typeof first === 'string' && first.trim()) return first
    if (first != null) return String(first)
  }
  return null
}
