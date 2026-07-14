/**
 * Inline success confirmation (when a toast alone is not enough).
 * @slots action
 */
<script setup lang="ts">
interface Props {
  title: string
  message?: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="rounded-md border border-success/30 bg-success-soft p-4"
    role="status"
    aria-live="polite"
  >
    <p class="font-medium text-success">{{ title }}</p>
    <p v-if="message" class="mt-1 text-sm text-ink-soft">{{ message }}</p>
    <div v-if="$slots.action" class="mt-3">
      <slot name="action" />
    </div>
  </div>
</template>
