import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { nextTick, ref } from 'vue'

import { useStatusPolling } from './useStatusPolling'

describe('useStatusPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('polls while status is GENERATING and stops afterwards', async () => {
    const status = ref<string | null>('GENERATING')
    const refetch = vi.fn()
    useStatusPolling(status, refetch, { intervalMs: 1000 })

    await nextTick()
    expect(refetch).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1000)
    expect(refetch).toHaveBeenCalledTimes(1)

    status.value = 'READY'
    await nextTick()
    await vi.advanceTimersByTimeAsync(3000)
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
