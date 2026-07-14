import { describe, expect, it } from 'vitest'

import { maxStageCount, stageWidths } from './types'

describe('analytics funnel helpers', () => {
  it('computes relative bar widths from stage counts', () => {
    const stages = [
      { status: 'NEW', label: 'New', count: 10 },
      { status: 'WON', label: 'Won', count: 5 },
      { status: 'LOST', label: 'Lost', count: 0 },
    ]
    expect(maxStageCount(stages)).toBe(10)
    expect(stageWidths(stages).map((row) => row.pct)).toEqual([100, 50, 0])
  })
})
