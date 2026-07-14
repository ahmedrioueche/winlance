import { describe, expect, it } from 'vitest'

import { isFeatureEnabled } from '@/config/flags'

describe('feature flags', () => {
  it('reads demo auth flag as boolean', () => {
    expect(typeof isFeatureEnabled('enableDemoAuth')).toBe('boolean')
  })
})
