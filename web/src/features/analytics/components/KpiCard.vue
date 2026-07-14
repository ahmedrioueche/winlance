<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  hint?: string
}

defineProps<Props>()
</script>

<template>
  <article class="rounded-xl border border-border bg-canvas-elevated p-4 shadow-soft">
    <p class="text-xs font-medium tracking-wide text-muted uppercase">{{ label }}</p>
    <p class="mt-2 font-display text-2xl text-ink">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-ink-soft">{{ hint }}</p>
  </article>
</template>
