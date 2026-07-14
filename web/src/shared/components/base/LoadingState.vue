/**
 * Full-width loading placeholder for page content areas.
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
  <div class="w-full space-y-5" role="status" aria-live="polite">
    <p v-if="label" class="text-sm text-muted">{{ label }}</p>
    <div class="w-full space-y-3" aria-hidden="true">
      <div class="h-9 w-2/5 max-w-sm animate-pulse rounded-md bg-canvas-muted" />
      <div class="h-4 w-1/3 max-w-xs animate-pulse rounded-md bg-canvas-muted" />
    </div>
    <div class="w-full space-y-3" aria-hidden="true">
      <div
        v-for="n in rows"
        :key="n"
        class="h-20 w-full animate-pulse rounded-lg bg-canvas-muted"
      />
    </div>
  </div>
</template>
