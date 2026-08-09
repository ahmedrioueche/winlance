<script setup lang="ts">
import { Skeleton } from '@/shared/components/base'
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <Skeleton class="h-10 w-48 rounded-xl" />
      <Skeleton class="h-9 w-32 rounded-lg" />
    </div>
    <Skeleton class="h-10 w-full max-w-md rounded-xl" />
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      <Skeleton v-for="i in 6" :key="i" class="h-44 rounded-xl" />
    </div>
  </div>
</template>
