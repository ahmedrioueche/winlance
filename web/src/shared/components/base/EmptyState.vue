/**
 * Empty list / no-data placeholder.
 * @slots action — optional CTA
 */
<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-canvas-elevated px-6 py-12 text-center shadow-soft"
    role="status"
  >
    <h3 class="font-display text-xl text-ink">
      {{ title }}
    </h3>
    <p v-if="description" class="max-w-md text-sm text-muted">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-2">
      <slot name="action" />
    </div>
  </div>
</template>
