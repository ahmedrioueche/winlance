import { describe, expect, it } from 'vitest'

import {
  errorCodeToI18nKey,
  getApiFieldErrors,
  resolveErrorToastMessage,
  shouldShowApiMessage,
} from '@/shared/toast/errorMessages'
import type { ApiError } from '@/shared/types/api'

function apiError(partial: Partial<ApiError> & Pick<ApiError, 'message' | 'status'>): ApiError {
  return {
    code: partial.code ?? `http_${partial.status}`,
    message: partial.message,
    status: partial.status,
    details: partial.details,
  }
}

describe('errorCodeToI18nKey', () => {
  it('maps known codes to generic i18n keys', () => {
    expect(errorCodeToI18nKey('network_error')).toBe('common.errors.network')
    expect(errorCodeToI18nKey('http_401')).toBe('common.errors.unauthorized')
    expect(errorCodeToI18nKey('http_500')).toBe('common.errors.server')
  })

  it('falls back to generic for unknown codes', () => {
    expect(errorCodeToI18nKey('weird_code')).toBe('common.errors.generic')
    expect(errorCodeToI18nKey(undefined)).toBe('common.errors.generic')
  })
})

describe('shouldShowApiMessage', () => {
  it('shows concrete validation messages', () => {
    expect(
      shouldShowApiMessage(
        apiError({
          status: 400,
          message: 'A user with that username already exists.',
        }),
      ),
    ).toBe(true)
  })

  it('keeps auth failures on i18n fallbacks', () => {
    expect(
      shouldShowApiMessage(
        apiError({
          status: 401,
          message: 'Invalid credentials.',
        }),
      ),
    ).toBe(false)
  })
})

describe('getApiFieldErrors', () => {
  it('flattens DRF field error lists', () => {
    expect(
      getApiFieldErrors(
        apiError({
          status: 400,
          message: 'A user with that username already exists.',
          details: {
            username: ['A user with that username already exists.'],
            email: ['Enter a valid email address.'],
          },
        }),
      ),
    ).toEqual({
      username: 'A user with that username already exists.',
      email: 'Enter a valid email address.',
    })
  })
})

describe('resolveErrorToastMessage', () => {
  it('prefers API validation message over generic key', () => {
    const message = resolveErrorToastMessage(
      apiError({
        status: 400,
        message: 'A user with that username already exists.',
        details: { username: ['A user with that username already exists.'] },
      }),
      (key) => key,
    )
    expect(message).toBe('A user with that username already exists.')
  })

  it('falls back to i18n for network errors', () => {
    const message = resolveErrorToastMessage(
      apiError({
        code: 'network_error',
        status: 0,
        message: 'Network Error',
      }),
      (key) => key,
    )
    expect(message).toBe('common.errors.network')
  })
})
