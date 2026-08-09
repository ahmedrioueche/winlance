<script setup lang="ts">
import { Skeleton } from '@/shared/components/base'
</script>

<template>
  <div class="space-y-6">
    <!-- Header Skeleton -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-2">
        <Skeleton class="h-8 w-48 rounded-lg" />
        <Skeleton class="h-4 w-64 rounded-md" />
      </div>
      <Skeleton class="h-9 w-32 rounded-lg" />
    </div>

    <!-- Filter Bar Skeleton -->
    <div class="rounded-2xl border border-border bg-canvas-elevated p-4 shadow-soft">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <Skeleton class="h-9 rounded-md lg:col-span-6" />
        <Skeleton class="h-9 rounded-md lg:col-span-2" />
        <Skeleton class="h-9 rounded-md lg:col-span-2" />
        <Skeleton class="h-9 rounded-md lg:col-span-2" />
      </div>
    </div>

    <!-- Grid Skeleton -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      <Skeleton v-for="i in 6" :key="i" class="h-48 rounded-xl" />
    </div>
  </div>
</template>
