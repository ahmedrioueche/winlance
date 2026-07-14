/**
 * Content-shaped skeleton placeholder.
 */
<script setup lang="ts">
interface Props {
  class?: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="animate-pulse rounded-md bg-canvas-muted"
    :class="$props.class"
    aria-hidden="true"
  />
</template>
