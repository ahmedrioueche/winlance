<script setup lang="ts">
interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 6,
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse rounded-xl border border-border bg-canvas-elevated p-5 space-y-4"
    >
      <div class="flex items-start justify-between">
        <div class="space-y-2 w-2/3">
          <div class="h-5 w-3/4 rounded bg-canvas-muted" />
          <div class="h-3 w-1/2 rounded bg-canvas-muted" />
        </div>
        <div class="h-5 w-16 rounded-full bg-canvas-muted" />
      </div>

      <div class="space-y-2 pt-2">
        <div class="h-3 w-4/5 rounded bg-canvas-muted" />
        <div class="h-3 w-3/5 rounded bg-canvas-muted" />
      </div>

      <div class="flex gap-2 pt-2 border-t border-border/60">
        <div class="h-4 w-1/3 rounded bg-canvas-muted" />
      </div>
    </div>
  </div>
</template>
