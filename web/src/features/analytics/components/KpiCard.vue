<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  label: string
  value: string | number
  hint?: string
  badge?: string
  variant?: 'default' | 'accent' | 'success' | 'warning'
  icon?: Component
}

withDefaults(defineProps<Props>(), {
  hint: undefined,
  badge: undefined,
  variant: 'default',
  icon: undefined,
})
</script>

<template>
  <article
    class="relative overflow-hidden rounded-2xl border p-5 shadow-soft transition-all duration-300 hover:shadow-md"
    :class="[
      variant === 'accent'
        ? 'border-accent/20 bg-gradient-to-br from-canvas-elevated via-canvas-elevated to-accent/5'
        : variant === 'success'
          ? 'border-emerald-500/20 bg-gradient-to-br from-canvas-elevated via-canvas-elevated to-emerald-500/5'
          : variant === 'warning'
            ? 'border-amber-500/20 bg-gradient-to-br from-canvas-elevated via-canvas-elevated to-amber-500/5'
            : 'border-border bg-canvas-elevated',
    ]"
  >
    <div class="flex items-start justify-between gap-3">
      <p class="text-xs font-semibold tracking-wider text-muted uppercase">{{ label }}</p>
      <div
        v-if="icon"
        class="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
        :class="[
          variant === 'accent'
            ? 'bg-accent/10 text-accent'
            : variant === 'success'
              ? 'bg-emerald-500/10 text-emerald-500'
              : variant === 'warning'
                ? 'bg-amber-500/10 text-amber-500'
                : 'bg-muted/10 text-ink-soft',
        ]"
      >
        <component :is="icon" class="h-4 w-4" />
      </div>
    </div>

    <div class="mt-3 flex items-baseline justify-between gap-2">
      <p class="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl font-mono tabular-nums">
        {{ value }}
      </p>

      <span
        v-if="badge"
        class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        :class="[
          variant === 'accent'
            ? 'bg-accent/10 text-accent'
            : variant === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : variant === 'warning'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-muted/15 text-muted',
        ]"
      >
        {{ badge }}
      </span>
    </div>

    <p v-if="hint" class="mt-2 text-xs text-muted">
      {{ hint }}
    </p>
  </article>
</template>
