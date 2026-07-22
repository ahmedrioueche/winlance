/**
 * Primary action button.
 * @slots default — button label
 */
<script setup lang="ts">
import { computed, unref, type MaybeRef } from 'vue'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: Variant
  size?: Size
  disabled?: MaybeRef<boolean>
  loading?: MaybeRef<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})

const isLoading = computed(() => Boolean(unref(props.loading)))
const isDisabled = computed(() => Boolean(unref(props.disabled)) || isLoading.value)
</script>

<template>
  <button
    :type="type"
    class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
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
    :disabled="isDisabled"
    :aria-busy="isLoading || undefined"
  >
    <span
      v-if="isLoading"
      class="size-4 animate-pulse rounded-full bg-current opacity-70"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
