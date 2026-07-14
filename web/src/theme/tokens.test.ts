import { describe, expect, it } from 'vitest'

import { themeColorTokens } from '@/theme/tokens'

describe('theme tokens', () => {
  it('exports the semantic color set used by Tailwind', () => {
    expect(themeColorTokens).toContain('canvas')
    expect(themeColorTokens).toContain('accent')
    expect(themeColorTokens).toContain('error')
  })
})
