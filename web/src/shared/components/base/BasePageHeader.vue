/**
 * Reusable page header component for workspace and portal pages.
 */
<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            {{ title }}
          </h1>
          <slot name="badge" />
        </div>

        <p v-if="subtitle" class="mt-1 text-sm text-muted">
          {{ subtitle }}
        </p>
        <slot v-else name="subtitle" />
      </div>

      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-3">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="$slots.meta">
      <slot name="meta" />
    </div>
  </div>
</template>

