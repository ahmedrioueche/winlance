<script setup lang="ts">
import { Skeleton } from '@/shared/components/base'

withDefaults(
  defineProps<{
    isPortal?: boolean
  }>(),
  {
    isPortal: false,
  }
)
</script>

<template>
  <div class="space-y-6" aria-busy="true" aria-label="Loading tasks">
    <!-- 1. Header Card Skeleton -->
    <div class="rounded-2xl border border-border bg-canvas-elevated p-6 shadow-soft space-y-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <!-- Title & Subtitle Badge -->
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <Skeleton class="h-7 w-56 rounded-lg" />
            <Skeleton class="h-5 w-20 rounded-full" />
          </div>
          <!-- Subtitle Metrics Pill Bar -->
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <Skeleton class="h-4 w-24 rounded-md" />
            <span class="text-border">|</span>
            <Skeleton class="h-4 w-28 rounded-md" />
            <span class="text-border">|</span>
            <Skeleton class="h-4 w-24 rounded-md" />
            <span class="text-border">|</span>
            <Skeleton class="h-4 w-24 rounded-md" />
          </div>
        </div>

        <!-- Header Actions (View mode switcher & buttons) -->
        <div class="flex items-center gap-3">
          <Skeleton class="h-9 w-36 rounded-xl" />
          <Skeleton v-if="!isPortal" class="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>

    <!-- 2. Filter Bar Skeleton -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <!-- Search Input Skeleton -->
      <Skeleton class="h-9 w-full max-w-sm rounded-xl" />

      <!-- Filter Select Skeletons -->
      <div class="flex shrink-0 items-center gap-2">
        <Skeleton class="h-9 w-32 rounded-xl" />
        <Skeleton class="h-9 w-32 rounded-xl" />
        <Skeleton v-if="!isPortal" class="h-9 w-36 rounded-xl" />
      </div>
    </div>

    <!-- 3. Content View Skeleton (Structured Table Row Skeletons) -->
    <div class="overflow-hidden rounded-2xl border border-border bg-canvas-elevated shadow-soft">
      <!-- Table Header Bar -->
      <div class="flex items-center justify-between border-b border-border bg-canvas-muted/50 px-6 py-3.5">
        <Skeleton class="h-4 w-40 rounded-md" />
        <Skeleton class="h-4 w-20 rounded-md" />
        <Skeleton class="h-4 w-20 rounded-md" />
        <Skeleton class="h-4 w-24 rounded-md" />
        <Skeleton class="h-4 w-16 rounded-md" />
      </div>

      <!-- Table Row Skeletons -->
      <div class="divide-y divide-border/60 p-2 space-y-1">
        <div v-for="i in 5" :key="i" class="flex items-center justify-between p-4 rounded-xl">
          <div class="flex items-center gap-3 flex-1">
            <Skeleton class="h-4 w-4 rounded-md shrink-0" />
            <div class="space-y-1.5 flex-1">
              <div class="flex items-center gap-2">
                <Skeleton class="h-4 w-48 sm:w-64 rounded-md" />
                <Skeleton class="h-4 w-24 rounded-md" />
              </div>
              <Skeleton class="h-3 w-72 rounded-md" />
            </div>
          </div>
          <div class="flex items-center gap-6 shrink-0">
            <Skeleton class="h-5 w-20 rounded-full" />
            <Skeleton class="h-5 w-16 rounded-full" />
            <Skeleton class="h-4 w-20 rounded-md hidden sm:block" />
            <Skeleton class="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
