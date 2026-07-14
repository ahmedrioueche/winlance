/**
 * Loading placeholder for data views.
 */
<script setup lang="ts">
interface Props {
  label?: string
  rows?: number
}

withDefaults(defineProps<Props>(), {
  rows: 3,
})
</script>

<template>
  <div class="space-y-3" role="status" aria-live="polite">
    <p v-if="label" class="text-sm text-muted">{{ label }}</p>
    <div
      v-for="n in rows"
      :key="n"
      class="h-10 animate-pulse rounded-md bg-canvas-muted"
      aria-hidden="true"
    />
  </div>
</template>
