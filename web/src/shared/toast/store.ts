import { ref } from 'vue'

export type ToastKind = 'error' | 'success' | 'info'

export type ToastItem = {
  id: string
  kind: ToastKind
  message: string
}

const DEFAULT_TTL_MS = 5_000

export const toasts = ref<ToastItem[]>([])

export function pushToast(kind: ToastKind, message: string, ttlMs = DEFAULT_TTL_MS) {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`
  toasts.value = [...toasts.value, { id, kind, message }]
  window.setTimeout(() => dismissToast(id), ttlMs)
  return id
}

export function dismissToast(id: string) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

export function clearToasts() {
  toasts.value = []
}
