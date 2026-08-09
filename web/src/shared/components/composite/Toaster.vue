<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { dismissToast, toasts, type ToastKind } from '@/shared/toast/store'

const { t } = useI18n()

function kindClasses(kind: ToastKind) {
  switch (kind) {
    case 'success':
      return 'border-success/30 bg-success-soft text-ink'
    case 'info':
      return 'border-info/30 bg-info-soft text-ink'
    case 'error':
    default:
      return 'border-error/30 bg-error-soft text-ink'
  }
}

function kindLabel(kind: ToastKind) {
  return t(`common.toast.${kind}`)
}
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-end gap-2 p-page"
    aria-live="polite"
    aria-relevant="additions"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto w-full max-w-sm rounded-md border px-4 py-3 shadow-lift"
      :class="kindClasses(toast.kind)"
      role="status"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold tracking-wide text-muted uppercase">
            {{ kindLabel(toast.kind) }}
          </p>
          <p class="mt-1 text-sm">{{ toast.message }}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            v-if="toast.action"
            type="button"
            class="rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground hover:opacity-90 transition-opacity"
            @click="toast.action.onClick(); dismissToast(toast.id)"
          >
            {{ toast.action.label }}
          </button>
          <button
            type="button"
            class="rounded-md px-1.5 py-0.5 text-sm text-muted hover:bg-canvas-elevated hover:text-ink transition-colors"
            :aria-label="t('common.toast.dismiss')"
            @click="dismissToast(toast.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
