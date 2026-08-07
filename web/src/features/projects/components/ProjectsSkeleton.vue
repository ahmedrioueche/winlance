<script setup lang="ts">
import Skeleton from '@/shared/components/base/Skeleton.vue'

interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 6,
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="i in count"
      :key="i"
      class="flex flex-col justify-between rounded-xl border border-border bg-canvas-elevated p-5 shadow-soft"
    >
      <div>
        <div class="flex items-start justify-between gap-3">
          <Skeleton class="h-6 w-3/4 rounded" />
          <Skeleton class="h-5 w-16 rounded-full" />
        </div>
        <div class="mt-3 flex items-center gap-2">
          <Skeleton class="h-4 w-24 rounded" />
          <Skeleton class="h-4 w-32 rounded" />
        </div>
        <Skeleton class="mt-4 h-10 w-full rounded" />
      </div>

      <div class="mt-6 flex items-center justify-between border-t border-border/60 pt-3">
        <Skeleton class="h-4 w-28 rounded" />
        <Skeleton class="h-4 w-16 rounded" />
      </div>
    </div>
  </div>
</template>
