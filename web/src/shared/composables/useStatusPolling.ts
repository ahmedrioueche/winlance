import { onUnmounted, watch, type Ref } from 'vue'

const DEFAULT_ACTIVE = new Set(['GENERATING'])

/**
 * Refetch server state while an async backend task is in flight.
 */
export function useStatusPolling(
  status: Ref<string | undefined | null>,
  refetch: () => unknown,
  options?: {
    activeStatuses?: string[]
    intervalMs?: number
  },
) {
  const active = new Set(options?.activeStatuses ?? [...DEFAULT_ACTIVE])
  const intervalMs = options?.intervalMs ?? 2000
  let timer: ReturnType<typeof setInterval> | null = null

  function stop() {
    if (timer != null) {
      clearInterval(timer)
      timer = null
    }
  }

  function start() {
    if (timer != null) return
    timer = setInterval(() => {
      void refetch()
    }, intervalMs)
  }

  watch(
    status,
    (value) => {
      if (value && active.has(value)) start()
      else stop()
    },
    { immediate: true },
  )

  onUnmounted(stop)

  return { stop }
}
