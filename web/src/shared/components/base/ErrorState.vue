/**
 * Inline error surface with optional retry.
 * @emits retry
 */
<script setup lang="ts">
interface Props {
  title: string
  message?: string
  retryLabel?: string
}

defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="rounded-md border border-error/30 bg-error-soft p-4" role="alert">
    <p class="font-medium text-error">{{ title }}</p>
    <p v-if="message" class="mt-1 text-sm text-ink-soft">{{ message }}</p>
    <button
      v-if="retryLabel"
      type="button"
      class="mt-3 text-sm font-medium text-ink underline-offset-2 hover:underline"
      @click="emit('retry')"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>
