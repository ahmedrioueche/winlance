/**
 * Reusable page header component for main workspace pages (without card wrapper background).
 */
<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-1 text-sm text-muted">
        {{ subtitle }}
      </p>
    </div>

    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
