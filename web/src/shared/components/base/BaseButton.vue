/**
 * Primary action button.
 * @slots default — button label
 */
<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})
</script>

<template>
  <button
    :type="type"
    class="inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
    :class="[
      variant === 'primary' &&
        'bg-accent text-accent-foreground shadow-soft hover:brightness-95 active:brightness-90',
      variant === 'secondary' &&
        'border border-border bg-canvas-elevated text-ink hover:border-border-strong hover:bg-canvas-muted',
      variant === 'ghost' && 'text-ink-soft hover:bg-canvas-elevated hover:text-ink',
      size === 'sm' && 'px-3 py-1.5 text-sm',
      size === 'md' && 'px-4 py-2 text-sm',
      size === 'lg' && 'px-5 py-3 text-base',
    ]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <span
      v-if="loading"
      class="size-4 animate-pulse rounded-full bg-current opacity-70"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
