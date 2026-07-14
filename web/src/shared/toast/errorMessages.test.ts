import { describe, expect, it } from 'vitest'

import { errorCodeToI18nKey } from '@/shared/toast/errorMessages'

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
